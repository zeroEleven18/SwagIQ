import cv2
from collections import deque

def _confidence_from_score(score: float) -> str:
    if score >= 90000:
        return "high"
    if score >= 60000:
        return "medium"
    return "low"

def _merge_events_by_time(events, merge_window_sec=1.0):
    if not events:
        return []

    merged = []
    current = dict(events[0])
    current["merged_count"] = 1

    for e in events[1:]:
        t1 = current.get("time_sec")
        t2 = e.get("time_sec")
        dt = (t2 - t1) if (t1 is not None and t2 is not None) else 999

        if dt <= merge_window_sec:
            current["merged_count"] += 1
            if e["motion_score"] > current["motion_score"]:
                current["frame"] = e["frame"]
                current["time_sec"] = e["time_sec"]
                current["motion_score"] = e["motion_score"]
                current["confidence"] = e["confidence"]
        else:
            merged.append(current)
            current = dict(e)
            current["merged_count"] = 1

    merged.append(current)
    return merged

def detect_shot_like_events(
    video_path: str,
    min_area: int = 700,
    cooldown_frames: int = 35,
    merge_window_sec: float = 1.0,
    threshold_binary: int = 28,
    motion_score_threshold: float = 45000,
    confirm_hits: int = 2,          # nuovo: hit minime per confermare evento
    confirm_window_frames: int = 6  # nuovo: finestra frame per le hit
) -> dict:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Impossibile aprire video: {video_path}")

    prev_gray = None
    frame_idx = 0
    last_event = -10**9
    events = []

    # buffer hit recenti per conferma temporale
    hit_frames = deque()

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (5, 5), 0)

        if prev_gray is not None:
            diff = cv2.absdiff(prev_gray, gray)
            _, th = cv2.threshold(diff, threshold_binary, 255, cv2.THRESH_BINARY)
            th = cv2.dilate(th, None, iterations=2)
            contours, _ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            motion_score = 0.0
            for c in contours:
                area = cv2.contourArea(c)
                if area >= min_area:
                    motion_score += area

            # registra hit candidate
            if motion_score > motion_score_threshold:
                hit_frames.append((frame_idx, motion_score))

            # pulizia hit vecchie dalla finestra
            while hit_frames and (frame_idx - hit_frames[0][0] > confirm_window_frames):
                hit_frames.popleft()

            # conferma evento solo con coerenza temporale
            confirmed = len(hit_frames) >= confirm_hits
            if confirmed and (frame_idx - last_event) > cooldown_frames:
                # usa la hit più forte nella finestra
                best_frame, best_score = max(hit_frames, key=lambda x: x[1])
                conf = _confidence_from_score(best_score)
                events.append({
                    "frame": int(best_frame),
                    "motion_score": int(best_score),
                    "confidence": conf
                })
                last_event = frame_idx
                hit_frames.clear()

        prev_gray = gray
        frame_idx += 1

    fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
    cap.release()

    conf_count = {"high": 0, "medium": 0, "low": 0}
    for e in events:
        e["time_sec"] = round(e["frame"] / fps, 2) if fps > 0 else None
        conf_count[e["confidence"]] += 1

    trusted = [e for e in events if e["confidence"] in ("medium", "high")]
    merged_trusted = _merge_events_by_time(trusted, merge_window_sec=merge_window_sec)

    return {
        "estimated_shot_events": len(events),
        "confidence_breakdown": conf_count,
        "trusted_events_count": len(trusted),
        "trusted_ratio": round((len(trusted) / len(events)), 3) if events else 0.0,
        "trusted_events_merged_count": len(merged_trusted),
        "merge_window_sec": merge_window_sec,
        "parameters": {
            "min_area": min_area,
            "threshold_binary": threshold_binary,
            "motion_score_threshold": motion_score_threshold,
            "cooldown_frames": cooldown_frames,
            "confirm_hits": confirm_hits,
            "confirm_window_frames": confirm_window_frames
        },
        "events": events[:200],
        "trusted_events": trusted[:200],
        "trusted_events_merged": merged_trusted[:200]
    }
