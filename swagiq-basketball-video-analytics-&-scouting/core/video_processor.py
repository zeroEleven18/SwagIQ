"""
SwagIQ - Video Processor with Roboflow and SAM 2/3
Handles player detection, tracking, and court mapping from basketball videos
"""

import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import logging
from pathlib import Path
import torch
from datetime import timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DetectionSource(Enum):
    """Fonte del video"""
    LOCAL_FILE = "local"
    YOUTUBE_URL = "youtube"
    TWITCH_URL = "twitch"
    STREAM = "stream"


@dataclass
class Detection:
    """Rilevamento di un oggetto nel frame"""
    class_id: int
    class_name: str
    confidence: float
    bbox: Tuple[int, int, int, int]  # (x1, y1, x2, y2)
    frame_number: int
    timestamp: float
    
    def center_point(self) -> Tuple[float, float]:
        """Calcola il centro del bounding box"""
        x1, y1, x2, y2 = self.bbox
        return ((x1 + x2) / 2, (y1 + y2) / 2)
    
    def area(self) -> float:
        """Calcola l'area del bounding box"""
        x1, y1, x2, y2 = self.bbox
        return (x2 - x1) * (y2 - y1)


@dataclass
class TrackedPlayer:
    """Giocatore tracciato attraverso i frame"""
    track_id: int
    player_id: Optional[int] = None  # Assegnato dopo jersey number recognition
    jersey_number: Optional[int] = None
    team: Optional[str] = None  # "home" o "away"
    detections: List[Detection] = None
    trajectory: List[Tuple[float, float]] = None
    
    def __post_init__(self):
        if self.detections is None:
            self.detections = []
        if self.trajectory is None:
            self.trajectory = []


@dataclass
class CourtKeypoint:
    """Punto di riferimento sulla corte"""
    name: str
    frame_position: Tuple[int, int]  # Posizione nel frame video
    court_position: Tuple[float, float]  # Posizione sulla corte reale (ft)
    

class VideoLoader:
    """Gestore per il caricamento di video da diverse fonti"""
    
    @staticmethod
    def load_video(source: str, source_type: DetectionSource = DetectionSource.LOCAL_FILE) -> cv2.VideoCapture:
        """
        Carica un video dalla fonte specificata
        
        Args:
            source: Path locale, URL YouTube/Twitch, o indirizzo streaming
            source_type: Tipo di fonte
            
        Returns:
            cv2.VideoCapture object
        """
        if source_type == DetectionSource.LOCAL_FILE:
            cap = cv2.VideoCapture(source)
            if not cap.isOpened():
                raise ValueError(f"Cannot open video file: {source}")
            logger.info(f"Loaded local video: {source}")
            
        elif source_type == DetectionSource.YOUTUBE_URL:
            # Usa yt-dlp per estrarre URL streaming diretto
            try:
                import yt_dlp
                ydl_opts = {
                    'format': 'best[ext=mp4]',
                    'quiet': True,
                }
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(source, download=False)
                    video_url = info['url']
                cap = cv2.VideoCapture(video_url)
                logger.info(f"Loaded YouTube video: {source}")
            except ImportError:
                raise ImportError("Install yt-dlp: pip install yt-dlp")
                
        elif source_type == DetectionSource.TWITCH_URL:
            # Simile a YouTube
            try:
                import yt_dlp
                ydl_opts = {
                    'format': 'best[ext=mp4]',
                    'quiet': True,
                }
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(source, download=False)
                    video_url = info['url']
                cap = cv2.VideoCapture(video_url)
                logger.info(f"Loaded Twitch video: {source}")
            except ImportError:
                raise ImportError("Install yt-dlp: pip install yt-dlp")
                
        elif source_type == DetectionSource.STREAM:
            cap = cv2.VideoCapture(source)
            logger.info(f"Connected to stream: {source}")
        
        return cap
    
    @staticmethod
    def get_video_properties(cap: cv2.VideoCapture) -> Dict:
        """Estrae le proprietà del video"""
        return {
            "fps": cap.get(cv2.CAP_PROP_FPS),
            "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            "total_frames": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
            "duration_seconds": int(cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS))
        }


class RoboflowDetector:
    """
    Detector usando Roboflow models
    Assicurati di avere il modello esportato in formato YOLOv8
    """
    
    def __init__(self, api_key: str, project_name: str, version: int):
        """
        Inizializza il detector Roboflow
        
        Args:
            api_key: API key di Roboflow
            project_name: Nome del progetto (es: "basketball-players")
            version: Versione del modello
        """
        self.api_key = api_key
        self.project_name = project_name
        self.version = version
        
        try:
            from roboflow import Roboflow
            rf = Roboflow(api_key=api_key)
            self.project = rf.workspace().project(project_name)
            self.model = self.project.version(version).model
            logger.info(f"Roboflow model loaded: {project_name} v{version}")
        except ImportError:
            raise ImportError("Install roboflow: pip install roboflow")
    
    def detect(self, frame: np.ndarray, confidence: float = 0.5) -> List[Detection]:
        """
        Esegue il rilevamento su un frame
        
        Args:
            frame: Frame del video (numpy array)
            confidence: Soglia di confidenza
            
        Returns:
            Lista di Detection
        """
        try:
            # Usa il modello Roboflow
            predictions = self.model.predict(frame, confidence=confidence).json()
            
            detections = []
            for pred in predictions.get('predictions', []):
                x1 = int(pred['x'] - pred['width'] / 2)
                y1 = int(pred['y'] - pred['height'] / 2)
                x2 = int(pred['x'] + pred['width'] / 2)
                y2 = int(pred['y'] + pred['height'] / 2)
                
                detection = Detection(
                    class_id=pred.get('class_id', -1),
                    class_name=pred.get('class', 'unknown'),
                    confidence=pred.get('confidence', 0),
                    bbox=(x1, y1, x2, y2),
                    frame_number=-1,  # Verrà assegnato dopo
                    timestamp=-1.0    # Verrà assegnato dopo
                )
                detections.append(detection)
            
            return detections
        except Exception as e:
            logger.error(f"Error in Roboflow detection: {str(e)}")
            return []


class SAMTracker:
    """
    Tracker usando SAM 2/3 (Segment Anything Model)
    Per il tracciamento dei giocatori
    """
    
    def __init__(self, model_type: str = "sam2_hiera_large"):
        """
        Inizializza SAM 2/3
        
        Args:
            model_type: Tipo di modello SAM ("sam2_hiera_large", "sam2_hiera_small", etc.)
        """
        self.model_type = model_type
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        try:
            from sam2.build_sam import build_sam2
            from sam2.sam2_image_predictor import SAM2ImagePredictor
            
            self.model = build_sam2(model_type, checkpoint=f"checkpoints/{model_type}.pt")
            self.predictor = SAM2ImagePredictor(self.model)
            logger.info(f"SAM2 model loaded: {model_type} on {self.device}")
        except ImportError:
            raise ImportError("Install SAM2: pip install git+https://github.com/facebookresearch/segment-anything-2.git")
    
    def segment_player(self, frame: np.ndarray, bbox: Tuple[int, int, int, int]) -> Optional[np.ndarray]:
        """
        Segmenta un giocatore usando SAM 2
        
        Args:
            frame: Frame del video
            bbox: Bounding box del giocatore (x1, y1, x2, y2)
            
        Returns:
            Maschera di segmentazione (numpy array binary)
        """
        try:
            x1, y1, x2, y2 = bbox
            
            # Prepara l'input per SAM
            self.predictor.set_image(frame)
            
            # Usa il bounding box come input
            input_box = np.array([x1, y1, x2, y2])
            
            masks, scores, logits = self.predictor.predict(
                point_coords=None,
                point_labels=None,
                box=input_box[None, :],
                multimask_output=True,
            )
            
            # Ritorna la maschera con il punteggio più alto
            best_mask = masks[np.argmax(scores)]
            return best_mask.astype(np.uint8) * 255
        except Exception as e:
            logger.error(f"Error in SAM segmentation: {str(e)}")
            return None


class CourtMapper:
    """
    Mappa le coordinate del video alle coordinate reali della corte
    Usando homography transformation
    """
    
    # Coordinate standard di una corte NBA (in piedi)
    COURT_WIDTH = 50
    COURT_LENGTH = 94
    
    # Keypoints della corte
    STANDARD_KEYPOINTS = {
        "top_left": (0, 0),
        "top_right": (COURT_WIDTH, 0),
        "bottom_left": (0, COURT_LENGTH),
        "bottom_right": (COURT_WIDTH, COURT_LENGTH),
        "center": (COURT_WIDTH / 2, COURT_LENGTH / 2),
        "basket_home": (25, 5.25),
        "basket_away": (25, 88.75),
    }
    
    def __init__(self):
        self.keypoints_frame: Dict[str, Tuple[int, int]] = {}
        self.homography_matrix: Optional[np.ndarray] = None
    
    def set_keypoint(self, keypoint_name: str, frame_position: Tuple[int, int]):
        """Registra un keypoint della corte nel frame"""
        self.keypoints_frame[keypoint_name] = frame_position
        logger.info(f"Keypoint set: {keypoint_name} at {frame_position}")
    
    def compute_homography(self):
        """Calcola la matrice di homography dai keypoint"""
        if len(self.keypoints_frame) < 4:
            raise ValueError("Almeno 4 keypoint sono necessari per la homography")
        
        # Punti nel frame
        frame_points = []
        court_points = []
        
        for key in self.keypoints_frame:
            if key in self.STANDARD_KEYPOINTS:
                frame_points.append(self.keypoints_frame[key])
                court_points.append(self.STANDARD_KEYPOINTS[key])
        
        frame_points = np.array(frame_points, dtype=np.float32)
        court_points = np.array(court_points, dtype=np.float32)
        
        # Calcola la homography
        self.homography_matrix, _ = cv2.findHomography(frame_points, court_points)
        logger.info("Homography matrix computed")
    
    def frame_to_court(self, frame_position: Tuple[int, int]) -> Tuple[float, float]:
        """Converte una posizione nel frame a posizione sulla corte"""
        if self.homography_matrix is None:
            raise ValueError("Homography not computed yet")
        
        point = np.array([[[frame_position[0], frame_position[1]]]], dtype=np.float32)
        court_pos = cv2.perspectiveTransform(point, self.homography_matrix)
        return tuple(court_pos[0][0])


class VideoProcessor:
    """
    Classe principale per l'elaborazione del video
    Integra detection, tracking e court mapping
    """
    
    def __init__(self, roboflow_api_key: str, roboflow_project: str, roboflow_version: int):
        self.detector = RoboflowDetector(roboflow_api_key, roboflow_project, roboflow_version)
        self.tracker = SAMTracker()
        self.court_mapper = CourtMapper()
        
        self.tracked_players: Dict[int, TrackedPlayer] = {}
        self.current_frame_number = 0
        self.current_timestamp = 0.0
    
    def process_video(self, source: str, source_type: DetectionSource = DetectionSource.LOCAL_FILE,
                     callback_frame: Optional[callable] = None) -> List[TrackedPlayer]:
        """
        Processa un intero video
        
        Args:
            source: Sorgente del video
            source_type: Tipo di sorgente
            callback_frame: Funzione callback per ogni frame processato
            
        Yields:
            Frame elaborato
        """
        cap = VideoLoader.load_video(source, source_type)
        video_props = VideoLoader.get_video_properties(cap)
        
        logger.info(f"Video properties: {video_props}")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            self.current_frame_number += 1
            self.current_timestamp = self.current_frame_number / video_props['fps']
            
            # Esegui detection
            detections = self.detector.detect(frame)
            
            # Aggiorna tracciamento
            for detection in detections:
                detection.frame_number = self.current_frame_number
                detection.timestamp = self.current_timestamp
                
                # Assegna a un giocatore tracciato
                track_id = self._assign_to_track(detection)
                
                if track_id not in self.tracked_players:
                    self.tracked_players[track_id] = TrackedPlayer(track_id=track_id)
                
                player = self.tracked_players[track_id]
                player.detections.append(detection)
                
                # Aggiorna la traiettoria
                center = detection.center_point()
                player.trajectory.append(center)
                
                # Segmenta il giocatore con SAM
                mask = self.tracker.segment_player(frame, detection.bbox)
            
            # Callback per ogni frame
            if callback_frame:
                callback_frame(self.current_frame_number, frame, detections)
        
        cap.release()
        logger.info(f"Video processing completed. Tracked {len(self.tracked_players)} players.")
        
        return list(self.tracked_players.values())
    
    def _assign_to_track(self, detection: Detection, max_distance: float = 50.0) -> int:
        """Assegna un detection a un tracciamento esistente"""
        min_distance = float('inf')
        best_track_id = self.current_frame_number  # Nuovo track ID se no match
        
        if not self.tracked_players:
            return self.current_frame_number
        
        # Cerca il tracciamento più vicino
        for track_id, player in self.tracked_players.items():
            if player.trajectory:
                last_pos = player.trajectory[-1]
                det_center = detection.center_point()
                
                distance = np.sqrt((last_pos[0] - det_center[0])**2 + 
                                 (last_pos[1] - det_center[1])**2)
                
                if distance < min_distance and distance < max_distance:
                    min_distance = distance
                    best_track_id = track_id
        
        return best_track_id


# Configurazione di default
DEFAULT_CONFIG = {
    "roboflow_api_key": "your_api_key_here",
    "roboflow_project": "basketball-players",
    "roboflow_version": 1,
    "model_type": "sam2_hiera_large",
}


if __name__ == "__main__":
    # Esempio di utilizzo
    print("Video Processor Module - Import this in your main application")
