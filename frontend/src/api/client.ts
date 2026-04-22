import { useQuery } from "@tanstack/react-query";
import type { MetricsResponse, AnalyticsResponse } from "@/types";

const BASE = "/api";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Query keys (stable references) ───────────────────────────────────────────
export const queryKeys = {
  metrics:   ["metrics"]   as const,
  analytics: ["analytics"] as const,
} as const;

// ── Hooks ─────────────────────────────────────────────────────────────────────
export function useMetrics() {
  return useQuery<MetricsResponse>({
    queryKey: queryKeys.metrics,
    queryFn:  () => fetchJson<MetricsResponse>("/metrics/"),
    staleTime: 5 * 60 * 1000, // 5 min — data doesn't change
  });
}

export function useAnalytics() {
  return useQuery<AnalyticsResponse>({
    queryKey: queryKeys.analytics,
    queryFn:  () => fetchJson<AnalyticsResponse>("/analytics/"),
    staleTime: 5 * 60 * 1000,
  });
}
