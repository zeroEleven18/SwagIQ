export type ShotType = '3PT' | '2PT' | 'FT';
export type ShotSubType = 
  | 'Corner 3 (Left)' 
  | 'Corner 3 (Right)' 
  | 'Above The Break 3' 
  | 'Paint / Layup' 
  | 'Dunk / Alley-Oop' 
  | 'Mid-Range Pull-Up' 
  | 'Floater' 
  | 'Free Throw';

export interface ShotEvent {
  id: string;
  gameTimeSec: number; // Video timestamp in seconds
  gameClock: string; // e.g. "07:42 Q3"
  quarter: 1 | 2 | 3 | 4 | 5; // 5 = OT
  teamId: 'home' | 'away';
  teamName: string;
  playerId: string;
  playerNumber: number;
  playerName: string;
  shotType: ShotType;
  subType: ShotSubType;
  made: boolean;
  points: number; // 0 if missed, 1/2/3 if made
  courtX: number; // 0 to 100 percentage of half court (X: 0 = left sideline, 50 = basket center, 100 = right sideline)
  courtY: number; // 0 to 100 percentage of half court (Y: 0 = baseline/rim at Y=10, 100 = half court line)
  distanceFeet: number;
  defenderContest: 'Aperto (Open)' | 'Conteso (Contested)' | 'Stretto (Tight)';
  videoTimestamp: number; // in seconds to jump video
  playDescription: string;
}

export interface PlayerStats {
  id: string;
  name: string;
  number: number;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  teamId: 'home' | 'away';
  isStarter: boolean;
  photoUrl: string;
  
  // Game Stats (Official League Box Score)
  minutes: string; // "34:12"
  minutesNum: number; // 34.2
  distanceCoveredKm?: number; // e.g. 3.84 km percorsi in campo
  topSpeedKmh?: number; // e.g. 26.8 km/h velocità massima
  sprintsCount?: number; // e.g. 22 sprint ad alta intensità
  points: number;
  fgm: number;
  fga: number;
  fgPct: number;
  threePm: number;
  threePa: number;
  threePct: number;
  twoPm: number;
  twoPa: number;
  twoPct: number;
  ftm: number;
  fta: number;
  ftPct: number;
  oreb: number; // Offensive rebounds
  dreb: number; // Defensive rebounds
  reb: number;  // Total rebounds
  ast: number;  // Assists
  stl: number;  // Steals (Palle riconquistate)
  blk: number;  // Blocks (Stoppate)
  tov: number;  // Turnovers (Palle perse)
  pf: number;   // Personal fouls
  plusMinus: number; // +/- on court
  pir: number;  // Performance Index Rating / Game Score
  trueShootingPct: number; // TS%
  usagePct: number; // USG%

  // Season Averages (Media Stagionale)
  seasonAvg: {
    gamesPlayed: number;
    ppg: number; // Points per game
    rpg: number; // Rebounds per game
    apg: number; // Assists per game
    spg: number; // Steals per game
    bpg: number; // Blocks per game
    mpg: number; // Minutes per game
    kmPerGame?: number; // Media KM percorsi a partita (approssimato a 2 decimali)
    fgPct: number;
    threePct: number;
    ftPct: number;
    trendLast5: number[]; // Last 5 games scoring progression
  };
}

export interface TeamStats {
  id: 'home' | 'away';
  name: string;
  shortName: string;
  logo: string;
  color: string;
  score: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  ot?: number;

  // Advanced & Official Stats
  possessionPct: number; // Possesso palla % (es. 52.4%)
  possessionSeconds: number; // Tempo effettivo con palla (minuti/secondi)
  passesCompleted: number; // Passaggi completati
  totalPasses: number;
  passingAccuracy: number; // % accuratezza passaggi
  turnovers: number; // Palle perse
  steals: number; // Palle riconquistate
  fgm: number;
  fga: number;
  fgPct: number;
  twoPm: number;
  twoPa: number;
  twoPct: number;
  threePm: number;
  threePa: number;
  threePct: number;
  ftm: number;
  fta: number;
  ftPct: number;
  oreb: number;
  dreb: number;
  reb: number;
  ast: number;
  blk: number;
  fouls: number;

  // Specialty scoring
  pointsInPaint: number; // Punti in area
  fastbreakPoints: number; // Punti in contropiede
  secondChancePoints: number; // Punti da seconda opportunità
  pointsOffTurnovers: number; // Punti da palle perse avversarie
  benchPoints: number; // Punti dalla panchina
  pace: number; // Possessi stimati per 48 min
  offensiveRating: number; // Punti segnati per 100 possessi
  defensiveRating: number; // Punti subiti per 100 possessi
}

export interface TacticalScheme {
  id: string;
  type: 'offensive' | 'defensive';
  name: string;
  frequencyPct: number;
  frequencyCount: number;
  pointsPerPossession: number; // PPP
  successRate: number; // % di efficacia
  samTrackingScore: number; // Vision SAM accuracy
  description: string;
  keyAction: string;
  exampleTimestampSec: number;
  courtDiagramType: 'pnr' | 'horns' | 'zone' | 'switch' | 'press' | 'iso' | 'motion';
}

export interface HighlightClip {
  id: string;
  title: string;
  category: '3PT' | 'DUNK' | 'BLOCK' | 'STEAL' | 'ASSIST' | 'CLUTCH';
  playerName: string;
  playerNumber: number;
  team: string;
  timestampSec: number;
  durationSec: number;
  scoreContext: string;
  description: string;
  badgeColor?: string;
  thumbnail: string;
}

export interface SeasonGameSummary {
  gameNumber: number;
  date: string;
  opponent: string;
  opponentLogo: string;
  isHome: boolean;
  result: 'W' | 'L';
  teamScore: number;
  oppScore: number;
  possessionPct: number;
  fgPct: number;
  threePct: number;
  turnovers: number;
  steals: number;
  topScorer: { name: string; points: number };
  topRebounder: { name: string; rebounds: number };
  topAssister: { name: string; assists: number };
}

export interface VisionDetection {
  id: string;
  trackId: number;
  type: 'player' | 'referee' | 'ball';
  team?: 'home' | 'away';
  jerseyNumber?: number;
  playerName?: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number }; // In percentage of frame (0-100)
  courtPos2D: { x: number; y: number }; // Projected court coordinate (0-100)
  speedMps?: number; // Speed in meters per second
  isBallCarrier?: boolean;
}

export interface VisionFrameData {
  timestampSec: number;
  gameClock: string;
  cameraAngle: 'Broadcast Main' | 'High Endzone' | 'Tactical 2D Bird-Eye';
  detections: VisionDetection[];
  ballTrajectory: { x: number; y: number; z: number }[]; // 3D arc coordinates
  activeTacticalSet: string;
  homographyMatrixComputed: boolean;
}

export interface CustomPlayNode {
  id: string;
  label: string; // e.g. "1 PG", "2 SG", "D1", "D5"
  role: 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'DEF';
  number: number;
  x: number; // 0-100% of half court
  y: number; // 0-100% of half court
  isOffense: boolean;
}

export interface CustomPlayAction {
  id: string;
  type: 'pass' | 'cut' | 'screen' | 'dribble';
  start: { x: number; y: number };
  end: { x: number; y: number };
  label?: string;
}

export interface CustomPlayComplianceLog {
  id: string;
  timestampSec: number;
  gameClock: string;
  quarter: number;
  executedCorrectly: boolean;
  coachDirectiveFollowed: boolean;
  pointsScored: number;
  playersInvolved: number[];
  notes: string;
}

export interface CustomTacticalPlay {
  id: string;
  title: string;
  type: 'offensive' | 'defensive';
  category: string; // e.g. "Pick & Roll", "Motion 5-Out", "Drop Coverage", "Pressing"
  coachDirective: string; // Direttiva chiave dell'allenatore
  targetExecutions: number; // Target per partita (es. 10)
  actualExecutions: number; // Volte applicato (es. 12)
  complianceRate: number; // % Rispetto direttive coach (es. 83.3%)
  pointsGenerated: number; // Punti totali realizzati
  ppp: number; // Points Per Possession
  keyActionDescription: string;
  nodes: CustomPlayNode[];
  actions: CustomPlayAction[];
  complianceLogs: CustomPlayComplianceLog[];
  diagramImageUrl?: string; // Optional custom tactical whiteboard scan or diagram image
}

export interface TeamRosterConfig {
  myTeamSide: 'home' | 'away';
  myTeamName: string;
  myTeamShortName: string;
  myTeamLogo: string;
  myTeamColor: string;
  myTeamSecondaryColor: string;
  opponentName: string;
  opponentShortName: string;
  opponentColor: string;
  opponentLogo: string;
  isHomeGame: boolean;
}

export interface RoboflowViolation {
  id: string;
  type: 'TRAVEL' | '3_SEC_PAINT' | 'DOUBLE_DRIBBLE' | '8_SEC_BACKCOURT' | '24_SEC_CLOCK' | 'FOOT_ON_LINE';
  name: string;
  playerNumber: number;
  playerName: string;
  team: 'home' | 'away';
  timestampSec: number;
  gameClock: string;
  frameConfidence: number;
  description: string;
  notebookSource: string;
}

export interface TrackingPeriod {
  id: string;
  name: string; // e.g. "1° Quarto (Q1)", "2° Quarto (Q2)", "3° Quarto (Q3)", "4° Quarto (Q4)", "Overtime"
  startSec: number;
  endSec?: number;
  status: 'active' | 'completed';
}

export interface BasketballGame {
  id: string;
  title: string;
  competition: string; // e.g. "Lega Professionistica - Playoff"
  date: string;
  venue?: string; // Optional legacy field
  duration: string;
  videoDurationSec?: number;
  videoUrl: string;
  youtubeId?: string;
  videoSourceType: 'local' | 'youtube' | 'twitch' | 'sample';
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  players: PlayerStats[];
  shots: ShotEvent[];
  tactics: TacticalScheme[];
  customPlays?: CustomTacticalPlay[];
  violations?: RoboflowViolation[];
  highlights: HighlightClip[];
  visionFrames: VisionFrameData[];
  seasonHistory: SeasonGameSummary[];
  coachNotes: string[];
  trackingPeriods?: TrackingPeriod[];
}
