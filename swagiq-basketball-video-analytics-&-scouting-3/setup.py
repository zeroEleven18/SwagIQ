"""
SwagIQ Setup Script
Installation and configuration script for the basketball analytics platform
"""

import os
import sys
from pathlib import Path
import yaml
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def check_python_version():
    """Verifica la versione di Python"""
    if sys.version_info < (3, 8):
        logger.error("Python 3.8+ required")
        sys.exit(1)
    logger.info(f"✓ Python {sys.version.split()[0]} OK")


def check_dependencies():
    """Verifica le dipendenze installate"""
    required_packages = [
        "cv2",
        "numpy",
        "torch",
        "mediapipe",
        "fastapi",
        "yaml"
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package)
            logger.info(f"✓ {package} installed")
        except ImportError:
            missing.append(package)
            logger.warning(f"✗ {package} NOT installed")
    
    if missing:
        logger.error(f"Missing packages: {', '.join(missing)}")
        logger.info("Run: pip install -r requirements.txt")
        return False
    
    return True


def create_directory_structure():
    """Crea la struttura di directory necessaria"""
    directories = [
        "data/videos",
        "data/images",
        "output/reports",
        "output/exports",
        "output/annotated_videos",
        "models",
        "datasets/ball_detection/images",
        "datasets/ball_detection/labels",
        "debug_output"
    ]
    
    for dir_path in directories:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        logger.info(f"✓ Created directory: {dir_path}")


def load_config(config_path: str = "config.yaml") -> dict:
    """Carica il file di configurazione"""
    if not Path(config_path).exists():
        logger.error(f"Config file not found: {config_path}")
        return None
    
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    logger.info(f"✓ Loaded config from {config_path}")
    return config


def setup_roboflow_api():
    """Configura l'API di Roboflow"""
    logger.info("\n" + "="*60)
    logger.info("ROBOFLOW API SETUP")
    logger.info("="*60)
    
    api_key = input("Enter your Roboflow API Key (or press Enter to skip): ").strip()
    
    if api_key:
        # Salva in .env file
        with open('.env', 'a') as f:
            f.write(f"\nROBOFLOW_API_KEY={api_key}\n")
        logger.info("✓ Roboflow API key saved to .env")
    else:
        logger.warning("⚠ Roboflow API key not set. You'll need to configure it later.")


def download_models():
    """Scarica i modelli necessari"""
    logger.info("\n" + "="*60)
    logger.info("DOWNLOADING MODELS")
    logger.info("="*60)
    
    try:
        import torch
        from segment_anything import sam_model_registry
        
        logger.info("Downloading SAM 3 model...")
        # SAM 3 verrà scaricato automaticamente al primo utilizzo
        logger.info("✓ SAM 3 model will be downloaded on first use")
        
        logger.info("Downloading MediaPipe model...")
        import mediapipe as mp
        # MediaPipe models vengono scaricati automaticamente
        logger.info("✓ MediaPipe models will be downloaded on first use")
        
    except Exception as e:
        logger.error(f"Error downloading models: {str(e)}")


def test_installation():
    """Testa l'installazione"""
    logger.info("\n" + "="*60)
    logger.info("TESTING INSTALLATION")
    logger.info("="*60)
    
    try:
        import cv2
        logger.info(f"✓ OpenCV {cv2.__version__}")
        
        import numpy as np
        logger.info(f"✓ NumPy {np.__version__}")
        
        import torch
        logger.info(f"✓ PyTorch {torch.__version__}")
        
        import mediapipe as mp
        logger.info(f"✓ MediaPipe loaded")
        
        import fastapi
        logger.info(f"✓ FastAPI {fastapi.__version__}")
        
        logger.info("\n✓ All core dependencies OK!")
        return True
        
    except Exception as e:
        logger.error(f"✗ Installation test failed: {str(e)}")
        return False


def create_env_file():
    """Crea il file .env"""
    env_content = """# SwagIQ Environment Variables

# Roboflow Configuration
ROBOFLOW_API_KEY=your_api_key_here

# Model Configuration
TORCH_HOME=./models
MEDIAPIPE_CACHE=./models/mediapipe

# Logging
LOG_LEVEL=INFO

# GPU Configuration
CUDA_VISIBLE_DEVICES=0
USE_GPU=true
"""
    
    if not Path('.env').exists():
        with open('.env', 'w') as f:
            f.write(env_content)
        logger.info("✓ Created .env file")
    else:
        logger.info("⚠ .env file already exists")


def main():
    """Funzione principale di setup"""
    logger.info("\n" + "="*60)
    logger.info("SwagIQ Basketball Analytics - Setup")
    logger.info("="*60 + "\n")
    
    # Step 1: Verifica Python
    logger.info("Step 1: Checking Python version...")
    check_python_version()
    
    # Step 2: Verifica dipendenze
    logger.info("\nStep 2: Checking dependencies...")
    deps_ok = check_dependencies()
    if not deps_ok:
        logger.error("Please install missing dependencies first")
        sys.exit(1)
    
    # Step 3: Crea struttura directory
    logger.info("\nStep 3: Creating directory structure...")
    create_directory_structure()
    
    # Step 4: Crea .env file
    logger.info("\nStep 4: Setting up environment...")
    create_env_file()
    
    # Step 5: Setup Roboflow
    logger.info("\nStep 5: Configuring Roboflow API...")
    setup_roboflow_api()
    
    # Step 6: Scarica modelli
    logger.info("\nStep 6: Preparing models...")
    download_models()
    
    # Step 7: Test installazione
    logger.info("\nStep 7: Testing installation...")
    test_ok = test_installation()
    
    if test_ok:
        logger.info("\n" + "="*60)
        logger.info("✓ SETUP COMPLETED SUCCESSFULLY!")
        logger.info("="*60)
        logger.info("\nNext steps:")
        logger.info("1. Edit config.yaml with your settings")
        logger.info("2. Place your video in data/videos/")
        logger.info("3. Run: python main_pipeline.py")
        logger.info("\nFor more info, see README.md")
    else:
        logger.error("\n" + "="*60)
        logger.error("✗ SETUP FAILED")
        logger.error("="*60)
        sys.exit(1)


if __name__ == "__main__":
    main()
