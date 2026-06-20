import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, UserPlus, RefreshCw, Tag } from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalysteKpiCard } from "../../components/analyste/AnalysteKpiCard";
import { EXECUTIVE_KPIS, EXECUTIVE_AI_RECO } from "../../data/analysteData";

const RECO_CONFIG = {
  sell: { icon: Tag, color: "#F59E0B", label: "Joueur à vendre" },
  renew: { icon: RefreshCw, color: "#22C55E", label: "Joueur à renouveler" },
  recruit: { icon: UserPlus, color: "#8B5CF6", label: "Joueur à recruter" },
};

export function AnalysteExecutivePage() {
  return (
    <AnalystePageTransition>
      <div className="flex items-center gap-3">
        <BarChart3 size={24} style={{ color: "#22C55E" }} />
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Executive Dashboard</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>KPIs direction · ROI · Recommandations IA stratégiques</p>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-2 gap-4 lg:grid-cols-5"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
      >
        {EXECUTIVE_KPIS.map((kpi) => (
          <motion.div key={kpi.label} variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}>
            <AnalysteKpiCard>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
              <p className="mt-2 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{kpi.value}</p>
              <div className="mt-1 flex items-center gap-1 text-xs font-medium" style={{ color: kpi.positive ? "#22C55E" : "#EF4444" }}>
                {kpi.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {kpi.change}
              </div>
            </AnalysteKpiCard>
          </motion.div>
        ))}
      </motion.div>

      <AnalysteKpiCard glow delay={0.2}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recommandations IA — Direction</h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {EXECUTIVE_AI_RECO.map((reco, i) => {
            const cfg = RECO_CONFIG[reco.type];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={reco.player}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.1 }}
                className="rounded-xl border p-4"
                style={{ borderColor: `${cfg.color}30`, background: `${cfg.color}08` }}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} style={{ color: cfg.color }} />
                  <span className="text-[10px] font-bold uppercase" style={{ color: cfg.color }}>{cfg.label}</span>
                </div>
                <p className="mt-2 text-lg font-bold" style={{ color: "var(--text-primary)" }}>{reco.player}</p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{reco.reason}</p>
              </motion.div>
            );
          })}
        </div>
      </AnalysteKpiCard>
    </AnalystePageTransition>
  );
}
