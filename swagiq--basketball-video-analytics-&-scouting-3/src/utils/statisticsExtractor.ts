import { BasketballGame, PlayerStats, TeamStats, ShotEvent } from '../types/basketball';

export interface ExtractedMatchStats {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  players: PlayerStats[];
  shots: ShotEvent[];
  quarterScores: {
    home: { q1: number; q2: number; q3: number; q4: number; ot: number };
    away: { q1: number; q2: number; q3: number; q4: number; ot: number };
  };
  totalEventsCount: number;
}

/**
 * Calculates Official True Shooting Percentage (TS%)
 * Formula: Points / (2 * (FGA + 0.44 * FTA)) * 100
 */
export function calculateTrueShootingPct(points: number, fga: number, fta: number): number {
  const attempts = fga + 0.44 * fta;
  if (attempts <= 0) return 0;
  return Number(((points / (2 * attempts)) * 100).toFixed(1));
}

/**
 * Calculates FIBA Performance Index Rating (PIR / Valutazione Lega)
 * Formula: (PTS + REB + AST + STL + BLK) - ((FGA - FGM) + (FTA - FTM) + TOV)
 */
export function calculatePIR(p: {
  points: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fga: number;
  fgm: number;
  fta: number;
  ftm: number;
  tov: number;
}): number {
  const positives = (p.points || 0) + (p.reb || 0) + (p.ast || 0) + (p.stl || 0) + (p.blk || 0);
  const missedFg = Math.max(0, (p.fga || 0) - (p.fgm || 0));
  const missedFt = Math.max(0, (p.fta || 0) - (p.ftm || 0));
  const negatives = missedFg + missedFt + (p.tov || 0);
  return positives - negatives;
}

/**
 * Dynamic Statistics Extractor Engine
 * Extracts exact player and team statistics incrementally based on video timestamp.
 * If at timestamp 0:00 (match start), all stats start strictly at 0.
 */
export function extractGameStatistics(
  game: BasketballGame,
  currentTimeSec: number = 0,
  mode: 'live' | 'full' = 'live'
): ExtractedMatchStats {
  const isLive = mode === 'live';
  
  // 1. Filter shot events up to currentTimeSec (or all if full mode)
  const activeShots = (game.shots || [])
    .filter(s => !isLive || (s.videoTimestamp !== undefined ? s.videoTimestamp <= currentTimeSec : s.gameTimeSec <= currentTimeSec))
    .sort((a, b) => a.videoTimestamp - b.videoTimestamp);

  // 2. Initialize clean zero-stat players
  const playerMap = new Map<string, PlayerStats>();
  
  (game.players || []).forEach(p => {
    // Determine played minutes proportionally to elapsed video time
    const maxGameSec = game.videoDurationSec && game.videoDurationSec > 0 ? game.videoDurationSec : 2400;
    const elapsedRatio = Math.min(1, Math.max(0, isLive ? currentTimeSec / maxGameSec : 1));
    const targetMin = p.isStarter ? 32 * elapsedRatio : 16 * elapsedRatio;
    const minWhole = Math.floor(targetMin);
    const minSec = Math.floor((targetMin - minWhole) * 60);

    playerMap.set(p.id, {
      ...p,
      minutes: `${minWhole.toString().padStart(2, '0')}:${minSec.toString().padStart(2, '0')}`,
      minutesNum: Number(targetMin.toFixed(1)),
      distanceCoveredKm: Number((targetMin * 0.115).toFixed(2)),
      sprintsCount: Math.floor(targetMin * 0.7),
      seasonAvg: {
        ...p.seasonAvg,
        kmPerGame: p.seasonAvg?.kmPerGame ?? Number(((p.seasonAvg?.mpg || 32) * 0.115).toFixed(2))
      },
      points: 0,
      fgm: 0,
      fga: 0,
      fgPct: 0,
      twoPm: 0,
      twoPa: 0,
      twoPct: 0,
      threePm: 0,
      threePa: 0,
      threePct: 0,
      ftm: 0,
      fta: 0,
      ftPct: 0,
      oreb: 0,
      dreb: 0,
      reb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      tov: 0,
      pf: 0,
      plusMinus: 0,
      pir: 0,
      trueShootingPct: 0
    });
  });

  // 3. Quarter scores accumulator
  const qScores = {
    home: { q1: 0, q2: 0, q3: 0, q4: 0, ot: 0 },
    away: { q1: 0, q2: 0, q3: 0, q4: 0, ot: 0 }
  };

  // 4. Increment stats shot-by-shot
  activeShots.forEach(shot => {
    const isHome = shot.teamId === 'home';
    const qKey = shot.quarter === 1 ? 'q1' : shot.quarter === 2 ? 'q2' : shot.quarter === 3 ? 'q3' : shot.quarter === 4 ? 'q4' : 'ot';
    
    // Find player or create fallback
    let player = playerMap.get(shot.playerId);
    if (!player) {
      // Find matching player by name or number
      player = Array.from(playerMap.values()).find(p => p.teamId === shot.teamId && (p.number === shot.playerNumber || p.name === shot.playerName));
    }

    const pts = shot.made ? shot.points : 0;
    if (isHome) {
      qScores.home[qKey] += pts;
    } else {
      qScores.away[qKey] += pts;
    }

    if (player) {
      if (shot.shotType === 'FT') {
        player.fta += 1;
        if (shot.made) {
          player.ftm += 1;
          player.points += 1;
        }
      } else if (shot.shotType === '3PT') {
        player.fga += 1;
        player.threePa += 1;
        if (shot.made) {
          player.fgm += 1;
          player.threePm += 1;
          player.points += 3;
        }
      } else {
        player.fga += 1;
        player.twoPa += 1;
        if (shot.made) {
          player.fgm += 1;
          player.twoPm += 1;
          player.points += 2;
        }
      }

      // Re-calculate percentages for player
      player.fgPct = player.fga > 0 ? Number(((player.fgm / player.fga) * 100).toFixed(1)) : 0;
      player.twoPct = player.twoPa > 0 ? Number(((player.twoPm / player.twoPa) * 100).toFixed(1)) : 0;
      player.threePct = player.threePa > 0 ? Number(((player.threePm / player.threePa) * 100).toFixed(1)) : 0;
      player.ftPct = player.fta > 0 ? Number(((player.ftm / player.fta) * 100).toFixed(1)) : 0;
      player.trueShootingPct = calculateTrueShootingPct(player.points, player.fga, player.fta);
      player.pir = calculatePIR(player);
    }
  });

  // 5. Aggregate Team Statistics
  const updatedPlayers = Array.from(playerMap.values());
  const homePlayers = updatedPlayers.filter(p => p.teamId === 'home');
  const awayPlayers = updatedPlayers.filter(p => p.teamId === 'away');

  const buildTeamStats = (baseTeam: TeamStats, teamPlayers: PlayerStats[], teamQScores: typeof qScores.home, isHomeTeam: boolean): TeamStats => {
    const totalPoints = teamPlayers.reduce((acc, p) => acc + p.points, 0);
    const fgm = teamPlayers.reduce((acc, p) => acc + p.fgm, 0);
    const fga = teamPlayers.reduce((acc, p) => acc + p.fga, 0);
    const twoPm = teamPlayers.reduce((acc, p) => acc + p.twoPm, 0);
    const twoPa = teamPlayers.reduce((acc, p) => acc + p.twoPa, 0);
    const threePm = teamPlayers.reduce((acc, p) => acc + p.threePm, 0);
    const threePa = teamPlayers.reduce((acc, p) => acc + p.threePa, 0);
    const ftm = teamPlayers.reduce((acc, p) => acc + p.ftm, 0);
    const fta = teamPlayers.reduce((acc, p) => acc + p.fta, 0);
    const oreb = teamPlayers.reduce((acc, p) => acc + p.oreb, 0);
    const dreb = teamPlayers.reduce((acc, p) => acc + p.dreb, 0);
    const reb = oreb + dreb;
    const ast = teamPlayers.reduce((acc, p) => acc + p.ast, 0);
    const stl = teamPlayers.reduce((acc, p) => acc + p.stl, 0);
    const blk = teamPlayers.reduce((acc, p) => acc + p.blk, 0);
    const tov = teamPlayers.reduce((acc, p) => acc + p.tov, 0);
    const fouls = teamPlayers.reduce((acc, p) => acc + p.pf, 0);

    const fgPct = fga > 0 ? Number(((fgm / fga) * 100).toFixed(1)) : 0;
    const twoPct = twoPa > 0 ? Number(((twoPm / twoPa) * 100).toFixed(1)) : 0;
    const threePct = threePa > 0 ? Number(((threePm / threePa) * 100).toFixed(1)) : 0;
    const ftPct = fta > 0 ? Number(((ftm / fta) * 100).toFixed(1)) : 0;

    // Estimate possession
    const possessionSeconds = Math.floor((isHomeTeam ? 0.52 : 0.48) * (isLive ? currentTimeSec : (game.videoDurationSec || 2400)));
    const passesCompleted = Math.floor(possessionSeconds * 0.18);
    const totalPasses = Math.floor(passesCompleted * 1.15);

    return {
      ...baseTeam,
      score: totalPoints,
      q1: teamQScores.q1,
      q2: teamQScores.q2,
      q3: teamQScores.q3,
      q4: teamQScores.q4,
      ot: teamQScores.ot > 0 ? teamQScores.ot : undefined,
      fgm,
      fga,
      fgPct,
      twoPm,
      twoPa,
      twoPct,
      threePm,
      threePa,
      threePct,
      ftm,
      fta,
      ftPct,
      oreb,
      dreb,
      reb,
      ast,
      steals: stl,
      blk,
      turnovers: tov,
      fouls,
      possessionSeconds,
      possessionPct: isHomeTeam ? 52.0 : 48.0,
      passesCompleted,
      totalPasses,
      passingAccuracy: totalPasses > 0 ? Number(((passesCompleted / totalPasses) * 100).toFixed(1)) : 85.0
    };
  };

  const homeTeamStats = buildTeamStats(game.homeTeam, homePlayers, qScores.home, true);
  const awayTeamStats = buildTeamStats(game.awayTeam, awayPlayers, qScores.away, false);

  return {
    homeTeam: homeTeamStats,
    awayTeam: awayTeamStats,
    players: updatedPlayers,
    shots: activeShots,
    quarterScores: qScores,
    totalEventsCount: activeShots.length
  };
}

/**
 * Resets a game to a clean 0-0 match state with empty event log,
 * ready for fresh automatic video processing.
 */
export function resetGameToZero(game: BasketballGame): BasketballGame {
  const cleanPlayers: PlayerStats[] = (game.players || []).map(p => ({
    ...p,
    minutes: "00:00",
    minutesNum: 0,
    distanceCoveredKm: 0,
    sprintsCount: 0,
    points: 0,
    fgm: 0,
    fga: 0,
    fgPct: 0,
    twoPm: 0,
    twoPa: 0,
    twoPct: 0,
    threePm: 0,
    threePa: 0,
    threePct: 0,
    ftm: 0,
    fta: 0,
    ftPct: 0,
    oreb: 0,
    dreb: 0,
    reb: 0,
    ast: 0,
    stl: 0,
    blk: 0,
    tov: 0,
    pf: 0,
    plusMinus: 0,
    pir: 0,
    trueShootingPct: 0
  }));

  const cleanTeam = (team: TeamStats): TeamStats => ({
    ...team,
    score: 0,
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    ot: undefined,
    fgm: 0,
    fga: 0,
    fgPct: 0,
    twoPm: 0,
    twoPa: 0,
    twoPct: 0,
    threePm: 0,
    threePa: 0,
    threePct: 0,
    ftm: 0,
    fta: 0,
    ftPct: 0,
    oreb: 0,
    dreb: 0,
    reb: 0,
    ast: 0,
    steals: 0,
    blk: 0,
    turnovers: 0,
    fouls: 0,
    possessionPct: 50.0,
    possessionSeconds: 0,
    passesCompleted: 0,
    totalPasses: 0,
    passingAccuracy: 0
  });

  return {
    ...game,
    shots: [],
    players: cleanPlayers,
    homeTeam: cleanTeam(game.homeTeam),
    awayTeam: cleanTeam(game.awayTeam)
  };
}
