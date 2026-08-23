import React from 'react';
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
  BarChart2
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

export const SeasonalDashboard: React.FC = () => {
  const data = mockSeasonProgression;

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

  return (
    <div className="space-y-6">
      {/* Top Season Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Record Stagionale</span>
            <div className="text-xl font-bold font-mono text-white flex items-center space-x-2">
              <span>24V - 8P</span>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                75.0% W
              </span>
            </div>
            <span className="text-[11px] text-slate-500">1° Posto in Conference</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Attacco (Off. Rating)</span>
            <div className="text-xl font-bold font-mono text-emerald-400">118.4</div>
            <span className="text-[11px] text-slate-500">112.6 Punti Medi a Partita</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Difesa (Def. Rating)</span>
            <div className="text-xl font-bold font-mono text-cyan-400">107.1</div>
            <span className="text-[11px] text-slate-500">99.8 Punti Subiti Medi</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Net Rating Stagionale</span>
            <div className="text-xl font-bold font-mono text-purple-400">+11.3</div>
            <span className="text-[11px] text-emerald-400 font-semibold">+4.2 nelle ultime 5</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Points Scored vs Conceded */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <h3 className="font-bold text-white text-sm">Progressione Punti Fatti vs Subiti</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Ultime 8 Gare di Regular Season</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <YAxis domain={[80, 130]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="pts" name="Punti Segnati (BOS)" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPoints)" />
                <Area type="monotone" dataKey="oppPts" name="Punti Subiti (Avversari)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorOpp)" />
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
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="game" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[30, 60]} stroke="#64748b" tick={{ fontSize: 11 }} />
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
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="game" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[90, 130]} stroke="#64748b" tick={{ fontSize: 11 }} />
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
            <span className="text-xs text-slate-400 font-mono">Medie Ufficiali</span>
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
                <span className="text-[10px] text-slate-400 block">47.8% FG • 37.6% 3P</span>
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
                <span className="text-[10px] text-slate-400 block">2.6 Offensivi • 1.9 BLK</span>
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
                <span className="text-[10px] text-slate-400 block">Rapporto AST/TOV: 3.4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
