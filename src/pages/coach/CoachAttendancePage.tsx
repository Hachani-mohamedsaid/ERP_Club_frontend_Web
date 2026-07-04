import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Shield, Save } from "lucide-react";
import { CoachPageTransition, CCard, COACH_ACCENT } from "../../components/coach2/CoachPageTransition";
import { SQUAD, TRAINING_SESSIONS } from "../../data/coachData";

type AttStatus = "Présent" | "Absent" | "Retard" | "Blessé" | "En sélection";

const STATUS_CYCLE: AttStatus[] = ["Présent", "Absent", "Retard", "Blessé", "En sélection"];
const STATUS_META: Record<AttStatus, { color: string; bg: string; icon: React.ElementType; emoji: string }> = {
  "Présent":       { color: "#22C55E", bg: "rgba(34,197,94,0.14)",  icon: CheckCircle2, emoji: "✅" },
  "Absent":        { color: "#EF4444", bg: "rgba(239,68,68,0.14)",  icon: XCircle,      emoji: "❌" },
  "Retard":        { color: "#F59E0B", bg: "rgba(245,158,11,0.14)", icon: Clock,        emoji: "⏰" },
  "Blessé":        { color: "#8B5CF6", bg: "rgba(139,92,246,0.14)", icon: Shield,       emoji: "🩺" },
  "En sélection":  { color: "#3B82F6", bg: "rgba(59,130,246,0.14)", icon: Shield,       emoji: "🌍" },
};

const SESSIONS_DONE = TRAINING_SESSIONS.filter(s => s.done);

type AttRecord = Record<string, AttStatus>;

function buildDefault(): AttRecord {
  const rec: AttRecord = {};
  SQUAD.forEach(p => {
    rec[p.id] = p.status === "Blessé" ? "Blessé" : p.status === "Suspendu" ? "Absent" : p.status === "En sélection" ? "En sélection" : "Présent";
  });
  return rec;
}

export function CoachAttendancePage() {
  const [sessionId, setSessionId] = useState<string>("today");
  const [att, setAtt] = useState<AttRecord>(buildDefault);
  const [saved, setSaved] = useState(false);

  const cycle = (id: string) => {
    setAtt(prev => {
      const cur = prev[id] ?? "Présent";
      const nextIdx = (STATUS_CYCLE.indexOf(cur) + 1) % STATUS_CYCLE.length;
      return { ...prev, [id]: STATUS_CYCLE[nextIdx] };
    });
  };

  const counts = STATUS_CYCLE.reduce((acc, s) => {
    acc[s] = Object.values(att).filter(v => v === s).length;
    return acc;
  }, {} as Record<AttStatus, number>);

  const presenceRate = Math.round((counts["Présent"] / SQUAD.length) * 100);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <CoachPageTransition>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Présence Joueurs</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Gestion des présences aux séances</p>
        </div>
        <motion.button type="button" onClick={save}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white"
          style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)`, boxShadow: `0 0 14px ${COACH_ACCENT}40` }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Save size={13} /> {saved ? "Sauvegardé ✓" : "Sauvegarder"}
        </motion.button>
      </div>

      {/* Session selector */}
      <CCard>
        <p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Séance</p>
        <div className="flex flex-wrap gap-2">
          <motion.button type="button" onClick={() => setSessionId("today")}
            className="rounded-xl px-3 py-2 text-xs font-semibold"
            style={{
              background: sessionId === "today" ? `linear-gradient(135deg,${COACH_ACCENT},#E66000)` : "rgba(255,255,255,0.06)",
              color: sessionId === "today" ? "white" : "var(--text-muted)",
            }}
            whileHover={{ scale: 1.04 }}>
            📅 Séance du jour
          </motion.button>
          {SESSIONS_DONE.map(s => (
            <motion.button key={s.id} type="button" onClick={() => setSessionId(s.id)}
              className="rounded-xl px-3 py-2 text-xs font-semibold"
              style={{
                background: sessionId === s.id ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.06)",
                color: sessionId === s.id ? "#A855F7" : "var(--text-muted)",
              }}
              whileHover={{ scale: 1.04 }}>
              {s.type} · {s.date}
            </motion.button>
          ))}
        </div>
      </CCard>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {STATUS_CYCLE.map((s, i) => {
          const m = STATUS_META[s];
          return (
            <motion.div key={s} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <CCard>
                <p className="text-xl font-extrabold" style={{ color: m.color }}>{counts[s]}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{s}</p>
              </CCard>
            </motion.div>
          );
        })}
      </div>

      {/* Presence rate */}
      <CCard glow>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Taux de présence</p>
          <p className="text-2xl font-extrabold" style={{ color: presenceRate >= 80 ? "#22C55E" : presenceRate >= 60 ? COACH_ACCENT : "#EF4444" }}>
            {presenceRate}%
          </p>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div className="h-3 rounded-full"
            style={{ background: presenceRate >= 80 ? "#22C55E" : COACH_ACCENT }}
            initial={{ width: 0 }} animate={{ width: `${presenceRate}%` }} transition={{ duration: 1, ease: "easeOut" }} />
        </div>
        <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>{counts["Présent"]} / {SQUAD.length} joueurs présents</p>
      </CCard>

      {/* Player list */}
      <CCard>
        <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Cliquer sur le statut pour le changer
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {SQUAD.map((p, i) => {
              const status = att[p.id] ?? "Présent";
              const m = STATUS_META[status];
              const Icon = m.icon;
              return (
                <motion.div key={p.id} layout
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                  style={{ background: m.bg, borderColor: `${m.color}30` }}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold"
                    style={{ background: `${COACH_ACCENT}18`, color: COACH_ACCENT }}>
                    {p.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{p.position}</p>
                  </div>
                  <motion.button type="button" onClick={() => cycle(p.id)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold shrink-0"
                    style={{ background: m.bg, color: m.color, border: `1px solid ${m.color}40` }}
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                    <Icon size={10} /> {status}
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CCard>

      {/* Session history */}
      {SESSIONS_DONE.length > 0 && (
        <CCard>
          <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Historique présence</p>
          <div className="space-y-2">
            {SESSIONS_DONE.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-xl border px-4 py-3"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--surface-panel-border)" }}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                  style={{ background: `${COACH_ACCENT}18`, color: COACH_ACCENT }}>{s.type[0]}</div>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{s.type} — {s.date}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{s.objective}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold" style={{ color: (s.attendance ?? 0) >= 80 ? "#22C55E" : COACH_ACCENT }}>{s.attendance}%</p>
                  <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>présence</p>
                </div>
                {s.bestPlayer && (
                  <div className="text-right">
                    <p className="text-[10px]" style={{ color: "#F59E0B" }}>⭐ {s.bestPlayer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CCard>
      )}
    </CoachPageTransition>
  );
}
