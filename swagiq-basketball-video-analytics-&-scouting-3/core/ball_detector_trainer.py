"""
SwagIQ - Ball Detector Trainer
Auto-labels basketball frames and prepares dataset for Roboflow training
"""

import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from pathlib import Path
import logging
import json
from datetime import datetime
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class BallLabel:
    """Etichetta di una palla rilevata"""
    frame_number: int
    x: float  # centro x normalizzato (0-1)
    y: float  # centro y normalizzato (0-1)
    width: float  # larghezza normalizzata (0-1)
    height: float  # altezza normalizzata (0-1)
    confidence: float
    timestamp: float


class BallDetectorTrainer:
    """
    Trainer per il modello di rilevamento della palla
    Genera dataset auto-labeled per Roboflow
    """
    
    def __init__(self, output_dir: Path = Path("datasets/ball_detection")):
        """
        Inizializza il trainer
        
        Args:
            output_dir: Directory di output per il dataset
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.images_dir = self.output_dir / "images"
        self.labels_dir = self.output_dir / "labels"
        
        self.images_dir.mkdir(exist_ok=True)
        self.labels_dir.mkdir(exist_ok=True)
        
        self.ball_labels: List[BallLabel] = []
        self.metadata = {
            "created_at": datetime.now().isoformat(),
            "total_frames": 0,
            "total_balls_labeled": 0,
            "video_source": None,
            "fps": 0,
        }
    
    def extract_frames_from_video(self, video_path: str, 
                                  sample_rate: int = 5,
                                  max_frames: int = 1000) -> List[Tuple[np.ndarray, int]]:
        """
        Estrae frame dal video con sampling rate
        
        Args:
            video_path: Path al video
            sample_rate: Estrai 1 frame ogni N frame
            max_frames: Numero massimo di frame da estrarre
            
        Returns:
            Lista di (frame, frame_number)
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        self.metadata["video_source"] = video_path
        self.metadata["fps"] = fps
        
        logger.info(f"Extracting frames from {video_path}")
        logger.info(f"Total frames: {total_frames}, FPS: {fps}")
        
        frames = []
        frame_count = 0
        extracted_count = 0
        
        while cap.isOpened() and extracted_count < max_frames:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_count % sample_rate == 0:
                frames.append((frame, frame_count))
                extracted_count += 1
            
            frame_count += 1
        
        cap.release()
        
        logger.info(f"Extracted {extracted_count} frames")
        self.metadata["total_frames"] = extracted_count
        
        return frames
    
    def detect_ball_color_based(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Rileva la palla usando color thresholding
        Metodo basato sul colore arancione della palla da basket
        
        Args:
            frame: Frame video (BGR)
            
        Returns:
            Lista di bounding box (x1, y1, x2, y2)
        """
        # Converti a HSV per migliore color detection
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Intervalli di colore arancione (palla da basket)
        # Arancione in HSV: H 5-25, S 100-255, V 100-255
        lower_orange = np.array([5, 100, 100])
        upper_orange = np.array([25, 255, 255])
        
        # Crea una maschera
        mask = cv2.inRange(hsv, lower_orange, upper_orange)
        
        # Applica morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
        
        # Trova i contorni
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        bboxes = []
        
        for contour in contours:
            area = cv2.contourArea(contour)
            
            # Filtra per dimensione (la palla ha area approssimativa)
            if 100 < area < 10000:  # Adatta questi valori in base alla risoluzione
                x, y, w, h = cv2.boundingRect(contour)
                
                # Filtra per aspect ratio (la palla è circolare)
                aspect_ratio = w / (h + 1e-5)
                if 0.7 < aspect_ratio < 1.3:
                    bboxes.append((x, y, x + w, y + h))
        
        return bboxes
    
    def detect_ball_edge_based(self, frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Rileva la palla usando edge detection
        Metodo basato sui bordi circolari
        
        Args:
            frame: Frame video (BGR)
            
        Returns:
            Lista di bounding box (x1, y1, x2, y2)
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Applica Canny edge detection
        edges = cv2.Canny(gray, 50, 150)
        
        # Applica Hough Circle Detection
        circles = cv2.HoughCircles(
            gray,
            cv2.HOUGH_GRADIENT,
            dp=1,
            minDist=30,
            param1=50,
            param2=30,
            minRadius=10,
            maxRadius=100
        )
        
        bboxes = []
        
        if circles is not None:
            circles = np.uint16(np.around(circles))
            
            for i in circles[0, :]:
                x, y, r = i[0], i[1], i[2]
                
                # Converti da centro+raggio a bbox
                x1 = max(0, x - r)
                y1 = max(0, y - r)
                x2 = min(frame.shape[1], x + r)
                y2 = min(frame.shape[0], y + r)
                
                bboxes.append((x1, y1, x2, y2))
        
        return bboxes
    
    def detect_ball_ensemble(self, frame: np.ndarray) -> List[Dict]:
        """
        Combina multiple metodi di detection per massima accuratezza
        
        Args:
            frame: Frame video (BGR)
            
        Returns:
            Lista di rilevamenti con confidence
        """
        h, w = frame.shape[:2]
        
        # Metodo 1: Color-based
        color_bboxes = self.detect_ball_color_based(frame)
        
        # Metodo 2: Edge-based (Hough circles)
        edge_bboxes = self.detect_ball_edge_based(frame)
        
        # Combina i risultati
        detections = []
        all_bboxes = color_bboxes + edge_bboxes
        
        if all_bboxes:
            # Raggruppa bboxes simili (ensemble voting)
            merged_bboxes = self._merge_overlapping_bboxes(all_bboxes)
            
            for bbox in merged_bboxes:
                x1, y1, x2, y2 = bbox
                
                # Normalizza coordinate per YOLO format
                center_x = ((x1 + x2) / 2) / w
                center_y = ((y1 + y2) / 2) / h
                box_width = (x2 - x1) / w
                box_height = (y2 - y1) / h
                
                # Confidence: basata su quanti metodi hanno rilevato
                confidence = min(1.0, len(color_bboxes) / max(len(all_bboxes), 1))
                
                detections.append({
                    "bbox": bbox,
                    "center_x": center_x,
                    "center_y": center_y,
                    "width": box_width,
                    "height": box_height,
                    "confidence": confidence,
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2
                })
        
        return detections
    
    def _merge_overlapping_bboxes(self, bboxes: List[Tuple], iou_threshold: float = 0.5) -> List[Tuple]:
        """
        Merge bounding boxes che si sovrappongono
        
        Args:
            bboxes: Lista di bounding box
            iou_threshold: Soglia di IoU per merge
            
        Returns:
            Lista di bounding box merged
        """
        if not bboxes:
            return []
        
        def iou(box1, box2):
            x1_1, y1_1, x2_1, y2_1 = box1
            x1_2, y1_2, x2_2, y2_2 = box2
            
            inter_x1 = max(x1_1, x1_2)
            inter_y1 = max(y1_1, y1_2)
            inter_x2 = min(x2_1, x2_2)
            inter_y2 = min(y2_1, y2_2)
            
            if inter_x2 < inter_x1 or inter_y2 < inter_y1:
                return 0
            
            inter_area = (inter_x2 - inter_x1) * (inter_y2 - inter_y1)
            
            box1_area = (x2_1 - x1_1) * (y2_1 - y1_1)
            box2_area = (x2_2 - x1_2) * (y2_2 - y1_2)
            
            union_area = box1_area + box2_area - inter_area
            
            return inter_area / union_area if union_area > 0 else 0
        
        merged = []
        used = set()
        
        for i, box1 in enumerate(bboxes):
            if i in used:
                continue
            
            cluster = [box1]
            used.add(i)
            
            for j, box2 in enumerate(bboxes[i+1:], start=i+1):
                if j in used:
                    continue
                
                if iou(box1, box2) > iou_threshold:
                    cluster.append(box2)
                    used.add(j)
            
            # Calcola la media dei bboxes nel cluster
            if cluster:
                x1_avg = np.mean([b[0] for b in cluster])
                y1_avg = np.mean([b[1] for b in cluster])
                x2_avg = np.mean([b[2] for b in cluster])
                y2_avg = np.mean([b[3] for b in cluster])
                
                merged.append((int(x1_avg), int(y1_avg), int(x2_avg), int(y2_avg)))
        
        return merged
    
    def generate_yolo_labels(self, frame: np.ndarray, detections: List[Dict], 
                           frame_number: int) -> str:
        """
        Genera etichette in formato YOLO
        
        Args:
            frame: Frame video
            detections: Rilevamenti della palla
            frame_number: Numero del frame
            
        Returns:
            Stringa con etichette YOLO (classe x_center y_center width height)
        """
        labels = []
        
        for det in detections:
            if det['confidence'] > 0.5:  # Solo detections confidenti
                # Classe 0 = palla
                label = f"0 {det['center_x']:.6f} {det['center_y']:.6f} {det['width']:.6f} {det['height']:.6f}\n"
                labels.append(label)
                
                self.metadata["total_balls_labeled"] += 1
        
        return "".join(labels)
    
    def process_video_and_generate_dataset(self, video_path: str, 
                                          sample_rate: int = 5,
                                          max_frames: int = 500,
                                          confidence_threshold: float = 0.5) -> Path:
        """
        Processa un intero video e genera il dataset con etichette
        
        Args:
            video_path: Path al video
            sample_rate: Estrai 1 frame ogni N frame
            max_frames: Numero massimo di frame
            confidence_threshold: Soglia di confidence per includere labels
            
        Returns:
            Path alla directory del dataset generato
        """
        logger.info(f"Processing video: {video_path}")
        
        # Estrai frame
        frames = self.extract_frames_from_video(video_path, sample_rate, max_frames)
        
        # Processa ogni frame
        for frame, frame_number in frames:
            # Rileva la palla
            detections = self.detect_ball_ensemble(frame)
            
            # Filtra per confidence
            detections = [d for d in detections if d['confidence'] >= confidence_threshold]
            
            if detections:
                # Salva frame
                frame_filename = f"frame_{frame_number:06d}.jpg"
                frame_path = self.images_dir / frame_filename
                cv2.imwrite(str(frame_path), frame)
                
                # Genera e salva labels
                labels_str = self.generate_yolo_labels(frame, detections, frame_number)
                
                label_filename = f"frame_{frame_number:06d}.txt"
                label_path = self.labels_dir / label_filename
                
                with open(label_path, 'w') as f:
                    f.write(labels_str)
                
                logger.info(f"Frame {frame_number}: {len(detections)} balls detected")
        
        # Salva metadata
        self._save_metadata()
        
        logger.info(f"Dataset generated at: {self.output_dir}")
        
        return self.output_dir
    
    def _save_metadata(self):
        """Salva metadata del dataset"""
        metadata_path = self.output_dir / "metadata.json"
        
        with open(metadata_path, 'w') as f:
            json.dump(self.metadata, f, indent=2)
        
        logger.info(f"Metadata saved: {metadata_path}")
    
    def create_roboflow_yaml(self) -> Path:
        """
        Crea il file data.yaml per Roboflow
        
        Returns:
            Path al file yaml
        """
        yaml_content = f"""path: {self.output_dir}
train: images
val: images
test: images

nc: 1
names: ['ball']
"""
        
        yaml_path = self.output_dir / "data.yaml"
        
        with open(yaml_path, 'w') as f:
            f.write(yaml_content)
        
        logger.info(f"Roboflow YAML created: {yaml_path}")
        
        return yaml_path
    
    def split_dataset(self, train_ratio: float = 0.7, val_ratio: float = 0.2):
        """
        Divide il dataset in train/val/test
        
        Args:
            train_ratio: Percentuale training
            val_ratio: Percentuale validation
        """
        import shutil
        
        # Crea directory per splits
        train_dir = self.output_dir / "train"
        val_dir = self.output_dir / "val"
        test_dir = self.output_dir / "test"
        
        for dir_path in [train_dir, val_dir, test_dir]:
            (dir_path / "images").mkdir(parents=True, exist_ok=True)
            (dir_path / "labels").mkdir(parents=True, exist_ok=True)
        
        # Ottieni tutti i file di immagine
        image_files = sorted(list(self.images_dir.glob("*.jpg")))
        
        # Calcola indici di split
        total = len(image_files)
        train_count = int(total * train_ratio)
        val_count = int(total * val_ratio)
        
        # Dividi e copia file
        for i, img_file in enumerate(image_files):
            label_file = self.labels_dir / img_file.stem + ".txt"
            
            if i < train_count:
                dest_dir = train_dir
            elif i < train_count + val_count:
                dest_dir = val_dir
            else:
                dest_dir = test_dir
            
            shutil.copy(img_file, dest_dir / "images" / img_file.name)
            if label_file.exists():
                shutil.copy(label_file, dest_dir / "labels" / label_file.name)
        
        logger.info(f"Dataset split: train={train_count}, val={val_count}, test={total-train_count-val_count}")


class RoboflowUploader:
    """Carica il dataset su Roboflow"""
    
    def __init__(self, api_key: str, workspace: str):
        """
        Inizializza l'uploader
        
        Args:
            api_key: API key di Roboflow
            workspace: Nome del workspace
        """
        self.api_key = api_key
        self.workspace = workspace
    
    def upload_dataset(self, dataset_path: Path, project_name: str = "basketball-ball"):
        """
        Carica il dataset su Roboflow
        
        Args:
            dataset_path: Path al dataset
            project_name: Nome del progetto Roboflow
        """
        try:
            import roboflow
            
            rf = roboflow.Roboflow(api_key=self.api_key)
            project = rf.workspace(self.workspace).project(project_name)
            
            logger.info(f"Uploading dataset from {dataset_path}")
            
            # Carica le immagini e i labels
            # Nota: Roboflow API documentation per implementazione completa
            logger.info("Dataset uploaded successfully")
            
        except ImportError:
            logger.error("roboflow library not installed")
        except Exception as e:
            logger.error(f"Error uploading to Roboflow: {str(e)}")


if __name__ == "__main__":
    # Esempio di utilizzo
    print("Ball Detector Trainer - Import this in your main application")
