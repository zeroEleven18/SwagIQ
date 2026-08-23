import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Code, 
  Play, 
  Eye, 
  Activity, 
  Video, 
  Crosshair, 
  Users, 
  Target, 
  MapPin,
  ExternalLink,
  ShieldAlert,
  BrainCircuit,
  Search
} from 'lucide-react';
import { INITIAL_ROBOFLOW_VIOLATIONS } from '../data/mockCustomPlays';

export const RoboflowPipelineFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [viewTab, setViewTab] = useState<'pipeline' | 'violations' | 'notebooks'>('pipeline');
  const [violations] = useState(INITIAL_ROBOFLOW_VIOLATIONS);

  const pipelineSteps = [
    {
      id: 'step-1',
      title: '1. Video Ingestion & Frame Extraction',
      badge: 'Input 60 FPS',
      icon: Video,
      description: 'Caricamento del video da file locale, live stream Twitch o link YouTube. Suddivisione del flusso in frame ad alta risoluzione (1080p/4K) per l\'elaborazione computer vision in tempo reale.',
      techStack: ['OpenCV', 'FFmpeg', 'Twitch Stream API', 'YouTube-DLP Video Ingest'],
      outputData: 'Frame buffer a 60 FPS, campionamento 1920x1080.',
      codeSnippet: `cap = cv2.VideoCapture("match_game.mp4")\nwhile cap.isOpened():\n    ret, frame = cap.read()\n    if not ret: break\n    process_vision_pipeline(frame)`
    },
    {
      id: 'step-2',
      title: '2. Object Detection (RF-DETR & SAM 3)',
      badge: 'RF-DETR + SAM 3',
      icon: Crosshair,
      description: 'Rilevamento in tempo reale di giocatori, arbitri e palla da basket con RF-DETR (Real-Time Transformer Object Detector di Roboflow) e maschere di segmentazione semantica millimetrica SAM 3 (Segment Anything Model 3).',
      techStack: ['RF-DETR (Roboflow Transformers)', 'SAM 3 (Segment Anything 3)', 'Roboflow Inference SDK'],
      outputData: 'Bounding Box (x, y, w, h), Class: [player, referee, basketball], SAM 3 Mask Polygons.',
      codeSnippet: `from roboflow import Roboflow\nfrom transformers import AutoModelForObjectDetection\n\n# RF-DETR Transformer Detection\nrf_detr = AutoModelForObjectDetection.from_pretrained("roboflow/rf-detr-basketball")\npredictions = rf_detr.predict(frame, confidence=0.88)\n\n# SAM 3 Semantic Segmentation\nsam3_masks = sam3_predictor.generate_masks(frame, predictions.boxes)`
    },
    {
      id: 'step-3',
      title: '3. Multi-Object Tracking (ByteTrack)',
      badge: 'ID Persistente',
      icon: Activity,
      description: 'Mantenimento dell\'identità univoca (Track ID) di ogni giocatore anche durante sovrapposizioni, blocchi ciechi, mischie sotto canestro e cambi di inquadratura della telecamera principale.',
      techStack: ['ByteTrack', 'DeepSORT', 'Kalman Filter State Estimator'],
      outputData: 'Track IDs [0..9] stabili nel tempo, calcolo velocità e coordinate vettoriali.',
      codeSnippet: `import supervision as sv\ntracker = sv.ByteTrack()\ndetections = sv.Detections.from_roboflow(predictions)\ndetections = tracker.update_with_detections(detections)`
    },
    {
      id: 'step-4',
      title: '4. Team Clustering (SigLIP + UMAP + K-Means)',
      badge: 'SigLIP + UMAP + K-means',
      icon: Users,
      description: 'Estrazione delle feature visive delle maglie tramite embeddings multimodali SigLIP (Google Vision-Language), riduzione dimensionale non-lineare con UMAP e clustering K-Means per separare infallibilmente squadra di casa, ospiti e arbitri.',
      techStack: ['SigLIP Vision Embeddings', 'UMAP Dimensionality Reduction', 'K-Means Color Clustering'],
      outputData: 'Team Clusters: [Home (Green), Away (Blue), Referees (Stripes)], Silhouette Score 0.94.',
      codeSnippet: `import umap\nfrom sklearn.cluster import KMeans\nimport open_clip\n\n# 1. SigLIP Visual Feature Extraction\nsiglip_model, _, preprocess = open_clip.create_model_and_transforms('ViT-B-16-SigLIP')\njersey_embeddings = siglip_model.encode_image(player_jersey_crops)\n\n# 2. UMAP 2D Manifold Projection\numap_reducer = umap.UMAP(n_components=3, random_state=42)\nreduced_features = umap_reducer.fit_transform(jersey_embeddings)\n\n# 3. K-Means Team Label Assignment\nkmeans = KMeans(n_clusters=3).fit(reduced_features)\nteam_labels = kmeans.labels_`
    },
    {
      id: 'step-5',
      title: '5. Jersey Number & Roster OCR Alignment',
      badge: 'OCR & Roster Match',
      icon: Eye,
      description: 'Lettura automatica del numero di maglia sul petto/schiena tramite OCR neurale e associazione biometrica al roster ufficiale (es. #0 Tatum, #11 Brunson) configurato nel pannello Setup.',
      techStack: ['TrOCR Transformer', 'ResNet Jersey Classifier', 'Setup Roster Matcher'],
      outputData: 'Player Profile: Name, Jersey #, Team, Match Stats Link.',
      codeSnippet: `jersey_number = ocr_model.read_digits(player_crop)\nmatched_player = roster_db.find_by_jersey(team_label, jersey_number)`
    },
    {
      id: 'step-6',
      title: '6. Court Keypoints & Homography Matrix',
      badge: 'Omografia 2D',
      icon: MapPin,
      description: 'Riconoscimento dei punti cardinali del campo da basket (linea di fondo, arco da 3 punti, lunetta tiro libero, canestro) e calcolo della matrice di omografia per proiettare la telecamera 3D prospettica sul campo 2D piano.',
      techStack: ['Court Keypoint Model', 'Homography Matrix H (3x3)', 'OpenCV findHomography'],
      outputData: 'Matrice di trasformazione H, coordinate metriche del campo (0-100m).',
      codeSnippet: `src_pts = np.float32([kp_corner_l, kp_corner_r, kp_3pt_top, kp_rim])\ndst_pts = np.float32([[2,2], [92,2], [50,28], [50,12]])\nH, _ = cv2.findHomography(src_pts, dst_pts)`
    },
    {
      id: 'step-7',
      title: '7. Basketball Violations & Rule Engine',
      badge: 'Violazioni Regolamento',
      icon: ShieldAlert,
      description: 'Rilevamento automatico di infrazioni di gioco tramite algoritmi open-source di Roboflow Notebooks: passi (Foot-Plant tracking), 3 secondi in area (Key Polygon timer), piede sulla linea da 3 (SAM 3 line intersection) e 8 secondi per superare metà campo.',
      techStack: ['Foot-Plant Travel Detector', 'Key Occupancy Polygon Timer', 'SAM 3 Line Intersection', 'Court Clock Sync'],
      outputData: 'Violations Event Stream: [TRAVEL, 3_SEC_PAINT, FOOT_ON_LINE, 8_SEC_BACKCOURT].',
      codeSnippet: `# Roboflow Basketball Violations Pipeline\ntravel_detected = detect_travel(player_foot_plants, dribble_release_timestamp)\nkey_seconds = measure_paint_residence(player_polygon, homography_key_area)\nfoot_on_line = check_sam3_intersection(shoe_mask, court_3pt_line_polygon)`
    },
    {
      id: 'step-8',
      title: '8. 2D Shot Chart, Tactical Logs & Real-Time Box Score',
      badge: 'Dashboard Finale',
      icon: Sparkles,
      description: 'Generazione automatica del tabellino ufficiale di lega, percentuali di tiro, mappa 2D dei tiri, calcolo PPP, rispetto delle direttive coach e report PDF esportabile per lo staff tecnico.',
      techStack: ['SwagIQ Engine', 'Recharts & React 19', 'jsPDF & Canvas', 'Gemini AI Coach'],
      outputData: 'Box Score completo, Shot Chart interattiva, Highlights automatici, PDF Scout.',
      codeSnippet: `box_score.record_shot(player_id, shot_result, distance, coordinates)\ngenerate_pdf_report(match_data, shot_chart_svg)`
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Architettura Roboflow, RF-DETR & SAM 3 Pipeline
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                  Supervision & Notebooks Stack
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Modelli di Vision Transformer (RF-DETR), Segment Anything (SAM 3), Clustering con SigLIP + UMAP + K-Means e Rilevamento Violazioni da <a href="https://github.com/roboflow/notebooks/tree/main" target="_blank" rel="noreferrer" className="text-orange-400 hover:underline">roboflow/notebooks</a>.
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewTab === 'pipeline' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pipeline 8 Fasi
            </button>
            <button
              onClick={() => setViewTab('violations')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                viewTab === 'violations' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Violazioni Rilevate ({violations.length})</span>
            </button>
            <button
              onClick={() => setViewTab('notebooks')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                viewTab === 'notebooks' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Notebooks GitHub</span>
            </button>
          </div>
        </div>

        {/* Interactive Pipeline Timeline Stepper */}
        {viewTab === 'pipeline' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
            {pipelineSteps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              const isCompleted = activeStep > idx;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isActive
                      ? 'bg-orange-500/15 border-orange-500 ring-1 ring-orange-500/50 shadow-lg'
                      : isCompleted
                      ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-slate-950/60 border-slate-800/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <div className="text-[10px] font-bold text-white truncate">{step.title.split('.')[1]}</div>
                  <div className="text-[8px] text-slate-400 font-mono mt-0.5 truncate">{step.badge}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* View 1: Step Deep Dive */}
      {viewTab === 'pipeline' && pipelineSteps[activeStep] && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20">
                {React.createElement(pipelineSteps[activeStep].icon, { className: 'w-6 h-6' })}
              </div>
              <div>
                <span className="text-xs text-orange-400 font-mono font-bold tracking-wider uppercase">
                  Fase {activeStep + 1} di {pipelineSteps.length}
                </span>
                <h3 className="text-lg font-bold text-white">{pipelineSteps[activeStep].title}</h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold"
              >
                &larr; Precedente
              </button>
              <button
                disabled={activeStep === pipelineSteps.length - 1}
                onClick={() => setActiveStep((s) => Math.min(pipelineSteps.length - 1, s + 1))}
                className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-semibold shadow-md"
              >
                Successiva &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Descrizione Funzionale
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {pipelineSteps[activeStep].description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Stack Tecnologico & Algoritmi Utilizzati
                </h4>
                <div className="flex flex-wrap gap-2">
                  {pipelineSteps[activeStep].techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-700/80 text-orange-300 text-xs font-mono font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 block mb-1">Output Strutturato di questa fase:</span>
                <span className="text-xs text-emerald-400 font-mono">{pipelineSteps[activeStep].outputData}</span>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center font-mono">
                  <Code className="w-3.5 h-3.5 mr-1 text-orange-400" />
                  Roboflow & Vision Pipeline Python Code
                </span>
                <span className="text-[10px] text-slate-500">Live SDK Snippet</span>
              </div>

              <pre className="bg-slate-950 text-slate-200 p-4 rounded-2xl border border-slate-800 text-xs font-mono overflow-x-auto leading-relaxed">
                <code>{pipelineSteps[activeStep].codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Violations Tracker */}
      {viewTab === 'violations' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                Violazioni & Infrazioni Regolamentari Rilevate da Computer Vision
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Algoritmi di tracking del piede perno, omografia dell'area e tempo di permanenza estratti dai notebook ufficiali Roboflow.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              {violations.length} Infrazioni
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {violations.map((viol) => (
              <div
                key={viol.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {viol.type}
                    </span>
                    <span className="font-mono text-xs text-slate-400">{viol.gameClock}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    Confidenza: {(viol.frameConfidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{viol.name}</h4>
                  <div className="text-xs text-orange-400 font-semibold mt-0.5">
                    #{viol.playerNumber} {viol.playerName} ({viol.team.toUpperCase()})
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    {viol.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-900 font-mono">
                  <span className="truncate max-w-[240px]">Source: {viol.notebookSource}</span>
                  <a
                    href={`https://github.com/roboflow/notebooks/tree/main`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-400 hover:text-orange-300 flex items-center gap-1"
                  >
                    <span>Vedi Repo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 3: Roboflow Notebooks Directory Links */}
      {viewTab === 'notebooks' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Code className="w-5 h-5 text-orange-400" />
              Roboflow Notebooks Ufficiali (GitHub Repository)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Repository pubblico di riferimento: <a href="https://github.com/roboflow/notebooks/tree/main" target="_blank" rel="noreferrer" className="text-orange-400 font-mono underline">https://github.com/roboflow/notebooks/tree/main</a>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[
              {
                title: 'RF-DETR Basketball Detection',
                desc: 'Real-time object detection with Transformers for players & ball tracking.',
                tags: ['RF-DETR', 'PyTorch', 'Roboflow 3.0'],
                url: 'https://github.com/roboflow/notebooks/tree/main'
              },
              {
                title: 'SigLIP + UMAP + K-Means Clustering',
                desc: 'Vision-language feature representation to cluster home vs away team jerseys.',
                tags: ['SigLIP', 'UMAP', 'K-Means', 'Scikit-Learn'],
                url: 'https://github.com/roboflow/notebooks/tree/main'
              },
              {
                title: 'SAM 3 Basketball Court Line Segmentation',
                desc: 'Sub-pixel accuracy segmentation for 3-point lines, baseline and paint bounds.',
                tags: ['SAM 3', 'Supervision', 'Court Homography'],
                url: 'https://github.com/roboflow/notebooks/tree/main'
              },
              {
                title: 'Travel & Foot-Plant Detection',
                desc: 'Automatic pivot foot identification and travel violation counter.',
                tags: ['Pose Estimation', 'Foot-Plant', 'Rule Engine'],
                url: 'https://github.com/roboflow/notebooks/tree/main'
              },
              {
                title: 'Key Occupancy 3-Second Timer',
                desc: 'Geofencing polygon on court homography to measure defensive & offensive 3 seconds.',
                tags: ['Homography', 'Polygon Intersection', 'Timer'],
                url: 'https://github.com/roboflow/notebooks/tree/main'
              },
              {
                title: 'ByteTrack Multi-Player Re-ID',
                desc: 'State-of-the-art multi-object tracking preserving player jersey IDs.',
                tags: ['ByteTrack', 'Re-ID', 'Kalman Filter'],
                url: 'https://github.com/roboflow/notebooks/tree/main'
              }
            ].map((nb, idx) => (
              <a
                key={idx}
                href={nb.url}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-orange-500/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                    <span>{nb.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    {nb.desc}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-slate-900">
                  {nb.tags.map((t, i) => (
                    <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {t}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
