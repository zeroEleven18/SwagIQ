"""
SwagIQ Jersey OCR & Team Classification
Recognizes jersey numbers and classifies teams
"""

import cv2
import numpy as np
from typing import Dict, Optional, Tuple, List
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class PlayerIdentification:
    """Identificazione di un giocatore"""
    jersey_number: Optional[int]
    team: Optional[str]
    confidence: float
    region_image: Optional[np.ndarray] = None


class JerseyNumberOCR:
    """Riconosce i numeri delle maglie via PaddleOCR"""
    
    def __init__(self, use_paddle_ocr: bool = True, language: str = 'en'):
        """
        Inizializza il Jersey OCR
        
        Args:
            use_paddle_ocr: Usa PaddleOCR (altrimenti Tesseract)
            language: Lingua per OCR
        """
        self.use_paddle_ocr = use_paddle_ocr
        self.language = language
        self.ocr = None
        
        if use_paddle_ocr:
            try:
                from paddleocr import PaddleOCR
                self.ocr = PaddleOCR(use_angle_cls=True, lang=language)
                logger.info("PaddleOCR initialized")
            except ImportError:
                logger.warning("PaddleOCR not available, falling back to Tesseract")
                self.use_paddle_ocr = False
        
        if not use_paddle_ocr:
            try:
                import pytesseract
                self.pytesseract = pytesseract
                logger.info("Tesseract OCR initialized")
            except ImportError:
                logger.warning("Tesseract not available, OCR will not work")
                self.ocr = None
    
    def extract_jersey_number(self, player_region: np.ndarray, 
                             confidence_threshold: float = 0.3) -> Tuple[Optional[int], float]:
        """
        Estrae il numero della maglia da un'immagine di giocatore
        
        Args:
            player_region: Immagine ritagliata del giocatore
            confidence_threshold: Soglia di confidenza
            
        Returns:
            Tupla (numero_maglia, confidenza)
        """
        try:
            if player_region is None or player_region.size == 0:
                return None, 0.0
            
            # Preprocessa l'immagine
            processed = self._preprocess_image(player_region)
            
            if self.use_paddle_ocr and self.ocr:
                return self._extract_with_paddle_ocr(processed, confidence_threshold)
            else:
                return self._extract_with_tesseract(processed, confidence_threshold)
        
        except Exception as e:
            logger.error(f"Error extracting jersey number: {str(e)}")
            return None, 0.0
    
    def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocessa l'immagine per migliore OCR
        
        Args:
            image: Immagine originale
            
        Returns:
            Immagine preprocessata
        """
        # Converti a grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Applica CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        
        # Applica bilateral filter per ridurre rumore mantenendo edges
        filtered = cv2.bilateralFilter(enhanced, 9, 75, 75)
        
        # Applica threshold
        _, binary = cv2.threshold(filtered, 127, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return binary
    
    def _extract_with_paddle_ocr(self, image: np.ndarray, 
                                 confidence_threshold: float) -> Tuple[Optional[int], float]:
        """Estrae numero con PaddleOCR"""
        try:
            result = self.ocr.ocr(image, cls=True)
            
            if not result or not result[0]:
                return None, 0.0
            
            # Estrai il testo più confidenziale
            best_text = None
            best_confidence = 0.0
            
            for line in result:
                for word_info in line:
                    text = word_info[1][0]
                    confidence = word_info[1][1]
                    
                    if confidence > best_confidence:
                        best_text = text
                        best_confidence = confidence
            
            # Tenta di estrarre il numero
            if best_text and best_confidence > confidence_threshold:
                jersey_number = self._parse_jersey_number(best_text)
                if jersey_number is not None:
                    return jersey_number, best_confidence
            
            return None, 0.0
        
        except Exception as e:
            logger.error(f"Error in PaddleOCR: {str(e)}")
            return None, 0.0
    
    def _extract_with_tesseract(self, image: np.ndarray, 
                               confidence_threshold: float) -> Tuple[Optional[int], float]:
        """Estrae numero con Tesseract"""
        try:
            # Applica Tesseract
            config = r'--psm 6 --oem 3 -c tessedit_char_whitelist=0123456789'
            text = self.pytesseract.image_to_string(image, config=config)
            
            if text.strip():
                jersey_number = self._parse_jersey_number(text)
                if jersey_number is not None:
                    # Tesseract non ritorna confidence, assumiamo 0.7 se trova un numero
                    return jersey_number, 0.7
            
            return None, 0.0
        
        except Exception as e:
            logger.error(f"Error in Tesseract: {str(e)}")
            return None, 0.0
    
    def _parse_jersey_number(self, text: str) -> Optional[int]:
        """
        Parsa il testo OCR per estrarre il numero della maglia
        
        Args:
            text: Testo estratto da OCR
            
        Returns:
            Numero della maglia (0-99) o None
        """
        # Rimuovi spazi e caratteri non numerici
        cleaned = ''.join(filter(str.isdigit, text.strip()))
        
        if not cleaned:
            return None
        
        # Prendi i primi 2 digit (numeri validi sono 0-99)
        for i in range(len(cleaned), 0, -1):
            number_str = cleaned[:i]
            try:
                number = int(number_str)
                if 0 <= number <= 99:
                    return number
            except ValueError:
                continue
        
        return None


class TeamClassifier:
    """Classifica il team dal colore della maglia"""
    
    def __init__(self):
        """Inizializza il team classifier"""
        # Colori tipici delle maglie NBA (HSV)
        self.team_colors = {
            "Lakers": {"h_range": (0, 20), "s_range": (100, 255), "v_range": (100, 255)},  # Giallo/Viola
            "Celtics": {"h_range": (90, 130), "s_range": (100, 255), "v_range": (50, 200)},  # Verde
            "Warriors": {"h_range": (25, 40), "s_range": (150, 255), "v_range": (150, 255)},  # Blu/Oro
            "Heat": {"h_range": (10, 20), "s_range": (150, 255), "v_range": (150, 255)},  # Rosso
            "Bulls": {"h_range": (0, 10), "s_range": (180, 255), "v_range": (100, 255)},  # Rosso scuro
        }
        
        logger.info("Team classifier initialized")
    
    def classify_team(self, player_region: np.ndarray, 
                     confidence_threshold: float = 0.3) -> Tuple[Optional[str], float]:
        """
        Classifica il team dal colore della maglia
        
        Args:
            player_region: Immagine del giocatore
            confidence_threshold: Soglia di confidenza
            
        Returns:
            Tupla (team_name, confidence)
        """
        try:
            if player_region is None or player_region.size == 0:
                return None, 0.0
            
            # Converti BGR a HSV
            hsv = cv2.cvtColor(player_region, cv2.COLOR_BGR2HSV)
            
            # Estrai il colore dominante della maglia (parte centrale inferiore)
            h, w = hsv.shape[:2]
            jersey_region = hsv[int(h*0.3):int(h*0.7), int(w*0.2):int(w*0.8)]
            
            # Calcola l'istogramma HSV
            hist = cv2.calcHist([jersey_region], [0, 1, 2], None, [18, 256, 256],
                               ranges=[0, 180, 0, 256, 0, 256])
            
            # Normalizza
            hist = cv2.normalize(hist, hist).flatten()
            
            # Confronta con i colori dei team
            best_team = None
            best_score = 0.0
            
            for team_name, color_range in self.team_colors.items():
                score = self._calculate_color_match_score(jersey_region, color_range)
                
                if score > best_score:
                    best_score = score
                    best_team = team_name
            
            if best_score > confidence_threshold:
                return best_team, best_score
            
            return None, best_score
        
        except Exception as e:
            logger.error(f"Error classifying team: {str(e)}")
            return None, 0.0
    
    def _calculate_color_match_score(self, hsv_image: np.ndarray, 
                                     color_range: Dict) -> float:
        """
        Calcola il match score tra l'immagine e l'intervallo di colore
        
        Args:
            hsv_image: Immagine in HSV
            color_range: Intervallo di colore target
            
        Returns:
            Match score (0-1)
        """
        h_range, s_range, v_range = color_range["h_range"], color_range["s_range"], color_range["v_range"]
        
        # Crea una maschera per il colore
        lower = np.array([h_range[0], s_range[0], v_range[0]])
        upper = np.array([h_range[1], s_range[1], v_range[1]])
        
        mask = cv2.inRange(hsv_image, lower, upper)
        
        # Calcola la percentuale di pixel che corrispondono
        total_pixels = mask.shape[0] * mask.shape[1]
        matching_pixels = cv2.countNonZero(mask)
        
        score = matching_pixels / total_pixels if total_pixels > 0 else 0.0
        
        return score


class PlayerIdentifier:
    """Identifica i giocatori combinando OCR e classificazione team"""
    
    def __init__(self, jersey_ocr: JerseyNumberOCR, team_classifier: TeamClassifier):
        """
        Inizializza il player identifier
        
        Args:
            jersey_ocr: Jersey OCR instance
            team_classifier: Team classifier instance
        """
        self.jersey_ocr = jersey_ocr
        self.team_classifier = team_classifier
        
        # Cache per evitare OCR ripetuti
        self.identification_cache: Dict[int, PlayerIdentification] = {}
        
        logger.info("Player identifier initialized")
    
    def identify_player(self, frame: np.ndarray, player_id: int, 
                       bbox: Tuple[int, int, int, int]) -> Dict:
        """
        Identifica un giocatore
        
        Args:
            frame: Frame video
            player_id: ID del giocatore nel tracking
            bbox: Bounding box (x1, y1, x2, y2)
            
        Returns:
            Dizionario con informazioni del giocatore
        """
        # Controlla cache
        if player_id in self.identification_cache:
            cached = self.identification_cache[player_id]
            if cached.confidence > 0.5:  # Se già identificato con confidence alta, usa cache
                return {
                    "player_id": player_id,
                    "jersey_number": cached.jersey_number,
                    "team": cached.team,
                    "confidence": cached.confidence,
                    "from_cache": True
                }
        
        # Estrai la regione del giocatore
        x1, y1, x2, y2 = bbox
        player_region = frame[y1:y2, x1:x2].copy()
        
        if player_region.size == 0:
            return {
                "player_id": player_id,
                "jersey_number": None,
                "team": None,
                "confidence": 0.0
            }
        
        # Estrai numero della maglia
        jersey_number, jersey_confidence = self.jersey_ocr.extract_jersey_number(
            player_region, confidence_threshold=0.3
        )
        
        # Classifica il team
        team, team_confidence = self.team_classifier.classify_team(
            player_region, confidence_threshold=0.3
        )
        
        # Calcola confidence complessiva
        overall_confidence = max(jersey_confidence, team_confidence)
        
        # Salva in cache
        identification = PlayerIdentification(
            jersey_number=jersey_number,
            team=team,
            confidence=overall_confidence,
            region_image=player_region
        )
        self.identification_cache[player_id] = identification
        
        return {
            "player_id": player_id,
            "jersey_number": jersey_number,
            "team": team,
            "jersey_confidence": jersey_confidence,
            "team_confidence": team_confidence,
            "overall_confidence": overall_confidence,
            "from_cache": False
        }
    
    def clear_cache(self):
        """Pulisce la cache"""
        self.identification_cache.clear()
    
    def get_cached_identification(self, player_id: int) -> Optional[PlayerIdentification]:
        """Recupera identificazione dalla cache"""
        return self.identification_cache.get(player_id)
