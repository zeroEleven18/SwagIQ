import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, 
  Swords, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Play, 
  Edit3, 
  Trash2, 
  Save, 
  RotateCcw, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  Users, 
  Activity, 
  Layers, 
  FolderGit2,
  Eye,
  Upload,
  Image as ImageIcon,
  PenTool,
  MousePointer,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { BasketballGame, CustomTacticalPlay, CustomPlayNode, CustomPlayAction, CustomPlayComplianceLog } from '../types/basketball';
import { INITIAL_CUSTOM_PLAYS } from '../data/mockCustomPlays';
import { SupportedLanguage, translations } from '../i18n/translations';

interface CustomPlaybookProps {
  game: BasketballGame;
  onPlayTacticalTimestamp?: (timestampSec: number) => void;
  currentLanguage?: SupportedLanguage;
}

export const CustomPlaybook: React.FC<CustomPlaybookProps> = ({
  game,
  onPlayTacticalTimestamp,
  currentLanguage = 'en'
}) => {
  const t = translations[currentLanguage] || translations.en;

  const [plays, setPlays] = useState<CustomTacticalPlay[]>(
    game.customPlays && game.customPlays.length > 0 ? game.customPlays : INITIAL_CUSTOM_PLAYS
  );

  const [activePlayId, setActivePlayId] = useState<string>(plays[0]?.id || 'play-1');
  const [filterType, setFilterType] = useState<'all' | 'offensive' | 'defensive'>('all');
  const [tacticalViewMode, setTacticalViewMode] = useState<'board' | 'diagram' | 'draw'>('board');
  const [activeDrawTool, setActiveDrawTool] = useState<'select' | 'pass' | 'cut' | 'screen' | 'dribble'>('select');

  // New Play form state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'offensive' | 'defensive'>('offensive');
  const [newCategory, setNewCategory] = useState('Pick & Roll');
  const [newDirective, setNewDirective] = useState('');
  const [newTarget, setNewTarget] = useState<number>(8);
  const [newDiagramUrl, setNewDiagramUrl] = useState<string>('');

  // Reset Modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetSelection, setResetSelection] = useState<'match' | 'defaults'>('match');

  // Whiteboard / Tactical Diagram Modal state
  const [isWhiteboardModalOpen, setIsWhiteboardModalOpen] = useState(false);

  // Diagram file upload ref
  const diagramFileRef = useRef<HTMLInputElement>(null);

  const activePlay = plays.find((p) => p.id === activePlayId) || plays[0];

  const filteredPlays = plays.filter((p) => {
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  // Calculate global compliance across all custom plays
  const totalTargetExecs = plays.reduce((acc, p) => acc + p.targetExecutions, 0);
  const totalActualExecs = plays.reduce((acc, p) => acc + p.actualExecutions, 0);
  const avgCompliance = plays.length > 0 
    ? (plays.reduce((acc, p) => acc + p.complianceRate, 0) / plays.length).toFixed(1) 
    : '0.0';
  const totalPointsFromPlays = plays.reduce((acc, p) => acc + p.pointsGenerated, 0);

  // Handle Reset Actions
  const handleExecuteReset = () => {
    if (resetSelection === 'match') {
      // Reset only live match tracking data
      setPlays((prev) =>
        prev.map((p) => ({
          ...p,
          actualExecutions: 0,
          complianceRate: 100.0,
          pointsGenerated: 0,
          ppp: 0.0,
          complianceLogs: []
        }))
      );
    } else {
      // Reset to default MVP Academy playbook
      setPlays(INITIAL_CUSTOM_PLAYS);
      setActivePlayId(INITIAL_CUSTOM_PLAYS[0]?.id || 'play-1');
    }
    setIsResetModalOpen(false);
  };

  const handleDeletePlay = (playId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (plays.length <= 1) return;
    const remaining = plays.filter((p) => p.id !== playId);
    setPlays(remaining);
    if (activePlayId === playId) {
      setActivePlayId(remaining[0]?.id || '');
    }
  };

  // Diagram Upload Handler
  const handleDiagramUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        if (isCreatingNew) {
          setNewDiagramUrl(result);
        } else if (activePlay) {
          const updated = { ...activePlay, diagramImageUrl: result };
          setPlays((prev) => prev.map((p) => (p.id === activePlay.id ? updated : p)));
          setTacticalViewMode('diagram');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Predefined tactical schemes from MVP Academy principles
  const tacticalPresets = [
    {
      title: 'Motion Offense 5-Out (Spaziatura Perimetrale)',
      type: 'offensive' as const,
      category: 'Motion & Spacing',
      target: 10,
      directive: 'Tutti e 5 i giocatori posizionati oltre la linea dei 3 punti; al passaggio sulla guardia a 45°, l\'ala opposta esegue un taglio backdoor immediato a canestro se anticipato. In caso di penetrazione centrale, scarico obbligatorio nell\'angolo opposto.',
      nodes: [
        { id: 'n-1', label: '1 (PG)', role: 'PG', number: 0, x: 50, y: 72, isOffense: true },
        { id: 'n-2', label: '2 (SG)', role: 'SG', number: 9, x: 84, y: 48, isOffense: true },
        { id: 'n-3', label: '3 (SF)', role: 'SF', number: 7, x: 16, y: 48, isOffense: true },
        { id: 'n-4', label: '4 (PF)', role: 'PF', number: 42, x: 12, y: 22, isOffense: true },
        { id: 'n-5', label: '5 (C)', role: 'C', number: 8, x: 88, y: 22, isOffense: true },
      ],
      actions: [
        { id: 'a-1', type: 'pass' as const, start: { x: 50, y: 72 }, end: { x: 84, y: 48 }, label: 'Entry Pass' },
        { id: 'a-2', type: 'cut' as const, start: { x: 16, y: 48 }, end: { x: 50, y: 20 }, label: 'Backdoor Cut' },
      ]
    },
    {
      title: 'Attacco Flex (Taglio Orizzontale & Downscreen)',
      type: 'offensive' as const,
      category: 'Flex Offense',
      target: 8,
      directive: 'Passaggio guardia-ala; taglio orizzontale del tiratore sul lato debole (Flex Cut) sfruttando il blocco cieco del lungo sul fondo. Immediatamente dopo, il bloccante riceve un blocco verticale (Downscreen) per un tiro frontale.',
      nodes: [
        { id: 'n-1', label: '1 (PG)', role: 'PG', number: 0, x: 50, y: 72, isOffense: true },
        { id: 'n-2', label: '2 (SG)', role: 'SG', number: 9, x: 82, y: 48, isOffense: true },
        { id: 'n-3', label: '3 (SF)', role: 'SF', number: 7, x: 18, y: 24, isOffense: true },
        { id: 'n-4', label: '4 (PF)', role: 'PF', number: 42, x: 50, y: 56, isOffense: true },
        { id: 'n-5', label: '5 (C)', role: 'C', number: 8, x: 42, y: 20, isOffense: true },
      ],
      actions: [
        { id: 'a-1', type: 'screen' as const, start: { x: 42, y: 20 }, end: { x: 30, y: 22 }, label: 'Flex Screen' },
        { id: 'a-2', type: 'cut' as const, start: { x: 18, y: 24 }, end: { x: 50, y: 16 }, label: 'Flex Cut' },
        { id: 'a-3', type: 'screen' as const, start: { x: 50, y: 56 }, end: { x: 42, y: 35 }, label: 'Downscreen' },
      ]
    },
    {
      title: 'Pick & Roll Spagna (Backscreen sul Lungo)',
      type: 'offensive' as const,
      category: 'Spain PnR',
      target: 12,
      directive: 'Il centro #8 porta blocco centrale sulla palla per il playmaker; contemporaneamente la guardia tiratrice #7 porta un blocco alla schiena (Backscreen) sul difensore del centro, aprendosi poi oltre la linea dei 3 punti (Pop).',
      nodes: [
        { id: 'n-1', label: '1 (PG)', role: 'PG', number: 0, x: 50, y: 70, isOffense: true },
        { id: 'n-2', label: '2 (SG)', role: 'SG', number: 7, x: 50, y: 44, isOffense: true },
        { id: 'n-3', label: '3 (SF)', role: 'SF', number: 9, x: 88, y: 24, isOffense: true },
        { id: 'n-4', label: '4 (PF)', role: 'PF', number: 42, x: 12, y: 24, isOffense: true },
        { id: 'n-5', label: '5 (C)', role: 'C', number: 8, x: 58, y: 58, isOffense: true },
      ],
      actions: [
        { id: 'a-1', type: 'screen' as const, start: { x: 58, y: 58 }, end: { x: 50, y: 64 }, label: 'On-Ball Screen' },
        { id: 'a-2', type: 'screen' as const, start: { x: 50, y: 44 }, end: { x: 56, y: 48 }, label: 'Spain Backscreen' },
        { id: 'a-3', type: 'cut' as const, start: { x: 50, y: 70 }, end: { x: 38, y: 48 }, label: 'Drive' },
        { id: 'a-4', type: 'cut' as const, start: { x: 58, y: 58 }, end: { x: 50, y: 16 }, label: 'Rim Roll' },
      ]
    },
    {
      title: 'Horns Flare & DHO ai Gomiti',
      type: 'offensive' as const,
      category: 'Horns Set',
      target: 8,
      directive: 'Due lunghi posizionati sui gomiti della lunetta. Il playmaker #0 passa sul gomito destro e sfrutta il blocco Flare o hand-off (DHO) mentre il tiratore opposto taglia lungo la linea di fondo per il tiro.',
      nodes: [
        { id: 'n-1', label: '1 (PG)', role: 'PG', number: 0, x: 50, y: 72, isOffense: true },
        { id: 'n-2', label: '2 (SG)', role: 'SG', number: 9, x: 88, y: 22, isOffense: true },
        { id: 'n-3', label: '3 (SF)', role: 'SF', number: 7, x: 12, y: 22, isOffense: true },
        { id: 'n-4', label: '4 (PF)', role: 'PF', number: 42, x: 36, y: 40, isOffense: true },
        { id: 'n-5', label: '5 (C)', role: 'C', number: 8, x: 64, y: 40, isOffense: true },
      ],
      actions: [
        { id: 'a-1', type: 'pass' as const, start: { x: 50, y: 72 }, end: { x: 64, y: 40 }, label: 'Elbow Entry' },
        { id: 'a-2', type: 'screen' as const, start: { x: 36, y: 40 }, end: { x: 44, y: 60 }, label: 'Flare Screen' },
      ]
    },
    {
      title: 'Difesa Drop 1-5 & Protezione Ferro',
      type: 'defensive' as const,
      category: 'Pick & Roll Defense',
      target: 15,
      directive: 'Sul Pick & Roll avversario, il lungo #8 rimane in contenimento profondo (Drop) nell\'area dei 3 secondi a protezione del ferro. La guardia passa sopra al blocco per contestare il tiro da dietro.',
      nodes: [
        { id: 'n-1', label: '1 (PG)', role: 'PG', number: 0, x: 50, y: 64, isOffense: false },
        { id: 'n-2', label: '2 (SG)', role: 'SG', number: 9, x: 76, y: 40, isOffense: false },
        { id: 'n-3', label: '3 (SF)', role: 'SF', number: 7, x: 24, y: 40, isOffense: false },
        { id: 'n-4', label: '4 (PF)', role: 'PF', number: 42, x: 34, y: 22, isOffense: false },
        { id: 'n-5', label: '5 (C)', role: 'C', number: 8, x: 50, y: 28, isOffense: false },
      ],
      actions: [
        { id: 'a-1', type: 'cut' as const, start: { x: 50, y: 28 }, end: { x: 50, y: 18 }, label: 'Drop Coverage' },
        { id: 'a-2', type: 'cut' as const, start: { x: 50, y: 64 }, end: { x: 46, y: 52 }, label: 'Over Screen Contest' },
      ]
    },
    {
      title: 'Difesa a Zona 2-3 Compatta',
      type: 'defensive' as const,
      category: 'Zone Defense',
      target: 8,
      directive: 'Due esterni alti a protezione della linea dei 3 punti, tre lunghi schierati sulla linea di fondo. Movimento sincronizzato sulla palla: vietato concedere penetrazioni centrali o rimbalzi offensivi avversari.',
      nodes: [
        { id: 'n-1', label: 'G1', role: 'PG', number: 0, x: 38, y: 54, isOffense: false },
        { id: 'n-2', label: 'G2', role: 'SG', number: 9, x: 62, y: 54, isOffense: false },
        { id: 'n-3', label: 'F1', role: 'SF', number: 7, x: 20, y: 24, isOffense: false },
        { id: 'n-4', label: 'C', role: 'C', number: 8, x: 50, y: 24, isOffense: false },
        { id: 'n-5', label: 'F2', role: 'PF', number: 42, x: 80, y: 24, isOffense: false },
      ],
      actions: [
        { id: 'a-1', type: 'cut' as const, start: { x: 38, y: 54 }, end: { x: 32, y: 58 }, label: 'Ball Pressure' },
        { id: 'a-2', type: 'cut' as const, start: { x: 50, y: 24 }, end: { x: 50, y: 16 }, label: 'Paint Wall' },
      ]
    },
    {
      title: 'Full-Court Press 2-2-1 su Rimessa',
      type: 'defensive' as const,
      category: 'Full-Court Press',
      target: 6,
      directive: 'Dopo canestro segnato, impostare il pressing 2-2-1 a tutto campo. Indirizzare la rimessa verso la linea laterale e fare scattare il raddoppio aggressivo sul palleggiatore non appena supera la linea di metà campo.',
      nodes: [
        { id: 'n-1', label: '1 (PG)', role: 'PG', number: 0, x: 35, y: 68, isOffense: false },
        { id: 'n-2', label: '2 (SG)', role: 'SG', number: 9, x: 65, y: 68, isOffense: false },
        { id: 'n-3', label: '3 (SF)', role: 'SF', number: 7, x: 30, y: 44, isOffense: false },
        { id: 'n-4', label: '4 (PF)', role: 'PF', number: 42, x: 70, y: 44, isOffense: false },
        { id: 'n-5', label: '5 (C)', role: 'C', number: 8, x: 50, y: 20, isOffense: false },
      ],
      actions: [
        { id: 'a-1', type: 'cut' as const, start: { x: 65, y: 68 }, end: { x: 78, y: 60 }, label: 'Sideline Trap' },
        { id: 'a-2', type: 'cut' as const, start: { x: 70, y: 44 }, end: { x: 78, y: 52 }, label: 'Trap Double' },
      ]
    }
  ];

  const applyTacticalPreset = (preset: typeof tacticalPresets[0]) => {
    setNewTitle(preset.title);
    setNewType(preset.type);
    setNewCategory(preset.category);
    setNewTarget(preset.target);
    setNewDirective(preset.directive);
  };

  // Add custom play
  const handleCreatePlay = () => {
    if (!newTitle.trim() || !newDirective.trim()) return;

    const newPlayObj: CustomTacticalPlay = {
      id: `play-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      category: newCategory,
      coachDirective: newDirective.trim(),
      targetExecutions: Number(newTarget),
      actualExecutions: 0,
      complianceRate: 100.0,
      pointsGenerated: 0,
      ppp: 0.0,
      diagramImageUrl: newDiagramUrl || undefined,
      keyActionDescription: 'Custom tactical play registered by coaching staff',
      nodes: [
        { id: 'n-1', label: '1 (PG)', role: 'PG', number: 0, x: 50, y: 72, isOffense: newType === 'offensive' },
        { id: 'n-2', label: '2 (SG)', role: 'SG', number: 9, x: 82, y: 50, isOffense: newType === 'offensive' },
        { id: 'n-3', label: '3 (SF)', role: 'SF', number: 7, x: 18, y: 50, isOffense: newType === 'offensive' },
        { id: 'n-4', label: '4 (PF)', role: 'PF', number: 42, x: 30, y: 32, isOffense: newType === 'offensive' },
        { id: 'n-5', label: '5 (C)', role: 'C', number: 8, x: 70, y: 32, isOffense: newType === 'offensive' },
      ],
      actions: [
        { id: 'a-1', type: 'screen', start: { x: 70, y: 32 }, end: { x: 50, y: 64 }, label: 'Primary Screen' },
        { id: 'a-2', type: 'cut', start: { x: 50, y: 72 }, end: { x: 38, y: 44 }, label: 'Drive & Kick' },
      ],
      complianceLogs: []
    };

    setPlays((prev) => [newPlayObj, ...prev]);
    setActivePlayId(newPlayObj.id);
    setIsCreatingNew(false);
    setNewTitle('');
    setNewDirective('');
    setNewDiagramUrl('');
  };

  // Simulate logging a new execution from Computer Vision
  const handleLogNewExecution = (followed: boolean) => {
    if (!activePlay) return;

    const newLog: CustomPlayComplianceLog = {
      id: `log-${Date.now()}`,
      timestampSec: 150 + Math.floor(Math.random() * 100),
      gameClock: `0${Math.floor(Math.random() * 9) + 1}:${Math.floor(Math.random() * 50) + 10} Q3`,
      quarter: 3,
      executedCorrectly: followed,
      coachDirectiveFollowed: followed,
      pointsScored: followed ? (activePlay.type === 'offensive' ? 2 + (Math.random() > 0.5 ? 1 : 0) : 0) : 0,
      playersInvolved: [0, 8, 9],
      notes: followed 
        ? 'Tactical directive executed with precision, maintaining designated court spacing.'
        : 'DIRECTIVE BREAKDOWN: Missed screen timing or collapsed spacing.'
    };

    const newActual = activePlay.actualExecutions + 1;
    const currentFollowedCount = activePlay.complianceLogs.filter(l => l.coachDirectiveFollowed).length + (followed ? 1 : 0);
    const newRate = ((currentFollowedCount / (activePlay.complianceLogs.length + 1)) * 100);
    const newPoints = activePlay.pointsGenerated + newLog.pointsScored;

    const updatedPlay: CustomTacticalPlay = {
      ...activePlay,
      actualExecutions: newActual,
      complianceRate: parseFloat(newRate.toFixed(1)),
      pointsGenerated: newPoints,
      ppp: parseFloat((newPoints / (newActual || 1)).toFixed(2)),
      complianceLogs: [newLog, ...activePlay.complianceLogs]
    };

    setPlays((prev) => prev.map(p => p.id === activePlay.id ? updatedPlay : p));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {t.playbookHeaderTitle}
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                {t.playbookBadge}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.playbookHeaderDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-95 shadow-md"
            title={t.resetPlaybookBtn}
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>{t.resetPlaybookBtn}</span>
          </button>

          <button
            onClick={() => setIsCreatingNew(!isCreatingNew)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreatingNew ? 'Chiudi Form' : t.createPlayBtn}</span>
          </button>
        </div>
      </div>

      {/* Coach Directive Compliance Explanatory Banner */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-slate-900 border border-orange-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
        <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 mt-0.5 shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-bold text-white flex items-center gap-2">
            <span>Rilevamento Aderenza Schemi & Direttive Coach</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Vision Compliance Engine
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Questo modulo quantifica in che percentuale i giocatori applicano sul parquet i movimenti, tagli, spaziature e direttive strategiche assegnate dal coach. Il sistema correla l'aderenza con i punti per possesso (PPP), identificando la resa quando lo schema viene eseguito correttamente rispetto a quando si va fuori spartito.
          </p>
        </div>
      </div>

      {/* Global Analytics Overview Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">{t.registeredPlaysCard}</div>
          <div className="text-2xl font-bold font-mono text-white">{plays.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Schemi Offesa & Difesa</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">{t.totalExecutionsCard}</div>
          <div className="text-2xl font-bold font-mono text-orange-400">
            {totalActualExecs} <span className="text-xs text-slate-500 font-normal">/ {totalTargetExecs} Target</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {totalActualExecs > 0 ? "Tracciamento Esecuzioni Attivo" : "In attesa di esecuzioni in partita"}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">{t.complianceRateCard}</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {totalActualExecs > 0 ? `${avgCompliance}%` : 'N/D'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {totalActualExecs > 0 ? "Aderenza Direttive Coach" : "Nessun dato registrato"}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">{t.pointsFromPlaysCard}</div>
          <div className="text-2xl font-bold font-mono text-cyan-400">{totalPointsFromPlays} pts</div>
          <div className="text-[10px] text-slate-400 mt-1">
            {totalActualExecs > 0 ? `Media ${(totalPointsFromPlays / totalActualExecs).toFixed(2)} Punti per Possesso` : "0.0 PPP (In attesa di possessi)"}
          </div>
        </div>
      </div>

      {/* New Play Creation Box */}
      {isCreatingNew && (
        <div className="bg-slate-900 border border-orange-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-orange-400" />
              {t.newPlayModalTitle}
            </h3>
            <span className="text-[11px] text-slate-400">Seleziona un modello o personalizza le direttive</span>
          </div>

          {/* Quick Preset Selector */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Schemi Predefiniti (Modelli Tattici Archivio)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Clicca per precompilare</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {tacticalPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyTacticalPreset(preset)}
                  className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-all border ${
                    newTitle === preset.title
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 font-semibold'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                    preset.type === 'offensive' ? 'bg-orange-400' : 'bg-cyan-400'
                  }`} />
                  {preset.title.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t.playTitleLabel}</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Horns Flare for Corner Shooter"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-semibold"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t.playTypeLabel}</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="offensive">{t.offensiveCategory}</option>
                <option value="defensive">{t.defensiveCategory}</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t.targetExecutionsLabel}</label>
              <input
                type="number"
                min={1}
                max={30}
                value={newTarget}
                onChange={(e) => setNewTarget(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              {t.coachDirectiveLabel}
            </label>
            <textarea
              rows={2}
              value={newDirective}
              onChange={(e) => setNewDirective(e.target.value)}
              placeholder="e.g. Center #8 sets the primary screen on ball handler while guard #9 makes backdoor cut to corner..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Upload Play Diagram Option */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Upload className="w-4 h-4 text-orange-400" />
              <div>
                <div className="text-xs font-semibold text-white">{t.uploadTacticalDiagramBtn}</div>
                <div className="text-[10px] text-slate-400">Optional diagram photo or coach playbook whiteboard screenshot</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={diagramFileRef}
                onChange={handleDiagramUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => diagramFileRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700"
              >
                {newDiagramUrl ? 'Replace Diagram' : 'Upload Image'}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsCreatingNew(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePlay}
              className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md"
            >
              Save Play to Playbook
            </button>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout: Plays List vs Tactical Board & Compliance Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Plays Selector & Category Filter (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                filterType === 'all' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.allCategories} ({plays.length})
            </button>
            <button
              onClick={() => setFilterType('offensive')}
              className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                filterType === 'offensive' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>{t.offensiveCategory}</span>
            </button>
            <button
              onClick={() => setFilterType('defensive')}
              className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                filterType === 'defensive' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t.defensiveCategory}</span>
            </button>
          </div>

          {/* List of Custom Plays */}
          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredPlays.map((play) => {
              const isSelected = play.id === activePlay?.id;
              const isGoodCompliance = play.complianceRate >= 80;

              return (
                <div
                  key={play.id}
                  onClick={() => setActivePlayId(play.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-slate-800/90 border-orange-500 shadow-xl ring-1 ring-orange-500/50'
                      : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          play.type === 'offensive' 
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}>
                          {play.type === 'offensive' ? t.offensiveCategory : t.defensiveCategory}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{play.category}</span>
                      </div>
                      <h4 className="font-bold text-white text-xs leading-snug">{play.title}</h4>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-mono font-bold block ${
                        play.actualExecutions === 0 ? 'text-slate-500' : isGoodCompliance ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {play.actualExecutions > 0 ? `${play.complianceRate}%` : 'N/D'}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase">Compliance</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                    "{play.coachDirective}"
                  </p>

                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80 text-center">
                    <div className="bg-slate-950 p-1.5 rounded-lg">
                      <div className="text-[9px] text-slate-500">EXECUTIONS</div>
                      <div className="font-mono font-bold text-xs text-white">
                        {play.actualExecutions}/{play.targetExecutions}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded-lg">
                      <div className="text-[9px] text-slate-500">POINTS</div>
                      <div className="font-mono font-bold text-xs text-emerald-400">
                        {play.pointsGenerated} pts
                      </div>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded-lg">
                      <div className="text-[9px] text-slate-500">EFF / PPP</div>
                      <div className="font-mono font-bold text-xs text-amber-400">
                        {play.ppp}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 2D Tactical Board & Compliance Tracker Logs (8 cols) */}
        {activePlay && (
          <div className="lg:col-span-8 space-y-5">
            {/* Active Play Detail Header & Directives */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{activePlay.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      activePlay.type === 'offensive' 
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {activePlay.type === 'offensive' ? 'Offensive Scheme' : 'Defensive Scheme'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Category: <strong className="text-slate-200">{activePlay.category}</strong>
                  </p>
                </div>

                {/* Real-time simulation buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLogNewExecution(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>+1 Correct Execution</span>
                  </button>
                  <button
                    onClick={() => handleLogNewExecution(false)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>+1 Directive Error</span>
                  </button>
                </div>
              </div>

              {/* Coach Directive Highlight Banner */}
              <div className="bg-slate-950 p-4 rounded-xl border border-orange-500/30 flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 flex-shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-0.5">
                    COACH OFFICIAL DIRECTIVE
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed font-medium">
                    {activePlay.coachDirective}
                  </div>
                </div>
              </div>
            </div>

            {/* 2D Tactical Diagram Board with View Mode Toggle */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-orange-400" />
                  <h4 className="font-bold text-white text-xs">2D Tactical Visualizer & Diagram Board</h4>
                </div>

                {/* Visualizer Mode Toggle & Upload Trigger */}
                <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setTacticalViewMode('board')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      tacticalViewMode === 'board' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.vectorBoardTab || 'Vector Board'}
                  </button>

                  {activePlay.diagramImageUrl && (
                    <button
                      onClick={() => setTacticalViewMode('diagram')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        tacticalViewMode === 'diagram' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t.diagramImageTab || 'Foto Lavagna / Schema'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsWhiteboardModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 transition-all flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t.uploadTacticalDiagramBtn || 'Carica Schema / Foto'}</span>
                  </button>
                </div>
              </div>

              {/* View Mode 1: Uploaded Diagram Image */}
              {tacticalViewMode === 'diagram' && activePlay.diagramImageUrl ? (
                <div className="relative aspect-[50/35] w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
                  <img
                    src={activePlay.diagramImageUrl}
                    alt={activePlay.title}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
                  />
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-[10px] text-slate-300 font-mono border border-slate-700">
                    Uploaded Tactical Whiteboard / Diagram
                  </div>
                </div>
              ) : (
                /* View Mode 2: High Precision Half Court Tactical Vector Canvas */
                <div className="relative aspect-[50/38] w-full bg-gradient-to-b from-amber-950/60 via-amber-950/40 to-slate-950 rounded-2xl overflow-hidden border border-amber-800/40 shadow-inner p-3 select-none">
                  <svg className="w-full h-full" viewBox="0 0 100 80">
                    {/* Defs for Arrow Markers */}
                    <defs>
                      <marker id="arrow-cut" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#f97316" />
                      </marker>
                      <marker id="arrow-pass" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                      </marker>
                      <marker id="arrow-dribble" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
                      </marker>
                    </defs>

                    {/* Court Lines */}
                    <rect x="2" y="2" width="96" height="76" fill="none" stroke="#d97706" strokeWidth="1.2" rx="1" />
                    <rect x="34" y="2" width="32" height="34" fill="rgba(217, 119, 6, 0.08)" stroke="#d97706" strokeWidth="1" />
                    <path d="M 44,11 A 6 6 0 0 0 56,11" fill="none" stroke="#d97706" strokeWidth="0.8" strokeDasharray="1 1" />
                    <circle cx="50" cy="36" r="10" fill="none" stroke="#d97706" strokeWidth="1" />
                    <path d="M 40,36 A 10 10 0 0 0 60,36" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="1.5 1.5" />

                    {/* 3PT Line */}
                    <path d="M 8,2 L 8,24 A 44 44 0 0 0 92,24 L 92,2" fill="none" stroke="#d97706" strokeWidth="1.3" />

                    {/* Rim & Backboard */}
                    <line x1="42" y1="6.5" x2="58" y2="6.5" stroke="#ffffff" strokeWidth="1.8" />
                    <circle cx="50" cy="11" r="2.8" fill="none" stroke="#f97316" strokeWidth="1.8" />

                    {/* Actions / Movement Vectors */}
                    {activePlay.actions.map((act) => {
                      if (act.type === 'pass') {
                        return (
                          <g key={act.id}>
                            <line
                              x1={act.start.x}
                              y1={act.start.y}
                              x2={act.end.x}
                              y2={act.end.y}
                              stroke="#10b981"
                              strokeWidth="1.8"
                              strokeDasharray="3 2"
                              markerEnd="url(#arrow-pass)"
                            />
                            {act.label && (
                              <text
                                x={(act.start.x + act.end.x) / 2}
                                y={(act.start.y + act.end.y) / 2 - 2}
                                fontSize="2.8"
                                fill="#10b981"
                                fontFamily="JetBrains Mono"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {act.label}
                              </text>
                            )}
                          </g>
                        );
                      }
                      if (act.type === 'cut') {
                        return (
                          <g key={act.id}>
                            <line
                              x1={act.start.x}
                              y1={act.start.y}
                              x2={act.end.x}
                              y2={act.end.y}
                              stroke="#f97316"
                              strokeWidth="2"
                              markerEnd="url(#arrow-cut)"
                            />
                            {act.label && (
                              <text
                                x={(act.start.x + act.end.x) / 2}
                                y={(act.start.y + act.end.y) / 2 - 2}
                                fontSize="2.8"
                                fill="#f97316"
                                fontFamily="JetBrains Mono"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {act.label}
                              </text>
                            )}
                          </g>
                        );
                      }
                      if (act.type === 'screen') {
                        return (
                          <g key={act.id}>
                            <line
                              x1={act.start.x}
                              y1={act.start.y}
                              x2={act.end.x}
                              y2={act.end.y}
                              stroke="#fbbf24"
                              strokeWidth="2.2"
                            />
                            {/* Screen T-Bar */}
                            <line
                              x1={act.end.x - 3}
                              y1={act.end.y - 1}
                              x2={act.end.x + 3}
                              y2={act.end.y + 1}
                              stroke="#fbbf24"
                              strokeWidth="2.5"
                            />
                            {act.label && (
                              <text
                                x={act.end.x}
                                y={act.end.y - 3}
                                fontSize="2.8"
                                fill="#fbbf24"
                                fontFamily="JetBrains Mono"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {act.label}
                              </text>
                            )}
                          </g>
                        );
                      }
                      if (act.type === 'dribble') {
                        return (
                          <g key={act.id}>
                            <line
                              x1={act.start.x}
                              y1={act.start.y}
                              x2={act.end.x}
                              y2={act.end.y}
                              stroke="#06b6d4"
                              strokeWidth="2"
                              strokeDasharray="1.5 1.5"
                              markerEnd="url(#arrow-dribble)"
                            />
                          </g>
                        );
                      }
                      return null;
                    })}

                    {/* Player Nodes */}
                    {activePlay.nodes.map((node) => (
                      <g key={node.id} className="cursor-pointer">
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="4.2"
                          fill={node.isOffense ? '#ea580c' : '#0284c7'}
                          stroke="#ffffff"
                          strokeWidth="1"
                          className="shadow-lg"
                        />
                        <text
                          x={node.x}
                          y={node.y + 1.2}
                          fontSize="3.2"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontFamily="JetBrains Mono"
                        >
                          {node.number !== undefined ? node.number : node.label[0]}
                        </text>
                        <text
                          x={node.x}
                          y={node.y + 7.5}
                          fontSize="2.4"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill="#cbd5e1"
                        >
                          {node.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              )}
            </div>

            {/* Compliance Logs & Coach Directive Analysis Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Match Execution Breakdown & Vision Logs ({activePlay.complianceLogs.length})
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {activePlay.complianceLogs.filter(l => l.coachDirectiveFollowed).length} Complied • {activePlay.complianceLogs.filter(l => !l.coachDirectiveFollowed).length} Breakdown Errors
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {activePlay.complianceLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                      log.coachDirectiveFollowed
                        ? 'bg-slate-950 border-emerald-500/30 text-slate-200'
                        : 'bg-rose-950/20 border-rose-500/40 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5">
                      {log.coachDirectiveFollowed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{log.gameClock}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono ${
                            log.coachDirectiveFollowed 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {log.coachDirectiveFollowed ? 'DIRECTIVE FOLLOWED' : 'DIRECTIVE BROKEN'}
                          </span>
                          {log.pointsScored > 0 && (
                            <span className="text-emerald-400 font-mono font-bold text-[11px]">
                              +{log.pointsScored} PTS
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">
                          {log.notes}
                        </p>
                      </div>
                    </div>

                    {onPlayTacticalTimestamp && (
                      <button
                        onClick={() => onPlayTacticalTimestamp(log.timestampSec)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-orange-500 text-white transition-colors flex-shrink-0"
                        title="Jump to video moment"
                      >
                        <Play className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Tactics Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{t.resetModalTitle}</h3>
                  <p className="text-xs text-slate-400">Scegli la modalità di ripristino per il tracciamento tattico</p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Reset Match Stats Only */}
              <label
                onClick={() => setResetSelection('match')}
                className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                  resetSelection === 'match'
                    ? 'bg-orange-500/10 border-orange-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="resetOption"
                  checked={resetSelection === 'match'}
                  onChange={() => setResetSelection('match')}
                  className="mt-1 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900"
                />
                <div className="ml-3 space-y-1">
                  <span className="font-bold text-sm text-white block">{t.resetMatchStatsOption}</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.resetMatchStatsDesc} Mantiene tutti gli schemi disegnati e le direttive del coach, azzerando solo i contatori di partita per iniziare una nuova rilevazione.
                  </p>
                </div>
              </label>

              {/* Option 2: Reset to Defaults */}
              <label
                onClick={() => setResetSelection('defaults')}
                className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                  resetSelection === 'defaults'
                    ? 'bg-rose-500/10 border-rose-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="resetOption"
                  checked={resetSelection === 'defaults'}
                  onChange={() => setResetSelection('defaults')}
                  className="mt-1 text-rose-500 focus:ring-rose-500 focus:ring-offset-slate-900"
                />
                <div className="ml-3 space-y-1">
                  <span className="font-bold text-sm text-white block">{t.resetToDefaultOption}</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.resetToDefaultDesc}
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {t.cancelBtn}
              </button>
              <button
                onClick={handleExecuteReset}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all active:scale-95 flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.confirmResetBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload Whiteboard / Tactical Diagram Explanation & File Picker */}
      {isWhiteboardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {t.uploadTacticalDiagramBtn || 'Carica Foto Lavagnetta o Diagramma Tattico'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Schema attivo: <span className="text-orange-400 font-semibold">{activePlay.title}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsWhiteboardModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Explanatory Banner: What is this feature and what can you upload? */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Cosa puoi caricare in questa sezione?</span>
              </div>
              <ul className="text-slate-300 space-y-1.5 text-[11px] list-disc list-inside leading-relaxed">
                <li>
                  <strong className="text-white">Foto della Lavagnetta di Spogliatoio:</strong> scattata con lo smartphone prima della partita o durante l'intervallo con le consegne ai giocatori.
                </li>
                <li>
                  <strong className="text-white">Diagrammi Digitali (FastModel, PDF, PNG):</strong> schemi grafici ufficiali del playbook societario.
                </li>
                <li>
                  <strong className="text-white">Disegni Tattici / Appunti del Coach:</strong> visualizza il diagramma a fianco del Vector Board per verificare se i giocatori hanno rispettato il timing e le posizioni disegnate.
                </li>
              </ul>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div className="bg-slate-950 p-6 rounded-2xl border-2 border-dashed border-slate-800 hover:border-orange-500/50 transition-colors text-center space-y-3">
              <Upload className="w-8 h-8 text-orange-400 mx-auto" />
              <div>
                <div className="text-xs font-semibold text-white">Carica immagine (PNG, JPG, WEBP)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Trascina qui l'immagine della lavagna o seleziona dal dispositivo</div>
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleDiagramUpload(e);
                  setIsWhiteboardModalOpen(false);
                }}
                className="hidden"
                id="whiteboard-upload-file"
              />
              <label
                htmlFor="whiteboard-upload-file"
                className="inline-block px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold cursor-pointer shadow-md shadow-orange-500/20 active:scale-95 transition-all"
              >
                Sfoglia Immagine Lavagna
              </label>
            </div>

            {/* Quick Sample Diagrams */}
            <div>
              <div className="text-[11px] text-slate-400 font-semibold mb-2">Oppure scegli uno schema grafico di esempio:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const updated = { 
                      ...activePlay, 
                      diagramImageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80' 
                    };
                    setPlays((prev) => prev.map((p) => (p.id === activePlay.id ? updated : p)));
                    setTacticalViewMode('diagram');
                    setIsWhiteboardModalOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left hover:border-orange-500 transition-all"
                >
                  <div className="font-bold text-white text-xs">Foto Lavagnetta Coach</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Schema manuale con pennarello</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const updated = { 
                      ...activePlay, 
                      diagramImageUrl: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&auto=format&fit=crop&q=80' 
                    };
                    setPlays((prev) => prev.map((p) => (p.id === activePlay.id ? updated : p)));
                    setTacticalViewMode('diagram');
                    setIsWhiteboardModalOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left hover:border-orange-500 transition-all"
                >
                  <div className="font-bold text-white text-xs">Playbook Veltro Vector</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Diagramma vettoriale 5-Out</div>
                </button>
              </div>
            </div>

            {/* Current Diagram Preview & Remove */}
            {activePlay.diagramImageUrl && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-semibold">✓ Immagine diagramma attualmente associata</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...activePlay, diagramImageUrl: undefined };
                    setPlays((prev) => prev.map((p) => (p.id === activePlay.id ? updated : p)));
                    setTacticalViewMode('board');
                    setIsWhiteboardModalOpen(false);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Rimuovi Immagine
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
