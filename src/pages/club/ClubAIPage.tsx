import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bot, Send, Sparkles, AlertTriangle, Info, Zap, Calendar, FileSignature,
  Stethoscope, Loader2, RefreshCw,
} from "lucide-react";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { clubApi } from "../../lib/api/club";
import { useAuth } from "../../contexts/AuthContext";

type AiInsight = { text: string; severity: string };
type AiData = Awaited<ReturnType<typeof clubApi.getAi>>;

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

const INSIGHT_STYLE: Record<string, { color: string; icon: typeof Info; bg: string }> = {
  warning: { color: "#F59E0B", icon: AlertTriangle, bg: "rgba(245,158,11,0.1)" },
  danger: { color: "#EF4444", icon: AlertTriangle, bg: "rgba(239,68,68,0.1)" },
  info: { color: "#6366F1", icon: Info, bg: "rgba(99,102,241,0.1)" },
};

const ACTION_ICONS: Record<string, typeof Calendar> = {
  "/club/calendrier": Calendar,
  "/club/contrats": FileSignature,
  "/club/sante": Stethoscope,
};

export function ClubAIPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<AiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string; typing?: boolean; meta?: string }[]>([]);

  const loadAi = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setLoadError(null);
    try {
      const res = await clubApi.getAi();
      setData(res);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Impossible de charger l'assistant IA.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAi();
  }, [loadAi]);

  async function askQuestion(question: string) {
    if (thinking || data?.status !== "available") return;
    setChatError(null);
    setChat((prev) => [...prev, { role: "user", text: question }]);
    setThinking(true);
    try {
      const res = await clubApi.chatAi(question);
      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          text: res.answer,
          typing: true,
          meta: `${res.model} · ${(res.durationMs / 1000).toFixed(1)}s`,
        },
      ]);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Erreur lors de l'analyse IA.");
    } finally {
      setThinking(false);
    }
  }

  function handleSend() {
    if (!input.trim() || thinking) return;
    askQuestion(input.trim());
    setInput("");
  }

  if (loading && !data) {
    return (
      <ClubPageTransition className="mx-auto flex max-w-4xl items-center gap-2 py-12">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#FF6B57" }} />
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement Assistant IA…</span>
      </ClubPageTransition>
    );
  }

  if (loadError && !data) {
    return (
      <ClubPageTransition className="mx-auto max-w-4xl space-y-4 py-12">
        <p className="text-sm text-red-400">{loadError}</p>
        <button
          type="button"
          onClick={() => loadAi()}
          className="rounded-xl border px-4 py-2 text-sm"
          style={{ borderColor: "rgba(255,107,87,0.3)", color: "#FF6B57" }}
        >
          Réessayer
        </button>
      </ClubPageTransition>
    );
  }

  const insights: AiInsight[] = data?.insights ?? [];
  const summary = data?.summary ?? [];
  const suggestedActions = data?.suggestedActions ?? [];
  const suggestedQuestions = data?.suggestedQuestions ?? [];
  const clubLabel = data?.clubName ?? user?.organization?.clubName ?? "Mon club";
  const season = data?.season ?? String(new Date().getFullYear());
  const aiUnavailable = data?.status !== "available";

  return (
    <ClubPageTransition className="mx-auto max-w-4xl space-y-6">
      {data?.status === "no_key" && (
        <div
          className="flex items-start gap-3 rounded-xl border p-4"
          style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)" }}
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-300">Clé OpenAI non configurée</p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              L'assistant utilise des données locales. Contactez l'administrateur ODIN pour activer OpenAI.
            </p>
          </div>
        </div>
      )}

      {chatError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {chatError}
        </div>
      )}

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => loadAi(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs"
          style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Actualisation…" : "Actualiser"}
        </button>
      </div>

      <ClubKpiCard>
        <div className="mb-4 flex items-center gap-2">
          <Zap size={16} style={{ color: "#FF6B57" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>AI Insights</h3>
          {data?.status === "available" && (
            <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>
              {data.provider} / {data.model}
            </span>
          )}
        </div>
        <div className="space-y-2">
          {insights.map((insight) => {
            const style = INSIGHT_STYLE[insight.severity] ?? INSIGHT_STYLE.info;
            const Icon = style.icon;
            return (
              <div
                key={insight.text}
                className="flex items-start gap-3 rounded-xl border px-4 py-3"
                style={{ borderColor: `${style.color}30`, background: style.bg }}
              >
                <Icon size={16} style={{ color: style.color, marginTop: 2 }} />
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>{insight.text}</p>
              </div>
            );
          })}
        </div>
      </ClubKpiCard>

      <ClubKpiCard delay={0.05}>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Suggested Actions</h3>
        <div className="flex flex-wrap gap-2">
          {suggestedActions.map((action) => {
            const Icon = ACTION_ICONS[action.path] ?? Calendar;
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
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {clubLabel} — Saison {season} · Analyse intelligente
              {data?.avgResponseTime && data.avgResponseTime !== "—" ? ` · ${data.avgResponseTime} moy.` : ""}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {summary.map((line) => (
            <p
              key={line}
              className="rounded-xl border px-4 py-3 text-sm"
              style={{ borderColor: "rgba(255,255,255,0.05)", color: "var(--text-secondary)" }}
            >
              {line}
            </p>
          ))}
        </div>
      </ClubKpiCard>

      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            type="button"
            disabled={aiUnavailable || thinking}
            onClick={() => askQuestion(q)}
            className="rounded-xl border px-4 py-2 text-sm transition-all hover:brightness-110 disabled:opacity-50"
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
            <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
              {aiUnavailable
                ? "Chat IA indisponible — configurez OpenAI côté serveur."
                : "Posez une question sur votre club…"}
            </p>
          )}
          <AnimatePresence initial={false}>
            {chat.map((msg, i) => (
              <motion.div
                key={`${msg.role}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm"
                  style={{
                    background: msg.role === "user" ? "rgba(255,107,87,0.15)" : "rgba(255,255,255,0.05)",
                    color: "var(--text-primary)",
                  }}
                >
                  {msg.role === "ai" && msg.typing ? <TypingText text={msg.text} /> : msg.text}
                  {msg.meta && (
                    <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>{msg.meta}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {thinking && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-2.5 text-sm" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
                  Analyse OpenAI en cours…
                </motion.span>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={aiUnavailable ? "IA indisponible" : "Votre question…"}
            disabled={aiUnavailable || thinking}
            className="flex-1 rounded-xl border px-4 py-2.5 text-sm disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.05)", color: "var(--text-primary)" }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={aiUnavailable || thinking || !input.trim()}
            className="rounded-xl px-4 py-2.5 disabled:opacity-50"
            style={{ background: "#FF6B57", color: "white" }}
          >
            <Send size={16} />
          </button>
        </div>
      </ClubKpiCard>
    </ClubPageTransition>
  );
}
