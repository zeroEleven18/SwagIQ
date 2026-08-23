import React, { useState, useRef } from 'react';
import { 
  Users, 
  Shield, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  Check, 
  Shirt, 
  TrendingUp,
  Activity,
  Image,
  Upload,
  Camera,
  ArrowLeft
} from 'lucide-react';
import { SupportedLanguage } from '../i18n/translations';
import { SwagIQBrand } from './SwagIQBrand';

export interface RosterPlayerItem {
  id: string;
  number: number;
  name: string;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  photoUrl?: string;
  heightCm?: number;
  weightKg?: number;
  birthYear?: number;
  dominantHand?: 'Destro' | 'Mancino';
  isStarter: boolean;
  roleTag?: string;
  seasonAvg?: {
    ppg: number;
    rpg: number;
    apg: number;
    spg: number;
    bpg: number;
    fgPct: number;
    threePct: number;
    ftPct: number;
    mpg: number;
  };
}

export interface OurTeamSetupData {
  name: string;
  shortName: string;
  logo?: string;
  color: string;
  secondaryColor?: string;
  coach: string;
  assistantCoach?: string;
  city: string;
  arena: string;
  league: string;
  roster: RosterPlayerItem[];
}

export const ANONYMOUS_PLAYER_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%2394a3b8'><circle cx='50' cy='36' r='20' fill='%2364748b'/><path d='M18,88 C18,65 33,56 50,56 C67,56 82,65 82,88 Z' fill='%2364748b'/><circle cx='50' cy='50' r='48' fill='none' stroke='%23475569' stroke-width='4'/></svg>";

export const DEFAULT_TEAM_LOGO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23f97316'/><path d='M50,5 A45,45 0 0,0 50,95 M5,50 A45,45 0 0,0 95,50 M18,18 Q50,50 18,82 M82,18 Q50,50 82,82' stroke='%23ffffff' stroke-width='4' fill='none'/><circle cx='50' cy='50' r='14' fill='%23ea580c'/></svg>";

const DEFAULT_OUR_TEAM: OurTeamSetupData = {
  name: 'La Mia Squadra',
  shortName: 'LMS',
  logo: DEFAULT_TEAM_LOGO,
  color: '#007A33',
  secondaryColor: '#1E293B',
  coach: 'Coach Principale',
  assistantCoach: 'Vice Coach',
  city: 'Bologna, Italy',
  arena: 'Palasport',
  league: 'Lega Basket / Campionato Ufficiale',
  roster: [
    { 
      id: 'p-1', 
      number: 3, 
      name: 'Playmaker Titolare', 
      position: 'PG', 
      photoUrl: ANONYMOUS_PLAYER_AVATAR,
      heightCm: 190, 
      isStarter: true,
      roleTag: 'Floor General',
      seasonAvg: { ppg: 12.4, rpg: 3.2, apg: 5.6, spg: 1.4, bpg: 0.2, fgPct: 46.1, threePct: 38.8, ftPct: 85.0, mpg: 28.0 }
    },
    { 
      id: 'p-2', 
      number: 7, 
      name: 'Guardia Tiratrice', 
      position: 'SG', 
      photoUrl: ANONYMOUS_PLAYER_AVATAR,
      heightCm: 196, 
      isStarter: true,
      roleTag: 'Sharpshooter',
      seasonAvg: { ppg: 16.8, rpg: 2.8, apg: 2.1, spg: 0.9, bpg: 0.1, fgPct: 45.5, threePct: 41.2, ftPct: 89.5, mpg: 26.5 }
    },
    { 
      id: 'p-3', 
      number: 11, 
      name: 'Ala Piccola', 
      position: 'SF', 
      photoUrl: ANONYMOUS_PLAYER_AVATAR,
      heightCm: 201, 
      isStarter: true,
      roleTag: 'Two-Way Wing',
      seasonAvg: { ppg: 13.6, rpg: 4.8, apg: 2.8, spg: 1.3, bpg: 0.6, fgPct: 49.2, threePct: 36.0, ftPct: 79.0, mpg: 27.0 }
    },
    { 
      id: 'p-4', 
      number: 21, 
      name: 'Ala Grande', 
      position: 'PF', 
      photoUrl: ANONYMOUS_PLAYER_AVATAR,
      heightCm: 206, 
      isStarter: true,
      roleTag: 'Stretch 4 & Post Up',
      seasonAvg: { ppg: 14.2, rpg: 6.6, apg: 3.0, spg: 0.8, bpg: 0.8, fgPct: 52.8, threePct: 33.5, ftPct: 78.4, mpg: 26.5 }
    },
    { 
      id: 'p-5', 
      number: 33, 
      name: 'Centro Titolare', 
      position: 'C', 
      photoUrl: ANONYMOUS_PLAYER_AVATAR,
      heightCm: 210, 
      isStarter: true,
      roleTag: 'Rim Protector',
      seasonAvg: { ppg: 10.8, rpg: 8.4, apg: 1.2, bpg: 1.5, spg: 0.4, fgPct: 61.5, threePct: 0.0, ftPct: 72.5, mpg: 24.0 }
    },
    { 
      id: 'p-6', 
      number: 6, 
      name: 'Playmaker Riserva', 
      position: 'PG', 
      photoUrl: ANONYMOUS_PLAYER_AVATAR,
      heightCm: 188, 
      isStarter: false,
      roleTag: 'Defensive Guard',
      seasonAvg: { ppg: 6.2, rpg: 2.1, apg: 3.4, spg: 1.1, bpg: 0.1, fgPct: 42.0, threePct: 34.5, ftPct: 80.0, mpg: 16.5 }
    },
    { 
      id: 'p-7', 
      number: 14, 
      name: 'Guardia / Ala Riserva', 
      position: 'SG', 
      photoUrl: ANONYMOUS_PLAYER_AVATAR,
      heightCm: 195, 
      isStarter: false,
      roleTag: 'Perimeter Shooter',
      seasonAvg: { ppg: 7.5, rpg: 2.4, apg: 1.2, spg: 0.6, bpg: 0.2, fgPct: 43.0, threePct: 37.0, ftPct: 82.0, mpg: 15.0 }
    },
    { 
      id: 'p-8', 
      number: 25, 
      name: 'Lungo di Cambio', 
      position: 'C', 
      photoUrl: ANONYMOUS_PLAYER_AVATAR,
      heightCm: 208, 
      isStarter: false,
      roleTag: 'Rebounder & Energy Big',
      seasonAvg: { ppg: 6.8, rpg: 5.2, apg: 0.8, bpg: 0.9, spg: 0.3, fgPct: 55.0, threePct: 25.0, ftPct: 70.0, mpg: 14.0 }
    }
  ]
};

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

export const OurTeamRosterSetup: React.FC<{ 
  currentLanguage: SupportedLanguage; 
  onTeamSaved?: () => void;
  onBack?: () => void;
}> = ({
  onTeamSaved,
  onBack
}) => {
  // Load from localStorage
  const [teamData, setTeamData] = useState<OurTeamSetupData>(() => {
    try {
      const saved = localStorage.getItem('swagiq_our_team');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_OUR_TEAM;
  });

  const [savedFeedback, setSavedFeedback] = useState(false);
  
  // New player input state
  const [newNumber, setNewNumber] = useState<number | ''>('');
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState<'PG' | 'SG' | 'SF' | 'PF' | 'C'>('SG');
  const [newHeight, setNewHeight] = useState<number | ''>(195);
  const [newStarter, setNewStarter] = useState(false);
  const [newRoleTag, setNewRoleTag] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>(ANONYMOUS_PLAYER_AVATAR);

  // Hidden file inputs for uploads
  const teamLogoInputRef = useRef<HTMLInputElement>(null);
  const newPlayerPhotoInputRef = useRef<HTMLInputElement>(null);
  const playerPhotoRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Handle Team Logo File Upload
  const handleTeamLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setTeamData({ ...teamData, logo: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle New Player Photo Upload
  const handleNewPlayerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setNewPhotoUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Existing Player Photo Upload
  const handlePlayerPhotoChange = (playerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const updated = teamData.roster.map(p => 
            p.id === playerId ? { ...p, photoUrl: reader.result as string } : p
          );
          setTeamData({ ...teamData, roster: updated });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes to localStorage
  const handleSaveTeam = () => {
    try {
      localStorage.setItem('swagiq_our_team', JSON.stringify(teamData));
      setSavedFeedback(true);
      if (onTeamSaved) onTeamSaved();
      setTimeout(() => setSavedFeedback(false), 3000);
    } catch (e) {
      alert('Errore nel salvataggio in memoria locale.');
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm('Vuoi ripristinare la configurazione predefinita?')) {
      setTeamData(DEFAULT_OUR_TEAM);
      localStorage.setItem('swagiq_our_team', JSON.stringify(DEFAULT_OUR_TEAM));
    }
  };

  // Add new player to roster
  const handleAddPlayer = () => {
    if (!newName.trim() || newNumber === '') {
      alert('Inserisci il nome e il numero di maglia.');
      return;
    }

    const newPlayer: RosterPlayerItem = {
      id: `p-${Date.now()}`,
      number: Number(newNumber),
      name: newName.trim(),
      position: newPosition,
      photoUrl: newPhotoUrl || ANONYMOUS_PLAYER_AVATAR,
      heightCm: newHeight ? Number(newHeight) : 195,
      isStarter: newStarter,
      roleTag: newRoleTag || `${newPosition} Player`,
      seasonAvg: {
        ppg: 8.0,
        rpg: 3.0,
        apg: 2.0,
        spg: 0.8,
        bpg: 0.3,
        fgPct: 45.0,
        threePct: 35.0,
        ftPct: 80.0,
        mpg: 18.0
      }
    };

    const updatedRoster = [...teamData.roster, newPlayer];
    setTeamData({ ...teamData, roster: updatedRoster });

    // Reset inputs
    setNewName('');
    setNewNumber('');
    setNewRoleTag('');
    setNewPhotoUrl(ANONYMOUS_PLAYER_AVATAR);
  };

  // Delete player
  const handleDeletePlayer = (id: string) => {
    if (teamData.roster.length <= 5) {
      alert('Il roster deve avere almeno 5 giocatori.');
      return;
    }
    setTeamData({
      ...teamData,
      roster: teamData.roster.filter(p => p.id !== id)
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl border border-white/20 overflow-hidden"
            style={{ backgroundColor: teamData.color }}
          >
            {teamData.logo && (teamData.logo.startsWith('http') || teamData.logo.startsWith('data:')) ? (
              <img src={teamData.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span>{teamData.logo || teamData.shortName || 'MY'}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-mono font-bold tracking-wide">
                SETUP ROSTER & CLUB
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                La Nostra Squadra & Roster Ufficiale
              </h2>
              <SwagIQBrand size="xs" />
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Configura i dati societari, logo squadra, colori maglia e foto di ciascun atleta per i tabellini delle partite e il tracciamento video.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Torna Indietro</span>
            </button>
          )}

          <button
            onClick={handleResetToDefault}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors border border-slate-700 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Predefinito</span>
          </button>

          <button
            onClick={handleSaveTeam}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center gap-2"
          >
            {savedFeedback ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{savedFeedback ? 'Salvataggio Riuscito!' : 'Salva Roster Squadra'}</span>
          </button>
        </div>
      </div>

      {/* CLUB IDENTITY & COLOR PALETTE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: General Team Info & Staff */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-orange-400" />
            <span>Dati Societari & Staff Tecnico</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="col-span-1 sm:col-span-2">
              <label className="text-slate-400 block mb-1 font-semibold">Nome Ufficiale Squadra:</label>
              <input
                type="text"
                value={teamData.name}
                onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Sigla Referto (3-4 lettere):</label>
              <input
                type="text"
                maxLength={4}
                value={teamData.shortName}
                onChange={(e) => setTeamData({ ...teamData, shortName: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Team Logo Section */}
            <div className="col-span-1 sm:col-span-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold flex items-center gap-1.5 text-xs">
                  <Image className="w-3.5 h-3.5 text-orange-400" />
                  <span>Logo Squadra Ufficiale:</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={teamLogoInputRef}
                    accept="image/*"
                    onChange={handleTeamLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => teamLogoInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carica File Logo</span>
                  </button>
                  {teamData.logo && teamData.logo !== DEFAULT_TEAM_LOGO && (
                    <button
                      type="button"
                      onClick={() => setTeamData({ ...teamData, logo: DEFAULT_TEAM_LOGO })}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold"
                    >
                      Ripristina Default
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={teamData.logo || DEFAULT_TEAM_LOGO}
                    alt="Team Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <input
                  type="text"
                  placeholder="URL Logo (es. https://...)"
                  value={teamData.logo || ''}
                  onChange={(e) => setTeamData({ ...teamData, logo: e.target.value || DEFAULT_TEAM_LOGO })}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Capo Allenatore (Head Coach):</label>
              <input
                type="text"
                value={teamData.coach}
                onChange={(e) => setTeamData({ ...teamData, coach: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Assistente Allenatore:</label>
              <input
                type="text"
                value={teamData.assistantCoach || ''}
                onChange={(e) => setTeamData({ ...teamData, assistantCoach: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Città / Sede:</label>
              <input
                type="text"
                value={teamData.city}
                onChange={(e) => setTeamData({ ...teamData, city: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Palasport / Arena:</label>
              <input
                type="text"
                value={teamData.arena}
                onChange={(e) => setTeamData({ ...teamData, arena: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="text-slate-400 block mb-1 font-semibold">Campionato / Divisione:</label>
              <input
                type="text"
                value={teamData.league}
                onChange={(e) => setTeamData({ ...teamData, league: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Colors with Color Dots (Pallini Colorati) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shirt className="w-4 h-4 text-orange-400" />
            <span>Colori Squadra & Maglia</span>
          </h3>

          <div className="space-y-4 text-xs">
            {/* Color Dots Palette */}
            <div>
              <label className="text-slate-400 block mb-2 font-semibold">Colore Principale:</label>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={`dot-${c}`}
                    type="button"
                    onClick={() => setTeamData({ ...teamData, color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border transition-transform ${
                      teamData.color.toLowerCase() === c.toLowerCase()
                        ? 'scale-125 ring-2 ring-white border-white shadow-md'
                        : 'border-slate-600 hover:scale-110 opacity-85 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>

              {/* Custom Hex Picker */}
              <div className="flex items-center space-x-3 bg-slate-950 px-3 py-2 rounded-xl border border-slate-700">
                <input
                  type="color"
                  value={teamData.color}
                  onChange={(e) => setTeamData({ ...teamData, color: e.target.value })}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={teamData.color}
                  onChange={(e) => setTeamData({ ...teamData, color: e.target.value })}
                  className="font-mono text-white font-bold bg-transparent border-0 focus:outline-none w-24 text-xs uppercase"
                />
              </div>
            </div>

            {/* Visual Jersey Card Preview */}
            <div 
              className="rounded-2xl p-5 border text-center shadow-lg transition-all flex flex-col items-center justify-center space-y-1"
              style={{ backgroundColor: teamData.color, borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-base font-mono font-bold text-white mb-1 overflow-hidden">
                {teamData.logo && (teamData.logo.startsWith('http') || teamData.logo.startsWith('data:')) ? (
                  <img src={teamData.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span>{teamData.logo || teamData.shortName?.slice(0, 2) || 'TM'}</span>
                )}
              </div>
              <div className="font-black text-base text-white tracking-wider">{teamData.name.toUpperCase()}</div>
              <div className="font-mono font-extrabold text-3xl text-white drop-shadow-md">#7</div>
              <div className="text-[11px] font-bold text-white/90">{teamData.shortName} BASKETBALL</div>
            </div>
          </div>
        </div>
      </div>

      {/* ROSTER TABLE MANAGEMENT */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              <span>Organico Completo Giocatori ({teamData.roster.length} Atleti Registrati)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestisci l'elenco dei giocatori, i numeri di maglia, i ruoli e la foto personale che comparirà nei tabellini ufficiali.
            </p>
          </div>
        </div>

        {/* Add Player Bar */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Aggiungi Nuovo Giocatore all'Organico:</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 text-xs items-end">
            {/* Photo Preview & Selector (col-span 2) */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-slate-400 block font-semibold">Foto Profilo:</label>
              <div className="flex items-center space-x-2 h-10">
                <img
                  src={newPhotoUrl || ANONYMOUS_PLAYER_AVATAR}
                  alt="Preview"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 bg-slate-900 shadow-sm shrink-0"
                />
                <input
                  type="file"
                  ref={newPlayerPhotoInputRef}
                  accept="image/*"
                  onChange={handleNewPlayerPhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => newPlayerPhotoInputRef.current?.click()}
                  className="h-10 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-1 flex-1 font-medium transition-colors"
                  title="Carica foto dal tuo dispositivo"
                >
                  <Camera className="w-4 h-4 text-orange-400" />
                  <span className="text-[11px]">Foto</span>
                </button>
              </div>
            </div>

            {/* Jersey Number (col-span 2) */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-slate-400 block font-semibold"># Maglia:</label>
              <input
                type="number"
                min={0}
                max={99}
                placeholder="es. 23"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl px-3 text-white font-mono font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Name & Surname (col-span 3) */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-slate-400 block font-semibold">Nome e Cognome:</label>
              <input
                type="text"
                placeholder="es. Mario Rossi"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl px-3 text-white font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Position / Ruolo (col-span 2) */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-slate-400 block font-semibold">Ruolo:</label>
              <select
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value as any)}
                className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl px-3 text-white font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="PG">PG - Playmaker</option>
                <option value="SG">SG - Guardia</option>
                <option value="SF">SF - Ala Piccola</option>
                <option value="PF">PF - Ala Grande</option>
                <option value="C">C - Centro</option>
              </select>
            </div>

            {/* Height (col-span 1) */}
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-slate-400 block font-semibold truncate" title="Altezza in cm">Alt.(cm):</label>
              <input
                type="number"
                placeholder="cm"
                value={newHeight}
                onChange={(e) => setNewHeight(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl px-2.5 text-white font-mono text-center font-medium focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Add Button (col-span 2) */}
            <div className="md:col-span-2 space-y-1.5">
              <button
                type="button"
                onClick={handleAddPlayer}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Aggiungi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Players Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Foto</th>
                <th className="py-3 px-4"># Maglia</th>
                <th className="py-3 px-4">Giocatore</th>
                <th className="py-3 px-4">Ruolo</th>
                <th className="py-3 px-4">Altezza</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {teamData.roster.map((player) => (
                <tr key={player.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center space-x-2">
                      <img
                        src={player.photoUrl || ANONYMOUS_PLAYER_AVATAR}
                        alt={player.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-950 shadow-sm"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => { playerPhotoRefs.current[player.id] = el; }}
                        onChange={(e) => handlePlayerPhotoChange(player.id, e)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => playerPhotoRefs.current[player.id]?.click()}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="Cambia foto del giocatore"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-orange-400 text-sm">
                    #{player.number}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {player.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 font-mono font-semibold border border-slate-700 text-[11px]">
                      {player.position}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {player.heightCm ? `${player.heightCm} cm` : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = teamData.roster.map(p => 
                          p.id === player.id ? { ...p, isStarter: !p.isStarter } : p
                        );
                        setTeamData({ ...teamData, roster: updated });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        player.isStarter
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {player.isStarter ? '★ Titolare' : 'Panchina'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeletePlayer(player.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Elimina giocatore"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
