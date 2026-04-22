"""
ETL Pipeline — Rappi Store Availability
Reads 201+ CSV files, deduplicates, aggregates and exports data.json
Usage: python3 data-pipeline/etl.py
"""
import glob
import json
import statistics
from collections import defaultdict
from datetime import datetime
from pathlib import Path

SRC_GLOB = Path(__file__).parent.parent / "data" / "*.csv"
OUT_DIR  = Path(__file__).parent / "output"
OUT_FILE = OUT_DIR / "data.json"


def parse_timestamp(col_name: str) -> datetime | None:
    """Extract datetime from column header like 'Mon Feb 09 2026 12:59:40 GMT-0500 ...'"""
    try:
        ts_str = col_name.split(" GMT")[0].strip()
        return datetime.strptime(ts_str, "%a %b %d %Y %H:%M:%S")
    except (ValueError, IndexError):
        return None


def load_all_csvs() -> list[dict]:
    import csv
    records: list[dict] = []
    files = glob.glob(str(SRC_GLOB))
    if not files:
        raise FileNotFoundError(f"No CSV files found matching {SRC_GLOB}")

    for path in files:
        with open(path, newline="", encoding="utf-8-sig") as fh:
            reader = csv.DictReader(fh)
            headers = reader.fieldnames or []
            time_cols = headers[4:]  # First 4 are metadata columns

            for row in reader:
                metric = row.get("metric (sf_metric)", "")
                for col in time_cols:
                    ts = parse_timestamp(col)
                    raw = row.get(col, "").strip()
                    if ts and raw:
                        try:
                            records.append({"metric": metric, "ts": ts, "value": float(raw)})
                        except ValueError:
                            pass
    return records


def deduplicate(records: list[dict]) -> list[dict]:
    seen: set[tuple] = set()
    out: list[dict] = []
    for r in records:
        key = (r["ts"], r["metric"])
        if key not in seen:
            seen.add(key)
            out.append(r)
    return sorted(out, key=lambda x: x["ts"])


def aggregate(records: list[dict]) -> dict:
    # ── 5-min downsample ──────────────────────────────────────────────────────
    minute_buckets: dict[str, list[float]] = defaultdict(list)
    for r in records:
        bucket = r["ts"].strftime("%Y-%m-%dT%H:%M") + ":00"
        minute_buckets[bucket].append(r["value"])

    series5min = [
        {"ts": ts, "value": round(statistics.mean(vs))}
        for ts, vs in sorted(minute_buckets.items())
        if int(ts[14:16]) % 5 == 0  # keep only :00, :05, :10, ...
    ]

    # ── Hourly ────────────────────────────────────────────────────────────────
    hourly_buckets: dict[str, list[float]] = defaultdict(list)
    for r in records:
        bucket = r["ts"].strftime("%Y-%m-%dT%H:00:00")
        hourly_buckets[bucket].append(r["value"])

    hourly = [
        {
            "ts": ts,
            "avg": round(statistics.mean(vs)),
            "max": round(max(vs)),
            "min": round(min(vs)),
        }
        for ts, vs in sorted(hourly_buckets.items())
    ]

    # ── Daily ─────────────────────────────────────────────────────────────────
    daily_buckets: dict[str, list[float]] = defaultdict(list)
    for r in records:
        daily_buckets[r["ts"].strftime("%Y-%m-%d")].append(r["value"])

    daily = []
    for date, vs in sorted(daily_buckets.items()):
        sv = sorted(vs)
        n  = len(sv)
        # compute uptime: % of readings > 10_000 stores
        up5min = [
            p for p in series5min
            if p["ts"].startswith(date) and p["value"] > 10_000
        ]
        all5min = [p for p in series5min if p["ts"].startswith(date)]
        uptime_pct = round(len(up5min) / len(all5min) * 100, 1) if all5min else 0.0

        daily.append({
            "date":       date,
            "avg":        round(statistics.mean(vs)),
            "max":        round(max(vs)),
            "min":        round(min(vs)),
            "median":     round(statistics.median(vs)),
            "p95":        round(sv[int(0.95 * n)]),
            "uptime_pct": uptime_pct,
        })

    # ── Hour-of-day ───────────────────────────────────────────────────────────
    hod_buckets: dict[int, list[float]] = defaultdict(list)
    for h in hourly:
        hod_buckets[int(h["ts"][11:13])].append(h["avg"])

    hod = [
        {"hour": hour, "avg": round(statistics.mean(hod_buckets.get(hour, [0])))}
        for hour in range(24)
    ]

    # ── Day-of-week ───────────────────────────────────────────────────────────
    dow_map: dict[str, list[int]] = defaultdict(list)
    for d in daily:
        name = datetime.strptime(d["date"], "%Y-%m-%d").strftime("%A")
        dow_map[name].append(d["avg"])

    dow_order = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    dow_series = [
        {"day": name[:3], "avg": round(statistics.mean(dow_map[name]))}
        for name in dow_order
        if name in dow_map
    ]

    # ── Volatility (coefficient of variation per hour) ────────────────────────
    hod_for_vol: dict[int, list[float]] = defaultdict(list)
    for h in hourly:
        hod_for_vol[int(h["ts"][11:13])].append(h["avg"])

    volatility = []
    for hour in range(24):
        vs = hod_for_vol.get(hour, [0])
        mean = statistics.mean(vs)
        cv = round(statistics.stdev(vs) / mean * 100, 1) if len(vs) > 1 and mean > 0 else 0.0
        volatility.append({"hour": hour, "cv": cv})

    # ── Uptime list ───────────────────────────────────────────────────────────
    uptime = [{"date": d["date"], "uptime_pct": d["uptime_pct"]} for d in daily]

    # ── Stats ─────────────────────────────────────────────────────────────────
    all_vals = [r["value"] for r in records]
    stats = {
        "global_mean": round(statistics.mean(all_vals)),
        "global_std":  round(statistics.stdev(all_vals)),
        "max_ever":    round(max(all_vals)),
        "min_ever":    round(min(all_vals)),
    }

    return {
        "series5min":   series5min,
        "hourly":       hourly,
        "daily":        daily,
        "hod":          hod,
        "dow_series":   dow_series,
        "volatility":   volatility,
        "uptime":       uptime,
        "stats":        stats,
        "total_points": len(records),
        "date_range":   [records[0]["ts"].isoformat(), records[-1]["ts"].isoformat()],
    }


def main() -> None:
    print("📂  Scanning CSV files…")
    raw = load_all_csvs()
    print(f"    Loaded {len(raw):,} raw records from {len(glob.glob(str(SRC_GLOB)))} files")

    print("🔄  Deduplicating…")
    clean = deduplicate(raw)
    print(f"    {len(clean):,} unique data points")

    print("📊  Aggregating…")
    payload = aggregate(clean)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUT_FILE, "w") as fh:
        json.dump(payload, fh, separators=(",", ":"))

    size_kb = OUT_FILE.stat().st_size / 1024
    print(f"✅  Saved → {OUT_FILE}  ({size_kb:.0f} KB)")
    print(f"   daily rows: {len(payload['daily'])}")
    print(f"   5-min points: {len(payload['series5min'])}")
    print(f"   date range: {payload['date_range'][0][:10]} → {payload['date_range'][1][:10]}")


if __name__ == "__main__":
    main()
