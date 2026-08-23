"""
SwagIQ Main Pipeline
Orchestrates the entire video analysis workflow
"""

import logging
import yaml
from pathlib import Path
from typing import Dict, Optional
import cv2

from core.video_processor import VideoLoader, RoboflowDetector, SAMTracker, CourtMapper, VideoProcessor
from core.jersey_ocr import JerseyNumberOCR, TeamClassifier, PlayerIdentifier
from core.statistics_extractor import StatisticsExtractor, Shot, ShotOutcome, ShotType
from export.report_generator import ReportGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SwagIQPipeline:
    """Main pipeline for SwagIQ video analysis"""
    
    def __init__(self, config_path: str = "config.yaml"):
        """
        Initialize the SwagIQ pipeline
        
        Args:
            config_path: Path to configuration file
        """
        self.config = self._load_config(config_path)
        self.setup_components()
        
        logger.info("SwagIQ Pipeline initialized")
    
    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from YAML file"""
        try:
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
            logger.info(f"Configuration loaded from {config_path}")
            return config
        except FileNotFoundError:
            logger.error(f"Configuration file not found: {config_path}")
            raise
        except yaml.YAMLError as e:
            logger.error(f"Error parsing configuration: {str(e)}")
            raise
    
    def setup_components(self):
        """Setup all pipeline components"""
        logger.info("Setting up pipeline components...")
        
        # Setup Roboflow detector
        roboflow_config = self.config.get('roboflow', {})
        self.detector = RoboflowDetector(
            api_key=roboflow_config.get('api_key'),
            project_name=roboflow_config.get('project_name'),
            version=roboflow_config.get('model_version', 1)
        )
        
        # Setup SAM tracker
        tracking_config = self.config.get('tracking', {})
        self.tracker = SAMTracker(
            model_type=tracking_config.get('sam_model', 'sam2_hiera_small')
        )
        
        # Setup court mapper
        court_config = self.config.get('court', {})
        self.court_mapper = CourtMapper(
            court_width=court_config.get('court_width_feet', 50),
            court_length=court_config.get('court_length_feet', 94)
        )
        
        # Setup video processor
        self.video_processor = VideoProcessor(
            self.detector,
            self.tracker,
            self.court_mapper
        )
        
        # Setup Jersey OCR
        ocr_config = self.config.get('jersey_ocr', {})
        self.jersey_ocr = JerseyNumberOCR(
            use_paddle_ocr=ocr_config.get('use_paddle_ocr', True),
            language=ocr_config.get('language', 'en')
        )
        
        # Setup Team Classifier
        self.team_classifier = TeamClassifier()
        
        # Setup Player Identifier
        self.player_identifier = PlayerIdentifier(
            self.jersey_ocr,
            self.team_classifier
        )
        
        # Setup Statistics Extractor
        game_config = self.config.get('game', {})
        self.stats_extractor = StatisticsExtractor(
            home_team=game_config.get('home_team', 'Home'),
            away_team=game_config.get('away_team', 'Away')
        )
        
        # Setup Report Generator
        output_config = self.config.get('output', {})
        self.report_generator = ReportGenerator(
            Path(output_config.get('output_dir', 'output'))
        )
        
        logger.info("All components initialized successfully")
    
    def process_video(self, video_source: str, source_type: str = "local_file") -> Dict:
        """
        Process a complete video
        
        Args:
            video_source: Path or URL to video
            source_type: Type of video source
            
        Returns:
            Dictionary with analysis results
        """
        logger.info(f"Starting video processing: {video_source}")
        
        try:
            # Load video
            from core.video_processor import DetectionSource
            source_enum = DetectionSource[source_type.upper()]
            cap = VideoLoader.load_video(video_source, source_enum)
            
            # Get video properties
            props = VideoLoader.get_video_properties(cap)
            logger.info(f"Video properties: {props['width']}x{props['height']} @ {props['fps']} fps")
            
            self.stats_extractor.fps = props['fps']
            
            # Process frames
            frame_count = 0
            processed_frames = 0
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_count += 1
                
                # Sample frames based on configuration
                frame_sample_rate = self.config.get('video', {}).get('frame_sample_rate', 1)
                if frame_count % frame_sample_rate != 0:
                    continue
                
                processed_frames += 1
                
                # Resize frame if needed
                resize_factor = self.config.get('video', {}).get('resize_factor', 1.0)
                if resize_factor < 1.0:
                    h, w = frame.shape[:2]
                    frame = cv2.resize(frame, (int(w * resize_factor), int(h * resize_factor)))
                
                # Process frame
                try:
                    result = self.video_processor.process_frame(frame)
                    
                    # Identify players
                    for i, track in enumerate(result['tracks']):
                        bbox = track['bbox']
                        player_id = i
                        
                        player_info = self.player_identifier.identify_player(
                            frame, player_id, bbox
                        )
                        
                        track['jersey_number'] = player_info.get('jersey_number')
                        track['team'] = player_info.get('team')
                    
                    logger.info(f"Frame {processed_frames}: {len(result['tracks'])} players detected")
                
                except Exception as e:
                    logger.warning(f"Error processing frame {frame_count}: {str(e)}")
                    continue
                
                # Log progress
                if processed_frames % 30 == 0:
                    logger.info(f"Processed {processed_frames} frames")
            
            cap.release()
            
            logger.info(f"Video processing complete: {processed_frames} frames processed")
            
            # Generate summary
            self.stats_extractor.frame_count = frame_count
            game_summary = self.stats_extractor.generate_game_summary(
                duration_seconds=frame_count / props['fps']
            )
            
            logger.info(f"Game summary generated: {len(self.stats_extractor.shots)} shots detected")
            
            return {
                'success': True,
                'frames_processed': processed_frames,
                'total_shots': len(self.stats_extractor.shots),
                'game_summary': game_summary,
                'top_performers': self.stats_extractor.get_top_performers(),
                'shot_chart': self.stats_extractor.get_shot_chart_data(),
                'shooting_efficiency': self.stats_extractor.get_shooting_efficiency_by_zone()
            }
        
        except Exception as e:
            logger.error(f"Error processing video: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_reports(self, game_summary_dict: Dict = None) -> Dict:
        """
        Generate output reports
        
        Args:
            game_summary_dict: Game summary data (optional)
            
        Returns:
            Dictionary with report file paths
        """
        logger.info("Generating reports...")
        
        try:
            if game_summary_dict is None:
                game_summary = self.stats_extractor.generate_game_summary()
                game_summary_dict = game_summary.to_dict()
            
            reports = self.report_generator.generate_all_reports(game_summary_dict)
            
            logger.info(f"Reports generated: {len(reports)} files created")
            
            for report_type, filepath in reports.items():
                logger.info(f"  - {report_type}: {filepath}")
            
            return reports
        
        except Exception as e:
            logger.error(f"Error generating reports: {str(e)}")
            return {}
    
    def run(self, video_source: str, source_type: str = "local_file") -> Dict:
        """
        Run the complete pipeline
        
        Args:
            video_source: Path or URL to video
            source_type: Type of video source
            
        Returns:
            Complete analysis results
        """
        logger.info("=" * 50)
        logger.info("SwagIQ Pipeline Started")
        logger.info("=" * 50)
        
        # Process video
        result = self.process_video(video_source, source_type)
        
        if not result.get('success', False):
            return result
        
        # Generate reports
        game_summary_dict = result['game_summary'].to_dict()
        reports = self.generate_reports(game_summary_dict)
        
        result['reports'] = reports
        
        logger.info("=" * 50)
        logger.info("SwagIQ Pipeline Completed")
        logger.info("=" * 50)
        
        return result


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='SwagIQ Basketball Video Analytics')
    parser.add_argument('video', help='Path or URL to video file')
    parser.add_argument('--config', default='config.yaml', help='Configuration file path')
    parser.add_argument('--source-type', default='local_file', 
                       choices=['local_file', 'youtube', 'twitch', 'http_stream'],
                       help='Video source type')
    
    args = parser.parse_args()
    
    # Initialize pipeline
    pipeline = SwagIQPipeline(args.config)
    
    # Run pipeline
    results = pipeline.run(args.video, args.source_type)
    
    # Print results
    if results.get('success', False):
        print("\n" + "=" * 50)
        print("ANALYSIS RESULTS")
        print("=" * 50)
        print(f"Total Shots: {results.get('total_shots', 0)}")
        print(f"Frames Processed: {results.get('frames_processed', 0)}")
        print(f"\nTop Performers:")
        for player in results.get('top_performers', [])[:5]:
            print(f"  #{player['jersey_number']}: {player['points']} points ({player['field_goal_percentage']}% FG)")
        print(f"\nReports Generated: {len(results.get('reports', {}))}")
        print("=" * 50)
    else:
        print(f"Error: {results.get('error', 'Unknown error')}")


if __name__ == "__main__":
    main()
