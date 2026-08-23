import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Layers, 
  PenTool, 
  Trash2, 
  FastForward, 
  Rewind,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  Sliders,
  ShieldAlert,
  Sparkles,
  Check,
  ChevronRight,
  Filter,
  Flame,
  Award
} from 'lucide-react';
import { BasketballGame, ShotEvent, TrackingPeriod, PlayerStats } from '../types/basketball';
import { extractYouTubeId, getYouTubeEmbedUrl } from '../utils/youtube';
import { extractTwitchInfo, getTwitchEmbedUrl } from '../utils/twitch';

interface VisionVideoPlayerProps {
  game: BasketballGame;
  activeShotId?: string | null;
  onShotSelect: (shot: ShotEvent) => void;
  externalTimestamp?: number | null;
  onUpdateGame?: (updatedGame: BasketballGame) => void;
}

export const VisionVideoPlayer: React.FC<VisionVideoPlayerProps> = ({
  game,
  activeShotId,
  onShotSelect,
  externalTimestamp,
  onUpdateGame
}) => {
  // Key for local/session storage persistence per game ID
  const playbackStorageKey = `swagiq_playback_state_${game.id}`;

  const getSavedPlayback = () => {
    try {
      const raw = sessionStorage.getItem(playbackStorageKey) || localStorage.getItem(playbackStorageKey);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {}
    return null;
  };

  const initialSaved = getSavedPlayback();

  // 1. Initial Duration calculation based on game data or saved state
  const initialDuration = useMemo(() => {
    if (game.videoDurationSec && game.videoDurationSec > 0) {
      return game.videoDurationSec;
    }
    if (initialSaved?.duration && initialSaved.duration > 0) {
      return initialSaved.duration;
    }
    if (game.shots && game.shots.length > 0) {
      const maxShot = Math.max(...game.shots.map(s => s.videoTimestamp || 0));
      if (maxShot > 0) {
        return maxShot + 30;
      }
    }
    return 0; // Dynamic duration from video metadata
  }, [game.videoDurationSec, game.shots, initialSaved]);

  // Playback state: restores previous position or starts paused
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(() => {
    if (externalTimestamp !== undefined && externalTimestamp !== null && externalTimestamp > 0) {
      return externalTimestamp;
    }
    if (initialSaved && typeof initialSaved.currentTime === 'number' && initialSaved.currentTime > 0) {
      return initialSaved.currentTime;
    }
    return 0;
  });
  const [duration, setDuration] = useState<number>(initialDuration);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(true);

  // Video element and iframe refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const youtubeIframeRef = useRef<HTMLIFrameElement | null>(null);
  const ytPlayerRef = useRef<any>(null);

  // Vision Overlay Toggles (Roboflow & SAM 3) - Default clean to avoid clutter
  const [showBBoxes, setShowBBoxes] = useState(false);
  const [showSAMMasks, setShowSAMMasks] = useState(false);
  const [showPlayerTags, setShowPlayerTags] = useState(false);
  const [showKeypoints, setShowKeypoints] = useState(false);
  const [showBallTrajectory, setShowBallTrajectory] = useState(false);
  const [showRadarMiniCourt, setShowRadarMiniCourt] = useState(true);
  const [selectedDetectionId, setSelectedDetectionId] = useState<string | null>(null);

  // Telestrator Drawing Mode
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawColor, setDrawColor] = useState('#f97316'); // Orange
  const [drawTool, setDrawTool] = useState<'pen' | 'arrow' | 'circle'>('pen');
  const [drawings, setDrawings] = useState<Array<{ type: string; points: { x: number; y: number }[]; color: string }>>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const isMouseDownRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ================= STATS TRACKING SESSION & DIRTY VIDEO FILTER =================
  // Tracking status: restores or starts in 'paused'
  const [trackingStatus, setTrackingStatus] = useState<'recording' | 'paused' | 'stopped'>(() => {
    if (initialSaved?.trackingStatus) {
      return initialSaved.trackingStatus === 'recording' ? 'paused' : initialSaved.trackingStatus;
    }
    return 'paused';
  });
  const [isStopModalOpen, setIsStopModalOpen] = useState<boolean>(false);
  const [currentPeriodName, setCurrentPeriodName] = useState<string>(() => {
    if (initialSaved?.currentPeriodName) return initialSaved.currentPeriodName;
    return 'In attesa di avvio';
  });
  const [filterUntrackedEvents, setFilterUntrackedEvents] = useState<boolean>(false);
  
  // Official tracking periods (restored from saved state or game data)
  const [trackingPeriods, setTrackingPeriods] = useState<TrackingPeriod[]>(() => {
    if (initialSaved?.trackingPeriods && initialSaved.trackingPeriods.length > 0) {
      return initialSaved.trackingPeriods;
    }
    if (game.trackingPeriods && game.trackingPeriods.length > 0) {
      return game.trackingPeriods;
    }
    return [];
  });

  // Standard Quarter Breakpoints based on total duration (defaults to 10 min chunks if duration unknown)
  const quarterBreakpoints = useMemo(() => {
    const d = duration > 0 ? duration : 2400;
    return {
      Q1: 0,
      Q2: Math.floor(d * 0.25),
      Q3: Math.floor(d * 0.50),
      Q4: Math.floor(d * 0.75),
      OT: Math.floor(d * 0.90)
    };
  }, [duration]);

  // Determine active quarter key based on currentTime
  const currentQuarterKey = useMemo<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'OT'>(() => {
    if (currentTime < quarterBreakpoints.Q2) return 'Q1';
    if (currentTime < quarterBreakpoints.Q3) return 'Q2';
    if (currentTime < quarterBreakpoints.Q4) return 'Q3';
    if (currentTime < quarterBreakpoints.OT) return 'Q4';
    return 'OT';
  }, [currentTime, quarterBreakpoints]);

  // Keep refs updated for background saving on unmount
  const currentTimeRef = useRef(currentTime);
  const durationRef = useRef(duration);
  const trackingStatusRef = useRef(trackingStatus);
  const currentPeriodNameRef = useRef(currentPeriodName);
  const currentQuarterKeyRef = useRef(currentQuarterKey);
  const trackingPeriodsRef = useRef(trackingPeriods);

  useEffect(() => {
    currentTimeRef.current = currentTime;
    durationRef.current = duration;
    trackingStatusRef.current = trackingStatus;
    currentPeriodNameRef.current = currentPeriodName;
    currentQuarterKeyRef.current = currentQuarterKey;
    trackingPeriodsRef.current = trackingPeriods;
  }, [currentTime, duration, trackingStatus, currentPeriodName, currentQuarterKey, trackingPeriods]);

  // Persist playback state on interval and component unmount
  useEffect(() => {
    const savePlayback = () => {
      try {
        const payload = {
          currentTime: currentTimeRef.current,
          duration: durationRef.current,
          trackingStatus: trackingStatusRef.current,
          currentPeriodName: currentPeriodNameRef.current,
          currentQuarterKey: currentQuarterKeyRef.current,
          trackingPeriods: trackingPeriodsRef.current,
          updatedAt: Date.now()
        };
        sessionStorage.setItem(playbackStorageKey, JSON.stringify(payload));
        localStorage.setItem(playbackStorageKey, JSON.stringify(payload));
      } catch (e) {}
    };

    const interval = setInterval(savePlayback, 1000);
    return () => {
      clearInterval(interval);
      savePlayback();
    };
  }, [playbackStorageKey]);

  // Check if currentTime is within an active official tracking window
  const isCurrentTimeTracked = useMemo(() => {
    if (trackingPeriods.length === 0) return true;
    return trackingPeriods.some(p => {
      const end = p.endSec ?? duration;
      return currentTime >= p.startSec && currentTime <= end;
    });
  }, [trackingPeriods, currentTime, duration]);

  // Current active tracking period if inside one
  const activeCurrentPeriod = useMemo(() => {
    return trackingPeriods.find(p => {
      const end = p.endSec ?? duration;
      return currentTime >= p.startSec && currentTime <= end;
    });
  }, [trackingPeriods, currentTime, duration]);

  // Filter shots: if filter is on, only include shots within valid tracking windows
  const visibleShots = useMemo(() => {
    if (!filterUntrackedEvents || trackingPeriods.length === 0) {
      return game.shots;
    }
    return game.shots.filter(shot => {
      return trackingPeriods.some(p => {
        const end = p.endSec ?? duration;
        return shot.videoTimestamp >= p.startSec && shot.videoTimestamp <= end;
      });
    });
  }, [game.shots, filterUntrackedEvents, trackingPeriods, duration]);

  // Video source detection
  const effectiveYouTubeId = game.youtubeId || (game.videoUrl ? extractYouTubeId(game.videoUrl) : null);
  const isYouTubeVideo = Boolean(effectiveYouTubeId);
  const effectiveTwitchInfo = (game.videoSourceType === 'twitch' || (game.videoUrl && game.videoUrl.includes('twitch.tv')))
    ? extractTwitchInfo(game.videoUrl || '')
    : null;
  const isTwitchVideo = Boolean(effectiveTwitchInfo);
  const isLocalOrDirectVideo = !isYouTubeVideo && !isTwitchVideo && (
    game.videoSourceType === 'local' || 
    (Boolean(game.videoUrl) && (
      game.videoUrl.endsWith('.mp4') || 
      game.videoUrl.endsWith('.webm') || 
      game.videoUrl.startsWith('blob:') || 
      game.videoUrl.startsWith('data:') ||
      game.videoUrl.includes('/video')
    ))
  );

  // Post message helper for YouTube Iframe API
  const sendYouTubeCommand = (func: string, args: any[] = []) => {
    if (youtubeIframeRef.current?.contentWindow) {
      youtubeIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  };

  // Handle Game ID switch (load new game state or restore without wiping current game)
  const lastGameIdRef = useRef(game.id);
  useEffect(() => {
    if (lastGameIdRef.current !== game.id) {
      lastGameIdRef.current = game.id;
      const saved = getSavedPlayback();
      const initialT = (externalTimestamp !== undefined && externalTimestamp !== null && externalTimestamp > 0)
        ? externalTimestamp
        : (saved?.currentTime || 0);

      setCurrentTime(initialT);
      setIsPlaying(false);
      setTrackingStatus(saved?.trackingStatus === 'recording' ? 'paused' : (saved?.trackingStatus || 'paused'));
      setCurrentPeriodName(saved?.currentPeriodName || 'In attesa di avvio');
      setTrackingPeriods(saved?.trackingPeriods || game.trackingPeriods || []);
      setDuration(game.videoDurationSec || saved?.duration || 0);
      setDrawings([]);

      if (videoRef.current) {
        videoRef.current.currentTime = initialT;
        videoRef.current.pause();
      }
      if (isYouTubeVideo) {
        sendYouTubeCommand('pauseVideo');
        sendYouTubeCommand('seekTo', [initialT, true]);
      }
    } else {
      // Same game upon tab return: ensure video element is at currentTime and paused
      if (videoRef.current && currentTime > 0) {
        videoRef.current.currentTime = currentTime;
        videoRef.current.pause();
      }
    }
  }, [game.id]);

  // Master Play/Pause Controller
  const handleTogglePlayPause = () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);

    if (isLocalOrDirectVideo && videoRef.current) {
      if (nextPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    } else if (isYouTubeVideo) {
      sendYouTubeCommand(nextPlaying ? 'playVideo' : 'pauseVideo');
    }
  };

  // Master Seek Controller
  const handleSeek = (newTime: number) => {
    const maxDur = duration > 0 ? duration : 3600;
    const clamped = Math.max(0, Math.min(maxDur, newTime));
    setCurrentTime(clamped);

    if (isLocalOrDirectVideo && videoRef.current) {
      videoRef.current.currentTime = clamped;
    } else if (isYouTubeVideo) {
      sendYouTubeCommand('seekTo', [clamped, true]);
    }
  };

  // Master Playback Rate Controller
  const handleSetPlaybackRate = (rate: number) => {
    setPlaybackRate(rate);

    if (isLocalOrDirectVideo && videoRef.current) {
      videoRef.current.playbackRate = rate;
    } else if (isYouTubeVideo) {
      sendYouTubeCommand('setPlaybackRate', [rate]);
    }
  };

  // Master Mute Toggle Controller
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (isLocalOrDirectVideo && videoRef.current) {
      videoRef.current.muted = nextMuted;
    } else if (isYouTubeVideo) {
      sendYouTubeCommand(nextMuted ? 'mute' : 'unMute');
    }
  };

  // Step Forward / Backward
  const handleStepTime = (delta: number) => {
    handleSeek(currentTime + delta);
  };

  // Listen to postMessage from YouTube iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        if (typeof e.data === 'string') {
          const data = JSON.parse(e.data);
          if (data.event === 'infoDelivery' && data.info) {
            if (typeof data.info.currentTime === 'number') {
              setCurrentTime(Number(data.info.currentTime.toFixed(2)));
            }
            if (typeof data.info.duration === 'number' && data.info.duration > 0) {
              setDuration(Math.floor(data.info.duration));
            }
            if (typeof data.info.playerState === 'number') {
              // 1 = playing, 2 = paused, 0 = ended
              if (data.info.playerState === 1 && !isPlaying) setIsPlaying(true);
              if (data.info.playerState === 2 && isPlaying) setIsPlaying(false);
              if (data.info.playerState === 0) setIsPlaying(false);
            }
          }
          if (data.event === 'initialDelivery' && data.info) {
            if (typeof data.info.duration === 'number' && data.info.duration > 0) {
              setDuration(Math.floor(data.info.duration));
            }
          }
        }
      } catch (err) {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isPlaying]);

  // Simulation fallback timer for Vision AI tracking when not using local video time updates
  useEffect(() => {
    let interval: any;
    const isHtml5Active = Boolean(videoRef.current && isLocalOrDirectVideo);
    
    if (isPlaying && !isHtml5Active && !isYouTubeVideo) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (duration > 0 && prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return Number((prev + 0.25 * playbackRate).toFixed(2));
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, playbackRate, isLocalOrDirectVideo, isYouTubeVideo]);

  // React to external timestamp changes (from shot chart or highlight clicks)
  useEffect(() => {
    if (externalTimestamp !== null && externalTimestamp !== undefined) {
      handleSeek(externalTimestamp);
      setIsPlaying(true);
      if (isYouTubeVideo) {
        sendYouTubeCommand('playVideo');
      } else if (isLocalOrDirectVideo && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [externalTimestamp]);

  // ================= STATS TRACKING & QUARTERS CONTROLLERS =================
  // 1. INIZIA PRESA STATISTICHE (Avvia/Riprende la presa dati e tracciamento. Il video viene avviato con RIPRODUCI)
  const handleStartTracking = () => {
    setTrackingStatus('recording');
    setIsPlaying(true);

    const currentQName = currentQuarterKey === 'Q1' ? '1° Quarto (Q1)'
      : currentQuarterKey === 'Q2' ? '2° Quarto (Q2)'
      : currentQuarterKey === 'Q3' ? '3° Quarto (Q3)'
      : currentQuarterKey === 'Q4' ? '4° Quarto (Q4)'
      : 'Overtime (OT)';
    setCurrentPeriodName(currentQName);

    if (isYouTubeVideo) {
      sendYouTubeCommand('playVideo');
    } else if (isLocalOrDirectVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    // Ensure active tracking period
    const newPeriod: TrackingPeriod = {
      id: `tp-${Date.now()}`,
      name: currentQName,
      startSec: currentTime,
      status: 'active'
    };
    const updated = [...trackingPeriods.filter(p => p.status !== 'active'), newPeriod];
    setTrackingPeriods(updated);
    if (onUpdateGame) {
      onUpdateGame({ ...game, trackingPeriods: updated });
    }
  };

  // 2. PAUSA PRESA STATISTICHE (Sospende il tracciamento durante riscaldamento, intervallo o timeout)
  const handlePauseTracking = () => {
    setTrackingStatus('paused');
    const updated = trackingPeriods.map(p => 
      p.status === 'active' ? { ...p, endSec: currentTime, status: 'completed' as const } : p
    );
    setTrackingPeriods(updated);
    if (onUpdateGame) {
      onUpdateGame({ ...game, trackingPeriods: updated });
    }
  };

  // 3. STOP (Apre finestra di conferma per terminare e archiviare o mettere in pausa)
  const handleStopTracking = () => {
    setIsStopModalOpen(true);
  };

  // 4. CAMBIO QUARTO (Seeks video to start of quarter and activates recording)
  const handleSelectQuarter = (qKey: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'OT') => {
    const targetSec = quarterBreakpoints[qKey];
    handleSeek(targetSec);
    setTrackingStatus('recording');
    setIsPlaying(true);

    if (isYouTubeVideo) {
      sendYouTubeCommand('seekTo', [targetSec, true]);
      sendYouTubeCommand('playVideo');
    } else if (isLocalOrDirectVideo && videoRef.current) {
      videoRef.current.currentTime = targetSec;
      videoRef.current.play().catch(() => {});
    }

    const qLabels: Record<string, string> = {
      Q1: '1° Quarto (Q1)',
      Q2: '2° Quarto (Q2)',
      Q3: '3° Quarto (Q3)',
      Q4: '4° Quarto (Q4)',
      OT: 'Overtime (OT)'
    };
    setCurrentPeriodName(qLabels[qKey]);

    const newPeriod: TrackingPeriod = {
      id: `tp-${Date.now()}`,
      name: qLabels[qKey],
      startSec: targetSec,
      status: 'active'
    };
    const updated = [...trackingPeriods.filter(p => p.status !== 'active'), newPeriod];
    setTrackingPeriods(updated);
    if (onUpdateGame) {
      onUpdateGame({ ...game, trackingPeriods: updated });
    }
  };

  // 5. AZZERA TUTTE LE AZIONI SALVATE SULLA TIMELINE
  const handleClearTimelineActions = () => {
    if (window.confirm('Vuoi azzerare tutte le azioni e i tiri salvati su questa timeline per iniziare una presa dati pulita sul video?')) {
      if (onUpdateGame) {
        onUpdateGame({
          ...game,
          shots: []
        });
      }
    }
  };

  // ================= DYNAMIC SCORE =================
  // Calculate live cumulative score up to currentTime based on visible shot events (starts strictly at 0-0)
  const calculatedHomeScore = visibleShots
    .filter((s) => s.teamId === 'home' && s.made && s.videoTimestamp <= currentTime)
    .reduce((acc, s) => acc + (s.points || (s.shotType === '3PT' ? 3 : 2)), 0);

  const calculatedAwayScore = visibleShots
    .filter((s) => s.teamId === 'away' && s.made && s.videoTimestamp <= currentTime)
    .reduce((acc, s) => acc + (s.points || (s.shotType === '3PT' ? 3 : 2)), 0);

  // Find nearest shot
  const activeShot = visibleShots.find(
    (s) => Math.abs(s.videoTimestamp - currentTime) < 3.5 || s.id === activeShotId
  );

  // Determine active tactical set based on time only if match tracking is active and timestamps match
  const activeTactic = (currentTime > 0 && trackingStatus === 'recording')
    ? (game.tactics.find((t) => 
        t.videoTimestamps?.some((ts) => Math.abs(ts - currentTime) < 20)
      ) || null)
    : null;

  // ================= DYNAMIC ROSTER SYNCHRONIZATION FOR COMPUTER VISION =================
  // Generate on-court bounding boxes and SAM-3 masks directly from game.players
  const homePlayers = useMemo(() => game.players.filter(p => p.teamId === 'home'), [game.players]);
  const awayPlayers = useMemo(() => game.players.filter(p => p.teamId === 'away'), [game.players]);

  // Active 5 players on court for Home and Away
  const activeHomeOnCourt = useMemo(() => {
    const starters = homePlayers.filter(p => p.isStarter);
    if (starters.length >= 5) return starters.slice(0, 5);
    return homePlayers.slice(0, 5);
  }, [homePlayers]);

  const activeAwayOnCourt = useMemo(() => {
    const starters = awayPlayers.filter(p => p.isStarter);
    if (starters.length >= 5) return starters.slice(0, 5);
    return awayPlayers.slice(0, 5);
  }, [awayPlayers]);

  // Generate dynamic positions, bounding boxes and silhouettes
  const dynamicDetections = useMemo(() => {
    const timeOffset = Math.sin(currentTime * 0.9);
    const timeCos = Math.cos(currentTime * 0.9);

    // Standard basketball court offensive & defensive positions
    const standardOffenseSlots = [
      { x: 48, y: 32, label: 'PG / Top of Key' },
      { x: 22, y: 44, label: 'SG / Left Wing' },
      { x: 74, y: 44, label: 'SF / Right Wing' },
      { x: 34, y: 62, label: 'PF / High Post' },
      { x: 56, y: 68, label: 'C / Low Post' },
    ];

    const standardDefenseSlots = [
      { x: 48, y: 40, label: 'DEF On-Ball' },
      { x: 28, y: 48, label: 'DEF Left Wing' },
      { x: 68, y: 48, label: 'DEF Right Wing' },
      { x: 38, y: 65, label: 'DEF Help Side' },
      { x: 52, y: 72, label: 'DEF Rim Protector' },
    ];

    const detections: any[] = [];

    // Home Team Detections (Offense or active team)
    activeHomeOnCourt.forEach((p, idx) => {
      const slot = standardOffenseSlots[idx] || standardOffenseSlots[0];
      const shiftX = (idx % 2 === 0 ? timeOffset : -timeOffset) * 2.2;
      const shiftY = (idx % 3 === 0 ? timeCos : -timeCos) * 1.5;

      const isShooter = activeShot && (activeShot.playerName === p.name || activeShot.playerNumber === p.number);
      const posX = isShooter ? activeShot.courtX : Math.max(8, Math.min(88, slot.x + shiftX));
      const posY = isShooter ? activeShot.courtY * 0.7 + 20 : Math.max(20, Math.min(82, slot.y + shiftY));

      detections.push({
        id: `det-home-${p.id}`,
        trackId: 101 + idx,
        type: 'player',
        class: 'player',
        team: 'home',
        teamName: game.homeTeam.name,
        teamColor: game.homeTeam.color || '#007A33',
        jerseyNumber: p.number,
        playerName: p.name,
        position: p.position,
        confidence: 0.94 + (idx % 5) * 0.01,
        speedKmh: Math.max(5.2, Number((14.5 + Math.abs(shiftX) * 4).toFixed(1))),
        action: isShooter ? 'Tiro in Sospensione' : (idx === 0 ? 'Gestione Palla' : 'Taglio / Spaziatura'),
        bbox: {
          x: posX - 4.5,
          y: posY - 11,
          width: 9,
          height: 22
        },
        courtPos2D: {
          x: posX,
          y: posY
        }
      });
    });

    // Away Team Detections (Defense or opposing team)
    activeAwayOnCourt.forEach((p, idx) => {
      const slot = standardDefenseSlots[idx] || standardDefenseSlots[0];
      const shiftX = (idx % 2 === 1 ? timeOffset : -timeOffset) * 2.0;
      const shiftY = (idx % 2 === 0 ? timeCos : -timeCos) * 1.4;

      const isShooter = activeShot && (activeShot.playerName === p.name || activeShot.playerNumber === p.number);
      const posX = isShooter ? activeShot.courtX : Math.max(8, Math.min(88, slot.x + shiftX));
      const posY = isShooter ? activeShot.courtY * 0.7 + 20 : Math.max(20, Math.min(82, slot.y + shiftY));

      detections.push({
        id: `det-away-${p.id}`,
        trackId: 201 + idx,
        type: 'player',
        class: 'player',
        team: 'away',
        teamName: game.awayTeam.name,
        teamColor: game.awayTeam.color || '#00529F',
        jerseyNumber: p.number,
        playerName: p.name,
        position: p.position,
        confidence: 0.93 + (idx % 5) * 0.01,
        speedKmh: Math.max(4.8, Number((13.8 + Math.abs(shiftX) * 3.5).toFixed(1))),
        action: isShooter ? 'Tiro in Sospensione' : (idx === 0 ? 'Pressione su Palla' : 'Aiuto Difensivo'),
        bbox: {
          x: posX - 4.5,
          y: posY - 11,
          width: 9,
          height: 22
        },
        courtPos2D: {
          x: posX,
          y: posY
        }
      });
    });

    // Ball Detection
    const ballCarrier = detections.find(d => d.action === 'Gestione Palla') || detections[0];
    const ballX = activeShot ? 50 + Math.sin(currentTime * 2) * 5 : (ballCarrier?.courtPos2D.x || 50);
    const ballY = activeShot ? 45 - Math.abs(Math.sin(currentTime * 2)) * 20 : ((ballCarrier?.courtPos2D.y || 40) - 2);

    detections.push({
      id: 'det-ball-live',
      trackId: 999,
      type: 'ball',
      class: 'ball',
      confidence: 0.98,
      speedKmh: activeShot ? 42.5 : 24.0,
      bbox: {
        x: ballX - 1.8,
        y: ballY - 1.8,
        width: 3.6,
        height: 3.6
      },
      courtPos2D: {
        x: ballX,
        y: ballY
      }
    });

    // Referees
    detections.push({
      id: 'det-ref-1',
      trackId: 801,
      type: 'referee',
      class: 'referee',
      confidence: 0.96,
      bbox: { x: 12, y: 72, width: 8, height: 20 },
      courtPos2D: { x: 14, y: 75 },
      speedKmh: 6.2
    });

    return detections;
  }, [activeHomeOnCourt, activeAwayOnCourt, currentTime, activeShot, game.homeTeam, game.awayTeam]);

  // Telestrator Canvas handling
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    isMouseDownRef.current = true;
    setCurrentPath([{ x, y }]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !isMouseDownRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPath((prev) => [...prev, { x, y }]);
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawingMode || !isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    if (currentPath.length > 1) {
      setDrawings((prev) => [...prev, { type: drawTool, points: currentPath, color: drawColor }]);
    }
    setCurrentPath([]);
  };

  // Render drawings on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawings.forEach((drawing) => {
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (drawing.type === 'pen' && drawing.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        for (let i = 1; i < drawing.points.length; i++) {
          ctx.lineTo(drawing.points[i].x, drawing.points[i].y);
        }
        ctx.stroke();
      } else if (drawing.type === 'arrow' && drawing.points.length > 1) {
        const start = drawing.points[0];
        const end = drawing.points[drawing.points.length - 1];
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - 12 * Math.cos(angle - Math.PI / 6), end.y - 12 * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - 12 * Math.cos(angle + Math.PI / 6), end.y - 12 * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (drawing.type === 'circle' && drawing.points.length > 1) {
        const start = drawing.points[0];
        const end = drawing.points[drawing.points.length - 1];
        const radius = Math.hypot(end.x - start.x, end.y - start.y) / 2;
        const centerX = (start.x + end.x) / 2;
        const centerY = (start.y + end.y) / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    if (currentPath.length > 1) {
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
    }
  }, [drawings, currentPath, drawColor]);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    const totalSecs = Math.max(0, Math.floor(secs));
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0 || duration >= 3600) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* ================= TOP COMMAND & VISION TELEMETRY CONSOLE ================= */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-xl space-y-3">
        {/* Upper Row: 3 Main Tracking Actions, Period Selector, and Live Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: 3 Main Tracking Actions (INIZIA, PAUSA, STOP) */}
          <div className="flex items-center space-x-2">
            {/* INIZIA PRESA STATISTICHE */}
            <button
              onClick={handleStartTracking}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black tracking-wide border transition-all transform active:scale-95 shadow-md ${
                trackingStatus === 'recording'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-600/40 ring-2 ring-emerald-400/80 animate-none'
                  : 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500/60 text-emerald-300 ring-2 ring-emerald-500/40 shadow-emerald-500/20'
              }`}
              title="Avvia o riprendi la presa statistica automatica e tracciamento sul video"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${
                trackingStatus === 'recording' ? 'bg-white animate-ping' : 'bg-emerald-400 animate-pulse'
              }`} />
              <span>INIZIA PRESA STATISTICHE</span>
            </button>

            {/* PAUSA */}
            <button
              onClick={handlePauseTracking}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all transform active:scale-95 ${
                trackingStatus === 'paused'
                  ? 'bg-amber-500 border-amber-300 text-slate-950 font-black shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 hover:border-amber-500/50 text-amber-400'
              }`}
              title="Metti in pausa la presa dati durante riscaldamento, intervallo o time-out"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>PAUSA</span>
            </button>

            {/* STOP */}
            <button
              onClick={handleStopTracking}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all transform active:scale-95 ${
                trackingStatus === 'stopped'
                  ? 'bg-red-600 border-red-400 text-white font-black shadow-md shadow-red-600/30 ring-2 ring-red-400'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-400'
              }`}
              title="Ferma la presa dati e metti in pausa il video"
            >
              <span>STOP</span>
            </button>
          </div>

          {/* Right: Quarter Selectors with bright glowing active highlight & Status */}
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden md:inline">
              Periodo:
            </span>
            {[
              { key: 'Q1' as const, label: '1° Quarto' },
              { key: 'Q2' as const, label: '2° Quarto' },
              { key: 'Q3' as const, label: '3° Quarto' },
              { key: 'Q4' as const, label: '4° Quarto' },
              { key: 'OT' as const, label: 'Overtime' }
            ].map((q) => {
              const isActive = currentQuarterKey === q.key;
              return (
                <button
                  key={q.key}
                  onClick={() => handleSelectQuarter(q.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all transform active:scale-95 ${
                    isActive
                      ? 'bg-orange-600 border-orange-400 text-white shadow-md shadow-orange-600/30 ring-2 ring-orange-400/70'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                  title={`Vai a inizio ${q.label} e traccia`}
                >
                  <span>{q.label}</span>
                </button>
              );
            })}

            <div className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              trackingStatus === 'recording'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : trackingStatus === 'paused'
                ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                trackingStatus === 'recording' ? 'bg-emerald-400 animate-ping' : trackingStatus === 'paused' ? 'bg-amber-400' : 'bg-slate-500'
              }`} />
              <span className="font-sans text-[11px]">{currentPeriodName}</span>
            </div>
          </div>
        </div>

        {/* Lower Row: Vision AI Telemetry, Tactical Schema, Live Score & HUD Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-slate-800/80">
          <div className="flex items-center space-x-2.5 flex-wrap">
            {/* Roboflow + SAM 3 Status */}
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-400">Roboflow + SAM 3:</span>
              <span className="text-emerald-400 font-semibold font-mono">60 FPS Track</span>
            </div>

            {/* Tactical Schema: Clean — when no tactic active */}
            <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Schema:</span>
              <span className={`font-semibold truncate max-w-[160px] ${activeTactic ? 'text-orange-400' : 'text-slate-500'}`}>
                {activeTactic ? activeTactic.name : '—'}
              </span>
            </div>

            {/* Real-time Live Score (Calculated from shots up to current timestamp, strictly 0-0 initially) */}
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
              <span className="text-slate-400 font-sans text-[11px] mr-0.5">Punteggio:</span>
              <span 
                className="font-bold px-2 py-0.5 rounded text-white text-[11px]" 
                style={{ backgroundColor: game.homeTeam.color || '#007A33' }}
              >
                {game.homeTeam.shortName} {calculatedHomeScore}
              </span>
              <span className="text-slate-600 font-sans">-</span>
              <span 
                className="font-bold px-2 py-0.5 rounded text-white text-[11px]"
                style={{ backgroundColor: game.awayTeam.color || '#00529F' }}
              >
                {calculatedAwayScore} {game.awayTeam.shortName}
              </span>
            </div>
          </div>

          {/* Vision AI Layer Control Badges */}
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-xs text-slate-400 mr-1 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Vision HUD:
            </span>

            <button
              onClick={() => setShowBBoxes(!showBBoxes)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                showBBoxes 
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-sm' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              Bounding Box
            </button>

            <button
              onClick={() => setShowSAMMasks(!showSAMMasks)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                showSAMMasks 
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-sm' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              SAM 3 Maschere
            </button>

            <button
              onClick={() => setShowPlayerTags(!showPlayerTags)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                showPlayerTags 
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 shadow-sm' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              Nomi & Cartellini
            </button>

            <button
              onClick={() => setShowKeypoints(!showKeypoints)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                showKeypoints 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              Keypoints Campo
            </button>

            <button
              onClick={() => setShowBallTrajectory(!showBallTrajectory)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                showBallTrajectory 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              Arco Tiro 3D
            </button>

            <button
              onClick={() => setShowRadarMiniCourt(!showRadarMiniCourt)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                showRadarMiniCourt 
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-sm' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              Radar 2D Campo
            </button>
          </div>
        </div>
      </div>

      {/* ================= MAIN VIDEO SCREEN WITH COMPUTER VISION OVERLAYS ================= */}
      <div className="relative aspect-video w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group select-none">
        {/* Real HTML5 Video Player if local/blob/mp4 video exists */}
        {isLocalOrDirectVideo && game.videoUrl ? (
          <video
            ref={videoRef}
            src={game.videoUrl}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(Number(videoRef.current.currentTime.toFixed(2)));
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current && videoRef.current.duration && Number.isFinite(videoRef.current.duration)) {
                setDuration(Math.floor(videoRef.current.duration));
              }
            }}
            onDurationChange={() => {
              if (videoRef.current && videoRef.current.duration && Number.isFinite(videoRef.current.duration)) {
                setDuration(Math.floor(videoRef.current.duration));
              }
            }}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
          />
        ) : isYouTubeVideo && effectiveYouTubeId ? (
          /* YouTube Embed Player with enablejsapi=1 and start timestamp */
          <div className="absolute inset-0 w-full h-full bg-black">
            <iframe
              ref={youtubeIframeRef}
              id="youtube-player-frame"
              src={getYouTubeEmbedUrl(effectiveYouTubeId, false, currentTime)}
              title="YouTube Match Broadcast"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              className="w-full h-full border-0 pointer-events-auto"
            />
          </div>
        ) : isTwitchVideo && effectiveTwitchInfo ? (
          /* Twitch Embed Player (Live Stream, VOD, or Clip) */
          <div className="absolute inset-0 w-full h-full bg-black">
            <iframe
              src={getTwitchEmbedUrl(effectiveTwitchInfo, true, isMuted)}
              title="Twitch Match Broadcast"
              allow="autoplay; fullscreen"
              className="w-full h-full border-0 pointer-events-auto"
            />
          </div>
        ) : (
          /* Court Atmosphere Background Simulation */
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600&auto=format&fit=crop&q=80')`,
              filter: 'brightness(0.85) contrast(1.05)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
          </div>
        )}

        {/* Out-of-Window / Excluded Zone Banner Indicator */}
        {!isCurrentTimeTracked && (
          <div className="absolute top-4 right-4 z-30 bg-amber-500/90 backdrop-blur-md text-slate-950 px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-xl animate-pulse">
            <ShieldAlert className="w-4 h-4" />
            <span>Zona Riscaldamento / Intervallo Esclusa</span>
          </div>
        )}

        {/* Vision AI Overlays (Roboflow & SAM 3 Computer Vision) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Court Keypoints Detection Layer */}
          {showKeypoints && (
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon 
                points="10,85 90,85 75,30 25,30" 
                fill="rgba(16, 185, 129, 0.05)" 
                stroke="rgba(16, 185, 129, 0.4)" 
                strokeWidth="0.4" 
                strokeDasharray="1 1"
              />
              <polygon 
                points="36,85 64,85 58,40 42,40" 
                fill="rgba(14, 165, 233, 0.08)" 
                stroke="rgba(14, 165, 233, 0.6)" 
                strokeWidth="0.5" 
              />
              <path 
                d="M 16,85 Q 50,22 84,85" 
                fill="none" 
                stroke="rgba(249, 115, 22, 0.6)" 
                strokeWidth="0.6" 
                strokeDasharray="1.5 1"
              />
              {[
                { x: 10, y: 85, label: 'Corner Left' },
                { x: 90, y: 85, label: 'Corner Right' },
                { x: 50, y: 28, label: '3PT Apex' },
                { x: 42, y: 40, label: 'Elbow L' },
                { x: 58, y: 40, label: 'Elbow R' },
                { x: 50, y: 50, label: 'Basket Rim' },
              ].map((kp, i) => (
                <g key={i}>
                  <circle cx={kp.x} cy={kp.y} r="0.9" fill="#10b981" />
                  <circle cx={kp.x} cy={kp.y} r="1.8" fill="none" stroke="#10b981" strokeWidth="0.2" opacity="0.7" />
                </g>
              ))}
            </svg>
          )}

          {/* 3D Ball Trajectory Arc Visualization */}
          {showBallTrajectory && activeShot && (
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path 
                d={`M ${activeShot.courtX},${activeShot.courtY * 0.7 + 20} Q 50,12 50,50`} 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="0.9" 
                strokeDasharray="1.2 0.8"
                className="animate-pulse"
              />
              <circle cx={activeShot.courtX} cy={activeShot.courtY * 0.7 + 20} r="1.2" fill="#f97316" />
              <circle cx="50" cy="18" r="1.1" fill="#f59e0b" />
              <circle cx="50" cy="50" r="1.6" fill={activeShot.made ? '#22c55e' : '#f43f5e'} />
              <text x="52" y="52" fill={activeShot.made ? '#22c55e' : '#f43f5e'} fontSize="2.8" fontWeight="bold" fontFamily="monospace">
                {activeShot.made ? 'CANESTRO SEGNATO' : 'TIRO SBAGLIATO'}
              </text>
            </svg>
          )}

          {/* Dynamic Player Detections, SAM 3 Masks & Bounding Boxes */}
          {dynamicDetections.map((det) => {
            const isHome = det.team === 'home';
            const isAway = det.team === 'away';
            const isBall = det.class === 'ball' || det.type === 'ball';
            const isRef = det.class === 'referee' || det.type === 'referee';
            const isSelected = selectedDetectionId === det.id;

            const borderColor = isHome 
              ? 'border-emerald-400 shadow-emerald-500/30' 
              : isAway 
              ? 'border-cyan-400 shadow-cyan-500/30' 
              : isBall 
              ? 'border-amber-400 shadow-amber-500/40' 
              : 'border-slate-400';

            return (
              <div
                key={det.id}
                style={{
                  left: `${det.bbox.x}%`,
                  top: `${det.bbox.y}%`,
                  width: `${det.bbox.width}%`,
                  height: `${det.bbox.height}%`,
                }}
                className={`absolute transition-all duration-200 pointer-events-auto cursor-pointer ${
                  showBBoxes ? `border-2 ${borderColor} rounded-md shadow-lg` : ''
                } ${isSelected ? 'ring-2 ring-orange-500 scale-[1.02]' : ''}`}
                onClick={() => setSelectedDetectionId(det.id)}
              >
                {/* SAM 3 Segmentation Silhouette Mask Fill */}
                {showSAMMasks && (
                  <div 
                    className="absolute inset-0 rounded-md opacity-25"
                    style={{
                      backgroundColor: isHome 
                        ? (det.teamColor || '#10b981') 
                        : isAway 
                        ? (det.teamColor || '#06b6d4') 
                        : isBall 
                        ? '#f59e0b' 
                        : '#94a3b8'
                    }}
                  />
                )}

                {/* Player Tag / Jersey Tag above Head */}
                {showPlayerTags && (
                  <div 
                    style={{
                      backgroundColor: isHome 
                        ? (det.teamColor || '#007A33') 
                        : isAway 
                        ? (det.teamColor || '#00529F') 
                        : isBall 
                        ? '#f59e0b' 
                        : '#334155',
                      color: '#ffffff'
                    }}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-tight flex items-center space-x-1 shadow-md border border-white/20"
                  >
                    {isBall ? (
                      <span className="text-black font-bold">🏀 BALL ({(det.speedKmh || 32).toFixed(1)} km/h)</span>
                    ) : isRef ? (
                      <span>ARBITRO</span>
                    ) : (
                      <>
                        <span className="bg-black/40 px-1 rounded">#{det.jerseyNumber ?? 0}</span>
                        <span>{det.playerName || 'Giocatore'}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Bottom Speed / Tracking HUD */}
                {showBBoxes && !isBall && (
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] bg-black/80 px-1 rounded text-slate-300 font-mono">
                    {det.action || `${det.speedKmh} km/h`} | {((det.confidence || 0.95) * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Telestrator Drawing Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className={`absolute inset-0 w-full h-full z-20 ${
            isDrawingMode ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
          }`}
        />

        {/* Real-Time 2D Full-Court Radar Projection (Oriented along the long side / broadcast camera perspective) */}
        {showRadarMiniCourt && (
          <div className="absolute bottom-16 right-4 z-30 w-56 sm:w-72 bg-slate-950/95 backdrop-blur-md rounded-2xl p-2.5 border border-slate-700/80 shadow-2xl">
            <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-orange-400" />
                Radar 2D (Lato Lungo Campo)
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-semibold">SAM 3 • 2D HOMOGRAPHY</span>
            </div>

            {/* 2D Basketball Court Horizontal SVG (Long-side Sideline Perspective) */}
            <div className="relative aspect-[100/54] w-full bg-slate-900/80 rounded-xl overflow-hidden border border-slate-700 p-1">
              <svg className="w-full h-full" viewBox="0 0 100 54">
                {/* Court Perimeter Boundary */}
                <rect x="2" y="2" width="96" height="50" rx="1.5" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.8" />
                
                {/* Center Court Line & Center Circle */}
                <line x1="50" y1="2" x2="50" y2="52" stroke="#d97706" strokeWidth="0.8" opacity="0.6" />
                <circle cx="50" cy="27" r="7.5" fill="none" stroke="#d97706" strokeWidth="0.8" opacity="0.8" />
                
                {/* Left Side: Key, 3PT Arc, Rim & Backboard */}
                <rect x="2" y="18" width="18" height="18" fill="rgba(217, 119, 6, 0.12)" stroke="#d97706" strokeWidth="0.8" />
                <path d="M 20,21 A 6 6 0 0 1 20,33" fill="none" stroke="#d97706" strokeWidth="0.8" strokeDasharray="1 1" />
                <path d="M 2,7 L 12,7 A 22 22 0 0 1 12,47 L 2,47" fill="none" stroke="#d97706" strokeWidth="0.9" />
                <line x1="5.5" y1="23" x2="5.5" y2="31" stroke="#ffffff" strokeWidth="1.2" />
                <circle cx="8" cy="27" r="1.8" fill="none" stroke="#f97316" strokeWidth="1.2" />

                {/* Right Side: Key, 3PT Arc, Rim & Backboard */}
                <rect x="80" y="18" width="18" height="18" fill="rgba(217, 119, 6, 0.12)" stroke="#d97706" strokeWidth="0.8" />
                <path d="M 80,21 A 6 6 0 0 0 80,33" fill="none" stroke="#d97706" strokeWidth="0.8" strokeDasharray="1 1" />
                <path d="M 98,7 L 88,7 A 22 22 0 0 0 88,47 L 98,47" fill="none" stroke="#d97706" strokeWidth="0.9" />
                <line x1="94.5" y1="23" x2="94.5" y2="31" stroke="#ffffff" strokeWidth="1.2" />
                <circle cx="92" cy="27" r="1.8" fill="none" stroke="#f97316" strokeWidth="1.2" />

                {/* Projected 2D Player & Ball Dots on Horizontal Broadcast Field */}
                {dynamicDetections.map((det) => {
                  if (det.class === 'referee' || det.type === 'referee') return null;
                  const isHome = det.team === 'home';
                  const isBall = det.class === 'ball' || det.type === 'ball';
                  const isSel = selectedDetectionId === det.id;
                  
                  // Map coordinates horizontally matching broadcast long-side perspective
                  const rawX = det.courtPos2D?.x ?? 50;
                  const rawY = det.courtPos2D?.y ?? 50;
                  
                  const radarX = Math.max(5, Math.min(95, rawX));
                  const radarY = Math.max(5, Math.min(49, 4 + rawY * 0.46));

                  return (
                    <g key={`radar-${det.id}`}>
                      <circle
                        cx={radarX}
                        cy={radarY}
                        r={isBall ? 2.2 : isSel ? 3.8 : 2.8}
                        fill={isBall ? '#f59e0b' : (det.teamColor || (isHome ? '#10b981' : '#06b6d4'))}
                        stroke="#ffffff"
                        strokeWidth={isSel ? '1.2' : '0.6'}
                        className="transition-all duration-200"
                      />
                      {!isBall && (
                        <text
                          x={radarX}
                          y={radarY + 0.9}
                          fontSize="2"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {det.jerseyNumber ?? 0}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Shot Action Flash Overlay when a Shot Happens in Timeline */}
        {activeShot && (
          <div className="absolute top-4 left-4 z-30 bg-slate-950/90 backdrop-blur-md rounded-2xl p-3 border border-slate-700/80 shadow-2xl max-w-xs animate-in fade-in slide-in-from-left duration-300">
            <div className="flex items-center space-x-2 mb-1.5 pb-1 border-b border-slate-800">
              {activeShot.made ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
              <span className="text-xs font-bold text-white">
                {activeShot.subType || activeShot.shotType || 'Tiro a Canestro'}
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                activeShot.made ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {activeShot.made ? 'CANESTRO' : 'SBAGLIATO'}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-300 font-medium">
                <span>Giocatore:</span>
                <span className="font-bold text-white">
                  #{activeShot.playerNumber} {activeShot.playerName}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Distanza:</span>
                <span className="font-mono text-white">{((activeShot.distanceFeet || 18) * 0.3048).toFixed(1)}m</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pressione Difensiva:</span>
                <span className="text-orange-400 font-semibold">{activeShot.defenderContest || 'Conteso'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Telestrator Drawing Tools Overlay */}
        {isDrawingMode && (
          <div className="absolute top-4 right-4 z-40 bg-slate-950/95 backdrop-blur-md rounded-2xl p-2.5 border border-orange-500/50 shadow-2xl flex items-center space-x-2">
            <span className="text-[11px] font-bold text-orange-400 flex items-center mr-1">
              <PenTool className="w-3.5 h-3.5 mr-1" />
              Lavagna:
            </span>

            {/* Colors */}
            {['#f97316', '#10b981', '#06b6d4', '#f43f5e', '#fbbf24', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => setDrawColor(c)}
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-full transition-transform ${drawColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
              />
            ))}

            <div className="h-4 w-px bg-slate-800 mx-1" />

            {/* Tools */}
            <button
              onClick={() => setDrawTool('pen')}
              className={`px-2 py-1 rounded text-xs ${drawTool === 'pen' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Penna
            </button>
            <button
              onClick={() => setDrawTool('arrow')}
              className={`px-2 py-1 rounded text-xs ${drawTool === 'arrow' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Freccia
            </button>
            <button
              onClick={() => setDrawTool('circle')}
              className={`px-2 py-1 rounded text-xs ${drawTool === 'circle' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Cerchio
            </button>

            <button
              onClick={() => setDrawings([])}
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
              title="Cancella tutto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ================= BOTTOM VIDEO CONTROLS & INTERACTIVE TIMELINE ================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-4 shadow-lg">
        {/* Interactive Event Timeline with Clickable Shots & Tracked Period Intervals */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm">{formatTime(currentTime)}</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300 font-bold">{duration > 0 ? formatTime(duration) : '--:--'}</span>
            </div>

            <div className="flex items-center space-x-2 text-[11px]">
              {game.shots && game.shots.length > 0 && (
                <button
                  onClick={handleClearTimelineActions}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 font-sans transition-all"
                  title="Azzera e ripulisci tutte le azioni registrate su questo video"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Azzera Azioni ({game.shots.length})</span>
                </button>
              )}

              <span className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                trackingStatus === 'recording'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : trackingStatus === 'paused'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  trackingStatus === 'recording' ? 'bg-emerald-400 animate-ping' : trackingStatus === 'paused' ? 'bg-amber-400' : 'bg-red-400'
                }`} />
                <span>{currentPeriodName} • {trackingStatus === 'recording' ? 'Presa Dati Attiva' : trackingStatus === 'paused' ? 'In Pausa' : 'Interrotto'}</span>
              </span>
            </div>
          </div>

          {/* Timeline Bar with Markers & Tracked Window Spans */}
          <div className="relative h-6 bg-slate-950 rounded-2xl overflow-visible flex items-center px-1 border border-slate-800 cursor-pointer">
            {/* Visual Tracking Period Spans (Green = Tracked, Dark = Excluded) */}
            {duration > 0 && trackingPeriods.map((period) => {
              const startPct = (period.startSec / duration) * 100;
              const endSec = period.endSec ?? duration;
              const widthPct = Math.max(1, ((endSec - period.startSec) / duration) * 100);

              return (
                <div
                  key={period.id}
                  style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                  title={`${period.name} (${formatTime(period.startSec)} - ${formatTime(endSec)})`}
                  className="absolute top-0.5 bottom-0.5 bg-emerald-500/20 border-x border-emerald-500/40 rounded pointer-events-none flex items-center justify-center overflow-hidden"
                >
                  <span className="text-[9px] font-bold text-emerald-400 font-mono truncate px-1 opacity-70">
                    {period.name}
                  </span>
                </div>
              );
            })}

            {/* Progress fill */}
            <div 
              className="absolute left-0 top-1 bottom-1 bg-gradient-to-r from-orange-600 to-amber-500 rounded-full opacity-70 pointer-events-none"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />

            {/* Interactive Shot Event Dots on Timeline */}
            {duration > 0 && visibleShots.map((shot) => {
              const posPercent = (shot.videoTimestamp / duration) * 100;
              const isSelected = shot.id === activeShot?.id;

              return (
                <div
                  key={shot.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSeek(shot.videoTimestamp);
                    onShotSelect(shot);
                    setIsPlaying(true);
                    if (isYouTubeVideo) {
                      sendYouTubeCommand('playVideo');
                    } else if (isLocalOrDirectVideo && videoRef.current) {
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  style={{ left: `${posPercent}%` }}
                  title={`${shot.playerName} - ${shot.subType || shot.shotType || 'Tiro'} (${shot.made ? 'SEGNATO' : 'SBAGLIATO'}) a ${formatTime(shot.videoTimestamp)}`}
                  className={`absolute -top-1.5 w-4 h-4 rounded-full border-2 transform -translate-x-1/2 transition-transform hover:scale-150 z-10 cursor-pointer ${
                    shot.made 
                      ? 'bg-emerald-500 border-white shadow-md shadow-emerald-500/50' 
                      : 'bg-rose-500 border-white shadow-md shadow-rose-500/50'
                  } ${isSelected ? 'scale-150 ring-2 ring-orange-400' : ''}`}
                />
              );
            })}

            {/* Current scrubber thumb */}
            <input
              type="range"
              min={0}
              max={duration > 0 ? duration : 100}
              step={0.5}
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                handleSeek(val);
              }}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
            />
          </div>
        </div>

        {/* Video Player Buttons: Play, Replay, Speed, Telestrator */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Main Playback Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStepTime(-5)}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Riavvolgi 5s"
            >
              <Rewind className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlayPause}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'PAUSA' : 'RIPRODUCI'}</span>
            </button>

            <button
              onClick={() => handleStepTime(5)}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Avanza 5s"
            >
              <FastForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSeek(0)}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Ricomincia da capo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Presets (Slow Motion 0.25x / 0.5x / 1x / 1.5x / 2x) */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-500 px-2 font-medium">Velocità:</span>
            {[0.25, 0.5, 1, 1.5, 2].map((rate) => (
              <button
                key={rate}
                onClick={() => handleSetPlaybackRate(rate)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                  playbackRate === rate
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Telestrator & Audio Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDrawingMode(!isDrawingMode)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
                isDrawingMode
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isDrawingMode ? 'Chiudi Disegno' : 'Lavagna Tattica'}</span>
            </button>

            <button
              onClick={handleToggleMute}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={isMuted ? 'Attiva Audio' : 'Disattiva Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* STOP CONFIRMATION MODAL */}
      {isStopModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-white">Terminare la Presa Statistiche?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vuoi terminare la sessione di presa statistiche e creare il resoconto finale ufficiale? Tutte le statistiche, i tiri a canestro, il tabellino e le clip verranno finalizzati e archiviati.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {/* Option 1: Termina e Archivia */}
              <button
                type="button"
                onClick={() => {
                  setIsStopModalOpen(false);
                  setTrackingStatus('stopped');
                  setIsPlaying(false);
                  if (isYouTubeVideo) {
                    sendYouTubeCommand('pauseVideo');
                  } else if (isLocalOrDirectVideo && videoRef.current) {
                    videoRef.current.pause();
                  }
                  const updated = trackingPeriods.map(p => ({ ...p, status: 'completed' as const }));
                  setTrackingPeriods(updated);
                  if (onUpdateGame) {
                    onUpdateGame({ ...game, trackingPeriods: updated });
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-black shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>SÌ, TERMINA E ARCHIVIA IL RESOCONTO</span>
              </button>

              {/* Option 2: Metti in Pausa (Errore Clic) */}
              <button
                type="button"
                onClick={() => {
                  setIsStopModalOpen(false);
                  handlePauseTracking();
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Pause className="w-4 h-4" />
                <span>NO, METTI IN PAUSA (Errore Clic)</span>
              </button>

              {/* Option 3: Annulla */}
              <button
                type="button"
                onClick={() => setIsStopModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
              >
                Annulla / Continua a Registrare
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
