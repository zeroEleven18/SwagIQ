import React, { useState, useMemo, useRef } from 'react';
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
  Check,
  Film,
  ExternalLink
} from 'lucide-react';
import { BasketballGame, HighlightClip, ShotEvent } from '../types/basketball';

interface HighlightsGeneratorProps {
  game: BasketballGame;
  onPlayClip: (clip: HighlightClip) => void;
}

export const HighlightsGenerator: React.FC<HighlightsGeneratorProps> = ({
  game,
  onPlayClip
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyMyTeam, setOnlyMyTeam] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [isPlayingInline, setIsPlayingInline] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Generate dynamic highlights from game.shots and combine with game.highlights
  const allHighlights = useMemo<HighlightClip[]>(() => {
    const existing = game.highlights || [];
    
    // If existing highlights are present, use them
    if (existing.length > 0) {
      return existing;
    }

    // Auto-generate clips from made shots if no pre-baked highlights
    const generated: HighlightClip[] = [];
    const madeShots = (game.shots || []).filter(s => s.made);

    madeShots.forEach((shot, idx) => {
      const ts = shot.videoTimestamp ?? (shot as any).timestampSec ?? shot.gameTimeSec ?? 0;
      const posX = shot.courtX ?? (shot as any).x ?? 50;
      const posY = shot.courtY ?? (shot as any).y ?? 50;

      let category: '3PT' | 'DUNK' | 'CLUTCH' | 'STEAL' | 'BLOCK' = '3PT';
      if (shot.shotType === '3PT') category = '3PT';
      else if (shot.points === 2 && posX > 38 && posX < 62 && posY < 28) category = 'DUNK';
      else if (shot.quarter === 4) category = 'CLUTCH';
      else category = 'STEAL';

      generated.push({
        id: `gen-highlight-${shot.id || idx}`,
        title: `${shot.shotType === '3PT' ? 'Tripla a bersaglio' : 'Canestro decisivo'} di ${shot.playerName}`,
        playerName: shot.playerName,
        playerNumber: shot.playerNumber,
        team: shot.teamId === 'home' ? game.homeTeam.name : game.awayTeam.name,
        category: category,
        timestampSec: Math.max(0, Math.floor(ts - 3)),
        durationSec: 8,
        scoreContext: `Q${shot.quarter} • ${shot.shotType} a segno`,
        badgeColor: category === '3PT' ? 'bg-orange-500' : category === 'DUNK' ? 'bg-red-500' : 'bg-emerald-500',
        thumbnail: shot.teamId === 'home' 
          ? 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=400&auto=format&fit=crop&q=80',
        description: `Canestro realizzato da ${shot.playerName} (${shot.teamId === 'home' ? game.homeTeam.shortName : game.awayTeam.shortName}) al minuto ${Math.floor(ts / 60)}:${(ts % 60).toString().padStart(2, '0')}.`
      });
    });

    return generated;
  }, [game]);

  const categories = [
    { id: 'all', label: 'Tutti gli Highlights', icon: Sparkles },
    { id: '3PT', label: 'Triple Spettacolari (3PT)', icon: Flame },
    { id: 'DUNK', label: 'Schiacciate & Affondate (Dunk)', icon: Zap },
    { id: 'BLOCK', label: 'Grandi Stoppate (Blocks)', icon: ShieldCheck },
    { id: 'CLUTCH', label: 'Canestri Clutch / Decisivi', icon: Award },
    { id: 'STEAL', label: 'Palle Rubate & Contropiede', icon: Clock },
  ];

  const myTeamPlayers = (game.players || []).filter((p) => p.teamId === 'home').map((p) => p.name.toLowerCase());

  const filteredClips = allHighlights.filter((clip) => {
    if (onlyMyTeam) {
      const isMyTeamName = clip.team.toLowerCase().includes(game.homeTeam.name.toLowerCase()) || 
                           clip.team.toLowerCase().includes(game.homeTeam.shortName.toLowerCase());
      const isMyPlayer = myTeamPlayers.some(name => clip.playerName.toLowerCase().includes(name) || name.includes(clip.playerName.toLowerCase()));
      if (!isMyTeamName && !isMyPlayer) return false;
    }
    if (selectedCategory === 'all') return true;
    return clip.category === selectedCategory;
  });

  const selectedClip = filteredClips.find(c => c.id === activeClipId) || filteredClips[0] || allHighlights[0] || null;

  const handleShareReel = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSelectClip = (clip: HighlightClip) => {
    setActiveClipId(clip.id);
    setIsPlayingInline(true);
    if (videoRef.current) {
      videoRef.current.currentTime = clip.timestampSec;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white flex items-center">
                  Highlight Reel & Clip Generator
                </h2>
                <button
                  onClick={() => setOnlyMyTeam(!onlyMyTeam)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all border ${
                    onlyMyTeam
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {onlyMyTeam ? `★ Solo ${game.homeTeam.name}` : 'Tutte le Squadre'}
                </button>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  {filteredClips.length} Clip Rilevate
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Riconoscimento automatico delle azioni salienti, triple, schiacciate e difese decisive condotto con Computer Vision e tracciamento SAM.
              </p>
            </div>
          </div>

          {/* Share Reel & Actions */}
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
              <span>Esporta Reel (MP4)</span>
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

      {/* Main Highlights Grid */}
      {filteredClips.length === 0 ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-10 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">Nessuna clip trovata per questa categoria</h3>
            <p className="text-xs text-slate-400">
              Non ci sono highlight per il filtro selezionato. Seleziona "Tutti gli Highlights" o registra nuovi canestri nella partita.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setOnlyMyTeam(false);
            }}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md"
          >
            Mostra Tutti gli Highlights
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Selected Highlight Focus Screen */}
          {selectedClip && (
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

              {/* Video Player / Preview Card */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-800 shadow-inner group bg-black">
                {game.videoUrl && isPlayingInline ? (
                  <video
                    ref={videoRef}
                    src={game.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <>
                    <img
                      src={selectedClip.thumbnail}
                      alt={selectedClip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                    {/* Big Play Button */}
                    <button
                      onClick={() => handleSelectClip(selectedClip)}
                      className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-orange-500/90 hover:bg-orange-500 text-white flex items-center justify-center shadow-2xl shadow-orange-500/50 transition-transform active:scale-95 group-hover:scale-110"
                    >
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </button>
                  </>
                )}

                {/* Overlay Info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider font-mono">
                      {selectedClip.category}
                    </span>
                    <h4 className="text-white font-bold text-sm mt-1">{selectedClip.playerName} (#{selectedClip.playerNumber})</h4>
                    <p className="text-xs text-slate-300">{selectedClip.description}</p>
                  </div>

                  <div className="text-right font-mono text-xs text-slate-300">
                    <div>Timestamp: {selectedClip.timestampSec}s</div>
                    <div className="text-emerald-400 font-bold">Durata: {selectedClip.durationSec}s</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Tracciamento automatico computer vision con coordinate parquet</span>
                <button
                  onClick={() => onPlayClip(selectedClip)}
                  className="flex items-center gap-1 text-orange-400 hover:text-orange-300 font-bold"
                >
                  <span>Apri nel Video Player Principale</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Highlights Reel Cards List */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="font-bold text-white text-sm px-1 flex items-center justify-between">
              <span>Elenco Highlights Generati ({filteredClips.length})</span>
              <span className="text-xs text-slate-400 font-mono">Clicca per riprodurre</span>
            </h3>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredClips.map((clip) => {
                const isSelected = selectedClip?.id === clip.id;

                return (
                  <div
                    key={clip.id}
                    onClick={() => handleSelectClip(clip)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex space-x-3 group ${
                      isSelected
                        ? 'bg-slate-900 border-orange-500 ring-1 ring-orange-500/40 shadow-xl'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-slate-800 bg-slate-950">
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
      )}
    </div>
  );
};
