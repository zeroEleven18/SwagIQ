import React from 'react';
import { 
  PlaySquare, 
  Target, 
  Table2, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  Bot, 
  FileDown, 
  UploadCloud, 
  Flame,
  Activity,
  Cpu
} from 'lucide-react';
import { BasketballGame } from '../types/basketball';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentGame: BasketballGame;
  onOpenUpload: () => void;
  onOpenPdfExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentGame,
  onOpenUpload,
  onOpenPdfExport
}) => {
  const tabs = [
    { id: 'video', label: 'Video & Vision AI', icon: PlaySquare },
    { id: 'shotchart', label: 'Mappa di Tiro (2D)', icon: Target },
    { id: 'boxscore', label: 'Tabellino & Statistiche', icon: Table2 },
    { id: 'tactics', label: 'Tattiche & SAM 3', icon: ShieldAlert },
    { id: 'pipeline', label: 'Roboflow Pipeline', icon: Cpu },
    { id: 'highlights', label: 'Highlights Auto', icon: Sparkles },
    { id: 'season', label: 'Dashboard Stagionale', icon: TrendingUp },
    { id: 'aicoach', label: 'Coach AI Assistant', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Match HUD Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Giò's Studio Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-1 ring-orange-400/30">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                Swag<span className="text-orange-500">IQ</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                v0.1
              </span>
            </div>
            <p className="text-xs text-slate-400">Basketball Video Analytics & Scouting Suite</p>
          </div>
        </div>

        {/* Live Match Scoreboard Chip */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-1.5 shadow-inner">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{currentGame.homeTeam.logo}</span>
            <span className="font-bold text-white text-sm">{currentGame.homeTeam.shortName}</span>
            <span className="font-mono font-bold text-lg text-orange-400 px-1">{currentGame.homeTeam.score}</span>
          </div>
          <span className="mx-2 text-slate-600 font-bold">vs</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-lg text-cyan-400 px-1">{currentGame.awayTeam.score}</span>
            <span className="font-bold text-white text-sm">{currentGame.awayTeam.shortName}</span>
            <span className="text-lg">{currentGame.awayTeam.logo}</span>
          </div>
          <div className="ml-3 pl-3 border-l border-slate-700/60 flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Possesso:</span>
            <span className="font-semibold text-emerald-400 font-mono">{currentGame.homeTeam.possessionPct}%</span>
            <span className="text-slate-500">/</span>
            <span className="font-semibold text-cyan-400 font-mono">{currentGame.awayTeam.possessionPct}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            id="btn-upload-video"
            onClick={onOpenUpload}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all hover:border-slate-600 shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-orange-400" />
            <span>Carica Video / Link</span>
          </button>

          <button
            id="btn-export-pdf"
            onClick={onOpenPdfExport}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold shadow-md shadow-orange-500/20 transition-all active:scale-95"
          >
            <FileDown className="w-4 h-4" />
            <span>Esporta Report PDF</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex space-x-1 overflow-x-auto no-scrollbar border-t border-slate-800/60 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
