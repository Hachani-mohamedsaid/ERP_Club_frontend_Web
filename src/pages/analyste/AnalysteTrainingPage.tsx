import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles } from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalysteKpiCard } from "../../components/analyste/AnalysteKpiCard";
import { DEFAULT_TRAINING_PLAN, type TrainingPlanDay } from "../../data/analysteData";

const TYPE_COLORS: Record<TrainingPlanDay["type"], string> = {
  cardio: "#3B82F6", repos: "#22C55E", explosivite: "#EF4444", force: "#F59E0B", tactique: "#8B5CF6",
};

const SESSION_PALETTE: TrainingPlanDay[] = [
  { day: "—", session: "Cardio", intensity: "Moyenne", type: "cardio" },
  { day: "—", session: "Repos", intensity: "Basse", type: "repos" },
  { day: "—", session: "Explosivité", intensity: "Haute", type: "explosivite" },
  { day: "—", session: "Force", intensity: "Moyenne", type: "force" },
  { day: "—", session: "Tactique", intensity: "Moyenne", type: "tactique" },
];

const WEEK_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

export function AnalysteTrainingPage() {
  const [plan, setPlan] = useState<TrainingPlanDay[]>(DEFAULT_TRAINING_PLAN);
  const [dragOver, setDragOver] = useState<number | null>(null);

  function handleDrop(e: React.DragEvent, dayIndex: number) {
    e.preventDefault();
    setDragOver(null);
    try {
      const session = JSON.parse(e.dataTransfer.getData("application/json")) as TrainingPlanDay;
      setPlan((prev) => prev.map((d, i) => (i === dayIndex ? { ...d, session: session.session, intensity: session.intensity, type: session.type } : d)));
    } catch { /* ignore */ }
  }

  return (
    <AnalystePageTransition>
      <div className="flex items-center gap-3">
        <Calendar size={24} style={{ color: "#6366F1" }} />
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Training Optimizer</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>IA · Fatigue · Position · Blessures · Matchs → Programme optimal</p>
        </div>
      </div>

      <AnalysteKpiCard glow delay={0.05}>
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: "#8B5CF6" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Programme généré pour Ahmed Ben Salah — fatigue 85%, hamstring en surveillance, match samedi.
          </p>
        </div>
      </AnalysteKpiCard>

      <div className="mb-4 flex flex-wrap gap-2">
        {SESSION_PALETTE.map((s) => (
          <motion.div
            key={s.session}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("application/json", JSON.stringify(s))}
            whileHover={{ scale: 1.05 }}
            whileDrag={{ scale: 1.08, opacity: 0.8 }}
            className="cursor-grab rounded-xl border px-4 py-2 text-xs font-semibold active:cursor-grabbing"
            style={{ borderColor: `${TYPE_COLORS[s.type]}40`, background: `${TYPE_COLORS[s.type]}15`, color: TYPE_COLORS[s.type] }}
          >
            {s.session}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
        {plan.map((day, i) => {
          const color = TYPE_COLORS[day.type];
          return (
            <motion.div
              key={day.day}
              onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, i)}
              layout
              className="min-h-[120px] rounded-[20px] border p-4 transition-all"
              style={{
                borderColor: dragOver === i ? `${color}60` : "rgba(255,255,255,0.05)",
                background: dragOver === i ? `${color}10` : "rgba(15,29,58,0.8)",
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{WEEK_DAYS[i]}</p>
              <motion.p layout className="mt-2 text-sm font-bold" style={{ color }}>{day.session}</motion.p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{day.intensity}</p>
            </motion.div>
          );
        })}
      </div>
    </AnalystePageTransition>
  );
}
