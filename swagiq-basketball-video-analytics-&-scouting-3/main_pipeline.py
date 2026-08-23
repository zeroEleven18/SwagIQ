"""
SwagIQ - Main Pipeline
Orchestrates the complete basketball analytics workflow
Integrates: Video Loading -> Detection -> Tracking -> OCR -> Shot Detection -> Statistics
"""

import cv2
import numpy as np
from typing import List, Dict, Optional, Tuple
from pathlib import Path
from dataclasses import dataclass
import logging
from datetime import datetime, timedelta
import json
import sys

# Import SwagIQ modules
from core.video_processor import VideoLoader, RoboflowDetector, SAMTracker, CourtMapper, DetectionSource
from core.jersey_ocr import JerseyNumberOCR, TeamClassifier, PlayerIdentifier
from core.shot_detector import ShotDetector
from core.statistics_extractor import StatisticsExtractor, ShotEvent, ShotType, ShotResult
from core.ball_detector_trainer import BallDetectorTrainer
from export.report_generator import PDFReportGenerator, DataExporter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class PipelineConfig:
    """Configurazione della pipeline"""
    roboflow_api_key: str
    roboflow_project: str
    roboflow_version: int
    confidence_threshold: float = 0.5
    min_track_confidence: float = 0.3
    video_source: str = ""
    source_type: DetectionSource = DetectionSource.LOCAL_FILE
    output_dir: Path = Path("output")
    enable_pdf_export: bool = True
    enable_json_export: bool = True
    debug_mode: bool = False


class FrameProcessor:
    """Processa singoli frame del video"""
    
    def __init__(self, config: PipelineConfig):
        self.config = config
        self.roboflow_detector = RoboflowDetector(
            api_key=config.roboflow_api_key,
            project_name=config.roboflow_project,
            version=config.roboflow_version
        )
        self.sam_tracker = SAMTracker(model_type="sam2_hiera_small")
        self.court_mapper = CourtMapper()
        
        self.jersey_ocr = JerseyNumberOCR(use_paddle_ocr=True)
        self.team_classifier = TeamClassifier()
        self.player_identifier = PlayerIdentifier(self.jersey_ocr, self.team_classifier)
        
        self.shot_detector = ShotDetector(self.court_mapper)
        
        # Tracking
        self.active_tracks: Dict[int, Dict] = {}
        self.next_track_id = 1
    
    def process_frame(self, frame: np.ndarray, frame_number: int, fps: float) -> Dict:
        """
        Processa un singolo frame
        
        Args:
            frame: Frame video (BGR)
            frame_number: Numero del frame
            fps: Frame per secondo
            
        Returns:
            Dizionario con risultati del frame
        """
        results = {
            "frame_number": frame_number,
            "timestamp": frame_number / fps,
            "detections": [],
            "tracks": [],
            "shots": [],
            "errors": []
        }
        
        try:
            # Step 1: Roboflow Detection
            detections = self.roboflow_detector.detect(frame, self.config.confidence_threshold)
            results["detections"] = [
                {
                    "class": d.class_name,
                    "confidence": d.confidence,
                    "bbox": d.bbox
                }
                for d in detections
            ]
            
            # Step 2: Tracking (SAM 3)
            player_detections = [d for d in detections if d.class_name == "player"]
            
            for detection in player_detections:
                # Assegna o aggiorna traccia
                track_id = self._assign_track(detection)
                
                if track_id not in self.active_tracks:
                    self.active_tracks[track_id] = {
                        "track_id": track_id,
                        "jersey_number": None,
                        "team": None,
                        "positions": [],
                        "first_seen": frame_number,
                        "last_seen": frame_number
                    }
                
                track = self.active_tracks[track_id]
                track["last_seen"] = frame_number
                track["positions"].append(detection.center_point())
                
                # Step 3: Jersey OCR
                if frame_number % 10 == 0:  # Ogni 10 frame per efficienza
                    identification = self.player_identifier.identify_player(
                        frame, track_id, detection.bbox
                    )
                    
                    track["jersey_number"] = identification.get("jersey_number")
                    track["team"] = identification.get("team")
                
                # Step 4: Shot Detection
                ball_detections = [d for d in detections if d.class_name == "ball"]
                shot = self.shot_detector.detect_shot(
                    frame, track_id, 
                    [{"bbox": d.bbox, "confidence": d.confidence} for d in ball_detections],
                    fps, frame_number
                )
                
                if shot:
                    results["shots"].append({
                        "player_id": track_id,
                        "jersey_number": track.get("jersey_number"),
                        "team": track.get("team"),
                        "shot_type": shot.shot_type,
                        "result": shot.shot_result,
                        "distance": shot.distance_from_basket,
                        "confidence": shot.confidence,
                        "frame": frame_number
                    })
                
                results["tracks"].append({
                    "track_id": track_id,
                    "jersey_number": track.get("jersey_number"),
                    "team": track.get("team"),
                    "bbox": detection.bbox,
                    "confidence": detection.confidence
                })
        
        except Exception as e:
            logger.error(f"Error processing frame {frame_number}: {str(e)}")
            results["errors"].append(str(e))
        
        return results
    
    def _assign_track(self, detection) -> int:
        """Assegna un detection a una traccia esistente"""
        if not self.active_tracks:
            track_id = self.next_track_id
            self.next_track_id += 1
            return track_id
        
        min_distance = float('inf')
        best_track_id = self.next_track_id
        
        det_center = detection.center_point()
        
        for track_id, track in self.active_tracks.items():
            if track["positions"]:
                last_pos = track["positions"][-1]
                dist = np.sqrt((last_pos[0] - det_center[0])**2 + 
                             (last_pos[1] - det_center[1])**2)
                
                if dist < min_distance and dist < 100:  # Max distance threshold
                    min_distance = dist
                    best_track_id = track_id
        
        if best_track_id == self.next_track_id:
            self.next_track_id += 1
        
        return best_track_id


class BasketballAnalyticsPipeline:
    """Pipeline principale per l'analisi video di basket"""
    
    def __init__(self, config: PipelineConfig):
        """
        Inizializza la pipeline
        
        Args:
            config: Configurazione della pipeline
        """
        self.config = config
        self.config.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.frame_processor = FrameProcessor(config)
        self.statistics_extractor = StatisticsExtractor()
        
        self.pdf_generator = PDFReportGenerator(self.config.output_dir / "reports")
        self.data_exporter = DataExporter(self.config.output_dir / "exports")
        
        self.processing_log = []
        logger.info(f"Pipeline initialized with config: {config}")
    
    def setup_game(self, home_team: str, away_team: str, home_players: List[Dict], 
                   away_players: List[Dict]):
        """
        Configura la partita con le informazioni dei giocatori
        
        Args:
            home_team: Nome squadra casa
            away_team: Nome squadra trasferta
            home_players: Lista di {player_id, name, jersey_number}
            away_players: Lista di {player_id, name, jersey_number}
        """
        self.statistics_extractor.initialize_game(home_team, away_team)
        
        for player in home_players:
            self.statistics_extractor.add_player_to_team(
                home_team,
                player["player_id"],
                player["name"],
                player["jersey_number"]
            )
        
        for player in away_players:
            self.statistics_extractor.add_player_to_team(
                away_team,
                player["player_id"],
                player["name"],
                player["jersey_number"]
            )
        
        logger.info(f"Game setup: {home_team} vs {away_team}")
    
    def process_video(self, callback=None) -> Dict:
        """
        Processa un intero video
        
        Args:
            callback: Funzione callback per aggiornamenti progress
            
        Returns:
            Statistiche finali della partita
        """
        logger.info(f"Starting video processing: {self.config.video_source}")
        
        # Carica il video
        cap = VideoLoader.load_video(self.config.video_source, self.config.source_type)
        video_props = VideoLoader.get_video_properties(cap)
        
        logger.info(f"Video properties: {video_props}")
        
        total_frames = video_props['total_frames']
        fps = video_props['fps']
        
        frame_count = 0
        
        # Processa frame per frame
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            
            # Processa il frame
            frame_results = self.frame_processor.process_frame(frame, frame_count, fps)
            
            # Aggiungi i tiri alle statistiche
            for shot in frame_results["shots"]:
                self._add_shot_to_statistics(shot)
            
            # Callback per progress
            if callback:
                progress = (frame_count / total_frames) * 100
                callback({
                    "progress": progress,
                    "frame": frame_count,
                    "total": total_frames,
                    "shots": len(frame_results["shots"])
                })
            
            # Log periodico
            if frame_count % 100 == 0:
                logger.info(f"Processed {frame_count}/{total_frames} frames ({frame_count/total_frames*100:.1f}%)")
        
        cap.release()
        
        logger.info(f"Video processing completed. Processed {frame_count} frames")
        
        # Genera statistiche finali
        final_stats = self.statistics_extractor.export_statistics(
            str(self.config.output_dir / "exports" / "game_stats.json")
        )
        
        return {
            "total_frames": frame_count,
            "fps": fps,
            "duration_seconds": frame_count / fps,
            "summary": self.statistics_extractor.generate_summary()
        }
    
    def _add_shot_to_statistics(self, shot: Dict):
        """Aggiunge un tiro alle statistiche"""
        try:
            # Mappa il risultato
            result_map = {
                "MADE": ShotResult.MADE,
                "MISSED": ShotResult.MISSED,
                "BLOCKED": ShotResult.BLOCKED
            }
            result = result_map.get(shot["result"], ShotResult.MISSED)
            
            # Mappa il tipo di tiro
            type_map = {
                "2PT": ShotType.TWO_POINTER,
                "3PT": ShotType.THREE_POINTER,
                "LAYUP": ShotType.LAYUP,
                "DUNK": ShotType.DUNK,
                "FT": ShotType.FREE_THROW
            }
            shot_type = type_map.get(shot["shot_type"], ShotType.TWO_POINTER)
            
            # Crea l'evento
            shot_event = ShotEvent(
                timestamp=shot["frame"],
                player_id=shot["player_id"],
                player_name=f"Player {shot['jersey_number']}" if shot['jersey_number'] else f"Player {shot['player_id']}",
                shot_type=shot_type,
                result=result,
                distance=shot["distance"] or 20.0,
                court_location=(25, 50),  # Placeholder
                quarter=1,
                team=shot["team"] or "unknown"
            )
            
            self.statistics_extractor.record_shot(shot_event)
        
        except Exception as e:
            logger.error(f"Error adding shot to statistics: {str(e)}")
    
    def generate_reports(self) -> Dict:
        """
        Genera i report finali
        
        Returns:
            Dizionario con path ai report generati
        """
        logger.info("Generating reports...")
        
        reports = {}
        
        # Esporta JSON
        if self.config.enable_json_export:
            # Carica le statistiche dal file salvato
            stats_file = self.config.output_dir / "exports" / "game_stats.json"
            if stats_file.exists():
                with open(stats_file) as f:
                    game_data = json.load(f)
                
                # Genera PDF
                if self.config.enable_pdf_export:
                    pdf_path = self.pdf_generator.generate_game_summary_pdf(
                        game_data,
                        f"game_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                    )
                    reports["pdf"] = str(pdf_path)
                    logger.info(f"PDF report generated: {pdf_path}")
        
        return reports
    
    def run_complete_pipeline(self, home_team: str, away_team: str,
                             home_players: List[Dict], away_players: List[Dict],
                             progress_callback=None) -> Dict:
        """
        Esegue la pipeline completa
        
        Args:
            home_team: Nome squadra casa
            away_team: Nome squadra trasferta
            home_players: Roster squadra casa
            away_players: Roster squadra trasferta
            progress_callback: Funzione per aggiornamenti progress
            
        Returns:
            Statistiche finali e path ai report
        """
        logger.info("=" * 80)
        logger.info("SwagIQ Basketball Analytics Pipeline")
        logger.info("=" * 80)
        
        # Setup
        self.setup_game(home_team, away_team, home_players, away_players)
        
        # Elaborazione video
        video_results = self.process_video(progress_callback)
        
        # Generazione report
        reports = self.generate_reports()
        
        return {
            "video": video_results,
            "reports": reports,
            "summary": self.statistics_extractor.generate_summary()
        }


def main():
    """Funzione main per test della pipeline"""
    
    # Configurazione
    config = PipelineConfig(
        roboflow_api_key="YOUR_ROBOFLOW_API_KEY",
        roboflow_project="basketball-players",
        roboflow_version=1,
        video_source="data/videos/clip1.mp4",
        source_type=DetectionSource.LOCAL_FILE,
        output_dir=Path("output"),
        debug_mode=True
    )
    
    # Crea pipeline
    pipeline = BasketballAnalyticsPipeline(config)
    
    # Configura squadre (esempio)
    home_players = [
        {"player_id": 1, "name": "Player 1", "jersey_number": 23},
        {"player_id": 2, "name": "Player 2", "jersey_number": 3},
    ]
    
    away_players = [
        {"player_id": 3, "name": "Player 3", "jersey_number": 0},
        {"player_id": 4, "name": "Player 4", "jersey_number": 7},
    ]
    
    # Esegui pipeline completa
    results = pipeline.run_complete_pipeline(
        home_team="Lakers",
        away_team="Celtics",
        home_players=home_players,
        away_players=away_players,
        progress_callback=lambda p: print(f"Progress: {p['progress']:.1f}% - Frame {p['frame']}/{p['total']}")
    )
    
    print("\n" + "=" * 80)
    print("Pipeline Completed!")
    print("=" * 80)
    print(f"Final Summary: {json.dumps(results['summary'], indent=2)}")
    print(f"Reports: {results['reports']}")


if __name__ == "__main__":
    main()
