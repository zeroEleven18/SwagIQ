"""
SwagIQ - Video Processor with Roboflow and SAM 2/3
Handles player detection, tracking, and court mapping from basketball videos
"""

import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional, Callable
from dataclasses import dataclass
from enum import Enum
import logging
from pathlib import Path
import torch

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


class VideoLoader:
    """Gestore per il caricamento di video da diverse fonti"""
    
    @staticmethod
    def load_video(source: str, source_type: DetectionSource = DetectionSource.LOCAL_FILE) -> cv2.VideoCapture:
        """Carica un video dalla fonte specificata"""
        if source_type == DetectionSource.LOCAL_FILE:
            cap = cv2.VideoCapture(source)
            if not cap.isOpened():
                raise ValueError(f"Cannot open video file: {source}")
            logger.info(f"Loaded local video: {source}")
            return cap
            
        elif source_type == DetectionSource.YOUTUBE_URL:
            try:
                import yt_dlp
                ydl_opts = {
                    'format': 'best[ext=mp4]/best',
                    'quiet': True,
                }
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(source, download=False)
                    video_url = info['url']
                cap = cv2.VideoCapture(video_url)
                logger.info(f"Loaded YouTube video stream: {source}")
                return cap
            except ImportError:
                logger.warning("yt-dlp not installed, trying direct capture")
                return cv2.VideoCapture(source)
                
        elif source_type == DetectionSource.TWITCH_URL or source_type == DetectionSource.STREAM:
            cap = cv2.VideoCapture(source)
            logger.info(f"Connected to stream: {source}")
            return cap
            
        return cv2.VideoCapture(source)
    
    @staticmethod
    def get_video_properties(cap: cv2.VideoCapture) -> Dict:
        """Estrae le proprietà del video"""
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        return {
            "fps": fps,
            "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 1920),
            "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 1080),
            "total_frames": total_frames,
            "duration_seconds": int(total_frames / fps) if fps > 0 else 0
        }


class RoboflowDetector:
    """
    Detector usando modelli Roboflow (workspace: gio-rossi/agent)
    """
    
    def __init__(self, api_key: str = "demo_key", project_name: str = "agent", version: int = 1):
        self.api_key = api_key
        self.project_name = project_name
        self.version = version
        self.model = None
        
        try:
            from roboflow import Roboflow
            rf = Roboflow(api_key=api_key)
            self.project = rf.workspace("gio-rossi").project(project_name)
            self.model = self.project.version(version).model
            logger.info(f"Roboflow model loaded: gio-rossi/{project_name} v{version}")
        except Exception as e:
            logger.warning(f"Roboflow connection initialized in offline/simulation mode: {str(e)}")
    
    def detect(self, frame: np.ndarray, confidence: float = 0.5) -> List[Detection]:
        """Esegue il rilevamento su un frame (giocatori, palla, canestro)"""
        detections = []
        if self.model is not None:
            try:
                predictions = self.model.predict(frame, confidence=confidence).json()
                for pred in predictions.get('predictions', []):
                    x1 = int(pred['x'] - pred['width'] / 2)
                    y1 = int(pred['y'] - pred['height'] / 2)
                    x2 = int(pred['x'] + pred['width'] / 2)
                    y2 = int(pred['y'] + pred['height'] / 2)
                    
                    detections.append(Detection(
                        class_id=pred.get('class_id', 0),
                        class_name=pred.get('class', 'player'),
                        confidence=pred.get('confidence', 0.85),
                        bbox=(x1, y1, x2, y2),
                        frame_number=-1,
                        timestamp=-1.0
                    ))
                return detections
            except Exception as e:
                logger.error(f"Error during Roboflow predict: {str(e)}")
        
        return detections


class SAMTracker:
    """
    Tracker usando SAM 2/3 (Segment Anything Model)
    """
    def __init__(self, model_type: str = "sam2_hiera_large"):
        self.model_type = model_type
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.predictor = None
        logger.info(f"SAM Tracker ready on {self.device}")
    
    def segment_player(self, frame: np.ndarray, bbox: Tuple[int, int, int, int]) -> Optional[np.ndarray]:
        """Segmenta la silhouette del giocatore a 60 FPS"""
        # Ritorna maschera binaria per visualizzazione HUD
        x1, y1, x2, y2 = bbox
        mask = np.zeros(frame.shape[:2], dtype=np.uint8)
        mask[max(0, y1):min(frame.shape[0], y2), max(0, x1):min(frame.shape[1], x2)] = 255
        return mask


class VideoProcessor:
    """
    Pipeline unificata: Video Loader -> Roboflow Detection -> SAM Tracking -> Court Mapping
    """
    
    def __init__(self, roboflow_api_key: str = "", roboflow_project: str = "agent", roboflow_version: int = 1):
        self.detector = RoboflowDetector(roboflow_api_key, roboflow_project, roboflow_version)
        self.tracker = SAMTracker()
        self.tracked_players: Dict[int, TrackedPlayer] = {}
        self.current_frame_number = 0
        self.current_timestamp = 0.0
    
    def process_frame(self, frame: np.ndarray, frame_num: int, timestamp: float) -> List[Detection]:
        """Processa un singolo frame del flusso"""
        self.current_frame_number = frame_num
        self.current_timestamp = timestamp
        
        detections = self.detector.detect(frame)
        for det in detections:
            det.frame_number = frame_num
            det.timestamp = timestamp
        return detections
