"""Response models — typed contracts for all API endpoints."""
from pydantic import BaseModel
from typing import Optional


class HealthResponse(BaseModel):
    status: str
    version: str
    data_points: int


class KPIResponse(BaseModel):
    peak_stores: int
    peak_date: str
    daily_avg: int
    peak_hour: int
    uptime_pct: float
    total_points: int
    date_from: str
    date_to: str


class TimeSeriesPoint(BaseModel):
    ts: str
    value: float


class DailyStats(BaseModel):
    date: str
    avg: int
    max: int
    min: int
    median: int
    p95: int
    uptime_pct: float


class HourOfDayPoint(BaseModel):
    hour: int
    avg: int


class DayOfWeekPoint(BaseModel):
    day: str
    avg: int


class VolatilityPoint(BaseModel):
    hour: int
    cv: float


class UptimePoint(BaseModel):
    date: str
    uptime_pct: float


class HourlyPoint(BaseModel):
    ts: str
    avg: int
    max: int
    min: int


class MetricsResponse(BaseModel):
    kpis: KPIResponse
    series_5min: list[TimeSeriesPoint]
    daily: list[DailyStats]
    hourly: list[HourlyPoint]


class AnalyticsResponse(BaseModel):
    hod: list[HourOfDayPoint]
    dow: list[DayOfWeekPoint]
    volatility: list[VolatilityPoint]
    uptime: list[UptimePoint]
