import { motion } from "framer-motion";
import { Sparkles, RefreshCw, TrendingDown, ArrowRightLeft } from "lucide-react";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { CLUB_CONTRACTS, CONTRACT_TIMELINE, AI_CONTRACT_RECOMMENDATIONS } from "../../data/clubAdminData";

function getAlertLevel(daysLeft: number) {
  if (daysLeft <= 30) return { color: "#EF4444", label: "Expire < 30 jours" };
  if (daysLeft <= 90) return { color: "#F59E0B", label: "Expire < 90 jours" };
  return { color: "#22C55E", label: "Actif" };
}

const ACTION_ICONS = { renew: RefreshCw, sell: TrendingDown, loan: ArrowRightLeft };

export function ClubContratsPage() {
  return (
    <ClubPageTransition>
      {/* Timeline */}
      <ClubKpiCard delay={0.05}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Timeline expiration</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CONTRACT_TIMELINE.map((bucket, i) => (
            <motion.div
              key={bucket.label}
              className="rounded-xl border p-4"
              style={{ borderColor: `${bucket.color}30`, background: `${bucket.color}08` }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium" style={{ color: bucket.color }}>{bucket.label}</p>
                <span className="text-2xl font-bold" style={{ color: bucket.color }}>{bucket.count}</span>
              </div>
              <div className="mt-2 space-y-1">
                {bucket.players.map((p) => (
                  <p key={p} className="text-xs" style={{ color: "var(--text-secondary)" }}>{p}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </ClubKpiCard>

      {/* AI Recommendations */}
      <ClubKpiCard delay={0.1}>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={16} style={{ color: "#FF6B57" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recommandations IA</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {AI_CONTRACT_RECOMMENDATIONS.map((rec) => {
            const Icon = ACTION_ICONS[rec.icon];
            return (
              <div key={rec.player} className="rounded-xl border p-4" style={{ borderColor: `${rec.color}30` }}>
                <div className="flex items-center gap-2">
                  <Icon size={16} style={{ color: rec.color }} />
                  <span className="text-sm font-bold" style={{ color: rec.color }}>{rec.action}</span>
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{rec.player}</span>
                </div>
                <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>{rec.reason}</p>
                <button type="button" className="mt-3 rounded-lg px-3 py-1.5 text-xs font-medium" style={{ background: `${rec.color}20`, color: rec.color }}>
                  Appliquer
                </button>
              </div>
            );
          })}
        </div>
      </ClubKpiCard>

      {/* Table */}
      <ClubKpiCard hover={false} className="overflow-hidden p-0" delay={0.15}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["Nom", "Début", "Fin", "Salaire", "Bonus", "Clause", "Consommé", "Alerte"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLUB_CONTRACTS.map((c, i) => {
                const alert = getAlertLevel(c.daysLeft);
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                    className="hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{c.name}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{c.start}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{c.end}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{c.salary}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{c.bonus}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{c.clause}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: alert.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${c.consumed}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                          />
                        </div>
                        <span className="text-xs font-medium" style={{ color: alert.color }}>{c.consumed}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: `${alert.color}20`, color: alert.color }}>
                        {alert.label}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ClubKpiCard>
    </ClubPageTransition>
  );
}
