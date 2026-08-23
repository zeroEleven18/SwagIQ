import argparse
import glob
import json
import os
import subprocess
import sys
from pathlib import Path
from datetime import datetime

def run_pipeline(video_path: str, preset: str):
    cmd = [
        sys.executable, "-m", "swagiq.main_pipeline",
        "--video", video_path,
        "--preset", preset
    ]
    env = os.environ.copy()
    env["PYTHONPATH"] = "src"

    before = set(glob.glob("output/report_*.json"))
    p = subprocess.run(cmd, capture_output=True, text=True, env=env)
    after = set(glob.glob("output/report_*.json"))
    new_files = sorted(list(after - before), key=os.path.getmtime)

    if p.returncode != 0:
        return None, p.stdout, p.stderr, p.returncode

    if not new_files:
        all_files = sorted(glob.glob("output/report_*.json"), key=os.path.getmtime)
        if not all_files:
            return None, p.stdout, "Nessun report trovato in output/", 2
        report_file = all_files[-1]
    else:
        report_file = new_files[-1]

    with open(report_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    return (report_file, data), p.stdout, p.stderr, 0

def extract_metrics(report_json: dict):
    sd = report_json.get("shot_detection", {})
    return {
        "all": sd.get("estimated_shot_events", 0),
        "trusted": sd.get("trusted_events_count", 0),
        "merged": sd.get("trusted_events_merged_count", 0),
        "ratio": sd.get("trusted_ratio", 0.0),
    }

def fmt_row(cols, widths):
    return " | ".join(str(c).ljust(w) for c, w in zip(cols, widths))

def main():
    ap = argparse.ArgumentParser(description="Confronta preset conservative/aggressive su tutti i video")
    ap.add_argument("--videos-glob", default="data/video/*.mp4", help="Glob video input")
    ap.add_argument("--presets", nargs="+", default=["conservative", "aggressive"], help="Preset da confrontare")
    ap.add_argument("--save-json", default="", help="Path output JSON comparativo (opzionale)")
    args = ap.parse_args()

    videos = sorted(glob.glob(args.videos_glob))
    if not videos:
        print(f"Nessun video trovato con glob: {args.videos_glob}")
        sys.exit(1)

    Path("output").mkdir(parents=True, exist_ok=True)

    results = []
    print(f"Trovati {len(videos)} video. Presets: {', '.join(args.presets)}")
    print("-" * 80)

    for v in videos:
        vname = os.path.basename(v)
        for preset in args.presets:
            out, stdout, stderr, code = run_pipeline(v, preset)
            if code != 0:
                print(f"[ERRORE] {vname} preset={preset} code={code}")
                if stdout.strip():
                    print(stdout.strip())
                if stderr.strip():
                    print(stderr.strip())
                continue

            report_file, report_json = out
            m = extract_metrics(report_json)
            results.append({
                "video": vname,
                "preset": preset,
                "report_file": report_file,
                **m
            })
            print(f"[OK] {vname} preset={preset} -> all={m['all']} trusted={m['trusted']} merged={m['merged']} ratio={m['ratio']}")

    if not results:
        print("Nessun risultato valido.")
        sys.exit(2)

    # tabella
    print("\nRISULTATI")
    headers = ["video", "preset", "all", "trusted", "merged", "ratio", "report_file"]
    rows = []
    for r in results:
        rows.append([
            r["video"], r["preset"], r["all"], r["trusted"], r["merged"], r["ratio"], os.path.basename(r["report_file"])
        ])

    widths = [max(len(str(h)), *(len(str(row[i])) for row in rows)) for i, h in enumerate(headers)]
    print(fmt_row(headers, widths))
    print("-+-".join("-" * w for w in widths))
    for row in rows:
        print(fmt_row(row, widths))

    # mini-summary per video: delta aggressive - conservative sul merged
    by_video = {}
    for r in results:
        by_video.setdefault(r["video"], {})[r["preset"]] = r

    print("\nDELTA (aggressive - conservative) su 'merged'")
    print("video | delta_merged | cons_merged | aggr_merged")
    print("------|--------------|-------------|------------")
    for v in sorted(by_video.keys()):
        cons = by_video[v].get("conservative")
        aggr = by_video[v].get("aggressive")
        if cons and aggr:
            delta = aggr["merged"] - cons["merged"]
            print(f"{v} | {delta:+d} | {cons['merged']} | {aggr['merged']}")
        else:
            print(f"{v} | n/a | n/a | n/a")

    if args.save_json:
        payload = {
            "generated_at": datetime.now().isoformat(),
            "videos_glob": args.videos_glob,
            "presets": args.presets,
            "results": results
        }
        with open(args.save_json, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
        print(f"\nSalvato JSON comparativo: {args.save_json}")

if __name__ == "__main__":
    main()
