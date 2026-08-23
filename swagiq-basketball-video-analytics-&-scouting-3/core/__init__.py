"""SwagIQ Core Module"""

from .video_processor import (
    VideoLoader,
    RoboflowDetector,
    SAMTracker,
    CourtMapper,
    VideoProcessor,
    Detection,
    DetectionSource
)

from .jersey_ocr import (
    JerseyNumberOCR,
    TeamClassifier,
    PlayerIdentifier,
    PlayerIdentification
)

from .shot_detector import (
    ShotDetector,
    ShotDetection
)

from .statistics_extractor import (
    StatisticsExtractor,
    Shot,
    PlayerStats,
    TeamStats,
    GameSummary,
    ShotOutcome,
    ShotType
)

__all__ = [
    'VideoLoader',
    'RoboflowDetector',
    'SAMTracker',
    'CourtMapper',
    'VideoProcessor',
    'Detection',
    'DetectionSource',
    'JerseyNumberOCR',
    'TeamClassifier',
    'PlayerIdentifier',
    'PlayerIdentification',
    'ShotDetector',
    'ShotDetection',
    'StatisticsExtractor',
    'Shot',
    'PlayerStats',
    'TeamStats',
    'GameSummary',
    'ShotOutcome',
    'ShotType'
]
