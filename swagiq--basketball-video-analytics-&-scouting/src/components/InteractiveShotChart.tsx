import React, { useState } from 'react';
import { 
  Target, 
  Flame, 
  Grid, 
  Users, 
  Percent, 
  RotateCcw,
  Play,
  CheckCircle2,
  XCircle,
  Eye,
  Crosshair
} from 'lucide-react';
import { BasketballGame, ShotEvent, ShotType } from '../types/basketball';
import { SupportedLanguage, translations } from '../i18n/translations';

interface InteractiveShotChartProps {
  game: BasketballGame;
  onSelectShotAndPlay: (shot: ShotEvent) => void;
  activeShotId?: string | null;
  currentLanguage?: SupportedLanguage;
}

export const InteractiveShotChart: React.FC<InteractiveShotChartProps> = ({
  game,
  onSelectShotAndPlay,
  activeShotId,
  currentLanguage = 'en'
}) => {
  const t = translations[currentLanguage] || translations.en;

  // Filters
  const [selectedTeam, setSelectedTeam] = useState<'all' | 'home' | 'away'>('all');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('all');
  const [selectedOutcome, setSelectedOutcome] = useState<'all' | 'made' | 'missed'>('all');
  const [selectedShotType, setSelectedShotType] = useState<'all' | ShotType>('all');
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'dots' | 'heatmap'>('dots');
  const [hoveredShot, setHoveredShot] = useState<ShotEvent | null>(null);

  // Filter shots
  const filteredShots = game.shots.filter((shot) => {
    if (selectedTeam !== 'all' && shot.teamId !== selectedTeam) return false;
    if (selectedPlayerId !== 'all' && shot.playerId !== selectedPlayerId) return false;
    if (selectedOutcome === 'made' && !shot.made) return false;
    if (selectedOutcome === 'missed' && shot.made) return false;
    if (selectedShotType !== 'all' && shot.shotType !== selectedShotType) return false;
    if (selectedQuarter !== 'all' && shot.quarter !== selectedQuarter) return false;
    return true;
  });

  // Calculate statistics from filtered shots
  const totalShots = filteredShots.length;
  const madeShots = filteredShots.filter((s) => s.made).length;
  const missedShots = totalShots - madeShots;
  const fgPercentage = totalShots > 0 ? ((madeShots / totalShots) * 100).toFixed(1) : '0.0';

  const threePtShots = filteredShots.filter((s) => s.shotType === '3PT');
  const threePtMade = threePtShots.filter((s) => s.made).length;
  const threePtPct = threePtShots.length > 0 ? ((threePtMade / threePtShots.length) * 100).toFixed(1) : '0.0';

  const twoPtShots = filteredShots.filter((s) => s.shotType === '2PT');
  const twoPtMade = twoPtShots.filter((s) => s.made).length;
  const twoPtPct = twoPtShots.length > 0 ? ((twoPtMade / twoPtShots.length) * 100).toFixed(1) : '0.0';

  // Zone Breakdown calculation
  const paintShots = filteredShots.filter((s) => s.subType.includes('Paint') || s.subType.includes('Dunk') || s.subType.includes('Floater'));
  const paintMade = paintShots.filter((s) => s.made).length;
  const paintPct = paintShots.length > 0 ? ((paintMade / paintShots.length) * 100).toFixed(1) : '0.0';

  const midRangeShots = filteredShots.filter((s) => s.subType.includes('Mid-Range'));
  const midRangeMade = midRangeShots.filter((s) => s.made).length;
  const midRangePct = midRangeShots.length > 0 ? ((midRangeMade / midRangeShots.length) * 100).toFixed(1) : '0.0';

  const corner3Shots = filteredShots.filter((s) => s.subType.includes('Corner 3'));
  const corner3Made = corner3Shots.filter((s) => s.made).length;
  const corner3Pct = corner3Shots.length > 0 ? ((corner3Made / corner3Shots.length) * 100).toFixed(1) : '0.0';

  // Active selected player details if single player selected
  const activePlayerObj = game.players.find((p) => p.id === selectedPlayerId);

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center">
                {t.shotChartHeaderTitle}
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {totalShots} {t.shotActionsListTitle}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {t.shotChartHeaderDesc}
              </p>
            </div>
          </div>

          {/* View Mode Toggle: Dots vs Fire Heatmap */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('dots')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'dots' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Punti Singoli (Dots)</span>
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'heatmap' 
                  ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-red-300" />
              <span>🔥 Punti di Fuoco (Heatmap)</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns & Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Team Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t.filterTeam}</label>
            <select
              value={selectedTeam}
              onChange={(e) => {
                setSelectedTeam(e.target.value as any);
                setSelectedPlayerId('all');
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">{t.allTeams}</option>
              <option value="home">{game.homeTeam.name} (Home)</option>
              <option value="away">{game.awayTeam.name} (Away)</option>
            </select>
          </div>

          {/* Player Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t.filterPlayer}</label>
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">{t.allPlayers}</option>
              {game.players
                .filter((p) => selectedTeam === 'all' || p.teamId === selectedTeam)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.number} {p.name} ({p.teamId === 'home' ? game.homeTeam.shortName : game.awayTeam.shortName})
                  </option>
                ))}
            </select>
          </div>

          {/* Outcome Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t.filterOutcome}</label>
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">{t.allOutcomes}</option>
              <option value="made">{t.madeOnly}</option>
              <option value="missed">{t.missedOnly}</option>
            </select>
          </div>

          {/* Shot Type Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t.filterShotType}</label>
            <select
              value={selectedShotType}
              onChange={(e) => setSelectedShotType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">{t.allDistances}</option>
              <option value="3PT">3-Pointers (3PT)</option>
              <option value="2PT">2-Pointers (2PT)</option>
              <option value="FT">Free Throws (FT)</option>
            </select>
          </div>

          {/* Quarter Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t.filterQuarter}</label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">{t.allQuarters}</option>
              <option value="1">1st Quarter (Q1)</option>
              <option value="2">2nd Quarter (Q2)</option>
              <option value="3">3rd Quarter (Q3)</option>
              <option value="4">4th Quarter (Q4)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedTeam('all');
                setSelectedPlayerId('all');
                setSelectedOutcome('all');
                setSelectedShotType('all');
                setSelectedQuarter('all');
              }}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetFilters}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Shot Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Authentic 2D Half-Court Canvas */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          {/* Header with quick stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <span className="flex items-center font-bold text-emerald-400">
                <span className="w-3 h-3 rounded-full bg-emerald-500 mr-1.5 shadow-sm shadow-emerald-500/50" />
                {t.madeCountLabel}: {madeShots}
              </span>
              <span className="flex items-center font-bold text-rose-400">
                <span className="w-3 h-3 rounded-full bg-rose-500 mr-1.5 shadow-sm shadow-rose-500/50" />
                {t.missedCountLabel}: {missedShots}
              </span>
            </div>
            <div className="text-slate-400 font-mono">
              {t.fgPctLabel}: <span className="font-bold text-white text-sm">{fgPercentage}%</span> ({madeShots}/{totalShots})
            </div>
          </div>

          {/* 2D Basketball Court Graphic - Fixed 3PT arc & Court Proportions */}
          <div className="relative aspect-[50/47] w-full bg-gradient-to-b from-amber-950/70 via-amber-950/40 to-slate-950 rounded-2xl overflow-hidden border-2 border-amber-800/40 shadow-inner p-2 select-none">
            <svg className="w-full h-full" viewBox="0 0 100 94">
              {/* SVG Defs for Red Fire Points & Heat Gradients */}
              <defs>
                <filter id="fireGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Intense Fire Point for Made Shots */}
                <radialGradient id="fireSpotMade" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.95" />
                  <stop offset="20%" stopColor="#fef08a" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#f97316" stopOpacity="0.85" />
                  <stop offset="78%" stopColor="#dc2626" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
                </radialGradient>

                {/* Fiery Ember Point for Missed / Standard Shots */}
                <radialGradient id="fireSpotMissed" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.8" />
                  <stop offset="40%" stopColor="#ef4444" stopOpacity="0.6" />
                  <stop offset="75%" stopColor="#b91c1c" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#450a0a" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Wood Parquet texture subtle background lines */}
              {[...Array(18)].map((_, i) => (
                <line
                  key={i}
                  x1={i * 6}
                  y1="0"
                  x2={i * 6}
                  y2="94"
                  stroke="rgba(217, 119, 6, 0.05)"
                  strokeWidth="2"
                />
              ))}

              {/* Outer Court Boundary */}
              <rect x="2" y="2" width="96" height="90" fill="none" stroke="#d97706" strokeWidth="1.2" rx="1" />

              {/* Paint / Key Area: 32 wide x 38 deep */}
              <rect x="34" y="2" width="32" height="38" fill="rgba(217, 119, 6, 0.09)" stroke="#d97706" strokeWidth="1" />
              
              {/* Restricted Area Arc under basket (rim centered at 50, 10.5) */}
              <path d="M 44,10.5 A 6 6 0 0 0 56,10.5" fill="none" stroke="#d97706" strokeWidth="0.9" strokeDasharray="1.2 1.2" />
              
              {/* Free Throw Circle at y = 40 (Solid upper, dashed lower) */}
              <circle cx="50" cy="40" r="12" fill="none" stroke="#d97706" strokeWidth="1" />
              <path d="M 38,40 A 12 12 0 0 0 62,40" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="1.5 1.5" />

              {/* 
                Official 3-Point Line:
                Straight corner lines from baseline (y=2) to y=24 at x=8 and x=92.
                Arc connects (8, 24) to (92, 24) with radius 44 centered at basket (50, 10.5).
              */}
              <path 
                d="M 8,2 L 8,24 A 44 44 0 0 0 92,24 L 92,2" 
                fill="none" 
                stroke="#d97706" 
                strokeWidth="1.4" 
              />

              {/* Center Circle Arc at Half Court (y = 92) */}
              <path d="M 38,92 A 12 12 0 0 1 62,92" fill="none" stroke="#d97706" strokeWidth="1.2" />

              {/* Backboard & Rim Structure */}
              <line x1="42" y1="6" x2="58" y2="6" stroke="#ffffff" strokeWidth="1.8" />
              <line x1="50" y1="6" x2="50" y2="8" stroke="#f97316" strokeWidth="1.4" />
              <circle cx="50" cy="10.5" r="2.8" fill="none" stroke="#f97316" strokeWidth="1.8" />

              {/* 
                RED FIRE POINTS & INTENSITY HEATMAP (PUNTI DI FUOCO)
                Render authentic glowing red fire patches at shot release coordinates.
                Higher concentration or made shots emit intense blazing cores.
              */}
              {viewMode === 'heatmap' && (
                <g style={{ mixBlendMode: 'screen' }}>
                  {filteredShots.map((shot) => {
                    const radius = shot.made ? 9.5 : 7.0;
                    return (
                      <circle
                        key={`fire-${shot.id}`}
                        cx={shot.courtX}
                        cy={shot.courtY}
                        r={radius}
                        fill={shot.made ? 'url(#fireSpotMade)' : 'url(#fireSpotMissed)'}
                        filter="url(#fireGlowFilter)"
                        opacity={shot.made ? 0.95 : 0.75}
                      />
                    );
                  })}

                  {/* Core Ember Centers */}
                  {filteredShots.map((shot) => (
                    <circle
                      key={`ember-${shot.id}`}
                      cx={shot.courtX}
                      cy={shot.courtY}
                      r={shot.made ? 1.8 : 1.2}
                      fill={shot.made ? '#fff' : '#f87171'}
                      opacity={0.9}
                    />
                  ))}
                </g>
              )}

              {/* 
                Shot Scatter Dots Mode (Green Made & Red Missed)
              */}
              {viewMode === 'dots' && filteredShots.map((shot) => {
                const isSelected = shot.id === activeShotId;
                const isHovered = hoveredShot?.id === shot.id;

                return (
                  <g
                    key={shot.id}
                    onMouseEnter={() => setHoveredShot(shot)}
                    onMouseLeave={() => setHoveredShot(null)}
                    style={{ pointerEvents: 'auto', cursor: 'default' }}
                  >
                    {/* Fixed Static Highlight Ring for Active/Hovered Shot (no transform jitter) */}
                    {(isSelected || isHovered) && (
                      <circle
                        cx={shot.courtX}
                        cy={shot.courtY}
                        r="5.5"
                        fill="rgba(249, 115, 22, 0.25)"
                        stroke="#f97316"
                        strokeWidth="1.2"
                        strokeDasharray={isSelected ? "1.5 1" : undefined}
                      />
                    )}

                    {/* Fixed Position Shot Marker */}
                    <circle
                      cx={shot.courtX}
                      cy={shot.courtY}
                      r={isSelected || isHovered ? '3.6' : '3'}
                      fill={shot.made ? '#10b981' : '#f43f5e'}
                      stroke="#ffffff"
                      strokeWidth="0.8"
                    />

                    {/* Icon glyph inside circle */}
                    <text
                      x={shot.courtX}
                      y={shot.courtY + 0.9}
                      fontSize="2.2"
                      fontWeight="bold"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontFamily="JetBrains Mono"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {shot.made ? '✓' : '✕'}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredShot && (
              <div className="absolute top-3 left-3 bg-slate-950/95 backdrop-blur-md px-3 py-2 rounded-xl text-xs text-white border border-slate-700 shadow-xl pointer-events-none">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className={hoveredShot.made ? 'text-emerald-400' : 'text-rose-400'}>
                    {hoveredShot.made ? '🟢 MADE' : '🔴 MISSED'}
                  </span>
                  <span>#{hoveredShot.playerNumber} {hoveredShot.playerName}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {hoveredShot.subType} • {hoveredShot.distanceFeet.toFixed(1)} ft • {hoveredShot.gameClock}
                </div>
              </div>
            )}

            {/* Hint overlay */}
            <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] text-slate-400 font-mono border border-slate-800">
              📊 2D Standard FIBA/NBA Court Scale (50ft × 47ft)
            </div>
          </div>
        </div>

        {/* Right Column: Shot Analytics, Zone Breakdown & Action List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Player Card if filtered */}
          {activePlayerObj ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center space-x-4">
              <img
                src={activePlayerObj.photoUrl}
                alt={activePlayerObj.name}
                className="w-16 h-16 rounded-xl object-cover border border-orange-500/40 shadow-md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-orange-400 text-sm">#{activePlayerObj.number}</span>
                  <h3 className="font-bold text-white text-base truncate">{activePlayerObj.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-semibold">
                    {activePlayerObj.position}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-800 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">PTS</div>
                    <div className="font-mono font-bold text-white text-sm">{activePlayerObj.points}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">FG%</div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">{activePlayerObj.fgPct}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">3P%</div>
                    <div className="font-mono font-bold text-cyan-400 text-sm">{activePlayerObj.threePct}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">PIR</div>
                    <div className="font-mono font-bold text-amber-400 text-sm">{activePlayerObj.pir}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Match Overview Breakdown */
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <h3 className="font-bold text-white text-sm mb-3 flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-orange-400" />
                <span>Overall Shooting Accuracy Breakdown</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">Field Goals (FG)</span>
                  <span className="font-mono font-bold text-lg text-emerald-400">{fgPercentage}%</span>
                  <span className="text-[10px] text-slate-500 block">{madeShots}/{totalShots}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">3-Pointers (3PT)</span>
                  <span className="font-mono font-bold text-lg text-cyan-400">{threePtPct}%</span>
                  <span className="text-[10px] text-slate-500 block">{threePtMade}/{threePtShots.length}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">2-Pointers (2PT)</span>
                  <span className="font-mono font-bold text-lg text-amber-400">{twoPtPct}%</span>
                  <span className="text-[10px] text-slate-500 block">{twoPtMade}/{twoPtShots.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tactical Zones Accuracy Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center justify-between">
              <span className="flex items-center">
                <Percent className="w-4 h-4 mr-1.5 text-emerald-400" />
                <span>Shooting Zone Efficiency</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">vs League Avg (44.8%)</span>
            </h3>

            <div className="space-y-2.5">
              {/* Paint Zone */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-white">{t.paintZoneLabel}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{paintMade}/{paintShots.length} made</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-emerald-400">{paintPct}%</span>
                  <span className="text-[10px] text-emerald-500 block font-semibold">+8.4% vs avg</span>
                </div>
              </div>

              {/* Mid-Range Zone */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-white">{t.midRangeZoneLabel}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{midRangeMade}/{midRangeShots.length} made</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-amber-400">{midRangePct}%</span>
                  <span className="text-[10px] text-amber-500 block font-semibold">-2.1% vs avg</span>
                </div>
              </div>

              {/* Corner 3 Zone */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-white">{t.corner3ZoneLabel}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{corner3Made}/{corner3Shots.length} made</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-cyan-400">{corner3Pct}%</span>
                  <span className="text-[10px] text-cyan-400 block font-semibold">+6.2% vs avg</span>
                </div>
              </div>
            </div>
          </div>

          {/* List of Filtered Shots with direct play action (The official trigger to play the video) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-orange-400" />
                <span>{t.shotActionsListTitle} ({filteredShots.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">{t.clickToPlayVideo}</span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {filteredShots.map((shot) => (
                <div
                  key={shot.id}
                  onClick={() => onSelectShotAndPlay(shot)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    shot.id === activeShotId
                      ? 'bg-orange-500/20 border-orange-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {shot.made ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-white">
                        #{shot.playerNumber} {shot.playerName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {shot.subType} • {shot.distanceFeet.toFixed(1)} ft ({shot.defenderContest})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] text-slate-400">{shot.gameClock}</span>
                    <button 
                      type="button"
                      className="p-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white transition-colors"
                      title="Play video for this shot action"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
