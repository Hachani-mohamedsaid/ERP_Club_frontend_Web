import { useRef, useState, useEffect } from "react";
import { Send, Bot, User, FileDown, AlertTriangle, Clock, Activity, Lightbulb } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { PLAYERS, RISK_PLAYERS, INJURIES, getInitials } from "../../data/medicalMockData";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
}

interface PlayerAnalysis {
  risk: number;
  level: string;
  mainInjury: string;
  grade: string;
  returnDays: number;
  recommendation: string;
}

const PLAYER_ANALYSES: Record<string, PlayerAnalysis> = {
  "1": { risk: 82, level: "HIGH RISK", mainInjury: "Genou droit", grade: "Grade II", returnDays: 21, recommendation: "Réduire charge 30%" },
  "2": { risk: 75, level: "HIGH RISK", mainInjury: "Cheville droite", grade: "Grade I", returnDays: 12, recommendation: "Proprioception renforcée" },
  "3": { risk: 58, level: "MEDIUM RISK", mainInjury: "Cuisse gauche", grade: "Grade I", returnDays: 6, recommendation: "Reprise progressive" },
  "4": { risk: 22, level: "LOW RISK", mainInjury: "Aucune active", grade: "—", returnDays: 0, recommendation: "Maintenir protocole préventif" },
  "5": { risk: 18, level: "LOW RISK", mainInjury: "Aucune active", grade: "—", returnDays: 0, recommendation: "Surveillance charge hebdomadaire" },
  "6": { risk: 42, level: "MEDIUM RISK", mainInjury: "Ischio-jambiers", grade: "Grade I", returnDays: 0, recommendation: "Étirements quotidiens" },
};

const SUGGESTIONS = [
  "Risque de blessure cette semaine?",
  "Joueurs indisponibles pour samedi",
  "Comparer Ahmed et Ali",
];

function AnalysisPanel({ playerId, playerName }: { playerId: string; playerName: string }) {
  const analysis = PLAYER_ANALYSES[playerId];
  const riskPlayer = RISK_PLAYERS.find((r) => r.name === playerName);
  if (!analysis) return null;

  const riskColor = analysis.risk >= 75 ? "var(--color-state-danger)" : analysis.risk >= 50 ? "var(--color-state-warning)" : "var(--color-state-success)";

  return (
    <div className="space-y-4 border-b p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Analyse — {playerName}</p>
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
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{analysis.returnDays > 0 ? `${analysis.returnDays}j` : "—"}</p>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Retour estimé</p>
        </GlassCard>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 rounded-[var(--radius-odin-md)] border px-3 py-2" style={{ borderColor: "var(--surface-panel-border)" }}>
          <Activity size={14} style={{ color: "var(--accent)" }} />
          <div>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Blessure principale</p>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{analysis.mainInjury} — {analysis.grade}</p>
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

      {riskPlayer && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Facteurs de risque</p>
          {riskPlayer.reasons.map((r) => (
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

      <Button className="w-full">
        <FileDown size={16} /> Generate Report
      </Button>
    </div>
  );
}

export function MedicalAIPage() {
  const [selectedPlayer, setSelectedPlayer] = useState(PLAYERS[0].id);
  const counter = useRef(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const player = PLAYERS.find((p) => p.id === selectedPlayer) ?? PLAYERS[0];
  const injury = INJURIES.find((i) => i.playerId === selectedPlayer);

  useEffect(() => {
    const analysis = PLAYER_ANALYSES[selectedPlayer];
    if (!analysis) return;
    setMessages([
      {
        id: "auto",
        type: "ai",
        content: `Analyse complète pour **${player.name}**:\n\n• **Risk:** ${analysis.risk}%\n• **Blessure principale:** ${analysis.mainInjury} (${analysis.grade})\n• **Temps retour estimé:** ${analysis.returnDays > 0 ? `${analysis.returnDays} jours` : "Disponible"}\n• **Recommandation:** ${analysis.recommendation}${injury ? `\n\n📋 Statut actuel: ${injury.status} — ${injury.daysRemaining}j restants` : ""}`,
      },
    ]);
  }, [selectedPlayer, player.name, injury]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const analysis = PLAYER_ANALYSES[selectedPlayer];
    const userMsg: Message = { id: String(counter.current++), type: "user", content: text };
    const aiContent = text.toLowerCase().includes("samedi")
      ? `Joueurs **indisponibles** pour samedi:\n\n🔴 Ahmed Ben Salah — Genou droit (26j)\n\nJoueurs **limités**:\n🟠 Ali Ben Youssef — Cheville (12j)\n🟠 Walid Hammami — Cuisse (6j)`
      : `Basé sur l'analyse de **${player.name}**:\n\n• Risk: **${analysis.risk}%**\n• Blessure: ${analysis.mainInjury}\n• Retour: ${analysis.returnDays}j\n• Action: ${analysis.recommendation}`;
    const aiMsg: Message = { id: String(counter.current++), type: "ai", content: aiContent };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <GlassCard className="p-4 lg:col-span-1">
        <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Joueurs</h3>
        <div className="space-y-1">
          {PLAYERS.map((p) => {
            const active = p.id === selectedPlayer;
            const risk = PLAYER_ANALYSES[p.id]?.risk ?? 0;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlayer(p.id)}
                className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2.5 text-left transition-colors"
                style={{ background: active ? "rgba(var(--accent-rgb), 0.15)" : "transparent", borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent" }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                  {getInitials(p.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.position}</p>
                </div>
                <span className="text-xs font-bold" style={{ color: risk >= 75 ? "var(--color-state-danger)" : risk >= 50 ? "var(--color-state-warning)" : "var(--color-state-success)" }}>
                  {risk}%
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Suggestions</p>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              className="block w-full rounded-[var(--radius-odin-md)] border px-3 py-2 text-left text-xs transition-colors hover:bg-white/5"
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

        <AnalysisPanel playerId={selectedPlayer} playerName={player.name} />

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: msg.type === "ai" ? "var(--accent-soft)" : "var(--surface-panel-border)", color: msg.type === "ai" ? "var(--accent)" : "var(--text-secondary)" }}>
                {msg.type === "ai" ? <Bot size={14} /> : <User size={14} />}
              </div>
              <div className="max-w-[80%] rounded-[var(--radius-odin-md)] px-4 py-3 text-sm whitespace-pre-line" style={{ background: msg.type === "user" ? "var(--accent)" : "rgba(var(--accent-rgb), 0.08)", color: msg.type === "user" ? "white" : "var(--text-primary)" }}>
                {msg.content.split("**").map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-t p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder={`Question sur ${player.name}...`}
            className="glass-input flex-1 py-2.5 px-4 text-sm"
          />
          <Button onClick={() => sendMessage(input)}><Send size={16} /></Button>
        </div>
      </GlassCard>
    </div>
  );
}
