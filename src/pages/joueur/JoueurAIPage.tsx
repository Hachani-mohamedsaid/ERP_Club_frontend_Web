import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Sparkles, FileDown, TrendingUp, TrendingDown, AlertCircle, History, MessageSquare } from "lucide-react";
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { JoueurKpiCard } from "../../components/player/JoueurKpiCard";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { Button } from "../../components/ui/Button";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";
import { useLocale } from "../../contexts/LocaleContext";
import { AI_COACH_QUESTIONS, AI_WEEKLY_INSIGHTS, AI_CHAT_HISTORY, getCoachAIResponse } from "../../data/joueurPersonalData";

function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{displayed}{displayed.length < text.length && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>}</span>;
}

export function JoueurAIPage() {
  const { player } = useCurrentPlayer();
  const { t } = useLocale();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string; typing?: boolean }[]>([]);

  if (!player) return null;

  const firstName = player.name.split(" ")[0];

  function askQuestion(question: string) {
    setChat((prev) => [...prev, { role: "user", text: question }]);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setChat((prev) => [...prev, { role: "ai", text: getCoachAIResponse(question, player!.name), typing: true }]);
    }, 900);
  }

  function exportReport() {
    const report = `Weekly Report — ${player!.name}\n\nVitesse: ${AI_WEEKLY_INSIGHTS.speedChange}\nEndurance: ${AI_WEEKLY_INSIGHTS.enduranceChange}\nFatigue: ${AI_WEEKLY_INSIGHTS.fatigueRisk}\nConseil: ${AI_WEEKLY_INSIGHTS.advice}`;
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weekly-report-${firstName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <JoueurPageTransition className="mx-auto max-w-5xl space-y-6">
      {/* AI Analysis on entry */}
      <JoueurKpiCard>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlayerAvatar name={player.name} size={48} ring={false} />
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{t.ai.analysis} — {firstName}</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.ai.weeklyReport}</p>
            </div>
          </div>
          <button type="button" onClick={exportReport} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all hover:brightness-110 active:scale-[0.98]" style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}>
            <FileDown size={14} />{t.ai.downloadPdf}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)" }}>
            <TrendingUp size={18} style={{ color: "#22C55E" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.ai.speedUp}</p>
              <p className="font-bold" style={{ color: "#22C55E" }}>{AI_WEEKLY_INSIGHTS.speedChange}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)" }}>
            <TrendingDown size={18} style={{ color: "#EF4444" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.ai.enduranceDown}</p>
              <p className="font-bold" style={{ color: "#EF4444" }}>{AI_WEEKLY_INSIGHTS.enduranceChange}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)" }}>
            <AlertCircle size={18} style={{ color: "#F59E0B" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.ai.fatigueRisk}</p>
              <p className="font-bold" style={{ color: "#F59E0B" }}>{AI_WEEKLY_INSIGHTS.fatigueRisk}</p>
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-xl border px-4 py-3" style={{ borderColor: "rgba(255,107,87,0.2)", background: "rgba(255,107,87,0.06)" }}>
          <p className="text-xs font-semibold" style={{ color: "#FF6B57" }}>{t.ai.advice}</p>
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>{AI_WEEKLY_INSIGHTS.advice}</p>
        </div>
      </JoueurKpiCard>

      {/* Chat + History */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <JoueurKpiCard delay={0.08} className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <History size={16} style={{ color: "#FF6B57" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.ai.chatHistory}</h3>
          </div>
          <div className="space-y-4">
            {AI_CHAT_HISTORY.map((item, idx) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => askQuestion(item.question)}
                className="w-full rounded-xl border p-3 text-left transition-all hover:scale-[1.02] hover:border-[#FF6B57]/40 active:scale-[0.98]"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#FF6B57" }}>{item.period}</p>
                <p className="mt-1 flex items-start gap-1.5 text-xs leading-snug" style={{ color: "var(--text-secondary)" }}>
                  <MessageSquare size={12} className="mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                  {item.question}
                </p>
              </motion.button>
            ))}
          </div>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.1}>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={20} style={{ color: "#FF6B57" }} />
          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{t.ai.title}</h3>
        </div>
        <p className="mb-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>{t.ai.suggested}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {AI_COACH_QUESTIONS.map((q) => (
            <button key={q} type="button" onClick={() => askQuestion(q)} className="rounded-full border px-3 py-1.5 text-xs transition-all hover:border-[#FF6B57] active:scale-[0.98]" style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}>
              {q}
            </button>
          ))}
        </div>
        <div className="mb-4 max-h-72 space-y-3 overflow-y-auto rounded-[20px] border p-4" style={{ borderColor: "rgba(255,255,255,0.08)", minHeight: 240, background: "#070B1A" }}>
          {chat.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <Bot size={28} style={{ color: "#FF6B57", opacity: 0.4 }} />
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>Ask AI anything about your performance</p>
            </div>
          )}
          {chat.map((msg, i) => (
            <motion.div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              {msg.role === "ai" && <Bot size={16} className="mt-1 shrink-0" style={{ color: "#FF6B57" }} />}
              <div className="max-w-[85%] rounded-[16px] px-4 py-2.5 text-sm" style={{ background: msg.role === "user" ? "#FF6B57" : "rgba(255,107,87,0.1)", color: msg.role === "user" ? "white" : "var(--text-primary)" }}>
                {msg.role === "ai" && msg.typing ? <TypingText text={msg.text} /> : msg.text}
              </div>
            </motion.div>
          ))}
          {thinking && (
            <div className="flex gap-2">
              <Bot size={16} style={{ color: "#FF6B57" }} />
              <div className="flex gap-1 rounded-[16px] px-4 py-3" style={{ background: "rgba(255,107,87,0.1)" }}>
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="h-2 w-2 rounded-full" style={{ background: "#FF6B57" }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (askQuestion(input), setInput(""))} placeholder={t.ai.askPlaceholder} className="glass-input flex-1 rounded-[16px] py-2.5 px-4 text-sm focus:border-[#FF6B57] focus:outline-none" />
          <Button onClick={() => { if (input.trim()) { askQuestion(input); setInput(""); } }} className="active:scale-[0.98]"><Send size={16} /></Button>
        </div>
        </JoueurKpiCard>
      </div>
    </JoueurPageTransition>
  );
}
