import argparse
from pathlib import Path
import yaml

from swagiq.core.video_processor import analyze_video
from swagiq.core.shot_detector import detect_shot_like_events
from swagiq.export.report_generator import save_report

def load_config(path: str):
    p = Path(path)
    if not p.exists():
        return {}
    with p.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}

def resolve_preset(cfg: dict, preset_name: str | None):
    presets = cfg.get("presets", {})
    default_preset = cfg.get("default_preset")

    selected = preset_name or default_preset
    if not selected:
        return {}, {}, "none"

    if selected not in presets:
        available = ", ".join(presets.keys()) if presets else "(nessuno)"
        raise ValueError(f"Preset '{selected}' non trovato. Disponibili: {available}")

    node = presets[selected] or {}
    shot_cfg = node.get("shot_detector", {}) or {}
    pipe_cfg = node.get("pipeline", {}) or {}
    return shot_cfg, pipe_cfg, selected

def main():
    parser = argparse.ArgumentParser(description="SwagIQ MVP pipeline")
    parser.add_argument("--video", required=True, help="Path del video input")
    parser.add_argument("--sample", type=int, default=None, help="Campiona 1 frame ogni N (override)")
    parser.add_argument("--config", default="config/tune_config.yaml", help="Path config YAML")
    parser.add_argument("--preset", default=None, help="Preset tuning (es: conservative, aggressive)")
    args = parser.parse_args()

    cfg = load_config(args.config)
    shot_cfg, pipe_cfg, preset_used = resolve_preset(cfg, args.preset)

    sample_every = args.sample if args.sample is not None else pipe_cfg.get("sample_every_n_frames", 30)

    report = analyze_video(args.video, sample_every_n_frames=sample_every)
    report["config_used"] = {
        "config_path": args.config,
        "preset": preset_used,
        "sample_every_n_frames": sample_every,
        "shot_detector": shot_cfg
    }

    report["shot_detection"] = detect_shot_like_events(
        args.video,
        min_area=shot_cfg.get("min_area", 700),
        cooldown_frames=shot_cfg.get("cooldown_frames", 35),
        merge_window_sec=shot_cfg.get("merge_window_sec", 1.0),
        threshold_binary=shot_cfg.get("threshold_binary", 28),
        motion_score_threshold=shot_cfg.get("motion_score_threshold", 45000),
    )

    out = save_report(report, output_dir="output")
    print(f"✅ Analisi completata. Report: {out} (preset={preset_used})")

if __name__ == "__main__":
    main()
