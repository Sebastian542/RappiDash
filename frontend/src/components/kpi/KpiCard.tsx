import { clsx } from "clsx";

interface Props {
  label:   string;
  value:   string;
  sub:     string;
  icon:    string;
  accent:  string; // Tailwind color class like "text-teal-400"
  border:  string; // Tailwind border color
}

export function KpiCard({ label, value, sub, icon, accent, border }: Props) {
  return (
    <div className={clsx(
      "relative bg-[#0F1629] rounded border overflow-hidden",
      "hover:-translate-y-0.5 transition-transform duration-150",
      border,
    )}>
      {/* Top accent line */}
      <div className={clsx("absolute top-0 left-0 right-0 h-0.5", accent.replace("text-", "bg-"))} />

      <div className="p-5 pt-4">
        <div className="text-xl mb-3">{icon}</div>
        <div className="font-mono text-[9px] tracking-[2px] text-[#8892AA] uppercase mb-1.5">
          {label}
        </div>
        <div className={clsx("font-black text-3xl leading-none tracking-tight", accent)}>
          {value}
        </div>
        <div className="text-[11px] text-[#8892AA] mt-2">{sub}</div>
      </div>
    </div>
  );
}
