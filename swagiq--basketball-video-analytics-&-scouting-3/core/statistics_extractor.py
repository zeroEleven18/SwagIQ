"""
SwagIQ - Basketball Statistics Extractor Core Module
Handles extraction of team and player statistics from video analysis
"""

from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
from enum import Enum
import json
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ShotType(Enum):
    """Tipologie di tiri nel basket"""
    TWO_POINTER = "2PT"
    THREE_POINTER = "3PT"
    FREE_THROW = "FT"
    LAYUP = "LAYUP"
    DUNK = "DUNK"


class ShotResult(Enum):
    """Risultato del tiro"""
    MADE = "MADE"
    MISSED = "MISSED"
    BLOCKED = "BLOCKED"


@dataclass
class ShotEvent:
    """Evento di tiro nel basket"""
    timestamp: float  # secondi dall'inizio del video
    player_id: int
    player_name: str
    shot_type: ShotType
    result: ShotResult
    distance: float  # distanza dal canestro in piedi
    court_location: Tuple[float, float]  # coordinate (x, y) sul campo
    quarter: int
    team: str
    assisted: bool = False
    assist_player_id: Optional[int] = None
    three_point_shooter: bool = False  # True se è un tiratore da 3
    
    def to_dict(self) -> Dict:
        return {
            "timestamp": self.timestamp,
            "player_id": self.player_id,
            "player_name": self.player_name,
            "shot_type": self.shot_type.value,
            "result": self.result.value,
            "distance": self.distance,
            "court_location": self.court_location,
            "quarter": self.quarter,
            "team": self.team,
            "assisted": self.assisted,
            "assist_player_id": self.assist_player_id,
        }


@dataclass
class PlayerStats:
    """Statistiche singolo giocatore per una partita"""
    player_id: int
    player_name: str
    team: str
    jersey_number: int
    
    # Tiri
    shots_attempted: int = 0
    shots_made: int = 0
    three_pointers_attempted: int = 0
    three_pointers_made: int = 0
    free_throws_attempted: int = 0
    free_throws_made: int = 0
    
    # Punti
    points: int = 0
    
    # Rimbalzi
    offensive_rebounds: int = 0
    defensive_rebounds: int = 0
    total_rebounds: int = 0
    
    # Gioco
    assists: int = 0
    turnovers: int = 0
    steals: int = 0
    blocks: int = 0
    fouls: int = 0
    
    # Minutaggio
    minutes_played: float = 0.0
    
    # Statistiche calcolate
    shot_events: List[ShotEvent] = field(default_factory=list)
    
    def calculate_shooting_percentages(self) -> Dict[str, float]:
        """Calcola le percentuali di tiro"""
        return {
            "field_goal_percentage": (self.shots_made / self.shots_attempted * 100) 
                                    if self.shots_attempted > 0 else 0,
            "three_point_percentage": (self.three_pointers_made / self.three_pointers_attempted * 100) 
                                     if self.three_pointers_attempted > 0 else 0,
            "free_throw_percentage": (self.free_throws_made / self.free_throws_attempted * 100) 
                                    if self.free_throws_attempted > 0 else 0,
        }
    
    def calculate_per_minute_stats(self) -> Dict[str, float]:
        """Calcola le statistiche per minuto giocato"""
        if self.minutes_played == 0:
            return {}
        
        return {
            "ppg": (self.points / self.minutes_played * 40) if self.minutes_played > 0 else 0,  # Punti per 40 minuti
            "rpg": (self.total_rebounds / self.minutes_played * 40) if self.minutes_played > 0 else 0,
            "apg": (self.assists / self.minutes_played * 40) if self.minutes_played > 0 else 0,
            "tov_per_game": (self.turnovers / self.minutes_played * 40) if self.minutes_played > 0 else 0,
        }
    
    def to_dict(self) -> Dict:
        """Serializza le statistiche del giocatore"""
        return {
            "player_id": self.player_id,
            "player_name": self.player_name,
            "team": self.team,
            "jersey_number": self.jersey_number,
            "minutes_played": self.minutes_played,
            "points": self.points,
            "shots_made": self.shots_made,
            "shots_attempted": self.shots_attempted,
            "three_pointers_made": self.three_pointers_made,
            "three_pointers_attempted": self.three_pointers_attempted,
            "free_throws_made": self.free_throws_made,
            "free_throws_attempted": self.free_throws_attempted,
            "rebounds_offensive": self.offensive_rebounds,
            "rebounds_defensive": self.defensive_rebounds,
            "rebounds_total": self.total_rebounds,
            "assists": self.assists,
            "turnovers": self.turnovers,
            "steals": self.steals,
            "blocks": self.blocks,
            "fouls": self.fouls,
            "shooting_percentages": self.calculate_shooting_percentages(),
            "per_minute_stats": self.calculate_per_minute_stats(),
            "shot_events": [shot.to_dict() for shot in self.shot_events],
        }


@dataclass
class TeamStats:
    """Statistiche di squadra per una partita"""
    team_name: str
    
    # Tiri
    shots_attempted: int = 0
    shots_made: int = 0
    three_pointers_attempted: int = 0
    three_pointers_made: int = 0
    free_throws_attempted: int = 0
    free_throws_made: int = 0
    
    # Punti
    points: int = 0
    
    # Rimbalzi
    offensive_rebounds: int = 0
    defensive_rebounds: int = 0
    total_rebounds: int = 0
    
    # Gioco
    assists: int = 0
    turnovers: int = 0
    steals: int = 0
    blocks: int = 0
    fouls: int = 0
    
    # Possesso palla
    possessions: int = 0
    
    # Giocatori
    players: List[PlayerStats] = field(default_factory=list)
    
    def calculate_possession_percentage(self) -> float:
        """Calcola la percentuale di possesso palla"""
        if self.possessions == 0:
            return 50.0
        return (self.possessions / (self.possessions + 50)) * 100  # Formula approssimata
    
    def calculate_efficiency(self) -> Dict[str, float]:
        """Calcola l'efficienza offensiva della squadra"""
        return {
            "field_goal_percentage": (self.shots_made / self.shots_attempted * 100) 
                                    if self.shots_attempted > 0 else 0,
            "three_point_percentage": (self.three_pointers_made / self.three_pointers_attempted * 100) 
                                     if self.three_pointers_attempted > 0 else 0,
            "free_throw_percentage": (self.free_throws_made / self.free_throws_attempted * 100) 
                                    if self.free_throws_attempted > 0 else 0,
            "true_shooting_percentage": self._calculate_ts_percentage(),
        }
    
    def _calculate_ts_percentage(self) -> float:
        """True Shooting Percentage: misura l'efficienza di tiro considerando FT"""
        total_shot_attempts = self.shots_attempted + (0.44 * self.free_throws_attempted)
        if total_shot_attempts == 0:
            return 0
        return (self.points / (2 * total_shot_attempts)) * 100
    
    def to_dict(self) -> Dict:
        """Serializza le statistiche di squadra"""
        return {
            "team_name": self.team_name,
            "points": self.points,
            "shots_made": self.shots_made,
            "shots_attempted": self.shots_attempted,
            "three_pointers_made": self.three_pointers_made,
            "three_pointers_attempted": self.three_pointers_attempted,
            "free_throws_made": self.free_throws_made,
            "free_throws_attempted": self.free_throws_attempted,
            "rebounds_offensive": self.offensive_rebounds,
            "rebounds_defensive": self.defensive_rebounds,
            "rebounds_total": self.total_rebounds,
            "assists": self.assists,
            "turnovers": self.turnovers,
            "steals": self.steals,
            "blocks": self.blocks,
            "fouls": self.fouls,
            "possessions": self.possessions,
            "possession_percentage": self.calculate_possession_percentage(),
            "efficiency": self.calculate_efficiency(),
            "players": [player.to_dict() for player in self.players],
        }


class StatisticsExtractor:
    """
    Classe principale per l'estrazione delle statistiche da un video di basket
    """
    
    def __init__(self):
        self.team_home: Optional[TeamStats] = None
        self.team_away: Optional[TeamStats] = None
        self.shot_events: List[ShotEvent] = []
        self.processing_log: List[str] = []
    
    def initialize_game(self, home_team: str, away_team: str):
        """Inizializza una nuova partita (tutti i valori iniziano da ZERO)"""
        self.team_home = TeamStats(team_name=home_team)
        self.team_away = TeamStats(team_name=away_team)
        self.shot_events = []
        logger.info(f"Game initialized with 0 stats: {home_team} vs {away_team}")
    
    def add_player_to_team(self, team: str, player_id: int, player_name: str, 
                          jersey_number: int):
        """Aggiunge un giocatore al roster della squadra con statistiche a zero"""
        player = PlayerStats(
            player_id=player_id,
            player_name=player_name,
            team=team,
            jersey_number=jersey_number
        )
        
        if self.team_home and team == self.team_home.team_name:
            self.team_home.players.append(player)
        elif self.team_away and team == self.team_away.team_name:
            self.team_away.players.append(player)
        
        logger.info(f"Player added: {player_name} (#{jersey_number}) to {team}")
    
    def record_shot(self, shot_event: ShotEvent):
        """Registra un evento di tiro e incrementa statistiche giocatore e squadra"""
        self.shot_events.append(shot_event)
        
        # Aggiorna le statistiche della squadra
        team = self.team_home if (self.team_home and shot_event.team == self.team_home.team_name) else self.team_away
        if team:
            if shot_event.shot_type == ShotType.FREE_THROW:
                team.free_throws_attempted += 1
                if shot_event.result == ShotResult.MADE:
                    team.free_throws_made += 1
                    team.points += 1
            elif shot_event.shot_type == ShotType.THREE_POINTER:
                team.shots_attempted += 1
                team.three_pointers_attempted += 1
                if shot_event.result == ShotResult.MADE:
                    team.shots_made += 1
                    team.three_pointers_made += 1
                    team.points += 3
            else:
                team.shots_attempted += 1
                if shot_event.result == ShotResult.MADE:
                    team.shots_made += 1
                    team.points += 2
        
        # Aggiorna le statistiche del giocatore
        player = self._get_player(shot_event.player_id, shot_event.team)
        if player:
            if shot_event.shot_type == ShotType.FREE_THROW:
                player.free_throws_attempted += 1
                if shot_event.result == ShotResult.MADE:
                    player.free_throws_made += 1
                    player.points += 1
            elif shot_event.shot_type == ShotType.THREE_POINTER:
                player.shots_attempted += 1
                player.three_pointers_attempted += 1
                if shot_event.result == ShotResult.MADE:
                    player.shots_made += 1
                    player.three_pointers_made += 1
                    player.points += 3
            else:
                player.shots_attempted += 1
                if shot_event.result == ShotResult.MADE:
                    player.shots_made += 1
                    player.points += 2
            
            player.shot_events.append(shot_event)
        
        # Gestione eventuale assist
        if shot_event.assisted and shot_event.assist_player_id:
            assist_player = self._get_player(shot_event.assist_player_id, shot_event.team)
            if assist_player:
                assist_player.assists += 1
            if team:
                team.assists += 1
        
        logger.info(f"Shot recorded: {shot_event.player_name} ({shot_event.team}) - {shot_event.result.value} ({shot_event.shot_type.value})")
    
    def _get_player(self, player_id: int, team: str) -> Optional[PlayerStats]:
        """Ottiene un giocatore dal roster della squadra"""
        team_obj = self.team_home if (self.team_home and team == self.team_home.team_name) else self.team_away
        if team_obj:
            for player in team_obj.players:
                if player.player_id == player_id:
                    return player
        return None
    
    def export_statistics(self, filepath: str):
        """Esporta le statistiche in formato JSON"""
        stats = {
            "timestamp": datetime.now().isoformat(),
            "game": {
                "home_team": self.team_home.to_dict() if self.team_home else {},
                "away_team": self.team_away.to_dict() if self.team_away else {},
            },
            "shot_events": [shot.to_dict() for shot in self.shot_events],
        }
        
        with open(filepath, 'w') as f:
            json.dump(stats, f, indent=2)
        
        logger.info(f"Statistics exported to {filepath}")
    
    def generate_summary(self) -> Dict:
        """Genera un sommario della partita"""
        if not self.team_home or not self.team_away:
            return {}
            
        return {
            "home_team": self.team_home.team_name,
            "away_team": self.team_away.team_name,
            "final_score": f"{self.team_home.points} - {self.team_away.points}",
            "home_stats": {
                "points": self.team_home.points,
                "fg%": self.team_home.calculate_efficiency()["field_goal_percentage"],
                "3p%": self.team_home.calculate_efficiency()["three_point_percentage"],
                "rebounds": self.team_home.total_rebounds,
                "assists": self.team_home.assists,
            },
            "away_stats": {
                "points": self.team_away.points,
                "fg%": self.team_away.calculate_efficiency()["field_goal_percentage"],
                "3p%": self.team_away.calculate_efficiency()["three_point_percentage"],
                "rebounds": self.team_away.total_rebounds,
                "assists": self.team_away.assists,
            }
        }


# Esempio di utilizzo standalone
if __name__ == "__main__":
    extractor = StatisticsExtractor()
    extractor.initialize_game("Virtus Bologna", "Olimpia Milano")
    extractor.add_player_to_team("Virtus Bologna", 1, "Marco Belinelli", 3)
    extractor.add_player_to_team("Virtus Bologna", 2, "Tornike Shengelia", 21)
    extractor.add_player_to_team("Olimpia Milano", 3, "Nikola Mirotic", 33)
    extractor.add_player_to_team("Olimpia Milano", 4, "Shavon Shields", 31)
    
    shot1 = ShotEvent(
        timestamp=34.2,
        player_id=1,
        player_name="Marco Belinelli",
        shot_type=ShotType.THREE_POINTER,
        result=ShotResult.MADE,
        distance=24.5,
        court_location=(48.0, 26.0),
        quarter=1,
        team="Virtus Bologna"
    )
    extractor.record_shot(shot1)
    print(json.dumps(extractor.generate_summary(), indent=2))
