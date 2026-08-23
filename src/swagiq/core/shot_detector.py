"""
SwagIQ - Shot Detector Module
Detects shooting actions using hand pose analysis and ball trajectory tracking
Hybrid approach: Hand Pose Detection + Ball Tracking for maximum accuracy
"""

import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import logging
import mediapipe as mp
from scipy.optimize import curve_fit
from scipy.signal import find_peaks
import math

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class HandPose:
    """Rilevamento della posa della mano"""
    wrist: Tuple[float, float]
    index_finger_tip: Tuple[float, float]
    middle_finger_tip: Tuple[float, float]
    ring_finger_tip: Tuple[float, float]
    confidence: float
    frame_number: int


@dataclass
class BallTrajectory:
    """Traiettoria della palla"""
    positions: List[Tuple[float, float]]  # (x, y) coordinates
    timestamps: List[float]  # frame numbers
    confidence: List[float]
    velocity: Optional[np.ndarray] = None
    acceleration: Optional[np.ndarray] = None


@dataclass
class ShotDetectionResult:
    """Risultato del rilevamento di un tiro"""
    is_shot: bool
    shot_type: Optional[str]  # "2PT", "3PT", "LAYUP", "DUNK", "FT"
    shot_result: Optional[str]  # "MADE", "MISSED", "BLOCKED"
    frame_start: int
    frame_end: int
    shooting_player_track_id: int
    hand_pose: Optional[HandPose]
    ball_trajectory: Optional[BallTrajectory]
    confidence: float
    court_location: Optional[Tuple[float, float]] = None
    distance_from_basket: Optional[float] = None


class HandPoseDetector:
    """
    Rileva la posa della mano e il gesto di tiro
    Usa MediaPipe Pose per massima accuracy
    """
    
    def __init__(self):
        """Inizializza MediaPipe Pose"""
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,  # 0=light, 1=full
            smooth_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        logger.info("MediaPipe Pose initialized")
    
    def detect_hand_pose(self, frame: np.ndarray) -> Tuple[Optional[HandPose], np.ndarray]:
        """
        Rileva la posa della mano nel frame
        
        Args:
            frame: Frame video (BGR)
            
        Returns:
            (HandPose, frame_with_landmarks)
        """
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb_frame)
        
        if not results.pose_landmarks:
            return None, frame
        
        landmarks = results.pose_landmarks.landmark
        h, w, c = frame.shape
        
        # Estrai i punti chiave della mano (right hand per shooting)
        try:
            # Right hand keypoints
            wrist = (
                int(landmarks[16].x * w),
                int(landmarks[16].y * h)
            )
            index_tip = (
                int(landmarks[20].x * w),
                int(landmarks[20].y * h)
            )
            middle_tip = (
                int(landmarks[18].x * w),
                int(landmarks[18].y * h)
            )
            ring_tip = (
                int(landmarks[22].x * w),
                int(landmarks[22].y * h)
            )
            
            # Calcola la confidenza media
            confidence = np.mean([
                landmarks[16].visibility,
                landmarks[20].visibility,
                landmarks[18].visibility,
                landmarks[22].visibility
            ])
            
            hand_pose = HandPose(
                wrist=wrist,
                index_finger_tip=index_tip,
                middle_finger_tip=middle_tip,
                ring_finger_tip=ring_tip,
                confidence=float(confidence),
                frame_number=-1  # Assegnato dopo
            )
            
            # Disegna i landmark
            annotated_frame = frame.copy()
            self.mp_drawing.draw_landmarks(annotated_frame, results.pose_landmarks, 
                                          self.mp_pose.POSE_CONNECTIONS)
            
            return hand_pose, annotated_frame
        
        except Exception as e:
            logger.error(f"Error in hand pose detection: {str(e)}")
            return None, frame
    
    def calculate_shooting_motion(self, hand_poses: List[HandPose]) -> Dict:
        """
        Analizza il movimento della mano per rilevare il gesto di tiro
        
        Args:
            hand_poses: Lista di pose della mano nei frame consecutivi
            
        Returns:
            Dizionario con metriche di movimento
        """
        if len(hand_poses) < 5:
            return None
        
        # Estrai la posizione del polso nel tempo
        wrist_positions = np.array([pose.wrist for pose in hand_poses])
        
        # Calcola velocità verticale (y-axis = altezza)
        wrist_y_velocity = np.diff(wrist_positions[:, 1])
        
        # Calcola l'estensione del braccio (distanza polso-dita)
        arm_extensions = []
        for pose in hand_poses:
            # Distanza dal polso alle dita
            to_index = math.sqrt(
                (pose.index_finger_tip[0] - pose.wrist[0])**2 +
                (pose.index_finger_tip[1] - pose.wrist[1])**2
            )
            to_middle = math.sqrt(
                (pose.middle_finger_tip[0] - pose.wrist[0])**2 +
                (pose.middle_finger_tip[1] - pose.wrist[1])**2
            )
            to_ring = math.sqrt(
                (pose.ring_finger_tip[0] - pose.wrist[0])**2 +
                (pose.ring_finger_tip[1] - pose.wrist[1])**2
            )
            
            avg_extension = np.mean([to_index, to_middle, to_ring])
            arm_extensions.append(avg_extension)
        
        arm_extensions = np.array(arm_extensions)
        
        return {
            "wrist_velocity": float(np.mean(np.abs(wrist_y_velocity))),
            "arm_extension_change": float(np.max(arm_extensions) - np.min(arm_extensions)),
            "peak_velocity": float(np.max(np.abs(wrist_y_velocity))),
            "motion_duration": len(hand_poses),
            "upward_motion": float(np.sum(wrist_y_velocity < 0))  # Moving up
        }
    
    def is_shooting_motion(self, motion_metrics: Dict) -> bool:
        """
        Classifica se il movimento è un gesto di tiro
        
        Args:
            motion_metrics: Metriche di movimento
            
        Returns:
            True se è un gesto di tiro
        """
        if not motion_metrics:
            return False
        
        # Criteri per identificare un tiro:
        # 1. Movimento verticale significativo verso l'alto
        # 2. Estensione del braccio
        # 3. Velocità del polso sopra soglia
        
        has_upward_motion = motion_metrics.get("upward_motion", 0) > motion_metrics.get("motion_duration", 1) * 0.4
        has_arm_extension = motion_metrics.get("arm_extension_change", 0) > 20
        has_velocity = motion_metrics.get("peak_velocity", 0) > 10
        
        is_shot = has_upward_motion and has_arm_extension and has_velocity
        
        logger.info(f"Motion check - Upward: {has_upward_motion}, Extension: {has_arm_extension}, Velocity: {has_velocity} -> Shot: {is_shot}")
        
        return is_shot


class BallTracker:
    """
    Traccia la palla e predice l'esito del tiro
    Usa physics-based trajectory analysis
    """
    
    # Parametri della corte NBA
    BASKET_HEIGHT = 10  # piedi
    BASKET_DIAMETER = 1.5  # piedi
    GRAVITY = 32.174  # ft/s^2
    
    def __init__(self, court_mapper=None):
        """
        Inizializza il tracker della palla
        
        Args:
            court_mapper: Court mapper per convertire coordinate
        """
        self.court_mapper = court_mapper
        self.ball_trajectory: Optional[BallTrajectory] = None
    
    def track_ball_trajectory(self, detections: List[Dict], fps: float) -> Optional[BallTrajectory]:
        """
        Traccia la traiettoria della palla attraverso i frame
        
        Args:
            detections: Lista di rilevamenti della palla (da Roboflow)
            fps: Frame per secondo del video
            
        Returns:
            BallTrajectory object
        """
        if not detections or len(detections) < 3:
            return None
        
        try:
            # Estrai posizioni della palla
            positions = []
            timestamps = []
            confidences = []
            
            for i, det in enumerate(detections):
                # Centro del bounding box della palla
                x1, y1, x2, y2 = det.get('bbox', (0, 0, 0, 0))
                center_x = (x1 + x2) / 2
                center_y = (y1 + y2) / 2
                
                positions.append((center_x, center_y))
                timestamps.append(i / fps)
                confidences.append(det.get('confidence', 0.5))
            
            trajectory = BallTrajectory(
                positions=positions,
                timestamps=timestamps,
                confidence=confidences
            )
            
            # Calcola velocità e accelerazione
            trajectory.velocity = self._calculate_velocity(positions, timestamps)
            trajectory.acceleration = self._calculate_acceleration(positions, timestamps)
            
            return trajectory
        
        except Exception as e:
            logger.error(f"Error tracking ball trajectory: {str(e)}")
            return None
    
    def _calculate_velocity(self, positions: List[Tuple[float, float]], 
                           timestamps: List[float]) -> np.ndarray:
        """Calcola la velocità della palla"""
        if len(positions) < 2:
            return np.array([0, 0])
        
        positions = np.array(positions)
        timestamps = np.array(timestamps)
        
        # Differenza di posizione / differenza di tempo
        dt = np.diff(timestamps)
        dx = np.diff(positions[:, 0])
        dy = np.diff(positions[:, 1])
        
        vx = dx / dt
        vy = dy / dt
        
        return np.mean(np.column_stack([vx, vy]), axis=0)
    
    def _calculate_acceleration(self, positions: List[Tuple[float, float]], 
                               timestamps: List[float]) -> np.ndarray:
        """Calcola l'accelerazione della palla"""
        velocity = self._calculate_velocity(positions, timestamps)
        
        if len(positions) < 3:
            return np.array([0, 0])
        
        # Accelerazione dovuta alla gravità
        return np.array([0, self.GRAVITY])
    
    def predict_shot_result(self, trajectory: BallTrajectory, 
                           basket_position: Tuple[float, float],
                           shot_distance: float) -> str:
        """
        Predice se il tiro entra nel canestro
        
        Args:
            trajectory: Traiettoria della palla
            basket_position: Posizione del canestro (x, y)
            shot_distance: Distanza dal canestro
            
        Returns:
            "MADE", "MISSED", o "BLOCKED"
        """
        if not trajectory or not trajectory.positions or len(trajectory.positions) < 2:
            return "UNKNOWN"
        
        try:
            # Estrai posizioni finali
            final_positions = trajectory.positions[-5:]  # Ultimi 5 frame
            
            # Calcola distanza media dal canestro negli ultimi frame
            distances_from_basket = []
            for pos in final_positions:
                dist = math.sqrt(
                    (pos[0] - basket_position[0])**2 +
                    (pos[1] - basket_position[1])**2
                )
                distances_from_basket.append(dist)
            
            avg_distance = np.mean(distances_from_basket)
            
            # Se la palla finisce molto vicina al canestro = canestro
            if avg_distance < self.BASKET_DIAMETER * 2:  # ~3 piedi
                # Controlla se la velocità finale è bassa (entra dolcemente)
                if trajectory.velocity is not None:
                    speed = np.linalg.norm(trajectory.velocity)
                    if speed < 20:  # ft/s
                        return "MADE"
            
            # Altrimenti è mancato
            return "MISSED"
        
        except Exception as e:
            logger.error(f"Error predicting shot result: {str(e)}")
            return "UNKNOWN"
    
    def classify_shot_type(self, trajectory: BallTrajectory, 
                          court_location: Tuple[float, float],
                          distance_from_basket: float) -> str:
        """
        Classifica il tipo di tiro
        
        Args:
            trajectory: Traiettoria della palla
            court_location: Posizione del giocatore sulla corte
            distance_from_basket: Distanza dal canestro
            
        Returns:
            "2PT", "3PT", "LAYUP", "DUNK", "FT"
        """
        if not trajectory:
            return "UNKNOWN"
        
        try:
            # Calcola altezza massima della palla
            if trajectory.positions and len(trajectory.positions) > 2:
                y_positions = [pos[1] for pos in trajectory.positions]
                max_height = min(y_positions)  # y decreases going up
                shot_arc = max(y_positions) - min(y_positions)
            else:
                return "UNKNOWN"
            
            # Classifica basato su distanza e altezza dell'arco
            if distance_from_basket < 3:
                # Vicino al canestro
                if shot_arc < 50:
                    return "LAYUP"
                else:
                    return "DUNK"
            elif distance_from_basket < 15:
                # Linea 3-punti standard NBA = 23.75 piedi
                return "2PT"
            elif distance_from_basket < 23.75:
                return "2PT"
            else:
                return "3PT"
        
        except Exception as e:
            logger.error(f"Error classifying shot type: {str(e)}")
            return "UNKNOWN"


class ShotDetector:
    """
    Detector principale che combina hand pose + ball tracking
    """
    
    def __init__(self, court_mapper=None):
        """
        Inizializza il detector di tiri
        
        Args:
            court_mapper: Court mapper per coordinate
        """
        self.hand_pose_detector = HandPoseDetector()
        self.ball_tracker = BallTracker(court_mapper)
        self.court_mapper = court_mapper
        
        # Buffer per l'analisi temporale
        self.hand_pose_buffer = []
        self.ball_detection_buffer = []
        self.buffer_size = 15  # 15 frame buffer
    
    def detect_shot(self, frame: np.ndarray, player_track_id: int,
                   ball_detections: List[Dict], fps: float,
                   frame_number: int) -> Optional[ShotDetectionResult]:
        """
        Rileva un evento di tiro usando hand pose + ball tracking
        
        Args:
            frame: Frame video
            player_track_id: ID tracciamento del giocatore
            ball_detections: Rilevamenti della palla (da Roboflow)
            fps: Frame per secondo
            frame_number: Numero del frame
            
        Returns:
            ShotDetectionResult se un tiro è rilevato
        """
        # Fase 1: Rileva posa della mano
        hand_pose, annotated_frame = self.hand_pose_detector.detect_hand_pose(frame)
        
        if hand_pose:
            hand_pose.frame_number = frame_number
            self.hand_pose_buffer.append(hand_pose)
            
            # Mantieni il buffer
            if len(self.hand_pose_buffer) > self.buffer_size:
                self.hand_pose_buffer.pop(0)
        
        # Aggiungi rilevamenti palla al buffer
        self.ball_detection_buffer.extend(ball_detections)
        if len(self.ball_detection_buffer) > self.buffer_size * 2:
            self.ball_detection_buffer = self.ball_detection_buffer[-self.buffer_size * 2:]
        
        # Fase 2: Analizza il movimento della mano
        if len(self.hand_pose_buffer) >= 5:
            motion_metrics = self.hand_pose_detector.calculate_shooting_motion(
                self.hand_pose_buffer
            )
            
            # Fase 3: Verifica se è un gesto di tiro
            if self.hand_pose_detector.is_shooting_motion(motion_metrics):
                
                # Fase 4: Traccia la traiettoria della palla
                ball_trajectory = self.ball_tracker.track_ball_trajectory(
                    self.ball_detection_buffer, fps
                )
                
                if ball_trajectory:
                    # Calcola coordinate sulla corte
                    court_location = None
                    distance = None
                    
                    if self.court_mapper and self.ball_detection_buffer:
                        try:
                            first_ball_pos = self.ball_detection_buffer[0].get('bbox', (0, 0, 0, 0))
                            x = (first_ball_pos[0] + first_ball_pos[2]) / 2
                            y = (first_ball_pos[1] + first_ball_pos[3]) / 2
                            court_location = self.court_mapper.frame_to_court((int(x), int(y)))
                            
                            # Distanza dal canestro (basket è a 25, 5.25 per home team)
                            if court_location:
                                distance = math.sqrt(
                                    (court_location[0] - 25)**2 +
                                    (court_location[1] - 5.25)**2
                                )
                        except Exception as e:
                            logger.warning(f"Could not map to court: {str(e)}")
                    
                    # Predici l'esito del tiro
                    basket_pos = (25, 52.5) if court_location else (None, None)
                    shot_result = self.ball_tracker.predict_shot_result(
                        ball_trajectory, basket_pos, distance or 20
                    )
                    
                    # Classifica il tipo di tiro
                    shot_type = self.ball_tracker.classify_shot_type(
                        ball_trajectory, court_location, distance or 20
                    )
                    
                    result = ShotDetectionResult(
                        is_shot=True,
                        shot_type=shot_type,
                        shot_result=shot_result,
                        frame_start=frame_number - len(self.hand_pose_buffer),
                        frame_end=frame_number,
                        shooting_player_track_id=player_track_id,
                        hand_pose=hand_pose,
                        ball_trajectory=ball_trajectory,
                        confidence=float(motion_metrics.get("peak_velocity", 0) / 50),  # Normalizza a 0-1
                        court_location=court_location,
                        distance_from_basket=distance
                    )
                    
                    logger.info(f"Shot detected - Type: {shot_type}, Result: {shot_result}, Distance: {distance:.1f}ft")
                    
                    # Pulisci i buffer
                    self.hand_pose_buffer.clear()
                    self.ball_detection_buffer.clear()
                    
                    return result
        
        return None


if __name__ == "__main__":
    print("Shot Detector Module - Import this in your main application")
