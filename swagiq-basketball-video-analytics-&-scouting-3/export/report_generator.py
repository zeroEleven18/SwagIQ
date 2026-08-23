"""
SwagIQ Report Generator
Generates PDF reports, JSON exports, and CSV statistics
"""

import json
import csv
from typing import Dict, List, Optional
from pathlib import Path
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class DataExporter:
    """Esporta dati in vari formati"""
    
    def __init__(self, output_dir: Path):
        """
        Inizializza l'esportatore
        
        Args:
            output_dir: Directory per i file di output
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Data exporter initialized: {self.output_dir}")
    
    def export_to_json(self, data: Dict, filename: str = "game_summary.json") -> Path:
        """
        Esporta dati a JSON
        
        Args:
            data: Dati da esportare
            filename: Nome del file
            
        Returns:
            Path al file creato
        """
        try:
            filepath = self.output_dir / filename
            
            with open(filepath, 'w') as f:
                json.dump(data, f, indent=2)
            
            logger.info(f"JSON exported: {filepath}")
            return filepath
        
        except Exception as e:
            logger.error(f"Error exporting to JSON: {str(e)}")
            raise
    
    def export_to_csv(self, data: List[Dict], filename: str = "statistics.csv") -> Path:
        """
        Esporta dati a CSV
        
        Args:
            data: Lista di dizionari
            filename: Nome del file
            
        Returns:
            Path al file creato
        """
        try:
            if not data:
                logger.warning("No data to export to CSV")
                return None
            
            filepath = self.output_dir / filename
            
            # Ottieni le chiavi dal primo elemento
            fieldnames = data[0].keys()
            
            with open(filepath, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(data)
            
            logger.info(f"CSV exported: {filepath}")
            return filepath
        
        except Exception as e:
            logger.error(f"Error exporting to CSV: {str(e)}")
            raise
    
    def export_player_stats_csv(self, team_stats: Dict, filename: str = "player_statistics.csv") -> Path:
        """
        Esporta statistiche giocatori a CSV
        
        Args:
            team_stats: Statistiche di squadra
            filename: Nome del file
            
        Returns:
            Path al file creato
        """
        try:
            filepath = self.output_dir / filename
            
            rows = []
            
            # Raccogli dati giocatori da entrambe le squadre
            for team_name in ["home_team_stats", "away_team_stats"]:
                if team_name in team_stats:
                    team = team_stats[team_name]
                    for player in team.get("players", []):
                        row = {
                            "team": player.get("team", ""),
                            "jersey_number": player.get("jersey_number", ""),
                            "total_shots": player.get("total_shots", 0),
                            "made_shots": player.get("made_shots", 0),
                            "field_goal_percentage": player.get("field_goal_percentage", 0),
                            "three_pointers": player.get("three_pointers", 0),
                            "three_pointers_made": player.get("three_pointers_made", 0),
                            "points": player.get("points", 0),
                        }
                        rows.append(row)
            
            if rows:
                with open(filepath, 'w', newline='') as f:
                    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
                    writer.writeheader()
                    writer.writerows(rows)
                
                logger.info(f"Player stats CSV exported: {filepath}")
            
            return filepath
        
        except Exception as e:
            logger.error(f"Error exporting player stats CSV: {str(e)}")
            raise


class PDFReportGenerator:
    """Genera report PDF professionali"""
    
    def __init__(self, output_dir: Path):
        """
        Inizializza il generatore PDF
        
        Args:
            output_dir: Directory per i file PDF
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            from reportlab.lib.pagesizes import letter, A4
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            from reportlab.lib import colors
            
            self.reportlab_available = True
            self.SimpleDocTemplate = SimpleDocTemplate
            self.Table = Table
            self.TableStyle = TableStyle
            self.Paragraph = Paragraph
            self.Spacer = Spacer
            self.PageBreak = PageBreak
            self.getSampleStyleSheet = getSampleStyleSheet
            self.ParagraphStyle = ParagraphStyle
            self.inch = inch
            self.colors = colors
            self.letter = letter
            
            logger.info("ReportLab PDF generator initialized")
        
        except ImportError:
            logger.warning("ReportLab not available, PDF generation will be skipped")
            self.reportlab_available = False
    
    def generate_game_report(self, game_data: Dict, filename: str = "game_report.pdf") -> Optional[Path]:
        """
        Genera un report PDF completo della partita
        
        Args:
            game_data: Dati della partita
            filename: Nome del file PDF
            
        Returns:
            Path al file creato o None se ReportLab non disponibile
        """
        if not self.reportlab_available:
            logger.warning("PDF generation skipped - ReportLab not available")
            return None
        
        try:
            filepath = self.output_dir / filename
            
            # Crea il documento
            doc = self.SimpleDocTemplate(
                str(filepath),
                pagesize=self.letter,
                rightMargin=0.5 * self.inch,
                leftMargin=0.5 * self.inch,
                topMargin=0.75 * self.inch,
                bottomMargin=0.75 * self.inch
            )
            
            styles = self.getSampleStyleSheet()
            story = []
            
            # Titolo
            title_style = self.ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=self.colors.HexColor('#1f4788'),
                spaceAfter=30,
                alignment=1  # Center
            )
            
            title = self.Paragraph(
                f"{game_data.get('home_team', 'Home')} vs {game_data.get('away_team', 'Away')}",
                title_style
            )
            story.append(title)
            story.append(self.Spacer(1, 0.3 * self.inch))
            
            # Game Summary Section
            summary_style = self.ParagraphStyle(
                'SectionTitle',
                parent=styles['Heading2'],
                fontSize=14,
                textColor=self.colors.HexColor('#1f4788'),
                spaceAfter=12
            )
            
            story.append(self.Paragraph("Game Summary", summary_style))
            
            # Summary Table
            summary_data = [
                ["Duration", f"{game_data.get('duration_seconds', 0) / 60:.1f} minutes"],
                ["Total Shots", str(game_data.get('total_shots', 0))],
                ["Home Team Points", str(game_data.get('home_team_stats', {}).get('total_points', 0))],
                ["Away Team Points", str(game_data.get('away_team_stats', {}).get('total_points', 0))],
            ]
            
            summary_table = self._create_table(summary_data, col_widths=[2 * self.inch, 4 * self.inch])
            story.append(summary_table)
            story.append(self.Spacer(1, 0.3 * self.inch))
            
            # Team Stats Section
            story.append(self.PageBreak())
            story.append(self.Paragraph("Team Statistics", summary_style))
            
            # Home Team Stats
            story.append(self.Paragraph("Home Team - " + game_data.get('home_team', 'Home'), styles['Heading3']))
            home_stats = game_data.get('home_team_stats', {})
            home_table_data = self._create_team_stats_table_data(home_stats)
            home_table = self._create_table(home_table_data, col_widths=[2*self.inch, 1*self.inch, 1*self.inch, 1*self.inch])
            story.append(home_table)
            story.append(self.Spacer(1, 0.2 * self.inch))
            
            # Away Team Stats
            story.append(self.Paragraph("Away Team - " + game_data.get('away_team', 'Away'), styles['Heading3']))
            away_stats = game_data.get('away_team_stats', {})
            away_table_data = self._create_team_stats_table_data(away_stats)
            away_table = self._create_table(away_table_data, col_widths=[2*self.inch, 1*self.inch, 1*self.inch, 1*self.inch])
            story.append(away_table)
            story.append(self.Spacer(1, 0.3 * self.inch))
            
            # Player Statistics Section
            story.append(self.PageBreak())
            story.append(self.Paragraph("Player Statistics", summary_style))
            
            # Home Team Players
            story.append(self.Paragraph("Home Team Leaders", styles['Heading3']))
            home_players_data = self._create_player_stats_table_data(home_stats.get('players', []))
            if home_players_data:
                home_players_table = self._create_table(
                    home_players_data,
                    col_widths=[0.8*self.inch, 1.2*self.inch, 0.8*self.inch, 0.8*self.inch, 1*self.inch]
                )
                story.append(home_players_table)
            story.append(self.Spacer(1, 0.2 * self.inch))
            
            # Away Team Players
            story.append(self.Paragraph("Away Team Leaders", styles['Heading3']))
            away_players_data = self._create_player_stats_table_data(away_stats.get('players', []))
            if away_players_data:
                away_players_table = self._create_table(
                    away_players_data,
                    col_widths=[0.8*self.inch, 1.2*self.inch, 0.8*self.inch, 0.8*self.inch, 1*self.inch]
                )
                story.append(away_players_table)
            
            # Footer
            story.append(self.Spacer(1, 0.5 * self.inch))
            footer_text = f"Generated by SwagIQ on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            footer = self.Paragraph(footer_text, styles['Normal'])
            story.append(footer)
            
            # Build PDF
            doc.build(story)
            
            logger.info(f"PDF report generated: {filepath}")
            return filepath
        
        except Exception as e:
            logger.error(f"Error generating PDF report: {str(e)}")
            return None
    
    def _create_table(self, data: List[List], col_widths: List = None) -> 'Table':
        """Crea una tabella ReportLab"""
        table = self.Table(data, colWidths=col_widths)
        
        table.setStyle(self.TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.colors.HexColor('#1f4788')),
            ('TEXTCOLOR', (0, 0), (-1, 0), self.colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), self.colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, self.colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [self.colors.white, self.colors.lightgrey]),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGNMENT', (0, 0), (-1, -1), 'CENTER'),
        ]))
        
        return table
    
    def _create_team_stats_table_data(self, team_stats: Dict) -> List[List]:
        """Crea dati tabella statistiche squadra"""
        return [
            ["Statistic", "Value", "FG%", "3P%"],
            ["Total Shots", str(team_stats.get('total_shots', 0)), 
             f"{team_stats.get('field_goal_percentage', 0)*100:.1f}%",
             f"{team_stats.get('three_point_percentage', 0)*100:.1f}%"],
            ["Made Shots", str(team_stats.get('made_shots', 0)), "", ""],
            ["Points", str(team_stats.get('total_points', 0)), "", ""],
        ]
    
    def _create_player_stats_table_data(self, players: List[Dict]) -> List[List]:
        """Crea dati tabella statistiche giocatori"""
        if not players:
            return []
        
        data = [["Jersey", "Name/ID", "Shots", "Made", "Points"]]
        
        for player in players[:10]:  # Top 10 players
            data.append([
                str(player.get('jersey_number', '-')),
                f"Player {player.get('player_id', '?')}",
                str(player.get('total_shots', 0)),
                str(player.get('made_shots', 0)),
                str(player.get('points', 0)),
            ])
        
        return data


class ReportGenerator:
    """Generatore report principale"""
    
    def __init__(self, output_dir: Path):
        """
        Inizializza il generatore report
        
        Args:
            output_dir: Directory per gli output
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Crea subdirectories
        (self.output_dir / "reports").mkdir(exist_ok=True)
        (self.output_dir / "data").mkdir(exist_ok=True)
        
        self.pdf_generator = PDFReportGenerator(self.output_dir / "reports")
        self.data_exporter = DataExporter(self.output_dir / "data")
        
        logger.info(f"Report generator initialized: {self.output_dir}")
    
    def generate_all_reports(self, game_data: Dict) -> Dict[str, Path]:
        """
        Genera tutti i report (PDF, JSON, CSV)
        
        Args:
            game_data: Dati della partita
            
        Returns:
            Dizionario con i percorsi dei file generati
        """
        reports = {}
        
        # Genera JSON
        try:
            json_path = self.data_exporter.export_to_json(
                game_data,
                "game_summary.json"
            )
            reports['json_summary'] = json_path
        except Exception as e:
            logger.error(f"Failed to generate JSON report: {str(e)}")
        
        # Genera Player Stats CSV
        try:
            csv_path = self.data_exporter.export_player_stats_csv(game_data)
            reports['player_stats_csv'] = csv_path
        except Exception as e:
            logger.error(f"Failed to generate player stats CSV: {str(e)}")
        
        # Genera PDF
        try:
            pdf_path = self.pdf_generator.generate_game_report(game_data)
            if pdf_path:
                reports['pdf_report'] = pdf_path
        except Exception as e:
            logger.error(f"Failed to generate PDF report: {str(e)}")
        
        logger.info(f"All reports generated: {len(reports)} files")
        
        return reports
