import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, Loader2, Zap, AlertTriangle } from "lucide-react";
import { CoachPageTransition, CCard, COACH_ACCENT } from "../../components/coach2/CoachPageTransition";
import { coachApi, type CoachAiCard } from "../../lib/api/coach";

interface AIMessage {
  role: "user" | "ai";
  text: string;
  cards?: CoachAiCard[];
  meta?: string;
}

const DEFAULT_QUICK_QUESTIONS = [
  "Qui doit jouer titulaire au prochain match ?",
  "Quel joueur est le plus fatigué ?",
  "Recommandation pour la composition",
  "Risques de blessure cette semaine",
  "Qui mérite d'être capitaine ?",
  "Bilan des performances récentes",
];

export function CoachAIPage() {
  const [aiMeta, setAiMeta] = useState<Awaited<ReturnType<typeof coachApi.getAi>> | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAi = useCallback(async () => {
    try {
      const res = await coachApi.getAi();
      setAiMeta(res);
      setMessages([
        {
          role: "ai",
          text: `Bonjour ${res.coachName.split(" ")[0] || "Coach"} ! 👋 Je suis l'assistant IA ODIN pour ${res.clubName}. Posez-moi une question sur l'effectif (${res.summary.squadSize} joueurs), la tactique ou la préparation de match.`,
        },
      ]);
    } catch {
      setMessages([
        {
          role: "ai",
          text: "Bonjour Coach ! 👋 Je suis votre assistant IA ODIN. Posez-moi une question sur votre effectif, vos tactiques ou la préparation de match.",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    loadAi();
  }, [loadAi]);

  const nextMatchQuestion = "Comment préparer le prochain match ?";

  const quickQuestions = aiMeta?.suggestedQuestions ?? [
    nextMatchQuestion,
    ...DEFAULT_QUICK_QUESTIONS,
  ];

  async function send(q: string) {
    if (!q.trim() || thinking || aiMeta?.status === "no_key" || aiMeta?.status === "disabled") return;
    setError(null);
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setThinking(true);
    try {
      const res = await coachApi.chatAi(q.trim());
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: res.text,
          cards: res.cards,
          meta: `${res.model} · ${(res.durationMs / 1000).toFixed(1)}s`,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur IA Coach.");
    } finally {
      setThinking(false);
    }
  }

  const aiUnavailable = aiMeta?.status != null && aiMeta.status !== "available";

  return (
    <CoachPageTransition>
      <div className="flex items-center gap-3">
        <motion.div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)`, boxShadow: `0 0 30px ${COACH_ACCENT}50` }}
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Brain size={22} className="text-white" />
        </motion.div>
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Assistant IA ODIN</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {aiMeta?.clubName ?? "Club"} · Saison {aiMeta?.season ?? new Date().getFullYear()} · Analyse effectif & tactique
            {aiMeta?.provider && aiMeta.model ? ` · ${aiMeta.provider}/${aiMeta.model}` : ""}
          </p>
        </div>
      </div>

      {aiMeta?.status === "no_key" && (
        <div
          className="flex items-start gap-2 rounded-xl border p-3 text-sm text-amber-300"
          style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)" }}
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          Clé API IA non configurée côté serveur.
        </div>
      )}

      {aiMeta?.summary && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Effectif", value: aiMeta.summary.squadSize },
            { label: "Disponibles", value: aiMeta.summary.disponibles },
            { label: "Charge moy.", value: `${aiMeta.summary.avgLoad}%` },
            { label: "Critiques", value: aiMeta.summary.critiques },
          ].map((kpi) => (
            <CCard key={kpi.label} className="!p-3 text-center">
              <p className="text-lg font-bold" style={{ color: COACH_ACCENT }}>{kpi.value}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
            </CCard>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <CCard>
        <p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Questions rapides</p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q) => (
            <motion.button
              key={q}
              type="button"
              disabled={aiUnavailable || thinking}
              onClick={() => send(q)}
              className="rounded-full border px-3 py-1.5 text-[11px] disabled:opacity-50"
              style={{ borderColor: `${COACH_ACCENT}30`, color: "var(--text-muted)", background: `${COACH_ACCENT}06` }}
              whileHover={{ borderColor: COACH_ACCENT, color: COACH_ACCENT, scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Zap size={9} className="mr-1 inline" style={{ color: COACH_ACCENT }} />
              {q}
            </motion.button>
          ))}
        </div>
      </CCard>

      <CCard className="!p-4">
        <div className="max-h-96 space-y-4 overflow-y-auto pr-1">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={`${msg.role}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[85%]">
                  {msg.role === "ai" && (
                    <div className="mb-1 flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full"
                        style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)` }}
                      >
                        <Brain size={12} className="text-white" />
                      </div>
                      <span className="text-[10px] font-bold" style={{ color: COACH_ACCENT }}>ODIN IA</span>
                      {msg.meta && (
                        <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{msg.meta}</span>
                      )}
                    </div>
                  )}
                  <div
                    className="rounded-2xl px-4 py-3"
                    style={{
                      background: msg.role === "user" ? `linear-gradient(135deg,${COACH_ACCENT},#E66000)` : "rgba(255,255,255,0.05)",
                      borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                      color: msg.role === "user" ? "white" : "var(--text-secondary)",
                    }}
                  >
                    <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                  </div>
                  {msg.cards && msg.cards.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.cards.map((card, ci) => (
                        <motion.div
                          key={`${card.title}-${ci}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: ci * 0.08 }}
                          className="min-w-[130px] rounded-xl border p-3"
                          style={{ background: `${card.color}08`, borderColor: `${card.color}25` }}
                        >
                          <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{card.title}</p>
                          <p className="mt-0.5 text-lg font-extrabold" style={{ color: card.color }}>{card.value}</p>
                          <p className="mt-0.5 text-[9px]" style={{ color: "var(--text-muted)" }}>{card.detail}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {thinking && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)` }}
                >
                  <Loader2 size={12} className="animate-spin text-white" />
                </div>
                <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Analyse IA en cours…</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className="mt-4 flex items-center gap-2 rounded-2xl border p-2"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: `${COACH_ACCENT}30` }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder={aiUnavailable ? "IA indisponible" : "Posez une question sur votre effectif, tactique, match..."}
            disabled={aiUnavailable || thinking}
            className="flex-1 bg-transparent text-sm outline-none disabled:opacity-50"
            style={{ color: "var(--text-primary)" }}
          />
          <motion.button
            type="button"
            onClick={() => send(input)}
            disabled={!input.trim() || thinking || aiUnavailable}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-40"
            style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)` }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <Send size={14} />
          </motion.button>
        </div>
      </CCard>
    </CoachPageTransition>
  );
}
