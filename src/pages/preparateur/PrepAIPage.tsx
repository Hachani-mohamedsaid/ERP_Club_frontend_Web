import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bot, Send, Sparkles, SendHorizonal, AlertTriangle, CheckCircle2,
  TrendingUp, Heart, Zap, Loader2, RefreshCw,
} from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { preparateurApi, type PrepAiCard } from "../../lib/api/preparateur";

function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 12);
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

interface AIResponse {
  text: string;
  cards?: PrepAiCard[];
  meta?: string;
}

const QUICK_ICONS = [
  { icon: AlertTriangle, color: "#EF4444" },
  { icon: Heart, color: "#FF7A00" },
  { icon: CheckCircle2, color: "#22C55E" },
  { icon: TrendingUp, color: "#3B82F6" },
  { icon: Zap, color: "#8B5CF6" },
];

export function PrepAIPage() {
  const navigate = useNavigate();
  const [aiData, setAiData] = useState<Awaited<ReturnType<typeof preparateurApi.getAi>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string; response?: AIResponse; typing?: boolean }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadAi = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setLoadError(null);
    try {
      const res = await preparateurApi.getAi();
      setAiData(res);
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

  async function ask(q: string) {
    if (thinking || aiData?.status !== "available") return;
    setChatError(null);
    setChat((prev) => [...prev, { role: "user", text: q }]);
    setThinking(true);
    try {
      const res = await preparateurApi.chatAi(q);
      const response: AIResponse = {
        text: res.text,
        cards: res.cards,
        meta: `${res.model} · ${(res.durationMs / 1000).toFixed(1)}s`,
      };
      setChat((prev) => [...prev, { role: "ai", text: response.text, response, typing: true }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Erreur lors de l'analyse IA.");
    } finally {
      setThinking(false);
    }
  }

  if (loading && !aiData) {
    return (
      <PrepPageTransition className="mx-auto flex max-w-5xl items-center gap-2 py-12">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#6366F1" }} />
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement Assistant IA…</span>
      </PrepPageTransition>
    );
  }

  const aiUnavailable = aiData?.status !== "available";
  const quickQuestions = aiData?.suggestedQuestions ?? [
    "Qui risque une blessure ?",
    "Qui doit récupérer ?",
    "Qui est prêt pour samedi ?",
    "Qui progresse le plus ?",
    "Charge critique ce soir ?",
  ];
  const statusOnline = aiData?.status === "available";

  return (
    <PrepPageTransition className="mx-auto max-w-5xl space-y-6">
      {aiData?.status === "no_key" && (
        <div
          className="flex items-start gap-3 rounded-xl border p-4"
          style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)" }}
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">
            Clé OpenAI non configurée — contactez l&apos;administrateur ODIN ERP.
          </p>
        </div>
      )}

      {loadError && (
        <p className="text-sm text-red-400">{loadError}</p>
      )}

      {chatError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {chatError}
        </div>
      )}

      <PrepKpiCard hover={false}>
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: "rgba(99,102,241,0.18)" }}
            animate={{ boxShadow: ["0 0 0px #6366F100", "0 0 20px #6366F155", "0 0 0px #6366F100"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={22} style={{ color: "#6366F1" }} />
          </motion.div>
          <div>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
              ODIN AI — Préparateur Physique
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {aiData?.clubName ?? "Club"} · Saison {aiData?.season ?? new Date().getFullYear()} · Analyse charge · Risque · Recommandations
              {aiData?.provider && aiData.model ? ` · ${aiData.provider}/${aiData.model}` : ""}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadAi(true)}
              disabled={refreshing}
              className="rounded-lg border p-1.5"
              style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <div className="flex items-center gap-1.5">
              <motion.div
                className="h-2 w-2 rounded-full"
                style={{ background: statusOnline ? "#22C55E" : "#EF4444" }}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs" style={{ color: statusOnline ? "#22C55E" : "#EF4444" }}>
                {statusOnline ? "En ligne" : "Hors ligne"}
              </span>
            </div>
          </div>
        </div>

        {aiData?.summary && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Joueurs", value: aiData.summary.totalPlayers },
              { label: "Charge moy.", value: `${aiData.summary.avgLoad}%` },
              { label: "Critiques", value: aiData.summary.critiques },
              { label: "Risques", value: aiData.summary.injuryRiskCount },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border px-3 py-2 text-center"
                style={{ borderColor: "var(--surface-panel-border)" }}
              >
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{kpi.value}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
              </div>
            ))}
          </div>
        )}
      </PrepKpiCard>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Questions rapides
        </p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((label, i) => {
            const meta = QUICK_ICONS[i] ?? QUICK_ICONS[0];
            const Icon = meta.icon;
            return (
              <motion.button
                key={label}
                type="button"
                disabled={aiUnavailable || thinking}
                onClick={() => ask(label)}
                className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium disabled:opacity-50"
                style={{ borderColor: `${meta.color}30`, color: meta.color, background: `${meta.color}08` }}
                whileHover={{ scale: 1.04, background: `${meta.color}15`, borderColor: `${meta.color}50` }}
                whileTap={{ scale: 0.96 }}
              >
                <Icon size={11} />
                {label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <PrepKpiCard hover={false} className="min-h-[400px]">
        <div className="mb-4 flex items-center gap-2">
          <Bot size={16} style={{ color: "#6366F1" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Conversation</span>
        </div>

        <div className="max-h-[500px] space-y-4 overflow-y-auto pr-1 pb-2">
          {chat.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="mb-3 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: "rgba(99,102,241,0.12)" }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Sparkles size={24} style={{ color: "#6366F1" }} />
              </motion.div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Prêt à analyser votre effectif
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                {aiUnavailable
                  ? "Configurez OpenAI côté serveur pour activer le chat"
                  : "Utilisez les questions rapides ou posez votre question"}
              </p>
            </motion.div>
          )}

          <AnimatePresence>
            {chat.map((msg, i) => (
              <motion.div
                key={`${msg.role}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "user" ? (
                  <div
                    className="max-w-[75%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm"
                    style={{ background: "rgba(99,102,241,0.18)", color: "var(--text-primary)" }}
                  >
                    {msg.text}
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <div className="flex items-start gap-2">
                      <div
                        className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: "rgba(99,102,241,0.18)" }}
                      >
                        <Bot size={12} style={{ color: "#6366F1" }} />
                      </div>
                      <div
                        className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
                        style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-primary)" }}
                      >
                        {msg.typing ? <TypingText text={msg.text} /> : msg.text}
                        {msg.response?.meta && (
                          <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                            {msg.response.meta}
                          </p>
                        )}
                      </div>
                    </div>

                    {msg.response?.cards && msg.response.cards.length > 0 && (
                      <div className="ml-9 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {msg.response.cards.map((card, ci) => (
                          <motion.div
                            key={`${card.player}-${ci}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + ci * 0.1 }}
                            className="rounded-2xl border p-3"
                            style={{ background: `${card.color}08`, borderColor: `${card.color}25` }}
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                                {card.player}
                              </p>
                              <div className="flex items-center gap-1.5">
                                {card.ready !== undefined && (
                                  <span
                                    className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                                    style={{
                                      background: card.ready ? "#22C55E18" : "#EF444418",
                                      color: card.ready ? "#22C55E" : "#EF4444",
                                    }}
                                  >
                                    {card.ready ? "✓ Disponible" : "✗ Indisponible"}
                                  </span>
                                )}
                                <span className="text-lg font-extrabold" style={{ color: card.color }}>
                                  {card.risk}%
                                </span>
                              </div>
                            </div>
                            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: card.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, card.risk)}%` }}
                                transition={{ duration: 0.8, delay: 0.5 + ci * 0.1 }}
                              />
                            </div>
                            <div className="mb-2 space-y-0.5">
                              {card.reasons.map((r, ri) => (
                                <p key={ri} className="text-[10px]" style={{ color: "var(--text-muted)" }}>• {r}</p>
                              ))}
                            </div>
                            <div className="space-y-0.5">
                              {card.recommendations.map((r, ri) => (
                                <p key={ri} className="text-[10px] font-semibold" style={{ color: card.color }}>
                                  → {r}
                                </p>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {thinking && (
            <div className="flex items-start gap-2">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(99,102,241,0.18)" }}
              >
                <Bot size={12} style={{ color: "#6366F1" }} />
              </div>
              <div
                className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm"
                style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}
              >
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}>
                  Analyse OpenAI en cours…
                </motion.span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                ask(input.trim());
                setInput("");
              }
            }}
            placeholder={aiUnavailable ? "IA indisponible" : "Ex: Ahmed peut-il jouer samedi ? Qui doit récupérer ?"}
            disabled={aiUnavailable || thinking}
            className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "var(--surface-panel-border)",
              color: "var(--text-primary)",
            }}
          />
          <motion.button
            type="button"
            disabled={aiUnavailable || thinking || !input.trim()}
            onClick={() => {
              if (input.trim()) {
                ask(input.trim());
                setInput("");
              }
            }}
            className="rounded-xl px-4 py-2.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", color: "white" }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            <Send size={16} />
          </motion.button>
        </div>
      </PrepKpiCard>

      <PrepKpiCard delay={0.1}>
        <p className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Actions rapides</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Charge équipe", path: "/preparateur/charge", icon: SendHorizonal, color: "#FF6B57" },
            { label: "Risques blessures", path: "/preparateur/risques", icon: AlertTriangle, color: "#EF4444" },
            { label: "Créer programme", path: "/preparateur/programmes", icon: Sparkles, color: "#6366F1" },
            { label: "Comparer joueurs", path: "/preparateur/comparaison", icon: TrendingUp, color: "#3B82F6" },
            { label: "Wellness équipe", path: "/preparateur/wellness", icon: Heart, color: "#22C55E" },
          ].map(({ label, path, icon: Icon, color }) => (
            <motion.button
              key={label}
              type="button"
              onClick={() => navigate(path)}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium"
              style={{ background: `${color}12`, color }}
              whileHover={{ scale: 1.04 }}
            >
              <Icon size={12} /> {label}
            </motion.button>
          ))}
        </div>
      </PrepKpiCard>
    </PrepPageTransition>
  );
}
