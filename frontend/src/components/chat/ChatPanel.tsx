import { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useAIChat } from "@/hooks/useAIChat";
import type { MetricsResponse, AnalyticsResponse } from "@/types";

const CHIPS = [
  "¿Cuál fue el día con más tiendas?",
  "¿A qué hora hay más actividad?",
  "¿Hubo caídas a cero?",
  "Dame el resumen del período",
  "¿Cuántos datos hay en total?",
  "¿Qué día fue el peor?",
];

interface Props {
  metrics?:   MetricsResponse;
  analytics?: AnalyticsResponse;
}

function renderText(text: string) {
  // Bold: **text**
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1
      ? <strong key={i} className="text-teal-400 font-semibold">{part}</strong>
      : <span key={i}>{part.replace(/\n/g, "\n")}</span>
  );
}

export function ChatPanel({ metrics, analytics }: Props) {
  const { messages, addMessage, aiReady, aiStatus } = useStore();
  const { getResponse } = useAIChat(metrics, analytics);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const [chipsVisible, setChipsVisible] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Initial bot greeting
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        role: "bot",
        text: "¡Hola! Soy el analista de disponibilidad Rappi 🚀\n\nFunciono **100% offline** usando **TensorFlow.js + Universal Sentence Encoder**. Tus preguntas se procesan localmente, sin APIs externas.\n\nPregúntame sobre los datos de **Feb 01–11, 2026** 👇",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(text: string) {
    if (!text.trim() || !aiReady) return;
    setInput("");
    setChipsVisible(false);
    addMessage({ role: "user", text });
    setTyping(true);
    await new Promise(r => setTimeout(r, 400 + Math.random() * 500));
    const response = await getResponse(text);
    setTyping(false);
    addMessage({ role: "bot", text: response });
  }

  return (
    <div className="flex flex-col bg-[#0F1629] border border-[#1E2E50] rounded h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2E50] bg-[#0a1020] shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#5B6AFF] to-[#9B6DFF] flex items-center justify-center text-lg shadow-lg shadow-indigo-900/40">
          🤖
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-white">Rappi AI Analyst</div>
          <div className="font-mono text-[10px] text-[#8892AA] truncate">{aiStatus}</div>
        </div>
        <span className="font-mono text-[9px] text-[#5B6AFF] bg-[#5B6AFF]/10 border border-[#5B6AFF]/25 px-2 py-1 rounded">
          USE · TFJS · LOCAL
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1E2E50]">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`
              w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold
              ${msg.role === "bot"
                ? "bg-gradient-to-br from-[#5B6AFF] to-[#9B6DFF] text-white shadow-md shadow-indigo-900/30"
                : "bg-[#1A2540] border border-[#2A3F70] text-[#8892AA]"}
            `}>
              {msg.role === "bot" ? "🤖" : "U"}
            </div>

            <div className={`
              max-w-[78%] px-3.5 py-2.5 rounded-lg text-[12.5px] leading-relaxed whitespace-pre-line
              ${msg.role === "bot"
                ? "bg-[#1A2540] border border-[#2A3F70] rounded-tl-none text-[#C8D0E0]"
                : "bg-[#5B6AFF]/12 border border-[#5B6AFF]/25 rounded-tr-none text-[#C8D0E0]"}
            `}>
              {renderText(msg.text)}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5B6AFF] to-[#9B6DFF] flex items-center justify-center text-lg">🤖</div>
            <div className="bg-[#1A2540] border border-[#2A3F70] rounded-lg rounded-tl-none px-4 py-3">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 150, 300].map(delay => (
                  <div
                    key={delay}
                    className="w-2 h-2 rounded-full bg-[#8892AA] animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Chips */}
      {chipsVisible && (
        <div className="px-4 py-2 border-t border-[#1E2E50] flex flex-wrap gap-1.5 shrink-0">
          {CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => send(chip)}
              disabled={!aiReady}
              className="font-mono text-[10px] text-[#8892AA] bg-[#1A2540] border border-[#2A3F70]
                         px-2.5 py-1.5 rounded-full hover:border-[#5B6AFF] hover:text-[#5B6AFF]
                         transition-colors disabled:opacity-40 cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-[#1E2E50] flex gap-2 shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          disabled={!aiReady || typing}
          placeholder={aiReady ? "Pregunta sobre los datos…" : "Cargando modelo…"}
          className="flex-1 bg-[#1A2540] border border-[#2A3F70] text-white placeholder-[#55556A]
                     rounded px-3 py-2.5 font-mono text-[12px] outline-none
                     focus:border-[#5B6AFF] focus:ring-1 focus:ring-[#5B6AFF]/20
                     disabled:opacity-50 transition-colors"
        />
        <button
          onClick={() => send(input)}
          disabled={!aiReady || typing || !input.trim()}
          className="bg-gradient-to-r from-[#5B6AFF] to-[#9B6DFF] text-white px-4 py-2.5
                     rounded font-mono text-[11px] tracking-wide font-medium
                     hover:opacity-85 disabled:opacity-35 transition-opacity cursor-pointer"
        >
          SEND →
        </button>
      </div>
    </div>
  );
}
