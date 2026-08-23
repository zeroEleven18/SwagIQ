import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Swords, 
  Play, 
  Sparkles, 
  Layers, 
  Cpu, 
  Percent, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Zap,
  Target,
  BarChart3,
  Sliders,
  Award
} from 'lucide-react';
import { BasketballGame, TacticalScheme } from '../types/basketball';

interface TacticalAnalysisProps {
  game: BasketballGame;
  onPlayTacticalVideo: (timestampSec: number) => void;
}

export const TacticalAnalysis: React.FC<TacticalAnalysisProps> = ({
  game,
  onPlayTacticalVideo
}) => {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | 'h2h'>('home');
  const [tacticalTypeFilter, setTacticalTypeFilter] = useState<'all' | 'offensive' | 'defensive'>('all');
  const [rankingMode, setRankingMode] = useState<'frequency' | 'effectiveness'>('frequency');

  // Boston Celtics (Home / My Team) Tactical Schemes
  const homeTactics: TacticalScheme[] = [
    {
      id: 'tac-1',
      type: 'offensive',
      name: 'High Pick & Roll Spread (Tatum + Porzingis)',
      frequencyPct: 38.4,
      frequencyCount: 32,
      pointsPerPossession: 1.28,
      successRate: 62.5,
      samTrackingScore: 96.4,
      description: 'Tatum con Porzingis sul blocco centrale a 8.5 metri con tiratori spaziati negli angoli (5-Out).',
      keyAction: 'Penetrazione verso il ferro o scarico perimetrale sui tiratori dall\'arco.',
      exampleTimestampSec: 14,
      courtDiagramType: 'pnr'
    },
    {
      id: 'tac-3',
      type: 'offensive',
      name: 'Transizione Rapida & Fast Break 5-Out',
      frequencyPct: 19.5,
      frequencyCount: 16,
      pointsPerPossession: 1.42,
      successRate: 68.8,
      samTrackingScore: 98.1,
      description: 'Spinta immediata su rimbalzo/palla recuperata con corsie larghe e tiro nei primi 6 secondi.',
      keyAction: 'Canestro primario in contropiede o tripla aperta in transizione prima che la difesa si schieri.',
      exampleTimestampSec: 25,
      courtDiagramType: 'motion'
    },
    {
      id: 'tac-2',
      type: 'offensive',
      name: 'Horns Set (Doppio Blocco Alto ai Gomiti)',
      frequencyPct: 24.1,
      frequencyCount: 20,
      pointsPerPossession: 1.15,
      successRate: 55.0,
      samTrackingScore: 94.8,
      description: 'Due lunghi ai gomiti dell\'area con uscite incrociate per Jaylen Brown e Derrick White.',
      keyAction: 'Uscita di Brown per tiro piazzato dal gomito o taglio backdoor verso canestro.',
      exampleTimestampSec: 78,
      courtDiagramType: 'horns'
    },
    {
      id: 'tac-7',
      type: 'offensive',
      name: 'Isolamento 1-vs-1 Tatum/Brown',
      frequencyPct: 6.0,
      frequencyCount: 5,
      pointsPerPossession: 0.72,
      successRate: 38.0,
      samTrackingScore: 91.2,
      description: 'Gioco statico in isolamento sul quarto di campo contro la difesa schierata dei Knicks.',
      keyAction: 'Tiro forzato contestato dal mid-range o palla persa sul raddoppio rapido avversario.',
      exampleTimestampSec: 145,
      courtDiagramType: 'motion'
    },
    {
      id: 'tac-4',
      type: 'defensive',
      name: 'Drop Coverage Difensiva su Pick & Roll (Porzingis)',
      frequencyPct: 42.0,
      frequencyCount: 35,
      pointsPerPossession: 0.94,
      successRate: 60.0,
      samTrackingScore: 95.2,
      description: 'Il lungo arretra a protezione del ferro mentre l\'esterno insegue sopra il blocco.',
      keyAction: 'Concessione del tiro dalla media distanza per blindare il ferro e limitare i falli.',
      exampleTimestampSec: 38,
      courtDiagramType: 'switch'
    },
    {
      id: 'tac-5',
      type: 'defensive',
      name: 'Difesa a Zona 2-3 Matchup Dinamica',
      frequencyPct: 18.2,
      frequencyCount: 15,
      pointsPerPossession: 0.88,
      successRate: 66.7,
      samTrackingScore: 92.6,
      description: 'Schieramento a zona con accoppiamento uomo quando la palla entra nei gomiti dell\'area.',
      keyAction: 'Chiusura dell\'area contro le penetrazioni di Brunson, forzando 4 palle perse.',
      exampleTimestampSec: 125,
      courtDiagramType: 'zone'
    },
    {
      id: 'tac-6',
      type: 'defensive',
      name: 'Full Court Press 2-2-1 & Trappola a Metà Campo',
      frequencyPct: 11.5,
      frequencyCount: 9,
      pointsPerPossession: 0.77,
      successRate: 77.8,
      samTrackingScore: 91.0,
      description: 'Pressione asfissiante a tutto campo dopo canestro segnato con trappola sulle linee laterali.',
      keyAction: 'Forzatura di 3 palle perse decisive negli ultimi 5 minuti di gara.',
      exampleTimestampSec: 48,
      courtDiagramType: 'press'
    }
  ];

  // New York Knicks (Away / Opponent) Tactical Schemes
  const awayTactics: TacticalScheme[] = [
    {
      id: 'tac-k1',
      type: 'offensive',
      name: 'Pick & Roll Centrale Brunson con Roll Robinson',
      frequencyPct: 42.5,
      frequencyCount: 36,
      pointsPerPossession: 1.32,
      successRate: 63.9,
      samTrackingScore: 96.0,
      description: 'Brunson sfrutta il blocco duro centrale per attaccare il corridoio e tirare con floater morbido.',
      keyAction: 'Floater nel cuore dell\'area o scarico d\'angolo per Bridges e Anunoby.',
      exampleTimestampSec: 18,
      courtDiagramType: 'pnr'
    },
    {
      id: 'tac-k2',
      type: 'offensive',
      name: 'Isolamento & Drive di Potenza Brunson/Randle',
      frequencyPct: 25.8,
      frequencyCount: 22,
      pointsPerPossession: 0.92,
      successRate: 45.5,
      samTrackingScore: 92.4,
      description: 'Attacco in 1-vs-1 dal palleggio per cercare il contatto fisico e falli subiti sotto canestro.',
      keyAction: 'Penetrazione a centro area con frequenti contestazioni al ferro di Porzingis.',
      exampleTimestampSec: 230,
      courtDiagramType: 'motion'
    },
    {
      id: 'tac-k3',
      type: 'offensive',
      name: 'Post-Up & Kick-Out Angoli (Corner Three)',
      frequencyPct: 18.5,
      frequencyCount: 16,
      pointsPerPossession: 1.12,
      successRate: 56.3,
      samTrackingScore: 94.1,
      description: 'Ricezione spalle a canestro per attirare il raddoppio e ribaltare il lato per la tripla.',
      keyAction: 'Tripla dall\'angolo di Mikal Bridges su assist di Brunson.',
      exampleTimestampSec: 54,
      courtDiagramType: 'motion'
    },
    {
      id: 'tac-k4',
      type: 'offensive',
      name: 'DHO (Dribble Hand-Off) per Uscita Tiratori',
      frequencyPct: 13.2,
      frequencyCount: 11,
      pointsPerPossession: 0.85,
      successRate: 40.0,
      samTrackingScore: 90.5,
      description: 'Consegna mano-nella-mano per liberare tiratori uscendo dai blocchi ciechi.',
      keyAction: 'Tiro forzato da oltre l\'arco contestato dagli switch di Boston.',
      exampleTimestampSec: 195,
      courtDiagramType: 'horns'
    },
    {
      id: 'tac-k5',
      type: 'defensive',
      name: 'Drop Coverage Difensiva Robinson / Hartenstein',
      frequencyPct: 48.0,
      frequencyCount: 40,
      pointsPerPossession: 1.25,
      successRate: 42.5,
      samTrackingScore: 94.5,
      description: 'I centri dei Knicks scendono molto profondi a protezione del ferro sui blocchi alti.',
      keyAction: 'Concede ampio spazio a Tatum e Brown per triple dal palleggio e Pick&Pop con Porzingis.',
      exampleTimestampSec: 14,
      courtDiagramType: 'switch'
    },
    {
      id: 'tac-k6',
      type: 'defensive',
      name: 'Blitz Aggressivo / Trap sul Palleggiatore',
      frequencyPct: 22.0,
      frequencyCount: 18,
      pointsPerPossession: 0.95,
      successRate: 58.0,
      samTrackingScore: 91.8,
      description: 'Raddoppio immediato a 2 giocatori sul portatore di palla fuori dall\'arco dei 3 punti.',
      keyAction: 'Forzatura di passaggi difficili e recuperi sulle linee di passaggio corte.',
      exampleTimestampSec: 110,
      courtDiagramType: 'press'
    },
    {
      id: 'tac-k7',
      type: 'defensive',
      name: 'Difesa Individuale Uomo a Uomo Contenitiva',
      frequencyPct: 30.0,
      frequencyCount: 25,
      pointsPerPossession: 1.10,
      successRate: 48.0,
      samTrackingScore: 93.2,
      description: 'Marcatura individuale a tutto campo per limitare la circolazione di palla di Boston.',
      keyAction: 'Duelli fisici 1-vs-1 sugli esterni con aiuti moderati dal lato debole.',
      exampleTimestampSec: 175,
      courtDiagramType: 'switch'
    }
  ];

  const currentTacticsList = selectedTeam === 'home' ? homeTactics : awayTactics;

  // Filter by Type (All / Offense / Defense)
  const filteredTactics = currentTacticsList.filter((t) => {
    if (tacticalTypeFilter === 'all') return true;
    return t.type === tacticalTypeFilter;
  });

  // Sort by Ranking Mode (Most Used vs Most Effective)
  const sortedTactics = [...filteredTactics].sort((a, b) => {
    if (rankingMode === 'frequency') {
      return b.frequencyCount - a.frequencyCount;
    } else {
      // For offense, higher PPP is better. For defense, lower PPP allowed is better.
      if (a.type === 'offensive' && b.type === 'offensive') {
        return b.pointsPerPossession - a.pointsPerPossession;
      }
      if (a.type === 'defensive' && b.type === 'defensive') {
        return a.pointsPerPossession - b.pointsPerPossession;
      }
      return b.pointsPerPossession - a.pointsPerPossession;
    }
  });

  const [selectedScheme, setSelectedScheme] = useState<TacticalScheme>(homeTactics[0]);

  // Top Most Used vs Most Effective items
  const mostUsedOffense = homeTactics.filter(t => t.type === 'offensive').sort((a, b) => b.frequencyCount - a.frequencyCount)[0];
  const mostEffectiveOffense = homeTactics.filter(t => t.type === 'offensive').sort((a, b) => b.pointsPerPossession - a.pointsPerPossession)[0];
  const mostEffectiveDefense = homeTactics.filter(t => t.type === 'defensive').sort((a, b) => a.pointsPerPossession - b.pointsPerPossession)[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Analisi Tattica & Decision Support per il Coach
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  Vision Segmentation & PPP Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rilevamento delle azioni di attacco e difesa più utilizzate e più efficaci delle due squadre per guidare gli aggiustamenti in partita.
              </p>
            </div>
          </div>

          {/* Team Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setSelectedTeam('home');
                setSelectedScheme(homeTactics[0]);
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedTeam === 'home'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              <span>{game.homeTeam.name} (Tua Squadra)</span>
            </button>

            <button
              onClick={() => {
                setSelectedTeam('away');
                setSelectedScheme(awayTactics[0]);
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedTeam === 'away'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
              <span>{game.awayTeam.name} (Avversari)</span>
            </button>

            <button
              onClick={() => setSelectedTeam('h2h')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedTeam === 'h2h'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Confronto Diretto H2H</span>
            </button>
          </div>
        </div>

        {/* Tactical Key Metrics HUD */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Set Offensivo Più Efficace</span>
              <span className="font-mono font-bold text-sm text-orange-400">{mostEffectiveOffense.name}</span>
              <div className="text-[11px] font-mono text-emerald-400 mt-0.5">{mostEffectiveOffense.pointsPerPossession} PPP ({mostEffectiveOffense.successRate}% Successo)</div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Miglior Assetto Difensivo</span>
              <span className="font-mono font-bold text-sm text-cyan-400">{mostEffectiveDefense.name}</span>
              <div className="text-[11px] font-mono text-emerald-400 mt-0.5">{mostEffectiveDefense.pointsPerPossession} PPP Concessi ({mostEffectiveDefense.successRate}% Stop Rate)</div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">SAM 3 Precisione Spaziale</span>
              <span className="font-mono font-bold text-sm text-purple-400">96.8% Precisione Tracking</span>
              <div className="text-[11px] text-slate-500 mt-0.5">Segmentazione video 60 FPS in tempo reale</div>
            </div>
          </div>
        </div>
      </div>

      {/* In-Game Coach Live Adjustments Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-orange-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                Aggiustamenti Tattici Live per il Coach (In-Game Tactical Alerts)
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  Real-time Decision Support
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Indicazioni strategiche automatizzate su cosa correggere, sfruttare o modificare in campo durante la partita.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1: What is Working */}
          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
              <TrendingUp className="w-4 h-4" />
              <span>COSA FUNZIONA (CONTINUARE AD ATTACCARE)</span>
            </div>
            <h4 className="font-bold text-white text-xs">Transizione 5-Out & PnR Alto (1.42 e 1.28 PPP)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              I Knicks sono lenti nel rientro difensivo e la loro Drop coverage concede spazio dal perimetro. Continuare a spingere il ritmo dopo rimbalzo e cercare i tiratori negli angoli.
            </p>
            <div className="text-[11px] font-mono text-emerald-400 font-semibold pt-1">
              Consiglio: Eseguire almeno 10 transizioni nel 2° tempo.
            </div>
          </div>

          {/* Action 2: What to Fix */}
          <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/30 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"></div>
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
              <TrendingDown className="w-4 h-4" />
              <span>DA CORREGGERE SUBITO (INEFFICIENZA)</span>
            </div>
            <h4 className="font-bold text-white text-xs">Isolamenti Statici 1-vs-1 (0.72 PPP)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Gli isolamenti individuali contro la difesa schierata producono basse percentuali (38.0% FG) e 3 palle perse sui raddoppi. Muovere la palla con almeno 3 passaggi per possesso.
            </p>
            <div className="text-[11px] font-mono text-rose-400 font-semibold pt-1">
              Consiglio: Vietare isolamenti nei primi 14 secondi d'azione.
            </div>
          </div>

          {/* Action 3: Defense vs Opponent */}
          <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-cyan-500"></div>
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>AGGIUSTAMENTO DIFENSIVO (CONTRO BRUNSON)</span>
            </div>
            <h4 className="font-bold text-white text-xs">Passare a Blitz / Ice sul PnR Centrale (1.32 PPP avversari)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Brunson sta punendo la Drop coverage con floater dal gomito. Alternare momenti di Zona 2-3 Matchup (che concede solo 0.88 PPP) o forzare "Ice" verso la linea laterale.
            </p>
            <div className="text-[11px] font-mono text-cyan-400 font-semibold pt-1">
              Consiglio: Alzare Porzingis al livello del blocco per negare il tiro.
            </div>
          </div>
        </div>
      </div>

      {/* Head-to-Head Comparison View (When selected) */}
      {selectedTeam === 'h2h' ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sliders className="w-5 h-5 text-orange-400" />
              Confronto Diretto Efficacia Tattica: {game.homeTeam.name} vs {game.awayTeam.name}
            </h3>
            <span className="text-xs text-slate-400 font-mono">Dati aggregati da tracking video</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Home Team Column */}
            <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-emerald-500/20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <h4 className="font-bold text-white text-sm">{game.homeTeam.name}</h4>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">1.18 PPP Offensivo Medio</span>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top 3 Schemi d'Attacco per Efficacia</h5>
                {homeTactics.filter(t => t.type === 'offensive').sort((a, b) => b.pointsPerPossession - a.pointsPerPossession).slice(0, 3).map((t, idx) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] flex items-center justify-center font-bold">#{idx + 1}</span>
                      <div>
                        <span className="text-xs font-bold text-white block">{t.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{t.frequencyCount} possessi ({t.frequencyPct}%)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-emerald-400 block">{t.pointsPerPossession} PPP</span>
                      <span className="text-[10px] text-slate-400 font-mono">{t.successRate}% FG</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Migliori Assetti Difensivi (PPP Concessi)</h5>
                {homeTactics.filter(t => t.type === 'defensive').sort((a, b) => a.pointsPerPossession - b.pointsPerPossession).slice(0, 2).map((t, idx) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] flex items-center justify-center font-bold">#{idx + 1}</span>
                      <div>
                        <span className="text-xs font-bold text-white block">{t.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{t.frequencyCount} possessi difesi</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-cyan-400 block">{t.pointsPerPossession} PPP conc.</span>
                      <span className="text-[10px] text-emerald-400 font-mono">{t.successRate}% Stop Rate</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Away Team Column */}
            <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-blue-500/20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <h4 className="font-bold text-white text-sm">{game.awayTeam.name}</h4>
                </div>
                <span className="text-xs font-mono text-blue-400 font-bold">1.08 PPP Offensivo Medio</span>
              </div>

              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top 3 Schemi d'Attacco per Efficacia</h5>
                {awayTactics.filter(t => t.type === 'offensive').sort((a, b) => b.pointsPerPossession - a.pointsPerPossession).slice(0, 3).map((t, idx) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px] flex items-center justify-center font-bold">#{idx + 1}</span>
                      <div>
                        <span className="text-xs font-bold text-white block">{t.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{t.frequencyCount} possessi ({t.frequencyPct}%)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-blue-400 block">{t.pointsPerPossession} PPP</span>
                      <span className="text-[10px] text-slate-400 font-mono">{t.successRate}% FG</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Migliori Assetti Difensivi (PPP Concessi)</h5>
                {awayTactics.filter(t => t.type === 'defensive').sort((a, b) => a.pointsPerPossession - b.pointsPerPossession).slice(0, 2).map((t, idx) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-[10px] flex items-center justify-center font-bold">#{idx + 1}</span>
                      <div>
                        <span className="text-xs font-bold text-white block">{t.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{t.frequencyCount} possessi difesi</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-cyan-400 block">{t.pointsPerPossession} PPP conc.</span>
                      <span className="text-[10px] text-emerald-400 font-mono">{t.successRate}% Stop Rate</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Team-Specific Detailed Tactical Analysis (Home / Away) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tactical Schemes List */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">
                  Schemi & Tattiche {selectedTeam === 'home' ? game.homeTeam.name : game.awayTeam.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">({sortedTactics.length} rilevati)</span>
              </div>

              {/* Sorting Mode: Most Used vs Most Effective */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setRankingMode('frequency')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    rankingMode === 'frequency'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Più Usate (Frequenza)
                </button>
                <button
                  onClick={() => setRankingMode('effectiveness')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    rankingMode === 'effectiveness'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Più Efficaci (Top PPP)
                </button>
              </div>
            </div>

            {/* Type Filters (All / Offense / Defense) */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTacticalTypeFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  tacticalTypeFilter === 'all'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-900'
                }`}
              >
                Tutti gli Schemi
              </button>
              <button
                onClick={() => setTacticalTypeFilter('offensive')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  tacticalTypeFilter === 'offensive'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-900'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Attacco (Offensive Sets)</span>
              </button>
              <button
                onClick={() => setTacticalTypeFilter('defensive')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  tacticalTypeFilter === 'defensive'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-900'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Difesa (Coverages)</span>
              </button>
            </div>

            {/* Tactical Cards List */}
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {sortedTactics.map((tac, idx) => {
                const isSelected = selectedScheme.id === tac.id;
                const isOffense = tac.type === 'offensive';

                return (
                  <div
                    key={tac.id}
                    onClick={() => setSelectedScheme(tac)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-slate-900 border-orange-500 ring-1 ring-orange-500/40 shadow-xl'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px] flex items-center justify-center font-bold">
                          #{idx + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isOffense ? 'bg-orange-500/15 text-orange-400' : 'bg-cyan-500/15 text-cyan-400'
                        }`}>
                          {isOffense ? 'ATTACCO' : 'DIFESA'}
                        </span>
                        <div>
                          <h4 className="font-bold text-white text-sm">{tac.name}</h4>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {tac.frequencyCount} Possessi Rilevati ({tac.frequencyPct}%)
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayTacticalVideo(tac.exampleTimestampSec);
                        }}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-orange-500 text-white text-xs font-semibold transition-colors flex-shrink-0"
                        title="Guarda clip nel video"
                      >
                        <Play className="w-3 h-3" />
                        <span>Clip Video</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">{tac.description}</p>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">PPP (Punti/Poss)</span>
                        <span className="font-mono font-bold text-emerald-400">{tac.pointsPerPossession}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Efficacia %</span>
                        <span className="font-mono font-bold text-cyan-400">{tac.successRate}%</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">SAM Tracking</span>
                        <span className="font-mono font-bold text-purple-400">{tac.samTrackingScore}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tactical Playbook Diagram & Spacing Inspector */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-orange-400" />
                  <h3 className="font-bold text-white text-sm">
                    Lavagna 2D & Vettori: <span className="text-orange-400">{selectedScheme.name}</span>
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Geometria FIBA Ufficiale</span>
              </div>

              {/* Tactical 2D Court Movement Board with Correct 3PT Line */}
              <div className="relative aspect-[50/47] w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-3 select-none">
                <svg className="w-full h-full" viewBox="0 0 100 94">
                  {/* Outer Court Lines */}
                  <rect x="2" y="2" width="96" height="90" fill="none" stroke="#475569" strokeWidth="1.2" />
                  
                  {/* Paint / Key Area */}
                  <rect x="34" y="2" width="32" height="38" fill="rgba(51, 65, 85, 0.2)" stroke="#475569" strokeWidth="1" />
                  <path d="M 44,11.5 A 6 6 0 0 0 56,11.5" fill="none" stroke="#475569" strokeWidth="0.8" strokeDasharray="1 1" />
                  
                  {/* Free Throw Circle */}
                  <circle cx="50" cy="40" r="12" fill="none" stroke="#475569" strokeWidth="1" />
                  <path d="M 38,40 A 12 12 0 0 0 62,40" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="1.5 1.5" />
                  
                  {/* Official 3PT Line Arc with Straight Corners */}
                  <path d="M 6,2 L 6,14 A 44 44 0 0 0 94,14 L 94,2" fill="none" stroke="#475569" strokeWidth="1.3" />
                  
                  {/* Rim & Backboard */}
                  <line x1="42" y1="6.5" x2="58" y2="6.5" stroke="#ffffff" strokeWidth="1.8" />
                  <circle cx="50" cy="11.5" r="2.8" fill="none" stroke="#f97316" strokeWidth="1.6" />

                  {/* Animated Tactical Movements & Passing Vectors */}
                  {selectedScheme.courtDiagramType === 'pnr' && (
                    <g>
                      {/* Screener Roll Movement */}
                      <path d="M 62,55 Q 56,40 50,22" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" className="animate-pulse" />
                      {/* Ball Handler Drive */}
                      <path d="M 50,72 Q 42,50 48,25" fill="none" stroke="#f97316" strokeWidth="2" />
                      {/* Pass to Corner Shooter */}
                      <line x1="48" y1="28" x2="88" y2="18" stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="1.5 1.5" />

                      {/* Offensive Player Nodes */}
                      <circle cx="50" cy="72" r="4" fill="#f97316" stroke="#fff" strokeWidth="1" />
                      <text x="50" y="73.5" fontSize="3" fontWeight="bold" textAnchor="middle" fill="#fff">#0 (PG)</text>

                      <circle cx="62" cy="55" r="4" fill="#10b981" stroke="#fff" strokeWidth="1" />
                      <text x="62" y="56.5" fontSize="3" fontWeight="bold" textAnchor="middle" fill="#fff">#8 (C)</text>

                      <circle cx="88" cy="18" r="4" fill="#10b981" stroke="#fff" strokeWidth="1" />
                      <text x="88" y="19.5" fontSize="3" fontWeight="bold" textAnchor="middle" fill="#fff">#7 (SG)</text>

                      {/* Defender Nodes */}
                      <circle cx="50" cy="62" r="4" fill="#06b6d4" stroke="#fff" strokeWidth="1" />
                      <text x="50" y="63.5" fontSize="3" fontWeight="bold" textAnchor="middle" fill="#fff">D1</text>

                      <circle cx="58" cy="45" r="4" fill="#06b6d4" stroke="#fff" strokeWidth="1" />
                      <text x="58" y="46.5" fontSize="3" fontWeight="bold" textAnchor="middle" fill="#fff">D5</text>
                    </g>
                  )}

                  {selectedScheme.courtDiagramType === 'horns' && (
                    <g>
                      {/* Double Elbow Screens */}
                      <circle cx="50" cy="74" r="4" fill="#f97316" stroke="#fff" strokeWidth="1" />
                      <text x="50" y="75.5" fontSize="3" fontWeight="bold" textAnchor="middle" fill="#fff">1</text>

                      <circle cx="36" cy="40" r="4" fill="#10b981" stroke="#fff" strokeWidth="1" />
                      <text x="36" y="41.5" fontSize="3" fontWeight="bold" textAnchor="middle" fill="#fff">4</text>

                      <circle cx="64" cy="40" r="4" fill="#10b981" stroke="#fff" strokeWidth="1" />
                      <text x="64" y="41.5" fontSize="3" fontWeight="bold" textAnchor="middle" fill="#fff">5</text>

                      <path d="M 50,74 Q 38,58 32,32" fill="none" stroke="#f97316" strokeWidth="2" />
                      <path d="M 64,40 Q 75,55 82,70" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
                    </g>
                  )}

                  {selectedScheme.courtDiagramType === 'press' && (
                    <g>
                      {/* Full Court / Half Court Trap */}
                      <circle cx="25" cy="70" r="4" fill="#06b6d4" stroke="#fff" strokeWidth="1" />
                      <text x="25" y="71.5" fontSize="3" fontWeight="bold" textAnchor="middle" fill="#fff">D1</text>
                      <circle cx="35" cy="70" r="4" fill="#06b6d4" stroke="#fff" strokeWidth="1" />
                      <text x="35" y="71.5" fontSize="3" fontWeight="bold" textAnchor="middle" fill="#fff">D2</text>
                      <circle cx="30" cy="78" r="4" fill="#f97316" stroke="#fff" strokeWidth="1" />
                      <text x="30" y="79.5" fontSize="3" fontWeight="bold" textAnchor="middle" fill="#fff">O1</text>
                      <path d="M 30,78 Q 20,50 15,20" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
                    </g>
                  )}

                  {selectedScheme.courtDiagramType !== 'pnr' && selectedScheme.courtDiagramType !== 'horns' && selectedScheme.courtDiagramType !== 'press' && (
                    <g>
                      {/* Zone 2-3 / Motion Movement */}
                      <circle cx="35" cy="55" r="4" fill="#06b6d4" stroke="#fff" strokeWidth="1" />
                      <circle cx="65" cy="55" r="4" fill="#06b6d4" stroke="#fff" strokeWidth="1" />
                      <circle cx="20" cy="25" r="4" fill="#06b6d4" stroke="#fff" strokeWidth="1" />
                      <circle cx="50" cy="25" r="4" fill="#06b6d4" stroke="#fff" strokeWidth="1" />
                      <circle cx="80" cy="25" r="4" fill="#06b6d4" stroke="#fff" strokeWidth="1" />

                      <path d="M 50,80 Q 25,60 20,35" fill="none" stroke="#f97316" strokeWidth="1.8" strokeDasharray="2 2" />
                    </g>
                  )}
                </svg>
              </div>

              {/* Scheme Tactical Breakdown */}
              <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center space-x-2 text-white font-semibold">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Azione Chiave & Obiettivo Tattico:</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{selectedScheme.keyAction}</p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Riconoscimento SAM 3: Silhouette tracciate a 60 fps</span>
                  <button
                    onClick={() => onPlayTacticalVideo(selectedScheme.exampleTimestampSec)}
                    className="text-orange-400 hover:underline font-semibold flex items-center space-x-1"
                  >
                    <span>Clip al secondo {selectedScheme.exampleTimestampSec}s</span>
                    <ArrowRight className="w-3 h-3 inline" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
