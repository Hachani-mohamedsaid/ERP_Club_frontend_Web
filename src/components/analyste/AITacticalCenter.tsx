import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Target, User, AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TypewriterText } from "./TypewriterText";
import { PulseRiskBadge } from "./PulseRiskBadge";
import type { AITacticalCenterData } from "../../data/analysteData";

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 18);
    return () => clearInterval(id);
  }, [target]);
  return <>{val}{suffix}</>;
}

export function AITacticalCenter({ data }: { data: AITacticalCenterData }) {
  const ai = data;
  const navigate = useNavigate();
  const [activeRec, setActiveRec] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActiveRec((p) => (p + 1) % ai.recommendations.length), 5000);
    return () => clearInterval(id);
  }, [ai.recommendations.length]);

  return (
    <motion.div
      className="relative overflow-hidden rounded-[28px] border"
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(7,11,31,0.97) 45%, rgba(99,102,241,0.12) 100%)",
        borderColor: "rgba(139,92,246,0.3)",
        boxShadow: "0 0 80px rgba(139,92,246,0.1), 0 0 120px rgba(99,102,241,0.05), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Animated background orbs */}
      <motion.div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "rgba(139,92,246,0.22)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-3xl"
        style={{ background: "rgba(99,102,241,0.18)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Scanning line animation */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)" }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.5), rgba(99,102,241,0.3))",
                border: "1px solid rgba(139,92,246,0.5)",
              }}
              animate={{ boxShadow: ["0 0 0 rgba(139,92,246,0)", "0 0 30px rgba(139,92,246,0.4)", "0 0 0 rgba(139,92,246,0)"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Brain size={26} style={{ color: "#c4b5fd" }} />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "#8B5CF6" }}>AI Tactical Center</p>
                <motion.span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                  style={{ background: "rgba(34,197,94,0.2)", color: "#22C55E" }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  LIVE
                </motion.span>
              </div>
              <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>Recommandation IA</h2>
            </div>
          </div>
          <PulseRiskBadge label={ai.risk} severity="high" />
        </div>

        {/* Stats grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: Target, label: "Formation idéale", value: ai.formation, isText: true, color: "#a78bfa" },
            { icon: Brain, label: "Probabilité victoire", value: ai.winProbability, suffix: "%", isText: false, color: "#8B5CF6" },
            { icon: AlertTriangle, label: "Point faible", value: ai.weakPoint, isText: true, color: "#F59E0B" },
            { icon: User, label: "Joueur clé", value: ai.keyPlayer, isText: true, color: "#22C55E" },
          ].map(({ icon: Icon, label, value, suffix, isText, color }, i) => (
            <motion.div
              key={label}
              className="group relative overflow-hidden rounded-2xl border p-4"
              style={{ borderColor: `${color}20`, background: `${color}06` }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, ease: "easeOut" }}
              whileHover={{ scale: 1.04, borderColor: `${color}40` }}
            >
              <motion.div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle at 50% 0%, ${color}12, transparent 70%)` }}
                transition={{ duration: 0.3 }}
              />
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
                <Icon size={14} style={{ color }} />
              </div>
              <p className="mt-3 text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className="mt-1 text-xl font-black" style={{ color }}>
                {isText ? value : <AnimatedNumber target={value as number} suffix={suffix} />}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Typewriter AI recommendation */}
        <div
          className="mt-5 rounded-2xl border p-4"
          style={{ borderColor: "rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.06)" }}
        >
          <div className="mb-2 flex items-center gap-2">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#8B5CF6" }}
            />
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#8B5CF6" }}>Analyse IA</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={activeRec}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              <TypewriterText text={ai.recommendations[activeRec]} speed={20} key={activeRec} />
            </motion.p>
          </AnimatePresence>
          <div className="mt-3 flex gap-1">
            {ai.recommendations.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveRec(i)}
                className="h-1 rounded-full transition-all"
                style={{
                  background: i === activeRec ? "#8B5CF6" : "rgba(139,92,246,0.2)",
                  width: i === activeRec ? "24px" : "8px",
                }}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.button
          type="button"
          onClick={() => navigate("/analyste/tactique")}
          className="mt-4 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/[0.04]"
          style={{ borderColor: "rgba(139,92,246,0.3)", color: "#a78bfa" }}
          whileHover={{ x: 4 }}
        >
          Ouvrir Tactical Simulator 3D <ChevronRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}
