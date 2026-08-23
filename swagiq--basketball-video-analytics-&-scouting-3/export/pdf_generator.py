"""
SwagIQ - PDF Report Generator & Shot Chart Exporter
"""

import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PDFReportGenerator:
    """Generatore di report analitici in PDF per SwagIQ"""
    
    def __init__(self, output_dir: Path = Path("reports")):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    def export_summary_json(self, game_data: Dict, filename: str = "game_summary.json") -> Path:
        """Esporta il summary completo in formato JSON per la dashboard"""
        out_path = self.output_dir / filename
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(game_data, f, indent=2, ensure_ascii=False)
        logger.info(f"Summary JSON exported to {out_path}")
        return out_path
