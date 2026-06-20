import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, AreaChart, Area,
} from "recharts";
import { GlassCard } from "../../components/ui/GlassCard";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { CountUpStat } from "../../components/player/CountUpStat";
import { BodyInjuryViewer } from "../../components/medical/BodyInjuryViewer";
import { AIRiskPrediction } from "../../components/medical/AIRiskPrediction";
import { MedicalTimeline } from "../../components/medical/MedicalTimeline";
import type { SquadPlayer } from "../../data/joueurMockData";

export function PerformanceTab({ player }: { player: SquadPlayer }) {
  const stats = [
    { label: "Goals", value: player.stats.goals },
    { label: "Assists", value: player.stats.assists },
    { label: "Minutes", value: player.stats.minutes },
    { label: "Pass Accuracy", value: player.stats.passAccuracy, suffix: "%" },
    { label: "Distance", value: player.stats.distance, suffix: " km" },
  ];

  const radarData = Object.entries(player.radar).map(([key, value]) => ({
    stat: key.charAt(0).toUpperCase() + key.slice(1),
    value,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, suffix }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                <CountUpStat end={value} suffix={suffix ?? ""} />
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard raised className="p-5">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Performance — 12 mois</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={player.performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis domain={[60, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)" }} animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard raised className="p-5">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Radar FIFA</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--surface-panel-border)" />
              <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.25} animationDuration={1200} />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}

export function MedicalTab({ player }: { player: SquadPlayer }) {
  const timelineEvents = player.injuries.map((inj, i) => ({
    id: String(i),
    date: inj.year,
    title: inj.injury,
    description: inj.status,
    type: inj.status === "En cours" || inj.status === "En rééducation" ? ("warning" as const) : ("success" as const),
  }));

  return (
    <div className="space-y-6">
      <MedicalTimeline title="Injury History" events={timelineEvents} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard raised className="p-5">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Body Injury Viewer</h3>
          <BodyInjuryViewer
            zones={[
              { id: "knee-right", name: "Genou droit", severity: player.riskScore > 70 ? "critical" as const : "medium" as const,
                injuryInfo: player.riskScore > 50 ? { player: player.name, grade: "Grade II", risk: player.riskScore, daysRemaining: 26 } : undefined },
              { id: "knee-left", name: "Genou gauche", severity: "none" as const },
              { id: "ankle-right", name: "Cheville", severity: "low" as const },
            ]}
          />
        </GlassCard>
        <GlassCard raised className="p-5">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Risk Score</h3>
          <AIRiskPrediction overallRisk={player.riskScore} risksByZone={[
            { zone: "Genou", risk: player.riskScore, severity: player.riskScore > 70 ? "critical" : "medium" },
          ]} />
        </GlassCard>
      </div>
    </div>
  );
}

export function ContractTab({ player }: { player: SquadPlayer }) {
  const { contract } = player;
  const progress = ((2026 - contract.startYear) / (contract.endYear - contract.startYear)) * 100;
  const isExpiringSoon = contract.daysRemaining <= 90;

  return (
    <div className="space-y-6">
      <GlassCard raised className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Salaire", value: contract.salary },
            { label: "Bonus", value: contract.bonus },
            { label: "Clause", value: contract.clause },
            { label: "Expiration", value: contract.expiration },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Contract Timeline</h3>
        <div className="flex items-center justify-between text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {Array.from({ length: contract.endYear - contract.startYear + 1 }, (_, i) => contract.startYear + i).map((year) => (
            <span key={year}>{year}</span>
          ))}
        </div>
        <div className="relative mt-3 h-2 overflow-hidden rounded-full" style={{ background: "var(--surface-panel-border)" }}>
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: "var(--accent)" }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
      </GlassCard>

      {isExpiringSoon && (
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="rounded-[var(--radius-odin-md)] border px-4 py-3"
          style={{ borderColor: "var(--color-state-warning)", background: "rgba(217,154,31,0.1)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--color-state-warning)" }}>
            ⚠️ {contract.daysRemaining} jours restants avant expiration
          </p>
        </motion.div>
      )}
    </div>
  );
}

export function MarketTab({ player }: { player: SquadPlayer }) {
  return (
    <div className="space-y-6">
      <GlassCard raised className="p-8 text-center">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Valeur marchande actuelle</p>
        <p className="mt-2 text-5xl font-bold" style={{ color: "var(--color-state-success)" }}>
          <CountUpStat end={player.marketValueNum} decimals={1} suffix=" M€" />
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>Transfermarkt Style</p>
      </GlassCard>

      <GlassCard raised className="p-5">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Évolution 2023 → 2026</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={player.marketHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
            <XAxis dataKey="year" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} unit="M€" />
            <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
            <Area type="monotone" dataKey="value" stroke="var(--accent)" fill="rgba(var(--accent-rgb),0.2)" strokeWidth={2} animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

export function MatchesTab({ player }: { player: SquadPlayer }) {
  if (player.matches.length === 0) {
    return <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun match enregistré.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {player.matches.map((match) => (
        <motion.div key={match.id} whileHover={{ scale: 1.02 }} className="cursor-pointer">
          <GlassCard raised className="p-5">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{match.date}</p>
            <p className="mt-1 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              FC Carthage {match.score} {match.opponent}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <AnimatedBadge tone="info">Rating {match.rating}</AnimatedBadge>
              {match.goals > 0 && <span className="text-xs">⚽ {match.goals}</span>}
              {match.assists > 0 && <span className="text-xs">🎯 {match.assists}</span>}
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}

export function VideoTab({ player }: { player: SquadPlayer }) {
  if (player.videos.length === 0) {
    return <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune vidéo disponible.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {player.videos.map((video) => (
          <motion.div key={video.id} whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
            <GlassCard className="overflow-hidden p-0">
              <div className="flex h-28 items-center justify-center text-4xl" style={{ background: "rgba(var(--accent-rgb),0.1)" }}>
                ▶️
              </div>
              <div className="p-4">
                <AnimatedBadge tone="info">{video.type}</AnimatedBadge>
                <p className="mt-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{video.title}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{video.duration}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard raised className="p-5">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Heatmap — Zones d'activité</h3>
        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 25 }, (_, i) => {
            const intensity = Math.random();
            return (
              <div
                key={i}
                className="aspect-square rounded-sm transition-transform hover:scale-110"
                style={{ background: `rgba(224,88,74,${0.1 + intensity * 0.7})` }}
                title={`Zone ${i + 1}`}
              />
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
