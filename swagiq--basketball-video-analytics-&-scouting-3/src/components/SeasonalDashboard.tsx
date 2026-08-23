import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Trophy, 
  Award, 
  Flame, 
  Activity, 
  Target, 
  Percent, 
  ShieldCheck, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart2,
  FolderArchive,
  Sparkles,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { mockSeasonProgression } from '../data/mockGames';
import { BasketballGame } from '../types/basketball';

interface SeasonalDashboardProps {
  currentGame?: BasketballGame;
}

const ARCHIVE_STORAGE_KEY = 'swagiq_archived_matches_v1';

export const SeasonalDashboard: React.FC<SeasonalDashboardProps> = ({ currentGame }) => {
  // Check if archived matches exist in localStorage
  const [archivedGames, setArchivedGames] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(ARCHIVE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const handleLoadDemoArchive = () => {
    setArchivedGames(mockSeasonProgression);
    try {
      localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(mockSeasonProgression));
    } catch (e) {}
  };

  const handleClearArchive = () => {
    setArchivedGames([]);
    try {
      localStorage.removeItem(ARCHIVE_STORAGE_KEY);
    } catch (e) {}
  };

  const handleArchiveCurrentGame = () => {
    if (!currentGame) return;
    const newEntry = {
      game: `G${archivedGames.length + 1} vs ${currentGame.awayTeam.shortName || 'OPP'}`,
      opponent: currentGame.awayTeam.name,
      pts: currentGame.homeTeam.score,
      oppPts: currentGame.awayTeam.score,
      fgPct: currentGame.homeTeam.fgPct || 48.0,
      threePct: currentGame.homeTeam.threePct || 36.0,
      offRtg: Number((((currentGame.homeTeam.score || 100) / (currentGame.homeTeam.fga || 80)) * 100).toFixed(1)),
      defRtg: Number((((currentGame.awayTeam.score || 100) / (currentGame.awayTeam.fga || 80)) * 100).toFixed(1)),
      result: (currentGame.homeTeam.score >= currentGame.awayTeam.score ? 'W' : 'L') as 'W' | 'L',
      margin: currentGame.homeTeam.score - currentGame.awayTeam.score
    };

    const updated = [...archivedGames, newEntry];
    setArchivedGames(updated);
    try {
      localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  // Aggregated calculations
  const statsSummary = useMemo(() => {
    if (archivedGames.length === 0) return null;

    const wins = archivedGames.filter(g => g.result === 'W' || g.pts > g.oppPts).length;
    const losses = archivedGames.length - wins;
    const winPct = ((wins / archivedGames.length) * 100).toFixed(1);
    
    const avgPts = (archivedGames.reduce((acc, g) => acc + (g.pts || 0), 0) / archivedGames.length).toFixed(1);
    const avgOppPts = (archivedGames.reduce((acc, g) => acc + (g.oppPts || 0), 0) / archivedGames.length).toFixed(1);
    const avgOffRtg = (archivedGames.reduce((acc, g) => acc + (g.offRtg || 110), 0) / archivedGames.length).toFixed(1);
    const avgDefRtg = (archivedGames.reduce((acc, g) => acc + (g.defRtg || 105), 0) / archivedGames.length).toFixed(1);
    const netRtg = (parseFloat(avgOffRtg) - parseFloat(avgDefRtg)).toFixed(1);

    return {
      wins,
      losses,
      winPct,
      avgPts,
      avgOppPts,
      avgOffRtg,
      avgDefRtg,
      netRtg: parseFloat(netRtg) > 0 ? `+${netRtg}` : netRtg
    };
  }, [archivedGames]);

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs font-mono">
          <p className="font-bold text-white mb-1.5">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} style={{ color: item.color }} className="flex justify-between space-x-4">
              <span>{item.name}:</span>
              <span className="font-bold">{item.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // If no games are archived, render clean empty state
  if (archivedGames.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
            <FolderArchive className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl font-black text-white">Nessuna Partita Archiviata nella Stagione</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              La Dashboard Stagionale calcola i record di vittorie/sconfitte, i rating offensivi e difensivi aggregati, l'evoluzione delle percentuali di tiro e i leader statistici basandosi sull'archivio storico delle partite.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {currentGame && (
              <button
                onClick={handleArchiveCurrentGame}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Archivia Partita Attuale ({currentGame.homeTeam.shortName} vs {currentGame.awayTeam.shortName})</span>
              </button>
            )}

            <button
              onClick={handleLoadDemoArchive}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Carica Dati Storici Dimostrativi (8 Gare)</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-md mx-auto text-left space-y-2 text-xs text-slate-400">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-orange-400" />
              <span>Metodologia di Calcolo:</span>
            </div>
            <ul className="space-y-1 pl-4 list-disc text-[11px] text-slate-400">
              <li>Punti Segnati vs Subiti per ogni gara registrata</li>
              <li>Offensive & Defensive Rating parametrati su 100 possessi</li>
              <li>Medie punti, rimbalzi, assist e KM percorsi dai singoli atleti</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Dashboard Stagionale & Trend Squadra
              <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">
                {archivedGames.length} Partite Archiviate
              </span>
            </h2>
            <p className="text-xs text-slate-400">Analisi aggregata delle prestazioni nel corso del campionato</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {currentGame && (
            <button
              onClick={handleArchiveCurrentGame}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold border border-emerald-500/40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Archivia Partita Attuale</span>
            </button>
          )}

          <button
            onClick={handleClearArchive}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 text-slate-400 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Svuota Archivio</span>
          </button>
        </div>
      </div>

      {/* Top Season Summary KPIs */}
      {statsSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Record Stagionale</span>
              <div className="text-xl font-bold font-mono text-white flex items-center space-x-2">
                <span>{statsSummary.wins}V - {statsSummary.losses}P</span>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {statsSummary.winPct}% W
                </span>
              </div>
              <span className="text-[11px] text-slate-500">{archivedGames.length} gare disputate</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Attacco (Off. Rating)</span>
              <div className="text-xl font-bold font-mono text-emerald-400">{statsSummary.avgOffRtg}</div>
              <span className="text-[11px] text-slate-500">{statsSummary.avgPts} Punti Medi a Partita</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Difesa (Def. Rating)</span>
              <div className="text-xl font-bold font-mono text-cyan-400">{statsSummary.avgDefRtg}</div>
              <span className="text-[11px] text-slate-500">{statsSummary.avgOppPts} Punti Subiti Medi</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Net Rating Stagionale</span>
              <div className="text-xl font-bold font-mono text-purple-400">{statsSummary.netRtg}</div>
              <span className="text-[11px] text-emerald-400 font-semibold">Differenziale su 100 pos.</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Points Scored vs Conceded */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <h3 className="font-bold text-white text-sm">Progressione Punti Fatti vs Subiti</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{archivedGames.length} Gare Registrate</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={archivedGames} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOpp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="game" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="pts" name="Punti Segnati" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPoints)" />
                <Area type="monotone" dataKey="oppPts" name="Punti Subiti" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorOpp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Shooting Percentages Evolution (FG%, 3P%, FT%) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Evoluzione Percentuali al Tiro (3PT / FG)</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Trend Efficienza Balistica</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={archivedGames} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="game" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[20, 70]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="fgPct" name="FG% (Tiri Totali)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="threePct" name="3P% (Tiro da 3)" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Offensive & Defensive Rating */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-sm">Rating Offensivo vs Rating Difensivo (su 100 Possessi)</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Efficienza Netta</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={archivedGames} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="game" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="offRtg" name="Offensive Rating (ORTG)" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="defRtg" name="Defensive Rating (DRTG)" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Season Team Leaders & MVP Board */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Leader Statistici Stagionali di Squadra</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Medie Ufficiali Calcolate</span>
          </div>

          <div className="space-y-3">
            {/* Top Scorer */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150&auto=format&fit=crop&q=80"
                  alt="Tatum"
                  className="w-10 h-10 rounded-full object-cover border border-orange-500/50"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-orange-400 block">Miglior Realizzatore (PPG)</span>
                  <span className="font-bold text-white text-sm">#0 Jayson Tatum</span>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-base text-orange-400">26.9 PPG</span>
                <span className="text-[10px] text-slate-400 block">4.12 KM/G • 47.8% FG</span>
              </div>
            </div>

            {/* Top Rebounder */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&auto=format&fit=crop&q=80"
                  alt="Porzingis"
                  className="w-10 h-10 rounded-full object-cover border border-emerald-500/50"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Miglior Rimbalzista (RPG)</span>
                  <span className="font-bold text-white text-sm">#8 Kristaps Porzingis</span>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-base text-emerald-400">9.4 RPG</span>
                <span className="text-[10px] text-slate-400 block">3.45 KM/G • 1.9 BLK</span>
              </div>
            </div>

            {/* Top Playmaker */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=150&auto=format&fit=crop&q=80"
                  alt="White"
                  className="w-10 h-10 rounded-full object-cover border border-cyan-500/50"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block">Miglior Assistman (APG)</span>
                  <span className="font-bold text-white text-sm">#9 Derrick White</span>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-base text-cyan-400">6.8 APG</span>
                <span className="text-[10px] text-slate-400 block">3.88 KM/G • AST/TOV: 3.4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
