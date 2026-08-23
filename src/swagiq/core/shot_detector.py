import cv2

def detect_shot_like_events(video_path: str, min_area: int = 700, cooldown_frames: int = 35) -> dict:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Impossibile aprire video: {video_path}")

    prev_gray = None
    frame_idx = 0
    last_event = -10**9
    events = []

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (5, 5), 0)

        if prev_gray is not None:
            diff = cv2.absdiff(prev_gray, gray)
            _, th = cv2.threshold(diff, 28, 255, cv2.THRESH_BINARY)
            th = cv2.dilate(th, None, iterations=2)
            contours, _ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            motion_score = 0
            for c in contours:
                area = cv2.contourArea(c)
                if area >= min_area:
                    motion_score += area

            # soglia più alta + cooldown più lungo => meno falsi positivi
            if motion_score > 45000 and (frame_idx - last_event) > cooldown_frames:
                events.append({
                    "frame": frame_idx,
                    "motion_score": int(motion_score)
                })
                last_event = frame_idx

        prev_gray = gray
        frame_idx += 1

    fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
    cap.release()

    for e in events:
        e["time_sec"] = round(e["frame"] / fps, 2) if fps > 0 else None

    return {
        "estimated_shot_events": len(events),
        "events": events[:200]
    }
