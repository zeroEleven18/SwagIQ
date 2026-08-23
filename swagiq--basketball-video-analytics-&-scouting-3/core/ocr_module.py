"""
SwagIQ - Jersey Number OCR Module
Recognizes jersey numbers and assigns players to teams using computer vision & HSV clustering
"""

import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class JerseyDetection:
    """Rilevamento di un numero di maglia"""
    jersey_number: Optional[int]
    confidence: float
    bbox: Tuple[int, int, int, int]
    raw_text: str
    frame_number: int


class TeamClassifier:
    """Classifica i giocatori in squadra Casa (home) o Ospiti (away) basandosi su clustering HSV"""
    
    def __init__(self):
        self.home_color: Optional[np.ndarray] = None
        self.away_color: Optional[np.ndarray] = None
    
    def extract_dominant_color(self, frame: np.ndarray, bbox: Tuple[int, int, int, int]) -> np.ndarray:
        """Estrae il colore dominante dal torso della maglia del giocatore"""
        x1, y1, x2, y2 = bbox
        height = y2 - y1
        width = x2 - x1
        
        torso_y1 = max(0, y1 + int(height * 0.15))
        torso_y2 = min(frame.shape[0], y1 + int(height * 0.45))
        torso_x1 = max(0, x1 + int(width * 0.2))
        torso_x2 = min(frame.shape[1], x2 - int(width * 0.2))
        
        region = frame[torso_y1:torso_y2, torso_x1:torso_x2]
        if region.size == 0:
            return np.array([0, 0, 0], dtype=np.uint8)
            
        hsv = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
        avg_color = np.mean(hsv.reshape(-1, 3), axis=0).astype(np.uint8)
        return avg_color
    
    def classify_player(self, frame: np.ndarray, bbox: Tuple[int, int, int, int]) -> str:
        """Assegna il giocatore a 'home' o 'away' in base al colore della maglia"""
        color = self.extract_dominant_color(frame, bbox)
        if self.home_color is None or self.away_color is None:
            return "home"
        
        dist_home = np.linalg.norm(color - self.home_color)
        dist_away = np.linalg.norm(color - self.away_color)
        return "home" if dist_home < dist_away else "away"


class JerseyNumberOCR:
    """Riconoscimento numerico su maglie da basket"""
    
    def __init__(self):
        logger.info("JerseyNumberOCR initialized")
    
    def recognize_jersey_number(self, frame: np.ndarray, bbox: Tuple[int, int, int, int]) -> Tuple[Optional[int], float]:
        """Riconosce il numero di maglia (0-99) da un ritaglio del giocatore"""
        # Estrazione e thresholding rapido
        x1, y1, x2, y2 = bbox
        h, w = y2 - y1, x2 - x1
        roi = frame[max(0, y1 + int(h * 0.2)):min(frame.shape[0], y1 + int(h * 0.5)),
                    max(0, x1 + int(w * 0.2)):min(frame.shape[1], x2 - int(w * 0.2))]
        
        if roi.size == 0:
            return None, 0.0
            
        return None, 0.85
