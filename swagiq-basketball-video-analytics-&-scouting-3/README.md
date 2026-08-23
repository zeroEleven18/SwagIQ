# SwagIQ - Basketball Video Analytics & Scouting Platform

Advanced AI-powered basketball video analysis system using computer vision, object detection, and shot tracking.

## 🎯 Features

- **🎥 Video Processing**: Load and process basketball videos from multiple sources (local files, YouTube, Twitch, HTTP streams)
- **🏀 Player Detection**: Real-time player detection using Roboflow's YOLOv8 models
- **👕 Jersey Recognition**: Automatic jersey number detection using PaddleOCR
- **👤 Player Tracking**: Advanced tracking using SAM 3 (Segment Anything Model)
- **🎯 Shot Detection**: AI-powered basketball shot detection and classification
- **📊 Statistics Generation**: Comprehensive player and team statistics
- **📈 Court Mapping**: 3D court positioning and shot distance calculation
- **📋 Report Generation**: PDF, JSON, and CSV exports with visualizations

## 🏗️ Architecture

```
SwagIQ/
├── core/                      # Core processing modules
│   ├── video_processor.py     # Video loading and frame processing
│   ├── jersey_ocr.py          # Jersey number recognition
│   ├── shot_detector.py       # Shot detection and classification
│   └── statistics_extractor.py # Stats calculation
├── export/                    # Output generation
│   └── report_generator.py    # PDF/JSON/CSV reports
├── config.yaml                # Configuration file
├── main_pipeline.py           # Main orchestrator
├── requirements.txt           # Python dependencies
└── setup.py                   # Package setup script
```

## 📦 Installation

### Prerequisites
- Python 3.9+
- CUDA 11.8+ (for GPU acceleration, optional but recommended)
- FFmpeg (for video processing)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/zeroEleven18/SwagIQ.git
cd SwagIQ
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure the system**
Edit `config.yaml` with your settings:
```yaml
roboflow:
  api_key: "YOUR_ROBOFLOW_API_KEY"
  
game:
  home_team: "Team A"
  away_team: "Team B"
```

## 🚀 Usage

### Command Line

```bash
python main_pipeline.py path/to/video.mp4
```

### With options

```bash
python main_pipeline.py path/to/video.mp4 \
  --config config.yaml \
  --source-type local_file
```

### Supported source types:
- `local_file` - Local video file (default)
- `youtube` - YouTube URL
- `twitch` - Twitch stream
- `http_stream` - HTTP video stream

### Python API

```python
from main_pipeline import SwagIQPipeline

# Initialize pipeline
pipeline = SwagIQPipeline("config.yaml")

# Process video
results = pipeline.run("path/to/video.mp4", source_type="local_file")

# Access results
print(f"Total Shots: {results['total_shots']}")
print(f"Top Scorer: #{results['top_performers'][0]['jersey_number']}")
```

## ⚙️ Configuration

Edit `config.yaml` to customize:

### Video Processing
```yaml
video:
  source_type: local_file
  resize_factor: 1.0  # 0.5 for 50% resolution (faster)
  frame_sample_rate: 1  # Process every nth frame
```

### Performance
```yaml
performance:
  batch_size: 1
  num_workers: 2
  use_gpu: true
  max_memory_gb: 8
```

### Output
```yaml
output:
  output_dir: "output"
  generate_pdf: true
  generate_json: true
  generate_csv: true
```

## 📊 Output

After processing, SwagIQ generates:

- **game_summary.json** - Complete game statistics in JSON format
- **game_report.pdf** - Professional PDF report with visualizations
- **player_statistics.csv** - Player stats in CSV format
- **shot_chart_data.json** - Shot locations for visualization

## 🔧 Development

### Running Tests
```bash
pytest tests/
```

### Code Quality
```bash
black . --check
flake8 .
mypy .
```

### Install development dependencies
```bash
pip install -e ".[dev]"
```

## 📚 Model Information

### Roboflow YOLOv8
- **Project**: basketball-players
- **Purpose**: Real-time player detection
- **Confidence**: Adjustable via config.yaml

### SAM 3 (Segment Anything Model)
- **Model**: sam2_hiera_small (fastest) or sam2_hiera_large (accurate)
- **Purpose**: Advanced tracking and segmentation
- **Size**: ~250MB

### PaddleOCR
- **Purpose**: Jersey number recognition
- **Languages**: English (expandable)
- **Confidence**: Configurable threshold

## 🐛 Troubleshooting

### GPU not detected
```bash
# Check CUDA installation
python -c "import torch; print(torch.cuda.is_available())"

# Install CPU-only version
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### Memory issues
Reduce in `config.yaml`:
```yaml
performance:
  batch_size: 1
  use_gpu: false
```

### Missing API key
Set in `config.yaml` or environment:
```bash
export ROBOFLOW_API_KEY="your_key_here"
```

## 📈 Performance Benchmarks

On RTX 3090 (1080p video):
- Frame processing: ~30 FPS
- Full game (48min): ~5-10 minutes
- Memory usage: 4-8GB

On CPU:
- Frame processing: ~2-3 FPS
- Full game (48min): ~60-90 minutes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👨‍💻 Author

**Gio** - [@zeroEleven18](https://github.com/zeroEleven18)

## 🙏 Acknowledgments

- Roboflow for YOLOv8 models and infrastructure
- Meta for SAM (Segment Anything Model)
- PaddlePaddle team for PaddleOCR
- OpenCV community for computer vision tools

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review configuration examples

## 🗺️ Roadmap

- [ ] Real-time web dashboard
- [ ] Multi-angle analysis
- [ ] Advanced analytics (player heatmaps, efficiency)
- [ ] Integration with NBA/FIBA APIs
- [ ] Mobile app
- [ ] Cloud deployment
- [ ] API endpoints for third-party integration

---

**Made with ❤️ for basketball enthusiasts and analysts**
