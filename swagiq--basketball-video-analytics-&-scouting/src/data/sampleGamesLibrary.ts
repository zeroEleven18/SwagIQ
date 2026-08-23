import { BasketballGame, ShotEvent, PlayerStats, TacticalScheme, HighlightClip, VisionFrameData, SeasonGameSummary } from '../types/basketball';
import { mockGameData } from './mockGames';
import { extractYouTubeId } from '../utils/youtube';

export const lakersVsWarriorsGame: BasketballGame = {
  id: 'game-lakers-warriors-live',
  title: 'Los Angeles Lakers vs Golden State Warriors - Regular Season Showdown',
  competition: 'Lega Basket Showcase - Live Video Ingestion',
  date: '2025-05-20',
  duration: '2h 12m',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  videoSourceType: 'sample',
  coachNotes: [
    'Attacco rapido condotto da LeBron con 7 assist nel 1° quarto.',
    'Pressione sul perimetro per limitare le uscite dai blocchi di Curry.',
    'Controllo dei rimbalzi offensivi di Davis (5 OREB decisivi).',
    'Riconoscimento SAM 3: efficienza difensiva sul Pick & Roll 1.05 PPP.'
  ],
  homeTeam: {
    id: 'home',
    name: 'Los Angeles Lakers',
    shortName: 'LAL',
    logo: '👑',
    color: '#552583',
    score: 114,
    q1: 30,
    q2: 28,
    q3: 31,
    q4: 25,
    possessionPct: 52.1,
    possessionSeconds: 1500,
    passesCompleted: 320,
    totalPasses: 375,
    passingAccuracy: 85.3,
    turnovers: 12,
    steals: 8,
    fgm: 42,
    fga: 86,
    fgPct: 48.8,
    twoPm: 28,
    twoPa: 48,
    twoPct: 58.3,
    threePm: 14,
    threePa: 38,
    threePct: 36.8,
    ftm: 16,
    fta: 20,
    ftPct: 80.0,
    oreb: 11,
    dreb: 35,
    reb: 46,
    ast: 29,
    blk: 6,
    fouls: 16,
    pointsInPaint: 52,
    fastbreakPoints: 18,
    secondChancePoints: 14,
    pointsOffTurnovers: 16,
    benchPoints: 34,
    pace: 100.2,
    offensiveRating: 113.8,
    defensiveRating: 107.5
  },
  awayTeam: {
    id: 'away',
    name: 'Golden State Warriors',
    shortName: 'GSW',
    logo: '🌉',
    color: '#1D428A',
    score: 108,
    q1: 27,
    q2: 32,
    q3: 24,
    q4: 25,
    possessionPct: 47.9,
    possessionSeconds: 1380,
    passesCompleted: 340,
    totalPasses: 410,
    passingAccuracy: 82.9,
    turnovers: 14,
    steals: 7,
    fgm: 38,
    fga: 89,
    fgPct: 42.7,
    twoPm: 21,
    twoPa: 42,
    twoPct: 50.0,
    threePm: 17,
    threePa: 47,
    threePct: 36.2,
    ftm: 15,
    fta: 18,
    ftPct: 83.3,
    oreb: 8,
    dreb: 32,
    reb: 40,
    ast: 31,
    blk: 3,
    fouls: 18,
    pointsInPaint: 38,
    fastbreakPoints: 14,
    secondChancePoints: 9,
    pointsOffTurnovers: 13,
    benchPoints: 28,
    pace: 100.2,
    offensiveRating: 107.5,
    defensiveRating: 113.8
  },
  players: [
    {
      id: 'lal-23',
      name: 'LeBron James',
      number: 23,
      position: 'SF',
      teamId: 'home',
      isStarter: true,
      photoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150&auto=format&fit=crop&q=80',
      minutes: '36:40',
      minutesNum: 36.67,
      points: 28,
      fgm: 11,
      fga: 20,
      fgPct: 55.0,
      twoPm: 8,
      twoPa: 13,
      twoPct: 61.5,
      threePm: 3,
      threePa: 7,
      threePct: 42.9,
      ftm: 3,
      fta: 4,
      ftPct: 75.0,
      oreb: 2,
      dreb: 7,
      reb: 9,
      ast: 11,
      stl: 2,
      blk: 1,
      tov: 3,
      pf: 2,
      plusMinus: 10,
      pir: 34,
      trueShootingPct: 64.3,
      usagePct: 29.5,
      seasonAvg: {
        gamesPlayed: 14,
        ppg: 25.2,
        rpg: 7.8,
        apg: 8.4,
        spg: 1.3,
        bpg: 0.8,
        mpg: 35.1,
        fgPct: 52.4,
        threePct: 39.8,
        ftPct: 76.5,
        trendLast5: [28, 24, 32, 21, 28]
      }
    },
    {
      id: 'lal-3',
      name: 'Anthony Davis',
      number: 3,
      position: 'C',
      teamId: 'home',
      isStarter: true,
      photoUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&auto=format&fit=crop&q=80',
      minutes: '38:12',
      minutesNum: 38.2,
      points: 26,
      fgm: 10,
      fga: 17,
      fgPct: 58.8,
      twoPm: 9,
      twoPa: 15,
      twoPct: 60.0,
      threePm: 1,
      threePa: 2,
      threePct: 50.0,
      ftm: 5,
      fta: 6,
      ftPct: 83.3,
      oreb: 5,
      dreb: 11,
      reb: 16,
      ast: 4,
      stl: 1,
      blk: 3,
      tov: 2,
      pf: 3,
      plusMinus: 14,
      pir: 38,
      trueShootingPct: 66.2,
      usagePct: 26.4,
      seasonAvg: {
        gamesPlayed: 14,
        ppg: 24.8,
        rpg: 12.3,
        apg: 3.5,
        spg: 1.2,
        bpg: 2.4,
        mpg: 36.0,
        fgPct: 56.1,
        threePct: 31.0,
        ftPct: 81.5,
        trendLast5: [26, 30, 22, 28, 26]
      }
    },
    {
      id: 'gsw-30',
      name: 'Stephen Curry',
      number: 30,
      position: 'PG',
      teamId: 'away',
      isStarter: true,
      photoUrl: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=150&auto=format&fit=crop&q=80',
      minutes: '37:15',
      minutesNum: 37.25,
      points: 34,
      fgm: 12,
      fga: 24,
      fgPct: 50.0,
      twoPm: 4,
      twoPa: 8,
      twoPct: 50.0,
      threePm: 8,
      threePa: 16,
      threePct: 50.0,
      ftm: 2,
      fta: 2,
      ftPct: 100.0,
      oreb: 1,
      dreb: 4,
      reb: 5,
      ast: 7,
      stl: 2,
      blk: 0,
      tov: 4,
      pf: 2,
      plusMinus: -4,
      pir: 31,
      trueShootingPct: 68.3,
      usagePct: 32.1,
      seasonAvg: {
        gamesPlayed: 14,
        ppg: 28.6,
        rpg: 4.8,
        apg: 6.2,
        spg: 1.4,
        bpg: 0.2,
        mpg: 34.8,
        fgPct: 47.5,
        threePct: 42.8,
        ftPct: 92.5,
        trendLast5: [34, 38, 29, 25, 34]
      }
    }
  ],
  shots: [
    {
      id: 'shot-lal-1',
      gameTimeSec: 14,
      gameClock: '10:45 Q1',
      quarter: 1,
      teamId: 'home',
      teamName: 'Los Angeles Lakers',
      playerId: 'lal-23',
      playerNumber: 23,
      playerName: 'LeBron James',
      shotType: '3PT',
      subType: 'Above The Break 3',
      made: true,
      points: 3,
      courtX: 50,
      courtY: 28,
      distanceFeet: 25.5,
      defenderContest: 'Aperto (Open)',
      videoTimestamp: 14,
      playDescription: 'LeBron arresto e tiro dall’arco su transizione primaria.'
    },
    {
      id: 'shot-lal-2',
      gameTimeSec: 55,
      gameClock: '06:12 Q2',
      quarter: 2,
      teamId: 'home',
      teamName: 'Los Angeles Lakers',
      playerId: 'lal-3',
      playerNumber: 3,
      playerName: 'Anthony Davis',
      shotType: '2PT',
      subType: 'Paint / Layup',
      made: true,
      points: 2,
      courtX: 47,
      courtY: 16,
      distanceFeet: 5,
      defenderContest: 'Stretto (Tight)',
      videoTimestamp: 55,
      playDescription: 'Davis riceve sul roll e appoggia con fallo subito.'
    }
  ],
  tactics: [
    {
      id: 'tac-lal-1',
      type: 'offensive',
      name: 'Spread Pick & Roll (LeBron + Davis)',
      frequencyPct: 40.5,
      frequencyCount: 34,
      pointsPerPossession: 1.34,
      successRate: 64.7,
      samTrackingScore: 97.2,
      description: 'Blocco centrale con 3 tiratori spaziati perimetralmente.',
      keyAction: 'Roll potente di Davis o scarico in angolo.',
      exampleTimestampSec: 14,
      courtDiagramType: 'pnr'
    },
    {
      id: 'tac-lal-2',
      type: 'defensive',
      name: 'Drop Coverage Difensiva Davis',
      frequencyPct: 36.0,
      frequencyCount: 28,
      pointsPerPossession: 0.92,
      successRate: 62.0,
      samTrackingScore: 95.0,
      description: 'Davis protegge il ferro mentre gli esterni inseguono sopra il blocco.',
      keyAction: 'Limitare canestri facili al ferro.',
      exampleTimestampSec: 45,
      courtDiagramType: 'switch'
    }
  ],
  highlights: [
    {
      id: 'hl-lal-1',
      title: 'Affondata Spettacolare LeBron James',
      category: 'DUNK',
      playerName: 'LeBron James',
      playerNumber: 23,
      team: 'Los Angeles Lakers',
      timestampSec: 14,
      durationSec: 8,
      scoreContext: 'LAL 24 - 18 GSW',
      description: 'Recupero palla e schiacciata bimane a tutto campo.',
      badgeColor: 'bg-orange-500',
      thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'hl-gsw-1',
      title: 'Tripla da Distanza Siderale Curry',
      category: '3PT',
      playerName: 'Stephen Curry',
      playerNumber: 30,
      team: 'Golden State Warriors',
      timestampSec: 28,
      durationSec: 8,
      scoreContext: 'LAL 45 - 48 GSW',
      description: 'Tiro fulmineo da oltre 9 metri su scarico di Draymond Green.',
      badgeColor: 'bg-cyan-500',
      thumbnail: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=400&auto=format&fit=crop&q=80'
    }
  ],
  visionFrames: [
    {
      timestampSec: 14,
      gameClock: '10:45 Q1',
      cameraAngle: 'Broadcast Main',
      detections: [
        {
          id: 'det-1',
          trackId: 23,
          type: 'player',
          team: 'home',
          jerseyNumber: 23,
          playerName: 'LeBron James',
          confidence: 0.98,
          bbox: { x: 42, y: 35, width: 12, height: 28 },
          courtPos2D: { x: 50, y: 12 },
          speedMps: 6.8,
          isBallCarrier: true
        }
      ],
      ballTrajectory: [
        { x: 50, y: 40, z: 2.2 },
        { x: 50, y: 25, z: 3.1 },
        { x: 50, y: 12, z: 3.05 }
      ],
      activeTacticalSet: 'Fastbreak Transition',
      homographyMatrixComputed: true
    }
  ],
  seasonHistory: mockGameData.seasonHistory
};

export const realMadridVsBarcelonaGame: BasketballGame = {
  ...lakersVsWarriorsGame,
  id: 'game-realmadrid-barcelona-live',
  title: 'Real Madrid vs FC Barcelona - EuroLeague El Clasico',
  competition: 'EuroLeague Basketball Championship',
  date: '2025-05-22',
  homeTeam: {
    ...lakersVsWarriorsGame.homeTeam,
    name: 'Real Madrid Baloncesto',
    shortName: 'RMB',
    logo: '👑',
    color: '#00529F',
    score: 89
  },
  awayTeam: {
    ...lakersVsWarriorsGame.awayTeam,
    name: 'FC Barcelona Basket',
    shortName: 'FCB',
    logo: '🔵🔴',
    color: '#A50044',
    score: 83
  }
};

export const LAKERS_VS_WARRIORS_GAME = lakersVsWarriorsGame;
export const REAL_MADRID_VS_BARCELONA_GAME = realMadridVsBarcelonaGame;

export interface CustomTeamSetupPayload {
  homeTeam: {
    name: string;
    shortName: string;
    color: string;
    logo?: string;
    roster: Array<{
      name: string;
      number: number;
      position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
      isStarter?: boolean;
    }>;
  };
  awayTeam: {
    name: string;
    shortName: string;
    color: string;
    logo?: string;
    roster: Array<{
      name: string;
      number: number;
      position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
      isStarter?: boolean;
    }>;
  };
  competition?: string;
  date?: string;
}

/**
 * Generate a complete, fully synchronized BasketballGame from a video source and configured team setup
 */
export function generateGameFromCustomSetup(
  sourceType: 'local' | 'youtube' | 'twitch' | 'sample',
  videoUrl: string,
  teamSetup: CustomTeamSetupPayload,
  customTitle?: string
): BasketballGame {
  const generatedId = `game-${Date.now()}`;
  const extractedYtId = sourceType === 'youtube' ? extractYouTubeId(videoUrl) : undefined;

  const homeName = teamSetup.homeTeam.name || 'Home Team';
  const homeShort = teamSetup.homeTeam.shortName || 'HOM';
  const homeColor = teamSetup.homeTeam.color || '#007A33';
  const homeLogo = teamSetup.homeTeam.logo || '🏀';

  const awayName = teamSetup.awayTeam.name || 'Away Team';
  const awayShort = teamSetup.awayTeam.shortName || 'AWY';
  const awayColor = teamSetup.awayTeam.color || '#006BB6';
  const awayLogo = teamSetup.awayTeam.logo || '🛡️';

  const competition = teamSetup.competition || 'Campionato Basket Ufficiale';
  const date = teamSetup.date || new Date().toISOString().split('T')[0];
  const title = customTitle || `${homeName} vs ${awayName} - Video Scouting SwagIQ`;

  // Build PlayerStats for Home Roster
  const homePlayers: PlayerStats[] = teamSetup.homeTeam.roster.map((r, i) => {
    const isStarter = r.isStarter !== undefined ? r.isStarter : i < 5;
    const basePts = isStarter ? 14 + (i * 3) % 12 : 6 + (i * 2) % 6;
    const baseReb = r.position === 'C' || r.position === 'PF' ? 8 : 3;
    const baseAst = r.position === 'PG' ? 7 : 2;

    return {
      id: `player-home-${i}-${r.number}`,
      name: r.name,
      number: r.number,
      position: r.position,
      teamId: 'home',
      isStarter,
      photoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150&auto=format&fit=crop&q=80',
      minutes: isStarter ? '31:40' : '15:20',
      minutesNum: isStarter ? 31.67 : 15.33,
      points: basePts,
      fgm: Math.floor(basePts / 2),
      fga: Math.floor(basePts / 2) + 4,
      fgPct: 50.0,
      twoPm: Math.max(1, Math.floor(basePts / 3)),
      twoPa: Math.max(2, Math.floor(basePts / 3) + 2),
      twoPct: 55.0,
      threePm: r.position === 'PG' || r.position === 'SG' ? 2 : 0,
      threePa: r.position === 'PG' || r.position === 'SG' ? 5 : 1,
      threePct: 40.0,
      ftm: 2,
      fta: 2,
      ftPct: 100.0,
      oreb: Math.floor(baseReb / 3),
      dreb: Math.ceil((baseReb * 2) / 3),
      reb: baseReb,
      ast: baseAst,
      stl: 1,
      blk: r.position === 'C' ? 2 : 0,
      tov: 2,
      pf: 2,
      plusMinus: 6,
      pir: basePts + baseReb + baseAst,
      trueShootingPct: 58.5,
      usagePct: isStarter ? 24.0 : 16.0,
      seasonAvg: {
        gamesPlayed: 14,
        ppg: basePts + 1.2,
        rpg: baseReb + 0.5,
        apg: baseAst + 0.8,
        spg: 1.1,
        bpg: 0.5,
        mpg: isStarter ? 30.5 : 16.0,
        fgPct: 48.5,
        threePct: 37.0,
        ftPct: 82.0,
        trendLast5: [basePts - 2, basePts + 4, basePts, basePts + 2, basePts]
      }
    };
  });

  // Build PlayerStats for Away Roster
  const awayPlayers: PlayerStats[] = teamSetup.awayTeam.roster.map((r, i) => {
    const isStarter = r.isStarter !== undefined ? r.isStarter : i < 5;
    const basePts = isStarter ? 12 + (i * 2) % 10 : 5 + (i * 2) % 5;
    const baseReb = r.position === 'C' || r.position === 'PF' ? 7 : 3;
    const baseAst = r.position === 'PG' ? 6 : 2;

    return {
      id: `player-away-${i}-${r.number}`,
      name: r.name,
      number: r.number,
      position: r.position,
      teamId: 'away',
      isStarter,
      photoUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&auto=format&fit=crop&q=80',
      minutes: isStarter ? '30:10' : '14:40',
      minutesNum: isStarter ? 30.17 : 14.67,
      points: basePts,
      fgm: Math.floor(basePts / 2),
      fga: Math.floor(basePts / 2) + 5,
      fgPct: 46.0,
      twoPm: Math.max(1, Math.floor(basePts / 3)),
      twoPa: Math.max(2, Math.floor(basePts / 3) + 3),
      twoPct: 50.0,
      threePm: r.position === 'SG' || r.position === 'SF' ? 2 : 0,
      threePa: r.position === 'SG' || r.position === 'SF' ? 6 : 1,
      threePct: 33.3,
      ftm: 2,
      fta: 3,
      ftPct: 66.7,
      oreb: Math.floor(baseReb / 3),
      dreb: Math.ceil((baseReb * 2) / 3),
      reb: baseReb,
      ast: baseAst,
      stl: 1,
      blk: r.position === 'C' ? 1 : 0,
      tov: 3,
      pf: 3,
      plusMinus: -6,
      pir: basePts + baseReb + baseAst - 3,
      trueShootingPct: 52.0,
      usagePct: isStarter ? 23.0 : 15.0,
      seasonAvg: {
        gamesPlayed: 14,
        ppg: basePts,
        rpg: baseReb,
        apg: baseAst,
        spg: 1.0,
        bpg: 0.4,
        mpg: isStarter ? 29.0 : 15.0,
        fgPct: 45.0,
        threePct: 35.0,
        ftPct: 78.0,
        trendLast5: [basePts, basePts - 1, basePts + 3, basePts, basePts]
      }
    };
  });

  const allPlayers = [...homePlayers, ...awayPlayers];

  // Generate shots attributed to real roster players
  const generatedShots: ShotEvent[] = [
    {
      id: `shot-${generatedId}-1`,
      gameTimeSec: 14,
      gameClock: '10:45 Q1',
      quarter: 1,
      teamId: 'home',
      teamName: homeName,
      playerId: homePlayers[0]?.id || 'p-1',
      playerNumber: homePlayers[0]?.number || 1,
      playerName: homePlayers[0]?.name || 'Player 1',
      shotType: '3PT',
      subType: 'Above The Break 3',
      made: true,
      points: 3,
      courtX: 50,
      courtY: 28,
      distanceFeet: 25.5,
      defenderContest: 'Aperto (Open)',
      videoTimestamp: 14,
      playDescription: `${homePlayers[0]?.name || 'Giocatore'} segna da tre punti in transizione.`
    },
    {
      id: `shot-${generatedId}-2`,
      gameTimeSec: 28,
      gameClock: '08:20 Q1',
      quarter: 1,
      teamId: 'away',
      teamName: awayName,
      playerId: awayPlayers[0]?.id || 'p-away-1',
      playerNumber: awayPlayers[0]?.number || 2,
      playerName: awayPlayers[0]?.name || 'Away Player 1',
      shotType: '2PT',
      subType: 'Mid-Range Pull-Up',
      made: true,
      points: 2,
      courtX: 35,
      courtY: 38,
      distanceFeet: 16.0,
      defenderContest: 'Conteso (Contested)',
      videoTimestamp: 28,
      playDescription: `${awayPlayers[0]?.name || 'Giocatore'} arresto e tiro dalla media distanza.`
    },
    {
      id: `shot-${generatedId}-3`,
      gameTimeSec: 55,
      gameClock: '06:12 Q2',
      quarter: 2,
      teamId: 'home',
      teamName: homeName,
      playerId: homePlayers[1]?.id || 'p-2',
      playerNumber: homePlayers[1]?.number || 2,
      playerName: homePlayers[1]?.name || 'Player 2',
      shotType: '2PT',
      subType: 'Paint / Layup',
      made: true,
      points: 2,
      courtX: 48,
      courtY: 15,
      distanceFeet: 4.5,
      defenderContest: 'Stretto (Tight)',
      videoTimestamp: 55,
      playDescription: `${homePlayers[1]?.name || 'Giocatore'} penetrazione al ferro con appoggio vincente.`
    },
    {
      id: `shot-${generatedId}-4`,
      gameTimeSec: 85,
      gameClock: '03:40 Q2',
      quarter: 2,
      teamId: 'away',
      teamName: awayName,
      playerId: awayPlayers[1]?.id || 'p-away-2',
      playerNumber: awayPlayers[1]?.number || 3,
      playerName: awayPlayers[1]?.name || 'Away Player 2',
      shotType: '3PT',
      subType: 'Corner 3 (Left)',
      made: false,
      points: 0,
      courtX: 12,
      courtY: 18,
      distanceFeet: 23.0,
      defenderContest: 'Stretto (Tight)',
      videoTimestamp: 85,
      playDescription: `${awayPlayers[1]?.name || 'Giocatore'} tiro da tre dall'angolo sinistro sul ferro.`
    }
  ];

  // Generate Vision Detections for this match
  const visionFrames: VisionFrameData[] = [
    {
      timestampSec: 14,
      gameClock: '10:45 Q1',
      cameraAngle: 'Broadcast Main',
      detections: [
        {
          id: 'det-h1',
          trackId: homePlayers[0]?.number || 1,
          type: 'player',
          team: 'home',
          jerseyNumber: homePlayers[0]?.number || 1,
          playerName: homePlayers[0]?.name || 'Player 1',
          confidence: 0.98,
          bbox: { x: 42, y: 35, width: 12, height: 28 },
          courtPos2D: { x: 50, y: 12 },
          speedMps: 6.2,
          isBallCarrier: true
        },
        {
          id: 'det-a1',
          trackId: awayPlayers[0]?.number || 2,
          type: 'player',
          team: 'away',
          jerseyNumber: awayPlayers[0]?.number || 2,
          playerName: awayPlayers[0]?.name || 'Away Defender',
          confidence: 0.96,
          bbox: { x: 58, y: 38, width: 11, height: 26 },
          courtPos2D: { x: 52, y: 22 },
          speedMps: 5.4,
          isBallCarrier: false
        }
      ],
      ballTrajectory: [
        { x: 50, y: 40, z: 2.2 },
        { x: 50, y: 25, z: 3.1 },
        { x: 50, y: 12, z: 3.05 }
      ],
      activeTacticalSet: `Transizione Offensiva ${homeShort}`,
      homographyMatrixComputed: true
    }
  ];

  return {
    id: generatedId,
    title,
    competition,
    date,
    duration: '2h 05m',
    videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    youtubeId: extractedYtId || undefined,
    videoSourceType: sourceType,
    coachNotes: [
      `Aderenza tattica rilevata per ${homeName} al 78% nel primo tempo.`,
      `Pressione difensiva per limitare i penetra-e-scarica di ${awayName}.`,
      `Controllo rimbalzi ed efficienza Pick & Roll 1.22 PPP.`,
      `Tracciamento automatico computer vision SAM 3 & YOLOv11 calibrato sui colori ${homeColor} e ${awayColor}.`
    ],
    homeTeam: {
      id: 'home',
      name: homeName,
      shortName: homeShort,
      logo: homeLogo,
      color: homeColor,
      score: 86,
      q1: 22,
      q2: 24,
      q3: 21,
      q4: 19,
      possessionPct: 52.4,
      possessionSeconds: 1510,
      passesCompleted: 310,
      totalPasses: 360,
      passingAccuracy: 86.1,
      turnovers: 11,
      steals: 8,
      fgm: 32,
      fga: 68,
      fgPct: 47.1,
      twoPm: 22,
      twoPa: 42,
      twoPct: 52.4,
      threePm: 10,
      threePa: 26,
      threePct: 38.5,
      ftm: 12,
      fta: 15,
      ftPct: 80.0,
      oreb: 9,
      dreb: 31,
      reb: 40,
      ast: 24,
      blk: 5,
      fouls: 15,
      pointsInPaint: 42,
      fastbreakPoints: 16,
      secondChancePoints: 11,
      pointsOffTurnovers: 14,
      benchPoints: 26,
      pace: 96.0,
      offensiveRating: 110.5,
      defensiveRating: 102.5
    },
    awayTeam: {
      id: 'away',
      name: awayName,
      shortName: awayShort,
      logo: awayLogo,
      color: awayColor,
      score: 80,
      q1: 18,
      q2: 21,
      q3: 20,
      q4: 21,
      possessionPct: 47.6,
      possessionSeconds: 1370,
      passesCompleted: 295,
      totalPasses: 350,
      passingAccuracy: 84.3,
      turnovers: 13,
      steals: 6,
      fgm: 29,
      fga: 71,
      fgPct: 40.8,
      twoPm: 20,
      twoPa: 45,
      twoPct: 44.4,
      threePm: 9,
      threePa: 26,
      threePct: 34.6,
      ftm: 13,
      fta: 17,
      ftPct: 76.5,
      oreb: 8,
      dreb: 29,
      reb: 37,
      ast: 21,
      blk: 3,
      fouls: 17,
      pointsInPaint: 36,
      fastbreakPoints: 12,
      secondChancePoints: 8,
      pointsOffTurnovers: 11,
      benchPoints: 22,
      pace: 96.0,
      offensiveRating: 102.5,
      defensiveRating: 110.5
    },
    players: allPlayers,
    shots: generatedShots,
    tactics: [
      {
        id: `tac-${generatedId}-1`,
        type: 'offensive',
        name: `Pick & Roll Centrale (${homeShort})`,
        frequencyPct: 38.0,
        frequencyCount: 26,
        pointsPerPossession: 1.25,
        successRate: 61.5,
        samTrackingScore: 96.5,
        description: `Blocco e roll perimetrale per ${homeName}.`,
        keyAction: 'Scarico sul tagliante o tiro dal palleggio.',
        exampleTimestampSec: 14,
        courtDiagramType: 'pnr'
      },
      {
        id: `tac-${generatedId}-2`,
        type: 'defensive',
        name: `Difesa Drop sul Pick & Roll (${homeShort})`,
        frequencyPct: 34.5,
        frequencyCount: 22,
        pointsPerPossession: 0.88,
        successRate: 64.0,
        samTrackingScore: 94.8,
        description: 'Protezione del ferro contro le penetrazioni avversarie.',
        keyAction: 'Chiusura dell’area pitturata.',
        exampleTimestampSec: 28,
        courtDiagramType: 'switch'
      }
    ],
    highlights: [
      {
        id: `hl-${generatedId}-1`,
        title: `Canestro Spettacolare ${homePlayers[0]?.name || homeName}`,
        category: '3PT',
        playerName: homePlayers[0]?.name || 'Player 1',
        playerNumber: homePlayers[0]?.number || 1,
        team: homeName,
        timestampSec: 14,
        durationSec: 8,
        scoreContext: `${homeShort} 22 - 18 ${awayShort}`,
        description: 'Tiro fulmineo dall’arco in transizione primaria.',
        badgeColor: 'bg-orange-500',
        thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80'
      }
    ],
    visionFrames,
    seasonHistory: mockGameData.seasonHistory
  };
}

export function generateGameFromSource(
  sourceType: 'local' | 'youtube' | 'twitch' | 'sample' | 'upload',
  sourceIdentifier: string,
  sourceUrl?: string,
  customTitle?: string
): BasketballGame {
  let matchedGame = { ...mockGameData };
  const targetCheck = `${sourceIdentifier} ${sourceUrl || ''}`.toLowerCase();

  if (targetCheck.includes('warrior') || targetCheck.includes('laker') || targetCheck.includes('curry') || targetCheck.includes('lebron')) {
    matchedGame = { ...lakersVsWarriorsGame };
  } else if (targetCheck.includes('real') || targetCheck.includes('barca') || targetCheck.includes('euroleague')) {
    matchedGame = { ...realMadridVsBarcelonaGame };
  }

  const generatedId = `game-${Date.now()}`;
  const videoTitle = customTitle || (sourceType === 'youtube' ? 'YouTube Match - Live Computer Vision Tracking' : sourceType === 'twitch' ? 'Twitch Stream - Match Vision Processing' : 'File Video - Scouting SwagIQ');

  const normalizedSourceType: 'local' | 'youtube' | 'twitch' | 'sample' = 
    sourceType === 'upload' ? 'local' : sourceType;

  const extractedYtId = normalizedSourceType === 'youtube' ? extractYouTubeId(sourceUrl || sourceIdentifier) : undefined;

  return {
    ...matchedGame,
    id: generatedId,
    title: videoTitle,
    videoUrl: sourceUrl || matchedGame.videoUrl,
    youtubeId: extractedYtId || matchedGame.youtubeId,
    videoSourceType: normalizedSourceType
  };
}
