export type SupportedLanguage = 'en' | 'it' | 'de' | 'fr' | 'es';

export interface TranslationDictionary {
  // Navigation & App Brand
  appName: string;
  appSubtitle: string;
  appVersion: string;
  navGroupTeam: string;
  navGroupMatch: string;
  navGroupReports: string;
  navSquadSection: string;
  navMatchSection: string;
  navReportsSection: string;
  navSetup: string;
  navPlaybook: string;
  navVideo: string;
  navShotChart: string;
  navBoxScore: string;
  navTactics: string;
  navHighlights: string;
  navSeason: string;
  navAICoach: string;
  navRoboflow: string;
  storageTitle: string;
  storageUsage: string;

  // Header & Controls
  uploadVideoBtn: string;
  shareBtn: string;
  shareCopied: string;
  exportPdfBtn: string;
  saveBtn: string;
  savedBtn: string;
  cancelBtn: string;
  closeBtn: string;
  possessionLabel: string;
  vsLabel: string;

  // Setup Page
  setupHeaderTitle: string;
  setupHeaderBadge: string;
  setupHeaderDesc: string;
  languageSelectLabel: string;
  languageSelectDesc: string;
  myTeamCardTitle: string;
  oppTeamCardTitle: string;
  homeGameBtn: string;
  awayGameBtn: string;
  teamNameLabel: string;
  teamShortLabel: string;
  uploadLogoLabel: string;
  uploadLogoBtn: string;
  removeLogoBtn: string;
  uploadLogoHint: string;
  teamColorLabel: string;
  jerseyPreviewTitle: string;
  rosterTableTitle: string;
  rosterTableDesc: string;
  addPlayerTitle: string;
  playerNamePlaceholder: string;
  playerNumberLabel: string;
  playerPositionLabel: string;
  isStarterLabel: string;
  addPlayerBtn: string;
  saveRosterBtn: string;
  encounteredTeamsLabel: string;
  selectEncounteredTeamPlaceholder: string;
  saveCurrentTeamBtn: string;

  // Playbook & Tactics
  playbookHeaderTitle: string;
  playbookBadge: string;
  playbookHeaderBadge: string;
  playbookHeaderDesc: string;
  registeredPlaysCard: string;
  totalExecutionsCard: string;
  complianceRateCard: string;
  pointsFromPlaysCard: string;
  registeredPlaysLabel: string;
  totalExecutionsLabel: string;
  complianceRateLabel: string;
  pointsGeneratedLabel: string;
  createNewPlayBtn: string;
  createPlayBtn: string;
  newPlayModalTitle: string;
  allCategories: string;
  offensiveCategory: string;
  defensiveCategory: string;
  playTitleLabel: string;
  playTypeLabel: string;
  targetExecutionsLabel: string;
  coachDirectiveLabel: string;
  uploadTacticalDiagramBtn: string;
  playTypeAll: string;
  playTypeOffense: string;
  playTypeDefense: string;
  coachDirectiveTitle: string;
  tacticalBoardTitle: string;
  uploadDiagramLabel: string;
  uploadDiagramBtn: string;
  drawingModeLabel: string;
  drawPass: string;
  drawCut: string;
  drawScreen: string;
  drawDribble: string;
  clearDrawings: string;
  executionLogsTitle: string;
  logCorrectExecutionBtn: string;
  logMistakeExecutionBtn: string;
  directiveFollowedBadge: string;
  directiveMistakeBadge: string;
  archivedPlaysFromMVP: string;
  resetPlaybookBtn: string;
  resetModalTitle: string;
  resetMatchStatsOption: string;
  resetMatchStatsDesc: string;
  resetToDefaultOption: string;
  resetToDefaultDesc: string;
  confirmResetBtn: string;
  tacticsSplitTeamHome: string;
  tacticsSplitTeamAway: string;
  tacticsMostUsedTab: string;
  tacticsMostEffectiveTab: string;
  coachAdjustmentsTitle: string;
  coachAdjustmentsDesc: string;

  // Playbook Whiteboard / Diagram Modal
  uploadDiagramModalTitle: string;
  uploadDiagramModalDesc: string;
  whatCanIUploadTitle: string;
  whatCanIUploadDesc: string;
  viewVelcroBoard: string;
  viewDiagramImage: string;
  uploadWhiteboardBtn: string;
  chooseDiagramFile: string;
  replaceDiagram: string;
  removeDiagram: string;
  sampleDiagramPresets: string;

  // Shot Chart
  shotChartHeaderTitle: string;
  shotChartHeaderDesc: string;
  viewScatterDots: string;
  viewHeatmap: string;
  filterTeam: string;
  filterPlayer: string;
  filterOutcome: string;
  filterShotType: string;
  filterQuarter: string;
  resetFilters: string;
  allTeams: string;
  allPlayers: string;
  allOutcomes: string;
  madeOnly: string;
  missedOnly: string;
  allDistances: string;
  allQuarters: string;
  madeCountLabel: string;
  missedCountLabel: string;
  fgPctLabel: string;
  paintZoneLabel: string;
  midRangeZoneLabel: string;
  corner3ZoneLabel: string;
  shotActionsListTitle: string;
  clickToPlayVideo: string;

  // Video & Vision Workflow
  uploadModalTitle: string;
  uploadModalDesc: string;
  tabSampleGames: string;
  tabLocalFile: string;
  tabYouTube: string;
  tabTwitch: string;
  step1VideoTitle: string;
  step2SetupTitle: string;
  step2SetupDesc: string;
  competitionNameLabel: string;
  matchDateLabel: string;
  proceedToSetupBtn: string;
  backToVideoSourceBtn: string;
  launchVisionAnalysisBtn: string;
  processingVisionPipeline: string;
  stepExtraction: string;
  stepYoloDetection: string;
  stepTrackingHomography: string;
  stepStatsTactics: string;
  stepCompleteReady: string;

  // PDF Export Translations
  pdfExportModalTitle: string;
  pdfExportModalDesc: string;
  pdfExportQuickTab: string;
  pdfExportFullTab: string;
  pdfDownloadBtn: string;
  pdfGenerating: string;
  pdfSectionTeamComparison: string;
  pdfPossessionPct: string;
  pdfPassesCompleted: string;
  pdfPassingAccuracy: string;
  pdfTurnoversSteals: string;
  pdfReboundsOffDef: string;
  pdfSectionShooting: string;
  pdfTwoPoint: string;
  pdfThreePoint: string;
  pdfFreeThrows: string;
  pdfSectionBoxScore: string;
  pdfAllRosters: string;
  pdfTopPerformers: string;
  pdfSectionTactics: string;
  pdfTacticalNotes: string;
  pdfGeneratedBy: string;
  pdfFinalScore: string;
  pdfDate: string;
  pdfCompetition: string;
  pdfPlayer: string;
  pdfExecutedTimes: string;
  pdfTimes: string;
  pdfSuccess: string;

  // AI Coach
  aiCoachTitle: string;
  aiCoachSubtitle: string;
  aiCoachGreeting: string;
  aiCoachInputPlaceholder: string;
  aiCoachSendBtn: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: 'SwagIQ',
    appSubtitle: 'COMPUTER VISION AI',
    appVersion: 'SwagIQ v0.1',
    navGroupTeam: 'Team & Settings',
    navGroupMatch: 'Match Analysis',
    navGroupReports: 'Reports & AI Coach',
    navSquadSection: 'Team & Settings',
    navMatchSection: 'Match Analysis',
    navReportsSection: 'Reports & AI Coach',
    navSetup: 'Team Setup & Roster',
    navPlaybook: 'Playbook & Coach Directives',
    navVideo: 'Video & Vision AI',
    navShotChart: 'Shot Chart',
    navBoxScore: 'Box Score',
    navTactics: 'Tactical',
    navHighlights: 'Team Highlights',
    navSeason: 'Season Progress',
    navAICoach: 'Tactical Assistant',
    navRoboflow: 'Roboflow Pipeline',
    storageTitle: 'Storage & Model Cache',
    storageUsage: '7.4GB of 10GB used',

    uploadVideoBtn: 'Upload Video',
    shareBtn: 'Share',
    shareCopied: 'Copied!',
    exportPdfBtn: 'Export PDF',
    saveBtn: 'Save Settings',
    savedBtn: 'Saved!',
    cancelBtn: 'Cancel',
    closeBtn: 'Close',
    possessionLabel: 'Poss',
    vsLabel: 'vs',

    setupHeaderTitle: 'Team Setup, Match & Roster',
    setupHeaderBadge: 'Live Data Sync',
    setupHeaderDesc: 'Upload team logos, set jersey colors, toggle language, select encountered teams from the dropdown, and edit player names/numbers.',
    languageSelectLabel: 'Interface Language',
    languageSelectDesc: 'Select your preferred language (English, Italian, German, French, Spanish).',
    myTeamCardTitle: 'My Team Identity',
    oppTeamCardTitle: 'Opponent Team',
    homeGameBtn: 'Home Game',
    awayGameBtn: 'Away Game',
    teamNameLabel: 'Team Full Name',
    teamShortLabel: 'Short Code (3 Letters)',
    uploadLogoLabel: 'Upload Team Logo',
    uploadLogoBtn: 'Choose Logo File',
    removeLogoBtn: 'Remove Logo',
    uploadLogoHint: 'Accepts PNG, JPG, WEBP or SVG. Transparent background recommended.',
    teamColorLabel: 'Primary Jersey Color',
    jerseyPreviewTitle: 'Official Jersey Preview',
    rosterTableTitle: 'Active Player Roster',
    rosterTableDesc: 'Assign names, jersey numbers (#) and roles. Changes immediately synchronize with Box Score, Shot Chart and Video Tracking.',
    addPlayerTitle: 'Add New Player',
    playerNamePlaceholder: 'e.g. Jayson Tatum',
    playerNumberLabel: 'Jersey #',
    playerPositionLabel: 'Position',
    isStarterLabel: 'Starter (5)',
    addPlayerBtn: 'Add to Roster',
    saveRosterBtn: 'Save Roster',
    encounteredTeamsLabel: 'Saved & Encountered Teams Archive',
    selectEncounteredTeamPlaceholder: 'Select from saved teams...',
    saveCurrentTeamBtn: 'Save to Preset',

    playbookHeaderTitle: 'Custom Playbook & Coach Directives',
    playbookBadge: 'Vision Compliance Tracker',
    playbookHeaderBadge: 'Vision Compliance Tracker',
    playbookHeaderDesc: 'Draw custom plays, upload coach whiteboard diagrams, set strategic directives, and track player execution compliance with computer vision.',
    registeredPlaysCard: 'REGISTERED PLAYS',
    totalExecutionsCard: 'TOTAL EXECUTIONS',
    complianceRateCard: 'COACH COMPLIANCE RATE',
    pointsFromPlaysCard: 'POINTS GENERATED',
    registeredPlaysLabel: 'REGISTERED PLAYS',
    totalExecutionsLabel: 'TOTAL EXECUTIONS',
    complianceRateLabel: 'COACH COMPLIANCE RATE',
    pointsGeneratedLabel: 'POINTS GENERATED',
    createNewPlayBtn: 'Create New Play',
    createPlayBtn: 'Create New Play',
    newPlayModalTitle: 'New Custom Tactical Play',
    allCategories: 'All Plays',
    offensiveCategory: 'Offense',
    defensiveCategory: 'Defense',
    playTitleLabel: 'Play Name',
    playTypeLabel: 'Play Type',
    targetExecutionsLabel: 'Target Executions / Match',
    coachDirectiveLabel: 'Coach Key Directive (Player Instructions)',
    uploadTacticalDiagramBtn: 'Upload Tactical Diagram / Board Photo',
    playTypeAll: 'All Plays',
    playTypeOffense: 'Offense',
    playTypeDefense: 'Defense',
    coachDirectiveTitle: 'COACH OFFICIAL DIRECTIVE',
    tacticalBoardTitle: '2D Tactical Board & Movement Vectors',
    uploadDiagramLabel: 'Upload Tactical Diagram / Whiteboard Photo',
    uploadDiagramBtn: 'Upload Diagram Image',
    drawingModeLabel: 'Interactive Drawing Tools',
    drawPass: 'Pass (Green Dashed)',
    drawCut: 'Cut / Drive (Orange Arrow)',
    drawScreen: 'Screen (Yellow T-Bar)',
    drawDribble: 'Dribble (Cyan Vector)',
    clearDrawings: 'Reset Board',
    executionLogsTitle: 'Match Actions Log & Directive Analysis',
    logCorrectExecutionBtn: '+1 Correct Execution',
    logMistakeExecutionBtn: '+1 Directive Error',
    directiveFollowedBadge: 'DIRECTIVE FOLLOWED',
    directiveMistakeBadge: 'DIRECTIVE BROKEN',
    archivedPlaysFromMVP: 'Basketball Tactical Schemes Archive (MVP Sport Academy Guide)',
    resetPlaybookBtn: 'Reset Tactics',
    resetModalTitle: 'Reset Tactical Compliance & Plays',
    resetMatchStatsOption: 'Reset Current Match Logs & Compliance',
    resetMatchStatsDesc: 'Clears executions, points, and logs to 0 to start tracking compliance fresh for a new match.',
    resetToDefaultOption: 'Restore Default Academy Playbook',
    resetToDefaultDesc: 'Resets all schemes, diagrams, and logs back to initial preloaded default plays.',
    confirmResetBtn: 'Confirm Reset',
    tacticsSplitTeamHome: 'Home Team Tactics',
    tacticsSplitTeamAway: 'Away Team Tactics',
    tacticsMostUsedTab: 'Most Used Sets',
    tacticsMostEffectiveTab: 'Most Effective (Top PPP)',
    coachAdjustmentsTitle: 'Live Coach In-Game Adjustments & Tactical Advisory',
    coachAdjustmentsDesc: 'Real-time strategic adjustments detected from match stats and opponent defensive tendencies.',

    uploadDiagramModalTitle: 'Upload Tactical Whiteboard Photo or Play Diagram',
    uploadDiagramModalDesc: 'Upload a photo of your locker room whiteboard, a FastModel scheme, or a tactical drawing to compare coach directives against live Vision AI tracking.',
    whatCanIUploadTitle: 'What can you upload?',
    whatCanIUploadDesc: '• Locker room whiteboard photo taken on phone (JPG, PNG)\n• Playbook diagrams from PDF, FastModel, or drawing apps\n• Hand-drawn tactical sketches and screenshots',
    viewVelcroBoard: '2D Magnet Board',
    viewDiagramImage: 'Whiteboard / Diagram Image',
    uploadWhiteboardBtn: 'Upload Whiteboard Photo',
    chooseDiagramFile: 'Select Diagram Image',
    replaceDiagram: 'Replace Image',
    removeDiagram: 'Remove Diagram',
    sampleDiagramPresets: 'Or select a tactical preset diagram:',

    shotChartHeaderTitle: 'Official 2D Basketball Shot Chart',
    shotChartHeaderDesc: 'Green marks = Made baskets • Red marks = Missed shots. Review zone accuracy and official shot events list.',
    viewScatterDots: 'Shot Points (Scatter)',
    viewHeatmap: 'Zones & Heatmap',
    filterTeam: 'Team',
    filterPlayer: 'Single Player',
    filterOutcome: 'Shot Outcome',
    filterShotType: 'Shot Distance / Type',
    filterQuarter: 'Quarter / Period',
    resetFilters: 'Reset Filters',
    allTeams: 'All Teams',
    allPlayers: 'All Players',
    allOutcomes: 'All Outcomes',
    madeOnly: '🟢 Made Only (Green)',
    missedOnly: '🔴 Missed Only (Red)',
    allDistances: 'All Distances',
    allQuarters: 'All Quarters',
    madeCountLabel: 'Made',
    missedCountLabel: 'Missed',
    fgPctLabel: 'Field Goal %',
    paintZoneLabel: 'Paint / Restricted Area',
    midRangeZoneLabel: 'Mid-Range / Elbows',
    corner3ZoneLabel: 'Corner 3-Pointers',
    shotActionsListTitle: 'Shot Actions Breakdown',
    clickToPlayVideo: 'Click to watch video clip',

    uploadModalTitle: 'Import & Ingest Match Video into SwagIQ',
    uploadModalDesc: 'Load MP4/MOV video files, YouTube links, Twitch streams, or select pre-analyzed showcase games.',
    tabSampleGames: 'Sample Matches',
    tabLocalFile: 'Local File (MP4/MOV)',
    tabYouTube: 'YouTube Link',
    tabTwitch: 'Twitch Stream',
    step1VideoTitle: 'Step 1: Choose Video Source',
    step2SetupTitle: 'Step 2: Mandatory Teams & Roster Calibration',
    step2SetupDesc: 'Configure Home and Away teams, jersey colors, and player rosters so the Computer Vision engine attributes tracking tags, box score stats, and shot events correctly.',
    competitionNameLabel: 'Competition / League Name',
    matchDateLabel: 'Match Date',
    proceedToSetupBtn: 'Next: Setup Teams & Rosters',
    backToVideoSourceBtn: 'Back to Video Selection',
    launchVisionAnalysisBtn: 'Launch Vision AI & Generate Stats',
    processingVisionPipeline: 'Processing SwagIQ Computer Vision AI Pipeline...',
    stepExtraction: '1/5: Video frame decoding & temporal synchronization...',
    stepYoloDetection: '2/5: SwagIQ Roboflow YOLOv11 & SAM 3 Object Detection...',
    stepTrackingHomography: '3/5: ByteTrack jersey number attribution & 2D Court Homography...',
    stepStatsTactics: '4/5: Calculating Box Score, Shot Chart & Playbook adherence...',
    stepCompleteReady: '5/5: Analysis complete! Opening match dashboard...',

    pdfExportModalTitle: 'Export Official Scouting Report (PDF)',
    pdfExportModalDesc: 'Choose export format: Quick Executive Summary or Comprehensive Full Statistical Dossier.',
    pdfExportQuickTab: 'Quick Export (Executive Summary)',
    pdfExportFullTab: 'Full Export (All Computed Statistics)',
    pdfDownloadBtn: 'Download PDF Report',
    pdfGenerating: 'Generating PDF...',
    pdfSectionTeamComparison: '1. Official Team Statistical Comparison',
    pdfPossessionPct: 'Possession %',
    pdfPassesCompleted: 'Passes Completed',
    pdfPassingAccuracy: 'acc.',
    pdfTurnoversSteals: 'Turnovers / Steals',
    pdfReboundsOffDef: 'Rebounds (OFF/DEF)',
    pdfSectionShooting: '2. Shooting Efficiency (FG / 3PT / FT)',
    pdfTwoPoint: '2-Point Field Goals (2PT)',
    pdfThreePoint: '3-Point Field Goals (3PT)',
    pdfFreeThrows: 'Free Throws (FT)',
    pdfSectionBoxScore: '3. Player Box Score',
    pdfAllRosters: '(All Rosters)',
    pdfTopPerformers: '(Top Performers)',
    pdfSectionTactics: '4. Detected Tactical Schemes & Directives',
    pdfTacticalNotes: 'SwagIQ Computer Vision & SAM 3 Tactical Notes:',
    pdfGeneratedBy: 'Generated by SwagIQ Basketball Analytics Engine',
    pdfFinalScore: 'Final Score',
    pdfDate: 'Date',
    pdfCompetition: 'Competition',
    pdfPlayer: 'Player',
    pdfExecutedTimes: 'Executed',
    pdfTimes: 'times',
    pdfSuccess: 'Success',

    aiCoachTitle: 'Tactical AI Assistant',
    aiCoachSubtitle: 'Powered by Gemini 2.5 Computer Vision & Scouting',
    aiCoachGreeting: "I am your Tactical Assistant. How can I help you today with team preparation, tactical scouting, or player analysis?",
    aiCoachInputPlaceholder: 'Ask a tactical scouting question or strategic recommendation...',
    aiCoachSendBtn: 'Send Request'
  },
  it: {
    appName: 'SwagIQ',
    appSubtitle: 'COMPUTER VISION AI',
    appVersion: 'SwagIQ v0.1',
    navGroupTeam: 'Squadra & Config',
    navGroupMatch: 'Analisi Partita',
    navGroupReports: 'Report & AI Coach',
    navSquadSection: 'Squadra & Config',
    navMatchSection: 'Analisi Partita',
    navReportsSection: 'Report & AI Coach',
    navSetup: 'Setup Squadra & Roster',
    navPlaybook: 'Schemi & Direttive Coach',
    navVideo: 'Video & Vision AI',
    navShotChart: 'Shot Chart',
    navBoxScore: 'Tabellino',
    navTactics: 'Analisi Tattica',
    navHighlights: 'Highlights Squadra',
    navSeason: 'Progressi Stagionali',
    navAICoach: 'Assistente Tattico',
    navRoboflow: 'Roboflow Pipeline',
    storageTitle: 'Memoria & Cache Modelli',
    storageUsage: '7.4GB di 10GB usati',

    uploadVideoBtn: 'Carica Video',
    shareBtn: 'Condividi',
    shareCopied: 'Copiato!',
    exportPdfBtn: 'Esporta PDF',
    saveBtn: 'Salva & Applica',
    savedBtn: 'Salvato!',
    cancelBtn: 'Annulla',
    closeBtn: 'Chiudi',
    possessionLabel: 'Poss',
    vsLabel: 'vs',

    setupHeaderTitle: 'Setup Squadra, Partita & Roster',
    setupHeaderBadge: 'Sincronizzazione Dati Live',
    setupHeaderDesc: 'Carica i loghi societari, imposta i colori di maglia, seleziona le squadre affrontate e gestisci i giocatori a referto.',
    languageSelectLabel: 'Lingua Interfaccia',
    languageSelectDesc: 'Seleziona la lingua di visualizzazione dell\'intera piattaforma.',
    myTeamCardTitle: 'Identità Mia Squadra',
    oppTeamCardTitle: 'Squadra Avversaria',
    homeGameBtn: 'Partita in Casa',
    awayGameBtn: 'Partita Fuori Casa',
    teamNameLabel: 'Nome Completo Squadra',
    teamShortLabel: 'Sigla Squadra (3 Lettere)',
    uploadLogoLabel: 'Carica Logo Squadra',
    uploadLogoBtn: 'Carica File Logo',
    removeLogoBtn: 'Rimuovi Logo',
    uploadLogoHint: 'Supporta PNG, JPG, WEBP o SVG. Consigliato sfondo trasparente.',
    teamColorLabel: 'Colore Maglia Principale',
    jerseyPreviewTitle: 'Anteprima Divisa Ufficiale',
    rosterTableTitle: 'Roster Giocatori a Referto',
    rosterTableDesc: 'Definisci nomi, numeri di maglia (#) e quintetto base. Le modifiche si sincronizzano con Tabellino, Mappa Tiri e Tracking Video.',
    addPlayerTitle: 'Aggiungi Nuovo Giocatore',
    playerNamePlaceholder: 'es. Marco Belinelli',
    playerNumberLabel: 'N° Maglia',
    playerPositionLabel: 'Ruolo',
    isStarterLabel: 'Titolare (5 Base)',
    addPlayerBtn: 'Aggiungi a Referto',
    saveRosterBtn: 'Salva Modifiche Roster',
    encounteredTeamsLabel: 'Archivio Squadre Salvate & Incontrate',
    selectEncounteredTeamPlaceholder: 'Seleziona da squadre salvate...',
    saveCurrentTeamBtn: 'Salva Squadra nei Preset',

    playbookHeaderTitle: 'Schemi & Direttive Coach',
    playbookBadge: 'Tracciamento Aderenza Vision AI',
    playbookHeaderBadge: 'Tracciamento Aderenza Vision AI',
    playbookHeaderDesc: 'Disegna schemi personalizzati, carica foto della lavagnetta tattica, imposta direttive e misura l\'aderenza dei giocatori tramite Computer Vision.',
    registeredPlaysCard: 'SCHEMI A REGISTRO',
    totalExecutionsCard: 'ESECUZIONI TOTALI',
    complianceRateCard: '% ADERENZA COACH',
    pointsFromPlaysCard: 'PUNTI DA SCHEMI',
    registeredPlaysLabel: 'SCHEMI A REGISTRO',
    totalExecutionsLabel: 'ESECUZIONI TOTALI',
    complianceRateLabel: '% ADERENZA COACH',
    pointsGeneratedLabel: 'PUNTI GENERATI',
    createNewPlayBtn: 'Crea Nuovo Schema',
    createPlayBtn: 'Crea Nuovo Schema',
    newPlayModalTitle: 'Nuovo Schema Tattico Personalizzato',
    allCategories: 'Tutti gli Schemi',
    offensiveCategory: 'Attacco',
    defensiveCategory: 'Difesa',
    playTitleLabel: 'Nome Schema',
    playTypeLabel: 'Tipologia Schema',
    targetExecutionsLabel: 'Target Esecuzioni / Partita',
    coachDirectiveLabel: 'Direttiva Chiave del Coach (Istruzioni ai Giocatori)',
    uploadTacticalDiagramBtn: 'Carica Foto Lavagna / Diagramma Tattico',
    playTypeAll: 'Tutti gli Schemi',
    playTypeOffense: 'Attacco',
    playTypeDefense: 'Difesa',
    coachDirectiveTitle: 'DIRETTIVA UFFICIALE DEL COACH',
    tacticalBoardTitle: 'Lavagna Tattica 2D & Vettori di Movimento',
    uploadDiagramLabel: 'Carica Foto Lavagnetta o Diagramma FastModel',
    uploadDiagramBtn: 'Carica Immagine Schema',
    drawingModeLabel: 'Strumenti di Disegno Interattivo',
    drawPass: 'Passaggio (Tratteggio Verde)',
    drawCut: 'Taglio / Penetrazione (Freccia Arancione)',
    drawScreen: 'Blocco (Barra a T Gialla)',
    drawDribble: 'Palleggio (Vettore Azzurro)',
    clearDrawings: 'Pulisci Lavagna',
    executionLogsTitle: 'Registro Azioni Partita & Rispetto Direttive',
    logCorrectExecutionBtn: '+1 Esecuzione Conforme',
    logMistakeExecutionBtn: '+1 Errore Direttiva',
    directiveFollowedBadge: 'DIRETTIVA RISPETTATA',
    directiveMistakeBadge: 'DIRETTIVA DISATTESA',
    archivedPlaysFromMVP: 'Archivio Schemi Tattici Basket (Guida MVP Sport Academy)',
    resetPlaybookBtn: 'Reset Tattiche',
    resetModalTitle: 'Reset Tattiche e Aderenza',
    resetMatchStatsOption: 'Azzera solo tracking partita corrente',
    resetMatchStatsDesc: 'Reimposta a 0 esecuzioni, punti e log per iniziare una nuova rilevazione durante la gara.',
    resetToDefaultOption: 'Ripristina schemi standard MVP Academy',
    resetToDefaultDesc: 'Ricarica il playbook iniziale predefinito cancellando le modifiche e i log attuali.',
    confirmResetBtn: 'Conferma Reset',
    tacticsSplitTeamHome: 'Tattica Squadra di Casa',
    tacticsSplitTeamAway: 'Tattica Squadra Ospite',
    tacticsMostUsedTab: 'Più Usate (Frequenza %)',
    tacticsMostEffectiveTab: 'Più Efficaci (Punti per Possesso - Top PPP)',
    coachAdjustmentsTitle: 'Suggerimenti Tattici Live per il Coach',
    coachAdjustmentsDesc: 'Adattamenti strategici rilevati in tempo reale in base alle percentuali e alle tendenze avversarie.',

    uploadDiagramModalTitle: 'Carica Foto Lavagna o Diagramma Tattico',
    uploadDiagramModalDesc: 'Carica una foto della lavagna scattata nello spogliatoio, un diagramma FastModel o uno screenshot digitale per confrontare lo schema del coach con l\'esecuzione sul campo.',
    whatCanIUploadTitle: 'Cosa puoi caricare?',
    whatCanIUploadDesc: '• Foto scattata alla lavagnetta dello spogliatoio (JPG, PNG)\n• Diagrammi estratti da playbook digitali/FastModel\n• Disegni o screenshot di schemi',
    viewVelcroBoard: 'Lavagna Magneti 2D',
    viewDiagramImage: 'Foto Lavagnetta / Diagramma',
    uploadWhiteboardBtn: 'Carica Foto Lavagna',
    chooseDiagramFile: 'Seleziona File Immagine',
    replaceDiagram: 'Sostituisci Immagine',
    removeDiagram: 'Rimuovi Immagine',
    sampleDiagramPresets: 'Oppure scegli uno schema preimpostato:',

    shotChartHeaderTitle: 'Mappa di Tiro Ufficiale 2D (Shot Chart)',
    shotChartHeaderDesc: 'Punti verdi = Canestri segnati • Punti rossi = Tiri sbagliati. Esamina l\'efficacia per zona e l\'elenco azioni.',
    viewScatterDots: 'Punti di Tiro (Scatter)',
    viewHeatmap: 'Zone & Heatmap',
    filterTeam: 'Squadra',
    filterPlayer: 'Singolo Giocatore',
    filterOutcome: 'Esito Tiro',
    filterShotType: 'Distanza / Tipologia',
    filterQuarter: 'Quarto / Periodo',
    resetFilters: 'Resetta Filtri',
    allTeams: 'Tutte le Squadre',
    allPlayers: 'Tutti i Giocatori',
    allOutcomes: 'Tutti gli Esiti',
    madeOnly: '🟢 Solo Segnati (Verdi)',
    missedOnly: '🔴 Solo Sbagliati (Rossi)',
    allDistances: 'Tutte le distanze',
    allQuarters: 'Tutti i Quarti',
    madeCountLabel: 'Segnati',
    missedCountLabel: 'Sbagliati',
    fgPctLabel: '% dal Campo',
    paintZoneLabel: 'Area Pitturata / Ferro',
    midRangeZoneLabel: 'Media Distanza & Gomiti',
    corner3ZoneLabel: 'Triple dagli Angoli',
    shotActionsListTitle: 'Elenco Azioni di Tiro',
    clickToPlayVideo: 'Clicca per riprodurre la clip video',

    uploadModalTitle: 'Carica o Importa Partita nel Motore SwagIQ',
    uploadModalDesc: 'Elabora video MP4/MOV locali, link YouTube, stream Twitch o seleziona una partita dimostrativa.',
    tabSampleGames: 'Partite Esempio',
    tabLocalFile: 'File Locale (MP4/MOV)',
    tabYouTube: 'Link YouTube',
    tabTwitch: 'Stream Twitch',
    step1VideoTitle: 'Fase 1: Sorgente Video',
    step2SetupTitle: 'Fase 2: Configurazione Obbligatoria Squadre & Roster',
    step2SetupDesc: 'Imposta le squadre di Casa e Ospite, i colori di maglia e i giocatori a referto per calibrare il tracciamento Vision AI e generare statistiche accurate.',
    competitionNameLabel: 'Nome Competizione / Torneo',
    matchDateLabel: 'Data Gara',
    proceedToSetupBtn: 'Avanti: Configura Squadre & Roster',
    backToVideoSourceBtn: 'Torna alla Selezione Video',
    launchVisionAnalysisBtn: 'Avvia Analisi Vision AI & Genera Dati',
    processingVisionPipeline: 'Elaborazione Pipeline Computer Vision AI SwagIQ...',
    stepExtraction: '1/5: Decodifica frame video e sincronizzazione temporale...',
    stepYoloDetection: '2/5: SwagIQ Roboflow YOLOv11 & SAM 3 Player/Ball Detection...',
    stepTrackingHomography: '3/5: ByteTrack attribuzione numeri di maglia e Omografia campo 2D...',
    stepStatsTactics: '4/5: Calcolo tabellino, mappe di tiro e aderenza schemi...',
    stepCompleteReady: '5/5: Elaborazione completata! Apertura dashboard partita...',

    pdfExportModalTitle: 'Esporta Report Scouting Ufficiale (PDF)',
    pdfExportModalDesc: 'Seleziona la tipologia di esportazione desiderata: sintesi rapida o dossier statistico completo.',
    pdfExportQuickTab: 'Export Rapido (Executive Summary)',
    pdfExportFullTab: 'Export Completo (Tutte le Statistiche Elaborate)',
    pdfDownloadBtn: 'Scarica Dossier PDF',
    pdfGenerating: 'Generazione in corso...',
    pdfSectionTeamComparison: '1. Confronto Statistico di Squadra Ufficiale',
    pdfPossessionPct: 'Possesso Palla %',
    pdfPassesCompleted: 'Passaggi Riusciti',
    pdfPassingAccuracy: 'prec.',
    pdfTurnoversSteals: 'Palle Perse / Rubate',
    pdfReboundsOffDef: 'Rimbalzi (OFF/DIF)',
    pdfSectionShooting: '2. Efficienza al Tiro (FG / 3PT / FT)',
    pdfTwoPoint: 'Tiro da 2 Punti (2PT)',
    pdfThreePoint: 'Tiro da 3 Punti (3PT)',
    pdfFreeThrows: 'Tiri Liberi (FT)',
    pdfSectionBoxScore: '3. Tabellino Giocatori',
    pdfAllRosters: '(Tutti i Roster)',
    pdfTopPerformers: '(Top Performers)',
    pdfSectionTactics: '4. Analisi Schemi Tattici Rilevati',
    pdfTacticalNotes: 'Note Tattiche SwagIQ Computer Vision & SAM 3:',
    pdfGeneratedBy: 'Generato da SwagIQ Basketball Analytics Engine',
    pdfFinalScore: 'Risultato Finale',
    pdfDate: 'Data',
    pdfCompetition: 'Competizione',
    pdfPlayer: 'Giocatore',
    pdfExecutedTimes: 'Eseguito',
    pdfTimes: 'volte',
    pdfSuccess: 'Successo',

    aiCoachTitle: 'Assistente Tattico IA',
    aiCoachSubtitle: 'Potenziato da Gemini 2.5 Computer Vision & Scouting',
    aiCoachGreeting: "Sono il tuo Assistente Tattico. Come posso aiutarti oggi con la preparazione della gara, lo scouting o l'analisi dei giocatori?",
    aiCoachInputPlaceholder: 'Fai una domanda tattica o richiedi un consiglio strategico...',
    aiCoachSendBtn: 'Invia Richiesta'
  },
  de: {
    appName: 'SwagIQ',
    appSubtitle: 'COMPUTER VISION AI',
    appVersion: 'SwagIQ v0.1',
    navGroupTeam: 'Team & Setup',
    navGroupMatch: 'Spielanalyse',
    navGroupReports: 'Berichte & KI-Coach',
    navSquadSection: 'Team & Setup',
    navMatchSection: 'Spielanalyse',
    navReportsSection: 'Berichte & KI-Coach',
    navSetup: 'Team-Setup & Kader',
    navPlaybook: 'Playbook & Richtlinien',
    navVideo: 'Video & Vision AI',
    navShotChart: 'Wurfkarte',
    navBoxScore: 'Boxscore',
    navTactics: 'Taktikanalyse',
    navHighlights: 'Highlights',
    navSeason: 'Saisonfortschritt',
    navAICoach: 'Taktischer Assistent',
    navRoboflow: 'Roboflow Pipeline',
    storageTitle: 'Speicher & Cache',
    storageUsage: '7.4GB von 10GB belegt',

    uploadVideoBtn: 'Video hochladen',
    shareBtn: 'Teilen',
    shareCopied: 'Kopiert!',
    exportPdfBtn: 'PDF exportieren',
    saveBtn: 'Speichern',
    savedBtn: 'Gespeichert!',
    cancelBtn: 'Abbrechen',
    closeBtn: 'Schließen',
    possessionLabel: 'Ballbesitz',
    vsLabel: 'vs',

    setupHeaderTitle: 'Team-Setup, Spiel & Kader',
    setupHeaderBadge: 'Echtzeit-Synchronisierung',
    setupHeaderDesc: 'Laden Sie Vereinslogos hoch, wählen Sie Trikotfarben und verwalten Sie die Spieler im Kader.',
    languageSelectLabel: 'Sprache',
    languageSelectDesc: 'Wählen Sie die bevorzugte Systemsprache.',
    myTeamCardTitle: 'Mein Team',
    oppTeamCardTitle: 'Gegnerisches Team',
    homeGameBtn: 'Heimspiel',
    awayGameBtn: 'Auswärtsspiel',
    teamNameLabel: 'Vollständiger Teamname',
    teamShortLabel: 'Kürzel (3 Buchstaben)',
    uploadLogoLabel: 'Teamlogo hochladen',
    uploadLogoBtn: 'Logo-Datei wählen',
    removeLogoBtn: 'Logo entfernen',
    uploadLogoHint: 'Unterstützt PNG, JPG, WEBP oder SVG.',
    teamColorLabel: 'Haupt-Trikotfarbe',
    jerseyPreviewTitle: 'Trikot-Vorschau',
    rosterTableTitle: 'Aktiver Kader',
    rosterTableDesc: 'Spielernamen, Trikotnummern (#) und Startformation festlegen.',
    addPlayerTitle: 'Neuen Spieler hinzufügen',
    playerNamePlaceholder: 'z.B. Dennis Schröder',
    playerNumberLabel: 'Trikot #',
    playerPositionLabel: 'Position',
    isStarterLabel: 'Starter (5)',
    addPlayerBtn: 'Hinzufügen',
    saveRosterBtn: 'Kader speichern',
    encounteredTeamsLabel: 'Gespeicherte Teams',
    selectEncounteredTeamPlaceholder: 'Team auswählen...',
    saveCurrentTeamBtn: 'In Vorlagen speichern',

    playbookHeaderTitle: 'Playbook & Trainer-Richtlinien',
    playbookBadge: 'Vision AI Compliance Tracker',
    playbookHeaderBadge: 'Vision AI Compliance Tracker',
    playbookHeaderDesc: 'Eigene Spielzüge zeichnen, Taktikboard-Fotos hochladen und Spielereinhaltung tracken.',
    registeredPlaysCard: 'REGISTRIERTE SPIELZÜGE',
    totalExecutionsCard: 'GESAMT-AUSFÜHRUNGEN',
    complianceRateCard: 'TRAINER-EINHALTUNGSQUOTE',
    pointsFromPlaysCard: 'ERZIELTE PUNKTE',
    registeredPlaysLabel: 'REGISTRIERTE SPIELZÜGE',
    totalExecutionsLabel: 'GESAMT-AUSFÜHRUNGEN',
    complianceRateLabel: 'TRAINER-EINHALTUNGSQUOTE',
    pointsGeneratedLabel: 'ERZIELTE PUNKTE',
    createNewPlayBtn: 'Neuen Spielzug erstellen',
    createPlayBtn: 'Neuen Spielzug erstellen',
    newPlayModalTitle: 'Neuer Taktischer Spielzug',
    allCategories: 'Alle Spielzüge',
    offensiveCategory: 'Offensive',
    defensiveCategory: 'Defensive',
    playTitleLabel: 'Name des Spielzugs',
    playTypeLabel: 'Spielzug-Typ',
    targetExecutionsLabel: 'Ziel-Ausführungen / Spiel',
    coachDirectiveLabel: 'Trainer-Schlüsselanweisung',
    uploadTacticalDiagramBtn: 'Taktik-Diagramm / Foto hochladen',
    playTypeAll: 'Alle Spielzüge',
    playTypeOffense: 'Offensive',
    playTypeDefense: 'Defensive',
    coachDirectiveTitle: 'OFFIZIELLE TRAINER-RICHTLINIE',
    tacticalBoardTitle: '2D Taktikboard & Bewegungsvektoren',
    uploadDiagramLabel: 'Taktikboard-Foto hochladen',
    uploadDiagramBtn: 'Bild hochladen',
    drawingModeLabel: 'Interaktive Zeichentools',
    drawPass: 'Pass (Grün gestrichelt)',
    drawCut: 'Cut / Penetration (Orange)',
    drawScreen: 'Block (Gelbes T)',
    drawDribble: 'Dribbling (Cyan)',
    clearDrawings: 'Board zurücksetzen',
    executionLogsTitle: 'Aktionsprotokoll & Richtlinien-Analyse',
    logCorrectExecutionBtn: '+1 Korrekte Ausführung',
    logMistakeExecutionBtn: '+1 Richtlinien-Fehler',
    directiveFollowedBadge: 'RICHTLINIE EINGEHALTEN',
    directiveMistakeBadge: 'RICHTLINIE VERFEHLT',
    archivedPlaysFromMVP: 'Basketball-Taktikarchiv (MVP Sport Academy)',
    resetPlaybookBtn: 'Taktiken zurücksetzen',
    resetModalTitle: 'Taktiken und Protokoll zurücksetzen',
    resetMatchStatsOption: 'Nur aktuelles Spielprotokoll zurücksetzen',
    resetMatchStatsDesc: 'Setzt Ausführungen und Punkte auf 0 zurück.',
    resetToDefaultOption: 'MVP Academy Standard-Taktiken wiederherstellen',
    resetToDefaultDesc: 'Stellt alle vorgefertigten Standard-Spielzüge wieder her.',
    confirmResetBtn: 'Zurücksetzen bestätigen',
    tacticsSplitTeamHome: 'Heimteam-Taktik',
    tacticsSplitTeamAway: 'Auswärtsteam-Taktik',
    tacticsMostUsedTab: 'Meistgenutzte Spielzüge',
    tacticsMostEffectiveTab: 'Effektivste Spielzüge (Top PPP)',
    coachAdjustmentsTitle: 'Echtzeit-Trainerempfehlungen',
    coachAdjustmentsDesc: 'Strategische Anpassungen basierend auf Spielstatistiken.',

    uploadDiagramModalTitle: 'Taktikboard-Foto oder Diagramm hochladen',
    uploadDiagramModalDesc: 'Laden Sie ein Foto des Kabinen-Taktikboards oder ein FastModel-Diagramm hoch.',
    whatCanIUploadTitle: 'Was können Sie hochladen?',
    whatCanIUploadDesc: '• Foto des Taktikboards (JPG, PNG)\n• Playbook-Diagramme aus PDF/FastModel\n• Handgezeichnete Skizzen',
    viewVelcroBoard: '2D Magnetboard',
    viewDiagramImage: 'Taktikboard-Foto / Diagramm',
    uploadWhiteboardBtn: 'Foto hochladen',
    chooseDiagramFile: 'Bilddatei wählen',
    replaceDiagram: 'Bild ersetzen',
    removeDiagram: 'Bild entfernen',
    sampleDiagramPresets: 'Oder wählen Sie eine Vorlage:',

    shotChartHeaderTitle: 'Offizielle 2D Wurfkarte (Shot Chart)',
    shotChartHeaderDesc: 'Grün = Getroffen • Rot = Fehlwurf. Zonen und Wurfevents im Detail.',
    viewScatterDots: 'Wurfpunkte (Scatter)',
    viewHeatmap: 'Zonen & Heatmap',
    filterTeam: 'Team',
    filterPlayer: 'Einzelner Spieler',
    filterOutcome: 'Wurfergebnis',
    filterShotType: 'Wurfdistanz / Typ',
    filterQuarter: 'Viertel',
    resetFilters: 'Filter zurücksetzen',
    allTeams: 'Alle Teams',
    allPlayers: 'Alle Spieler',
    allOutcomes: 'Alle Ergebnisse',
    madeOnly: '🟢 Nur Treffer (Grün)',
    missedOnly: '🔴 Nur Fehlwürfe (Rot)',
    allDistances: 'Alle Distanzen',
    allQuarters: 'Alle Viertel',
    madeCountLabel: 'Treffer',
    missedCountLabel: 'Fehlwürfe',
    fgPctLabel: 'Feldwurf %',
    paintZoneLabel: 'Zone / Korbnähe',
    midRangeZoneLabel: 'Mitteldistanz',
    corner3ZoneLabel: 'Eckendreier',
    shotActionsListTitle: 'Wurfaktionen-Liste',
    clickToPlayVideo: 'Klicken zum Video abspielen',

    uploadModalTitle: 'Spielvideo in SwagIQ importieren',
    uploadModalDesc: 'MP4-Dateien, YouTube-Links oder Beispielspiele verarbeiten.',
    tabSampleGames: 'Beispielspiele',
    tabLocalFile: 'Lokale Datei (MP4/MOV)',
    tabYouTube: 'YouTube-Link',
    tabTwitch: 'Twitch-Stream',
    step1VideoTitle: 'Schritt 1: Videoquelle wählen',
    step2SetupTitle: 'Schritt 2: Pflicht-Team-Setup & Kader-Kalibrierung',
    step2SetupDesc: 'Legen Sie Heim- und Auswärtsteam, Trikotfarben und Spielernummern fest, damit die Computer Vision Engine korrekte Statistiken erfasst.',
    competitionNameLabel: 'Wettbewerb / Liga',
    matchDateLabel: 'Spieldatum',
    proceedToSetupBtn: 'Weiter: Teams & Kader konfigurieren',
    backToVideoSourceBtn: 'Zurück zur Videoauswahl',
    launchVisionAnalysisBtn: 'Vision AI starten & Statistiken generieren',
    processingVisionPipeline: 'SwagIQ Computer Vision AI wird verarbeitet...',
    stepExtraction: '1/5: Frame-Dekodierung & Synchronisation...',
    stepYoloDetection: '2/5: SwagIQ Roboflow YOLOv11 & SAM 3 Erkennung...',
    stepTrackingHomography: '3/5: ByteTrack Trikotnummern-Zuordnung & 2D-Homographie...',
    stepStatsTactics: '4/5: Boxscore, Wurfkarte & Taktik-Aderenz berechnen...',
    stepCompleteReady: '5/5: Analyse abgeschlossen! Spiel-Dashboard wird geöffnet...',

    pdfExportModalTitle: 'Offiziellen Scouting-Bericht exportieren (PDF)',
    pdfExportModalDesc: 'Wählen Sie das Format: Schnelle Zusammenfassung oder vollständiges Dossier.',
    pdfExportQuickTab: 'Schneller Export (Executive Summary)',
    pdfExportFullTab: 'Vollständiger Export (Alle Statistiken)',
    pdfDownloadBtn: 'PDF-Bericht herunterladen',
    pdfGenerating: 'PDF wird generiert...',
    pdfSectionTeamComparison: '1. Offizieller statistischer Team-Vergleich',
    pdfPossessionPct: 'Ballbesitz %',
    pdfPassesCompleted: 'Erfolgreiche Pässe',
    pdfPassingAccuracy: 'Genauigkeit',
    pdfTurnoversSteals: 'Ballverluste / Steals',
    pdfReboundsOffDef: 'Rebounds (OFF/DEF)',
    pdfSectionShooting: '2. Wurfeffizienz (FG / 3PT / FT)',
    pdfTwoPoint: '2-Punkte-Feldwürfe (2PT)',
    pdfThreePoint: '3-Punkte-Feldwürfe (3PT)',
    pdfFreeThrows: 'Freiwürfe (FT)',
    pdfSectionBoxScore: '3. Spieler-Boxscore',
    pdfAllRosters: '(Alle Kader)',
    pdfTopPerformers: '(Top-Spieler)',
    pdfSectionTactics: '4. Erkannte taktische Spielzüge',
    pdfTacticalNotes: 'SwagIQ Computer Vision & SAM 3 Taktiknotizen:',
    pdfGeneratedBy: 'Erstellt von der SwagIQ Basketball Analytics Engine',
    pdfFinalScore: 'Endergebnis',
    pdfDate: 'Datum',
    pdfCompetition: 'Wettbewerb',
    pdfPlayer: 'Spieler',
    pdfExecutedTimes: 'Ausgeführt',
    pdfTimes: 'mal',
    pdfSuccess: 'Erfolg',

    aiCoachTitle: 'Taktischer KI-Assistent',
    aiCoachSubtitle: 'Powered by Gemini 2.5 Computer Vision & Scouting',
    aiCoachGreeting: "Ich bin Ihr taktischer Assistent. Wie kann ich Ihnen heute bei Spielvorbereitung oder Scouting helfen?",
    aiCoachInputPlaceholder: 'Stellen Sie eine taktische Frage...',
    aiCoachSendBtn: 'Senden'
  },
  fr: {
    appName: 'SwagIQ',
    appSubtitle: 'COMPUTER VISION AI',
    appVersion: 'SwagIQ v0.1',
    navGroupTeam: 'Équipe & Config',
    navGroupMatch: 'Analyse Match',
    navGroupReports: 'Rapports & Coach IA',
    navSquadSection: 'Équipe & Config',
    navMatchSection: 'Analyse Match',
    navReportsSection: 'Rapports & Coach IA',
    navSetup: 'Configuration Équipe & Effectif',
    navPlaybook: 'Systèmes & Directives Coach',
    navVideo: 'Vidéo & Vision AI',
    navShotChart: 'Carte des Tirs',
    navBoxScore: 'Feuille de Match',
    navTactics: 'Analyse Tactique',
    navHighlights: 'Highlights',
    navSeason: 'Progression Saison',
    navAICoach: 'Assistant Tactique',
    navRoboflow: 'Roboflow Pipeline',
    storageTitle: 'Stockage & Cache',
    storageUsage: '7.4GB sur 10GB utilisés',

    uploadVideoBtn: 'Importer Vidéo',
    shareBtn: 'Partager',
    shareCopied: 'Copié !',
    exportPdfBtn: 'Exporter PDF',
    saveBtn: 'Enregistrer',
    savedBtn: 'Enregistré !',
    cancelBtn: 'Annuler',
    closeBtn: 'Fermer',
    possessionLabel: 'Poss',
    vsLabel: 'vs',

    setupHeaderTitle: 'Configuration Équipe, Match & Effectif',
    setupHeaderBadge: 'Synchronisation Live',
    setupHeaderDesc: 'Téléversez les logos, définissez les couleurs de maillot et gérez les joueurs inscrits.',
    languageSelectLabel: 'Langue de l\'interface',
    languageSelectDesc: 'Sélectionnez votre langue d\'affichage.',
    myTeamCardTitle: 'Mon Équipe',
    oppTeamCardTitle: 'Équipe Adverse',
    homeGameBtn: 'Match à Domicile',
    awayGameBtn: 'Match à l\'Extérieur',
    teamNameLabel: 'Nom Complet de l\'Équipe',
    teamShortLabel: 'Code Court (3 Lettres)',
    uploadLogoLabel: 'Téléverser le Logo',
    uploadLogoBtn: 'Choisir le Logo',
    removeLogoBtn: 'Supprimer Logo',
    uploadLogoHint: 'Formats acceptés : PNG, JPG, WEBP, SVG.',
    teamColorLabel: 'Couleur Principale du Maillot',
    jerseyPreviewTitle: 'Aperçu du Maillot',
    rosterTableTitle: 'Effectif des Joueurs Actifs',
    rosterTableDesc: 'Définissez les noms, numéros (#) et le cinq majeur.',
    addPlayerTitle: 'Ajouter un Joueur',
    playerNamePlaceholder: 'ex. Victor Wembanyama',
    playerNumberLabel: 'N° Maillot',
    playerPositionLabel: 'Poste',
    isStarterLabel: 'Titulaire (5 Majeur)',
    addPlayerBtn: 'Ajouter',
    saveRosterBtn: 'Sauvegarder Effectif',
    encounteredTeamsLabel: 'Équipes Enregistrées',
    selectEncounteredTeamPlaceholder: 'Sélectionner une équipe...',
    saveCurrentTeamBtn: 'Enregistrer comme Modèle',

    playbookHeaderTitle: 'Systèmes de Jeu & Directives Coach',
    playbookBadge: 'Suivi de Conformité Vision AI',
    playbookHeaderBadge: 'Suivi de Conformité Vision AI',
    playbookHeaderDesc: 'Dessinez vos systèmes, téléversez des photos de tableau et analysez le respect des consignes.',
    registeredPlaysCard: 'SYSTÈMES ENREGISTRÉS',
    totalExecutionsCard: 'EXÉCUTIONS TOTALES',
    complianceRateCard: 'TAUX DE RESPECT CONSIGNES',
    pointsFromPlaysCard: 'POINTS GÉNÉRÉS',
    registeredPlaysLabel: 'SYSTÈMES ENREGISTRÉS',
    totalExecutionsLabel: 'EXÉCUTIONS TOTALES',
    complianceRateLabel: 'TAUX DE RESPECT CONSIGNES',
    pointsGeneratedLabel: 'POINTS GÉNÉRÉS',
    createNewPlayBtn: 'Créer un Système',
    createPlayBtn: 'Créer un Système',
    newPlayModalTitle: 'Nouveau Système Tactique',
    allCategories: 'Tous les Systèmes',
    offensiveCategory: 'Attaque',
    defensiveCategory: 'Défense',
    playTitleLabel: 'Nom du Système',
    playTypeLabel: 'Type de Système',
    targetExecutionsLabel: 'Objectif Exécutions / Match',
    coachDirectiveLabel: 'Directive Clé du Coach (Consignes Joueurs)',
    uploadTacticalDiagramBtn: 'Téléverser Schéma / Photo Tableau',
    playTypeAll: 'Tous les Systèmes',
    playTypeOffense: 'Attaque',
    playTypeDefense: 'Défense',
    coachDirectiveTitle: 'DIRECTIVE OFFICIELLE DU COACH',
    tacticalBoardTitle: 'Tableau Tactique 2D & Vecteurs',
    uploadDiagramLabel: 'Téléverser Photo Tableau Blanc',
    uploadDiagramBtn: 'Téléverser Image',
    drawingModeLabel: 'Outils de Dessin Interactif',
    drawPass: 'Passe (Pointillés Verts)',
    drawCut: 'Coupe / Pénétration (Flèche Orange)',
    drawScreen: 'Écran (Barre en T Jaune)',
    drawDribble: 'Dribble (Vecteur Cyan)',
    clearDrawings: 'Réinitialiser Tableau',
    executionLogsTitle: 'Journal des Actions & Respect Directives',
    logCorrectExecutionBtn: '+1 Exécution Conforme',
    logMistakeExecutionBtn: '+1 Erreur de Directive',
    directiveFollowedBadge: 'DIRECTIVE RESPECTÉE',
    directiveMistakeBadge: 'DIRECTIVE NON RESPECTÉE',
    archivedPlaysFromMVP: 'Archive Tactique Basket (Guide MVP Sport Academy)',
    resetPlaybookBtn: 'Réinitialiser Tactiques',
    resetModalTitle: 'Réinitialiser Tactiques et Logs',
    resetMatchStatsOption: 'Réinitialiser uniquement le match actuel',
    resetMatchStatsDesc: 'Remet à zéro exécutions et points.',
    resetToDefaultOption: 'Restaurer les systèmes standard MVP Academy',
    resetToDefaultDesc: 'Restaure tous les systèmes par défaut.',
    confirmResetBtn: 'Confirmer Réinitialisation',
    tacticsSplitTeamHome: 'Tactique Équipe Domicile',
    tacticsSplitTeamAway: 'Tactique Équipe Extérieur',
    tacticsMostUsedTab: 'Systèmes les Plus Utilisés',
    tacticsMostEffectiveTab: 'Systèmes les Plus Efficaces (Top PPP)',
    coachAdjustmentsTitle: 'Ajustements en Direct du Coach',
    coachAdjustmentsDesc: 'Recommandations stratégiques en temps réel.',

    uploadDiagramModalTitle: 'Téléverser Photo Tableau ou Schéma',
    uploadDiagramModalDesc: 'Téléversez une photo du tableau des vestiaires ou un schéma FastModel.',
    whatCanIUploadTitle: 'Que pouvez-vous téléverser ?',
    whatCanIUploadDesc: '• Photo du tableau blanc des vestiaires (JPG, PNG)\n• Schémas issus de FastModel ou PDF\n• Croquis tactiques',
    viewVelcroBoard: 'Tableau Magnétique 2D',
    viewDiagramImage: 'Photo Tableau / Schéma',
    uploadWhiteboardBtn: 'Téléverser Photo',
    chooseDiagramFile: 'Choisir un Fichier',
    replaceDiagram: 'Remplacer Image',
    removeDiagram: 'Supprimer Image',
    sampleDiagramPresets: 'Ou sélectionnez un modèle prédéfini :',

    shotChartHeaderTitle: 'Carte Officielle des Tirs 2D (Shot Chart)',
    shotChartHeaderDesc: 'Vert = Tirs Réussis • Rouge = Tirs Manqués. Consultez les zones et la liste des tirs.',
    viewScatterDots: 'Points de Tir (Scatter)',
    viewHeatmap: 'Zones & Heatmap',
    filterTeam: 'Équipe',
    filterPlayer: 'Joueur Individuel',
    filterOutcome: 'Résultat du Tir',
    filterShotType: 'Distance / Type',
    filterQuarter: 'Quart-temps',
    resetFilters: 'Réinitialiser Filtres',
    allTeams: 'Toutes les Équipes',
    allPlayers: 'Tous les Joueurs',
    allOutcomes: 'Tous les Résultats',
    madeOnly: '🟢 Réussis Uniquement (Vert)',
    missedOnly: '🔴 Manqués Uniquement (Rouge)',
    allDistances: 'Toutes les Distances',
    allQuarters: 'Tous les Quarts-temps',
    madeCountLabel: 'Réussis',
    missedCountLabel: 'Manqués',
    fgPctLabel: '% aux Tirs',
    paintZoneLabel: 'Raquette / Sous le Cercle',
    midRangeZoneLabel: 'Mi-Distance',
    corner3ZoneLabel: '3 Points dans les Coins',
    shotActionsListTitle: 'Liste des Actions de Tir',
    clickToPlayVideo: 'Cliquer pour voir le clip vidéo',

    uploadModalTitle: 'Importer un Match dans SwagIQ',
    uploadModalDesc: 'Fichiers MP4, liens YouTube ou matchs d\'exemple.',
    tabSampleGames: 'Matchs d\'Exemple',
    tabLocalFile: 'Fichier Local (MP4/MOV)',
    tabYouTube: 'Lien YouTube',
    tabTwitch: 'Stream Twitch',
    step1VideoTitle: 'Étape 1 : Source Vidéo',
    step2SetupTitle: 'Étape 2 : Configuration Obligatoire Équipes & Effectif',
    step2SetupDesc: 'Configurez les équipes Domicile/Extérieur, couleurs de maillots et joueurs afin que la Vision AI attribue correctement les statistiques.',
    competitionNameLabel: 'Compétition / Ligue',
    matchDateLabel: 'Date du Match',
    proceedToSetupBtn: 'Suivant : Configurer Équipes & Effectifs',
    backToVideoSourceBtn: 'Retour au Choix Vidéo',
    launchVisionAnalysisBtn: 'Lancer Vision AI & Générer Stats',
    processingVisionPipeline: 'Traitement SwagIQ Computer Vision AI...',
    stepExtraction: '1/5 : Décodage des frames & synchronisation...',
    stepYoloDetection: '2/5 : Détection Roboflow YOLOv11 & SAM 3...',
    stepTrackingHomography: '3/5 : Suivi ByteTrack des numéros & Homographie 2D...',
    stepStatsTactics: '4/5 : Calcul feuille de match, tirs & respect des systèmes...',
    stepCompleteReady: '5/5 : Analyse terminée ! Ouverture du tableau de bord...',

    pdfExportModalTitle: 'Exporter Rapport de Scouting Officiel (PDF)',
    pdfExportModalDesc: 'Choisissez votre format : Résumé rapide ou dossier complet.',
    pdfExportQuickTab: 'Export Rapide (Executive Summary)',
    pdfExportFullTab: 'Export Complet (Toutes les Statistiques)',
    pdfDownloadBtn: 'Télécharger Rapport PDF',
    pdfGenerating: 'Génération du PDF...',
    pdfSectionTeamComparison: '1. Comparaison Statistique Officielle des Équipes',
    pdfPossessionPct: 'Possession %',
    pdfPassesCompleted: 'Passes Réussies',
    pdfPassingAccuracy: 'Précision',
    pdfTurnoversSteals: 'Balles Perdues / Interceptions',
    pdfReboundsOffDef: 'Rebonds (OFF/DEF)',
    pdfSectionShooting: '2. Efficacité aux Tirs (FG / 3PT / FT)',
    pdfTwoPoint: 'Tirs à 2 Points (2PT)',
    pdfThreePoint: 'Tirs à 3 Points (3PT)',
    pdfFreeThrows: 'Lancers Francs (FT)',
    pdfSectionBoxScore: '3. Feuille de Match Joueurs',
    pdfAllRosters: '(Tous les Effectifs)',
    pdfTopPerformers: '(Meilleurs Joueurs)',
    pdfSectionTactics: '4. Systèmes Tactiques Détectés',
    pdfTacticalNotes: 'Notes Tactiques SwagIQ Computer Vision & SAM 3 :',
    pdfGeneratedBy: 'Généré par SwagIQ Basketball Analytics Engine',
    pdfFinalScore: 'Score Final',
    pdfDate: 'Date',
    pdfCompetition: 'Compétition',
    pdfPlayer: 'Joueur',
    pdfExecutedTimes: 'Exécuté',
    pdfTimes: 'fois',
    pdfSuccess: 'Succès',

    aiCoachTitle: 'Assistant Tactique IA',
    aiCoachSubtitle: 'Propulsé par Gemini 2.5 Computer Vision & Scouting',
    aiCoachGreeting: "Je suis votre assistant tactique. Comment puis-je vous aider pour la préparation de match ou le scouting ?",
    aiCoachInputPlaceholder: 'Posez une question tactique ou demandez un conseil...',
    aiCoachSendBtn: 'Envoyer'
  },
  es: {
    appName: 'SwagIQ',
    appSubtitle: 'COMPUTER VISION AI',
    appVersion: 'SwagIQ v0.1',
    navGroupTeam: 'Equipo & Ajustes',
    navGroupMatch: 'Análisis de Partido',
    navGroupReports: 'Informes & Coach IA',
    navSquadSection: 'Equipo & Ajustes',
    navMatchSection: 'Análisis de Partido',
    navReportsSection: 'Informes & Coach IA',
    navSetup: 'Configuración Equipo & Plantilla',
    navPlaybook: 'Pizarra & Directrices Coach',
    navVideo: 'Vídeo & Vision AI',
    navShotChart: 'Mapa de Tiro',
    navBoxScore: 'Estadísticas',
    navTactics: 'Análisis Táctico',
    navHighlights: 'Highlights',
    navSeason: 'Progreso Temporada',
    navAICoach: 'Asistente Táctico',
    navRoboflow: 'Roboflow Pipeline',
    storageTitle: 'Almacenamiento & Caché',
    storageUsage: '7.4GB de 10GB utilizados',

    uploadVideoBtn: 'Subir Vídeo',
    shareBtn: 'Compartir',
    shareCopied: '¡Copiado!',
    exportPdfBtn: 'Exportar PDF',
    saveBtn: 'Guardar',
    savedBtn: '¡Guardado!',
    cancelBtn: 'Cancelar',
    closeBtn: 'Cerrar',
    possessionLabel: 'Pos',
    vsLabel: 'vs',

    setupHeaderTitle: 'Configuración Equipo, Partido & Plantilla',
    setupHeaderBadge: 'Sincronización en Directo',
    setupHeaderDesc: 'Sube escudos de clubes, define colores de camiseta y gestiona los jugadores de la plantilla.',
    languageSelectLabel: 'Idioma de la Interfaz',
    languageSelectDesc: 'Selecciona tu idioma preferido.',
    myTeamCardTitle: 'Mi Equipo',
    oppTeamCardTitle: 'Equipo Rival',
    homeGameBtn: 'Partido en Casa',
    awayGameBtn: 'Partido Fuera de Casa',
    teamNameLabel: 'Nombre Completo del Equipo',
    teamShortLabel: 'Código Corto (3 Letras)',
    uploadLogoLabel: 'Subir Logo del Equipo',
    uploadLogoBtn: 'Seleccionar Archivo de Logo',
    removeLogoBtn: 'Eliminar Logo',
    uploadLogoHint: 'Compatible con PNG, JPG, WEBP o SVG.',
    teamColorLabel: 'Color Principal de la Camiseta',
    jerseyPreviewTitle: 'Vista Previa de la Equipación',
    rosterTableTitle: 'Plantilla de Jugadores Activos',
    rosterTableDesc: 'Asigna nombres, números de camiseta (#) y quinteto titular.',
    addPlayerTitle: 'Añadir Nuevo Jugador',
    playerNamePlaceholder: 'ej. Sergio Llull',
    playerNumberLabel: 'N° Camiseta',
    playerPositionLabel: 'Posición',
    isStarterLabel: 'Titular (Quinteto)',
    addPlayerBtn: 'Añadir a Plantilla',
    saveRosterBtn: 'Guardar Plantilla',
    encounteredTeamsLabel: 'Equipos Guardados',
    selectEncounteredTeamPlaceholder: 'Seleccionar de guardados...',
    saveCurrentTeamBtn: 'Guardar como Plantilla',

    playbookHeaderTitle: 'Pizarra de Jugadas & Directrices',
    playbookBadge: 'Seguimiento de Cumplimiento Vision AI',
    playbookHeaderBadge: 'Seguimiento de Cumplimiento Vision AI',
    playbookHeaderDesc: 'Dibuja jugadas tácticas, sube fotos de pizarra del vestuario y analiza el cumplimiento de los jugadores.',
    registeredPlaysCard: 'JUGADAS REGISTRADAS',
    totalExecutionsCard: 'EJECUCIONES TOTALES',
    complianceRateCard: '% CUMPLIMIENTO COACH',
    pointsFromPlaysCard: 'PUNTOS GENERADOS',
    registeredPlaysLabel: 'JUGADAS REGISTRADAS',
    totalExecutionsLabel: 'EJECUCIONES TOTALES',
    complianceRateLabel: '% CUMPLIMIENTO COACH',
    pointsGeneratedLabel: 'PUNTOS GENERADOS',
    createNewPlayBtn: 'Crear Nueva Jugada',
    createPlayBtn: 'Crear Nueva Jugada',
    newPlayModalTitle: 'Nueva Jugada Táctica Personalizada',
    allCategories: 'Todas las Jugadas',
    offensiveCategory: 'Ataque',
    defensiveCategory: 'Defensa',
    playTitleLabel: 'Nombre de la Jugada',
    playTypeLabel: 'Tipo de Jugada',
    targetExecutionsLabel: 'Objetivo de Ejecuciones / Partido',
    coachDirectiveLabel: 'Directriz Principal del Entrenador (Instrucciones a Jugadores)',
    uploadTacticalDiagramBtn: 'Subir Diagrama Táctico / Foto de Pizarra',
    playTypeAll: 'Todas las Jugadas',
    playTypeOffense: 'Ataque',
    playTypeDefense: 'Defensa',
    coachDirectiveTitle: 'DIRECTRIZ OFICIAL DEL ENTRENADOR',
    tacticalBoardTitle: 'Pizarra 2D & Diagrama de Movimientos',
    uploadDiagramLabel: 'Subir Diagrama Táctico / Foto de Pizarra',
    uploadDiagramBtn: 'Subir Imagen de Jugada',
    drawingModeLabel: 'Herramientas de Dibujo Interactivo',
    drawPass: 'Pase (Línea discontinua Verde)',
    drawCut: 'Corte / Penetración (Flecha Naranja)',
    drawScreen: 'Bloqueo (Barra en T Amarilla)',
    drawDribble: 'Bote / Dribling (Línea Cian)',
    clearDrawings: 'Reiniciar Pizarra',
    executionLogsTitle: 'Registro de Acciones & Análisis de Directrices',
    logCorrectExecutionBtn: '+1 Ejecución Correcta',
    logMistakeExecutionBtn: '+1 Error de Directriz',
    directiveFollowedBadge: 'DIRECTRIZ CUMPLIDA',
    directiveMistakeBadge: 'ERROR DE DIRECTRIZ',
    archivedPlaysFromMVP: 'Archivo Táctico de Baloncesto (Guía MVP Sport Academy)',
    resetPlaybookBtn: 'Reiniciar Tácticas',
    resetModalTitle: 'Reiniciar Tácticas y Cumplimiento',
    resetMatchStatsOption: 'Reiniciar Registros del Partido Actual',
    resetMatchStatsDesc: 'Pone a 0 ejecuciones, puntos y registros para iniciar un nuevo seguimiento.',
    resetToDefaultOption: 'Restaurar Tácticas por Defecto MVP Academy',
    resetToDefaultDesc: 'Restaura todo el archivo de jugadas predefinidas con sus diagramas y registros iniciales.',
    confirmResetBtn: 'Confirmar Reinicio',
    tacticsSplitTeamHome: 'Táctica Equipo Local',
    tacticsSplitTeamAway: 'Táctica Equipo Visitante',
    tacticsMostUsedTab: 'Jugadas Más Utilizadas (Frecuencia %)',
    tacticsMostEffectiveTab: 'Jugadas Más Eficaces (Top PPP)',
    coachAdjustmentsTitle: 'Ajustes en Directo del Entrenador',
    coachAdjustmentsDesc: 'Recomendaciones estratégicas en tiempo real para modificar durante el partido.',

    uploadDiagramModalTitle: 'Subir Foto de Pizarra o Diagrama Táctico',
    uploadDiagramModalDesc: 'Sube una foto de la pizarra del vestuario o un diagrama FastModel para comparar las directrices con el tracking de Vision AI.',
    whatCanIUploadTitle: '¿Qué puedes subir?',
    whatCanIUploadDesc: '• Foto de la pizarra del vestuario con el móvil (JPG, PNG)\n• Diagramas de FastModel o PDFs\n• Bocetos tácticos',
    viewVelcroBoard: 'Pizarra Magnética 2D',
    viewDiagramImage: 'Foto de Pizarra / Diagrama',
    uploadWhiteboardBtn: 'Subir Foto Pizarra',
    chooseDiagramFile: 'Seleccionar Archivo',
    replaceDiagram: 'Reemplazar Imagen',
    removeDiagram: 'Eliminar Imagen',
    sampleDiagramPresets: 'O selecciona un esquema predefinido:',

    shotChartHeaderTitle: 'Mapa Oficial de Tiro 2D (Shot Chart)',
    shotChartHeaderDesc: 'Puntos verdes = Canastas anotadas • Puntos rojos = Tiros fallados. Consulta la efectividad por zona y el listado de acciones.',
    viewScatterDots: 'Puntos de Tiro (Scatter)',
    viewHeatmap: 'Zonas & Heatmap',
    filterTeam: 'Equipo',
    filterPlayer: 'Jugador Individual',
    filterOutcome: 'Resultado del Tiro',
    filterShotType: 'Distancia / Tipo de Tiro',
    filterQuarter: 'Cuarto / Periodo',
    resetFilters: 'Reiniciar Filtros',
    allTeams: 'Todos los Equipos',
    allPlayers: 'Todos los Jugadores',
    allOutcomes: 'Todos los Resultados',
    madeOnly: '🟢 Solo Anotados (Verdes)',
    missedOnly: '🔴 Solo Fallados (Rojos)',
    allDistances: 'Todas las distancias',
    allQuarters: 'Todos los Cuartos',
    madeCountLabel: 'Anotados',
    missedCountLabel: 'Fallados',
    fgPctLabel: '% Tiros de Campo',
    paintZoneLabel: 'Zona Pintada / Aro',
    midRangeZoneLabel: 'Media Distancia & Codos',
    corner3ZoneLabel: 'Triples de Esquina',
    shotActionsListTitle: 'Listado de Acciones de Tiro',
    clickToPlayVideo: 'Clic para reproducir vídeo',

    uploadModalTitle: 'Importar Partido en SwagIQ',
    uploadModalDesc: 'Vídeos MP4 locales, enlaces de YouTube, directos de Twitch o partidos de muestra.',
    tabSampleGames: 'Partidos de Muestra',
    tabLocalFile: 'Archivo Local (MP4/MOV)',
    tabYouTube: 'Enlace YouTube',
    tabTwitch: 'Stream Twitch',
    step1VideoTitle: 'Paso 1: Fuente de Vídeo',
    step2SetupTitle: 'Paso 2: Configuración Obligatoria Equipos & Plantilla',
    step2SetupDesc: 'Configura los equipos Local y Visitante, colores de camiseta y jugadores para calibrar la Vision AI y generar estadísticas exactas.',
    competitionNameLabel: 'Competición / Liga',
    matchDateLabel: 'Fecha del Partido',
    proceedToSetupBtn: 'Siguiente: Configurar Equipos & Plantillas',
    backToVideoSourceBtn: 'Volver a Selección de Vídeo',
    launchVisionAnalysisBtn: 'Iniciar Vision AI & Generar Estadísticas',
    processingVisionPipeline: 'Procesando SwagIQ Computer Vision AI Pipeline...',
    stepExtraction: '1/5: Decodificación de fotogramas y sincronización...',
    stepYoloDetection: '2/5: Detección Roboflow YOLOv11 & SAM 3...',
    stepTrackingHomography: '3/5: ByteTrack números de camiseta & Homografía 2D...',
    stepStatsTactics: '4/5: Cálculo de estadísticas, mapa de tiro y sistemas...',
    stepCompleteReady: '5/5: ¡Análisis completado! Abriendo panel del partido...',

    pdfExportModalTitle: 'Exportar Informe Oficial de Scouting (PDF)',
    pdfExportModalDesc: 'Selecciona el formato: Resumen ejecutivo rápido o dossier estadístico completo.',
    pdfExportQuickTab: 'Exportación Rápida (Executive Summary)',
    pdfExportFullTab: 'Exportación Completa (Todas las Estadísticas)',
    pdfDownloadBtn: 'Descargar Informe PDF',
    pdfGenerating: 'Generando PDF...',
    pdfSectionTeamComparison: '1. Comparación Estadística Oficial de Equipos',
    pdfPossessionPct: 'Posesión %',
    pdfPassesCompleted: 'Pases Completados',
    pdfPassingAccuracy: 'prec.',
    pdfTurnoversSteals: 'Pérdidas / Recuperaciones',
    pdfReboundsOffDef: 'Rebotes (OFF/DEF)',
    pdfSectionShooting: '2. Eficiencia de Tiro (FG / 3PT / FT)',
    pdfTwoPoint: 'Tiro de 2 Puntos (2PT)',
    pdfThreePoint: 'Tiro de 3 Puntos (3PT)',
    pdfFreeThrows: 'Tiros Libres (FT)',
    pdfSectionBoxScore: '3. Estadísticas de Jugadores',
    pdfAllRosters: '(Plantillas Completas)',
    pdfTopPerformers: '(Jugadores Destacados)',
    pdfSectionTactics: '4. Sistemas Tácticos Detectados',
    pdfTacticalNotes: 'Notas Tácticas SwagIQ Computer Vision & SAM 3:',
    pdfGeneratedBy: 'Generado por SwagIQ Basketball Analytics Engine',
    pdfFinalScore: 'Resultado Final',
    pdfDate: 'Fecha',
    pdfCompetition: 'Competición',
    pdfPlayer: 'Jugador',
    pdfExecutedTimes: 'Ejecutado',
    pdfTimes: 'veces',
    pdfSuccess: 'Éxito',

    aiCoachTitle: 'Asistente Táctico IA',
    aiCoachSubtitle: 'Potenciado por Gemini 2.5 Visión por Computador & Scouting',
    aiCoachGreeting: "Soy tu Asistente Táctico. ¿Cómo puedo ayudarte hoy con la preparación del equipo, el scouting táctico o el análisis de jugadores?",
    aiCoachInputPlaceholder: 'Haz una pregunta táctica o solicita un informe de scouting...',
    aiCoachSendBtn: 'Enviar'
  }
};
