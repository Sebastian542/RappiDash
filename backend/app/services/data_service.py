"""
DataService — singleton that loads pre-processed availability data.
The ETL pipeline (data-pipeline/etl.py) must run first to generate data.json.
"""
import json
import statistics
from pathlib import Path
from functools import lru_cache

from app.models.schemas import (
    KPIResponse, TimeSeriesPoint, DailyStats, HourOfDayPoint,
    DayOfWeekPoint, VolatilityPoint, UptimePoint, HourlyPoint,
    MetricsResponse, AnalyticsResponse,
)

# Resolve data path relative to project root
_DATA_PATH = Path(__file__).parent.parent.parent.parent / "data-pipeline" / "output" / "data.json"


@lru_cache(maxsize=1)
def _load_raw() -> dict:
    if not _DATA_PATH.exists():
        raise FileNotFoundError(
            f"data.json not found at {_DATA_PATH}. "
            "Run: python3 data-pipeline/etl.py"
        )
    with open(_DATA_PATH) as f:
        return json.load(f)


def get_metrics() -> MetricsResponse:
    raw = _load_raw()

    daily_objs = [DailyStats(**d) for d in raw["daily"]]
    best = max(daily_objs, key=lambda d: d.max)
    best_hod = max(raw["hod"], key=lambda h: h["avg"])
    up_avg = round(
        sum(u["uptime_pct"] for u in raw["uptime"]) / len(raw["uptime"]), 2
    )
    all_avg = round(statistics.mean(d.avg for d in daily_objs))

    kpis = KPIResponse(
        peak_stores=best.max,
        peak_date=best.date,
        daily_avg=all_avg,
        peak_hour=best_hod["hour"],
        uptime_pct=up_avg,
        total_points=raw.get("total_points", 67141),
        date_from=raw["date_range"][0][:10],
        date_to=raw["date_range"][1][:10],
    )

    return MetricsResponse(
        kpis=kpis,
        series_5min=[TimeSeriesPoint(**p) for p in raw["series5min"]],
        daily=daily_objs,
        hourly=[HourlyPoint(**h) for h in raw["hourly"]],
    )


def get_analytics() -> AnalyticsResponse:
    raw = _load_raw()
    return AnalyticsResponse(
        hod=[HourOfDayPoint(**h) for h in raw["hod"]],
        dow=[DayOfWeekPoint(**d) for d in raw["dow_series"]],
        volatility=[VolatilityPoint(**v) for v in raw["volatility"]],
        uptime=[UptimePoint(**u) for u in raw["uptime"]],
    )
