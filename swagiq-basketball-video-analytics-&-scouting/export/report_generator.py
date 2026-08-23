"""
SwagIQ - PDF Report Generator and Data Exporter
Generates professional basketball game reports and statistics exports
"""

import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import logging
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Circle, Rectangle
import numpy as np
from io import BytesIO
import base64

try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image, KeepTogether
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    logging.warning("reportlab not installed, PDF generation will be limited")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ShotChartGenerator:
    """Genera le mappe di tiro (shot charts) con overlay su corte NBA"""
    
    # Coordinate corte NBA standard (in piedi)
    COURT_WIDTH = 50
    COURT_LENGTH = 94
    
    # Dimensioni elementi corte
    BASKET_X = 25
    BASKET_HOME_Y = 5.25
    BASKET_AWAY_Y = 88.75
    THREE_POINT_LINE_DISTANCE = 23.75
    FREE_THROW_RADIUS = 6
    PAINT_WIDTH = 16
    PAINT_LENGTH = 19
    
    def __init__(self, figsize: Tuple[int, int] = (10, 10), dpi: int = 100):
        """
        Inizializza il generatore di shot chart
        
        Args:
            figsize: Dimensioni della figura (width, height)
            dpi: DPI per la risoluzione
        """
        self.figsize = figsize
        self.dpi = dpi
    
    def draw_court(self, ax, color: str = 'white', lw: float = 2):
        """
        Disegna la corte NBA
        
        Args:
            ax: Matplotlib axes
            color: Colore delle linee
            lw: Spessore delle linee
        """
        # Linea di fondo
        ax.plot([0, self.COURT_WIDTH], [0, 0], color=color, lw=lw)
        ax.plot([0, self.COURT_WIDTH], [self.COURT_LENGTH, self.COURT_LENGTH], color=color, lw=lw)
        
        # Linee laterali
        ax.plot([0, 0], [0, self.COURT_LENGTH], color=color, lw=lw)
        ax.plot([self.COURT_WIDTH, self.COURT_WIDTH], [0, self.COURT_LENGTH], color=color, lw=lw)
        
        # Linea di mezzocampo
        ax.plot([0, self.COURT_WIDTH], [self.COURT_LENGTH / 2, self.COURT_LENGTH / 2], color=color, lw=lw)
        
        # Cerchio di mezzocampo
        center_circle = Circle((self.BASKET_X, self.COURT_LENGTH / 2), 6, fill=False, 
                              edgecolor=color, lw=lw)
        ax.add_patch(center_circle)
        
        # Paint (racket) lato home
        paint_rect = Rectangle((self.BASKET_X - self.PAINT_WIDTH / 2, 0), 
                              self.PAINT_WIDTH, self.PAINT_LENGTH,
                              fill=False, edgecolor=color, lw=lw)
        ax.add_patch(paint_rect)
        
        # Paint lato away
        paint_rect_away = Rectangle((self.BASKET_X - self.PAINT_WIDTH / 2, 
                                    self.COURT_LENGTH - self.PAINT_LENGTH), 
                                   self.PAINT_WIDTH, self.PAINT_LENGTH,
                                   fill=False, edgecolor=color, lw=lw)
        ax.add_patch(paint_rect_away)
        
        # Free throw circles lato home
        ft_circle_home = Circle((self.BASKET_X, self.PAINT_LENGTH), self.FREE_THROW_RADIUS,
                               fill=False, edgecolor=color, lw=lw)
        ax.add_patch(ft_circle_home)
        
        # Free throw circles lato away
        ft_circle_away = Circle((self.BASKET_X, self.COURT_LENGTH - self.PAINT_LENGTH),
                               self.FREE_THROW_RADIUS, fill=False, edgecolor=color, lw=lw)
        ax.add_patch(ft_circle_away)
        
        # Three-point line lato home
        three_point_left = Rectangle((0, 0), 
                                    self.BASKET_X - np.sqrt(self.THREE_POINT_LINE_DISTANCE**2 - 
                                                           (self.PAINT_LENGTH / 2 + 1.25)**2),
                                    self.PAINT_LENGTH + 1.25,
                                    fill=False, edgecolor=color, lw=lw)
        ax.add_patch(three_point_left)
        
        # Arco della 3-point line
        angle1 = np.degrees(np.arctan2(self.PAINT_LENGTH / 2 + 1.25, 
                                       self.BASKET_X - np.sqrt(self.THREE_POINT_LINE_DISTANCE**2 - 
                                                              (self.PAINT_LENGTH / 2 + 1.25)**2)))
        
        angle2 = 180 - angle1
        
        three_point_arc = patches.Arc((self.BASKET_X, 0), 
                                     2 * self.THREE_POINT_LINE_DISTANCE,
                                     2 * self.THREE_POINT_LINE_DISTANCE,
                                     angle=0, theta1=angle1, theta2=angle2,
                                     color=color, lw=lw)
        ax.add_patch(three_point_arc)
        
        # Three-point line lato away
        three_point_left_away = Rectangle((0, self.COURT_LENGTH - self.PAINT_LENGTH - 1.25), 
                                         self.BASKET_X - np.sqrt(self.THREE_POINT_LINE_DISTANCE**2 - 
                                                                (self.PAINT_LENGTH / 2 + 1.25)**2),
                                         self.PAINT_LENGTH + 1.25,
                                         fill=False, edgecolor=color, lw=lw)
        ax.add_patch(three_point_left_away)
        
        three_point_arc_away = patches.Arc((self.BASKET_X, self.COURT_LENGTH), 
                                          2 * self.THREE_POINT_LINE_DISTANCE,
                                          2 * self.THREE_POINT_LINE_DISTANCE,
                                          angle=0, theta1=180 - angle1, theta2=180 + angle1,
                                          color=color, lw=lw)
        ax.add_patch(three_point_arc_away)
        
        # Basket markers
        ax.plot([self.BASKET_X], [self.BASKET_HOME_Y], 'o', color=color, markersize=8, markeredgewidth=2)
        ax.plot([self.BASKET_X], [self.BASKET_AWAY_Y], 'o', color=color, markersize=8, markeredgewidth=2)
        
        # Set axis properties
        ax.set_xlim(-2, self.COURT_WIDTH + 2)
        ax.set_ylim(-2, self.COURT_LENGTH + 2)
        ax.set_aspect('equal')
        ax.set_facecolor('#d2691e')  # Colore legno
        ax.set_xticks([])
        ax.set_yticks([])
    
    def generate_shot_chart(self, shot_events: List[Dict], title: str = "Shot Chart",
                          made_color: str = 'green', missed_color: str = 'red',
                          marker_size: int = 200) -> bytes:
        """
        Genera una shot chart dai tiri registrati
        
        Args:
            shot_events: Lista di eventi di tiro
            title: Titolo della figura
            made_color: Colore per i tiri segnati
            missed_color: Colore per i tiri mancati
            marker_size: Dimensione dei marker
            
        Returns:
            Immagine in formato bytes (PNG)
        """
        fig, ax = plt.subplots(figsize=self.figsize, dpi=self.dpi)
        
        # Disegna la corte
        self.draw_court(ax, color='black', lw=2)
        
        # Separa tiri segnati e mancati
        made_shots = [shot for shot in shot_events if shot.get('result') == 'MADE']
        missed_shots = [shot for shot in shot_events if shot.get('result') == 'MISSED']
        blocked_shots = [shot for shot in shot_events if shot.get('result') == 'BLOCKED']
        
        # Plot tiri segnati
        if made_shots:
            made_x = [shot['court_location'][0] for shot in made_shots]
            made_y = [shot['court_location'][1] for shot in made_shots]
            ax.scatter(made_x, made_y, s=marker_size, c=made_color, marker='o', 
                      edgecolors='darkgreen', linewidth=2, alpha=0.7, label='Made')
        
        # Plot tiri mancati
        if missed_shots:
            missed_x = [shot['court_location'][0] for shot in missed_shots]
            missed_y = [shot['court_location'][1] for shot in missed_shots]
            ax.scatter(missed_x, missed_y, s=marker_size, c=missed_color, marker='x', 
                      linewidth=3, alpha=0.7, label='Missed')
        
        # Plot tiri bloccati
        if blocked_shots:
            blocked_x = [shot['court_location'][0] for shot in blocked_shots]
            blocked_y = [shot['court_location'][1] for shot in blocked_shots]
            ax.scatter(blocked_x, blocked_y, s=marker_size, c='orange', marker='s', 
                      edgecolors='darkorange', linewidth=2, alpha=0.7, label='Blocked')
        
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        ax.legend(loc='upper right', fontsize=12)
        
        # Converti a bytes
        img_buffer = BytesIO()
        plt.savefig(img_buffer, format='png', dpi=self.dpi, bbox_inches='tight', 
                   facecolor='#d2691e')
        img_buffer.seek(0)
        img_bytes = img_buffer.getvalue()
        plt.close(fig)
        
        return img_bytes
    
    def generate_heatmap(self, shot_events: List[Dict], title: str = "Shot Heatmap",
                        bins: int = 10) -> bytes:
        """
        Genera una heatmap 2D dei tiri
        
        Args:
            shot_events: Lista di eventi di tiro
            title: Titolo della figura
            bins: Numero di bins per l'heatmap
            
        Returns:
            Immagine in formato bytes (PNG)
        """
        fig, ax = plt.subplots(figsize=self.figsize, dpi=self.dpi)
        
        self.draw_court(ax, color='white', lw=1)
        
        # Estrai coordinate
        if shot_events:
            x_coords = [shot['court_location'][0] for shot in shot_events]
            y_coords = [shot['court_location'][1] for shot in shot_events]
            
            # Crea heatmap
            h = ax.hist2d(x_coords, y_coords, bins=bins, cmap='YlOrRd', 
                         range=[[0, self.COURT_WIDTH], [0, self.COURT_LENGTH]])
            
            plt.colorbar(h[3], ax=ax, label='Number of Shots')
        
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        
        img_buffer = BytesIO()
        plt.savefig(img_buffer, format='png', dpi=self.dpi, bbox_inches='tight')
        img_buffer.seek(0)
        img_bytes = img_buffer.getvalue()
        plt.close(fig)
        
        return img_bytes


class PDFReportGenerator:
    """Genera report PDF professionali con statistiche e grafici"""
    
    def __init__(self, output_dir: Path = Path("reports")):
        """
        Inizializza il generatore di report
        
        Args:
            output_dir: Directory dove salvare i PDF
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.shot_chart_gen = ShotChartGenerator()
        
        if not REPORTLAB_AVAILABLE:
            logger.warning("reportlab not available - PDF features limited")
    
    def generate_game_summary_pdf(self, game_data: Dict, output_filename: str = "game_summary.pdf") -> Path:
        """
        Genera un PDF con il riassunto della partita
        
        Args:
            game_data: Dati della partita dal StatisticsExtractor
            output_filename: Nome del file di output
            
        Returns:
            Path al file generato
        """
        if not REPORTLAB_AVAILABLE:
            logger.error("reportlab is required for PDF generation")
            return None
        
        output_path = self.output_dir / output_filename
        doc = SimpleDocTemplate(str(output_path), pagesize=letter,
                               rightMargin=0.5*inch, leftMargin=0.5*inch,
                               topMargin=0.75*inch, bottomMargin=0.75*inch)
        
        story = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        home_team = game_data.get('game', {}).get('home_team', {}).get('team_name', 'Home')
        away_team = game_data.get('game', {}).get('away_team', {}).get('team_name', 'Away')
        home_score = game_data.get('game', {}).get('home_team', {}).get('points', 0)
        away_score = game_data.get('game', {}).get('away_team', {}).get('points', 0)
        
        title = Paragraph(f"{home_team} vs {away_team}", title_style)
        story.append(title)
        story.append(Spacer(1, 0.2*inch))
        
        # Score box
        score_data = [
            ['Team', 'Score', 'FG%', '3P%', 'FT%', 'Rebounds', 'Assists'],
            [
                home_team,
                str(home_score),
                f"{game_data.get('game', {}).get('home_team', {}).get('efficiency', {}).get('field_goal_percentage', 0):.1f}%",
                f"{game_data.get('game', {}).get('home_team', {}).get('efficiency', {}).get('three_point_percentage', 0):.1f}%",
                f"{game_data.get('game', {}).get('home_team', {}).get('efficiency', {}).get('free_throw_percentage', 0):.1f}%",
                str(game_data.get('game', {}).get('home_team', {}).get('rebounds_total', 0)),
                str(game_data.get('game', {}).get('home_team', {}).get('assists', 0)),
            ],
            [
                away_team,
                str(away_score),
                f"{game_data.get('game', {}).get('away_team', {}).get('efficiency', {}).get('field_goal_percentage', 0):.1f}%",
                f"{game_data.get('game', {}).get('away_team', {}).get('efficiency', {}).get('three_point_percentage', 0):.1f}%",
                f"{game_data.get('game', {}).get('away_team', {}).get('efficiency', {}).get('free_throw_percentage', 0):.1f}%",
                str(game_data.get('game', {}).get('away_team', {}).get('rebounds_total', 0)),
                str(game_data.get('game', {}).get('away_team', {}).get('assists', 0)),
            ]
        ]
        
        score_table = Table(score_data, colWidths=[1.4*inch, 1*inch, 1*inch, 1*inch, 1*inch, 1.2*inch, 1*inch])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4472C4')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#E7E6E6')),
            ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F2F2F2')),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
        ]))
        
        story.append(score_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Shot charts
        story.append(Paragraph("Shot Charts", styles['Heading2']))
        story.append(Spacer(1, 0.2*inch))
        
        # Genera shot charts per entrambe le squadre
        home_shots = [shot for shot in game_data.get('shot_events', []) if shot['team'] == home_team]
        away_shots = [shot for shot in game_data.get('shot_events', []) if shot['team'] == away_team]
        
        if home_shots:
            home_chart = self.shot_chart_gen.generate_shot_chart(home_shots, title=f"{home_team} Shot Chart")
            img = Image(BytesIO(home_chart), width=3.5*inch, height=3.5*inch)
            story.append(img)
        
        story.append(Spacer(1, 0.2*inch))
        
        if away_shots:
            away_chart = self.shot_chart_gen.generate_shot_chart(away_shots, title=f"{away_team} Shot Chart")
            img = Image(BytesIO(away_chart), width=3.5*inch, height=3.5*inch)
            story.append(img)
        
        story.append(PageBreak())
        
        # Player statistics
        story.append(Paragraph("Player Statistics", styles['Heading2']))
        story.append(Spacer(1, 0.2*inch))
        
        # Home team players
        story.append(Paragraph(f"{home_team} - Player Stats", styles['Heading3']))
        home_players = game_data.get('game', {}).get('home_team', {}).get('players', [])
        
        if home_players:
            player_data = [['Player', 'Min', 'Pts', 'FG', 'FT', 'Reb', 'Ast', 'TO']]
            for player in home_players[:5]:  # Top 5 players
                player_data.append([
                    player.get('player_name', ''),
                    f"{player.get('minutes_played', 0):.1f}",
                    str(player.get('points', 0)),
                    f"{player.get('shots_made', 0)}/{player.get('shots_attempted', 0)}",
                    f"{player.get('free_throws_made', 0)}/{player.get('free_throws_attempted', 0)}",
                    str(player.get('rebounds_total', 0)),
                    str(player.get('assists', 0)),
                    str(player.get('turnovers', 0)),
                ])
            
            player_table = Table(player_data, colWidths=[1.8*inch, 0.6*inch, 0.6*inch, 0.8*inch, 0.8*inch, 0.6*inch, 0.6*inch, 0.6*inch])
            player_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4472C4')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
            ]))
            story.append(player_table)
        
        story.append(Spacer(1, 0.3*inch))
        
        # Away team players
        story.append(Paragraph(f"{away_team} - Player Stats", styles['Heading3']))
        away_players = game_data.get('game', {}).get('away_team', {}).get('players', [])
        
        if away_players:
            player_data = [['Player', 'Min', 'Pts', 'FG', 'FT', 'Reb', 'Ast', 'TO']]
            for player in away_players[:5]:
                player_data.append([
                    player.get('player_name', ''),
                    f"{player.get('minutes_played', 0):.1f}",
                    str(player.get('points', 0)),
                    f"{player.get('shots_made', 0)}/{player.get('shots_attempted', 0)}",
                    f"{player.get('free_throws_made', 0)}/{player.get('free_throws_attempted', 0)}",
                    str(player.get('rebounds_total', 0)),
                    str(player.get('assists', 0)),
                    str(player.get('turnovers', 0)),
                ])
            
            player_table = Table(player_data, colWidths=[1.8*inch, 0.6*inch, 0.6*inch, 0.8*inch, 0.8*inch, 0.6*inch, 0.6*inch, 0.6*inch])
            player_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4472C4')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
            ]))
            story.append(player_table)
        
        # Footer
        story.append(Spacer(1, 0.3*inch))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.grey,
            alignment=TA_CENTER
        )
        story.append(Paragraph(f"Generated by SwagIQ on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", footer_style))
        
        # Build PDF
        doc.build(story)
        logger.info(f"PDF report generated: {output_path}")
        
        return output_path


class DataExporter:
    """Esporta i dati in vari formati (JSON, CSV, etc.)"""
    
    def __init__(self, output_dir: Path = Path("exports")):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    def export_json(self, data: Dict, filename: str = "game_stats.json") -> Path:
        """Esporta dati in formato JSON"""
        output_path = self.output_dir / filename
        
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        logger.info(f"JSON export: {output_path}")
        return output_path
    
    def export_csv(self, player_stats: List[Dict], filename: str = "player_stats.csv") -> Path:
        """Esporta statistiche giocatori in CSV"""
        import csv
        
        output_path = self.output_dir / filename
        
        if not player_stats:
            logger.warning("No player stats to export")
            return None
        
        with open(output_path, 'w', newline='') as f:
            fieldnames = player_stats[0].keys()
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(player_stats)
        
        logger.info(f"CSV export: {output_path}")
        return output_path


if __name__ == "__main__":
    print("PDF Report Generator - Import this in your main application")
