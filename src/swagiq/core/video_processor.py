from pathlib import Path
import cv2

def analyze_video(video_path: str, sample_every_n_frames: int = 30) -> dict:
    p = Path(video_path)
    if not p.exists():
        raise FileNotFoundError(f"Video non trovato: {video_path}")

    cap = cv2.VideoCapture(str(p))
    if not cap.isOpened():
        raise RuntimeError(f"Impossibile aprire il video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)

    sampled = 0
    idx = 0
    while True:
        ok, _ = cap.read()
        if not ok:
            break
        if idx % max(1, sample_every_n_frames) == 0:
            sampled += 1
        idx += 1

    cap.release()

    duration_sec = (total_frames / fps) if fps > 0 else 0.0
    return {
        "video_path": str(p),
        "fps": fps,
        "total_frames": total_frames,
        "duration_sec": round(duration_sec, 2),
        "resolution": {"width": width, "height": height},
        "sample_every_n_frames": sample_every_n_frames,
        "sampled_frames": sampled
    }
