# SwagIQ - Basketball Video Analytics & Scouting Platform

![SwagIQ Logo](https://img.shields.io/badge/SwagIQ-Basketball%20Analytics-blue)
![Python](https://img.shields.io/badge/Python-3.8%2B-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🏀 Overview

**SwagIQ** è una piattaforma avanzata di analisi video basket che utilizza **AI/ML** per:

✅ **Rilevamento automatico**:
- Giocatori, palla, canestro via Roboflow
- Posa della mano e gesto di tiro via MediaPipe
- Tracciamento giocatori via SAM 3

✅ **Riconoscimento**:
- Numero maglia via PaddleOCR
- Classificazione team

✅ **Analisi statistiche**:
- Rilevamento automatico tiri (2PT, 3PT, LAYUP, DUNK, FT)
- Esito tiro (MADE, MISSED, BLOCKED)
- Distanza dal canestro
- Statistiche per giocatore

✅ **Export**:
- Report PDF interattivi
- Dati JSON strutturati
- CSV per analisi

✅ **Web Dashboard**:
- Upload video
- Processing real-time con WebSocket
- Visualizzazione statistiche
- Download report

---

## 📦 Requisiti

- **Python 3.8+**
- **macOS/Linux/Windows**
- **GPU (consigliato)**:
  - NVIDIA CUDA 11.8+
  - Apple M1/M2 (Metal)
- **Storage**: ~10GB per modelli
- **RAM**: 16GB+ (32GB consigliato per GPU)

---

## 🚀 Quick Start

### 1. Clone & Setup

```bash
# Clone repository
git clone https://github.com/zeroEleven18/SwagIQ.git
cd SwagIQ

# Setup ambiente (auto-crea directories e installa dipendenze)
python setup.py
```

### 2. Configura Roboflow API

```bash
# Modifica .env con la tua API key
export ROBOFLOW_API_KEY="your_key_here"
```

Oppure copia direttamente in `config.yaml`:
```yaml
roboflow:
  api_key: "YOUR_API_KEY"
```

### 3. Avvia Dashboard

```bash
# Opzione 1: Script veloce
bash run.sh

# Opzione 2: Manuale
python dashboard.py
```

Dashboard disponibile su: **http://localhost:8000/dashboard**

### 4. Processa Video

```bash
# Via Web UI (consigliato):
# 1. Vai su http://localhost:8000/dashboard
# 2. Upload video
# 3. Inserisci squadre (Home Team / Away Team)
# 4. Click "Start Analysis"

# Via Python (CLI):
from main_pipeline import BasketballAnalyticsPipeline, PipelineConfig, DetectionSource

config = PipelineConfig(
    roboflow_api_key="YOUR_KEY",
    roboflow_project="basketball-players",
    roboflow_version=1,
    video_source="data/videos/clip1.mp4",
    source_type=DetectionSource.LOCAL_FILE,
)

pipeline = BasketballAnalyticsPipeline(config)
results = pipeline.run_complete_pipeline(
    home_team="Lakers",
    away_team="Celtics",
    home_players=[],
    away_players=[],
)
```

---

## 📂 Project Structure

```
SwagIQ/
├── swagiq-basketball-video-analytics-&-scouting-3/
│   ├── core/
│   │   ├── video_processor.py           # Video loading, Roboflow, SAM 3
│   │   ├── jersey_ocr.py                # PaddleOCR jersey recognition
│   │   ├── shot_detector.py             # Hand pose + ball tracking
│   │   ├── ball_detector_trainer.py     # Auto-labeling for Roboflow
│   │   └── statistics_extractor.py      # Stats calculation
│   ├── export/
│   │   └── report_generator.py          # PDF/JSON/CSV export
│   ├── config.yaml                      # Configurazione
│   ├── requirements.txt                 # Dipendenze
│   ├── setup.py                         # Setup script
│   ├── main_pipeline.py                 # Orchestrazione
│   └── dashboard.py                     # Web API + UI
├── data/
│   └── videos/                          # Video input
├── models/                              # Modelli scaricati
├── output/                              # Output report/stats
└── README.md                            # Questo file
```

---

## 🔧 Configurazione Avanzata

### config.yaml

```yaml
# Video source
video:
  source_type: local_file  # local_file, youtube, twitch, http_stream
  local_path: "data/videos/clip1.mp4"

# Roboflow configuration
roboflow:
  api_key: "YOUR_KEY"
  confidence_threshold: 0.5

# SAM 3 tracking
tracking:
  sam_model: "sam2_hiera_small"  # small, large, mobile_tiny
  min_track_confidence: 0.3

# Shot detection
shot_detection:
  buffer_size: 15
  min_velocity: 10

# Output
output:
  output_dir: "output"
  generate_pdf: true
  generate_json: true
```

---

## 📊 API Endpoints

### REST API

```bash
# Upload video
POST /api/upload
  - Form: file (video file)

# Create processing task
POST /api/create-task
  - Body: { home_team, away_team, home_players, away_players }

# Start processing
POST /api/process
  - Body: { task_id, video_filename, game_setup, confidence_threshold }

# List tasks
GET /api/tasks

# Get task details
GET /api/tasks/{task_id}

# Get statistics
GET /api/statistics/{task_id}

# Download file
GET /api/download/{task_id}/{file_type}
  - file_type: pdf, json, csv

# Health check
GET /health
```

### WebSocket

```javascript
// Real-time progress updates
ws://localhost:8000/ws/progress/{task_id}

// Message format:
{
  "task_id": "uuid",
  "status": "processing",
  "progress": 45.5,
  "error": null
}
```

---

## 🎯 Core Features Explained

### 1. Video Processing Pipeline

```
VIDEO
  ↓
[Roboflow Detection]
  ├─ Players
  ├─ Ball
  └─ Basket
  ↓
[SAM 3 Tracking]
  ├─ Player tracking
  └─ Unique IDs
  ↓
[Jersey OCR]
  ├─ Jersey numbers
  └─ Team classification
  ↓
[Shot Detection (Hybrid)]
  ├─ Hand pose (MediaPipe)
  ├─ Ball trajectory
  └─ Shot classification
  ↓
[Statistics Extraction]
  ├─ Player stats
  ├─ Team stats
  └─ Game summary
  ↓
[Export]
  ├─ PDF report
  ├─ JSON data
  └─ CSV analytics
```

### 2. Shot Detection Algorithm

**Approccio Ibrido**:

```python
HAND POSE DETECTION
  ├─ Rileva movimento braccia via MediaPipe Pose
  ├─ Calcola velocità verticale (jump + shooting motion)
  ├─ Analizza estensione braccio
  └─ Identifica rilascio palla
    ↓
    [Confidence Score]
    ↓
BALL TRAJECTORY TRACKING
  ├─ Traccia posizione palla con Roboflow
  ├─ Calcola velocità e accelerazione
  ├─ Analizza traiettoria
  └─ Predice esito (MADE/MISSED/BLOCKED)
    ↓
    [Shot Classification]
    ├─ Distance from basket
    ├─ Shot arc height
    └─ Type: 2PT/3PT/LAYUP/DUNK/FT
```

### 3. Jersey Number Recognition

```python
Extract region around player
    ↓
[PaddleOCR]
    ├─ Text detection
    ├─ Character recognition
    └─ Jersey number extraction
    ↓
[Team Classification]
    ├─ Color analysis
    ├─ Jersey uniform matching
    └─ Home/Away team assignment
```

---

## 📈 Output Examples

### Statistiche JSON

```json
{
  "game_summary": {
    "home_team": "Lakers",
    "away_team": "Celtics",
    "duration": 2400,
    "total_shots": 45
  },
  "home_team_stats": {
    "team": "Lakers",
    "total_shots": 24,
    "made_shots": 12,
    "field_goal_percentage": 0.500,
    "three_pointers_made": 4,
    "players": [
      {
        "player_id": 1,
        "jersey_number": 23,
        "shots": 8,
        "made": 5,
        "points": 12
      }
    ]
  }
}
```

### PDF Report

- Sommario partita
- Statistiche per giocatore
- Grafici performance
- Shot chart
- Timeline degli eventi

---

## 🤖 AI Models Used

| Modello | Uso | Dimensione | Latenza |
|---------|-----|-----------|---------|
| **Roboflow (YOLOv8)** | Player/Ball/Basket detection | ~150MB | 30-50ms |
| **SAM 3** | Player tracking | 2.4GB | 500-1000ms |
| **MediaPipe Pose** | Hand pose detection | ~45MB | 20-30ms |
| **PaddleOCR** | Jersey recognition | ~200MB | 100-200ms |

---

## ⚙️ Performance Tips

### Per MacBook Pro M1:

```bash
# Usa small SAM model
tracking:
  sam_model: "sam2_hiera_small"

# Riduci risoluzione video
video:
  resize_factor: 0.75

# Aumenta frame sampling
video:
  frame_sample_rate: 2  # Process every 2nd frame
```

### Per GPU NVIDIA:

```bash
# Usa large SAM model
tracking:
  sam_model: "sam2_hiera_large"

# Batch processing
performance:
  batch_size: 4

# Abilita CUDA
export CUDA_VISIBLE_DEVICES=0
```

---

## 🐛 Troubleshooting

### Errore: "Roboflow API key not found"
```bash
# Soluzione:
export ROBOFLOW_API_KEY="your_key"
# o modifica config.yaml
```

### Errore: "CUDA out of memory"
```bash
# Soluzione 1: Usa small SAM
tracking:
  sam_model: "sam2_hiera_small"

# Soluzione 2: Riduci batch size
performance:
  batch_size: 1

# Soluzione 3: Riduci video resolution
video:
  resize_factor: 0.5
```

### Errore: "MediaPipe not installed"
```bash
pip install -r requirements.txt
```

### Video non viene processato
```bash
# Verifica:
1. Video in data/videos/
2. Format supportato (MP4, AVI, MOV)
3. Roboflow API key configurato
4. GPU memoria sufficiente
```

---

## 📚 Advanced Usage

### Usare video da YouTube

```python
config = PipelineConfig(
    video_source="https://www.youtube.com/watch?v=...",
    source_type=DetectionSource.YOUTUBE,
)
```

### Usare stream da Twitch

```python
config = PipelineConfig(
    video_source="https://twitch.tv/...",
    source_type=DetectionSource.TWITCH,
)
```

### Training personalizzato Roboflow

```python
from core.ball_detector_trainer import BallDetectorTrainer

trainer = BallDetectorTrainer(output_dir="datasets/ball")
trainer.process_video_and_generate_dataset(
    "data/videos/clip1.mp4",
    sample_rate=5,
    max_frames=500
)

# Carica su Roboflow
trainer.create_roboflow_yaml()
```

---

## 🔐 Privacy & Data

- Tutti i dati rimangono in locale
- Opzionale: carica solo su Roboflow se necessario
- Video processato non salvato per default
- Solo statistiche aggregate esportate

---

## 📝 License

MIT License - Vedi LICENSE file

---

## 🤝 Contributing

Contribuzioni benvenute! Apri una pull request con:

1. Descrizione cambiamenti
2. Test inclusi
3. Update documentazione

---

## 📞 Support

- **Issues**: https://github.com/zeroEleven18/SwagIQ/issues
- **Discussions**: https://github.com/zeroEleven18/SwagIQ/discussions
- **Documentation**: https://github.com/zeroEleven18/SwagIQ/wiki

---

## 🙏 Acknowledgments

- Roboflow per YOLO detection
- Meta per SAM 3
- Google per MediaPipe
- PaddlePaddle per OCR

---

## 📊 Roadmap

- [ ] Real-time streaming analytics
- [ ] AI referee (foul detection)
- [ ] Advanced heat maps
- [ ] Comparison between games
- [ ] Mobile app
- [ ] Cloud deployment

---

**Made with ❤️ by SwagIQ Team**
