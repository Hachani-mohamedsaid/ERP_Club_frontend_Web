import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Bot, Send, Sparkles, FileDown, TrendingUp, TrendingDown, AlertCircle, History,
  MessageSquare, ShieldAlert, CheckCircle2, XCircle, Dumbbell, Loader2, RefreshCw,
} from "lucide-react";
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { JoueurKpiCard } from "../../components/player/JoueurKpiCard";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { Button } from "../../components/ui/Button";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";
import { useLocale } from "../../contexts/LocaleContext";
import {
  joueurApi,
  type JoueurAiReport,
  type JoueurAiChatHistoryItem,
} from "../../lib/api/joueur";
import {
  AI_WEEKLY_INSIGHTS,
  AI_STRENGTHS,
  AI_WEAKNESSES,
  AI_TRAINING_PLAN,
  AI_INJURY_PREVENTION,
  AI_RECOMMENDATIONS,
  AI_COACH_QUESTIONS,
  AI_CHAT_HISTORY,
} from "../../data/joueurPersonalData";

function localFallbackReport(playerName: string): JoueurAiReport {
  return {
    weeklyInsights: AI_WEEKLY_INSIGHTS,
    strengths: AI_STRENGTHS,
    weaknesses: AI_WEAKNESSES,
    trainingPlan: AI_TRAINING_PLAN,
    injuryPrevention: AI_INJURY_PREVENTION,
    recommendations: AI_RECOMMENDATIONS,
    suggestedQuestions: AI_COACH_QUESTIONS,
    chatHistory: AI_CHAT_HISTORY,
    playerName,
    aiGenerated: false,
  };
}

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
        <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
          |
        </motion.span>
      )}
    </span>
  );
}

export function JoueurAIPage() {
  const { player, playerId } = useCurrentPlayer();
  const { t } = useLocale();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [report, setReport] = useState<JoueurAiReport | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<string>("available");
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string; typing?: boolean }[]>([]);
  const [history, setHistory] = useState<JoueurAiChatHistoryItem[]>([]);
  const loadedForRef = useRef<string | null>(null);

  const loadReport = useCallback(async (refresh = false, playerName = "Joueur") => {
    if (refresh) setRefreshing(true);
    setLoadError(null);
    try {
      const data = await joueurApi.getAiReport(refresh);
      setReport(data);
      setHistory(data.chatHistory ?? []);
      try {
        const meta = await joueurApi.getAi();
        setAiStatus(meta.status);
      } catch {
        setAiStatus("available");
      }
    } catch (err) {
      const msg =
        err instanceof Error && err.name === "AbortError"
          ? "Délai dépassé — le serveur met trop de temps à répondre"
          : err instanceof Error
            ? err.message
            : "Erreur de chargement";
      setLoadError(msg);
      const fallback = localFallbackReport(playerName);
      setReport(fallback);
      setHistory(fallback.chatHistory ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!playerId || !player) return;
    if (loadedForRef.current === playerId) return;
    loadedForRef.current = playerId;

    const fallback = localFallbackReport(player.name);
    setReport(fallback);
    setHistory(fallback.chatHistory ?? []);
    setLoading(false);

    void loadReport(false, player.name);
  }, [playerId, player?.name, loadReport]);

  if (!player) return null;

  const firstName = (report?.playerName ?? player.name).split(" ")[0];
  const clubName = report?.clubName ?? "Club";
  const weekly = report?.weeklyInsights;
  const strengths = report?.strengths ?? [];
  const weaknesses = report?.weaknesses ?? [];
  const trainingPlan = report?.trainingPlan ?? [];
  const injury = report?.injuryPrevention;
  const recommendations = report?.recommendations ?? [];
  const suggestedQuestions = report?.suggestedQuestions ?? [];

  async function askQuestion(question: string) {
    const q = question.trim();
    if (!q) return;

    setChat((prev) => [...prev, { role: "user", text: q }]);
    setHistory((prev) => [
      { id: `local-${Date.now()}`, period: "Aujourd'hui", question: q },
      ...prev.filter((h) => h.question !== q).slice(0, 7),
    ]);
    setThinking(true);

    try {
      const res = await joueurApi.chatAi(q);
      setChat((prev) => [...prev, { role: "ai", text: res.text, typing: true }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur assistant IA";
      setChat((prev) => [...prev, { role: "ai", text: msg }]);
    } finally {
      setThinking(false);
    }
  }

  function exportReport() {
    if (!report || !weekly || !injury) return;

    const reportHtml = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Rapport IA — ${player!.name}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;margin:0;padding:40px;background:#0b1020;color:#e8eaf2}
  .header{display:flex;align-items:center;gap:16px;border-bottom:3px solid #FF6B57;padding-bottom:16px;margin-bottom:24px}
  .badge{width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,#FF6B57,#C46A12);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff}
  h1{margin:0;font-size:24px}.sub{color:#9aa0b5;font-size:13px;margin-top:4px}
  h2{font-size:15px;color:#FF6B57;margin:24px 0 10px;text-transform:uppercase;letter-spacing:1px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  td,th{padding:8px 10px;border-bottom:1px solid #232a44;text-align:left}
  .pill{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700}
  .ok{background:rgba(34,197,94,.15);color:#22C55E}.warn{background:rgba(245,158,11,.15);color:#F59E0B}.bad{background:rgba(239,68,68,.15);color:#EF4444}
  ul{margin:8px 0;padding-left:20px;font-size:13px;line-height:1.7}
  .footer{margin-top:32px;border-top:1px solid #232a44;padding-top:12px;font-size:11px;color:#6b7290}
</style></head><body>
  <div class="header">
    <div class="badge">${firstName[0]}</div>
    <div><h1>Rapport Hebdomadaire IA</h1><div class="sub">${player!.name} · ${player!.position} · OVR ${player!.ovr} · ${clubName}</div></div>
  </div>
  <h2>Synthèse de la semaine</h2>
  <table>
    <tr><td>Vitesse</td><td><span class="pill ok">${weekly.speedChange}</span></td></tr>
    <tr><td>Endurance</td><td><span class="pill bad">${weekly.enduranceChange}</span></td></tr>
    <tr><td>Risque fatigue</td><td><span class="pill warn">${weekly.fatigueRisk}</span></td></tr>
    <tr><td>Conseil IA</td><td>${weekly.advice}</td></tr>
  </table>
  <h2>Points forts</h2>
  <table>${strengths.map((s) => `<tr><td>${s.label}</td><td><b style="color:#22C55E">${s.value}</b></td><td>${s.note}</td></tr>`).join("")}</table>
  <h2>Axes d'amélioration</h2>
  <table>${weaknesses.map((w) => `<tr><td>${w.label}</td><td><b style="color:#F59E0B">${w.value}</b></td><td>${w.note}</td></tr>`).join("")}</table>
  <h2>Plan d'entraînement IA</h2>
  <table><tr><th>Jour</th><th>Focus</th><th>Détail</th><th>Intensité</th></tr>
  ${trainingPlan.map((d) => `<tr><td>${d.day}</td><td>${d.icon} ${d.focus}</td><td>${d.detail}</td><td>${d.intensity}%</td></tr>`).join("")}</table>
  <h2>Prévention blessure</h2>
  <p style="font-size:13px">Zone : <b>${injury.zone}</b> · Risque : <span class="pill warn">${injury.risk}% (${injury.level})</span></p>
  <p style="font-size:13px;color:#c2c6d6">${injury.advice}</p>
  <h2>Recommandations</h2>
  <ul>${recommendations.map((r) => `<li>${r}</li>`).join("")}</ul>
  <div class="footer">Généré le ${new Date().toLocaleString("fr-FR")} · ODIN ERP — Module Joueur · ${clubName}</div>
  <script>setTimeout(()=>window.print(),400)</script>
</body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(reportHtml);
      w.document.close();
      w.focus();
    }
  }

  if (loading) {
    return (
      <JoueurPageTransition className="mx-auto flex max-w-5xl items-center justify-center gap-3 py-24">
        <Loader2 size={22} className="animate-spin" style={{ color: "#FF6B57" }} />
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          Génération du rapport IA…
        </span>
      </JoueurPageTransition>
    );
  }

  if (!report || !weekly || !injury) {
    return (
      <JoueurPageTransition className="mx-auto max-w-5xl space-y-4 py-12 text-center">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {loadError ?? "Impossible de charger le rapport IA."}
        </p>
        <Button onClick={() => void loadReport(false, player.name)}>Réessayer</Button>
      </JoueurPageTransition>
    );
  }

  return (
    <JoueurPageTransition className="mx-auto max-w-5xl space-y-6">
      {loadError && (
        <div className="rounded-xl border px-4 py-3 text-xs" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#EF4444" }}>
          API indisponible ({loadError}) — affichage local de secours.
        </div>
      )}
      {aiStatus === "no_key" && !loadError && (
        <div className="rounded-xl border px-4 py-3 text-xs" style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)", color: "#F59E0B" }}>
          Clé OpenAI non configurée — rapport basé sur les données joueur.
        </div>
      )}

      <JoueurKpiCard>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlayerAvatar name={player.name} size={48} ring={false} />
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {t.ai.analysis} — {firstName}
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {t.ai.weeklyReport}
                {report.aiGenerated ? " · Généré par IA" : report.cached ? " · Cache" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadReport(true, player.name)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}
            >
              {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Actualiser
            </button>
            <button
              type="button"
              onClick={exportReport}
              className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}
            >
              <FileDown size={14} />
              {t.ai.downloadPdf}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)" }}>
            <TrendingUp size={18} style={{ color: "#22C55E" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.ai.speedUp}</p>
              <p className="font-bold" style={{ color: "#22C55E" }}>{weekly.speedChange}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)" }}>
            <TrendingDown size={18} style={{ color: "#EF4444" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.ai.enduranceDown}</p>
              <p className="font-bold" style={{ color: "#EF4444" }}>{weekly.enduranceChange}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)" }}>
            <AlertCircle size={18} style={{ color: "#F59E0B" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.ai.fatigueRisk}</p>
              <p className="font-bold" style={{ color: "#F59E0B" }}>{weekly.fatigueRisk}</p>
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-xl border px-4 py-3" style={{ borderColor: "rgba(255,107,87,0.2)", background: "rgba(255,107,87,0.06)" }}>
          <p className="text-xs font-semibold" style={{ color: "#FF6B57" }}>{t.ai.advice}</p>
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>{weekly.advice}</p>
        </div>
      </JoueurKpiCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <JoueurKpiCard delay={0.05}>
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} style={{ color: "#22C55E" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Points forts</h3>
          </div>
          <div className="space-y-3">
            {strengths.map((s, idx) => (
              <motion.div key={s.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + idx * 0.06 }}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{s.label}</span>
                  <span className="text-sm font-bold" style={{ color: "#22C55E" }}>{s.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "#22C55E" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${s.value}%` }}
                    transition={{ duration: 1, delay: 0.15 + idx * 0.06, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>{s.note}</p>
              </motion.div>
            ))}
          </div>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.08}>
          <div className="mb-4 flex items-center gap-2">
            <XCircle size={18} style={{ color: "#F59E0B" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Axes d'amélioration</h3>
          </div>
          <div className="space-y-3">
            {weaknesses.map((w, idx) => (
              <motion.div key={w.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + idx * 0.06 }}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{w.label}</span>
                  <span className="text-sm font-bold" style={{ color: "#F59E0B" }}>{w.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "#F59E0B" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${w.value}%` }}
                    transition={{ duration: 1, delay: 0.15 + idx * 0.06, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>{w.note}</p>
              </motion.div>
            ))}
          </div>
        </JoueurKpiCard>
      </div>

      <JoueurKpiCard delay={0.1}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell size={18} style={{ color: "#FF6B57" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Plan d'entraînement IA — Cette semaine
            </h3>
          </div>
          <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ background: "rgba(255,107,87,0.12)", color: "#FF6B57" }}>
            Personnalisé
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {trainingPlan.map((d, idx) => {
            const isRest = d.intensity <= 30;
            const barColor = d.intensity >= 75 ? "#EF4444" : d.intensity >= 50 ? "#F59E0B" : "#22C55E";
            return (
              <motion.div
                key={d.day}
                className="rounded-2xl border p-3"
                style={{
                  borderColor: "rgba(255,255,255,0.06)",
                  background: isRest ? "rgba(107,114,128,0.08)" : "rgba(255,107,87,0.06)",
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + idx * 0.05 }}
                whileHover={{ y: -4, borderColor: `${barColor}40` }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {d.day}
                </p>
                <div className="my-2 flex items-center gap-1.5">
                  <span className="text-lg">{d.icon}</span>
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{d.focus}</span>
                </div>
                <p className="text-[10px] leading-snug" style={{ color: "var(--text-muted)" }}>{d.detail}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: barColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${d.intensity}%` }}
                    transition={{ duration: 0.9, delay: 0.2 + idx * 0.05 }}
                  />
                </div>
                <p className="mt-1 text-right text-[9px] font-semibold" style={{ color: barColor }}>
                  {d.intensity}%
                </p>
              </motion.div>
            );
          })}
        </div>
      </JoueurKpiCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <JoueurKpiCard delay={0.12}>
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert size={18} style={{ color: "#F59E0B" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Prévention blessure</h3>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border p-4" style={{ borderColor: "rgba(245,158,11,0.25)", background: "rgba(245,158,11,0.06)" }}>
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
              <svg width={64} height={64} className="-rotate-90">
                <circle cx={32} cy={32} r={26} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
                <motion.circle
                  cx={32}
                  cy={32}
                  r={26}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 26}
                  initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - injury.risk / 100) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <span className="absolute text-sm font-black" style={{ color: "#F59E0B" }}>
                {injury.risk}%
              </span>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{injury.zone}</p>
              <p className="text-xs font-semibold" style={{ color: "#F59E0B" }}>Risque {injury.level}</p>
              <p className="mt-1 text-[11px] leading-snug" style={{ color: "var(--text-muted)" }}>{injury.advice}</p>
            </div>
          </div>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.15}>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={18} style={{ color: "#FF6B57" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recommandations IA</h3>
          </div>
          <div className="space-y-2.5">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border p-3"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 + idx * 0.06 }}
              >
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57" }}
                >
                  {idx + 1}
                </div>
                <p className="text-xs leading-snug" style={{ color: "var(--text-primary)" }}>{rec}</p>
              </motion.div>
            ))}
          </div>
        </JoueurKpiCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        <JoueurKpiCard delay={0.08} className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <History size={16} style={{ color: "#FF6B57" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.ai.chatHistory}</h3>
          </div>
          <div className="space-y-4">
            {history.map((item, idx) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => void askQuestion(item.question)}
                className="w-full rounded-xl border p-3 text-left transition-all hover:scale-[1.02] hover:border-[#FF6B57]/40 active:scale-[0.98]"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#FF6B57" }}>
                  {item.period}
                </p>
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
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void askQuestion(q)}
                className="rounded-full border px-3 py-1.5 text-xs transition-all hover:border-[#FF6B57] active:scale-[0.98]"
                style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}
              >
                {q}
              </button>
            ))}
          </div>
          <div
            className="mb-4 max-h-72 space-y-3 overflow-y-auto rounded-[20px] border p-4"
            style={{ borderColor: "rgba(255,255,255,0.08)", minHeight: 240, background: "#070B1A" }}
          >
            {chat.length === 0 && (
              <div className="flex flex-col items-center py-10 text-center">
                <Bot size={28} style={{ color: "#FF6B57", opacity: 0.4 }} />
                <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  Posez une question sur votre performance
                </p>
              </div>
            )}
            {chat.map((msg, i) => (
              <motion.div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {msg.role === "ai" && <Bot size={16} className="mt-1 shrink-0" style={{ color: "#FF6B57" }} />}
                <div
                  className="max-w-[85%] rounded-[16px] px-4 py-2.5 text-sm"
                  style={{
                    background: msg.role === "user" ? "#FF6B57" : "rgba(255,107,87,0.1)",
                    color: msg.role === "user" ? "white" : "var(--text-primary)",
                  }}
                >
                  {msg.role === "ai" && msg.typing ? <TypingText text={msg.text} /> : msg.text}
                </div>
              </motion.div>
            ))}
            {thinking && (
              <div className="flex gap-2">
                <Bot size={16} style={{ color: "#FF6B57" }} />
                <div className="flex gap-1 rounded-[16px] px-4 py-3" style={{ background: "rgba(255,107,87,0.1)" }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full"
                      style={{ background: "#FF6B57" }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && input.trim() && (void askQuestion(input), setInput(""))}
              placeholder={t.ai.askPlaceholder}
              className="glass-input flex-1 rounded-[16px] px-4 py-2.5 text-sm focus:border-[#FF6B57] focus:outline-none"
            />
            <Button
              onClick={() => {
                if (input.trim()) {
                  void askQuestion(input);
                  setInput("");
                }
              }}
              className="active:scale-[0.98]"
            >
              <Send size={16} />
            </Button>
          </div>
        </JoueurKpiCard>
      </div>
    </JoueurPageTransition>
  );
}
