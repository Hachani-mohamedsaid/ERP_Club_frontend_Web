import { motion } from "framer-motion";
import { Crosshair, Brain, Activity } from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { Pitch3DSimulator } from "../../components/analyste/Pitch3DSimulator";
import { DEFAULT_SQUAD, AI_TACTICAL_CENTER } from "../../data/analysteData";
import { TypewriterText } from "../../components/analyste/TypewriterText";

export function AnalysteTactiquePage() {
  return (
    <AnalystePageTransition>
      {/* Header */}
      <motion.div
        className="relative overflow-hidden rounded-[24px] border p-6"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(15,29,58,0.95) 60%, rgba(34,197,94,0.08) 100%)",
          borderColor: "rgba(139,92,246,0.25)",
          boxShadow: "0 0 60px rgba(139,92,246,0.08)",
        }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Background glow orbs */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl" style={{ background: "rgba(139,92,246,0.2)" }} />
        <div className="pointer-events-none absolute -bottom-8 left-8 h-32 w-32 rounded-full blur-2xl" style={{ background: "rgba(34,197,94,0.12)" }} />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.4), rgba(99,102,241,0.2))", border: "1px solid rgba(139,92,246,0.4)" }}
              animate={{ boxShadow: ["0 0 0px rgba(139,92,246,0)", "0 0 30px rgba(139,92,246,0.3)", "0 0 0px rgba(139,92,246,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Crosshair size={26} style={{ color: "#a78bfa" }} />
            </motion.div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#8B5CF6" }}>Intelligence Tactique</p>
              <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>Tactical Simulator 3D</h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>FC Carthage · Formation {AI_TACTICAL_CENTER.formation} · Métriques IA live</p>
            </div>
          </div>

          {/* Live KPIs */}
          <div className="flex gap-3">
            {[
              { icon: Brain, label: "Victoire estimée", value: `${AI_TACTICAL_CENTER.winProbability}%`, color: "#8B5CF6" },
              { icon: Activity, label: "Joueur clé", value: "Ahmed B.", color: "#22C55E" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="rounded-xl border px-3 py-2 text-center" style={{ borderColor: `${color}30`, background: `${color}08` }}>
                <Icon size={12} style={{ color }} className="mx-auto mb-1" />
                <p className="text-[9px] uppercase" style={{ color: "var(--text-muted)" }}>{label}</p>
                <p className="text-base font-black" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-4 rounded-xl border px-4 py-2.5" style={{ borderColor: "rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.06)" }}>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <TypewriterText text="Glissez les joueurs pour repositionner — formation lines & métriques IA recalculées instantanément. Rouge = fatigue critique &gt; 70%." speed={18} />
          </p>
        </div>
      </motion.div>

      {/* 3D Simulator */}
      <Pitch3DSimulator initialPlayers={DEFAULT_SQUAD} />
    </AnalystePageTransition>
  );
}
