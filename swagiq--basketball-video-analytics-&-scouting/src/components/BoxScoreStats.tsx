import React, { useState } from 'react';
import { 
  Table2, 
  Search, 
  ArrowUpDown, 
  User, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  Award,
  BarChart3,
  X,
  Clock,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { BasketballGame, PlayerStats, TeamStats } from '../types/basketball';

interface BoxScoreStatsProps {
  game: BasketballGame;
}

export const BoxScoreStats: React.FC<BoxScoreStatsProps> = ({ game }) => {
  const [selectedTeamTab, setSelectedTeamTab] = useState<'home' | 'away' | 'both'>('both');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof PlayerStats>('points');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedPlayerModal, setSelectedPlayerModal] = useState<PlayerStats | null>(null);

  // Sorting handler
  const handleSort = (field: keyof PlayerStats) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter players
  const filteredPlayers = game.players
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
      const aVal = a[sortField] as any;
      const bVal = b[sortField] as any;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
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
                Possesso palla, passaggi completati, palle perse/riconquistate, tiri da 2, 3 e liberi, rimbalzi offensivi e difensivi
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-emerald-400">
              <span>{game.homeTeam.logo}</span>
              <span>{game.homeTeam.name}</span>
            </div>
            <span className="text-slate-600 font-bold">VS</span>
            <div className="flex items-center space-x-1.5 font-bold text-cyan-400">
              <span>{game.awayTeam.name}</span>
              <span>{game.awayTeam.logo}</span>
            </div>
          </div>
        </div>

        {/* Possession & Passing Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          {/* Possession Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-400 flex items-center">
                {game.homeTeam.shortName} • {game.homeTeam.possessionPct}%
              </span>
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                Possesso Palla Effettivo
              </span>
              <span className="text-cyan-400 flex items-center">
                {game.awayTeam.possessionPct}% • {game.awayTeam.shortName}
              </span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${game.homeTeam.possessionPct}%` }}
                className="bg-emerald-500 transition-all duration-500"
              />
              <div
                style={{ width: `${game.awayTeam.possessionPct}%` }}
                className="bg-cyan-500 transition-all duration-500"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Tempo: {Math.floor(game.homeTeam.possessionSeconds / 60)}m {game.homeTeam.possessionSeconds % 60}s</span>
              <span>Tempo: {Math.floor(game.awayTeam.possessionSeconds / 60)}m {game.awayTeam.possessionSeconds % 60}s</span>
            </div>
          </div>

          {/* Passing Accuracy Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-400">
                {game.homeTeam.passesCompleted}/{game.homeTeam.totalPasses} ({game.homeTeam.passingAccuracy}%)
              </span>
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                Passaggi Completati
              </span>
              <span className="text-cyan-400">
                {game.awayTeam.passesCompleted}/{game.awayTeam.totalPasses} ({game.awayTeam.passingAccuracy}%)
              </span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${game.homeTeam.passingAccuracy}%` }}
                className="bg-emerald-500 transition-all duration-500"
              />
              <div
                style={{ width: `${game.awayTeam.passingAccuracy}%` }}
                className="bg-cyan-500 transition-all duration-500"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Precisione BOS: {game.homeTeam.passingAccuracy}%</span>
              <span>Precisione NYK: {game.awayTeam.passingAccuracy}%</span>
            </div>
          </div>
        </div>

        {/* Detailed Stats Comparison Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Turnovers & Steals */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block" title="Palle Perse totali commesse dalla squadra durante il match">Palle Perse (TOV)</span>
            <div className="flex justify-center items-center space-x-3 font-mono font-bold text-base">
              <span className="text-emerald-400">{game.homeTeam.turnovers}</span>
              <span className="text-slate-600 text-xs">/</span>
              <span className="text-cyan-400">{game.awayTeam.turnovers}</span>
            </div>
            <span className="text-[9px] text-slate-500 block">BOS vs NYK</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block" title="Palle Rubate e recuperi difensivi effettuati">Palle Rubate (STL)</span>
            <div className="flex justify-center items-center space-x-3 font-mono font-bold text-base">
              <span className="text-emerald-400">{game.homeTeam.steals}</span>
              <span className="text-slate-600 text-xs">/</span>
              <span className="text-cyan-400">{game.awayTeam.steals}</span>
            </div>
            <span className="text-[9px] text-emerald-500 font-semibold block">+3 BOS Recuperate</span>
          </div>

          {/* Team Fouls */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block" title="Falli Personali e di Squadra commessi">Falli Totali (PF)</span>
            <div className="flex justify-center items-center space-x-3 font-mono font-bold text-base">
              <span className="text-emerald-400">18</span>
              <span className="text-slate-600 text-xs">/</span>
              <span className="text-cyan-400">21</span>
            </div>
            <span className="text-[9px] text-slate-500 block">BOS (Bonus) vs NYK</span>
          </div>

          {/* 2PT & 3PT Shooting */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block" title="Percentuale e canestri da 2 punti realizzati/tentati">Tiri da 2 (2PT)</span>
            <div className="flex justify-center items-center space-x-2 font-mono font-bold text-sm">
              <span className="text-emerald-400">{game.homeTeam.twoPm}/{game.homeTeam.twoPa} ({game.homeTeam.twoPct}%)</span>
            </div>
            <div className="text-[11px] font-mono text-cyan-400 font-semibold">
              NYK: {game.awayTeam.twoPm}/{game.awayTeam.twoPa} ({game.awayTeam.twoPct}%)
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block" title="Percentuale e canestri da 3 punti realizzati/tentati">Tiri da 3 (3PT)</span>
            <div className="flex justify-center items-center space-x-2 font-mono font-bold text-sm">
              <span className="text-emerald-400">{game.homeTeam.threePm}/{game.homeTeam.threePa} ({game.homeTeam.threePct}%)</span>
            </div>
            <div className="text-[11px] font-mono text-cyan-400 font-semibold">
              NYK: {game.awayTeam.threePm}/{game.awayTeam.threePa} ({game.awayTeam.threePct}%)
            </div>
          </div>

          {/* Free Throws */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block" title="Tiri Liberi segnati su tiri tentati dalla lunetta">Tiri Liberi (FT)</span>
            <div className="flex justify-center items-center space-x-2 font-mono font-bold text-sm">
              <span className="text-emerald-400">{game.homeTeam.ftm}/{game.homeTeam.fta} ({game.homeTeam.ftPct}%)</span>
            </div>
            <div className="text-[11px] font-mono text-cyan-400 font-semibold">
              NYK: {game.awayTeam.ftm}/{game.awayTeam.fta} ({game.awayTeam.ftPct}%)
            </div>
          </div>

          {/* Rebounds Breakdown */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block" title="Rimbalzi totali suddivisi in Offensivi (OREB) e Difensivi (DREB)">Rimbalzi (REB)</span>
            <div className="text-xs font-mono font-bold text-emerald-400">
              BOS: {game.homeTeam.oreb}O / {game.homeTeam.dreb}D ({game.homeTeam.reb})
            </div>
            <div className="text-xs font-mono font-bold text-cyan-400">
              NYK: {game.awayTeam.oreb}O / {game.awayTeam.dreb}D ({game.awayTeam.reb})
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
              {game.homeTeam.name}
            </button>
            <button
              onClick={() => setSelectedTeamTab('away')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTeamTab === 'away' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {game.awayTeam.name}
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

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 select-none">
                <th className="py-3 px-3">Giocatore</th>
                <th className="py-3 px-2 text-center" title="POS - Ruolo del giocatore (PG: Playmaker, SG: Guardia, SF: Ala Piccola, PF: Ala Grande, C: Centro)">
                  <span className="border-b border-dotted border-slate-600 cursor-help">POS</span>
                </th>
                <th 
                  onClick={() => handleSort('minutesNum')}
                  className="py-3 px-2 text-center cursor-pointer hover:text-orange-400"
                  title="MIN - Minuti e secondi totali trascorsi in campo"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-slate-600">MIN</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('distanceCoveredKm')}
                  className="py-3 px-2 text-center cursor-pointer hover:text-orange-400 text-sky-400"
                  title="KM - Chilometri percorsi dal giocatore in campo (Tracking Fisico & Atletico)"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-sky-500/60">KM</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('points')}
                  className="py-3 px-2 text-center cursor-pointer hover:text-orange-400 font-bold text-orange-400"
                  title="PTS - Punti totali realizzati (Points)"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-orange-500/60">PTS</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-2 text-center" title="FG - Tiri dal Campo (Field Goals): Canestri realizzati / tentati e percentuale di successo">
                  <span className="border-b border-dotted border-slate-600 cursor-help">FG (M/A %)</span>
                </th>
                <th className="py-3 px-2 text-center" title="3PT - Tiri da 3 Punti: Realizzati / tentati oltre l'arco dei 3 punti e percentuale">
                  <span className="border-b border-dotted border-slate-600 cursor-help">3PT (M/A %)</span>
                </th>
                <th className="py-3 px-2 text-center" title="FT - Tiri Liberi (Free Throws): Realizzati / tentati dalla lunetta e percentuale">
                  <span className="border-b border-dotted border-slate-600 cursor-help">FT (M/A %)</span>
                </th>
                <th 
                  onClick={() => handleSort('reb')}
                  className="py-3 px-2 text-center cursor-pointer hover:text-orange-400"
                  title="REB - Rimbalzi totali conquistati (O: Offensivi / D: Difensivi)"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-slate-600">REB (O/D)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('ast')}
                  className="py-3 px-2 text-center cursor-pointer hover:text-orange-400"
                  title="AST - Assist: Passaggi decisivi che generano un canestro immediato"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-slate-600">AST</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('stl')}
                  className="py-3 px-2 text-center cursor-pointer hover:text-orange-400"
                  title="STL - Palle Rubate (Steals): Recuperi difensivi e intercettazioni di palla"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-slate-600">STL</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('blk')}
                  className="py-3 px-2 text-center cursor-pointer hover:text-orange-400"
                  title="BLK - Stoppate effettuate (Blocks) su tiri avversari"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-slate-600">BLK</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('tov')}
                  className="py-3 px-2 text-center cursor-pointer hover:text-orange-400"
                  title="TOV - Palle Perse (Turnovers): Errori di gestione palla o infrazioni"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-slate-600">TOV</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('pf')}
                  className="py-3 px-2 text-center cursor-pointer hover:text-orange-400"
                  title="PF - Falli Personali commessi (Personal Fouls)"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-slate-600">PF</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('plusMinus')}
                  className="py-3 px-2 text-center cursor-pointer hover:text-orange-400"
                  title="+/- Plus/Minus: Differenziale punti di squadra mentre il giocatore è sul parquet"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-slate-600">+/-</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('pir')}
                  className="py-3 px-2 text-center cursor-pointer hover:text-orange-400 font-bold text-amber-400"
                  title="PIR - Performance Index Rating: Valutazione globale di efficienza"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="border-b border-dotted border-amber-500/60">PIR / EFF</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-2 text-center">Azione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPlayers.map((player) => {
                const isHome = player.teamId === 'home';
                const team = isHome ? game.homeTeam : game.awayTeam;
                const oppLogo = game.awayTeam.logo;

                return (
                  <tr 
                    key={player.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedPlayerModal(player)}
                  >
                    {/* Player Info: Show Player Photo for Our Team (Home), and Opponent Team Logo for Away Team */}
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex items-center space-x-2.5">
                        {isHome ? (
                          /* Our Team Player Photo */
                          player.photoUrl ? (
                            <img
                              src={player.photoUrl}
                              alt={player.name}
                              className="w-8 h-8 rounded-full object-cover border border-emerald-500/50 shadow-sm"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-[10px] font-bold text-emerald-400 font-mono">
                              #{player.number}
                            </div>
                          )
                        ) : (
                          /* Opponent Team: Show Opponent Team Logo instead of Player Photo */
                          oppLogo && (oppLogo.startsWith('http') || oppLogo.startsWith('data:')) ? (
                            <img
                              src={oppLogo}
                              alt={game.awayTeam.name}
                              className="w-8 h-8 rounded-full object-cover border border-cyan-500/50 shadow-sm bg-slate-950 p-0.5"
                            />
                          ) : (
                            <div 
                              style={{ borderColor: game.awayTeam.color || '#06b6d4' }}
                              className="w-8 h-8 rounded-full bg-slate-950 border-2 flex items-center justify-center text-xs font-black shadow-sm"
                            >
                              {oppLogo ? (
                                <span>{oppLogo}</span>
                              ) : (
                                <span className="text-[10px] text-cyan-400 font-bold">
                                  {game.awayTeam.shortName || 'AVV'}
                                </span>
                              )}
                            </div>
                          )
                        )}
                        <div>
                          <div className="font-bold text-white flex items-center space-x-1.5">
                            <span className={isHome ? 'text-emerald-400 font-mono' : 'text-cyan-400 font-mono'}>
                              #{player.number}
                            </span>
                            <span>{player.name}</span>
                            {player.isStarter && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                                5B
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {isHome ? game.homeTeam.shortName : game.awayTeam.shortName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-2.5 px-2 text-center text-slate-300 font-semibold">{player.position}</td>

                    {/* Minutes */}
                    <td className="py-2.5 px-2 text-center text-slate-300">{player.minutes}</td>

                    {/* Km Percorsi (Distance) */}
                    <td className="py-2.5 px-2 text-center text-sky-400 font-bold">
                      {player.distanceCoveredKm ? `${player.distanceCoveredKm.toFixed(2)} km` : '-'}
                    </td>

                    {/* Points */}
                    <td className="py-2.5 px-2 text-center font-bold text-sm text-orange-400">
                      {player.points}
                    </td>

                    {/* FG */}
                    <td className="py-2.5 px-2 text-center text-slate-300 text-[11px]">
                      {player.fgm}-{player.fga} <span className="text-slate-500">({player.fgPct}%)</span>
                    </td>

                    {/* 3PT */}
                    <td className="py-2.5 px-2 text-center text-slate-300 text-[11px]">
                      {player.threePm}-{player.threePa} <span className="text-slate-500">({player.threePct}%)</span>
                    </td>

                    {/* FT */}
                    <td className="py-2.5 px-2 text-center text-slate-300 text-[11px]">
                      {player.ftm}-{player.fta} <span className="text-slate-500">({player.ftPct}%)</span>
                    </td>

                    {/* Rebounds */}
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-200">
                      {player.reb} <span className="text-[10px] text-slate-500">({player.oreb}/{player.dreb})</span>
                    </td>

                    {/* Assists */}
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-200">{player.ast}</td>

                    {/* Steals */}
                    <td className="py-2.5 px-2 text-center text-emerald-400 font-semibold">{player.stl}</td>

                    {/* Blocks */}
                    <td className="py-2.5 px-2 text-center text-rose-400 font-semibold">{player.blk}</td>

                    {/* Turnovers */}
                    <td className="py-2.5 px-2 text-center text-amber-400">{player.tov}</td>

                    {/* Fouls */}
                    <td className="py-2.5 px-2 text-center text-slate-400">{player.pf}</td>

                    {/* +/- */}
                    <td className="py-2.5 px-2 text-center font-bold">
                      <span className={player.plusMinus >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                      </span>
                    </td>

                    {/* PIR / Eff */}
                    <td className="py-2.5 px-2 text-center font-bold text-amber-400">
                      {player.pir}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-2 text-center font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlayerModal(player);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-orange-500 text-white text-[11px] font-semibold transition-colors"
                      >
                        Media Stagionale
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Player Career & Seasonal Average Comparison Modal */}
      {selectedPlayerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-4">
                {selectedPlayerModal.teamId === 'home' ? (
                  selectedPlayerModal.photoUrl ? (
                    <img
                      src={selectedPlayerModal.photoUrl}
                      alt={selectedPlayerModal.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-emerald-950 border-2 border-emerald-500/50 flex items-center justify-center text-lg font-bold text-emerald-400 font-mono">
                      #{selectedPlayerModal.number}
                    </div>
                  )
                ) : (
                  game.awayTeam.logo && (game.awayTeam.logo.startsWith('http') || game.awayTeam.logo.startsWith('data:')) ? (
                    <img
                      src={game.awayTeam.logo}
                      alt={game.awayTeam.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-lg bg-slate-950 p-1"
                    />
                  ) : (
                    <div 
                      style={{ borderColor: game.awayTeam.color || '#06b6d4' }}
                      className="w-16 h-16 rounded-2xl bg-slate-950 border-2 flex items-center justify-center text-xl font-black shadow-lg"
                    >
                      {game.awayTeam.logo || game.awayTeam.shortName || 'AVV'}
                    </div>
                  )
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-lg text-orange-400">
                      #{selectedPlayerModal.number}
                    </span>
                    <h3 className="font-bold text-xl text-white">{selectedPlayerModal.name}</h3>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-semibold font-mono">
                      {selectedPlayerModal.position}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedPlayerModal.teamId === 'home' ? game.homeTeam.name : game.awayTeam.name} • Report Individuale e Tracking Fisico
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlayerModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Athletic & Physical Tracking Performance (Vision Computer Vision) */}
            <div className="bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 p-3.5 rounded-2xl border border-sky-800/40 grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider block mb-0.5">Km Percorsi in Partita</span>
                <span className="font-mono font-black text-lg text-white">
                  {selectedPlayerModal.distanceCoveredKm ? `${selectedPlayerModal.distanceCoveredKm.toFixed(2)} km` : '3.85 km'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Distanza totale</span>
              </div>
              <div className="border-x border-slate-800 px-2">
                <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block mb-0.5">Velocità di Punta</span>
                <span className="font-mono font-black text-lg text-white">
                  {selectedPlayerModal.topSpeedKmh ? `${selectedPlayerModal.topSpeedKmh.toFixed(1)} km/h` : '27.4 km/h'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Picco accelerazione</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block mb-0.5">Scatti ad Alta Intensità</span>
                <span className="font-mono font-black text-lg text-white">
                  {selectedPlayerModal.sprintsCount || 22} sprint
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">&gt; 20 km/h</span>
              </div>
            </div>

            {/* Match vs Season Averages Comparison Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Points */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Punti (PTS)</span>
                <div className="font-mono font-bold text-xl text-orange-400">
                  {selectedPlayerModal.points}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Media: <span className="text-white font-semibold">{selectedPlayerModal.seasonAvg.ppg}</span> PPG
                </div>
                <span className={`text-[10px] font-semibold block mt-0.5 ${
                  selectedPlayerModal.points >= selectedPlayerModal.seasonAvg.ppg ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {selectedPlayerModal.points >= selectedPlayerModal.seasonAvg.ppg ? '▲ Sopra media' : '▼ Sotto media'}
                </span>
              </div>

              {/* Rebounds */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Rimbalzi (REB)</span>
                <div className="font-mono font-bold text-xl text-emerald-400">
                  {selectedPlayerModal.reb}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Media: <span className="text-white font-semibold">{selectedPlayerModal.seasonAvg.rpg}</span> RPG
                </div>
                <span className={`text-[10px] font-semibold block mt-0.5 ${
                  selectedPlayerModal.reb >= selectedPlayerModal.seasonAvg.rpg ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {selectedPlayerModal.reb >= selectedPlayerModal.seasonAvg.rpg ? '▲ Sopra media' : '▼ Sotto media'}
                </span>
              </div>

              {/* Assists */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Assist (AST)</span>
                <div className="font-mono font-bold text-xl text-cyan-400">
                  {selectedPlayerModal.ast}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Media: <span className="text-white font-semibold">{selectedPlayerModal.seasonAvg.apg}</span> APG
                </div>
                <span className={`text-[10px] font-semibold block mt-0.5 ${
                  selectedPlayerModal.ast >= selectedPlayerModal.seasonAvg.apg ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {selectedPlayerModal.ast >= selectedPlayerModal.seasonAvg.apg ? '▲ Sopra media' : '▼ Sotto media'}
                </span>
              </div>

              {/* 3PT % */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Tiro da 3 (3P%)</span>
                <div className="font-mono font-bold text-xl text-purple-400">
                  {selectedPlayerModal.threePct}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Media: <span className="text-white font-semibold">{selectedPlayerModal.seasonAvg.threePct}%</span>
                </div>
                <span className={`text-[10px] font-semibold block mt-0.5 ${
                  selectedPlayerModal.threePct >= selectedPlayerModal.seasonAvg.threePct ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {selectedPlayerModal.threePct >= selectedPlayerModal.seasonAvg.threePct ? '▲ Ottima mano' : '▼ In calo'}
                </span>
              </div>
            </div>

            {/* Trend Last 5 Games */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1.5 text-orange-400" />
                  Progressione Punti Ultime 5 Gare
                </span>
                <span className="text-slate-400 font-mono">
                  Presenze Stagionali: {selectedPlayerModal.seasonAvg.gamesPlayed} partite
                </span>
              </div>

              <div className="flex items-end justify-between space-x-2 pt-3 h-24">
                {selectedPlayerModal.seasonAvg.trendLast5.map((pts, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center space-y-1">
                    <span className="text-[11px] font-mono font-bold text-orange-400">{pts}</span>
                    <div
                      style={{ height: `${(pts / 40) * 100}%` }}
                      className="w-full bg-gradient-to-t from-orange-600 to-amber-400 rounded-t-lg transition-all duration-500"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">G{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Metrics / Coach Analysis Badges */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">True Shooting (TS%)</span>
                <span className="font-mono font-bold text-white text-sm">{selectedPlayerModal.trueShootingPct}%</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Usage Rate (USG%)</span>
                <span className="font-mono font-bold text-white text-sm">{selectedPlayerModal.usagePct}%</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Minutaggio Medio</span>
                <span className="font-mono font-bold text-white text-sm">{selectedPlayerModal.seasonAvg.mpg} min</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
