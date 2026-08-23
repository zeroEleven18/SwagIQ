"""
Tests for report_generator module
"""

import pytest
from pathlib import Path
import tempfile
from export.report_generator import DataExporter, ReportGenerator


class TestDataExporter:
    """Test DataExporter class"""
    
    def test_initialization(self):
        """Test DataExporter initialization"""
        with tempfile.TemporaryDirectory() as tmpdir:
            exporter = DataExporter(Path(tmpdir))
            assert exporter.output_dir == Path(tmpdir)
    
    def test_export_to_json(self):
        """Test exporting to JSON"""
        with tempfile.TemporaryDirectory() as tmpdir:
            exporter = DataExporter(Path(tmpdir))
            
            test_data = {
                "game": "Test Game",
                "shots": 50
            }
            
            filepath = exporter.export_to_json(test_data, "test.json")
            assert filepath.exists()
            assert filepath.name == "test.json"
    
    def test_export_to_csv(self):
        """Test exporting to CSV"""
        with tempfile.TemporaryDirectory() as tmpdir:
            exporter = DataExporter(Path(tmpdir))
            
            test_data = [
                {"player_id": 1, "points": 25},
                {"player_id": 2, "points": 18}
            ]
            
            filepath = exporter.export_to_csv(test_data, "stats.csv")
            assert filepath.exists()
            assert filepath.name == "stats.csv"


class TestReportGenerator:
    """Test ReportGenerator class"""
    
    def test_initialization(self):
        """Test ReportGenerator initialization"""
        with tempfile.TemporaryDirectory() as tmpdir:
            generator = ReportGenerator(Path(tmpdir))
            assert generator.output_dir == Path(tmpdir)
