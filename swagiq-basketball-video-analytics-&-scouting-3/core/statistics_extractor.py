"""
SwagIQ Statistics Extractor
Extracts and calculates basketball statistics from processed video data
"""

import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field, asdict
from enum import Enum
import logging
from collections import defaultdict

logger = logging.getLogger(__name__)


class ShotOutcome(Enum):
    """Esito di un tiro"""
    MADE = "MADE"
    MISSED = "MISSED"
    BLOCKED = "BLOCKED"
    UNKNOWN = "UNKNOWN"


class ShotType(Enum):
    """Tipo di tiro"""
    LAYUP = "LAYUP"
    DUNK = "DUNK"
    TWO_POINTER = "2PT"
    THREE_POINTER = "3PT"
    FREE_THROW = "FT"
    UNKNOWN = "UNKNOWN"


@dataclass
class Shot:
    """Rappresenta un tiro"""
    frame: int
    timestamp: float
    player_id: int
    jersey_number: Optional[int]
    team: Optional[str]
    shot_type: ShotType
    outcome: ShotOutcome
    distance: float  # feet
    court_zone: str
    confidence: float
    ball_trajectory: List[Tuple[float, float]] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        """Converti a dizionario"""
        data = asdict(self)
        data['shot_type'] = self.shot_type.value
        data['outcome'] = self.outcome.value
        return data


@dataclass
class PlayerStats:
    """Statistiche di un giocatore"""
    player_id: int
    jersey_number: Optional[int]
    team: Optional[str]
    
    # Conteggi
    total_shots: int = 0
    made_shots: int = 0
    missed_shots: int = 0
    blocked_shots: int = 0
    
    # Per tipo di tiro
    layups: int = 0
    layups_made: int = 0
    dunks: int = 0
    dunks_made: int = 0
    two_pointers: int = 0
    two_pointers_made: int = 0
    three_pointers: int = 0
    three_pointers_made: int = 0
    free_throws: int = 0
    free_throws_made: int = 0
    
    # Statistiche aggregate
    points: int = 0
    field_goal_percentage: float = 0.0
    two_point_percentage: float = 0.0
    three_point_percentage: float = 0.0
    free_throw_percentage: float = 0.0
    
    # Per zona
    paint_shots: int = 0
    paint_made: int = 0
    mid_range_shots: int = 0
    mid_range_made: int = 0
    corner_three_shots: int = 0
    corner_three_made: int = 0
    wing_three_shots: int = 0
    wing_three_made: int = 0
    
    shots_by_zone: Dict[str, Dict] = field(default_factory=dict)
    
    def to_dict(self) -> Dict:
        """Converti a dizionario"""
        return asdict(self)


@dataclass
class TeamStats:
    """Statistiche di una squadra"""
    team_name: str
    
    # Conteggi
    total_shots: int = 0
    made_shots: int = 0
    missed_shots: int = 0
    blocked_shots: int = 0
    
    # Per tipo
    layups: int = 0
    layups_made: int = 0
    dunks: int = 0
    dunks_made: int = 0
    two_pointers: int = 0
    two_pointers_made: int = 0
    three_pointers: int = 0
    three_pointers_made: int = 0
    free_throws: int = 0
    free_throws_made: int = 0
    
    # Percentuali
    field_goal_percentage: float = 0.0
    two_point_percentage: float = 0.0
    three_point_percentage: float = 0.0
    free_throw_percentage: float = 0.0
    
    # Totali
    total_points: int = 0
    players: List[PlayerStats] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        """Converti a dizionario"""
        data = asdict(self)
        data['players'] = [p.to_dict() for p in self.players]
        return data


@dataclass
class GameSummary:
    """Sommario della partita"""
    home_team: str
    away_team: str
    duration_seconds: float
    total_shots: int
    home_team_stats: TeamStats
    away_team_stats: TeamStats
    shots: List[Shot] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        """Converti a dizionario"""
        return {
            "home_team": self.home_team,
            "away_team": self.away_team,
            "duration_seconds": self.duration_seconds,
            "total_shots": self.total_shots,
            "home_team_stats": self.home_team_stats.to_dict(),
            "away_team_stats": self.away_team_stats.to_dict(),
            "shots": [s.to_dict() for s in self.shots]
        }


class StatisticsExtractor:
    """Estrae statistiche dal video processato"""
    
    def __init__(self, home_team: str, away_team: str):
        """
        Inizializza l'estrattore di statistiche
        
        Args:
            home_team: Nome della squadra di casa
            away_team: Nome della squadra ospite
        """
        self.home_team = home_team
        self.away_team = away_team
        
        # Contenitori per i dati
        self.shots: List[Shot] = []
        self.player_stats: Dict[int, PlayerStats] = {}
        self.frame_count = 0
        self.fps = 30
        
        logger.info(f"Statistics extractor initialized: {home_team} vs {away_team}")
    
    def add_shot(self, shot: Shot):
        """
        Aggiunge un tiro al dataset
        
        Args:
            shot: Shot object
        """
        self.shots.append(shot)
        
        # Aggiorna statistiche giocatore
        if shot.player_id not in self.player_stats:
            self.player_stats[shot.player_id] = PlayerStats(
                player_id=shot.player_id,
                jersey_number=shot.jersey_number,
                team=shot.team
            )
        
        player = self.player_stats[shot.player_id]
        self._update_player_stats(player, shot)
        
        logger.info(f"Shot added: {shot.shot_type.value} by player {shot.jersey_number} ({shot.team})")
    
    def _update_player_stats(self, player: PlayerStats, shot: Shot):
        """Aggiorna le statistiche del giocatore con un nuovo tiro"""
        
        # Conteggio totale
        player.total_shots += 1
        
        # Aggiorna per esito
        if shot.outcome == ShotOutcome.MADE:
            player.made_shots += 1
        elif shot.outcome == ShotOutcome.MISSED:
            player.missed_shots += 1
        elif shot.outcome == ShotOutcome.BLOCKED:
            player.blocked_shots += 1
        
        # Aggiorna per tipo di tiro
        if shot.shot_type == ShotType.LAYUP:
            player.layups += 1
            if shot.outcome == ShotOutcome.MADE:
                player.layups_made += 1
                player.points += 2
        
        elif shot.shot_type == ShotType.DUNK:
            player.dunks += 1
            if shot.outcome == ShotOutcome.MADE:
                player.dunks_made += 1
                player.points += 2
        
        elif shot.shot_type == ShotType.TWO_POINTER:
            player.two_pointers += 1
            if shot.outcome == ShotOutcome.MADE:
                player.two_pointers_made += 1
                player.points += 2
        
        elif shot.shot_type == ShotType.THREE_POINTER:
            player.three_pointers += 1
            if shot.outcome == ShotOutcome.MADE:
                player.three_pointers_made += 1
                player.points += 3
        
        elif shot.shot_type == ShotType.FREE_THROW:
            player.free_throws += 1
            if shot.outcome == ShotOutcome.MADE:
                player.free_throws_made += 1
                player.points += 1
        
        # Aggiorna per zona
        zone = shot.court_zone
        if zone not in player.shots_by_zone:
            player.shots_by_zone[zone] = {"total": 0, "made": 0}
        
        player.shots_by_zone[zone]["total"] += 1
        if shot.outcome == ShotOutcome.MADE:
            player.shots_by_zone[zone]["made"] += 1
        
        # Aggiorna specifiche zone
        if zone == "paint":
            player.paint_shots += 1
            if shot.outcome == ShotOutcome.MADE:
                player.paint_made += 1
        elif zone == "mid_range":
            player.mid_range_shots += 1
            if shot.outcome == ShotOutcome.MADE:
                player.mid_range_made += 1
        elif zone == "corner_3":
            player.corner_three_shots += 1
            if shot.outcome == ShotOutcome.MADE:
                player.corner_three_made += 1
        elif zone == "wing_3":
            player.wing_three_shots += 1
            if shot.outcome == ShotOutcome.MADE:
                player.wing_three_made += 1
        
        # Calcola percentuali
        self._calculate_percentages(player)
    
    def _calculate_percentages(self, player: PlayerStats):
        """Calcola le percentuali per il giocatore"""
        if player.total_shots > 0:
            player.field_goal_percentage = player.made_shots / player.total_shots
        
        if player.two_pointers > 0:
            player.two_point_percentage = player.two_pointers_made / player.two_pointers
        
        if player.three_pointers > 0:
            player.three_point_percentage = player.three_pointers_made / player.three_pointers
        
        if player.free_throws > 0:
            player.free_throw_percentage = player.free_throws_made / player.free_throws
    
    def generate_game_summary(self, duration_seconds: float = None) -> GameSummary:
        """
        Genera il sommario della partita
        
        Args:
            duration_seconds: Durata totale del video in secondi
            
        Returns:
            GameSummary object
        """
        # Calcola durata
        if duration_seconds is None:
            duration_seconds = self.frame_count / self.fps
        
        # Crea statistiche di squadra
        home_stats = self._create_team_stats(self.home_team)
        away_stats = self._create_team_stats(self.away_team)
        
        # Crea sommario
        summary = GameSummary(
            home_team=self.home_team,
            away_team=self.away_team,
            duration_seconds=duration_seconds,
            total_shots=len(self.shots),
            home_team_stats=home_stats,
            away_team_stats=away_stats,
            shots=self.shots
        )
        
        logger.info(f"Game summary generated: {len(self.shots)} shots recorded")
        
        return summary
    
    def _create_team_stats(self, team_name: str) -> TeamStats:
        """Crea statistiche di squadra"""
        team_stats = TeamStats(team_name=team_name)
        
        # Raccogli giocatori della squadra
        team_players = [
            player for player in self.player_stats.values()
            if player.team == team_name
        ]
        
        # Aggrega statistiche
        for player in team_players:
            team_stats.total_shots += player.total_shots
            team_stats.made_shots += player.made_shots
            team_stats.missed_shots += player.missed_shots
            team_stats.blocked_shots += player.blocked_shots
            
            team_stats.layups += player.layups
            team_stats.layups_made += player.layups_made
            team_stats.dunks += player.dunks
            team_stats.dunks_made += player.dunks_made
            team_stats.two_pointers += player.two_pointers
            team_stats.two_pointers_made += player.two_pointers_made
            team_stats.three_pointers += player.three_pointers
            team_stats.three_pointers_made += player.three_pointers_made
            team_stats.free_throws += player.free_throws
            team_stats.free_throws_made += player.free_throws_made
            
            team_stats.total_points += player.points
            team_stats.players.append(player)
        
        # Calcola percentuali di squadra
        if team_stats.total_shots > 0:
            team_stats.field_goal_percentage = team_stats.made_shots / team_stats.total_shots
        
        if team_stats.two_pointers > 0:
            team_stats.two_point_percentage = team_stats.two_pointers_made / team_stats.two_pointers
        
        if team_stats.three_pointers > 0:
            team_stats.three_point_percentage = team_stats.three_pointers_made / team_stats.three_pointers
        
        if team_stats.free_throws > 0:
            team_stats.free_throw_percentage = team_stats.free_throws_made / team_stats.free_throws
        
        # Ordina giocatori per punti
        team_stats.players.sort(key=lambda p: p.points, reverse=True)
        
        return team_stats
    
    def get_top_performers(self, n: int = 5) -> List[Dict]:
        """
        Ritorna i migliori giocatori per punti
        
        Args:
            n: Numero di giocatori da ritornare
            
        Returns:
            Lista di dizionari con statistiche
        """
        sorted_players = sorted(
            self.player_stats.values(),
            key=lambda p: p.points,
            reverse=True
        )
        
        return [
            {
                "player_id": p.player_id,
                "jersey_number": p.jersey_number,
                "team": p.team,
                "points": p.points,
                "made_shots": p.made_shots,
                "total_shots": p.total_shots,
                "field_goal_percentage": round(p.field_goal_percentage * 100, 1),
                "three_pointers_made": p.three_pointers_made,
                "three_pointers": p.three_pointers
            }
            for p in sorted_players[:n]
        ]
    
    def get_shot_chart_data(self, team: Optional[str] = None) -> List[Dict]:
        """
        Ritorna dati per la shot chart
        
        Args:
            team: Team specifico (None = tutti)
            
        Returns:
            Lista di shot locations
        """
        shots = [
            {
                "x": shot.distance,
                "y": shot.court_zone,
                "made": shot.outcome == ShotOutcome.MADE,
                "player_jersey": shot.jersey_number,
                "team": shot.team
            }
            for shot in self.shots
            if team is None or shot.team == team
        ]
        
        return shots
    
    def get_shooting_efficiency_by_zone(self, team: Optional[str] = None) -> Dict[str, Dict]:
        """
        Calcola l'efficienza di tiro per zona
        
        Args:
            team: Team specifico (None = tutti)
            
        Returns:
            Dizionario con statistiche per zona
        """
        zones = defaultdict(lambda: {"total": 0, "made": 0})
        
        for shot in self.shots:
            if team is None or shot.team == team:
                zones[shot.court_zone]["total"] += 1
                if shot.outcome == ShotOutcome.MADE:
                    zones[shot.court_zone]["made"] += 1
        
        # Calcola percentuali
        result = {}
        for zone, data in zones.items():
            percentage = (data["made"] / data["total"] * 100) if data["total"] > 0 else 0
            result[zone] = {
                "total_shots": data["total"],
                "made_shots": data["made"],
                "shooting_percentage": round(percentage, 1)
            }
        
        return result
