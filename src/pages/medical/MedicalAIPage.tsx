import { useRef, useState, useEffect, useCallback } from "react";
import {
  Send, Bot, User, FileDown, AlertTriangle, Clock, Activity, Lightbulb,
  Loader2, MessageSquare, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { getInitials } from "../../data/medicalMockData";
import {
  medicalApi,
  type MedicalAiPlayer,
  type MedicalPlayerAnalysis,
  type MedicalAiCard,
  type MedicalReport,
} from "../../lib/api/medical";

/** Steel clinical palette */
const C = {
  slate: "#64748b",
  ice: "#38bdf8",
  white: "#f8fafc",
  muted: "#94a3b8",
  panel: "rgba(100, 116, 139, 0.12)",
  danger: "#f87171",
  ok: "#34d399",
} as const;

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  cards?: MedicalAiCard[];
}

function riskTone(score: number): string {
  if (score >= 75) return C.danger;
  if (score >= 50) return C.ice;
  return C.ok;
}

function levelLabel(level: string): string {
  const upper = level.toUpperCase();
  if (upper.includes("HIGH")) return "Élevé";
  if (upper.includes("MEDIUM") || upper.includes("MOYEN")) return "Moyen";
  if (upper.includes("LOW") || upper.includes("FAIBLE")) return "Faible";
  return level;
}

function renderRichText(content: string) {
  return content.split("**").map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

function RiskRing({ score, size = 132 }: { score: number; size?: number }) {
  const color = riskTone(score);
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, score)) / 100) * c;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(100,116,139,0.35)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold tabular-nums" style={{ color: C.white }}>{score}%</p>
        <p className="text-[10px] uppercase tracking-wider" style={{ color: C.muted }}>Risque</p>
      </div>
    </div>
  );
}

export function MedicalAIPage() {
  const counter = useRef(1);
  const filmRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [players, setPlayers] = useState<MedicalAiPlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [analysis, setAnalysis] = useState<MedicalPlayerAnalysis | null>(null);
  const [report, setReport] = useState<MedicalReport | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [aiStatus, setAiStatus] = useState<string>("available");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const player = players.find((p) => p.id === selectedPlayer) ?? players[0];
  const selectedIndex = players.findIndex((p) => p.id === selectedPlayer);

  const loadAnalysis = useCallback(async (playerId: string) => {
    setAnalysisLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await medicalApi.analyzePlayer(playerId);
      setAnalysis(res);
      setMessages([{ id: "auto", type: "ai", content: res.summary }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur analyse joueur.");
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  const loadPage = useCallback(async () => {
    setPageLoading(true);
    setError(null);
    try {
      const res = await medicalApi.getAi();
      setAiStatus(res.status);
      setSuggestions(res.suggestedQuestions);
      setPlayers(res.players);
      const first = res.players[0]?.id ?? "";
      setSelectedPlayer(first);
      if (!first) {
        setMessages([
          {
            id: "auto",
            type: "ai",
            content: "Aucun joueur dans l'effectif. Ajoutez des joueurs pour commencer l'analyse médicale.",
          },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger l'IA Médicale.");
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    if (!selectedPlayer || pageLoading) return;
    loadAnalysis(selectedPlayer);
  }, [selectedPlayer, loadAnalysis, pageLoading]);

  useEffect(() => {
    if (chatOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking, chatOpen]);

  function selectByOffset(delta: number) {
    if (players.length === 0 || selectedIndex < 0) return;
    const next = (selectedIndex + delta + players.length) % players.length;
    setSelectedPlayer(players[next].id);
  }

  function scrollFilm(dir: number) {
    filmRef.current?.scrollBy({ left: dir * 160, behavior: "smooth" });
  }

  async function sendMessage(text: string) {
    if (!text.trim() || thinking || aiStatus !== "available" || !selectedPlayer) return;
    setError(null);
    setChatOpen(true);
    const userMsg: Message = { id: String(counter.current++), type: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);
    try {
      const res = await medicalApi.chatAi(text.trim(), selectedPlayer);
      setMessages((prev) => [
        ...prev,
        {
          id: String(counter.current++),
          type: "ai",
          content: res.text,
          cards: res.cards,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur chat IA.");
    } finally {
      setThinking(false);
    }
  }

  async function handleGenerateReport() {
    if (!selectedPlayer || reportLoading || aiStatus !== "available") return;
    setReportLoading(true);
    setError(null);
    try {
      const generated = await medicalApi.generateReport(selectedPlayer);
      setReport(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur génération rapport.");
    } finally {
      setReportLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16">
        <Loader2 size={20} className="animate-spin" style={{ color: C.ice }} />
        <span className="text-sm" style={{ color: C.muted }}>Chargement Medical IA…</span>
      </div>
    );
  }

  const aiUnavailable = aiStatus !== "available";
  const score = analysis?.risk ?? player?.riskScore ?? 0;
  const tone = riskTone(score);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: C.white }}>
          Cas clinique
        </h1>
        <p className="mt-1 text-sm" style={{ color: C.slate }}>
          Visualiseur médical · analyse IA
        </p>
      </div>

      {aiStatus === "no_key" && (
        <div
          className="flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm"
          style={{ borderColor: `${C.ice}40`, background: `${C.ice}12`, color: C.ice }}
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          Clé OpenAI non configurée côté serveur.
        </div>
      )}

      {error && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: `${C.danger}40`, background: `${C.danger}12`, color: C.danger }}
        >
          {error}
        </div>
      )}

      {/* Focus card */}
      <GlassCard
        raised
        className="relative overflow-hidden px-5 py-6 sm:px-8 sm:py-8"
        style={{
          borderTop: `2px solid ${C.ice}`,
          background: "linear-gradient(180deg, rgba(56,189,248,0.06) 0%, rgba(100,116,139,0.04) 40%, transparent 100%)",
        }}
      >
        {!player ? (
          <p className="py-16 text-center text-sm" style={{ color: C.muted }}>
            Aucun joueur dans l&apos;effectif
          </p>
        ) : analysisLoading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
            <Loader2 size={22} className="animate-spin" style={{ color: C.ice }} />
            <p className="text-sm" style={{ color: C.muted }}>Analyse du cas…</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => selectByOffset(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-white/5"
                style={{ borderColor: "rgba(100,116,139,0.4)", color: C.slate }}
                aria-label="Joueur précédent"
              >
                <ChevronLeft size={18} />
              </button>
              <span
                className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                style={{
                  color: tone,
                  background: `${tone}18`,
                  border: `1px solid ${tone}40`,
                }}
              >
                {analysis ? levelLabel(analysis.level) : levelLabel(player.level)}
              </span>
              <button
                type="button"
                onClick={() => selectByOffset(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-white/5"
                style={{ borderColor: "rgba(100,116,139,0.4)", color: C.slate }}
                aria-label="Joueur suivant"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center sm:gap-10">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-bold"
                  style={{
                    background: C.panel,
                    color: C.ice,
                    border: `1px solid rgba(56,189,248,0.35)`,
                  }}
                >
                  {getInitials(player.name)}
                </div>
                <RiskRing score={score} />
              </div>

              <div className="w-full max-w-md space-y-4 text-center sm:text-left">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight" style={{ color: C.white }}>
                    {player.name}
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: C.slate }}>
                    {player.position}
                    {analysis?.injuryStatus ? ` · ${analysis.injuryStatus}` : ""}
                  </p>
                </div>

                <div
                  className="rounded-xl border px-4 py-3 text-left"
                  style={{ borderColor: "rgba(100,116,139,0.35)", background: C.panel }}
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    <Activity size={12} style={{ color: C.ice }} />
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
                      Blessure
                    </p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: C.white }}>
                    {analysis
                      ? `${analysis.mainInjury} — ${analysis.grade}`
                      : "En attente d'analyse"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="rounded-xl border px-3 py-2.5 text-left"
                    style={{ borderColor: "rgba(100,116,139,0.35)", background: C.panel }}
                  >
                    <div className="mb-1 flex items-center gap-1">
                      <Clock size={11} style={{ color: C.slate }} />
                      <span className="text-[10px] uppercase" style={{ color: C.muted }}>Retour</span>
                    </div>
                    <p className="text-base font-bold" style={{ color: C.white }}>
                      {analysis && analysis.returnDays > 0 ? `${analysis.returnDays}j` : "—"}
                    </p>
                  </div>
                  <div
                    className="rounded-xl border px-3 py-2.5 text-left"
                    style={{ borderColor: "rgba(100,116,139,0.35)", background: C.panel }}
                  >
                    <div className="mb-1 flex items-center gap-1">
                      <Lightbulb size={11} style={{ color: C.slate }} />
                      <span className="text-[10px] uppercase" style={{ color: C.muted }}>Conseil</span>
                    </div>
                    <p className="line-clamp-2 text-xs font-medium" style={{ color: C.white }}>
                      {analysis?.recommendation ?? "—"}
                    </p>
                  </div>
                </div>

                {analysis?.reasons && analysis.reasons.length > 0 ? (
                  <div className="space-y-2 text-left">
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
                      Facteurs
                    </p>
                    {analysis.reasons.slice(0, 3).map((r) => (
                      <div key={r.label}>
                        <div className="mb-0.5 flex justify-between text-[11px]">
                          <span style={{ color: C.muted }}>{r.label}</span>
                          <span style={{ color: C.slate }}>{r.impact}%</span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full" style={{ background: "rgba(100,116,139,0.3)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.min(100, r.impact)}%`, background: C.ice }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {analysis?.summary ? (
                  <p className="text-left text-xs leading-relaxed" style={{ color: C.muted }}>
                    {analysis.summary}
                  </p>
                ) : null}

                {report ? (
                  <div
                    className="rounded-xl border p-3 text-left"
                    style={{ borderColor: `${C.ice}35`, background: `${C.ice}0d` }}
                  >
                    <p className="text-xs font-bold" style={{ color: C.ice }}>{report.title}</p>
                    <div className="mt-2 max-h-28 space-y-2 overflow-y-auto">
                      {report.sections.map((s) => (
                        <div key={s.heading}>
                          <p className="text-[10px] font-semibold uppercase" style={{ color: C.slate }}>{s.heading}</p>
                          <p className="text-[11px] leading-relaxed" style={{ color: C.muted }}>{s.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => void handleGenerateReport()}
                    disabled={reportLoading || aiUnavailable || !analysis}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-45"
                    style={{ background: C.ice, color: "#0f172a" }}
                  >
                    {reportLoading ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
                    {reportLoading ? "Génération…" : "Générer le rapport"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatOpen(true)}
                    disabled={aiUnavailable}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/5 disabled:opacity-45"
                    style={{ borderColor: `${C.ice}50`, color: C.ice }}
                  >
                    <MessageSquare size={15} />
                    Demander à l&apos;IA
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </GlassCard>

      {/* Filmstrip */}
      {players.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.slate }}>
              Effectif
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => scrollFilm(-1)}
                className="rounded-md p-1 hover:bg-white/5"
                style={{ color: C.slate }}
                aria-label="Défiler à gauche"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => scrollFilm(1)}
                className="rounded-md p-1 hover:bg-white/5"
                style={{ color: C.slate }}
                aria-label="Défiler à droite"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div
            ref={filmRef}
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "thin" }}
          >
            {players.map((p) => {
              const active = p.id === selectedPlayer;
              const rc = riskTone(p.riskScore);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlayer(p.id)}
                  className="flex w-[108px] shrink-0 flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 transition-colors"
                  style={{
                    borderColor: active ? C.ice : "rgba(100,116,139,0.35)",
                    background: active ? `${C.ice}14` : C.panel,
                  }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[10px] font-bold"
                    style={{
                      background: active ? `${C.ice}22` : "rgba(100,116,139,0.2)",
                      color: active ? C.ice : C.muted,
                    }}
                  >
                    {getInitials(p.name)}
                  </div>
                  <p className="w-full truncate text-center text-[11px] font-semibold" style={{ color: C.white }}>
                    {p.name.split(" ")[0]}
                  </p>
                  <p className="text-[10px] font-bold tabular-nums" style={{ color: rc }}>
                    {p.riskScore}%
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Chat modal */}
      {chatOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            aria-label="Fermer"
            onClick={() => setChatOpen(false)}
          />
          <div
            className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl"
            style={{
              background: "var(--surface-panel-solid, #0f172a)",
              borderColor: "rgba(56,189,248,0.25)",
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3.5"
              style={{ borderColor: "rgba(100,116,139,0.35)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${C.ice}18`, color: C.ice }}
                >
                  <Bot size={15} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.white }}>Assistant IA</p>
                  <p className="text-[11px]" style={{ color: C.slate }}>
                    {player?.name ?? "Cas clinique"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="rounded-lg p-2 hover:bg-white/5"
                style={{ color: C.slate }}
              >
                <X size={16} />
              </button>
            </div>

            {suggestions.length > 0 ? (
              <div
                className="flex gap-2 overflow-x-auto border-b px-3 py-2.5"
                style={{ borderColor: "rgba(100,116,139,0.25)" }}
              >
                {suggestions.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void sendMessage(s)}
                    disabled={aiUnavailable || thinking}
                    className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium disabled:opacity-50"
                    style={{ borderColor: `${C.ice}40`, color: C.ice, background: `${C.ice}10` }}
                  >
                    {s.length > 34 ? `${s.slice(0, 34)}…` : s}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ minHeight: 240 }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: msg.type === "ai" ? `${C.ice}18` : "rgba(100,116,139,0.25)",
                      color: msg.type === "ai" ? C.ice : C.muted,
                    }}
                  >
                    {msg.type === "ai" ? <Bot size={13} /> : <User size={13} />}
                  </div>
                  <div className={`space-y-2 ${msg.cards && msg.cards.length > 0 ? "w-[min(100%,340px)] max-w-full" : "max-w-[85%]"}`}>
                    <div
                      className="rounded-xl px-3 py-2.5 text-sm whitespace-pre-line"
                      style={{
                        background: msg.type === "user" ? C.ice : "rgba(100,116,139,0.18)",
                        color: msg.type === "user" ? "#0f172a" : C.white,
                      }}
                    >
                      {renderRichText(msg.content)}
                    </div>
                    {msg.cards && msg.cards.length > 0 ? (
                      <div className="flex w-full min-w-[260px] flex-col gap-2.5 sm:min-w-[300px]">
                        {msg.cards.map((card) => (
                          <div
                            key={card.title}
                            className="rounded-xl border px-3.5 py-3"
                            style={{
                              borderColor: "rgba(56,189,248,0.28)",
                              background: "rgba(100,116,139,0.16)",
                              borderLeft: `3px solid ${C.ice}`,
                            }}
                          >
                            <p
                              className="text-xl font-bold tabular-nums leading-none"
                              style={{ color: C.ice }}
                            >
                              {card.value}
                            </p>
                            <p
                              className="mt-1.5 text-sm font-semibold"
                              style={{ color: C.white }}
                            >
                              {card.title}
                            </p>
                            <p
                              className="mt-0.5 text-xs leading-relaxed"
                              style={{ color: C.muted }}
                            >
                              {card.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {thinking ? (
                <div className="flex items-center gap-2 text-xs" style={{ color: C.muted }}>
                  <Loader2 size={12} className="animate-spin" style={{ color: C.ice }} />
                  Analyse en cours…
                </div>
              ) : null}
              <div ref={chatEndRef} />
            </div>

            <div
              className="flex gap-2 border-t p-3"
              style={{ borderColor: "rgba(100,116,139,0.35)" }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void sendMessage(input)}
                placeholder={player ? `Question sur ${player.name}…` : "Question médicale…"}
                disabled={aiUnavailable || thinking}
                className="flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none disabled:opacity-50"
                style={{
                  background: "rgba(100,116,139,0.12)",
                  borderColor: "rgba(100,116,139,0.4)",
                  color: C.white,
                }}
              />
              <button
                type="button"
                onClick={() => void sendMessage(input)}
                disabled={aiUnavailable || thinking || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl disabled:opacity-45"
                style={{ background: C.ice, color: "#0f172a" }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
