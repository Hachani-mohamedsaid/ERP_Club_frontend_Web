import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bot, Send, Sparkles, AlertTriangle, Info, Zap, Calendar, FileSignature, Stethoscope } from "lucide-react";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { useClubDashboard } from "../../hooks/useClubDashboard";
import { useAuth } from "../../contexts/AuthContext";

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
  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>
      )}
    </span>
  );
}

const INSIGHT_STYLE = {
  warning: { color: "#F59E0B", icon: AlertTriangle, bg: "rgba(245,158,11,0.1)" },
  danger: { color: "#EF4444", icon: AlertTriangle, bg: "rgba(239,68,68,0.1)" },
  info: { color: "#6366F1", icon: Info, bg: "rgba(99,102,241,0.1)" },
};

const ACTION_ICONS = { "/club/calendrier": Calendar, "/club/contrats": FileSignature, "/club/sante": Stethoscope };

const AI_CLUB_QUESTIONS = [
  "Quel est l'état de l'effectif ?",
  "Y a-t-il des contrats à renouveler ?",
  "Résumé budget du club",
];

const AI_SUGGESTED_ACTIONS = [
  { label: "Voir calendrier", path: "/club/calendrier" },
  { label: "Gérer contrats", path: "/club/contrats" },
  { label: "Suivi médical", path: "/club/sante" },
];

function getClubAIResponse(question: string, summary: string[]): string {
  const q = question.toLowerCase();
  if (q.includes("effectif") || q.includes("joueur")) return summary[0] ?? "Aucun joueur enregistré.";
  if (q.includes("staff")) return summary[1] ?? "Aucun staff ajouté.";
  if (q.includes("budget") || q.includes("finance")) return summary[2] ?? "Budget non configuré.";
  return summary.join(" ") || "Ajoutez des données au club pour obtenir des insights.";
}

export function ClubAIPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: dashboard } = useClubDashboard();
  const summary = (dashboard?.aiSummary as string[] | undefined) ?? [
    "Aucun joueur enregistré.",
    "Aucun staff ajouté.",
    "Budget non configuré.",
  ];
  const insights = summary.map((text, i) => ({
    text,
    severity: (i === 0 ? "info" : "warning") as keyof typeof INSIGHT_STYLE,
  }));
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string; typing?: boolean }[]>([]);

  function askQuestion(question: string) {
    setChat((prev) => [...prev, { role: "user", text: question }]);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setChat((prev) => [...prev, { role: "ai", text: getClubAIResponse(question, summary), typing: true }]);
    }, 900);
  }

  function handleSend() {
    if (!input.trim()) return;
    askQuestion(input.trim());
    setInput("");
  }

  return (
    <ClubPageTransition className="mx-auto max-w-4xl space-y-6">
      {/* AI Insights */}
      <ClubKpiCard>
        <div className="mb-4 flex items-center gap-2">
          <Zap size={16} style={{ color: "#FF6B57" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>AI Insights</h3>
        </div>
        <div className="space-y-2">
          {insights.map((insight) => {
            const style = INSIGHT_STYLE[insight.severity];
            const Icon = style.icon;
            return (
              <div key={insight.text} className="flex items-start gap-3 rounded-xl border px-4 py-3" style={{ borderColor: `${style.color}30`, background: style.bg }}>
                <Icon size={16} style={{ color: style.color, marginTop: 2 }} />
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>{insight.text}</p>
              </div>
            );
          })}
        </div>
      </ClubKpiCard>

      {/* Suggested Actions */}
      <ClubKpiCard delay={0.05}>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Suggested Actions</h3>
        <div className="flex flex-wrap gap-2">
          {AI_SUGGESTED_ACTIONS.map((action) => {
            const Icon = ACTION_ICONS[action.path as keyof typeof ACTION_ICONS] ?? Calendar;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all hover:brightness-110"
                style={{ borderColor: "rgba(255,107,87,0.2)", color: "#FF6B57", background: "rgba(255,107,87,0.06)" }}
              >
                <Icon size={14} />{action.label}
              </button>
            );
          })}
        </div>
      </ClubKpiCard>

      <ClubKpiCard delay={0.1}>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(255,107,87,0.15)" }}>
            <Sparkles size={22} style={{ color: "#FF6B57" }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Assistant IA Club</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user?.organization?.clubName ?? "Mon club"} — Analyse intelligente</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {summary.map((line) => (
            <p key={line} className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "rgba(255,255,255,0.05)", color: "var(--text-secondary)" }}>
              {line}
            </p>
          ))}
        </div>
      </ClubKpiCard>

      <div className="flex flex-wrap gap-2">
        {AI_CLUB_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => askQuestion(q)}
            className="rounded-xl border px-4 py-2 text-sm transition-all hover:brightness-110"
            style={{ borderColor: "rgba(255,255,255,0.2)", color: "var(--text-secondary)" }}
          >
            {q}
          </button>
        ))}
      </div>

      <ClubKpiCard hover={false} className="min-h-[320px]" delay={0.15}>
        <div className="mb-4 flex items-center gap-2">
          <Bot size={18} style={{ color: "#FF6B57" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Chat</span>
        </div>
        <div className="mb-4 max-h-[360px] space-y-3 overflow-y-auto">
          {chat.length === 0 && (
            <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>Posez une question sur votre club...</p>
          )}
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm"
                style={{
                  background: msg.role === "user" ? "rgba(255,107,87,0.15)" : "rgba(255,255,255,0.05)",
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
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>Analyse en cours...</motion.span>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Votre question..."
            className="flex-1 rounded-xl border px-4 py-2.5 text-sm"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.05)", color: "var(--text-primary)" }}
          />
          <button type="button" onClick={handleSend} className="rounded-xl px-4 py-2.5" style={{ background: "#FF6B57", color: "white" }}>
            <Send size={16} />
          </button>
        </div>
      </ClubKpiCard>
    </ClubPageTransition>
  );
}
