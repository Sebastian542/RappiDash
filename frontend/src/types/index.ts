// ── API Response Types ────────────────────────────────────────────────────────

export interface KPIData {
  peak_stores: number;
  peak_date: string;
  daily_avg: number;
  peak_hour: number;
  uptime_pct: number;
  total_points: number;
  date_from: string;
  date_to: string;
}

export interface TimeSeriesPoint {
  ts: string;
  value: number;
}

export interface DailyStat {
  date: string;
  avg: number;
  max: number;
  min: number;
  median: number;
  p95: number;
  uptime_pct: number;
}

export interface HourlyPoint {
  ts: string;
  avg: number;
  max: number;
  min: number;
}

export interface MetricsResponse {
  kpis: KPIData;
  series_5min: TimeSeriesPoint[];
  daily: DailyStat[];
  hourly: HourlyPoint[];
}

export interface HodPoint    { hour: number; avg: number; }
export interface DowPoint    { day: string;  avg: number; }
export interface VolPoint    { hour: number; cv: number;  }
export interface UptimePoint { date: string; uptime_pct: number; }

export interface AnalyticsResponse {
  hod:        HodPoint[];
  dow:        DowPoint[];
  volatility: VolPoint[];
  uptime:     UptimePoint[];
}

// ── UI Types ─────────────────────────────────────────────────────────────────

export type NavPage = "overview" | "analytics" | "chat" | "insights" | "stack";

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  ts: number;
}
