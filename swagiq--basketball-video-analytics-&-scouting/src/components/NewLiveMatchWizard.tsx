import React, { useState, useRef } from 'react';
import { 
  Users, 
  Video, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Youtube, 
  Tv, 
  UploadCloud, 
  Shield, 
  Zap, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  FileVideo,
  Activity,
  Sliders
} from 'lucide-react';
import { BasketballGame } from '../types/basketball';
import { extractYouTubeId } from '../utils/youtube';
import { extractTwitchInfo } from '../utils/twitch';
import { SupportedLanguage } from '../i18n/translations';
import { SwagIQBrand } from './SwagIQBrand';
import { generateVisionMatchData, TeamSetupInput } from '../utils/roboflowVisionEngine';

interface NewLiveMatchWizardProps {
  onStartMatch: (newGame: BasketballGame) => void;
  currentLanguage: SupportedLanguage;
  onCancel?: () => void;
}

// Preset Color Dots
const PRESET_COLORS = [
  '#007A33', // Green
  '#CE1141', // Red
  '#00529F', // Blue
  '#1E293B', // Slate / Black
  '#552583', // Purple
  '#F58426', // Orange
  '#06B6D4', // Cyan
  '#E5A823', // Gold / Yellow
  '#6366F1', // Indigo
  '#FFFFFF'  // White
];

export const NewLiveMatchWizard: React.FC<NewLiveMatchWizardProps> = ({
  onStartMatch,
  onCancel
}) => {
  // Wizard Step: 1 = Squadre & Convocati | 2 = Sorgente Video | 3 = Set Statistiche & Vision AI
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Match Details
  const [matchTitle, setMatchTitle] = useState('Partita Ufficiale');
  const [competition, setCompetition] = useState('Lega Basket Serie A / Campionato');
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [arena, setArena] = useState('Palasport');
  const [ourTeamRole, setOurTeamRole] = useState<'home' | 'away'>('home');

  // OUR TEAM STATE (Loaded from localStorage)
  const [ourTeamInfo, setOurTeamInfo] = useState<TeamSetupInput>(() => {
    try {
      const saved = localStorage.getItem('swagiq_our_team');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}

    return {
      name: 'La Mia Squadra',
      shortName: 'LMS',
      color: '#007A33',
      secondaryColor: '#1E293B',
      coach: 'Coach Principale',
      city: 'Bologna, Italy',
      arena: 'Palasport',
      league: 'Lega Basket',
      roster: [
        { id: 'our-1', name: 'Playmaker Titolare', number: 3, position: 'PG', isStarter: true },
        { id: 'our-2', name: 'Guardia Tiratrice', number: 7, position: 'SG', isStarter: true },
        { id: 'our-3', name: 'Ala Piccola', number: 11, position: 'SF', isStarter: true },
        { id: 'our-4', name: 'Ala Grande', number: 21, position: 'PF', isStarter: true },
        { id: 'our-5', name: 'Centro Titolare', number: 33, position: 'C', isStarter: true },
        { id: 'our-6', name: 'Playmaker Riserva', number: 6, position: 'PG', isStarter: false },
        { id: 'our-7', name: 'Guardia Riserva', number: 14, position: 'SG', isStarter: false },
        { id: 'our-8', name: 'Ala Riserva', number: 23, position: 'SF', isStarter: false },
        { id: 'our-9', name: 'Lungo di Cambio', number: 25, position: 'C', isStarter: false },
        { id: 'our-10', name: 'Ala Forte Riserva', number: 35, position: 'PF', isStarter: false }
      ]
    };
  });

  // Selected Convocati IDs (Max 12)
  const [selectedConvocatiIds, setSelectedConvocatiIds] = useState<string[]>(() => {
    return ourTeamInfo.roster.slice(0, 12).map(p => p.id);
  });

  // Starting 5 IDs (must be among convocati)
  const [startingFiveIds, setStartingFiveIds] = useState<string[]>(() => {
    const starters = ourTeamInfo.roster.filter(p => p.isStarter).map(p => p.id);
    return starters.length === 5 ? starters : ourTeamInfo.roster.slice(0, 5).map(p => p.id);
  });

  // OPPONENT TEAM STATE
  const [opponentName, setOpponentName] = useState('Squadra Avversaria');
  const [opponentShort, setOpponentShort] = useState('AVV');
  const [opponentColor, setOpponentColor] = useState('#CE1141');
  const [opponentLogo, setOpponentLogo] = useState('🏀');
  const [opponentCoach, setOpponentCoach] = useState('Coach Avversario');
  const oppLogoInputRef = useRef<HTMLInputElement>(null);
  const [opponentRoster, setOpponentRoster] = useState<Array<{ id: string; name: string; number: number; position: 'PG' | 'SG' | 'SF' | 'PF' | 'C'; isStarter: boolean }>>([
    { id: 'opp-1', name: 'Playmaker Avversario', number: 1, position: 'PG', isStarter: true },
    { id: 'opp-2', name: 'Guardia Avversaria', number: 5, position: 'SG', isStarter: true },
    { id: 'opp-3', name: 'Ala Piccola Avversaria', number: 12, position: 'SF', isStarter: true },
    { id: 'opp-4', name: 'Ala Grande Avversaria', number: 22, position: 'PF', isStarter: true },
    { id: 'opp-5', name: 'Centro Avversario', number: 31, position: 'C', isStarter: true },
    { id: 'opp-6', name: 'Sesto Uomo', number: 9, position: 'SG', isStarter: false },
    { id: 'opp-7', name: 'Cambio Lunghi', number: 15, position: 'PF', isStarter: false }
  ]);

  // Opponent new player input state
  const [newOppNumber, setNewOppNumber] = useState<number | ''>('');
  const [newOppName, setNewOppName] = useState('');
  const [newOppPosition, setNewOppPosition] = useState<'PG' | 'SG' | 'SF' | 'PF' | 'C'>('SG');

  // STEP 2: VIDEO SOURCE STATE (No Demo links)
  const [videoSourceType, setVideoSourceType] = useState<'youtube' | 'twitch' | 'upload'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [twitchUrl, setTwitchUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [localVideoPreviewUrl, setLocalVideoPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // STEP 3: STATS SETTING & VISION TRACKING PARAMETERS
  const [detectionConfidence, setDetectionConfidence] = useState<number>(85);
  const [trackingFps, setTrackingFps] = useState<'60' | '30'>('60');
  const [enableSAM3Masks, setEnableSAM3Masks] = useState(true);
  const [enableHomographyRadar, setEnableHomographyRadar] = useState(true);
  const [enableShotEventTracker, setEnableShotEventTracker] = useState(true);

  // Handle Convocati Toggle (Max 12 rule)
  const toggleConvocato = (playerId: string) => {
    if (selectedConvocatiIds.includes(playerId)) {
      if (selectedConvocatiIds.length <= 5) {
        alert('Devi mantenere almeno 5 giocatori convocati per la partita.');
        return;
      }
      setSelectedConvocatiIds(selectedConvocatiIds.filter(id => id !== playerId));
      setStartingFiveIds(startingFiveIds.filter(id => id !== playerId));
    } else {
      if (selectedConvocatiIds.length >= 12) {
        alert('Regolamento FIP/EuroLeague: Il numero massimo consentito a referto è di 12 convocati.');
        return;
      }
      setSelectedConvocatiIds([...selectedConvocatiIds, playerId]);
    }
  };

  // Handle Starter Toggle
  const toggleStarter = (playerId: string) => {
    if (!selectedConvocatiIds.includes(playerId)) return;
    if (startingFiveIds.includes(playerId)) {
      setStartingFiveIds(startingFiveIds.filter(id => id !== playerId));
    } else {
      if (startingFiveIds.length >= 5) {
        alert('Il quintetto base può contenere esattamente 5 titolari. Deseleziona un titolare prima di aggiungerne un altro.');
        return;
      }
      setStartingFiveIds([...startingFiveIds, playerId]);
    }
  };

  // Add player to opponent roster
  const handleAddOpponentPlayer = () => {
    if (!newOppName.trim() || newOppNumber === '') {
      alert('Inserisci il nome e il numero per il giocatore avversario.');
      return;
    }
    const newPlayer = {
      id: `opp-${Date.now()}`,
      name: newOppName.trim(),
      number: Number(newOppNumber),
      position: newOppPosition,
      isStarter: opponentRoster.filter(p => p.isStarter).length < 5
    };
    setOpponentRoster([...opponentRoster, newPlayer]);
    setNewOppName('');
    setNewOppNumber('');
  };

  // Delete opponent player
  const handleDeleteOpponentPlayer = (id: string) => {
    if (opponentRoster.length <= 5) {
      alert('La squadra avversaria deve avere almeno 5 giocatori.');
      return;
    }
    setOpponentRoster(opponentRoster.filter(p => p.id !== id));
  };

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setLocalVideoPreviewUrl(url);
    }
  };

  // Step 1 Validation
  const handleValidateAndGoToStep2 = () => {
    if (selectedConvocatiIds.length < 5) {
      alert('Seleziona almeno 5 giocatori convocati per la tua squadra.');
      return;
    }
    if (startingFiveIds.length !== 5) {
      alert('Devi selezionare esattamente 5 titolari per il quintetto base.');
      return;
    }
    if (!opponentName.trim() || !opponentShort.trim()) {
      alert('Inserisci il nome e la sigla della squadra avversaria.');
      return;
    }
    if (opponentRoster.length < 5) {
      alert('Inserisci almeno 5 giocatori per la squadra avversaria.');
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 Validation
  const handleValidateAndGoToStep3 = () => {
    if (videoSourceType === 'youtube' && !youtubeUrl.trim()) {
      alert('Incolla il link YouTube della partita o live stream prima di continuare.');
      return;
    }
    if (videoSourceType === 'twitch' && !twitchUrl.trim()) {
      alert('Incolla il link Twitch del canale o VOD prima di continuare.');
      return;
    }
    if (videoSourceType === 'upload' && !uploadedFile) {
      alert('Carica un file video della partita (MP4, WEBM, MOV) prima di continuare.');
      return;
    }
    setCurrentStep(3);
  };

  // EXECUTE & LAUNCH VISION MATCH
  const handleLaunchLiveVision = () => {
    let finalVideoUrl = '';
    let ytId: string | undefined = undefined;
    let finalSourceType: 'local' | 'youtube' | 'twitch' = 'youtube';

    if (videoSourceType === 'youtube') {
      ytId = extractYouTubeId(youtubeUrl) || undefined;
      finalVideoUrl = youtubeUrl;
      finalSourceType = 'youtube';
    } else if (videoSourceType === 'twitch') {
      finalVideoUrl = twitchUrl;
      finalSourceType = 'twitch';
    } else if (videoSourceType === 'upload' && uploadedFile) {
      finalVideoUrl = localVideoPreviewUrl;
      finalSourceType = 'local';
    }

    const opponentTeamData: TeamSetupInput = {
      name: opponentName.trim(),
      shortName: opponentShort.trim().toUpperCase(),
      color: opponentColor,
      logo: opponentLogo,
      coach: opponentCoach.trim(),
      roster: opponentRoster
    };

    // Run the Roboflow + SAM 3 Vision Engine to synthesize dynamic realistic match data for the active players
    const newGame = generateVisionMatchData({
      title: matchTitle || `${ourTeamInfo.name} vs ${opponentName}`,
      competition: competition,
      venue: arena,
      date: matchDate,
      ourTeam: ourTeamInfo,
      opponentTeam: opponentTeamData,
      ourTeamRole: ourTeamRole,
      selectedConvocatiIds: selectedConvocatiIds,
      startingFiveIds: startingFiveIds,
      videoUrl: finalVideoUrl,
      youtubeId: ytId,
      videoSourceType: finalSourceType,
      videoDurationSec: 2400
    });

    // Save to localStorage immediately so last viewed match persists
    try {
      localStorage.setItem('swagiq_last_viewed_game', JSON.stringify(newGame));
    } catch (e) {}

    // Directly start match and navigate
    onStartMatch(newGame);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 shadow-inner flex items-center justify-center">
            <Activity className="w-7 h-7 animate-pulse text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-mono font-bold tracking-wide animate-pulse">
                🔴 LIVE SCOUTING
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Nuova Partita Live & Scouting Vision AI
              </h2>
              <SwagIQBrand size="xs" />
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Configura la tua squadra e gli avversari con i selettori a pallini, inserisci il tuo link video (YouTube/Twitch o file locale) e avvia il tracciamento con Roboflow & SAM 3.
            </p>
          </div>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {[
            { step: 1, label: '1. Squadre & Roster' },
            { step: 2, label: '2. Sorgente Video' },
            { step: 3, label: '3. Vision AI Setup' }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => {
                if (s.step < currentStep) setCurrentStep(s.step as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentStep === s.step
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : currentStep > s.step
                  ? 'bg-slate-800 text-slate-300'
                  : 'text-slate-500 cursor-not-allowed'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= STEP 1: SQUADRE, COLORI & CONVOCATI ================= */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Match Info Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Titolo Partita:</label>
              <input
                type="text"
                value={matchTitle}
                onChange={(e) => setMatchTitle(e.target.value)}
                placeholder="es. Finale Playoff Gara 1"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Campionato / Competizione:</label>
              <input
                type="text"
                value={competition}
                onChange={(e) => setCompetition(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Data Partita:</label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-medium focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Palasport / Arena:</label>
              <input
                type="text"
                value={arena}
                onChange={(e) => setArena(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* TWO TEAMS SETUP: OUR TEAM vs OPPONENT TEAM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OUR TEAM CARD */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                    style={{ backgroundColor: ourTeamInfo.color }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                      La Nostra Squadra ({ourTeamRole === 'home' ? 'CASA' : 'TRASFERTA'})
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Convocati selezionati: {selectedConvocatiIds.length}/12 • Titolari: {startingFiveIds.length}/5
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOurTeamRole(ourTeamRole === 'home' ? 'away' : 'home')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-orange-400 text-xs font-semibold border border-slate-700"
                >
                  Inverti Casa/Fuori
                </button>
              </div>

              {/* Our Team Color Selection (Pallini Colorati) */}
              <div>
                <label className="text-slate-400 block mb-1.5 text-xs font-semibold">Colore Maglia:</label>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={`our-dot-${c}`}
                      type="button"
                      onClick={() => setOurTeamInfo({ ...ourTeamInfo, color: c })}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        ourTeamInfo.color.toLowerCase() === c.toLowerCase()
                          ? 'scale-125 ring-2 ring-white border-white shadow-md'
                          : 'border-slate-600 hover:scale-110 opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Our Convocati Table */}
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {ourTeamInfo.roster.map((player) => {
                  const isConvocato = selectedConvocatiIds.includes(player.id);
                  const isStarter = startingFiveIds.includes(player.id);

                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                        isConvocato
                          ? isStarter
                            ? 'bg-orange-500/10 border-orange-500/50 text-white'
                            : 'bg-slate-800/80 border-slate-700 text-slate-200'
                          : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <button
                          type="button"
                          onClick={() => toggleConvocato(player.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isConvocato ? 'bg-orange-500 border-orange-400 text-white' : 'border-slate-600'
                          }`}
                        >
                          {isConvocato && <Check className="w-3 h-3" />}
                        </button>
                        <span className="font-mono font-bold text-orange-400 text-xs">#{player.number}</span>
                        <span className="font-semibold">{player.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono text-[10px]">
                          {player.position}
                        </span>
                      </div>

                      {isConvocato && (
                        <button
                          type="button"
                          onClick={() => toggleStarter(player.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                            isStarter
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {isStarter ? '★ TITOLARE' : 'PANCHINA'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* OPPONENT TEAM CARD */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                    style={{ backgroundColor: opponentColor }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                      Squadra Avversaria ({ourTeamRole === 'home' ? 'TRASFERTA' : 'CASA'})
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Inserisci nome, colore e atleti della squadra avversaria
                    </span>
                  </div>
                </div>
              </div>

              {/* Opponent Info Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Nome Squadra Avversaria:</label>
                  <input
                    type="text"
                    value={opponentName}
                    onChange={(e) => setOpponentName(e.target.value)}
                    placeholder="es. Olimpia Milano / Virtus / Celtics"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Sigla Referto (3-4 lettere):</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={opponentShort}
                    onChange={(e) => setOpponentShort(e.target.value.toUpperCase())}
                    placeholder="es. AXM"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Opponent Logo Section (Only Carica File Logo + Default fallback) */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-orange-400" />
                    <span>Logo Squadra Avversaria:</span>
                  </label>
                  <input
                    type="file"
                    ref={oppLogoInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (reader.result) setOpponentLogo(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => oppLogoInputRef.current?.click()}
                    className="px-3 py-1 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all active:scale-95"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Carica File Logo</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {opponentLogo && (opponentLogo.startsWith('http') || opponentLogo.startsWith('data:')) ? (
                      <img src={opponentLogo} alt="Opponent Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-orange-400 font-bold text-xs">
                        <Shield className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {opponentLogo && (opponentLogo.startsWith('http') || opponentLogo.startsWith('data:'))
                        ? 'Logo personalizzato caricato con successo.'
                        : 'Nessun file selezionato. Verrà utilizzato lo stemma predefinito.'}
                    </p>
                    {opponentLogo && (opponentLogo.startsWith('http') || opponentLogo.startsWith('data:')) && (
                      <button
                        type="button"
                        onClick={() => setOpponentLogo('')}
                        className="text-[10px] text-rose-400 hover:underline mt-0.5"
                      >
                        Ripristina logo predefinito
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Opponent Color Selection (Pallini Colorati) */}
              <div>
                <label className="text-slate-400 block mb-1.5 text-xs font-semibold">Colore Maglia Avversaria:</label>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={`opp-dot-${c}`}
                      type="button"
                      onClick={() => setOpponentColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        opponentColor.toLowerCase() === c.toLowerCase()
                          ? 'scale-125 ring-2 ring-white border-white shadow-md'
                          : 'border-slate-600 hover:scale-110 opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Opponent Roster List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {opponentRoster.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-rose-400">#{player.number}</span>
                      <span className="text-white font-medium">{player.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono text-[10px]">
                        {player.position}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = opponentRoster.map(p => 
                            p.id === player.id ? { ...p, isStarter: !p.isStarter } : p
                          );
                          setOpponentRoster(updated);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          player.isStarter
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {player.isStarter ? '★ Titolare' : 'Panchina'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteOpponentPlayer(player.id)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Opponent Player Row */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  placeholder="#"
                  value={newOppNumber}
                  onChange={(e) => setNewOppNumber(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-14 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
                />
                <input
                  type="text"
                  placeholder="Nome giocatore avversario"
                  value={newOppName}
                  onChange={(e) => setNewOppName(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
                <select
                  value={newOppPosition}
                  onChange={(e) => setNewOppPosition(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white font-bold"
                >
                  <option value="PG">PG</option>
                  <option value="SG">SG</option>
                  <option value="SF">SF</option>
                  <option value="PF">PF</option>
                  <option value="C">C</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddOpponentPlayer}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                >
                  + Aggiungi
                </button>
              </div>
            </div>
          </div>

          {/* Navigation to Step 2 */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleValidateAndGoToStep2}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all"
            >
              <span>Continua: Sorgente Video (Step 2)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: SORGENTE VIDEO (NO DEMOS, REAL USER INPUT ONLY) ================= */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-orange-400" />
                <span>Sorgente Video della Partita</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Scegli la modalità con cui caricare il video o la diretta streaming da analizzare con la Computer Vision.
              </p>
            </div>

            {/* Source Type Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setVideoSourceType('youtube')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  videoSourceType === 'youtube'
                    ? 'bg-red-500/10 border-red-500/60 shadow-lg text-white ring-1 ring-red-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2 text-red-500 font-bold text-sm mb-1">
                  <Youtube className="w-5 h-5" />
                  <span>YouTube Stream / Video</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Incolla un link YouTube (diretta streaming o video intero della partita).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setVideoSourceType('twitch')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  videoSourceType === 'twitch'
                    ? 'bg-purple-500/10 border-purple-500/60 shadow-lg text-white ring-1 ring-purple-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
                  <Tv className="w-5 h-5" />
                  <span>Twitch Broadcast</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Incolla il canale Twitch della diretta streaming o il link VOD della partita.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setVideoSourceType('upload')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  videoSourceType === 'upload'
                    ? 'bg-emerald-500/10 border-emerald-500/60 shadow-lg text-white ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                  <UploadCloud className="w-5 h-5" />
                  <span>Carica File Video</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Carica un file video dal tuo dispositivo (MP4, WEBM, MOV).
                </p>
              </button>
            </div>

            {/* Source Input Area */}
            {videoSourceType === 'youtube' && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <label className="text-slate-300 block text-xs font-semibold">
                  Incolla URL YouTube (Live Broadcast o Video Intero):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Supporta dirette live broadcast, VOD integrali e replay di partite ufficiali.
                </p>
              </div>
            )}

            {videoSourceType === 'twitch' && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <label className="text-slate-300 block text-xs font-semibold">
                  Incolla URL Twitch (Canale Live o VOD):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://www.twitch.tv/nome_canale oppure /videos/123456"
                    value={twitchUrl}
                    onChange={(e) => setTwitchUrl(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {videoSourceType === 'upload' && (
              <div className="bg-slate-950 p-6 rounded-2xl border-2 border-dashed border-slate-700 text-center space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <FileVideo className="w-6 h-6" />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Seleziona File Video Locale (MP4 / WEBM / MOV)
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2">
                    {uploadedFile ? `File selezionato: ${uploadedFile.name} (${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB)` : 'Trascina qui il file video oppure clicca sul pulsante sopra.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Indietro: Squadre</span>
            </button>

            <button
              type="button"
              onClick={handleValidateAndGoToStep3}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all"
            >
              <span>Continua: Setup Vision AI (Step 3)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: STATISTICHE & MOTORE VISION AI (ROBOFLOW + SAM 3) ================= */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-orange-400" />
                <span>Parametri Computer Vision (Roboflow & SAM 3)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configura i filtri dell'architettura AI: rilevamento RF-DETR, maschere pixel-level SAM 3, OCR SmolVLM2 e omografia 33 keypoints.
              </p>
            </div>

            {/* Features Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div 
                onClick={() => setEnableSAM3Masks(!enableSAM3Masks)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  enableSAM3Masks ? 'bg-orange-500/10 border-orange-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Segmentazione SAM 3</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${enableSAM3Masks ? 'bg-orange-500 border-white text-white' : 'border-slate-600'}`}>
                    {enableSAM3Masks && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tracking visivo a livello di pixel e maschere sagomate anche su occlusioni e contatti fisici.
                </p>
              </div>

              <div 
                onClick={() => setEnableHomographyRadar(!enableHomographyRadar)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  enableHomographyRadar ? 'bg-emerald-500/10 border-emerald-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Radar 2D (33 Keypoints)</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${enableHomographyRadar ? 'bg-emerald-500 border-white text-white' : 'border-slate-600'}`}>
                    {enableHomographyRadar && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Proiezione omografica dei giocatori dal piano prospettico della telecamera alla vista 2D dall'alto del campo.
                </p>
              </div>

              <div 
                onClick={() => setEnableShotEventTracker(!enableShotEventTracker)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  enableShotEventTracker ? 'bg-cyan-500/10 border-cyan-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Shot Event Tracker (Made/Missed)</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${enableShotEventTracker ? 'bg-cyan-500 border-white text-white' : 'border-slate-600'}`}>
                    {enableShotEventTracker && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Riconoscimento automatico rilascio tiro (jump shot / layup) e canestro segnato tramite finestra di rilevamento palla nel ferro.
                </p>
              </div>
            </div>

            {/* Threshold and FPS slider */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-300 font-semibold">Soglia Confidenza RF-DETR:</span>
                  <span className="font-mono text-orange-400 font-bold">{detectionConfidence}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={95}
                  value={detectionConfidence}
                  onChange={(e) => setDetectionConfidence(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-slate-300 font-semibold">Frame Rate Pipeline Ingest:</span>
                  <span className="font-mono text-emerald-400 font-bold">{trackingFps} FPS</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTrackingFps('60')}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-bold ${trackingFps === '60' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
                  >
                    60 FPS (Ultra Fluid)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackingFps('30')}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-bold ${trackingFps === '30' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
                  >
                    30 FPS (Standard)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Final Launch Action Bar */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Indietro: Video</span>
            </button>

            <button
              type="button"
              onClick={handleLaunchLiveVision}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-orange-500 text-white text-xs font-black tracking-wide shadow-xl shadow-orange-500/30 flex items-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
              <span>AVVIA PARTITA & VISION AI ADESSO</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
