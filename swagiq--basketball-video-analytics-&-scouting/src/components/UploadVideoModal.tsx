import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  Youtube, 
  Tv, 
  FileVideo, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  Cpu, 
  ArrowRight, 
  ArrowLeft,
  Play,
  Users,
  Plus,
  Trash2,
  Trophy,
  Calendar,
  Sliders,
  Check,
  Zap
} from 'lucide-react';
import { BasketballGame } from '../types/basketball';
import { 
  LAKERS_VS_WARRIORS_GAME, 
  REAL_MADRID_VS_BARCELONA_GAME, 
  generateGameFromCustomSetup,
  generateGameFromSource 
} from '../data/sampleGamesLibrary';
import { mockGameData, sampleGames } from '../data/mockGames';
import { extractYouTubeId, getYouTubeThumbnailUrl } from '../utils/youtube';
import { extractTwitchInfo } from '../utils/twitch';
import { SupportedLanguage, translations } from '../i18n/translations';
import { SwagIQBrand } from './SwagIQBrand';

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameLoaded: (game: BasketballGame) => void;
  currentLanguage?: SupportedLanguage;
}

interface TeamPresetItem {
  id: string;
  name: string;
  shortName: string;
  color: string;
  logo: string;
  roster: Array<{ name: string; number: number; position: 'PG' | 'SG' | 'SF' | 'PF' | 'C'; isStarter?: boolean }>;
}

const POPULAR_TEAM_PRESETS: Record<string, { home: TeamPresetItem; away: TeamPresetItem; competition: string }> = {
  nba_celtics_knicks: {
    competition: 'NBA Playoffs - Eastern Conference',
    home: {
      id: 'bos',
      name: 'Boston Celtics',
      shortName: 'BOS',
      color: '#007A33',
      logo: '🍀',
      roster: [
        { name: 'Jayson Tatum', number: 0, position: 'SF', isStarter: true },
        { name: 'Jaylen Brown', number: 7, position: 'SG', isStarter: true },
        { name: 'Kristaps Porzingis', number: 8, position: 'C', isStarter: true },
        { name: 'Jrue Holiday', number: 4, position: 'PG', isStarter: true },
        { name: 'Derrick White', number: 9, position: 'SG', isStarter: true },
        { name: 'Al Horford', number: 42, position: 'C', isStarter: false },
        { name: 'Payton Pritchard', number: 11, position: 'PG', isStarter: false }
      ]
    },
    away: {
      id: 'nyk',
      name: 'New York Knicks',
      shortName: 'NYK',
      color: '#006BB6',
      logo: '🗽',
      roster: [
        { name: 'Jalen Brunson', number: 11, position: 'PG', isStarter: true },
        { name: 'OG Anunoby', number: 8, position: 'SF', isStarter: true },
        { name: 'Karl-Anthony Towns', number: 32, position: 'C', isStarter: true },
        { name: 'Mikal Bridges', number: 25, position: 'SG', isStarter: true },
        { name: 'Josh Hart', number: 3, position: 'SG', isStarter: true },
        { name: 'Miles McBride', number: 2, position: 'PG', isStarter: false }
      ]
    }
  },
  nba_lakers_warriors: {
    competition: 'NBA Regular Season Showdown',
    home: {
      id: 'lal',
      name: 'Los Angeles Lakers',
      shortName: 'LAL',
      color: '#552583',
      logo: '👑',
      roster: [
        { name: 'LeBron James', number: 23, position: 'SF', isStarter: true },
        { name: 'Anthony Davis', number: 3, position: 'C', isStarter: true },
        { name: 'Austin Reaves', number: 15, position: 'SG', isStarter: true },
        { name: 'D’Angelo Russell', number: 1, position: 'PG', isStarter: true },
        { name: 'Rui Hachimura', number: 28, position: 'PF', isStarter: true },
        { name: 'Jarred Vanderbilt', number: 2, position: 'PF', isStarter: false }
      ]
    },
    away: {
      id: 'gsw',
      name: 'Golden State Warriors',
      shortName: 'GSW',
      color: '#1D428A',
      logo: '🌉',
      roster: [
        { name: 'Stephen Curry', number: 30, position: 'PG', isStarter: true },
        { name: 'Draymond Green', number: 23, position: 'PF', isStarter: true },
        { name: 'Andrew Wiggins', number: 22, position: 'SF', isStarter: true },
        { name: 'Jonathan Kuminga', number: 0, position: 'PF', isStarter: true },
        { name: 'Buddy Hield', number: 7, position: 'SG', isStarter: true },
        { name: 'Brandin Podziemski', number: 2, position: 'SG', isStarter: false }
      ]
    }
  },
  euroleague_madrid_barca: {
    competition: 'EuroLeague Basketball - El Clásico',
    home: {
      id: 'rmb',
      name: 'Real Madrid Baloncesto',
      shortName: 'RMB',
      color: '#00529F',
      logo: '👑',
      roster: [
        { name: 'Facundo Campazzo', number: 7, position: 'PG', isStarter: true },
        { name: 'Walter Tavares', number: 22, position: 'C', isStarter: true },
        { name: 'Dzanan Musa', number: 13, position: 'SG', isStarter: true },
        { name: 'Mario Hezonja', number: 11, position: 'SF', isStarter: true },
        { name: 'Gabriel Deck', number: 14, position: 'PF', isStarter: true },
        { name: 'Sergio Llull', number: 23, position: 'SG', isStarter: false }
      ]
    },
    away: {
      id: 'fcb',
      name: 'FC Barcelona Basket',
      shortName: 'FCB',
      color: '#A50044',
      logo: '🔵🔴',
      roster: [
        { name: 'Nicolas Laprovittola', number: 20, position: 'PG', isStarter: true },
        { name: 'Jan Vesely', number: 6, position: 'C', isStarter: true },
        { name: 'Kevin Punter', number: 0, position: 'SG', isStarter: true },
        { name: 'Jabari Parker', number: 22, position: 'PF', isStarter: true },
        { name: 'Alex Abrines', number: 21, position: 'SF', isStarter: true },
        { name: 'Tomas Satoransky', number: 13, position: 'PG', isStarter: false }
      ]
    }
  },
  italy_virtus_milano: {
    competition: 'Lega Basket Serie A - Derby d’Italia',
    home: {
      id: 'vir',
      name: 'Virtus Segafredo Bologna',
      shortName: 'VIR',
      color: '#1E293B',
      logo: '⚫⚪',
      roster: [
        { name: 'Marco Belinelli', number: 3, position: 'SG', isStarter: true },
        { name: 'Daniel Hackett', number: 23, position: 'PG', isStarter: true },
        { name: 'Tornike Shengelia', number: 21, position: 'PF', isStarter: true },
        { name: 'Isaïa Cordinier', number: 0, position: 'SG', isStarter: true },
        { name: 'Ante Zizic', number: 41, position: 'C', isStarter: true },
        { name: 'Alessandro Pajola', number: 6, position: 'PG', isStarter: false },
        { name: 'Awudu Abass', number: 55, position: 'SF', isStarter: false }
      ]
    },
    away: {
      id: 'axm',
      name: 'EA7 Emporio Armani Milano',
      shortName: 'AXM',
      color: '#CE1141',
      logo: '🔴⚪',
      roster: [
        { name: 'Nikola Mirotic', number: 33, position: 'PF', isStarter: true },
        { name: 'Shavon Shields', number: 31, position: 'SF', isStarter: true },
        { name: 'Zach LeDay', number: 2, position: 'PF', isStarter: true },
        { name: 'Nenad Dimitrijevic', number: 1, position: 'PG', isStarter: true },
        { name: 'Josh Nebo', number: 7, position: 'C', isStarter: true },
        { name: 'Stefano Tonut', number: 7, position: 'SG', isStarter: false }
      ]
    }
  }
};

export const UploadVideoModal: React.FC<UploadVideoModalProps> = ({
  isOpen,
  onClose,
  onGameLoaded,
  currentLanguage = 'it'
}) => {
  const t = translations[currentLanguage] || translations.it;

  // Wizard Step: 1 = Source Selection, 2 = Mandatory Setup, 3 = Vision Processing
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Video Source state
  const [activeTab, setActiveTab] = useState<'youtube' | 'upload' | 'twitch' | 'samples'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/watch?v=k_jFfq4nS04');
  const [twitchUrl, setTwitchUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSamplePreset, setSelectedSamplePreset] = useState<string>('BOS vs NYK');

  // Step 2: Mandatory Team Setup State
  const [competitionName, setCompetitionName] = useState('Campionato Ufficiale 2025');
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);

  // Home Team State
  const [homeTeamName, setHomeTeamName] = useState('Virtus Bologna');
  const [homeTeamShort, setHomeTeamShort] = useState('VIR');
  const [homeTeamColor, setHomeTeamColor] = useState('#1E293B');
  const [homeTeamLogo, setHomeTeamLogo] = useState('⚫⚪');
  const [homeRoster, setHomeRoster] = useState<Array<{ name: string; number: number; position: 'PG' | 'SG' | 'SF' | 'PF' | 'C'; isStarter: boolean }>>([
    { name: 'Marco Belinelli', number: 3, position: 'SG', isStarter: true },
    { name: 'Daniel Hackett', number: 23, position: 'PG', isStarter: true },
    { name: 'Tornike Shengelia', number: 21, position: 'PF', isStarter: true },
    { name: 'Isaïa Cordinier', number: 0, position: 'SG', isStarter: true },
    { name: 'Ante Zizic', number: 41, position: 'C', isStarter: true },
    { name: 'Alessandro Pajola', number: 6, position: 'PG', isStarter: false }
  ]);

  // Away Team State
  const [awayTeamName, setAwayTeamName] = useState('Olimpia Milano');
  const [awayTeamShort, setAwayTeamShort] = useState('AXM');
  const [awayTeamColor, setAwayTeamColor] = useState('#CE1141');
  const [awayTeamLogo, setAwayTeamLogo] = useState('🔴⚪');
  const [awayRoster, setAwayRoster] = useState<Array<{ name: string; number: number; position: 'PG' | 'SG' | 'SF' | 'PF' | 'C'; isStarter: boolean }>>([
    { name: 'Nikola Mirotic', number: 33, position: 'PF', isStarter: true },
    { name: 'Shavon Shields', number: 31, position: 'SF', isStarter: true },
    { name: 'Zach LeDay', number: 2, position: 'PF', isStarter: true },
    { name: 'Nenad Dimitrijevic', number: 1, position: 'PG', isStarter: true },
    { name: 'Josh Nebo', number: 7, position: 'C', isStarter: true },
    { name: 'Stefano Tonut', number: 7, position: 'SG', isStarter: false }
  ]);

  // Step 3: Vision Processing simulation
  const [processingStep, setProcessingStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  if (!isOpen) return null;

  const detectedYouTubeId = extractYouTubeId(youtubeUrl);
  const detectedTwitchInfo = extractTwitchInfo(twitchUrl);

  const applyPresetMatch = (presetKey: string) => {
    const preset = POPULAR_TEAM_PRESETS[presetKey];
    if (!preset) return;

    setCompetitionName(preset.competition);
    setHomeTeamName(preset.home.name);
    setHomeTeamShort(preset.home.shortName);
    setHomeTeamColor(preset.home.color);
    setHomeTeamLogo(preset.home.logo);
    setHomeRoster(preset.home.roster.map(r => ({ ...r, isStarter: r.isStarter ?? true })));

    setAwayTeamName(preset.away.name);
    setAwayTeamShort(preset.away.shortName);
    setAwayTeamColor(preset.away.color);
    setAwayTeamLogo(preset.away.logo);
    setAwayRoster(preset.away.roster.map(r => ({ ...r, isStarter: r.isStarter ?? true })));
  };

  // Direct 1-click Instant Showcase Match Loader
  const handleLoadShowcaseDirectly = (presetKey: string) => {
    if (presetKey === 'nba_lakers_warriors') {
      onGameLoaded(LAKERS_VS_WARRIORS_GAME);
    } else if (presetKey === 'euroleague_madrid_barca') {
      onGameLoaded(REAL_MADRID_VS_BARCELONA_GAME);
    } else if (sampleGames && sampleGames.length > 0) {
      const match = sampleGames.find(g => g.id.includes(presetKey.replace('italy_', ''))) || mockGameData;
      onGameLoaded(match);
    } else {
      onGameLoaded(mockGameData);
    }
    onClose();
  };

  const handleProceedToSetup = () => {
    if (activeTab === 'youtube' && !youtubeUrl.trim()) {
      alert('Inserisci un link YouTube valido prima di continuare.');
      return;
    }
    if (activeTab === 'twitch' && !twitchUrl.trim()) {
      alert('Inserisci un link Twitch (Live, VOD o Clip) valido prima di continuare.');
      return;
    }
    if (activeTab === 'upload' && !selectedFile) {
      alert('Seleziona un file video MP4, MOV o WEBM dal tuo dispositivo prima di continuare.');
      return;
    }
    setStep(2);
  };

  const handleExecuteVisionPipeline = () => {
    setStep(3);
    setProgressPercent(15);
    setProcessingStep(t.stepExtraction);

    setTimeout(() => {
      setProgressPercent(40);
      setProcessingStep(t.stepYoloDetection);
    }, 450);

    setTimeout(() => {
      setProgressPercent(70);
      setProcessingStep(t.stepTrackingHomography);
    }, 900);

    setTimeout(() => {
      setProgressPercent(90);
      setProcessingStep(t.stepStatsTactics);
    }, 1350);

    setTimeout(() => {
      setProgressPercent(100);
      setProcessingStep(t.stepCompleteReady);

      setTimeout(() => {
        let loadedGame: BasketballGame;

        let videoUrlToUse = '';
        let sourceType: 'local' | 'youtube' | 'twitch' | 'sample' = 'youtube';

        if (activeTab === 'youtube') {
          sourceType = 'youtube';
          videoUrlToUse = youtubeUrl;
        } else if (activeTab === 'upload' && selectedFile) {
          sourceType = 'local';
          videoUrlToUse = URL.createObjectURL(selectedFile);
        } else if (activeTab === 'twitch') {
          sourceType = 'twitch';
          videoUrlToUse = twitchUrl;
        } else {
          sourceType = 'sample';
          videoUrlToUse = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
        }

        loadedGame = generateGameFromCustomSetup(
          sourceType,
          videoUrlToUse,
          {
            homeTeam: {
              name: homeTeamName,
              shortName: homeTeamShort,
              color: homeTeamColor,
              logo: homeTeamLogo,
              roster: homeRoster
            },
            awayTeam: {
              name: awayTeamName,
              shortName: awayTeamShort,
              color: awayTeamColor,
              logo: awayTeamLogo,
              roster: awayRoster
            },
            competition: competitionName,
            date: matchDate
          }
        );

        onGameLoaded(loadedGame);
        onClose();
      }, 600);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">{t.uploadModalTitle}</h3>
                <SwagIQBrand size="xs" />
              </div>
              <p className="text-xs text-slate-400">
                {step === 1 ? t.step1VideoTitle : step === 2 ? t.step2SetupTitle : t.processingVisionPipeline}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Indicator */}
        <div className="grid grid-cols-3 gap-2 text-xs font-semibold flex-shrink-0">
          <div className={`p-2 rounded-xl border flex items-center gap-2 ${step >= 1 ? 'bg-orange-500/10 border-orange-500/40 text-orange-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
            <span>{t.tabYouTube} / File</span>
          </div>
          <div className={`p-2 rounded-xl border flex items-center gap-2 ${step >= 2 ? 'bg-orange-500/10 border-orange-500/40 text-orange-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
            <span>{t.setupHeaderTitle.slice(0, 18)}...</span>
          </div>
          <div className={`p-2 rounded-xl border flex items-center gap-2 ${step >= 3 ? 'bg-orange-500/10 border-orange-500/40 text-orange-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
            <span>Vision AI Sync</span>
          </div>
        </div>

        {/* STEP 1: Video Source Selection */}
        {step === 1 && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Tabs */}
            <div className="grid grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('youtube')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'youtube' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Youtube className="w-4 h-4 text-red-400" />
                <span>YouTube</span>
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'upload' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileVideo className="w-4 h-4 text-cyan-400" />
                <span>Local MP4</span>
              </button>
              <button
                onClick={() => setActiveTab('samples')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'samples' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Showcase</span>
              </button>
              <button
                onClick={() => setActiveTab('twitch')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'twitch' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tv className="w-4 h-4 text-purple-400" />
                <span>Twitch</span>
              </button>
            </div>

            {/* YouTube Tab Content */}
            {activeTab === 'youtube' && (
              <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    {t.enterYouTubeUrlLabel || 'Incolla URL YouTube Partita:'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 pl-9 font-mono"
                    />
                    <Youtube className="w-4 h-4 text-red-500 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Instant YouTube Validation & Preview */}
                {detectedYouTubeId ? (
                  <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3">
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black flex-shrink-0">
                      <img 
                        src={getYouTubeThumbnailUrl(detectedYouTubeId)} 
                        alt="YouTube Thumbnail" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        <span>Link YouTube Rilevato con Successo</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                        ID: {detectedYouTubeId}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Pronto per l'ingestione e il tracciamento Vision AI in tempo reale.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    💡 Incolla un qualsiasi link YouTube di basket (es. highlights, partita intera, scouting).
                  </div>
                )}

                {/* Quick Sample Links */}
                <div>
                  <div className="text-[11px] text-slate-400 mb-1.5 font-semibold">
                    Oppure prova un link YouTube video di esempio:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setYoutubeUrl('https://www.youtube.com/watch?v=3z8EwB-pP3o');
                        applyPresetMatch('italy_virtus_milano');
                      }}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-left border border-slate-800 hover:border-orange-500/50 transition-colors"
                    >
                      <div className="font-bold text-white">Virtus vs Milano (LBA)</div>
                      <div className="text-[10px] text-slate-400 font-mono">youtube.com/watch?v=3z8EwB-pP3o</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setYoutubeUrl('https://www.youtube.com/watch?v=k_jFfq4nS04');
                        applyPresetMatch('nba_lakers_warriors');
                      }}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-left border border-slate-800 hover:border-orange-500/50 transition-colors"
                    >
                      <div className="font-bold text-white">Lakers vs Warriors (NBA)</div>
                      <div className="text-[10px] text-slate-400 font-mono">youtube.com/watch?v=k_jFfq4nS04</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Local File Tab */}
            {activeTab === 'upload' && (
              <div className="bg-slate-950 p-6 rounded-2xl border-2 border-dashed border-slate-800 hover:border-orange-500/50 transition-colors text-center space-y-3">
                <FileVideo className="w-10 h-10 text-orange-400 mx-auto" />
                <div>
                  <div className="text-xs font-semibold text-white">Carica file video MP4, MOV o WEBM</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Trascina qui il file della partita o clicca per sfogliare</div>
                </div>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="video-upload-file"
                />
                <label
                  htmlFor="video-upload-file"
                  className="inline-block px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 cursor-pointer"
                >
                  {selectedFile ? selectedFile.name : 'Seleziona File Video'}
                </label>
              </div>
            )}

            {/* Preset Showcase Tab */}
            {activeTab === 'samples' && (
              <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Partite Dimostrative Pre-analizzate SwagIQ:</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold">
                    4 Showcase Disponibili
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'italy_virtus_milano',
                      title: 'Virtus Bologna vs Olimpia Milano',
                      league: 'Lega Basket Serie A • Belinelli & Mirotic',
                      color: 'border-emerald-500/40'
                    },
                    {
                      id: 'nba_lakers_warriors',
                      title: 'Lakers vs Warriors',
                      league: 'NBA Showcase • LeBron & Curry',
                      color: 'border-cyan-500/40'
                    },
                    {
                      id: 'euroleague_madrid_barca',
                      title: 'Real Madrid vs FC Barcelona',
                      league: 'EuroLeague El Clásico • Campazzo & Vesely',
                      color: 'border-amber-500/40'
                    },
                    {
                      id: 'nba_celtics_knicks',
                      title: 'Celtics vs Knicks',
                      league: 'Eastern Finals • Tatum & Brunson',
                      color: 'border-orange-500/40'
                    }
                  ].map((preset) => {
                    const isSelected = selectedSamplePreset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                          isSelected
                            ? 'bg-slate-900 border-orange-500 shadow-lg shadow-orange-500/10'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="cursor-pointer" onClick={() => {
                          setSelectedSamplePreset(preset.id);
                          applyPresetMatch(preset.id);
                        }}>
                          <div className="font-bold text-xs text-white">{preset.title}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{preset.league}</div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSamplePreset(preset.id);
                              applyPresetMatch(preset.id);
                              handleLoadShowcaseDirectly(preset.id);
                            }}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Carica Subito</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSamplePreset(preset.id);
                              applyPresetMatch(preset.id);
                              setStep(2);
                            }}
                            className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center justify-center gap-1 transition-all"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Setup</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Twitch Tab Content */}
            {activeTab === 'twitch' && (
              <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Incolla Link Twitch (Live Stream, Video VOD o Clip):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={twitchUrl}
                      onChange={(e) => setTwitchUrl(e.target.value)}
                      placeholder="https://www.twitch.tv/nba oppure twitch.tv/videos/..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 pl-9 font-mono"
                    />
                    <Tv className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Instant Twitch Validation & Status Preview */}
                {detectedTwitchInfo ? (
                  <div className="bg-slate-900 border border-purple-500/40 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400">
                      <Tv className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Sorgente Twitch Riconosciuta</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                          {detectedTwitchInfo.type === 'channel' ? '🔴 Live Stream' : detectedTwitchInfo.type === 'video' ? '📼 Video VOD' : '✂️ Clip'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                        Target: {detectedTwitchInfo.id}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Integrazione con player Twitch e tracking statistico SwagIQ attivo.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    💡 Incolla un canale Twitch in diretta (es. <span className="font-mono text-purple-300">twitch.tv/nba</span>) o un video archiviato VOD (es. <span className="font-mono text-purple-300">twitch.tv/videos/2048451120</span>).
                  </div>
                )}

                {/* Sample Twitch Links */}
                <div>
                  <div className="text-[11px] text-slate-400 mb-1.5 font-semibold">
                    Oppure prova un canale Twitch di esempio:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setTwitchUrl('https://www.twitch.tv/nba');
                        applyPresetMatch('nba_lakers_warriors');
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-left border border-slate-800 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span>Twitch NBA Live Official</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">twitch.tv/nba</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTwitchUrl('https://www.twitch.tv/redbull');
                        applyPresetMatch('italy_virtus_milano');
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-left border border-slate-800 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        <span>Twitch Sports Showcase</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">twitch.tv/redbull</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions for Step 1 */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Passo 1 di 2: Sorgente Video
              </span>
              <button
                type="button"
                onClick={handleProceedToSetup}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
              >
                <span>{t.proceedToSetupBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Mandatory Team & Roster Setup */}
        {step === 2 && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-3.5 text-xs">
              <div className="font-bold text-orange-400 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                <span>{t.step2SetupTitle}</span>
              </div>
              <p className="text-slate-300 text-[11px] mt-1">
                {t.step2SetupDesc}
              </p>
            </div>

            {/* Quick Match Presets */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 mb-2">Preset Rapido Squadre Popolari:</div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => applyPresetMatch('italy_virtus_milano')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-[11px] truncate"
                >
                  🇮🇹 Virtus vs Milano
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetMatch('nba_lakers_warriors')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-[11px] truncate"
                >
                  🇺🇸 Lakers vs Warriors
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetMatch('euroleague_madrid_barca')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-[11px] truncate"
                >
                  🇪🇸 Madrid vs Barca
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetMatch('nba_celtics_knicks')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-[11px] truncate"
                >
                  ☘️ Celtics vs Knicks
                </button>
              </div>
            </div>

            {/* Match Metadata: Competition & Date */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">{t.competitionNameLabel}:</label>
                <input
                  type="text"
                  value={competitionName}
                  onChange={(e) => setCompetitionName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">{t.matchDateLabel}:</label>
                <input
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            {/* Two Column Team Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Home Team Card */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase">🏠 Squadra Casa (Home)</span>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: homeTeamColor }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Nome Squadra</label>
                    <input
                      type="text"
                      value={homeTeamName}
                      onChange={(e) => setHomeTeamName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Sigla (3 Lettere)</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={homeTeamShort}
                      onChange={(e) => setHomeTeamShort(e.target.value.toUpperCase())}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Home Roster Mini Table */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Roster Giocatori (# N° Maglia):</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {homeRoster.map((player, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                        <span className="font-mono text-emerald-400 font-bold w-6 text-center">#{player.number}</span>
                        <input
                          type="text"
                          value={player.name}
                          onChange={(e) => {
                            const updated = [...homeRoster];
                            updated[idx].name = e.target.value;
                            setHomeRoster(updated);
                          }}
                          className="flex-1 bg-transparent text-white font-semibold focus:outline-none"
                        />
                        <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">{player.position}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Away Team Card */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-cyan-400 uppercase">✈️ Squadra Ospite (Away)</span>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: awayTeamColor }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Nome Squadra</label>
                    <input
                      type="text"
                      value={awayTeamName}
                      onChange={(e) => setAwayTeamName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Sigla (3 Lettere)</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={awayTeamShort}
                      onChange={(e) => setAwayTeamShort(e.target.value.toUpperCase())}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Away Roster Mini Table */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Roster Giocatori (# N° Maglia):</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {awayRoster.map((player, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                        <span className="font-mono text-cyan-400 font-bold w-6 text-center">#{player.number}</span>
                        <input
                          type="text"
                          value={player.name}
                          onChange={(e) => {
                            const updated = [...awayRoster];
                            updated[idx].name = e.target.value;
                            setAwayRoster(updated);
                          }}
                          className="flex-1 bg-transparent text-white font-semibold focus:outline-none"
                        />
                        <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">{player.position}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions for Step 2 */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.backToVideoSourceBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleExecuteVisionPipeline}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.launchVisionAnalysisBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Vision AI Execution Pipeline */}
        {step === 3 && (
          <div className="py-8 space-y-6 text-center">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
              <Cpu className="w-8 h-8 text-orange-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-white">
                {t.processingVisionPipeline}
              </h4>
              <p className="text-xs text-orange-400 font-mono">
                {processingStep}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto space-y-1.5">
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Roboflow YOLOv11 & SAM 3</span>
                <span>{progressPercent}%</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
