"""
SwagIQ - Jersey Number OCR Module
Recognizes jersey numbers and assigns players to teams using computer vision
"""

import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import logging
import pytesseract
from PIL import Image
import torch
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class JerseyDetection:
    """Rilevamento di un numero di maglia"""
    jersey_number: Optional[int]
    confidence: float
    bbox: Tuple[int, int, int, int]  # (x1, y1, x2, y2)
    raw_text: str
    player_region: np.ndarray  # Immagine ritagliata del giocatore
    frame_number: int


class JerseyNumberOCR:
    """
    Riconosce i numeri di maglia dai giocatori nei video di basket
    Usa OCR e deep learning per massima accuratezza
    """
    
    def __init__(self, use_paddle_ocr: bool = True, use_custom_model: bool = False):
        """
        Inizializza il modulo OCR
        
        Args:
            use_paddle_ocr: Usa PaddleOCR (più accurato) vs pytesseract
            use_custom_model: Carica un modello custom fine-tuned
        """
        self.use_paddle_ocr = use_paddle_ocr
        self.use_custom_model = use_custom_model
        
        if use_paddle_ocr:
            try:
                from paddleocr import PaddleOCR
                self.ocr = PaddleOCR(use_angle_cls=True, lang='en')
                logger.info("PaddleOCR initialized")
            except ImportError:
                logger.warning("PaddleOCR not installed, falling back to Tesseract")
                self.use_paddle_ocr = False
        
        # Carica il modello custom se disponibile
        if use_custom_model:
            self.custom_model = self._load_custom_model()
        else:
            self.custom_model = None
    
    def extract_jersey_region(self, frame: np.ndarray, player_bbox: Tuple[int, int, int, int],
                              roi_ratio: float = 0.3) -> np.ndarray:
        """
        Estrae la regione dove dovrebbe trovarsi il numero di maglia
        (parte centrale superiore del giocatore)
        
        Args:
            frame: Frame del video
            player_bbox: Bounding box del giocatore (x1, y1, x2, y2)
            roi_ratio: Rapporto della ROI rispetto all'altezza del giocatore
            
        Returns:
            Immagine ritagliata della regione con il numero
        """
        x1, y1, x2, y2 = player_bbox
        height = y2 - y1
        width = x2 - x1
        
        # La maglia si trova nel terzo superiore del giocatore
        roi_start_y = y1 + int(height * 0.15)
        roi_end_y = y1 + int(height * 0.5)
        
        # Centra orizzontalmente
        roi_start_x = x1 + int(width * 0.2)
        roi_end_x = x2 - int(width * 0.2)
        
        # Clip ai bordi dell'immagine
        roi_start_y = max(0, roi_start_y)
        roi_end_y = min(frame.shape[0], roi_end_y)
        roi_start_x = max(0, roi_start_x)
        roi_end_x = min(frame.shape[1], roi_end_x)
        
        jersey_region = frame[roi_start_y:roi_end_y, roi_start_x:roi_end_x].copy()
        return jersey_region
    
    def preprocess_jersey_image(self, jersey_region: np.ndarray) -> np.ndarray:
        """
        Preprocessa l'immagine per migliorare il riconoscimento OCR
        
        Args:
            jersey_region: Immagine della regione con il numero
            
        Returns:
            Immagine preprocessata
        """
        # Converti a grayscale
        if len(jersey_region.shape) == 3:
            gray = cv2.cvtColor(jersey_region, cv2.COLOR_BGR2GRAY)
        else:
            gray = jersey_region
        
        # Aumenta il contrasto (CLAHE)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        
        # Applica thresholding
        _, binary = cv2.threshold(enhanced, 100, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Dilata per riempire i buchi
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        dilated = cv2.dilate(binary, kernel, iterations=2)
        
        # Erodi leggermente
        eroded = cv2.erode(dilated, kernel, iterations=1)
        
        # Scala l'immagine per migliorare OCR (4x)
        resized = cv2.resize(eroded, None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC)
        
        return resized
    
    def recognize_jersey_number_tesseract(self, jersey_region: np.ndarray) -> Tuple[Optional[int], float, str]:
        """
        Riconosce il numero di maglia usando Tesseract OCR
        
        Args:
            jersey_region: Immagine della regione con il numero
            
        Returns:
            (numero_maglia, confidence, raw_text)
        """
        try:
            preprocessed = self.preprocess_jersey_image(jersey_region)
            
            # Configura Tesseract per numeri singoli/doppi
            custom_config = r'--oem 3 --psm 7 -c tessedit_char_whitelist=0123456789'
            
            result = pytesseract.image_to_string(
                Image.fromarray(preprocessed),
                config=custom_config
            )
            
            # Estrai solo i numeri
            numbers = ''.join(c for c in result if c.isdigit())
            
            if numbers:
                jersey_number = int(numbers[:2])  # Prendi max 2 cifre
                
                # Valida il numero (0-99)
                if 0 <= jersey_number <= 99:
                    confidence = 0.7  # Tesseract non fornisce confidence diretta
                    return jersey_number, confidence, result
            
            return None, 0.0, result
        
        except Exception as e:
            logger.error(f"Tesseract OCR error: {str(e)}")
            return None, 0.0, ""
    
    def recognize_jersey_number_paddle(self, jersey_region: np.ndarray) -> Tuple[Optional[int], float, str]:
        """
        Riconosce il numero di maglia usando PaddleOCR (più accurato)
        
        Args:
            jersey_region: Immagine della regione con il numero
            
        Returns:
            (numero_maglia, confidence, raw_text)
        """
        try:
            preprocessed = self.preprocess_jersey_image(jersey_region)
            
            # PaddleOCR
            results = self.ocr.ocr(preprocessed, cls=True)
            
            if results and results[0]:
                texts = []
                confidences = []
                
                for line in results:
                    for detection in line:
                        text = detection[1][0]
                        confidence = detection[1][1]
                        texts.append(text)
                        confidences.append(confidence)
                
                raw_text = "".join(texts)
                numbers = ''.join(c for c in raw_text if c.isdigit())
                
                if numbers:
                    jersey_number = int(numbers[:2])
                    if 0 <= jersey_number <= 99:
                        avg_confidence = np.mean(confidences) if confidences else 0.5
                        return jersey_number, avg_confidence, raw_text
            
            return None, 0.0, ""
        
        except Exception as e:
            logger.error(f"PaddleOCR error: {str(e)}")
            return None, 0.0, ""
    
    def recognize_jersey_number(self, jersey_region: np.ndarray) -> Tuple[Optional[int], float, str]:
        """
        Riconosce il numero di maglia usando il metodo configurato
        
        Args:
            jersey_region: Immagine della regione con il numero
            
        Returns:
            (numero_maglia, confidence, raw_text)
        """
        if self.use_paddle_ocr:
            return self.recognize_jersey_number_paddle(jersey_region)
        else:
            return self.recognize_jersey_number_tesseract(jersey_region)
    
    def _load_custom_model(self):
        """Carica un modello custom fine-tuned se disponibile"""
        model_path = Path("models/jersey_ocr_custom.pt")
        if model_path.exists():
            try:
                model = torch.load(model_path)
                logger.info("Custom OCR model loaded")
                return model
            except Exception as e:
                logger.warning(f"Could not load custom model: {str(e)}")
        return None
    
    def batch_recognize(self, frame: np.ndarray, player_bboxes: List[Tuple[int, int, int, int]],
                       min_confidence: float = 0.6) -> List[JerseyDetection]:
        """
        Riconosce i numeri di maglia per più giocatori in un frame
        
        Args:
            frame: Frame del video
            player_bboxes: Lista di bounding box dei giocatori
            min_confidence: Soglia minima di confidenza
            
        Returns:
            Lista di JerseyDetection
        """
        detections = []
        
        for bbox in player_bboxes:
            jersey_region = self.extract_jersey_region(frame, bbox)
            jersey_number, confidence, raw_text = self.recognize_jersey_number(jersey_region)
            
            if confidence >= min_confidence:
                detection = JerseyDetection(
                    jersey_number=jersey_number,
                    confidence=confidence,
                    bbox=bbox,
                    raw_text=raw_text,
                    player_region=jersey_region,
                    frame_number=-1  # Verrà assegnato dopo
                )
                detections.append(detection)
        
        return detections


class TeamClassifier:
    """
    Classifica i giocatori in squadre (home/away) basandosi su colori e posizioni
    Usa clustering e color analysis
    """
    
    def __init__(self):
        self.home_color: Optional[np.ndarray] = None
        self.away_color: Optional[np.ndarray] = None
        self.home_jersey_samples: List[np.ndarray] = []
        self.away_jersey_samples: List[np.ndarray] = []
    
    def extract_jersey_color(self, frame: np.ndarray, bbox: Tuple[int, int, int, int]) -> np.ndarray:
        """
        Estrae il colore principale della maglia
        
        Args:
            frame: Frame del video
            bbox: Bounding box del giocatore
            
        Returns:
            Colore BGR dominante della maglia
        """
        x1, y1, x2, y2 = bbox
        player_region = frame[y1:y2, x1:x2]
        
        # Estrai il colore dal centro della maglia (parte superiore)
        height = y2 - y1
        width = x2 - x1
        
        jersey_start_y = int(height * 0.15)
        jersey_end_y = int(height * 0.45)
        jersey_start_x = int(width * 0.2)
        jersey_end_x = int(width * 0.8)
        
        jersey_region = player_region[jersey_start_y:jersey_end_y, jersey_start_x:jersey_end_x]
        
        # Converti a HSV per migliore clustering colore
        hsv = cv2.cvtColor(jersey_region, cv2.COLOR_BGR2HSV)
        
        # Usa K-means per trovare il colore dominante
        pixels = hsv.reshape((-1, 3)).astype(np.float32)
        
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
        _, _, centers = cv2.kmeans(pixels, 1, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        dominant_color = centers[0].astype(np.uint8)
        
        return dominant_color
    
    def color_distance(self, color1: np.ndarray, color2: np.ndarray) -> float:
        """Calcola la distanza tra due colori nello spazio HSV"""
        return np.sqrt(np.sum((color1 - color2) ** 2))
    
    def calibrate_teams(self, frame: np.ndarray, home_bboxes: List[Tuple[int, int, int, int]],
                       away_bboxes: List[Tuple[int, int, int, int]]):
        """
        Calibra il classificatore di squadre usando campioni noti
        
        Args:
            frame: Frame del video
            home_bboxes: Bounding box dei giocatori home
            away_bboxes: Bounding box dei giocatori away
        """
        # Estrai colori per home team
        for bbox in home_bboxes:
            color = self.extract_jersey_color(frame, bbox)
            self.home_jersey_samples.append(color)
        
        # Estrai colori per away team
        for bbox in away_bboxes:
            color = self.extract_jersey_color(frame, bbox)
            self.away_jersey_samples.append(color)
        
        # Calcola i colori medi
        if self.home_jersey_samples:
            self.home_color = np.mean(self.home_jersey_samples, axis=0).astype(np.uint8)
        
        if self.away_jersey_samples:
            self.away_color = np.mean(self.away_jersey_samples, axis=0).astype(np.uint8)
        
        logger.info(f"Teams calibrated - Home: {self.home_color}, Away: {self.away_color}")
    
    def classify_player(self, frame: np.ndarray, bbox: Tuple[int, int, int, int]) -> str:
        """
        Classifica un giocatore a una squadra
        
        Args:
            frame: Frame del video
            bbox: Bounding box del giocatore
            
        Returns:
            "home" o "away"
        """
        if self.home_color is None or self.away_color is None:
            logger.warning("Teams not calibrated")
            return "unknown"
        
        player_color = self.extract_jersey_color(frame, bbox)
        
        home_distance = self.color_distance(player_color, self.home_color)
        away_distance = self.color_distance(player_color, self.away_color)
        
        return "home" if home_distance < away_distance else "away"
    
    def batch_classify(self, frame: np.ndarray, bboxes: List[Tuple[int, int, int, int]]) -> List[str]:
        """Classifica una lista di giocatori"""
        return [self.classify_player(frame, bbox) for bbox in bboxes]


class PlayerIdentifier:
    """
    Identifica i giocatori abbinando jersey number, team e ID
    """
    
    def __init__(self, ocr: JerseyNumberOCR, team_classifier: TeamClassifier):
        self.ocr = ocr
        self.team_classifier = team_classifier
        self.player_assignments: Dict[int, Dict] = {}  # track_id -> {jersey_number, team, player_id}
    
    def identify_player(self, frame: np.ndarray, track_id: int, bbox: Tuple[int, int, int, int]) -> Dict:
        """
        Identifica un giocatore tracciato
        
        Args:
            frame: Frame del video
            track_id: ID del tracciamento
            bbox: Bounding box del giocatore
            
        Returns:
            Dizionario con jersey_number e team
        """
        jersey_region = self.ocr.extract_jersey_region(frame, bbox)
        jersey_number, confidence, _ = self.ocr.recognize_jersey_number(jersey_region)
        
        team = self.team_classifier.classify_player(frame, bbox)
        
        identification = {
            "track_id": track_id,
            "jersey_number": jersey_number,
            "jersey_confidence": confidence,
            "team": team
        }
        
        self.player_assignments[track_id] = identification
        
        logger.info(f"Player identified - Track {track_id}: #{jersey_number} ({team})")
        
        return identification


# Configurazione di default
DEFAULT_CONFIG = {
    "use_paddle_ocr": True,
    "use_custom_model": False,
    "min_confidence": 0.6,
}


if __name__ == "__main__":
    print("Jersey Number OCR Module - Import this in your main application")
