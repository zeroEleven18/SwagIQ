"""
SwagIQ - Court Mapper Module
Transforms frame video coordinates to real-world basketball court coordinates (NBA / FIBA standards)
"""

import cv2
import numpy as np
from typing import Dict, Tuple, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CourtMapper:
    """
    Mappa le coordinate del video alle coordinate reali della corte
    Usando trasformazione omografica (homography perspective transform)
    """
    
    # Coordinate standard di una corte NBA/FIBA (in piedi e percentuale 0-100)
    COURT_WIDTH = 50.0   # feet
    COURT_LENGTH = 94.0  # feet
    
    # Keypoints standard della corte (in piedi)
    STANDARD_KEYPOINTS = {
        "top_left": (0.0, 0.0),
        "top_right": (50.0, 0.0),
        "bottom_left": (0.0, 94.0),
        "bottom_right": (50.0, 94.0),
        "center": (25.0, 47.0),
        "basket_home": (25.0, 5.25),
        "basket_away": (25.0, 88.75),
        "free_throw_home": (25.0, 19.0),
        "free_throw_away": (25.0, 75.0)
    }
    
    def __init__(self):
        self.keypoints_frame: Dict[str, Tuple[int, int]] = {}
        self.homography_matrix: Optional[np.ndarray] = None
    
    def set_keypoint(self, keypoint_name: str, frame_position: Tuple[int, int]):
        """Registra un keypoint della corte nel frame video"""
        self.keypoints_frame[keypoint_name] = frame_position
        logger.info(f"Court keypoint set: {keypoint_name} at {frame_position}")
    
    def compute_homography(self):
        """Calcola la matrice di omografia dai keypoints registrati"""
        if len(self.keypoints_frame) < 4:
            raise ValueError("Almeno 4 keypoints sono necessari per calcolare l'omografia")
        
        frame_points = []
        court_points = []
        
        for key, frame_pt in self.keypoints_frame.items():
            if key in self.STANDARD_KEYPOINTS:
                frame_points.append(frame_pt)
                court_points.append(self.STANDARD_KEYPOINTS[key])
        
        frame_points = np.array(frame_points, dtype=np.float32)
        court_points = np.array(court_points, dtype=np.float32)
        
        self.homography_matrix, _ = cv2.findHomography(frame_points, court_points)
        logger.info("Homography matrix successfully computed")
    
    def frame_to_court(self, frame_position: Tuple[int, int]) -> Tuple[float, float]:
        """Converte una posizione pixel nel frame (x, y) a posizione reale sul campo in piedi"""
        if self.homography_matrix is None:
            # Fallback approssimato se omografia non ancora calcolata
            return (frame_position[0] / 1920.0 * self.COURT_WIDTH, frame_position[1] / 1080.0 * self.COURT_LENGTH)
        
        point = np.array([[[frame_position[0], frame_position[1]]]], dtype=np.float32)
        court_pos = cv2.perspectiveTransform(point, self.homography_matrix)
        return tuple(court_pos[0][0])
    
    def frame_to_court_percentage(self, frame_position: Tuple[int, int]) -> Tuple[float, float]:
        """Converte una posizione nel frame a coordinate percentuali (0-100) per UI/Heatmap"""
        cx, cy = self.frame_to_court(frame_position)
        pct_x = max(0.0, min(100.0, (cx / self.COURT_WIDTH) * 100.0))
        pct_y = max(0.0, min(100.0, (cy / self.COURT_LENGTH) * 100.0))
        return (pct_x, pct_y)
