/** Format large numbers for display */
export function fmtN(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "–";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "K";
  return n.toLocaleString("es-CO");
}

export function fmtPct(n: number): string {
  return n.toFixed(1) + "%";
}

export function fmtDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-CO", {
    month: "short",
    day: "numeric",
  });
}

export const DOW_NAMES: Record<string, string> = {
  Sun: "Dom", Mon: "Lun", Tue: "Mar", Wed: "Mié",
  Thu: "Jue", Fri: "Vie", Sat: "Sáb",
};
