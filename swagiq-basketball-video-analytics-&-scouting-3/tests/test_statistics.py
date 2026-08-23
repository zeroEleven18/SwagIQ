"""
Tests for statistics_extractor module
"""

import pytest
from core.statistics_extractor import StatisticsExtractor, Shot, ShotOutcome, ShotType, PlayerStats


class TestStatisticsExtractor:
    """Test StatisticsExtractor class"""
    
    def test_initialization(self):
        """Test StatisticsExtractor initialization"""
        extractor = StatisticsExtractor(
            home_team="Home",
            away_team="Away"
        )
        assert extractor.home_team == "Home"
        assert extractor.away_team == "Away"
        assert len(extractor.shots) == 0
    
    def test_add_shot(self):
        """Test adding a shot"""
        extractor = StatisticsExtractor()
        
        shot = Shot(
            player_id=1,
            jersey_number=23,
            team="Home",
            shot_type=ShotType.TWO_POINTER,
            outcome=ShotOutcome.MADE,
            frame_number=100,
            coordinates=(50, 40),
            distance_feet=15.0
        )
        
        extractor.shots.append(shot)
        assert len(extractor.shots) == 1


class TestShot:
    """Test Shot data class"""
    
    def test_shot_creation(self):
        """Test creating a shot object"""
        shot = Shot(
            player_id=1,
            jersey_number=23,
            team="Home",
            shot_type=ShotType.THREE_POINTER,
            outcome=ShotOutcome.MADE,
            frame_number=150,
            coordinates=(30, 20),
            distance_feet=24.0
        )
        
        assert shot.player_id == 1
        assert shot.jersey_number == 23
        assert shot.outcome == ShotOutcome.MADE
        assert shot.distance_feet == 24.0
