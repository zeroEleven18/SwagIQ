import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  Share2, 
  Download, 
  Flame, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Award,
  Video,
  Check
} from 'lucide-react';
import { BasketballGame, HighlightClip } from '../types/basketball';

interface HighlightsGeneratorProps {
  game: BasketballGame;
  onPlayClip: (clip: HighlightClip) => void;
}

export const HighlightsGenerator: React.FC<HighlightsGeneratorProps> = ({
  game,
  onPlayClip
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyMyTeam, setOnlyMyTeam] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedClip, setSelectedClip] = useState<HighlightClip>(game.highlights[0]);

  const categories = [
    { id: 'all', label: 'Tutti gli Highlights', icon: Sparkles },
    { id: '3PT', label: 'Triple Spettacolari (3PT)', icon: Flame },
    { id: 'DUNK', label: 'Schiacciate & Affondate (Dunk)', icon: Zap },
    { id: 'BLOCK', label: 'Grandi Stoppate (Blocks)', icon: ShieldCheck },
    { id: 'CLUTCH', label: 'Canestri Clutch / Decisivi', icon: Award },
    { id: 'STEAL', label: 'Palle Rubate & Contropiede', icon: Clock },
  ];

  const myTeamPlayers = game.players.filter((p) => p.teamId === 'home').map((p) => p.name.toLowerCase());

  const filteredClips = game.highlights.filter((clip) => {
    if (onlyMyTeam) {
      const isMyTeamName = clip.team.toLowerCase().includes(game.homeTeam.name.toLowerCase()) || 
                           clip.team.toLowerCase().includes(game.homeTeam.shortName.toLowerCase());
      const isMyPlayer = myTeamPlayers.some(name => clip.playerName.toLowerCase().includes(name) || name.includes(clip.playerName.toLowerCase()));
      if (!isMyTeamName && !isMyPlayer) return false;
    }
    if (selectedCategory === 'all') return true;
    return clip.category === selectedCategory;
  });

  const handleShareReel = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white flex items-center">
                  Highlights & Reel
                </h2>
                <button
                  onClick={() => setOnlyMyTeam(!onlyMyTeam)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all border ${
                    onlyMyTeam
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {onlyMyTeam ? `★ Solo Mia Squadra (${game.homeTeam.name})` : 'Tutte le Squadre'}
                </button>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  {filteredClips.length} Clip
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Riconoscimento automatico delle azioni decisive di <strong className="text-slate-200">{game.homeTeam.name}</strong> condotto dai modelli di computer vision.
              </p>
            </div>
          </div>

          {/* Share Reel Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareReel}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-orange-400" />}
              <span>{copiedLink ? 'Link Copiato!' : 'Condividi Reel'}</span>
            </button>

            <button
              onClick={() => alert("Scaricamento pacchetto reel MP4 1080p avviato!")}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-md shadow-orange-500/25 transition-transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Esporta Video Reel (MP4)</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Clip Player & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Selected Highlight Focus Screen */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Video className="w-4 h-4 text-orange-400" />
              <h3 className="font-bold text-white text-sm">{selectedClip.title}</h3>
            </div>
            <span className="text-xs text-orange-400 font-mono font-bold">
              ★ {selectedClip.scoreContext}
            </span>
          </div>

          {/* Video Preview Card */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-800 shadow-inner group">
            <img
              src={selectedClip.thumbnail}
              alt={selectedClip.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

            {/* Big Play Button */}
            <button
              onClick={() => onPlayClip(selectedClip)}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-orange-500/90 hover:bg-orange-500 text-white flex items-center justify-center shadow-2xl shadow-orange-500/50 transition-transform active:scale-95 group-hover:scale-110"
            >
              <Play className="w-8 h-8 fill-current ml-1" />
            </button>

            {/* Overlay Info */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-orange-500 text-white text-[11px] font-bold uppercase tracking-wider font-mono">
                  {selectedClip.category}
                </span>
                <h4 className="text-white font-bold text-base mt-1">{selectedClip.playerName} (#{selectedClip.playerNumber})</h4>
                <p className="text-xs text-slate-300">{selectedClip.description}</p>
              </div>

              <div className="text-right font-mono text-xs text-slate-300">
                <div>Timestamp: {selectedClip.timestampSec}s</div>
                <div className="text-emerald-400 font-bold">Durata: {selectedClip.durationSec}s</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Rilevamento computer vision Roboflow automatico con SAM 3 tracking</span>
            <button
              onClick={() => onPlayClip(selectedClip)}
              className="text-orange-400 hover:underline font-bold flex items-center"
            >
              Riproduci ora nel Player Video &rarr;
            </button>
          </div>
        </div>

        {/* Highlights Reel Cards List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-bold text-white text-sm px-1 flex items-center justify-between">
            <span>Elenco Highlights Generati ({filteredClips.length})</span>
            <span className="text-xs text-slate-400 font-mono">Seleziona per vedere</span>
          </h3>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredClips.map((clip) => {
              const isSelected = selectedClip.id === clip.id;

              return (
                <div
                  key={clip.id}
                  onClick={() => {
                    setSelectedClip(clip);
                    onPlayClip(clip);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex space-x-3 group ${
                    isSelected
                      ? 'bg-slate-900 border-orange-500 ring-1 ring-orange-500/40 shadow-xl'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-slate-800">
                    <img
                      src={clip.thumbnail}
                      alt={clip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white fill-current" />
                    </div>
                    <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[10px] font-mono text-white">
                      {clip.durationSec}s
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-orange-400 font-mono">
                          {clip.category}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold">#{clip.playerNumber}</span>
                      </div>
                      <h4 className="font-bold text-white text-xs truncate mt-0.5">{clip.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{clip.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>{clip.playerName}</span>
                      <span className="text-emerald-400 font-bold">{clip.scoreContext}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
