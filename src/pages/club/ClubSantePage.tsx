import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Sparkles } from "lucide-react";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubHeatInjuryMap } from "../../components/club/ClubHeatInjuryMap";
import { CountUpStat } from "../../components/player/CountUpStat";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { HEALTH_KPIS, INJURIES_BY_MONTH, INJURIES_BY_POSITION, INJURED_PLAYERS } from "../../data/clubAdminData";

export function ClubSantePage() {
  return (
    <ClubPageTransition>
      <div className="grid grid-cols-3 gap-4">
        {HEALTH_KPIS.map((kpi, i) => (
          <ClubKpiCard key={kpi.label} delay={i * 0.05}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
            <p className="mt-2 text-2xl font-bold" style={{ color: kpi.color }}>
              <CountUpStat end={kpi.value} suffix={kpi.suffix ?? ""} />
            </p>
          </ClubKpiCard>
        ))}
      </div>

      <ClubKpiCard delay={0.08} hover={false}>
        <ClubHeatInjuryMap />
      </ClubKpiCard>

      <ClubKpiCard delay={0.1} hover={false}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Liste Blessés</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["Joueur", "Blessure", "Retour prévu", "Risk IA"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INJURED_PLAYERS.map((p, i) => (
                <motion.tr
                  key={p.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  className="hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={p.name} size={32} />
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#EF4444" }}>{p.injury}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{p.returnDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={12} style={{ color: "#F59E0B" }} />
                      <div className="h-2 w-16 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: p.riskIA > 70 ? "#EF4444" : "#F59E0B" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${p.riskIA}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        />
                      </div>
                      <span className="text-xs font-bold" style={{ color: p.riskIA > 70 ? "#EF4444" : "#F59E0B" }}>{p.riskIA}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </ClubKpiCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ClubKpiCard delay={0.15}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Blessures par mois</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={INJURIES_BY_MONTH}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <Bar dataKey="count" fill="#FF6B57" radius={[6, 6, 0, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </ClubKpiCard>

        <ClubKpiCard delay={0.2}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Blessures par poste</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={INJURIES_BY_POSITION} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis dataKey="position" type="category" tick={{ fill: "var(--text-muted)", fontSize: 11 }} width={70} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <Bar dataKey="count" fill="#EF4444" radius={[0, 6, 6, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </ClubKpiCard>
      </div>
    </ClubPageTransition>
  );
}
