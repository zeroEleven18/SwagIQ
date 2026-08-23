"""
SwagIQ Video Processor
Handles video loading, object detection via Roboflow, tracking via SAM 3, and court mapping
"""

import cv2
import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import logging
from pathlib import Path
import requests
from abc import ABC, abstractmethod
import yt_dlp

logger = logging.getLogger(__name__)


class DetectionSource(Enum):
    """Enum per i tipi di sorgente video"""
    LOCAL_FILE = "local_file"
    YOUTUBE = "youtube"
    TWITCH = "twitch"
    HTTP_STREAM = "http_stream"


@dataclass
class Detection:
    """Rappresenta un rilevamento da Roboflow"""
    class_name: str
    confidence: float
    bbox: Tuple[int, int, int, int]  # x1, y1, x2, y2
    x: float  # normalized 0-1
    y: float  # normalized 0-1
    width: float  # normalized 0-1
    height: float  # normalized 0-1
    
    def center_point(self) -> Tuple[int, int]:
        """Ritorna il centro del bounding box"""
        x1, y1, x2, y2 = self.bbox
        return (int((x1 + x2) / 2), int((y1 + y2) / 2))
    
    def area(self) -> int:
        """Ritorna l'area del bounding box"""
        x1, y1, x2, y2 = self.bbox
        return (x2 - x1) * (y2 - y1)


class VideoLoader:
    """Carica video da varie fonti"""
    
    @staticmethod
    def load_video(source: str, source_type: DetectionSource) -> cv2.VideoCapture:
        """
        Carica un video da varia sorgente
        
        Args:
            source: Path o URL del video
            source_type: Tipo di sorgente
            
        Returns:
            cv2.VideoCapture object
        """
        if source_type == DetectionSource.LOCAL_FILE:
            return VideoLoader._load_local_file(source)
        elif source_type == DetectionSource.YOUTUBE:
            return VideoLoader._load_youtube(source)
        elif source_type == DetectionSource.TWITCH:
            return VideoLoader._load_twitch(source)
        elif source_type == DetectionSource.HTTP_STREAM:
            return cv2.VideoCapture(source)
        else:
            raise ValueError(f"Unknown source type: {source_type}")
    
    @staticmethod
    def _load_local_file(path: str) -> cv2.VideoCapture:
        """Carica un file video locale"""
        cap = cv2.VideoCapture(path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video file: {path}")
        logger.info(f"Loaded local video: {path}")
        return cap
    
    @staticmethod
    def _load_youtube(url: str) -> cv2.VideoCapture:
        """Carica video da YouTube"""
        try:
            ydl_opts = {
                'format': 'best[ext=mp4]',
                'quiet': True,
                'no_warnings': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                video_url = info['url']
            
            cap = cv2.VideoCapture(video_url)
            if not cap.isOpened():
                raise ValueError("Cannot open YouTube stream")
            
            logger.info(f"Loaded YouTube video: {url}")
            return cap
        
        except Exception as e:
            logger.error(f"Error loading YouTube video: {str(e)}")
            raise
    
    @staticmethod
    def _load_twitch(url: str) -> cv2.VideoCapture:
        """Carica stream da Twitch"""
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                video_url = info['url']
            
            cap = cv2.VideoCapture(video_url)
            if not cap.isOpened():
                raise ValueError("Cannot open Twitch stream")
            
            logger.info(f"Loaded Twitch stream: {url}")
            return cap
        
        except Exception as e:
            logger.error(f"Error loading Twitch stream: {str(e)}")
            raise
    
    @staticmethod
    def get_video_properties(cap: cv2.VideoCapture) -> Dict:
        """
        Recupera le proprietà del video
        
        Args:
            cap: cv2.VideoCapture object
            
        Returns:
            Dizionario con proprietà
        """
        return {
            'width': int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            'height': int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            'fps': cap.get(cv2.CAP_PROP_FPS),
            'total_frames': int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
            'codec': int(cap.get(cv2.CAP_PROP_FOURCC))
        }


class RoboflowDetector:
    """Rileva oggetti usando Roboflow API"""
    
    def __init__(self, api_key: str, project_name: str, version: int = 1):
        """
        Inizializza il detector Roboflow
        
        Args:
            api_key: API key di Roboflow
            project_name: Nome del progetto
            version: Versione del modello
        """
        self.api_key = api_key
        self.project_name = project_name
        self.version = version
        self.base_url = "https://api.roboflow.com"
        
        logger.info(f"Roboflow detector initialized: {project_name} v{version}")
    
    def detect(self, frame: np.ndarray, confidence_threshold: float = 0.5) -> List[Detection]:
        """
        Rileva oggetti in un frame
        
        Args:
            frame: Frame video (BGR)
            confidence_threshold: Soglia di confidenza
            
        Returns:
            Lista di Detection
        """
        try:
            # Converti frame in JPEG
            _, image_data = cv2.imencode('.jpg', frame)
            
            # Chiama API Roboflow
            url = f"{self.base_url}/predict/{self.project_name}/{self.version}"
            
            response = requests.post(
                url,
                params={"api_key": self.api_key},
                files={"imageToUpload": image_data.tobytes()},
                timeout=30
            )
            
            if response.status_code != 200:
                logger.warning(f"Roboflow API error: {response.status_code}")
                return []
            
            predictions = response.json()
            detections = []
            
            h, w = frame.shape[:2]
            
            for pred in predictions.get('predictions', []):
                if pred['confidence'] >= confidence_threshold:
                    # Normalizza coordinate
                    x = pred['x'] / w
                    y = pred['y'] / h
                    width = pred['width'] / w
                    height = pred['height'] / h
                    
                    # Converti a bbox (x1, y1, x2, y2)
                    x1 = int((x - width/2) * w)
                    y1 = int((y - height/2) * h)
                    x2 = int((x + width/2) * w)
                    y2 = int((y + height/2) * h)
                    
                    detection = Detection(
                        class_name=pred['class'],
                        confidence=pred['confidence'],
                        bbox=(x1, y1, x2, y2),
                        x=x,
                        y=y,
                        width=width,
                        height=height
                    )
                    detections.append(detection)
            
            return detections
        
        except Exception as e:
            logger.error(f"Error in Roboflow detection: {str(e)}")
            return []


class SAMTracker:
    """SAM 3 Tracker per il tracking di giocatori"""
    
    def __init__(self, model_type: str = "sam2_hiera_small"):
        """
        Inizializza SAM 3 tracker
        
        Args:
            model_type: Tipo di modello SAM (small, large, mobile_tiny)
        """
        self.model_type = model_type
        
        try:
            # Import SAM dinamicamente
            from segment_anything import sam_model_registry, SamPredictor
            
            self.sam = sam_model_registry[model_type](checkpoint=f"sam_weights/{model_type}.pt")
            self.predictor = SamPredictor(self.sam)
            
            logger.info(f"SAM 3 tracker initialized: {model_type}")
        
        except Exception as e:
            logger.error(f"Error initializing SAM: {str(e)}")
            self.predictor = None
    
    def track(self, frame: np.ndarray, detections: List[Detection]) -> List[Dict]:
        """
        Traccia gli oggetti rilevati
        
        Args:
            frame: Frame video
            detections: Detections da Roboflow
            
        Returns:
            Lista di tracce con maschi di segmentazione
        """
        if self.predictor is None:
            # Fallback: ritorna solo bboxes
            return [
                {
                    "bbox": d.bbox,
                    "class": d.class_name,
                    "confidence": d.confidence,
                    "mask": None
                }
                for d in detections
            ]
        
        try:
            self.predictor.set_image(frame)
            
            tracks = []
            
            for detection in detections:
                x1, y1, x2, y2 = detection.bbox
                
                # Usa SAM per segmentare
                masks, scores, logits = self.predictor.predict(
                    point_coords=np.array([detection.center_point()]),
                    point_labels=np.array([1])
                )
                
                track = {
                    "bbox": detection.bbox,
                    "class": detection.class_name,
                    "confidence": detection.confidence,
                    "mask": masks[0] if len(masks) > 0 else None,
                    "segmentation_confidence": float(scores[0]) if len(scores) > 0 else 0
                }
                
                tracks.append(track)
            
            return tracks
        
        except Exception as e:
            logger.error(f"Error in SAM tracking: {str(e)}")
            return [
                {
                    "bbox": d.bbox,
                    "class": d.class_name,
                    "confidence": d.confidence,
                    "mask": None
                }
                for d in detections
            ]


class CourtMapper:
    """Mappa le coordinate del campo da basket"""
    
    def __init__(self, court_width: float = 50, court_length: float = 94):
        """
        Inizializza il court mapper
        
        Args:
            court_width: Larghezza del campo in feet
            court_length: Lunghezza del campo in feet
        """
        self.court_width = court_width
        self.court_length = court_length
        
        # Coordinate del canestro (normalizzate 0-1)
        self.basket_x = 0.5
        self.basket_y = 0.94  # Vicino al fondo del campo
        
        # Distanze importanti (in feet)
        self.three_point_distance = 23.75
        self.free_throw_line_distance = 15
        
        logger.info(f"Court mapper initialized: {court_width}x{court_length} feet")
    
    def get_distance_from_basket(self, position: Tuple[float, float]) -> float:
        """
        Calcola la distanza dal canestro
        
        Args:
            position: Posizione normalizzata (0-1, 0-1)
            
        Returns:
            Distanza in feet
        """
        x_norm, y_norm = position
        
        # Distanza in coordinate normalizzate
        dx = (x_norm - self.basket_x) * self.court_width
        dy = (y_norm - self.basket_y) * self.court_length
        
        distance = np.sqrt(dx**2 + dy**2)
        
        return distance
    
    def classify_shot(self, distance: float) -> str:
        """
        Classifica il tipo di tiro basato sulla distanza
        
        Args:
            distance: Distanza dal canestro in feet
            
        Returns:
            Tipo di tiro: "LAYUP", "2PT", "3PT"
        """
        if distance < 3:
            return "LAYUP"
        elif distance < self.three_point_distance:
            return "2PT"
        else:
            return "3PT"
    
    def is_in_three_point_range(self, position: Tuple[float, float]) -> bool:
        """Verifica se la posizione è nel range del tre punti"""
        distance = self.get_distance_from_basket(position)
        return distance >= self.three_point_distance
    
    def get_court_zone(self, position: Tuple[float, float]) -> str:
        """
        Identifica la zona del campo
        
        Args:
            position: Posizione normalizzata (0-1, 0-1)
            
        Returns:
            Zona: "paint", "mid_range", "corner_3", "wing_3", etc.
        """
        x_norm, y_norm = position
        distance = self.get_distance_from_basket(position)
        
        # Zona vicino al canestro
        if distance < 3:
            return "paint"
        
        # Angoli
        if (x_norm < 0.2 or x_norm > 0.8) and distance >= self.three_point_distance:
            return "corner_3"
        
        # Ali
        if 0.2 <= x_norm <= 0.8 and distance >= self.three_point_distance:
            return "wing_3"
        
        # Mid-range
        if 3 <= distance < self.three_point_distance:
            return "mid_range"
        
        return "other"


class VideoProcessor:
    """Processore principale per video"""
    
    def __init__(self, roboflow_detector: RoboflowDetector, 
                 sam_tracker: SAMTracker, 
                 court_mapper: CourtMapper):
        """
        Inizializza il video processor
        
        Args:
            roboflow_detector: Detector Roboflow
            sam_tracker: SAM 3 tracker
            court_mapper: Court mapper
        """
        self.detector = roboflow_detector
        self.tracker = sam_tracker
        self.court_mapper = court_mapper
    
    def process_frame(self, frame: np.ndarray, 
                     confidence_threshold: float = 0.5) -> Dict:
        """
        Processa un singolo frame
        
        Args:
            frame: Frame video
            confidence_threshold: Soglia di confidenza
            
        Returns:
            Risultati del processing
        """
        # Rileva oggetti
        detections = self.detector.detect(frame, confidence_threshold)
        
        # Traccia oggetti
        tracks = self.tracker.track(frame, detections)
        
        # Analizza posizioni
        h, w = frame.shape[:2]
        
        for track in tracks:
            x1, y1, x2, y2 = track["bbox"]
            center_x = (x1 + x2) / (2 * w)
            center_y = (y1 + y2) / (2 * h)
            
            # Calcola distanza dal canestro
            distance = self.court_mapper.get_distance_from_basket((center_x, center_y))
            track["distance_from_basket"] = distance
            
            # Classifica il tipo di tiro
            track["shot_type"] = self.court_mapper.classify_shot(distance)
            
            # Identifica la zona
            track["court_zone"] = self.court_mapper.get_court_zone((center_x, center_y))
        
        return {
            "detections": len(detections),
            "tracks": tracks,
            "frame": frame
        }
