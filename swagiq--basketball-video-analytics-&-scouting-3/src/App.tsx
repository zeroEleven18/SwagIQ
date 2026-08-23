import React, { useState, useEffect } from 'react';
import { 
  PlaySquare, 
  Target, 
  Table2, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  Bot, 
  FileDown, 
  Share2,
  HardDrive,
  Check,
  Sliders,
  FolderGit2,
  Menu,
  X,
  Cpu,
  Languages,
  Radio,
  Users,
  Settings,
  Flame,
  PlusCircle,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { SwagIQLogo } from './components/HoopVisionLogo';
import { SwagIQBrand } from './components/SwagIQBrand';
import { VisionVideoPlayer } from './components/VisionVideoPlayer';
import { InteractiveShotChart } from './components/InteractiveShotChart';
import { BoxScoreStats } from './components/BoxScoreStats';
import { TacticalAnalysis } from './components/TacticalAnalysis';
import { RoboflowPipelineFlow } from './components/RoboflowPipelineFlow';
import { HighlightsGenerator } from './components/HighlightsGenerator';
import { SeasonalDashboard } from './components/SeasonalDashboard';
import { AICoachAssistant } from './components/AICoachAssistant';
import { CustomPlaybook } from './components/CustomPlaybook';
import { NewLiveMatchWizard } from './components/NewLiveMatchWizard';
import { OurTeamRosterSetup } from './components/OurTeamRosterSetup';
import { PdfExportModal } from './components/PdfExportModal';
import { mockGameData } from './data/mockGames';
import { INITIAL_CUSTOM_PLAYS, INITIAL_ROBOFLOW_VIOLATIONS } from './data/mockCustomPlays';
import { BasketballGame, HighlightClip, ShotEvent } from './types/basketball';
import { SupportedLanguage, translations } from './i18n/translations';

const LAST_GAME_STORAGE_KEY = 'swagiq_last_viewed_game';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('it');
  const t = translations[currentLanguage];

  // Initialize currentGame from localStorage to restore last viewed match on startup (or start clean)
  const [currentGame, setCurrentGame] = useState<BasketballGame | null>(() => {
    try {
      const saved = localStorage.getItem(LAST_GAME_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          customPlays: parsed.customPlays || INITIAL_CUSTOM_PLAYS,
          violations: parsed.violations || INITIAL_ROBOFLOW_VIOLATIONS
        };
      }
    } catch (e) {
      console.error('Error loading last viewed game from storage:', e);
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<string>('welcome');
  const [activeShotId, setActiveShotId] = useState<string | null>('shot-1');
  const [externalTimestamp, setExternalTimestamp] = useState<number | null>(14);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isShareCopied, setIsShareCopied] = useState<boolean>(false);

  // Modals
  const [isPdfExportOpen, setIsPdfExportOpen] = useState<boolean>(false);

  // Automatically persist current match so upon startup everything from the last match is ready
  useEffect(() => {
    if (currentGame) {
      try {
        localStorage.setItem(LAST_GAME_STORAGE_KEY, JSON.stringify(currentGame));
      } catch (e) {
        console.warn('Could not persist current game to localStorage:', e);
      }
    }
  }, [currentGame]);

  // Load last viewed game or fallback
  const handleLoadLastGame = () => {
    try {
      const saved = localStorage.getItem(LAST_GAME_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCurrentGame({
          ...parsed,
          customPlays: parsed.customPlays || INITIAL_CUSTOM_PLAYS,
          violations: parsed.violations || INITIAL_ROBOFLOW_VIOLATIONS
        });
        setActiveTab('video');
        return;
      }
    } catch (e) {
      console.error('Error restoring game:', e);
    }
    setCurrentGame({
      ...mockGameData,
      customPlays: INITIAL_CUSTOM_PLAYS,
      violations: INITIAL_ROBOFLOW_VIOLATIONS
    });
    setActiveTab('video');
  };

  // Cross-component interaction handlers
  const handleSelectShotAndPlay = (shot: ShotEvent) => {
    setActiveShotId(shot.id);
    setExternalTimestamp(shot.videoTimestamp);
    setActiveTab('video');
  };

  const handlePlayClip = (clip: HighlightClip) => {
    setExternalTimestamp(clip.timestampSec);
    setActiveTab('video');
  };

  const handlePlayTacticalTimestamp = (timestampSec: number) => {
    setExternalTimestamp(timestampSec);
    setActiveTab('video');
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsShareCopied(true);
    setTimeout(() => setIsShareCopied(false), 2200);
  };

  // Handler when a New Live Match is launched from the Wizard
  const handleStartLiveMatch = (newGame: BasketballGame) => {
    setCurrentGame(newGame);
    try {
      localStorage.setItem(LAST_GAME_STORAGE_KEY, JSON.stringify(newGame));
    } catch (e) {}
    setActiveTab('video');
    setExternalTimestamp(0);
  };

  // Nav Groups for High Density Sidebar
  const navSections = [
    {
      title: currentLanguage === 'it' ? 'Gestione Squadra' : t.navGroupTeam,
      items: [
        { id: 'our-roster', label: currentLanguage === 'it' ? 'Setup Roster' : 'Setup Roster', icon: Users },
        { id: 'playbook', label: currentLanguage === 'it' ? 'Lavagna & Schemi' : t.navPlaybook, icon: FolderGit2 },
      ]
    },
    {
      title: currentLanguage === 'it' ? 'Partita & Vision AI' : t.navGroupMatch,
      items: [
        { id: 'video', label: currentLanguage === 'it' ? 'Video & Vision AI' : t.navVideo, icon: PlaySquare },
        { id: 'shotchart', label: currentLanguage === 'it' ? 'Shot Chart & Fuoco' : t.navShotChart, icon: Target },
        { id: 'boxscore', label: currentLanguage === 'it' ? 'Tabellino & Stats' : t.navBoxScore, icon: Table2 },
        { id: 'tactics', label: currentLanguage === 'it' ? 'Analisi Tattica' : t.navTactics, icon: ShieldAlert },
        { id: 'highlights', label: currentLanguage === 'it' ? 'Highlight Reel' : t.navHighlights, icon: Sparkles },
      ]
    },
    {
      title: currentLanguage === 'it' ? 'Report & Coach AI' : t.navGroupReports,
      items: [
        { id: 'season', label: currentLanguage === 'it' ? 'Dashboard Stagionale' : t.navSeason, icon: TrendingUp },
        { id: 'aicoach', label: currentLanguage === 'it' ? 'Assistente Coach AI' : t.navAICoach, icon: Bot },
      ]
    }
  ];

  // 1. CLEAN STARTUP / WELCOME SCREEN (No Menu, Clean & Centered with 3 Dedicated Buttons)
  if (activeTab === 'welcome') {
    return (
      <div className="min-h-screen w-full bg-[#020617] text-slate-200 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
        {/* Subtle Ambient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-950/20 via-slate-950 to-[#020617] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Software Logo & Name */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur-md opacity-30 animate-pulse" />
              <div className="relative p-3 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
                <SwagIQLogo className="w-16 h-16 sm:w-20 sm:h-20" size={72} />
              </div>
            </div>
            
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-center gap-2">
                <SwagIQBrand size="2xl" withBadge badgeText="v0.1" />
              </div>
              <p className="text-xs sm:text-sm font-mono tracking-wider text-slate-400 font-medium">
                AI BASKETBALL VISION & TACTICAL SUITE
              </p>
            </div>
          </div>

          {/* 3 Dedicated Centered Buttons */}
          <div className="w-full space-y-3.5 pt-2">
            
            {/* 1. Setup Roster */}
            <button
              id="btn-welcome-setup-roster"
              onClick={() => setActiveTab('our-roster')}
              className="w-full p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/60 transition-all duration-200 shadow-xl hover:shadow-orange-500/10 flex items-center justify-between group text-left active:scale-98"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-105 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-orange-400 transition-colors">
                    Setup Roster
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configura i 12 atleti, numeri di maglia, ruoli e quintetto della tua squadra.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform pr-2 hidden sm:inline">
                &rarr;
              </span>
            </button>

            {/* 2. Carica l'Ultima Partita */}
            <button
              id="btn-welcome-load-last-game"
              onClick={handleLoadLastGame}
              className="w-full p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/60 transition-all duration-200 shadow-xl hover:shadow-cyan-500/10 flex items-center justify-between group text-left active:scale-98"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-inner flex-shrink-0">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-cyan-400 transition-colors">
                    Carica l'Ultima Partita
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ripristina all'istante l'ultimo match salvato con video, tiri, tabellino e tracking.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform pr-2 hidden sm:inline">
                &rarr;
              </span>
            </button>

            {/* 3. Nuova Partita Live */}
            <button
              id="btn-welcome-new-live-match"
              onClick={() => setActiveTab('new-live-match')}
              className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-orange-950/70 hover:from-red-900/90 hover:to-orange-900/80 border border-red-500/40 hover:border-orange-500 transition-all duration-200 shadow-2xl hover:shadow-orange-500/20 flex items-center justify-between group text-left active:scale-98"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 group-hover:scale-105 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner flex-shrink-0">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white group-hover:text-orange-400 transition-colors">
                      Nuova Partita Live
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Avvia la procedura guidata per un nuovo incontro (convocati, video o streaming, avversario).
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform pr-2 hidden sm:inline">
                &rarr;
              </span>
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-center gap-3 text-xs text-slate-500 pt-2">
            <Languages className="w-3.5 h-3.5 text-slate-500" />
            <div className="flex items-center gap-1.5 font-mono font-bold">
              {(['it', 'en', 'es', 'fr', 'de'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCurrentLanguage(lang)}
                  className={`px-2 py-0.5 rounded uppercase transition-colors ${
                    currentLanguage === lang ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'hover:text-slate-300'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* High Density Left Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
        isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand & Studio Header: SwagIQ & Logo */}
        <div className="p-4 px-5 flex items-center justify-between border-b border-slate-800">
          <div 
            onClick={() => {
              setActiveTab('welcome');
              setIsMobileNavOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
            title="Torna alla schermata iniziale"
          >
            <SwagIQLogo className="w-10 h-10" size={40} />
            <div>
              <SwagIQBrand size="lg" withBadge badgeText="v0.1" />
              <div className="text-[9px] text-slate-400 font-mono tracking-wider font-semibold">
                AI BASKETBALL VISION
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileNavOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary CTA: NUOVA PARTITA LIVE (Before Team and Settings) */}
        <div className="p-3 pb-1">
          <button
            id="btn-nuova-partita-live"
            onClick={() => {
              setActiveTab('new-live-match');
              setIsMobileNavOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs shadow-lg transition-all border ${
              activeTab === 'new-live-match'
                ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white border-orange-400/60 shadow-orange-500/25 ring-2 ring-orange-500/30'
                : 'bg-gradient-to-r from-red-950/80 to-slate-900 hover:from-red-900/90 hover:to-orange-950/80 text-white border-red-500/40 hover:border-orange-500/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              <div className="text-left">
                <div className="font-extrabold tracking-wide text-xs">
                  {currentLanguage === 'it' ? 'NUOVA PARTITA LIVE' : 'NEW LIVE MATCH'}
                </div>
                <div className="text-[10px] text-slate-300 font-normal">
                  {currentLanguage === 'it' ? 'Convocati, Video & Vision AI' : '12 Roster, Stream & AI'}
                </div>
              </div>
            </div>
            <Radio className="w-4 h-4 text-orange-400 flex-shrink-0" />
          </button>
        </div>

        {/* Categorized Navigation */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1.5 px-2.5">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-tab-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileNavOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-slate-800 text-orange-400 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Storage & Vision Engine */}
        <div className="p-3.5 border-t border-slate-800 space-y-2">
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 font-medium">
                <HardDrive className="w-3 h-3 text-orange-400" />
                Storage & Cache
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">RF-DETR + SAM-3</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mb-1.5 overflow-hidden">
              <div className="bg-orange-500 h-full w-3/4 rounded-full transition-all duration-300"></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>7.4GB / 10GB</span>
              <span>74%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col h-full bg-[#020617] overflow-hidden">
        {/* High Density Top Header (Upload Video button removed per user request) */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 bg-[#0f172a]/80 sticky top-0 z-30 backdrop-blur-md flex-shrink-0">
          {/* Left: Mobile Nav Toggle + Match Info Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center flex-wrap gap-2.5">
              {currentGame ? (
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
                    style={{ backgroundColor: currentGame.homeTeam?.color || '#007A33' }}
                  />
                  <span className="font-bold text-white text-sm sm:text-base">{currentGame.homeTeam?.name || 'Home'}</span>
                  <span className="text-slate-500 text-xs font-normal">vs</span>
                  <div 
                    className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
                    style={{ backgroundColor: currentGame.awayTeam?.color || '#CE1141' }}
                  />
                  <span className="font-bold text-white text-sm sm:text-base">{currentGame.awayTeam?.name || 'Away'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-300 text-sm sm:text-base">SWAG IQ • Vision & Stats</span>
                </div>
              )}
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                RF-DETR • SAM-3 • SigLIP
              </span>
            </div>
          </div>

          {/* Center/Right: Scoreboard Chip & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Language Switcher Dropdown */}
            <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <Languages className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-xs text-slate-200 font-bold uppercase focus:outline-none cursor-pointer pr-1"
              >
                <option value="it" className="bg-slate-900 text-white">IT</option>
                <option value="en" className="bg-slate-900 text-white">EN</option>
                <option value="de" className="bg-slate-900 text-white">DE</option>
                <option value="fr" className="bg-slate-900 text-white">FR</option>
                <option value="es" className="bg-slate-900 text-white">ES</option>
              </select>
            </div>

            {/* Compact Scoreboard HUD or No-Match indicator */}
            {currentGame ? (
              <div className="hidden xl:flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs">
                <span className="font-bold text-white">{currentGame.homeTeam.shortName}</span>
                <span className="font-mono font-bold text-orange-400 px-1.5">{currentGame.homeTeam.score}</span>
                <span className="text-slate-600 font-bold">-</span>
                <span className="font-mono font-bold text-cyan-400 px-1.5">{currentGame.awayTeam.score}</span>
                <span className="font-bold text-white">{currentGame.awayTeam.shortName}</span>
                <span className="ml-2 pl-2 border-l border-slate-800 text-[11px] text-slate-400 font-mono">
                  Poss: <span className="text-emerald-400">{currentGame.homeTeam.possessionPct}%</span>
                </span>
                <button
                  onClick={() => {
                    setCurrentGame(null);
                    setActiveTab('welcome');
                  }}
                  className="ml-2 pl-2 border-l border-slate-800 text-slate-500 hover:text-red-400 transition-colors"
                  title="Svuota partita e torna alla schermata iniziale"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-500 mr-2" />
                <span>Nessuna Partita Caricata</span>
              </div>
            )}

            {currentGame && (
              <>
                <button
                  id="btn-share-match"
                  onClick={handleShareLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                >
                  {isShareCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-orange-400" />}
                  <span className="hidden sm:inline">{isShareCopied ? t.shareCopied : t.shareBtn}</span>
                </button>

                <button
                  id="btn-export-detailed-pdf"
                  onClick={() => setIsPdfExportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{t.exportPdfBtn}</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Scrollable Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Tab: NUOVA PARTITA LIVE (3-Step Wizard) */}
          {activeTab === 'new-live-match' && (
            <NewLiveMatchWizard
              currentLanguage={currentLanguage}
              onStartMatch={handleStartLiveMatch}
              onCancel={() => setActiveTab(currentGame ? 'video' : 'welcome')}
            />
          )}

          {/* Tab: SETUP ROSTER (Dedicated Team & Roster Configuration) */}
          {activeTab === 'our-roster' && (
            <OurTeamRosterSetup
              currentLanguage={currentLanguage}
              onBack={() => setActiveTab(currentGame ? 'video' : 'welcome')}
              onTeamSaved={() => {
                // Reload or persist
              }}
            />
          )}

          {/* Tab: Custom Playbook & Direttive Coach */}
          {activeTab === 'playbook' && (
            currentGame ? (
              <CustomPlaybook
                game={currentGame}
                onPlayTacticalTimestamp={handlePlayTacticalTimestamp}
                currentLanguage={currentLanguage}
              />
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto space-y-4">
                <p className="text-sm text-slate-300">Carica una partita per visualizzare o creare schemi tattici personalizzati.</p>
                <button onClick={handleLoadLastGame} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md">
                  Carica l'ultima partita
                </button>
              </div>
            )
          )}

          {/* Tab: Video Player & Computer Vision HUD */}
          {activeTab === 'video' && (
            currentGame ? (
              <div className="space-y-4">
                <VisionVideoPlayer
                  game={currentGame}
                  activeShotId={activeShotId}
                  onShotSelect={(shot) => setActiveShotId(shot.id)}
                  externalTimestamp={externalTimestamp}
                  onUpdateGame={(updated) => {
                    setCurrentGame(updated);
                    try {
                      localStorage.setItem('swagiq_last_viewed_game', JSON.stringify(updated));
                    } catch (e) {}
                  }}
                />

                {/* High Density Navigation Shortcut Bento Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div 
                    onClick={() => setActiveTab('shotchart')}
                    className="bg-[#0f172a] hover:bg-slate-900 border border-slate-800 hover:border-orange-500/40 p-3.5 rounded-xl cursor-pointer transition-all shadow-sm group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 group-hover:text-orange-400 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-red-500" />
                        2D Shot Chart & Punti di Fuoco &rarr;
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono font-bold">
                        {currentGame.shots?.length || 28} Tiri
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Visualizza i punti di fuoco e la mappa di calore dei tiri sincronizzati con il video.
                    </p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('boxscore')}
                    className="bg-[#0f172a] hover:bg-slate-900 border border-slate-800 hover:border-orange-500/40 p-3.5 rounded-xl cursor-pointer transition-all shadow-sm group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 group-hover:text-orange-400">
                        Tabellino Ufficiale & Box Score &rarr;
                      </span>
                      <span className="text-[11px] text-cyan-400 font-mono font-bold">Possesso {currentGame.homeTeam.possessionPct}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Minuti giocati, percentuali di tiro 2P/3P, rimbalzi offensivi/difensivi e statistiche FIBA/LBA.
                    </p>
                  </div>

                  {/* Sostituito Setup Roster con Analisi Tecnica & Tattica */}
                  <div 
                    onClick={() => setActiveTab('tactics')}
                    className="bg-[#0f172a] hover:bg-slate-900 border border-slate-800 hover:border-orange-500/40 p-3.5 rounded-xl cursor-pointer transition-all shadow-sm group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 group-hover:text-orange-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                        Analisi Tecnica & Tattica &rarr;
                      </span>
                      <span className="text-[11px] text-purple-400 font-mono font-bold">Spaziature & Set</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Analisi difensiva/offensiva, spaziature SAM 3 e lavagna tattica interattiva.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Centered Empty State for Video Tab when no game is in memory */
              <div className="min-h-[500px] bg-slate-900/40 border border-slate-800 rounded-3xl p-8 sm:p-14 flex flex-col items-center justify-center text-center max-w-xl mx-auto shadow-2xl space-y-6 my-6">
                <div className="w-20 h-20 rounded-3xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-inner">
                  <PlaySquare className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Nessuna Partita Caricata in Memoria
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                    La schermata Video & Vision AI è pulita e svuotata. Ripristina l'ultimo incontro analizzato con tutti i suoi dati o avvia una nuova partita live.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md pt-2">
                  <button
                    onClick={handleLoadLastGame}
                    className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Carica l'Ultima Partita</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('new-live-match')}
                    className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>Nuova Partita Live</span>
                  </button>
                </div>
              </div>
            )
          )}

          {/* Tab: Interactive 2D Shot Chart & Fire Heatmap */}
          {activeTab === 'shotchart' && (
            currentGame ? (
              <InteractiveShotChart
                game={currentGame}
                onSelectShotAndPlay={handleSelectShotAndPlay}
                activeShotId={activeShotId}
                currentLanguage={currentLanguage}
              />
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto space-y-4 my-8">
                <Target className="w-12 h-12 text-orange-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Nessuna Partita Caricata</h3>
                <p className="text-xs text-slate-400">Carica o avvia una partita per analizzare la mappa di tiro e i punti di calore.</p>
                <button onClick={handleLoadLastGame} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md">
                  Carica l'Ultima Partita
                </button>
              </div>
            )
          )}

          {/* Tab: Official Box Score & Player Stats */}
          {activeTab === 'boxscore' && (
            currentGame ? (
              <BoxScoreStats 
                game={currentGame} 
                currentTimeSec={(() => {
                  try {
                    const key = `swagiq_video_playback_state_${currentGame.id}`;
                    const saved = localStorage.getItem(key) || sessionStorage.getItem(key);
                    if (saved) {
                      const parsed = JSON.parse(saved);
                      if (typeof parsed.currentTime === 'number') return parsed.currentTime;
                    }
                  } catch (e) {}
                  return externalTimestamp || 0;
                })()}
                onUpdateGame={(updated) => {
                  setCurrentGame(updated);
                  try {
                    localStorage.setItem(LAST_GAME_STORAGE_KEY, JSON.stringify(updated));
                  } catch (e) {}
                }}
                onJumpToTimestamp={(sec) => {
                  setExternalTimestamp(sec);
                  setActiveTab('video');
                }}
              />
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto space-y-4 my-8">
                <Table2 className="w-12 h-12 text-cyan-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Nessuna Partita Caricata</h3>
                <p className="text-xs text-slate-400">Carica o avvia una partita per consultare il tabellino e le statistiche dei giocatori.</p>
                <button onClick={handleLoadLastGame} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md">
                  Carica l'Ultima Partita
                </button>
              </div>
            )
          )}

          {/* Tab: Tactical Analysis & SAM 3 */}
          {activeTab === 'tactics' && (
            currentGame ? (
              <TacticalAnalysis
                game={currentGame}
                onPlayTacticalVideo={handlePlayTacticalTimestamp}
              />
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto space-y-4 my-8">
                <ShieldAlert className="w-12 h-12 text-purple-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Nessuna Partita Caricata</h3>
                <p className="text-xs text-slate-400">Carica o avvia una partita per accedere all'analisi tattica automatica.</p>
                <button onClick={handleLoadLastGame} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md">
                  Carica l'Ultima Partita
                </button>
              </div>
            )
          )}

          {/* Tab: Roboflow Vision Pipeline Flowchart (Hidden in submenu) */}
          {activeTab === 'pipeline' && (
            <RoboflowPipelineFlow />
          )}

          {/* Tab: Highlights Generator & Reel */}
          {activeTab === 'highlights' && (
            currentGame ? (
              <HighlightsGenerator
                game={currentGame}
                onPlayClip={handlePlayClip}
              />
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto space-y-4 my-8">
                <Sparkles className="w-12 h-12 text-amber-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Nessuna Partita Caricata</h3>
                <p className="text-xs text-slate-400">Carica o avvia una partita per generare clip e video highlight.</p>
                <button onClick={handleLoadLastGame} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md">
                  Carica l'Ultima Partita
                </button>
              </div>
            )
          )}

          {/* Tab: Seasonal Progression Dashboard */}
          {activeTab === 'season' && (
            <SeasonalDashboard currentGame={currentGame || undefined} />
          )}

          {/* Tab: AI Coach Assistant (Gemini 2.5) */}
          {activeTab === 'aicoach' && (
            currentGame ? (
              <AICoachAssistant game={currentGame} />
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto space-y-4 my-8">
                <Bot className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Nessuna Partita Caricata</h3>
                <p className="text-xs text-slate-400">Carica o avvia una partita per interagire con l'assistente tattico AI.</p>
                <button onClick={handleLoadLastGame} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md">
                  Carica l'Ultima Partita
                </button>
              </div>
            )
          )}
        </main>
      </div>

      {/* Export PDF Modal */}
      {currentGame && (
        <PdfExportModal
          isOpen={isPdfExportOpen}
          onClose={() => setIsPdfExportOpen(false)}
          game={currentGame}
          currentLanguage={currentLanguage}
        />
      )}
    </div>
  );
}
