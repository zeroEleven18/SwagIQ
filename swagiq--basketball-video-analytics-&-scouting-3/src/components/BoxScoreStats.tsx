import React, { useState, useMemo } from 'react';
import { 
  Table2, 
  Search, 
  ArrowUpDown, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  BarChart3,
  X,
  Radio,
  RotateCcw,
  Cpu,
  Footprints,
  Layers,
  Award
} from 'lucide-react';
import { BasketballGame, PlayerStats, TeamStats } from '../types/basketball';
import { extractGameStatistics, resetGameToZero } from '../utils/statisticsExtractor';

interface BoxScoreStatsProps {
  game: BasketballGame;
  currentTimeSec?: number;
  onUpdateGame?: (game: BasketballGame) => void;
  onJumpToTimestamp?: (seconds: number) => void;
}

export const BoxScoreStats: React.FC<BoxScoreStatsProps> = ({ 
  game, 
  currentTimeSec = 0,
  onUpdateGame,
  onJumpToTimestamp
}) => {
  const [extractionMode, setExtractionMode] = useState<'live' | 'full'>('live');
  const [selectedTeamTab, setSelectedTeamTab] = useState<'home' | 'away' | 'both'>('both');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof PlayerStats | 'distanceCoveredKm'>('points');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedPlayerModal, setSelectedPlayerModal] = useState<PlayerStats | null>(null);

  // Extract statistics dynamically using the Statistics Extractor engine
  const extractedData = useMemo(() => {
    return extractGameStatistics(game, currentTimeSec, extractionMode);
  }, [game, currentTimeSec, extractionMode]);

  const activeHomeTeam = extractedData.homeTeam;
  const activeAwayTeam = extractedData.awayTeam;
  const activePlayers = extractedData.players;

  // Sorting handler
  const handleSort = (field: keyof PlayerStats | 'distanceCoveredKm') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Reset match to 0
  const handleResetToZero = () => {
    if (window.confirm('Vuoi azzerare tutte le statistiche e i tiri della partita a 0-0 per iniziare una nuova sessione di rilevamento pulita?')) {
      const cleanGame = resetGameToZero(game);
      if (onUpdateGame) {
        onUpdateGame(cleanGame);
      }
      try {
        localStorage.setItem('swagiq_last_viewed_game', JSON.stringify(cleanGame));
      } catch (e) {}
    }
  };

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter and sort players
  const filteredPlayers = activePlayers
    .filter((player) => {
      if (selectedTeamTab !== 'both' && player.teamId !== selectedTeamTab) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          player.name.toLowerCase().includes(query) ||
          player.number.toString().includes(query) ||
          player.position.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortField as keyof PlayerStats] as any;
      const bVal = b[sortField as keyof PlayerStats] as any;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* 0. Statistics Extractor & Live Mode Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">SwagIQ Statistics Extractor Engine</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Roboflow: gio-rossi/agent v1
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {extractionMode === 'live' ? (
                <>
                  Modalità <strong className="text-emerald-400">Live Timestamp Video ({formatTime(currentTimeSec)})</strong>: {extractedData.totalEventsCount} tiri ed eventi elaborati fino al minutaggio corrente.
                </>
              ) : (
                <>
                  Modalità <strong className="text-orange-400">Partita Completa</strong>: {game.shots?.length || 0} tiri totali registrati.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setExtractionMode('live')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                extractionMode === 'live'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>Live al Video ({formatTime(currentTimeSec)})</span>
            </button>
            <button
              onClick={() => setExtractionMode('full')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                extractionMode === 'full'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Tutta la Partita</span>
            </button>
          </div>

          {/* Reset to 0 button */}
          <button
            onClick={handleResetToZero}
            title="Azzera tutte le statistiche per iniziare una registrazione live da zero"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-red-950/60 border border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-300 text-xs font-bold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Azzera a 0-0</span>
          </button>
        </div>
      </div>

      {/* 1. Official Team Stats Comparison Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Table2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Statistiche Ufficiali di Squadra (Team Analytics)</h2>
              <p className="text-xs text-slate-400">
                Punteggio reale {activeHomeTeam.score} - {activeAwayTeam.score}, possesso palla, percentuali 2P/3P/TL, TS% e rimbalzi
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-emerald-400">
              <span>{activeHomeTeam.logo}</span>
              <span>{activeHomeTeam.name}</span>
              <span className="font-mono text-base ml-1">({activeHomeTeam.score})</span>
            </div>
            <span className="text-slate-600 font-bold">VS</span>
            <div className="flex items-center space-x-1.5 font-bold text-cyan-400">
              <span className="font-mono text-base mr-1">({activeAwayTeam.score})</span>
              <span>{activeAwayTeam.name}</span>
              <span>{activeAwayTeam.logo}</span>
            </div>
          </div>
        </div>

        {/* Possession & Passing Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          {/* Possession Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-400 flex items-center">
                {activeHomeTeam.shortName} • {activeHomeTeam.possessionPct}%
              </span>
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                Possesso Palla Effettivo
              </span>
              <span className="text-cyan-400 flex items-center">
                {activeAwayTeam.possessionPct}% • {activeAwayTeam.shortName}
              </span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${activeHomeTeam.possessionPct}%` }}
                className="bg-emerald-500 transition-all duration-500"
              />
              <div
                style={{ width: `${activeAwayTeam.possessionPct}%` }}
                className="bg-cyan-500 transition-all duration-500"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Tempo: {Math.floor(activeHomeTeam.possessionSeconds / 60)}m {activeHomeTeam.possessionSeconds % 60}s</span>
              <span>Tempo: {Math.floor(activeAwayTeam.possessionSeconds / 60)}m {activeAwayTeam.possessionSeconds % 60}s</span>
            </div>
          </div>

          {/* Passing Accuracy Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-400">
                {activeHomeTeam.passesCompleted}/{activeHomeTeam.totalPasses} ({activeHomeTeam.passingAccuracy}%)
              </span>
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                Passaggi Completati
              </span>
              <span className="text-cyan-400">
                {activeAwayTeam.passesCompleted}/{activeAwayTeam.totalPasses} ({activeAwayTeam.passingAccuracy}%)
              </span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${activeHomeTeam.passingAccuracy}%` }}
                className="bg-emerald-500 transition-all duration-500"
              />
              <div
                style={{ width: `${activeAwayTeam.passingAccuracy}%` }}
                className="bg-cyan-500 transition-all duration-500"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Precisione {activeHomeTeam.shortName}: {activeHomeTeam.passingAccuracy}%</span>
              <span>Precisione {activeAwayTeam.shortName}: {activeAwayTeam.passingAccuracy}%</span>
            </div>
          </div>
        </div>

        {/* Detailed Stats Comparison Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Turnovers & Steals */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block" title="Palle Perse totali commesse dalla squadra durante il match">Palle Perse (TOV)</span>
            <div className="flex justify-center items-center space-x-3 font-mono font-bold text-base">
              <span className="text-emerald-400">{activeHomeTeam.turnovers}</span>
              <span className="text-slate-600 text-xs">/</span>
              <span className="text-cyan-400">{activeAwayTeam.turnovers}</span>
            </div>
            <span className="text-[9px] text-slate-500 block">{activeHomeTeam.shortName} vs {activeAwayTeam.shortName}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block" title="Palle Rubate e recuperi difensivi effettuati">Palle Rubate (STL)</span>
            <div className="flex justify-center items-center space-x-3 font-mono font-bold text-base">
              <span className="text-emerald-400">{activeHomeTeam.steals}</span>
              <span className="text-slate-600 text-xs">/</span>
              <span className="text-cyan-400">{activeAwayTeam.steals}</span>
            </div>
            <span className="text-[9px] text-slate-500 block">{activeHomeTeam.shortName} vs {activeAwayTeam.shortName}</span>
          </div>

          {/* Team Fouls */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block" title="Falli Personali e di Squadra commessi">Falli Totali (PF)</span>
            <div className="flex justify-center items-center space-x-3 font-mono font-bold text-base">
              <span className="text-emerald-400">{activeHomeTeam.fouls}</span>
              <span className="text-slate-600 text-xs">/</span>
              <span className="text-cyan-400">{activeAwayTeam.fouls}</span>
            </div>
            <span className="text-[9px] text-slate-500 block">{activeHomeTeam.shortName} vs {activeAwayTeam.shortName}</span>
          </div>

          {/* 2PT & 3PT Shooting */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block" title="Percentuale e canestri da 2 punti realizzati/tentati">Tiri da 2 (2PT)</span>
            <div className="flex justify-center items-center space-x-2 font-mono font-bold text-sm">
              <span className="text-emerald-400">{activeHomeTeam.twoPm}/{activeHomeTeam.twoPa} ({activeHomeTeam.twoPct}%)</span>
            </div>
            <div className="text-[11px] font-mono text-cyan-400 font-semibold">
              {activeAwayTeam.shortName}: {activeAwayTeam.twoPm}/{activeAwayTeam.twoPa} ({activeAwayTeam.twoPct}%)
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block" title="Percentuale e canestri da 3 punti realizzati/tentati">Tiri da 3 (3PT)</span>
            <div className="flex justify-center items-center space-x-2 font-mono font-bold text-sm">
              <span className="text-emerald-400">{activeHomeTeam.threePm}/{activeHomeTeam.threePa} ({activeHomeTeam.threePct}%)</span>
            </div>
            <div className="text-[11px] font-mono text-cyan-400 font-semibold">
              {activeAwayTeam.shortName}: {activeAwayTeam.threePm}/{activeAwayTeam.threePa} ({activeAwayTeam.threePct}%)
            </div>
          </div>

          {/* Free Throws */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block" title="Tiri Liberi segnati su tiri tentati dalla lunetta">Tiri Liberi (FT)</span>
            <div className="flex justify-center items-center space-x-2 font-mono font-bold text-sm">
              <span className="text-emerald-400">{activeHomeTeam.ftm}/{activeHomeTeam.fta} ({activeHomeTeam.ftPct}%)</span>
            </div>
            <div className="text-[11px] font-mono text-cyan-400 font-semibold">
              {activeAwayTeam.shortName}: {activeAwayTeam.ftm}/{activeAwayTeam.fta} ({activeAwayTeam.ftPct}%)
            </div>
          </div>

          {/* Rebounds Breakdown */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block" title="Rimbalzi totali suddivisi in Offensivi (OREB) e Difensivi (DREB)">Rimbalzi (REB)</span>
            <div className="text-xs font-mono font-bold text-emerald-400">
              {activeHomeTeam.shortName}: {activeHomeTeam.oreb}O / {activeHomeTeam.dreb}D ({activeHomeTeam.reb})
            </div>
            <div className="text-xs font-mono font-bold text-cyan-400">
              {activeAwayTeam.shortName}: {activeAwayTeam.oreb}O / {activeAwayTeam.dreb}D ({activeAwayTeam.reb})
            </div>
          </div>
        </div>
      </div>

      {/* 2. Official Players Box Score Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        {/* Table Filter & Search Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Team Switcher Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedTeamTab('both')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTeamTab === 'both' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrambe le Squadre
            </button>
            <button
              onClick={() => setSelectedTeamTab('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTeamTab === 'home' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {activeHomeTeam.name}
            </button>
            <button
              onClick={() => setSelectedTeamTab('away')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTeamTab === 'away' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {activeAwayTeam.name}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca giocatore o numero..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 w-56 sm:w-72"
            />
          </div>
        </div>

        {/* Responsive Table with Strict Column Widths & Perfect Alignment */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 select-none">
                <th className="py-3 px-3 min-w-[220px]">Giocatore</th>
                <th className="py-3 px-2 text-center w-12" title="POS - Ruolo del giocatore (PG: Playmaker, SG: Guardia, SF: Ala Piccola, PF: Ala Grande, C: Centro)">
                  <span className="border-b border-dotted border-slate-600 cursor-help">POS</span>
                </th>
                <th 
                  onClick={() => handleSort('minutesNum')}
                  className="py-3 px-2 text-center w-14 cursor-pointer hover:text-orange-400"
                  title="MIN - Minuti e secondi trascorsi sul parquet"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-slate-600">MIN</span>
                    <ArrowUpDown className="w-2.5 h-2.5" />
                  </div>
                </th>
                {/* Distance Covered KM column */}
                <th 
                  onClick={() => handleSort('distanceCoveredKm')}
                  className="py-3 px-2 text-center w-20 cursor-pointer hover:text-cyan-400 text-cyan-400 font-bold"
                  title="KM - Distanza percorsa in campo rilevata con tracking Vision SAM (approssimata a 2 cifre decimali)"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <Footprints className="w-3 h-3 text-cyan-400" />
                    <span className="border-b border-dotted border-cyan-500">KM</span>
                    <ArrowUpDown className="w-2.5 h-2.5" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('points')}
                  className="py-3 px-2 text-center w-14 cursor-pointer hover:text-orange-400 font-bold text-orange-400"
                  title="PTS - Punti totali realizzati (2PT + 3PT + FT)"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-slate-600">PTS</span>
                    <ArrowUpDown className="w-2.5 h-2.5" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('fgPct')}
                  className="py-3 px-2 text-center w-24 cursor-pointer hover:text-orange-400"
                  title="FG - Canestri totali dal campo (FGM/FGA) e percentuale"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-slate-600">Tiri Campo</span>
                    <ArrowUpDown className="w-2.5 h-2.5" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('twoPct')}
                  className="py-3 px-2 text-center w-24 cursor-pointer hover:text-orange-400"
                  title="2P - Canestri da 2 punti (2PM/2PA) e percentuale"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-slate-600">2P M/A</span>
                    <ArrowUpDown className="w-2.5 h-2.5" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('threePct')}
                  className="py-3 px-2 text-center w-24 cursor-pointer hover:text-orange-400"
                  title="3P - Canestri da 3 punti (3PM/3PA) e percentuale"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-slate-600">3P M/A</span>
                    <ArrowUpDown className="w-2.5 h-2.5" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('ftPct')}
                  className="py-3 px-2 text-center w-20 cursor-pointer hover:text-orange-400"
                  title="FT - Tiri liberi segnati su tentati (FTM/FTA) e percentuale"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-slate-600">TL M/A</span>
                    <ArrowUpDown className="w-2.5 h-2.5" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('oreb')}
                  className="py-3 px-2 text-center w-12 cursor-pointer hover:text-orange-400"
                  title="O-REB - Rimbalzi Offensivi catturati"
                >
                  <span className="border-b border-dotted border-slate-600">O-REB</span>
                </th>
                <th 
                  onClick={() => handleSort('dreb')}
                  className="py-3 px-2 text-center w-12 cursor-pointer hover:text-orange-400"
                  title="D-REB - Rimbalzi Difensivi catturati"
                >
                  <span className="border-b border-dotted border-slate-600">D-REB</span>
                </th>
                <th 
                  onClick={() => handleSort('reb')}
                  className="py-3 px-2 text-center w-12 cursor-pointer hover:text-orange-400 text-emerald-400 font-bold"
                  title="REB - Rimbalzi Totali (O-REB + D-REB)"
                >
                  <span className="border-b border-dotted border-slate-600">REB</span>
                </th>
                <th 
                  onClick={() => handleSort('ast')}
                  className="py-3 px-2 text-center w-12 cursor-pointer hover:text-orange-400 text-cyan-400 font-bold"
                  title="AST - Assist vincenti serviti"
                >
                  <span className="border-b border-dotted border-slate-600">AST</span>
                </th>
                <th 
                  onClick={() => handleSort('stl')}
                  className="py-3 px-2 text-center w-10 cursor-pointer hover:text-orange-400"
                  title="STL - Palle recuperate"
                >
                  <span className="border-b border-dotted border-slate-600">STL</span>
                </th>
                <th 
                  onClick={() => handleSort('blk')}
                  className="py-3 px-2 text-center w-10 cursor-pointer hover:text-orange-400"
                  title="BLK - Stoppate difensive"
                >
                  <span className="border-b border-dotted border-slate-600">BLK</span>
                </th>
                <th 
                  onClick={() => handleSort('tov')}
                  className="py-3 px-2 text-center w-10 cursor-pointer hover:text-orange-400 text-rose-400"
                  title="TOV - Palle perse (turnovers)"
                >
                  <span className="border-b border-dotted border-slate-600">TO</span>
                </th>
                <th 
                  onClick={() => handleSort('pf')}
                  className="py-3 px-2 text-center w-10 cursor-pointer hover:text-orange-400"
                  title="PF - Falli personali"
                >
                  <span className="border-b border-dotted border-slate-600">PF</span>
                </th>
                <th 
                  onClick={() => handleSort('trueShootingPct')}
                  className="py-3 px-2 text-center w-14 cursor-pointer hover:text-orange-400 text-amber-400 font-bold"
                  title="TS% - True Shooting Percentage: efficienza reale di tiro"
                >
                  <span className="border-b border-dotted border-slate-600">TS%</span>
                </th>
                <th 
                  onClick={() => handleSort('pir')}
                  className="py-3 px-2 text-center w-14 cursor-pointer hover:text-orange-400 text-purple-400 font-bold"
                  title="PIR - Valutazione Ufficiale Lega Basket / Performance Index Rating FIBA"
                >
                  <span className="border-b border-dotted border-slate-600">VAL</span>
                </th>
                <th className="py-3 px-3 text-right w-16">Scheda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPlayers.map((player) => {
                const distanceKmFormatted = (player.distanceCoveredKm ?? (player.minutesNum * 0.115)).toFixed(2);
                
                return (
                  <tr 
                    key={player.id}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedPlayerModal(player)}
                  >
                    {/* Player Name, Photo & Number: Strict Uniform Layout across all rows */}
                    <td className="py-2.5 px-3 min-w-[220px]">
                      <div className="flex items-center space-x-3">
                        {/* Rigid Fixed 36x36 Photo Box */}
                        <div className="relative w-9 h-9 min-w-[36px] max-w-[36px] min-h-[36px] max-h-[36px] shrink-0">
                          <img 
                            src={player.photoUrl} 
                            alt={player.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-800 shrink-0"
                          />
                          <span 
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center border border-slate-950 shadow-sm shrink-0 ${
                              player.teamId === 'home' ? 'bg-emerald-600 text-white' : 'bg-cyan-600 text-white'
                            }`}
                          >
                            {player.number}
                          </span>
                        </div>

                        {/* Player Text Box */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5 leading-tight">
                            <span className="font-bold text-white text-xs truncate max-w-[130px]" title={player.name}>
                              {player.name}
                            </span>
                            {player.isStarter && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-normal shrink-0">
                                S
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {player.teamId === 'home' ? activeHomeTeam.shortName : activeAwayTeam.shortName} • #{player.number}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-2.5 px-2 text-center font-mono font-semibold text-slate-400">
                      {player.position}
                    </td>

                    {/* Minutes */}
                    <td className="py-2.5 px-2 text-center font-mono text-slate-300">
                      {player.minutes}
                    </td>

                    {/* KM Distance Covered (2 decimal digits) */}
                    <td className="py-2.5 px-2 text-center font-mono font-semibold text-cyan-300 bg-cyan-950/20 rounded-md">
                      {distanceKmFormatted}
                      <span className="text-[9px] text-slate-500 ml-0.5 font-normal">km</span>
                    </td>

                    {/* Points */}
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-orange-400 text-sm">
                      {player.points}
                    </td>

                    {/* FG */}
                    <td className="py-2.5 px-2 text-center font-mono text-slate-300">
                      {player.fgm}/{player.fga} <span className="text-[10px] text-slate-500">({player.fgPct}%)</span>
                    </td>

                    {/* 2PT */}
                    <td className="py-2.5 px-2 text-center font-mono text-slate-300">
                      {player.twoPm}/{player.twoPa} <span className="text-[10px] text-slate-500">({player.twoPct}%)</span>
                    </td>

                    {/* 3PT */}
                    <td className="py-2.5 px-2 text-center font-mono text-slate-300">
                      {player.threePm}/{player.threePa} <span className="text-[10px] text-slate-500">({player.threePct}%)</span>
                    </td>

                    {/* FT */}
                    <td className="py-2.5 px-2 text-center font-mono text-slate-300">
                      {player.ftm}/{player.fta} <span className="text-[10px] text-slate-500">({player.ftPct}%)</span>
                    </td>

                    {/* O-REB */}
                    <td className="py-2.5 px-2 text-center font-mono text-slate-400">
                      {player.oreb}
                    </td>

                    {/* D-REB */}
                    <td className="py-2.5 px-2 text-center font-mono text-slate-400">
                      {player.dreb}
                    </td>

                    {/* Total REB */}
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-emerald-400">
                      {player.reb}
                    </td>

                    {/* Assists */}
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-cyan-400">
                      {player.ast}
                    </td>

                    {/* Steals */}
                    <td className="py-2.5 px-2 text-center font-mono text-slate-300">
                      {player.stl}
                    </td>

                    {/* Blocks */}
                    <td className="py-2.5 px-2 text-center font-mono text-slate-300">
                      {player.blk}
                    </td>

                    {/* Turnovers */}
                    <td className="py-2.5 px-2 text-center font-mono text-rose-400">
                      {player.tov}
                    </td>

                    {/* Personal Fouls */}
                    <td className="py-2.5 px-2 text-center font-mono text-slate-400">
                      {player.pf}
                    </td>

                    {/* True Shooting % */}
                    <td className="py-2.5 px-2 text-center font-mono font-semibold text-amber-400">
                      {player.trueShootingPct}%
                    </td>

                    {/* PIR / Valutazione */}
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-purple-400 text-sm">
                      {player.pir}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlayerModal(player);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-orange-400 transition-colors"
                        title="Apri scheda dettagliata e medie stagionali"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Detailed Player Modal */}
      {selectedPlayerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3.5">
                <img 
                  src={selectedPlayerModal.photoUrl} 
                  alt={selectedPlayerModal.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500/40"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-white">{selectedPlayerModal.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      #{selectedPlayerModal.number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ruolo: <strong className="text-white">{selectedPlayerModal.position}</strong> • Squadra: <strong className="text-white">{selectedPlayerModal.teamId === 'home' ? activeHomeTeam.name : activeAwayTeam.name}</strong>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedPlayerModal(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Match Stats Grid vs Season Averages (Including KM Percorsi) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Points */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Punti (PTS)</span>
                <div className="font-mono font-bold text-xl text-orange-400">
                  {selectedPlayerModal.points}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Media: <span className="text-white font-semibold">{selectedPlayerModal.seasonAvg?.ppg || 0}</span>
                </div>
              </div>

              {/* KM Percorsi (Match vs Season Average) */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-cyan-400 block mb-1 flex items-center justify-center space-x-1 font-semibold">
                  <Footprints className="w-3.5 h-3.5" />
                  <span>Distanza KM</span>
                </span>
                <div className="font-mono font-bold text-xl text-cyan-300">
                  {(selectedPlayerModal.distanceCoveredKm ?? (selectedPlayerModal.minutesNum * 0.115)).toFixed(2)}
                  <span className="text-xs font-normal text-slate-400 ml-0.5">km</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Media: <span className="text-cyan-200 font-semibold">{(selectedPlayerModal.seasonAvg?.kmPerGame ?? 3.85).toFixed(2)}</span> km
                </div>
              </div>

              {/* Rebounds */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Rimbalzi (REB)</span>
                <div className="font-mono font-bold text-xl text-emerald-400">
                  {selectedPlayerModal.reb}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Media: <span className="text-white font-semibold">{selectedPlayerModal.seasonAvg?.rpg || 0}</span>
                </div>
              </div>

              {/* Assists */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Assist (AST)</span>
                <div className="font-mono font-bold text-xl text-cyan-400">
                  {selectedPlayerModal.ast}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Media: <span className="text-white font-semibold">{selectedPlayerModal.seasonAvg?.apg || 0}</span>
                </div>
              </div>

              {/* 3PT % */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Tiro da 3 (3P%)</span>
                <div className="font-mono font-bold text-xl text-purple-400">
                  {selectedPlayerModal.threePct}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Media: <span className="text-white font-semibold">{selectedPlayerModal.seasonAvg?.threePct || 0}%</span>
                </div>
              </div>
            </div>

            {/* Advanced Metrics & Proiezioni su 40 Minuti (Per-Minute Stats) */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <span className="font-bold text-white text-xs flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-orange-400" />
                <span>Statistiche Avanzate & Proiezione su 40 Minuti</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">True Shooting (TS%)</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{selectedPlayerModal.trueShootingPct}%</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Valutazione Lega (PIR)</span>
                  <span className="font-mono font-bold text-purple-400 text-sm">{selectedPlayerModal.pir}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Punti per 40 min</span>
                  <span className="font-mono font-bold text-orange-400 text-sm">
                    {selectedPlayerModal.minutesNum > 0 ? ((selectedPlayerModal.points / selectedPlayerModal.minutesNum) * 40).toFixed(1) : '0.0'}
                  </span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">KM per 40 min</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">
                    {selectedPlayerModal.minutesNum > 0 
                      ? (((selectedPlayerModal.distanceCoveredKm ?? (selectedPlayerModal.minutesNum * 0.115)) / selectedPlayerModal.minutesNum) * 40).toFixed(2) + ' km'
                      : '0.00 km'}
                  </span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Rimbalzi per 40 min</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {selectedPlayerModal.minutesNum > 0 ? ((selectedPlayerModal.reb / selectedPlayerModal.minutesNum) * 40).toFixed(1) : '0.0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
