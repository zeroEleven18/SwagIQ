import argparse
from swagiq.core.video_processor import analyze_video
from swagiq.core.shot_detector import detect_shot_like_events
from swagiq.export.report_generator import save_report

def main():
    parser = argparse.ArgumentParser(description="SwagIQ MVP pipeline")
    parser.add_argument("--video", required=True, help="Path del video input")
    parser.add_argument("--sample", type=int, default=30, help="Campiona 1 frame ogni N")
    args = parser.parse_args()

    report = analyze_video(args.video, sample_every_n_frames=args.sample)
    report["shot_detection"] = detect_shot_like_events(args.video)

    out = save_report(report, output_dir="output")
    print(f"✅ Analisi completata. Report: {out}")

if __name__ == "__main__":
    main()
