import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain, Crosshair, Film, Shield, Activity, TrendingUp, DollarSign,
  Search, Sparkles, Calendar, BarChart3, ArrowUpRight,
  Star, GitCompare, UserPlus, Radio, Zap, Camera, Watch,
} from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AITacticalCenter } from "../../components/analyste/AITacticalCenter";
import { TypewriterText } from "../../components/analyste/TypewriterText";
import { AnalystePageLoader } from "../../components/analyste/AnalystePageLoader";
import { useAnalysteDashboard } from "../../hooks/useAnalysteResource";

const MODULES = [
  { label: "Match Prediction", desc: "RF · XGBoost · CatBoost", icon: Brain,     path: "/analyste/prediction",      color: "#8B5CF6", gradient: "from-violet-500/20 to-purple-900/5" },
  { label: "Player PPI",       desc: "FIFA-like Score IA",       icon: Star,      path: "/analyste/ppi",             color: "#F59E0B", gradient: "from-yellow-500/20 to-amber-900/5" },
  { label: "Team Chemistry",   desc: "Graphe relationnel",        icon: GitCompare,path: "/analyste/chemistry",       color: "#22C55E", gradient: "from-green-500/20 to-emerald-900/5" },
  { label: "Live Match",       desc: "Temps réel · Win prob.",   icon: Radio,     path: "/analyste/live-match",      color: "#EF4444", gradient: "from-red-500/20 to-rose-900/5" },
  { label: "Video Analysis Pro", desc: "Upload · Vitesse · IA Vision", icon: Camera, path: "/analyste/video-analysis", color: "#6366F1", gradient: "from-indigo-500/20 to-blue-900/5" },
  { label: "Fatigue Heatmap",  desc: "Par 15 minutes",            icon: Activity,  path: "/analyste/fatigue-heatmap", color: "#FF7A00", gradient: "from-orange-500/20 to-red-900/5" },
  { label: "Viiv Smartwatch",  desc: "Recovery · Énergie · HRV · GPS",   icon: Watch,     path: "/analyste/viiv",           color: "#22d3ee", gradient: "from-cyan-500/20 to-slate-900/5" },
  { label: "Transfer Engine",  desc: "Compatibilité IA",          icon: UserPlus,  path: "/analyste/transfer",        color: "#3B82F6", gradient: "from-blue-500/20 to-sky-900/5" },
  { label: "Injury Forecast",  desc: "Retour estimé ML",          icon: TrendingUp,path: "/analyste/injury-forecast", color: "#EF4444", gradient: "from-red-500/20 to-rose-900/5" },
  { label: "Tactical Sim.",    desc: "Terrain 3D live",           icon: Crosshair, path: "/analyste/tactique",        color: "#8B5CF6", gradient: "from-violet-500/20 to-purple-900/5" },
  { label: "Opponent Intel",   desc: "Plan de match",             icon: Shield,    path: "/analyste/adversaire",      color: "#FF6B57", gradient: "from-orange-500/20 to-red-900/5" },
  { label: "Patterns",         desc: "Deep Learning",             icon: Sparkles,  path: "/analyste/patterns",        color: "#A855F7", gradient: "from-purple-500/20 to-violet-900/5" },
  { label: "Scouting AI",      desc: "Similarité 89%",            icon: Search,    path: "/analyste/scouting",        color: "#3B82F6", gradient: "from-blue-500/20 to-sky-900/5" },
  { label: "Market Value",     desc: "Projection IA",             icon: DollarSign,path: "/analyste/valeur",          color: "#F59E0B", gradient: "from-yellow-500/20 to-amber-900/5" },
  { label: "Evolution Lab",    desc: "Forecast DL",               icon: TrendingUp,path: "/analyste/evolution",       color: "#22C55E", gradient: "from-green-500/20 to-emerald-900/5" },
  { label: "Training AI",      desc: "Optimiseur",                icon: Calendar,  path: "/analyste/training",        color: "#6366F1", gradient: "from-indigo-500/20 to-blue-900/5" },
  { label: "Executive",        desc: "KPIs direction",            icon: BarChart3, path: "/analyste/executive",       color: "#22C55E", gradient: "from-green-500/20 to-teal-900/5" },
  { label: "Injury Lab",       desc: "Prédiction ML",             icon: Zap,       path: "/analyste/blessures",       color: "#EF4444", gradient: "from-red-500/20 to-rose-900/5" },
];

export function AnalysteDashboard() {
  const navigate = useNavigate();
  const { data, loading } = useAnalysteDashboard();

  if (loading && !data) return <AnalystePageLoader />;

  const info = data!.info;
  const patterns = data!.patterns;
  const liveStats = data!.liveStats;

  return (
    <AnalystePageTransition>
      {/* Hero header */}
      <motion.div
        className="relative overflow-hidden rounded-[28px] border p-6 lg:p-8"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(7,11,31,0.95) 50%, rgba(34,197,94,0.06) 100%)",
          borderColor: "rgba(139,92,246,0.2)",
          boxShadow: "0 0 80px rgba(139,92,246,0.06)",
        }}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Orb decorations */}
        <motion.div
          className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full blur-3xl"
          style={{ background: "rgba(139,92,246,0.18)" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full blur-2xl" style={{ background: "rgba(34,197,94,0.1)" }} />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.5), rgba(99,102,241,0.25))",
                border: "1px solid rgba(139,92,246,0.4)",
              }}
              animate={{ boxShadow: ["0 0 0px rgba(139,92,246,0)", "0 0 40px rgba(139,92,246,0.35)", "0 0 0px rgba(139,92,246,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Brain size={32} style={{ color: "#c4b5fd" }} />
            </motion.div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#8B5CF6" }}>
                Performance Intelligence Center
              </p>
              <h1 className="mt-0.5 text-3xl font-black" style={{ color: "var(--text-primary)" }}>
                Bonjour, {info.name}
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                {info.club} · Saison {info.season} · 11 modules IA actifs
              </p>
            </div>
          </div>

          {/* Live stat pills */}
          <div className="flex flex-wrap gap-2">
            {liveStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="rounded-xl border px-3 py-2 text-center"
                style={{ borderColor: `${s.color}25`, background: `${s.color}08` }}
              >
                <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                <p className="text-base font-black" style={{ color: s.color }}>{s.value}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pattern preview */}
        <div className="relative mt-5 rounded-xl border px-4 py-2.5" style={{ borderColor: "rgba(139,92,246,0.15)", background: "rgba(139,92,246,0.05)" }}>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            <TypewriterText
              text={`Analyse en cours — ${patterns[0].pattern} (confiance ${patterns[0].confidence}%)`}
              speed={20}
            />
          </p>
        </div>
      </motion.div>

      {/* AI Tactical Center */}
      <AITacticalCenter data={data!.tacticalCenter} />

      {/* Modules grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
            Modules Intelligence
          </h2>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{MODULES.length} modules</p>
        </div>
        <motion.div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
        >
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.button
                key={mod.path}
                type="button"
                onClick={() => navigate(mod.path)}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                whileHover={{ y: -5, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group relative overflow-hidden rounded-[20px] border p-4 text-left"
                style={{
                  background: "rgba(15,29,58,0.85)",
                  borderColor: "var(--surface-panel-border)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
              >
                {/* Hover gradient */}
                <motion.div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle at 20% 20%, ${mod.color}15, transparent 70%)` }}
                  transition={{ duration: 0.3 }}
                />
                {/* Top border glow on hover */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${mod.color}80, transparent)` }}
                />

                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${mod.color}18`, border: `1px solid ${mod.color}30` }}
                >
                  <Icon size={20} style={{ color: mod.color }} />
                </div>
                <p className="mt-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>{mod.label}</p>
                <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>{mod.desc}</p>

                {/* Arrow */}
                <ArrowUpRight
                  size={14}
                  className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: mod.color }}
                />
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Pattern Detection preview */}
      <motion.div
        className="rounded-[20px] border p-5"
        style={{ background: "rgba(15,29,58,0.85)", borderColor: "var(--surface-panel-border)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: "#8B5CF6" }} />
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Pattern Detection — Aperçu</h3>
          </div>
          <button
            type="button"
            onClick={() => navigate("/analyste/patterns")}
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: "#8B5CF6" }}
          >
            Voir tout <ArrowUpRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {patterns.slice(0, 3).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 + i * 0.1 }}
              className="flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-white/[0.02] transition-colors"
              style={{ borderColor: "rgba(139,92,246,0.15)", background: "rgba(139,92,246,0.04)" }}
            >
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full" style={{
                  background: p.category === "injury" ? "#EF4444" : p.category === "tactical" ? "#6366F1" : "#8B5CF6",
                }} />
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{p.pattern}</p>
              </div>
              <span className="shrink-0 text-xs font-black" style={{ color: "#8B5CF6" }}>{p.confidence}%</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnalystePageTransition>
  );
}
