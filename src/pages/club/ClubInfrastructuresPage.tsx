import { motion } from "framer-motion";
import { Building2, Dumbbell, Bus, Stethoscope, Calendar } from "lucide-react";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { CountUpStat } from "../../components/player/CountUpStat";
import { INFRASTRUCTURES, INFRA_KPIS, MAINTENANCE_CALENDAR } from "../../data/clubAdminData";

const STATUS_STYLE = {
  Excellent: { color: "#22C55E", glow: "0 0 20px rgba(34,197,94,0.3)" },
  Bon: { color: "#6366F1", glow: "none" },
  Maintenance: { color: "#F59E0B", glow: "none" },
};

const KPI_ICONS = { field: Building2, room: Dumbbell, bus: Bus, medical: Stethoscope };

export function ClubInfrastructuresPage() {
  return (
    <ClubPageTransition>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {INFRA_KPIS.map((kpi, i) => {
          const Icon = KPI_ICONS[kpi.icon];
          return (
            <ClubKpiCard key={kpi.label} delay={i * 0.05}>
              <div className="flex items-center gap-2">
                <Icon size={16} style={{ color: "#FF6B57" }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{kpi.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                <CountUpStat end={kpi.value} />
              </p>
            </ClubKpiCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {INFRASTRUCTURES.map((infra, i) => {
            const style = STATUS_STYLE[infra.status];
            return (
              <ClubKpiCard key={infra.id} delay={i * 0.05}>
                <div
                  className="rounded-[16px] border p-5 transition-shadow duration-200"
                  style={{ borderColor: `${style.color}30`, boxShadow: style.glow }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{infra.name}</h3>
                      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Capacité : {infra.capacity}</p>
                    </div>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${style.color}20`, color: style.color }}>
                      {infra.status}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                      <span>Occupation Rate</span>
                      <span className="font-bold" style={{ color: style.color }}>{infra.occupationRate}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: style.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${infra.occupationRate}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    Prochaine maintenance : {infra.nextMaintenance}
                  </p>
                </div>
              </ClubKpiCard>
            );
          })}
        </div>

        <ClubKpiCard delay={0.15} hover={false}>
          <div className="mb-4 flex items-center gap-2">
            <Calendar size={16} style={{ color: "#FF6B57" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Maintenance Calendar</h3>
          </div>
          <div className="space-y-3">
            {MAINTENANCE_CALENDAR.map((item, i) => (
              <motion.div
                key={item.facility + item.date}
                className="rounded-xl border px-4 py-3"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.facility}</p>
                  <span className="text-xs font-medium" style={{ color: "#F59E0B" }}>{item.date}</span>
                </div>
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{item.type}</p>
              </motion.div>
            ))}
          </div>
        </ClubKpiCard>
      </div>
    </ClubPageTransition>
  );
}
