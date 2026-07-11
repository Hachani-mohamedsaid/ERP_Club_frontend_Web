import { useRef, useState, useEffect, useCallback } from "react";
import { Send, Bot, User, FileDown, AlertTriangle, Clock, Activity, Lightbulb, Loader2 } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { getInitials } from "../../data/medicalMockData";
import {
  medicalApi,
  type MedicalAiPlayer,
  type MedicalPlayerAnalysis,
  type MedicalAiCard,
} from "../../lib/api/medical";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  cards?: MedicalAiCard[];
}

function AnalysisPanel({
  analysis,
  loading,
  onGenerateReport,
  reportLoading,
}: {
  analysis: MedicalPlayerAnalysis | null;
  loading: boolean;
  onGenerateReport: () => void;
  reportLoading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 border-b p-8" style={{ borderColor: "var(--surface-panel-border)" }}>
        <Loader2 size={18} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Analyse en cours…</span>
      </div>
    );
  }
  if (!analysis) return null;

  const riskColor =
    analysis.risk >= 75
      ? "var(--color-state-danger)"
      : analysis.risk >= 50
        ? "var(--color-state-warning)"
        : "var(--color-state-success)";

  return (
    <div className="space-y-4 border-b p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Analyse — {analysis.playerName}
        </p>
        <AnimatedBadge tone={analysis.risk >= 75 ? "danger" : analysis.risk >= 50 ? "warning" : "success"}>
          {analysis.level}
        </AnimatedBadge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-3 text-center">
          <AlertTriangle size={16} className="mx-auto mb-1" style={{ color: riskColor }} />
          <p className="text-2xl font-bold" style={{ color: riskColor }}>{analysis.risk}%</p>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Risk Score</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <Clock size={16} className="mx-auto mb-1" style={{ color: "var(--color-state-info)" }} />
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {analysis.returnDays > 0 ? `${analysis.returnDays}j` : "—"}
          </p>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Retour estimé</p>
        </GlassCard>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 rounded-[var(--radius-odin-md)] border px-3 py-2" style={{ borderColor: "var(--surface-panel-border)" }}>
          <Activity size={14} style={{ color: "var(--accent)" }} />
          <div>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Blessure principale</p>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>
              {analysis.mainInjury} — {analysis.grade}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-[var(--radius-odin-md)] border px-3 py-2" style={{ borderColor: "var(--surface-panel-border)" }}>
          <Lightbulb size={14} style={{ color: "var(--color-state-warning)" }} />
          <div>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Recommandation</p>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{analysis.recommendation}</p>
          </div>
        </div>
      </div>

      {analysis.reasons.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Facteurs de risque</p>
          {analysis.reasons.map((r) => (
            <div key={r.label}>
              <div className="flex justify-between text-[10px]">
                <span style={{ color: "var(--text-secondary)" }}>{r.label}</span>
                <span style={{ color: "var(--text-muted)" }}>{r.impact}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full" style={{ background: "var(--surface-panel-border)" }}>
                <div className="h-full rounded-full" style={{ width: `${r.impact}%`, background: "var(--accent)" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Button className="w-full" onClick={onGenerateReport} disabled={reportLoading}>
        {reportLoading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
        {reportLoading ? "Génération…" : "Generate Report"}
      </Button>
    </div>
  );
}

export function MedicalAIPage() {
  const counter = useRef(1);
  const [players, setPlayers] = useState<MedicalAiPlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [analysis, setAnalysis] = useState<MedicalPlayerAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [aiStatus, setAiStatus] = useState<string>("available");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const player = players.find((p) => p.id === selectedPlayer) ?? players[0];

  const loadAnalysis = useCallback(async (playerId: string) => {
    setAnalysisLoading(true);
    setError(null);
    try {
      const res = await medicalApi.analyzePlayer(playerId);
      setAnalysis(res);
      setMessages([
        {
          id: "auto",
          type: "ai",
          content: res.summary,
        },
      ]);
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
      setError(err instanceof Error ? err.message : "Impossible de charger Medical AI.");
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

  async function sendMessage(text: string) {
    if (!text.trim() || thinking || aiStatus !== "available" || !selectedPlayer) return;
    setError(null);
    const userMsg: Message = { id: String(counter.current++), type: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);
    try {
      const res = await medicalApi.chatAi(text.trim(), selectedPlayer);
      const aiMsg: Message = {
        id: String(counter.current++),
        type: "ai",
        content: res.text,
        cards: res.cards,
      };
      setMessages((prev) => [...prev, aiMsg]);
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
      const report = await medicalApi.generateReport(selectedPlayer);
      const body = report.sections.map((s) => `**${s.heading}**\n${s.body}`).join("\n\n");
      setMessages((prev) => [
        ...prev,
        {
          id: String(counter.current++),
          type: "ai",
          content: `📋 ${report.title}\n\n${body || report.markdown}`,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur génération rapport.");
    } finally {
      setReportLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16">
        <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement Medical AI…</span>
      </div>
    );
  }

  const aiUnavailable = aiStatus !== "available";

  return (
    <div className="space-y-4">
      {aiStatus === "no_key" && (
        <div
          className="flex items-start gap-2 rounded-xl border p-3 text-sm text-amber-300"
          style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)" }}
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          Clé OpenAI non configurée côté serveur.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="p-4 lg:col-span-1">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Joueurs</h3>
          <div className="space-y-1">
            {players.map((p) => {
              const active = p.id === selectedPlayer;
              const risk = p.riskScore;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlayer(p.id)}
                  className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2.5 text-left transition-colors"
                  style={{
                    background: active ? "rgba(var(--accent-rgb), 0.15)" : "transparent",
                    borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
                  }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    {getInitials(p.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.position}</p>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color:
                        risk >= 75
                          ? "var(--color-state-danger)"
                          : risk >= 50
                            ? "var(--color-state-warning)"
                            : "var(--color-state-success)",
                    }}
                  >
                    {risk}%
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Suggestions</p>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(s)}
                disabled={aiUnavailable || thinking}
                className="block w-full rounded-[var(--radius-odin-md)] border px-3 py-2 text-left text-xs transition-colors hover:bg-white/5 disabled:opacity-50"
                style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}
              >
                {s}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard raised className="flex flex-col lg:col-span-2" style={{ minHeight: 600 }}>
          <div className="flex items-center gap-2 border-b p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
            <Bot size={20} style={{ color: "var(--accent)" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Medical Assistant IA</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Analyse structurée par joueur</p>
            </div>
          </div>

          <AnalysisPanel
            analysis={analysis}
            loading={analysisLoading}
            onGenerateReport={handleGenerateReport}
            reportLoading={reportLoading}
          />

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: msg.type === "ai" ? "var(--accent-soft)" : "var(--surface-panel-border)",
                    color: msg.type === "ai" ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  {msg.type === "ai" ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className="max-w-[80%] space-y-2">
                  <div
                    className="rounded-[var(--radius-odin-md)] px-4 py-3 text-sm whitespace-pre-line"
                    style={{
                      background: msg.type === "user" ? "var(--accent)" : "rgba(var(--accent-rgb), 0.08)",
                      color: msg.type === "user" ? "white" : "var(--text-primary)",
                    }}
                  >
                    {msg.content.split("**").map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
                  </div>
                  {msg.cards && msg.cards.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {msg.cards.map((card) => (
                        <div
                          key={card.title}
                          className="rounded-lg border p-2 text-xs"
                          style={{ borderColor: "var(--surface-panel-border)" }}
                        >
                          <p className="font-semibold" style={{ color: card.color }}>{card.value}</p>
                          <p style={{ color: "var(--text-primary)" }}>{card.title}</p>
                          <p style={{ color: "var(--text-muted)" }}>{card.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                <Loader2 size={14} className="animate-spin" />
                Analyse en cours…
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder={player ? `Question sur ${player.name}...` : "Question médicale..."}
              disabled={aiUnavailable || thinking}
              className="glass-input flex-1 py-2.5 px-4 text-sm disabled:opacity-50"
            />
            <Button onClick={() => sendMessage(input)} disabled={aiUnavailable || thinking}>
              <Send size={16} />
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
