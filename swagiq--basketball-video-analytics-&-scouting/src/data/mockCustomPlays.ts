import { CustomTacticalPlay, RoboflowViolation } from '../types/basketball';

export const INITIAL_CUSTOM_PLAYS: CustomTacticalPlay[] = [
  {
    id: 'play-1',
    title: 'Spagna Pick & Roll con Flare Angolo',
    type: 'offensive',
    category: 'Pick & Roll / Spagna',
    coachDirective: 'Il #8 (C) porta il blocco primario sul palleggiatore #0, mentre il #9 (G) porta il backscreen sul lungo difensore e apre lo scarico per il #7 nell\'angolo debole.',
    targetExecutions: 8,
    actualExecutions: 11,
    complianceRate: 81.8,
    pointsGenerated: 16,
    ppp: 1.45,
    keyActionDescription: 'Tripla aperta o rollata al ferro del lungo in mismatch 1vs0',
    nodes: [
      { id: 'n-1', label: '1 (PG)', role: 'PG', number: 0, x: 50, y: 78, isOffense: true },
      { id: 'n-2', label: '5 (C)', role: 'C', number: 8, x: 58, y: 64, isOffense: true },
      { id: 'n-3', label: '2 (SG)', role: 'SG', number: 9, x: 52, y: 50, isOffense: true },
      { id: 'n-4', label: '3 (SF)', role: 'SF', number: 7, x: 90, y: 22, isOffense: true },
      { id: 'n-5', label: '4 (PF)', role: 'PF', number: 42, x: 10, y: 24, isOffense: true },
      { id: 'd-1', label: 'D1', role: 'DEF', number: 11, x: 50, y: 72, isOffense: false },
      { id: 'd-2', label: 'D5', role: 'DEF', number: 23, x: 55, y: 56, isOffense: false },
    ],
    actions: [
      { id: 'a-1', type: 'screen', start: { x: 58, y: 64 }, end: { x: 50, y: 72 }, label: 'Blocco 1-5' },
      { id: 'a-2', type: 'screen', start: { x: 52, y: 50 }, end: { x: 55, y: 56 }, label: 'Backscreen Spagna' },
      { id: 'a-3', type: 'dribble', start: { x: 50, y: 78 }, end: { x: 38, y: 58 }, label: 'Penetrazione P&R' },
      { id: 'a-4', type: 'cut', start: { x: 58, y: 64 }, end: { x: 50, y: 16 }, label: 'Roll a Canestro' },
      { id: 'a-5', type: 'pass', start: { x: 38, y: 58 }, end: { x: 90, y: 22 }, label: 'Scarico Angolo' },
    ],
    complianceLogs: [
      { id: 'log-1', timestampSec: 14, gameClock: '11:20 Q1', quarter: 1, executedCorrectly: true, coachDirectiveFollowed: true, pointsScored: 3, playersInvolved: [0, 8, 9, 7], notes: 'Esecuzione magistrale: Spagna screen perfetto, tripla a segno dal corner.' },
      { id: 'log-2', timestampSec: 48, gameClock: '08:20 Q1', quarter: 1, executedCorrectly: true, coachDirectiveFollowed: true, pointsScored: 3, playersInvolved: [0, 8, 9], notes: 'Palleggiatore legge il drop difensivo e scarica per il tiratore aperto.' },
      { id: 'log-3', timestampSec: 110, gameClock: '02:40 Q1', quarter: 1, executedCorrectly: false, coachDirectiveFollowed: false, pointsScored: 0, playersInvolved: [0, 7], notes: 'ERRORE DIRETTIVA: Il #9 ha tardato il backscreen, tiro forzato dalla media.' },
      { id: 'log-4', timestampSec: 215, gameClock: '06:15 Q2', quarter: 2, executedCorrectly: true, coachDirectiveFollowed: true, pointsScored: 2, playersInvolved: [0, 8], notes: 'Alley-oop al ferro per il #8 dopo blocco cieco vincente.' },
      { id: 'log-5', timestampSec: 330, gameClock: '01:45 Q2', quarter: 2, executedCorrectly: true, coachDirectiveFollowed: true, pointsScored: 2, playersInvolved: [0, 9, 8], notes: 'Fallo subito sul roll, 2/2 ai liberi.' }
    ]
  },
  {
    id: 'play-2',
    title: 'Motion 5-Out (Spaziatura & Tagli Backdoor)',
    type: 'offensive',
    category: 'Motion / 5-Out (MVP Academy)',
    coachDirective: 'Tutti e 5 i giocatori oltre l\'arco dei 3 punti per aprire l\'area. Sul passaggio guardia-ala, se il difensore overplaya, eseguire immediatamente il taglio backdoor verso il canestro.',
    targetExecutions: 10,
    actualExecutions: 12,
    complianceRate: 91.7,
    pointsGenerated: 18,
    ppp: 1.50,
    keyActionDescription: 'Appoggio facile 1vs0 al ferro su taglio backdoor o tripla aperta',
    nodes: [
      { id: 'n-1', label: '1 (PG)', role: 'PG', number: 0, x: 50, y: 78, isOffense: true },
      { id: 'n-2', label: '2 (SG)', role: 'SG', number: 9, x: 84, y: 52, isOffense: true },
      { id: 'n-3', label: '3 (SF)', role: 'SF', number: 7, x: 16, y: 52, isOffense: true },
      { id: 'n-4', label: '4 (PF)', role: 'PF', number: 42, x: 10, y: 22, isOffense: true },
      { id: 'n-5', label: '5 (C)', role: 'C', number: 8, x: 90, y: 22, isOffense: true },
    ],
    actions: [
      { id: 'a-1', type: 'pass', start: { x: 50, y: 78 }, end: { x: 84, y: 52 }, label: 'Passaggio Ala' },
      { id: 'a-2', type: 'cut', start: { x: 16, y: 52 }, end: { x: 50, y: 16 }, label: 'Taglio Backdoor' },
      { id: 'a-3', type: 'pass', start: { x: 84, y: 52 }, end: { x: 50, y: 16 }, label: 'Assist al Ferro' },
    ],
    complianceLogs: [
      { id: 'log-5out-1', timestampSec: 95, gameClock: '04:15 Q1', quarter: 1, executedCorrectly: true, coachDirectiveFollowed: true, pointsScored: 2, playersInvolved: [0, 9, 7], notes: 'Spaziatura 5-Out perfetta: taglio cieco backdoor del #7 e appoggio al vetro.' },
      { id: 'log-5out-2', timestampSec: 240, gameClock: '04:50 Q2', quarter: 2, executedCorrectly: true, coachDirectiveFollowed: true, pointsScored: 3, playersInvolved: [0, 8], notes: 'La difesa collassa in area, scarico nell\'angolo per il #8 da 3 punti.' }
    ]
  },
  {
    id: 'play-3',
    title: 'Horns 5-Out con Uscita Hand-Off',
    type: 'offensive',
    category: 'Motion / Horns',
    coachDirective: 'Due lunghi sui gomiti della lunetta (elbows). Ribaltamento rapido palla a destra e hand-off immediato per il tiratore in uscita verso la lunetta da 3.',
    targetExecutions: 6,
    actualExecutions: 7,
    complianceRate: 85.7,
    pointsGenerated: 11,
    ppp: 1.57,
    keyActionDescription: 'Hand-off a 45 gradi con tripla o penetrazione sul ricciolo',
    nodes: [
      { id: 'n-1', label: '1 (PG)', role: 'PG', number: 0, x: 50, y: 80, isOffense: true },
      { id: 'n-2', label: '4 (PF)', role: 'PF', number: 42, x: 32, y: 48, isOffense: true },
      { id: 'n-3', label: '5 (C)', role: 'C', number: 8, x: 68, y: 48, isOffense: true },
      { id: 'n-4', label: '2 (SG)', role: 'SG', number: 9, x: 88, y: 30, isOffense: true },
      { id: 'n-5', label: '3 (SF)', role: 'SF', number: 7, x: 12, y: 30, isOffense: true },
    ],
    actions: [
      { id: 'a-1', type: 'pass', start: { x: 50, y: 80 }, end: { x: 68, y: 48 }, label: 'Passaggio Elbow' },
      { id: 'a-2', type: 'cut', start: { x: 88, y: 30 }, end: { x: 66, y: 52 }, label: 'Taglio per DHO' },
      { id: 'a-3', type: 'screen', start: { x: 68, y: 48 }, end: { x: 72, y: 46 }, label: 'Blocco DHO' },
      { id: 'a-4', type: 'dribble', start: { x: 66, y: 52 }, end: { x: 55, y: 68 }, label: 'Uscita Tiro 3PT' },
    ],
    complianceLogs: [
      { id: 'log-6', timestampSec: 78, gameClock: '05:55 Q1', quarter: 1, executedCorrectly: true, coachDirectiveFollowed: true, pointsScored: 3, playersInvolved: [0, 8, 7], notes: 'DHO eseguito a tempo record, tripla piazzata senza esitazione.' },
      { id: 'log-7', timestampSec: 180, gameClock: '09:10 Q2', quarter: 2, executedCorrectly: true, coachDirectiveFollowed: true, pointsScored: 2, playersInvolved: [0, 42, 9], notes: 'Ricciolo stretto e floater morbido al tabellone.' }
    ]
  },
  {
    id: 'play-4',
    title: 'Attacco Flex (Taglio Orizzontale & Downscreen)',
    type: 'offensive',
    category: 'Continuità / Flex (MVP Academy)',
    coachDirective: 'Passaggio dal play alla guardia a 45 gradi; l\'ala sul lato debole sfrutta il blocco orizzontale sulla linea di fondo (Flex Cut) per ricevere sotto canestro. Subito dopo, il bloccante sfrutta il downscreen.',
    targetExecutions: 6,
    actualExecutions: 6,
    complianceRate: 83.3,
    pointsGenerated: 10,
    ppp: 1.66,
    keyActionDescription: 'Taglio Flex lungo la linea di fondo e tiro dal pitturato',
    nodes: [
      { id: 'n-1', label: '1 (PG)', role: 'PG', number: 0, x: 50, y: 78, isOffense: true },
      { id: 'n-2', label: '2 (SG)', role: 'SG', number: 9, x: 80, y: 55, isOffense: true },
      { id: 'n-3', label: '3 (SF)', role: 'SF', number: 7, x: 15, y: 20, isOffense: true },
      { id: 'n-4', label: '4 (PF)', role: 'PF', number: 42, x: 42, y: 22, isOffense: true },
      { id: 'n-5', label: '5 (C)', role: 'C', number: 8, x: 25, y: 65, isOffense: true },
    ],
    actions: [
      { id: 'a-1', type: 'screen', start: { x: 42, y: 22 }, end: { x: 25, y: 20 }, label: 'Blocco Flex' },
      { id: 'a-2', type: 'cut', start: { x: 15, y: 20 }, end: { x: 55, y: 18 }, label: 'Taglio Fondo' },
      { id: 'a-3', type: 'pass', start: { x: 80, y: 55 }, end: { x: 55, y: 18 }, label: 'Passaggio Canestro' },
    ],
    complianceLogs: [
      { id: 'log-flex-1', timestampSec: 160, gameClock: '08:30 Q2', quarter: 2, executedCorrectly: true, coachDirectiveFollowed: true, pointsScored: 2, playersInvolved: [0, 9, 7], notes: 'Blocco flex pulito, taglio profondo e canestro da sotto.' }
    ]
  },
  {
    id: 'play-5',
    title: 'Difesa Drop 1-5 con Tagliafuori Blindato',
    type: 'defensive',
    category: 'Difesa Pick & Roll / Drop',
    coachDirective: 'Sul Pick & Roll centrale, il centro #8 resta a 2.5 metri di profondità (Drop) proteggendo il ferro. L\'esterno passa sopra al blocco per contestare il tiro da dietro, mentre i lati deboli tagliano fuori il rimbalzista.',
    targetExecutions: 15,
    actualExecutions: 16,
    complianceRate: 87.5,
    pointsGenerated: 0,
    ppp: 0.81,
    keyActionDescription: 'Tiro forzato avversario dalla media e rimbalzo difensivo immediato',
    nodes: [
      { id: 'd-1', label: 'D1 (PG)', role: 'DEF', number: 0, x: 50, y: 70, isOffense: false },
      { id: 'd-2', label: 'D5 (C)', role: 'DEF', number: 8, x: 50, y: 32, isOffense: false },
      { id: 'd-3', label: 'D2 (SG)', role: 'DEF', number: 9, x: 25, y: 40, isOffense: false },
      { id: 'd-4', label: 'D3 (SF)', role: 'DEF', number: 7, x: 75, y: 40, isOffense: false },
      { id: 'd-5', label: 'D4 (PF)', role: 'DEF', number: 42, x: 45, y: 20, isOffense: false },
    ],
    actions: [
      { id: 'a-1', type: 'cut', start: { x: 50, y: 70 }, end: { x: 44, y: 60 }, label: 'Recupero Sopra' },
      { id: 'a-2', type: 'cut', start: { x: 50, y: 32 }, end: { x: 50, y: 22 }, label: 'Contenimento Rim' },
      { id: 'a-3', type: 'screen', start: { x: 45, y: 20 }, end: { x: 40, y: 16 }, label: 'Box-Out Forte' },
    ],
    complianceLogs: [
      { id: 'log-8', timestampSec: 32, gameClock: '09:50 Q1', quarter: 1, executedCorrectly: true, coachDirectiveFollowed: true, pointsScored: 0, playersInvolved: [0, 8], notes: 'Brunson contestato a 5 metri, tiro corto e rimbalzo Porzingis.' },
      { id: 'log-9', timestampSec: 145, gameClock: '11:45 Q2', quarter: 2, executedCorrectly: false, coachDirectiveFollowed: false, pointsScored: 2, playersInvolved: [8], notes: 'ERRORE DIRETTIVA: Drop troppo profondo, concesso floater aperto.' }
    ]
  },
  {
    id: 'play-6',
    title: 'Difesa a Zona 2-3 Compatta (Protezione Pitturato)',
    type: 'defensive',
    category: 'Difesa a Zona (MVP Academy)',
    coachDirective: 'Due guardie alte sul perimetro che scivolano sulla palla, tre lunghi sulla linea di fondo a coprire gli angoli e il ferro. Vietato concedere penetrazioni centrali o rimbalzi d\'attacco.',
    targetExecutions: 8,
    actualExecutions: 8,
    complianceRate: 87.5,
    pointsGenerated: 0,
    ppp: 0.75,
    keyActionDescription: 'Forzatura tiri contestati da 3 punti con area blindata',
    nodes: [
      { id: 'd-1', label: 'D1 (PG)', role: 'DEF', number: 0, x: 38, y: 62, isOffense: false },
      { id: 'd-2', label: 'D2 (SG)', role: 'DEF', number: 9, x: 62, y: 62, isOffense: false },
      { id: 'd-3', label: 'D3 (SF)', role: 'DEF', number: 7, x: 18, y: 26, isOffense: false },
      { id: 'd-4', label: 'D5 (C)', role: 'DEF', number: 8, x: 50, y: 24, isOffense: false },
      { id: 'd-5', label: 'D4 (PF)', role: 'DEF', number: 42, x: 82, y: 26, isOffense: false },
    ],
    actions: [
      { id: 'a-1', type: 'cut', start: { x: 38, y: 62 }, end: { x: 45, y: 68 }, label: 'Pressione Palla' },
      { id: 'a-2', type: 'cut', start: { x: 62, y: 62 }, end: { x: 50, y: 55 }, label: 'Aiuto Gomito' },
      { id: 'a-3', type: 'cut', start: { x: 50, y: 24 }, end: { x: 50, y: 15 }, label: 'Presidio Ferro' },
    ],
    complianceLogs: [
      { id: 'log-zone-1', timestampSec: 210, gameClock: '06:20 Q2', quarter: 2, executedCorrectly: true, coachDirectiveFollowed: true, pointsScored: 0, playersInvolved: [0, 9, 8], notes: 'Zona 2-3 ha costretto gli avversari a 24 secondi scaduti.' }
    ]
  },
  {
    id: 'play-7',
    title: 'Pressing 2-2-1 su Canestro Segnato',
    type: 'defensive',
    category: 'Full-Court Press',
    coachDirective: 'Dopo ogni canestro segnato o tiro libero, allungare in 2-2-1: indirizzare la rimessa sulla linea laterale e raddoppiare sul superamento dei 3 punti avversari.',
    targetExecutions: 5,
    actualExecutions: 6,
    complianceRate: 83.3,
    pointsGenerated: 4,
    ppp: 0.67,
    keyActionDescription: 'Palla recuperata entro gli 8 secondi o passaggio lungo intercettato',
    nodes: [
      { id: 'd-1', label: '1 (PG)', role: 'DEF', number: 0, x: 30, y: 88, isOffense: false },
      { id: 'd-2', label: '2 (SG)', role: 'DEF', number: 9, x: 70, y: 88, isOffense: false },
      { id: 'd-3', label: '3 (SF)', role: 'DEF', number: 7, x: 30, y: 55, isOffense: false },
      { id: 'd-4', label: '4 (PF)', role: 'DEF', number: 42, x: 70, y: 55, isOffense: false },
      { id: 'd-5', label: '5 (C)', role: 'DEF', number: 8, x: 50, y: 25, isOffense: false },
    ],
    actions: [
      { id: 'a-1', type: 'cut', start: { x: 30, y: 88 }, end: { x: 18, y: 78 }, label: 'Trappola Linea' },
      { id: 'a-2', type: 'cut', start: { x: 30, y: 55 }, end: { x: 20, y: 75 }, label: 'Raddoppio Alto' },
      { id: 'a-3', type: 'cut', start: { x: 70, y: 88 }, end: { x: 50, y: 70 }, label: 'Intercettazione Centro' },
    ],
    complianceLogs: [
      { id: 'log-10', timestampSec: 92, gameClock: '04:10 Q1', quarter: 1, executedCorrectly: true, coachDirectiveFollowed: true, pointsScored: 2, playersInvolved: [0, 9], notes: 'Palla rubata su trappola laterale e schiacciata immediata.' }
    ]
  },
  {
    id: 'play-8',
    title: 'Difesa Box-and-1 su Tiratore Principale',
    type: 'defensive',
    category: 'Difesa Mista / Box & 1 (MVP Academy)',
    coachDirective: 'Quattro giocatori posizionati a quadrato (Box) a zona a protezione dell\'area, mentre il miglior difensore (#9) effettua una marcatura asfissiante uomo a uomo a tutto campo sul tiratore primario avversario.',
    targetExecutions: 5,
    actualExecutions: 5,
    complianceRate: 100.0,
    pointsGenerated: 0,
    ppp: 0.60,
    keyActionDescription: 'Annullamento totale del terminale offensivo avversario (0 tiri aperti)',
    nodes: [
      { id: 'd-1', label: 'D2 (SG - Chaser)', role: 'DEF', number: 9, x: 50, y: 75, isOffense: false },
      { id: 'd-2', label: 'D1 (PG)', role: 'DEF', number: 0, x: 30, y: 50, isOffense: false },
      { id: 'd-3', label: 'D3 (SF)', role: 'DEF', number: 7, x: 70, y: 50, isOffense: false },
      { id: 'd-4', label: 'D4 (PF)', role: 'DEF', number: 42, x: 30, y: 22, isOffense: false },
      { id: 'd-5', label: 'D5 (C)', role: 'DEF', number: 8, x: 70, y: 22, isOffense: false },
    ],
    actions: [
      { id: 'a-1', type: 'cut', start: { x: 50, y: 75 }, end: { x: 50, y: 68 }, label: 'Face-Guard Asfissiante' },
      { id: 'a-2', type: 'screen', start: { x: 30, y: 22 }, end: { x: 50, y: 15 }, label: 'Chiusura Area' },
    ],
    complianceLogs: [
      { id: 'log-box-1', timestampSec: 280, gameClock: '03:40 Q2', quarter: 2, executedCorrectly: true, coachDirectiveFollowed: true, pointsScored: 0, playersInvolved: [9, 0, 8], notes: 'Tiratore avversario isolato e costretto a forzare fuori equilibrio.' }
    ]
  }
];

export const INITIAL_ROBOFLOW_VIOLATIONS: RoboflowViolation[] = [
  {
    id: 'viol-1',
    type: 'TRAVEL',
    name: 'Infrazione di Passi (Travel)',
    playerNumber: 11,
    playerName: 'Jalen Brunson',
    team: 'away',
    timestampSec: 62,
    gameClock: '07:15 Q1',
    frameConfidence: 0.96,
    description: '3 appoggi del piede perno rilevati dal modulo Foot-Plant di Roboflow prima del rilascio del palleggio.',
    notebookSource: 'roboflow/notebooks/basketball_travel_detection.ipynb'
  },
  {
    id: 'viol-2',
    type: '3_SEC_PAINT',
    name: '3 Secondi in Area (Key Occupancy)',
    playerNumber: 23,
    playerName: 'M. Robinson',
    team: 'away',
    timestampSec: 154,
    gameClock: '10:50 Q2',
    frameConfidence: 0.98,
    description: 'Permanenza ininterrotta nel pitturato offensivo per 3.7 secondi misurata con poligono di omografia.',
    notebookSource: 'roboflow/notebooks/key_occupancy_timer.ipynb'
  },
  {
    id: 'viol-3',
    type: 'FOOT_ON_LINE',
    name: 'Piede sulla Riga da 3 (Foot on Line)',
    playerNumber: 25,
    playerName: 'Mikal Bridges',
    team: 'away',
    timestampSec: 210,
    gameClock: '06:45 Q2',
    frameConfidence: 0.99,
    description: 'La punta della scarpa tocca la linea dei 3 punti durante lo stacco. Tiro riclassificato da 3PT a 2PT lungo.',
    notebookSource: 'roboflow/notebooks/court_line_intersection_sam.ipynb'
  },
  {
    id: 'viol-4',
    type: '8_SEC_BACKCOURT',
    name: '8 Secondi Metà Campo (Backcourt)',
    playerNumber: 11,
    playerName: 'Jalen Brunson',
    team: 'away',
    timestampSec: 295,
    gameClock: '03:10 Q2',
    frameConfidence: 0.94,
    description: 'Pressing 2-2-1 efficace: la palla non supera la linea di metà campo entro 8.0 secondi dal possesso.',
    notebookSource: 'roboflow/notebooks/backcourt_clock_timer.ipynb'
  }
];
