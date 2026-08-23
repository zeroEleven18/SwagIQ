"""
SwagIQ FastAPI Dashboard
Modern web interface for basketball analytics
Features: Video upload, real-time processing, statistics visualization, PDF export
"""

from fastapi import FastAPI, UploadFile, File, WebSocket, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Callable
from pathlib import Path
import asyncio
import logging
from datetime import datetime
import json
import uuid
import os

# Import SwagIQ modules
from main_pipeline import BasketballAnalyticsPipeline, PipelineConfig, DetectionSource

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SwagIQ Basketball Analytics",
    description="Advanced basketball video analytics and scouting platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create static files directory
STATIC_DIR = Path("static")
STATIC_DIR.mkdir(exist_ok=True)

# Serve static files
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# ============================================================================
# DATA MODELS
# ============================================================================

class ProcessingTask(BaseModel):
    """Model per un task di processing"""
    task_id: str
    status: str  # pending, processing, completed, failed
    progress: float
    video_filename: str
    home_team: str
    away_team: str
    created_at: str
    output_files: Dict = {}
    error: Optional[str] = None


class PlayerInfo(BaseModel):
    """Informazioni su un giocatore"""
    player_id: int
    name: str
    jersey_number: int
    team: str


class GameSetup(BaseModel):
    """Setup della partita"""
    home_team: str
    away_team: str
    location: Optional[str] = ""
    date: Optional[str] = ""
    home_players: List[PlayerInfo]
    away_players: List[PlayerInfo]


class ProcessingRequest(BaseModel):
    """Request per iniziare il processing"""
    task_id: str
    video_filename: str
    game_setup: GameSetup
    confidence_threshold: float = 0.5


class StatisticsResponse(BaseModel):
    """Response con le statistiche"""
    task_id: str
    game_summary: Dict
    home_team_stats: Dict
    away_team_stats: Dict
    top_performers: List[Dict]


# ============================================================================
# IN-MEMORY TASK MANAGER
# ============================================================================

class TaskManager:
    """Gestisce i task di processing"""
    
    def __init__(self):
        self.tasks: Dict[str, ProcessingTask] = {}
        self.active_pipelines: Dict[str, BasketballAnalyticsPipeline] = {}
    
    def create_task(self, video_filename: str, home_team: str, away_team: str) -> str:
        """Crea un nuovo task"""
        task_id = str(uuid.uuid4())
        
        task = ProcessingTask(
            task_id=task_id,
            status="pending",
            progress=0,
            video_filename=video_filename,
            home_team=home_team,
            away_team=away_team,
            created_at=datetime.now().isoformat()
        )
        
        self.tasks[task_id] = task
        logger.info(f"Task created: {task_id}")
        
        return task_id
    
    def get_task(self, task_id: str) -> Optional[ProcessingTask]:
        """Recupera un task"""
        return self.tasks.get(task_id)
    
    def update_task_progress(self, task_id: str, progress: float):
        """Aggiorna il progresso di un task"""
        if task_id in self.tasks:
            self.tasks[task_id].progress = min(progress, 100.0)
    
    def complete_task(self, task_id: str, output_files: Dict):
        """Completa un task"""
        if task_id in self.tasks:
            self.tasks[task_id].status = "completed"
            self.tasks[task_id].progress = 100.0
            self.tasks[task_id].output_files = output_files
            logger.info(f"Task completed: {task_id}")
    
    def fail_task(self, task_id: str, error: str):
        """Segna un task come fallito"""
        if task_id in self.tasks:
            self.tasks[task_id].status = "failed"
            self.tasks[task_id].error = error
            logger.error(f"Task failed: {task_id} - {error}")
    
    def list_tasks(self) -> List[ProcessingTask]:
        """Lista tutti i task"""
        return list(self.tasks.values())


task_manager = TaskManager()
connected_clients: Dict[str, WebSocket] = {}


# ============================================================================
# WEBSOCKET HANDLER
# ============================================================================

@app.websocket("/ws/progress/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str):
    """WebSocket per real-time progress updates"""
    await websocket.accept()
    connected_clients[task_id] = websocket
    
    try:
        while True:
            # Invia aggiornamenti di progresso
            task = task_manager.get_task(task_id)
            if task:
                await websocket.send_json({
                    "task_id": task_id,
                    "status": task.status,
                    "progress": task.progress,
                    "error": task.error
                })
            
            await asyncio.sleep(1)
    
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        connected_clients.pop(task_id, None)


async def broadcast_progress(task_id: str, progress: float):
    """Invia aggiornamenti di progresso a tutti i client"""
    if task_id in connected_clients:
        try:
            await connected_clients[task_id].send_json({
                "task_id": task_id,
                "progress": progress
            })
        except Exception as e:
            logger.error(f"Error broadcasting: {str(e)}")


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint - restituisce info API"""
    return {
        "name": "SwagIQ Basketball Analytics API",
        "version": "1.0.0",
        "endpoints": {
            "upload": "/api/upload",
            "process": "/api/process",
            "statistics": "/api/statistics/{task_id}",
            "tasks": "/api/tasks",
            "dashboard": "/dashboard"
        }
    }


@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)) -> Dict:
    """Upload un video"""
    try:
        # Crea directory per i video
        upload_dir = Path("data/videos")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Salva il file
        file_path = upload_dir / file.filename
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logger.info(f"Video uploaded: {file.filename}")
        
        return {
            "status": "success",
            "filename": file.filename,
            "path": str(file_path),
            "size": len(content)
        }
    
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/process")
async def start_processing(request: ProcessingRequest, background_tasks: BackgroundTasks) -> Dict:
    """Inizia il processing di un video"""
    try:
        task_id = request.task_id
        
        # Aggiorna task a "processing"
        task = task_manager.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        task.status = "processing"
        
        # Aggiungi il task di processing come background task
        background_tasks.add_task(
            process_video_background,
            task_id,
            request
        )
        
        logger.info(f"Processing started for task: {task_id}")
        
        return {
            "status": "processing",
            "task_id": task_id,
            "message": "Video processing started"
        }
    
    except Exception as e:
        logger.error(f"Error starting processing: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


async def process_video_background(task_id: str, request: ProcessingRequest):
    """Background task per il processing del video"""
    try:
        config = PipelineConfig(
            roboflow_api_key=os.getenv("ROBOFLOW_API_KEY", ""),
            roboflow_project="basketball-players",
            roboflow_version=1,
            video_source=str(Path("data/videos") / request.video_filename),
            source_type=DetectionSource.LOCAL_FILE,
            output_dir=Path("output") / task_id
        )
        
        pipeline = BasketballAnalyticsPipeline(config)
        task_manager.active_pipelines[task_id] = pipeline
        
        # Callback per aggiornamenti
        def progress_callback(progress_data):
            task_manager.update_task_progress(
                task_id,
                progress_data.get("progress", 0)
            )
            asyncio.run(broadcast_progress(
                task_id,
                progress_data.get("progress", 0)
            ))
        
        # Processa il video
        results = pipeline.run_complete_pipeline(
            home_team=request.game_setup.home_team,
            away_team=request.game_setup.away_team,
            home_players=[p.dict() for p in request.game_setup.home_players],
            away_players=[p.dict() for p in request.game_setup.away_players],
            progress_callback=progress_callback
        )
        
        # Salva i risultati
        output_files = {
            "summary": str(config.output_dir / "summary.json"),
            "statistics": str(config.output_dir / "statistics.json"),
        }
        
        # Aggiungi PDF se generato
        pdf_files = list((config.output_dir / "reports").glob("*.pdf"))
        if pdf_files:
            output_files["pdf"] = str(pdf_files[0])
        
        # Completa il task
        task_manager.complete_task(task_id, output_files)
        
        logger.info(f"Processing completed for task: {task_id}")
    
    except Exception as e:
        logger.error(f"Error in background processing: {str(e)}")
        task_manager.fail_task(task_id, str(e))


@app.get("/api/tasks")
async def list_tasks() -> Dict:
    """Lista tutti i task"""
    tasks = task_manager.list_tasks()
    return {
        "tasks": [
            {
                "task_id": t.task_id,
                "status": t.status,
                "progress": t.progress,
                "video_filename": t.video_filename,
                "home_team": t.home_team,
                "away_team": t.away_team,
                "created_at": t.created_at
            }
            for t in tasks
        ]
    }


@app.get("/api/tasks/{task_id}")
async def get_task(task_id: str) -> Dict:
    """Recupera un task specifico"""
    task = task_manager.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {
        "task_id": task.task_id,
        "status": task.status,
        "progress": task.progress,
        "video_filename": task.video_filename,
        "home_team": task.home_team,
        "away_team": task.away_team,
        "created_at": task.created_at,
        "output_files": task.output_files,
        "error": task.error
    }


@app.post("/api/create-task")
async def create_task(game_setup: GameSetup, video_filename: str) -> Dict:
    """Crea un nuovo task di processing"""
    try:
        task_id = task_manager.create_task(
            video_filename,
            game_setup.home_team,
            game_setup.away_team
        )
        
        return {
            "status": "created",
            "task_id": task_id,
            "next_step": f"/api/process"
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/statistics/{task_id}")
async def get_statistics(task_id: str) -> Dict:
    """Recupera le statistiche di un task"""
    task = task_manager.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.status != "completed":
        raise HTTPException(status_code=400, detail="Task not completed")
    
    # Carica le statistiche dal file
    stats_file = Path(task.output_files.get("statistics", ""))
    if stats_file.exists():
        with open(stats_file) as f:
            statistics = json.load(f)
        return statistics
    
    raise HTTPException(status_code=404, detail="Statistics file not found")


@app.get("/api/download/{task_id}/{file_type}")
async def download_file(task_id: str, file_type: str) -> FileResponse:
    """Scarica un file di output"""
    task = task_manager.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    file_path = Path(task.output_files.get(file_type, ""))
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename=file_path.name,
        media_type="application/octet-stream"
    )


@app.get("/health")
async def health_check() -> Dict:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_tasks": len([t for t in task_manager.list_tasks() if t.status == "processing"])
    }


# ============================================================================
# HTML DASHBOARD
# ============================================================================

@app.get("/dashboard")
async def dashboard():
    """Dashboard HTML"""
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SwagIQ Basketball Analytics</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                overflow: hidden;
            }
            
            header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            
            header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
            }
            
            .content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                padding: 30px;
            }
            
            .section {
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 20px;
            }
            
            .section h2 {
                color: #333;
                margin-bottom: 20px;
                border-bottom: 2px solid #667eea;
                padding-bottom: 10px;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            label {
                display: block;
                margin-bottom: 5px;
                color: #555;
                font-weight: 500;
            }
            
            input, select {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
            }
            
            button {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 30px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                transition: transform 0.2s;
            }
            
            button:hover {
                transform: translateY(-2px);
            }
            
            .progress-container {
                margin-top: 20px;
            }
            
            .progress-bar {
                width: 100%;
                height: 30px;
                background: #f0f0f0;
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                width: 0%;
                transition: width 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
            }
            
            .task-list {
                margin-top: 20px;
            }
            
            .task-item {
                background: #f9f9f9;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 10px;
                border-left: 4px solid #667eea;
            }
            
            .status-badge {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                margin-top: 10px;
            }
            
            .status-processing {
                background: #fff3cd;
                color: #856404;
            }
            
            .status-completed {
                background: #d4edda;
                color: #155724;
            }
            
            .status-failed {
                background: #f8d7da;
                color: #721c24;
            }
            
            @media (max-width: 768px) {
                .content {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>🏀 SwagIQ Basketball Analytics</h1>
                <p>Advanced Video Analysis & Scouting Platform</p>
            </header>
            
            <div class="content">
                <!-- Upload Section -->
                <div class="section">
                    <h2>📹 Upload Video</h2>
                    <div class="form-group">
                        <label>Video File</label>
                        <input type="file" id="videoFile" accept="video/*">
                    </div>
                    <button onclick="uploadVideo()">Upload</button>
                </div>
                
                <!-- Game Setup Section -->
                <div class="section">
                    <h2>🎮 Game Setup</h2>
                    <div class="form-group">
                        <label>Home Team</label>
                        <input type="text" id="homeTeam" placeholder="e.g., Lakers">
                    </div>
                    <div class="form-group">
                        <label>Away Team</label>
                        <input type="text" id="awayTeam" placeholder="e.g., Celtics">
                    </div>
                    <button onclick="startProcessing()">Start Analysis</button>
                </div>
                
                <!-- Progress Section -->
                <div class="section">
                    <h2>⏳ Processing Progress</h2>
                    <div id="progressContainer" class="progress-container" style="display:none;">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill" style="width: 0%;">0%</div>
                        </div>
                        <p id="statusText">Waiting to start...</p>
                    </div>
                </div>
                
                <!-- Tasks Section -->
                <div class="section">
                    <h2>📋 Active Tasks</h2>
                    <div class="task-list" id="taskList"></div>
                </div>
            </div>
        </div>
        
        <script>
            let currentTaskId = null;
            let uploadedFilename = null;
            
            async function uploadVideo() {
                const fileInput = document.getElementById('videoFile');
                if (!fileInput.files.length) {
                    alert('Please select a video file');
                    return;
                }
                
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
                uploadedFilename = fileInput.files[0].name;
                
                try {
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    const result = await response.json();
                    alert('Video uploaded: ' + result.filename);
                } catch (error) {
                    alert('Upload failed: ' + error);
                }
            }
            
            async function startProcessing() {
                const homeTeam = document.getElementById('homeTeam').value;
                const awayTeam = document.getElementById('awayTeam').value;
                
                if (!homeTeam || !awayTeam || !uploadedFilename) {
                    alert('Please fill all fields and upload a video');
                    return;
                }
                
                try {
                    // Create task
                    const createResponse = await fetch('/api/create-task?video_filename=' + uploadedFilename, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            home_team: homeTeam,
                            away_team: awayTeam,
                            location: '',
                            date: new Date().toISOString(),
                            home_players: [],
                            away_players: []
                        })
                    });
                    
                    const createResult = await createResponse.json();
                    currentTaskId = createResult.task_id;
                    
                    // Show progress
                    document.getElementById('progressContainer').style.display = 'block';
                    
                    // Start processing
                    const processResponse = await fetch('/api/process', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            task_id: currentTaskId,
                            video_filename: uploadedFilename,
                            game_setup: {
                                home_team: homeTeam,
                                away_team: awayTeam,
                                home_players: [],
                                away_players: []
                            }
                        })
                    });
                    
                    // Connect WebSocket for updates
                    connectWebSocket(currentTaskId);
                    
                } catch (error) {
                    alert('Error starting processing: ' + error);
                }
            }
            
            function connectWebSocket(taskId) {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const ws = new WebSocket(protocol + '//' + window.location.host + '/ws/progress/' + taskId);
                
                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    updateProgress(data.progress);
                };
                
                ws.onerror = () => {
                    console.error('WebSocket error');
                };
            }
            
            function updateProgress(progress) {
                document.getElementById('progressFill').style.width = progress + '%';
                document.getElementById('progressFill').textContent = Math.round(progress) + '%';
                document.getElementById('statusText').textContent = 'Processing: ' + Math.round(progress) + '%';
            }
            
            // Refresh tasks every 5 seconds
            setInterval(async () => {
                try {
                    const response = await fetch('/api/tasks');
                    const result = await response.json();
                    updateTaskList(result.tasks);
                } catch (error) {
                    console.error('Error fetching tasks:', error);
                }
            }, 5000);
            
            function updateTaskList(tasks) {
                const taskList = document.getElementById('taskList');
                taskList.innerHTML = tasks.map(task => `
                    <div class="task-item">
                        <strong>${task.home_team} vs ${task.away_team}</strong>
                        <p>${task.video_filename}</p>
                        <span class="status-badge status-${task.status}">${task.status}</span>
                    </div>
                `).join('');
            }
        </script>
    </body>
    </html>
    """
    
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=html_content)


if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting SwagIQ API Server...")
    logger.info("Dashboard: http://localhost:8000/dashboard")
    logger.info("API Docs: http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
