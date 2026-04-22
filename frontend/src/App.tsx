import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useStore } from "@/store/useStore";
import { useMetrics, useAnalytics } from "@/api/client";
import { KpiCard } from "@/components/kpi/KpiCard";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { fmtN, fmtPct, DOW_NAMES } from "@/lib/format";
import type { NavPage } from "@/types";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const qc = new QueryClient();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0F1629] border border-[#2A3F70] rounded px-3 py-2 text-[11px] font-mono shadow-xl">
      <div className="text-[#8892AA] mb-1">{label}</div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {fmtN(p.value)}</div>
      ))}
    </div>
  );
};

const NAV: { id: NavPage; label: string }[] = [
  { id: "overview",  label: "OVERVIEW"  },
  { id: "analytics", label: "ANALYTICS" },
  { id: "chat",      label: "AI CHAT"   },
  { id: "insights",  label: "INSIGHTS"  },
  { id: "stack",     label: "STACK"     },
];

function Topbar() {
  const { page, setPage } = useStore();
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060810]/90 backdrop-blur">
      <div className="max-w-[1480px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF3A5C] flex items-center justify-center font-black text-white text-sm
                          shadow-[0_0_20px_rgba(255,58,92,0.5)]"
               style={{clipPath:"polygon(50% 0%,95% 25%,95% 75%,50% 100%,5% 75%,5% 25%)"}}>R</div>
          <div>
            <div className="font-black text-[15px] tracking-tight">Rappi Intelligence</div>
            <div className="font-mono text-[8px] text-[#55556A] tracking-[2px]">STORE AVAILABILITY · AI DASHBOARD</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ id, label }) => (
            <button key={id} onClick={() => setPage(id)} className={`font-mono text-[10px] tracking-[1px] px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${page===id?"bg-[#1A2540] border-[#2A3F70] text-[#5B6AFF]":"border-transparent text-[#8892AA] hover:text-white hover:border-[#1E2E50]"}`}>{label}</button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#00D4AA] tracking-[1px] bg-[#00D4AA]/8 border border-[#00D4AA]/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] shadow-[0_0_6px_#00D4AA] animate-pulse"/>AI LOCAL
          </div>
          <div className="font-mono text-[9px] text-[#55556A] bg-[#0F1629] border border-[#1E2E50] px-2.5 py-1 rounded">FEB 01-11 · 2026</div>
        </div>
      </div>
    </header>
  );
}

function SecH({ title, tag, color="#5B6AFF" }: { title:string; tag?:string; color?:string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-2 h-2 rounded-[1px]" style={{background:color,boxShadow:`0 0 10px ${color}`}}/>
      <h2 className="font-bold text-[13px] tracking-wide">{title}</h2>
      {tag && <span className="ml-auto font-mono text-[9px] text-[#55556A] bg-[#1A2540] border border-[#1E2E50] px-2 py-0.5 rounded tracking-[1px]">{tag}</span>}
    </div>
  );
}

function Card({ children, className="" }: { children:React.ReactNode; className?:string }) {
  return <div className={`bg-[#0F1629] border border-[#1E2E50] rounded p-5 hover:border-[#2A3F70] transition-colors ${className}`}>{children}</div>;
}

function PageOverview() {
  const { data: m } = useMetrics();
  const { data: a } = useAnalytics();
  const tlData = (m?.series_5min??[]).map(p=>({t:p.ts.slice(5,16).replace("T"," "),v:p.value}));
  const dowData = (a?.dow??[]).map(d=>({day:DOW_NAMES[d.day]??d.day,avg:d.avg}));
  return (
    <div className="space-y-5">
      <div className="relative bg-gradient-to-r from-[#5B6AFF]/8 to-[#FF3A5C]/8 border border-[#2A3F70] rounded p-7 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF3A5C] via-[#5B6AFF] to-[#00D4AA]"/>
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h1 className="font-black text-3xl tracking-tight leading-tight">Store <span className="text-[#FF3A5C]">Availability</span><br/>Intelligence Dashboard</h1>
            <p className="text-[#8892AA] text-[13px] mt-2">Análisis de disponibilidad de tiendas Rappi · 201 CSVs · 67,141 data points</p>
          </div>
          <div className="text-right">
            <div className="font-black text-5xl text-[#00D4AA] tracking-tight leading-none" style={{textShadow:"0 0 30px rgba(0,212,170,0.4)"}}>{fmtN(m?.kpis.peak_stores)}</div>
            <div className="font-mono text-[10px] text-[#55556A] tracking-[2px] mt-1">PEAK STORES ONLINE</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <KpiCard label="Peak Simultáneo" value={fmtN(m?.kpis.peak_stores)} sub={`${m?.kpis.peak_date??"–"} · máximo`} icon="🟢" accent="text-teal-400" border="border-[#1E2E50]"/>
        <KpiCard label="Promedio Diario"  value={fmtN(m?.kpis.daily_avg)}   sub="período completo"                       icon="📊" accent="text-blue-400"  border="border-[#1E2E50]"/>
        <KpiCard label="Peak Hour"        value={`${m?.kpis.peak_hour??"–"}:00h`} sub="14h–17h COL"                      icon="⏰" accent="text-yellow-400" border="border-[#1E2E50]"/>
        <KpiCard label="Data Points"      value={m?fmtN(m.kpis.total_points):"–"} sub="201 CSVs"                         icon="📦" accent="text-purple-400" border="border-[#1E2E50]"/>
        <KpiCard label="Uptime"           value={m?fmtPct(m.kpis.uptime_pct):"–"} sub="horas operativas"                 icon="📡" accent="text-teal-400"  border="border-[#1E2E50]"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <SecH title="Serie Temporal · Tiendas Visibles" tag="5 MIN" color="#5B6AFF"/>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={tlData}>
              <defs><linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5B6AFF" stopOpacity={0.3}/><stop offset="95%" stopColor="#5B6AFF" stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="t" tick={{fontSize:9,fill:"#55556A"}} tickLine={false} interval={200}/>
              <YAxis tickFormatter={fmtN} tick={{fontSize:9,fill:"#55556A"}} tickLine={false} width={48}/>
              <Tooltip content={<DarkTooltip/>}/>
              <Area type="monotone" dataKey="v" name="Tiendas" stroke="#5B6AFF" strokeWidth={1.5} fill="url(#gB)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SecH title="Día de la Semana" tag="PROMEDIO" color="#9B6DFF"/>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dowData} barSize={26}>
              <XAxis dataKey="day" tick={{fontSize:10,fill:"#55556A"}} tickLine={false}/>
              <YAxis tickFormatter={fmtN} tick={{fontSize:9,fill:"#55556A"}} tickLine={false} width={44}/>
              <Tooltip content={<DarkTooltip/>}/>
              <Bar dataKey="avg" name="Promedio" fill="#9B6DFF" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card>
        <SecH title="Resumen por Día" tag="11 DÍAS" color="#00D4AA"/>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead><tr className="border-b border-[#1E2E50]">{["Fecha","Día","Promedio","Máximo","P95","Mínimo","Uptime","Actividad"].map(h=><th key={h} className="text-left pb-2.5 px-3 font-mono text-[9px] text-[#55556A] tracking-[1.5px] uppercase font-normal">{h}</th>)}</tr></thead>
            <tbody>
              {(m?.daily??[]).map(d=>{
                const dt=new Date(d.date+"T12:00:00");
                const dow=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][dt.getDay()];
                const maxAvg=Math.max(...(m?.daily.map(x=>x.avg)??[1]));
                const pct=Math.round(d.avg/maxAvg*100);
                const uc=d.uptime_pct>98?"#00D4AA":d.uptime_pct>95?"#FFB800":"#FF3A5C";
                return <tr key={d.date} className="border-b border-white/[0.03] hover:bg-[#1A2540]/50 transition-colors">
                  <td className="px-3 py-2.5 font-mono text-[#8892AA]">{d.date.slice(5)}</td>
                  <td className="px-3 py-2.5 font-mono text-[10px] text-[#55556A]">{dow}</td>
                  <td className="px-3 py-2.5 text-[#5B6AFF] font-medium">{fmtN(d.avg)}</td>
                  <td className="px-3 py-2.5 text-[#00D4AA]">{fmtN(d.max)}</td>
                  <td className="px-3 py-2.5 text-[#8892AA]">{fmtN(d.p95)}</td>
                  <td className="px-3 py-2.5 text-[#FF3A5C]">{fmtN(d.min)}</td>
                  <td className="px-3 py-2.5"><div className="flex items-center gap-2"><div className="w-16 h-1 bg-[#1A2540] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${d.uptime_pct}%`,background:uc}}/></div><span className="font-mono text-[10px]" style={{color:uc}}>{fmtPct(d.uptime_pct)}</span></div></td>
                  <td className="px-3 py-2.5"><div className="h-1 rounded-full bg-[#5B6AFF]" style={{width:`${pct}px`,maxWidth:"80px",opacity:0.3+0.7*pct/100}}/></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function PageAnalytics() {
  const { data: m } = useMetrics();
  const { data: a } = useAnalytics();
  const hodData=(a?.hod??[]);
  const volData=(a?.volatility??[]);
  const dailyData=(m?.daily??[]).map(d=>({date:d.date.slice(5),max:d.max,avg:d.avg,min:d.min}));
  const uptData=(a?.uptime??[]).map(u=>({date:u.date.slice(5),up:u.uptime_pct}));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><SecH title="Patrón Hora del Día" tag="PROMEDIO" color="#FFB800"/>
          <ResponsiveContainer width="100%" height={240}><BarChart data={hodData} barSize={20}><XAxis dataKey="hour" tickFormatter={h=>`${h}h`} tick={{fontSize:9,fill:"#55556A"}} tickLine={false}/><YAxis tickFormatter={fmtN} tick={{fontSize:9,fill:"#55556A"}} tickLine={false} width={44}/><Tooltip content={<DarkTooltip/>}/><Bar dataKey="avg" name="Tiendas" fill="#FFB800" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer>
        </Card>
        <Card><SecH title="Volatilidad por Hora (CV %)" tag="COEF. VARIACIÓN" color="#FF3A5C"/>
          <ResponsiveContainer width="100%" height={240}><LineChart data={volData}><XAxis dataKey="hour" tickFormatter={h=>`${h}h`} tick={{fontSize:9,fill:"#55556A"}} tickLine={false}/><YAxis tickFormatter={v=>`${v}%`} tick={{fontSize:9,fill:"#55556A"}} tickLine={false} width={36}/><Tooltip content={<DarkTooltip/>}/><Line type="monotone" dataKey="cv" name="CV %" stroke="#FF3A5C" strokeWidth={2} dot={{r:2.5,fill:"#FF3A5C"}}/></LineChart></ResponsiveContainer>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><SecH title="Rango Diario · Máx / Avg / Mín" tag="COMPARATIVO" color="#00D4AA"/>
          <ResponsiveContainer width="100%" height={240}><BarChart data={dailyData} barSize={16}><XAxis dataKey="date" tick={{fontSize:9,fill:"#55556A"}} tickLine={false}/><YAxis tickFormatter={fmtN} tick={{fontSize:9,fill:"#55556A"}} tickLine={false} width={44}/><Tooltip content={<DarkTooltip/>}/><Legend wrapperStyle={{fontSize:10,color:"#8892AA"}}/><Bar dataKey="max" name="Máx" fill="#00D4AA" fillOpacity={0.7} radius={[2,2,0,0]}/><Bar dataKey="avg" name="Avg" fill="#5B6AFF" fillOpacity={0.85} radius={[2,2,0,0]}/><Bar dataKey="min" name="Mín" fill="#FF3A5C" fillOpacity={0.5} radius={[2,2,0,0]}/></BarChart></ResponsiveContainer>
        </Card>
        <Card><SecH title="Uptime Diario (%)" tag="> 10K STORES" color="#5B6AFF"/>
          <ResponsiveContainer width="100%" height={240}><BarChart data={uptData} barSize={26}><XAxis dataKey="date" tick={{fontSize:9,fill:"#55556A"}} tickLine={false}/><YAxis domain={[95,100]} tickFormatter={v=>`${v}%`} tick={{fontSize:9,fill:"#55556A"}} tickLine={false} width={36}/><Tooltip content={<DarkTooltip/>}/><Bar dataKey="up" name="Uptime" fill="#5B6AFF" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer>
        </Card>
      </div>
      <Card>
        <SecH title="Heatmap 11 días × 24 horas" tag="HOD × DATE" color="#9B6DFF"/>
        <div className="grid gap-1" style={{gridTemplateColumns:"repeat(24,1fr)"}}>
          {(m?.daily??[]).flatMap(day=>(a?.hod??[]).map(h=>{
            const mean=(m?.daily??[]).reduce((s,d)=>s+d.avg,0)/((m?.daily??[]).length||1);
            const factor=(m?.daily??[]).find(d=>d.date===day.date)?.avg??mean;
            const t=Math.min(1,(h.avg*(factor/mean))/6200000);
            return <div key={`${day.date}-${h.hour}`} title={`${day.date} ${h.hour}:00`} className="h-5 rounded-sm cursor-default hover:outline hover:outline-1 hover:outline-white/30" style={{background:`rgba(${Math.round(91+164*t)},${Math.round(106+149*t)},255,${0.1+0.85*t})`}}/>;
          }))}
        </div>
        <div className="flex justify-between mt-2 font-mono text-[9px] text-[#55556A]"><span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>23h</span></div>
        <div className="flex items-center gap-2 mt-3 font-mono text-[9px] text-[#55556A]"><span>BAJO</span><div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-[#1A2540] via-[#5B6AFF] to-[#00D4AA]"/><span>ALTO</span></div>
      </Card>
    </div>
  );
}

const INSIGHTS=[
  {icon:"🚀",title:"Crecimiento Sostenido",body:"Aumento progresivo del 1 al 6 de febrero, alcanzando más de 6.2M tiendas simultáneas. Máximo histórico del período.",val:"+105%",color:"#00D4AA"},
  {icon:"⏰",title:"Patrón Horario Consistente",body:"Curva de campana con actividad nula 2am–5am. La franja 14h–17h concentra más del 35% del volumen diario.",val:"14h–17h",color:"#FFB800"},
  {icon:"📅",title:"Semana Laboral vs Weekend",body:"Jue–Vie promedian ~3.7M tiendas, 22% más que Dom–Lun. El fin de semana mantiene actividad pero con menor densidad.",val:"+22% Jue-Vie",color:"#5B6AFF"},
  {icon:"⚡",title:"Drops Nocturnos Programados",body:"Mínimos de 0 tiendas entre 02:00–05:00h COL en todos los días. Consistente con ventanas de mantenimiento planificado.",val:"02h–05h COL",color:"#FF3A5C"},
  {icon:"📉",title:"Corrección Post-Pico",body:"Tras el máximo del 6 de febrero, los días 7–9 muestran corrección del 15–25%, asociada al fin de semana.",val:"−20% Feb 08",color:"#9B6DFF"},
  {icon:"🎯",title:"Alta Disponibilidad",body:"Excluyendo ventanas nocturnas, el sistema mantiene >98.7% de uptime en horas operativas. Drops diurnos son raros.",val:"98.7% uptime",color:"#00D4AA"},
];

function PageInsights() {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {INSIGHTS.map(({icon,title,body,val,color})=>(
      <div key={title} className="relative bg-[#0F1629] border border-[#1E2E50] rounded p-5 pl-4 hover:border-[#2A3F70] transition-colors overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{background:color}}/>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#1A2540] flex items-center justify-center text-xl shrink-0">{icon}</div>
          <div>
            <div className="font-bold text-[14px] mb-1.5">{title}</div>
            <div className="text-[12.5px] text-[#8892AA] leading-relaxed">{body}</div>
            <div className="font-black text-2xl mt-3 leading-none" style={{color}}>{val}</div>
          </div>
        </div>
      </div>
    ))}
  </div>;
}

const STACK=[
  {icon:"🧠",name:"TensorFlow.js",desc:"Inferencia ML en el browser. USE corre localmente sin enviar datos a servidores externos.",tag:"CORE AI · LOCAL",color:"#9B6DFF"},
  {icon:"🔤",name:"USE · 512 dims",desc:"Modelo Google que convierte texto en vectores de 512 dimensiones para búsqueda semántica.",tag:"NLP · EMBEDDINGS",color:"#5B6AFF"},
  {icon:"⚛️",name:"React 18 + TypeScript",desc:"Componentes tipados, hooks personalizados. Vite para builds rápidos y HMR instantáneo.",tag:"FRONTEND",color:"#00D4AA"},
  {icon:"🚀",name:"FastAPI + Pydantic v2",desc:"API REST tipada con contratos Pydantic. lru_cache singleton data loader. Uvicorn ASGI.",tag:"BACKEND",color:"#FFB800"},
  {icon:"📊",name:"Recharts",desc:"Visualizaciones declarativas sobre SVG. AreaChart, BarChart, LineChart con tooltips custom.",tag:"DATA VIZ",color:"#FF3A5C"},
  {icon:"🗃️",name:"Zustand + TanStack Query",desc:"Zustand para UI state. TanStack Query para server state con stale-while-revalidate.",tag:"STATE",color:"#9B6DFF"},
  {icon:"🐍",name:"Python + Pandas ETL",desc:"Pipeline 201 CSVs: deduplicación, agregaciones, percentiles, CV, uptime. Output: data.json.",tag:"PIPELINE",color:"#00D4AA"},
  {icon:"💅",name:"Tailwind CSS v4",desc:"Utility-first con design tokens. Dark mode consistente. Grid adaptativo responsive.",tag:"STYLING",color:"#5B6AFF"},
];

function PageStack() {
  return <div className="space-y-5">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {STACK.map(({icon,name,desc,tag,color})=>(
        <div key={name} className="bg-[#0F1629] border border-[#1E2E50] rounded p-5 hover:border-[#2A3F70] transition-colors group">
          <div className="text-2xl mb-3">{icon}</div>
          <div className="font-bold text-[14px] mb-1.5 group-hover:text-[#5B6AFF] transition-colors">{name}</div>
          <div className="text-[12px] text-[#8892AA] leading-relaxed mb-3">{desc}</div>
          <div className="font-mono text-[9px] tracking-[1px]" style={{color}}>{tag}</div>
        </div>
      ))}
    </div>
    <div className="bg-[#0F1629] border border-[#1E2E50] rounded p-5">
      <div className="flex items-center gap-3 mb-4"><div className="w-2 h-2 rounded-[1px] bg-[#FF3A5C]" style={{boxShadow:"0 0 10px #FF3A5C"}}/><h2 className="font-bold text-[13px] tracking-wide">¿Por qué modelo local y no GPT/Gemini API?</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[12.5px] text-[#8892AA] leading-relaxed">
        <div><div className="font-mono text-[10px] text-[#00D4AA] tracking-[1px] mb-3">VENTAJAS TF.JS LOCAL</div>
          <ul className="space-y-2">{["Privacidad total — datos nunca salen del browser","Sin costo de API — zero llamadas externas","Offline-first — funciona sin red post-carga","Latencia cero — inferencia sin round-trip","Determinístico — misma pregunta = misma respuesta"].map(i=><li key={i} className="flex gap-2"><span className="text-[#00D4AA] shrink-0">▸</span>{i}</li>)}</ul></div>
        <div><div className="font-mono text-[10px] text-[#FFB800] tracking-[1px] mb-3">TRADE-OFFS CONOCIDOS</div>
          <ul className="space-y-2">{["Capacidad limitada vs LLM grande","~8MB descarga del modelo al primer uso","KB fija — requiere actualizar docs manualmente","Sin contexto multi-turno por pregunta"].map(i=><li key={i} className="flex gap-2"><span className="text-[#FFB800] shrink-0">▸</span>{i}</li>)}</ul></div>
      </div>
    </div>
  </div>;
}

function PageChat() {
  const { data: m } = useMetrics();
  const { data: a } = useAnalytics();
  const { aiStatus } = useStore();
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
    <div className="lg:col-span-2"><ChatPanel metrics={m} analytics={a}/></div>
    <div className="space-y-4">
      <div className="bg-[#0F1629] border border-[#1E2E50] rounded p-5">
        <div className="flex items-center gap-3 mb-4"><div className="w-2 h-2 rounded-[1px] bg-[#5B6AFF]" style={{boxShadow:"0 0 10px #5B6AFF"}}/><h2 className="font-bold text-[13px] tracking-wide">Cómo funciona</h2></div>
        <div className="space-y-4 text-[12px] text-[#8892AA] leading-relaxed">
          {[{s:"01 · ENCODE",c:"#5B6AFF",t:"Tu pregunta se convierte en un vector de 512 dimensiones usando Universal Sentence Encoder."},{s:"02 · MATCH",c:"#00D4AA",t:"Cosine similarity contra 12 documentos pre-codificados con hechos del CSV."},{s:"03 · RESPOND",c:"#9B6DFF",t:"Se retorna la respuesta más similar. Todo en el browser, sin llamadas de red."}].map(({s,c,t})=><div key={s}><span className="font-mono text-[10px] tracking-[1px]" style={{color:c}}>{s}</span><p className="mt-1">{t}</p></div>)}
        </div>
      </div>
      <div className="bg-[#5B6AFF]/5 border border-[#5B6AFF]/20 rounded p-5">
        <div className="font-mono text-[9px] text-[#5B6AFF] tracking-[1px] mb-2">MODELO ACTIVO</div>
        <div className="text-[12px] text-[#8892AA] space-y-1"><div className="text-white font-medium">@tensorflow-models/universal-sentence-encoder</div><div>TensorFlow.js v4.17.0 · Embeddings 512d</div><div>Inferencia CPU/WebGL · ~8MB download</div><div className="text-[#00D4AA] mt-2 font-mono text-[10px]">{aiStatus}</div></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[{v:"6.2M",l:"PEAK STORES",c:"#00D4AA"},{v:"17:00",l:"PEAK HOUR",c:"#5B6AFF"},{v:"98.7%",l:"UPTIME",c:"#FFB800"},{v:"67K",l:"DATA POINTS",c:"#9B6DFF"}].map(({v,l,c})=>(
          <div key={l} className="bg-[#1A2540] border border-[#2A3F70] rounded p-3 text-center"><div className="font-black text-xl leading-tight" style={{color:c}}>{v}</div><div className="font-mono text-[9px] text-[#55556A] mt-1 tracking-[1px]">{l}</div></div>
        ))}
      </div>
    </div>
  </div>;
}

function Dashboard() {
  const { page } = useStore();
  return <div className="min-h-screen bg-[#060810] text-white">
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute w-[600px] h-[600px] -top-40 -left-40 rounded-full bg-[#FF3A5C] opacity-[0.04] blur-[120px]"/>
      <div className="absolute w-[500px] h-[500px] -bottom-20 -right-20 rounded-full bg-[#5B6AFF] opacity-[0.05] blur-[120px]"/>
      <div className="fixed inset-0" style={{backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
    </div>
    <div className="relative z-10">
      <Topbar/>
      <main className="max-w-[1480px] mx-auto px-6 py-7">
        {page==="overview"  && <PageOverview/>}
        {page==="analytics" && <PageAnalytics/>}
        {page==="chat"      && <PageChat/>}
        {page==="insights"  && <PageInsights/>}
        {page==="stack"     && <PageStack/>}
      </main>
      <footer className="border-t border-white/[0.04] py-5 text-center font-mono text-[10px] text-[#55556A] tracking-[1px]">
        RAPPI MAKERS TECH TEST 2026 · AI LOCAL: TENSORFLOW.JS + USE · 67,141 DATA POINTS · REACT 18 + FASTAPI
      </footer>
    </div>
  </div>;
}

export default function App() {
  return <QueryClientProvider client={qc}><Dashboard/></QueryClientProvider>;
}
