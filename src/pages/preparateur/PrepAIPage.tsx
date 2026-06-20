import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bot, Send, Sparkles, SendHorizonal } from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { AI_PREP_QUESTIONS, getPrepAIResponse } from "../../data/preparateurData";

function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 14);
    return () => clearInterval(interval);
  }, [text]);
  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>
      )}
    </span>
  );
}

export function PrepAIPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string; typing?: boolean }[]>([]);

  function ask(q: string) {
    setChat((prev) => [...prev, { role: "user", text: q }]);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setChat((prev) => [...prev, { role: "ai", text: getPrepAIResponse(q), typing: true }]);
    }, 800);
  }

  return (
    <PrepPageTransition className="mx-auto max-w-4xl space-y-6">
      <PrepKpiCard>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(99,102,241,0.15)" }}>
            <Sparkles size={22} style={{ color: "#6366F1" }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Assistant IA Préparateur</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Analyse charge, fatigue et risques en temps réel</p>
          </div>
        </div>
      </PrepKpiCard>

      <div className="flex flex-wrap gap-2">
        {AI_PREP_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => ask(q)}
            className="rounded-xl border px-4 py-2 text-sm transition-all hover:brightness-110"
            style={{ borderColor: "rgba(99,102,241,0.25)", color: "#6366F1", background: "rgba(99,102,241,0.08)" }}
          >
            {q}
          </button>
        ))}
      </div>

      <PrepKpiCard hover={false} className="min-h-[360px]">
        <div className="mb-4 flex items-center gap-2">
          <Bot size={18} style={{ color: "#6366F1" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Chat</span>
        </div>
        <div className="mb-4 max-h-[320px] space-y-3 overflow-y-auto">
          {chat.length === 0 && (
            <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Posez une question sur la charge, la fatigue ou les risques blessure...
            </p>
          )}
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={{
                  background: msg.role === "user" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                  color: "var(--text-primary)",
                }}
              >
                {msg.role === "ai" && msg.typing ? <TypingText text={msg.text} /> : msg.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-2.5 text-sm" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>Analyse Catapult...</motion.span>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) { ask(input.trim()); setInput(""); } }}
            placeholder="Ex: Ahmed peut-il jouer samedi ?"
            className="flex-1 rounded-xl border px-4 py-2.5 text-sm"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.05)", color: "var(--text-primary)" }}
          />
          <button
            type="button"
            onClick={() => { if (input.trim()) { ask(input.trim()); setInput(""); } }}
            className="rounded-xl px-4 py-2.5"
            style={{ background: "#6366F1", color: "white" }}
          >
            <Send size={16} />
          </button>
        </div>
      </PrepKpiCard>

      <PrepKpiCard delay={0.1}>
        <p className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Actions rapides</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate("/preparateur/charge")} className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium" style={{ background: "rgba(255,107,87,0.12)", color: "#FF6B57" }}>
            <SendHorizonal size={14} /> Voir charge équipe
          </button>
          <button type="button" onClick={() => navigate("/preparateur/risques")} className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>
            Risques blessures
          </button>
          <button type="button" onClick={() => navigate("/preparateur/programmes")} className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium" style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1" }}>
            Créer programme
          </button>
        </div>
      </PrepKpiCard>
    </PrepPageTransition>
  );
}
