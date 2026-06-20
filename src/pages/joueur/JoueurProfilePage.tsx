import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, HelpCircle, TrendingUp,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, AreaChart, Area, Legend,
} from "recharts";
import { OVRRing } from "../../components/player/OVRRing";
import { PositionMap } from "../../components/player/PositionMap";
import { CountUpStat } from "../../components/player/CountUpStat";
import { PlayerHeatmap } from "../../components/player/PlayerHeatmap";
import { CareerTimeline } from "../../components/player/CareerTimeline";
import { BodyInjuryViewer } from "../../components/medical/BodyInjuryViewer";
import { MedicalTimeline } from "../../components/medical/MedicalTimeline";
import { GlassCard } from "../../components/ui/GlassCard";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { getPlayerById, getInitials, getAvailabilityTone } from "../../data/joueurMockData";
import { getPlayerExtended, EXTENDED_MATCHES } from "../../data/joueurExtendedData";

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-base font-bold" style={{ color: "var(--text-primary)" }}>
      <span className="h-5 w-1 rounded-full" style={{ background: "var(--accent)" }} />
      {children}
    </h2>
  );
}

function GaugeBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span style={{ color: "var(--text-muted)" }}>{label}</span>
        <span className="font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--surface-panel-border)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function JoueurProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showWhy, setShowWhy] = useState(false);

  const player = getPlayerById(id ?? "");
  const ext = getPlayerExtended(id ?? "");
  const matches = id === "1" ? EXTENDED_MATCHES : player?.matches ?? [];

  if (!player) {
    return (
      <div className="py-12 text-center">
        <p style={{ color: "var(--text-muted)" }}>Joueur introuvable.</p>
        <button type="button" onClick={() => navigate("/joueurs/liste")} className="mt-4 text-sm" style={{ color: "var(--accent)" }}>
          Retour à la liste
        </button>
      </div>
    );
  }

  const radarData = [
    { stat: "Pace", value: player.radar.speed },
    { stat: "Shooting", value: player.radar.shooting },
    { stat: "Passing", value: player.radar.passing },
    { stat: "Dribbling", value: player.radar.vision },
    { stat: "Defending", value: player.radar.defending },
    { stat: "Physical", value: player.radar.physical },
  ];

  const statCards = [
    { label: "Matchs", value: ext.matchCount },
    { label: "Buts", value: player.stats.goals },
    { label: "Assists", value: player.stats.assists },
    { label: "Minutes", value: player.stats.minutes },
    { label: "Jaunes", value: ext.yellowCards },
    { label: "Rouges", value: ext.redCards },
  ];

  const timelineEvents = player.injuries.map((inj, i) => ({
    id: String(i),
    date: inj.year,
    title: inj.injury,
    description: inj.status,
    type: (inj.status === "En cours" || inj.status === "En rééducation" ? "warning" : "success") as "warning" | "success",
  }));

  const contractProgress = ((2026 - player.contract.startYear) / (player.contract.endYear - player.contract.startYear)) * 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-8 pb-12">
      <button type="button" onClick={() => navigate("/joueurs/liste")} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
        <ArrowLeft size={16} /> Retour à la liste
      </button>

      {/* Hero */}
      <div className="overflow-hidden rounded-[var(--radius-odin-md)]">
        <div className="relative h-40" style={{ background: "linear-gradient(135deg, var(--accent) 0%, #14141f 60%, #0a1628 100%)" }}>
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)" }} />
          <div className="absolute bottom-4 left-6 flex items-center gap-3">
            <span className="text-2xl">⚽</span>
            <div>
              <p className="text-lg font-bold text-white">FC Carthage</p>
              <p className="text-xs text-white/60">Ligue Professionnelle 1</p>
            </div>
          </div>
        </div>
        <div className="glass-panel relative px-6 pb-8 pt-0">
          <div className="-mt-14 flex flex-wrap items-end gap-6">
            <motion.div
              className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 text-3xl font-bold"
              style={{ borderColor: "var(--accent)", background: "var(--accent-soft)", color: "var(--accent)", boxShadow: "0 0 40px rgba(224,88,74,0.45)" }}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, y: [0, -5, 0] }}
              transition={{ duration: 0.6, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
            >
              {getInitials(player.name)}
            </motion.div>
            <div className="flex-1 min-w-[200px]">
              <motion.h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
                {player.name}
              </motion.h1>
              <p className="mt-1 text-base font-semibold" style={{ color: "var(--accent)" }}>{player.position} — {player.positionFull}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{player.flag} {player.nationality} • {player.age} ans</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <AnimatedBadge tone={getAvailabilityTone(player.availability)}>{player.availability}</AnimatedBadge>
                <span className="text-lg font-bold" style={{ color: "var(--color-state-success)" }}>{player.marketValue}</span>
              </div>
            </div>
            <OVRRing value={player.ovr} size={130} />
          </div>
          <div className="mt-6 flex justify-center">
            <PositionMap preferred={player.preferredPosition} secondary={player.secondaryPosition} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <SectionTitle>Statistiques Saison</SectionTitle>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {statCards.map(({ label, value }) => (
            <GlassCard key={label} className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                <CountUpStat end={value} />
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            </GlassCard>
          ))}
        </div>
      </motion.div>

      {/* Radar + Evolution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div custom={1} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard raised className="p-5">
            <SectionTitle>Radar FIFA</SectionTitle>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--surface-panel-border)" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} animationDuration={1400} />
                <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        <motion.div custom={2} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard raised className="p-5">
            <SectionTitle>Évolution du Joueur — 12 mois</SectionTitle>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={ext.evolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="ovr" name="OVR" stroke="var(--accent)" strokeWidth={2} dot={false} animationDuration={1500} />
                <Line type="monotone" dataKey="performance" name="Performance" stroke="#2e9e5b" strokeWidth={2} dot={false} animationDuration={1500} />
                <Line type="monotone" dataKey="marketValue" name="Valeur (M€)" stroke="#d99a1f" strokeWidth={2} dot={false} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </div>

      {/* Career + Market Value */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div custom={3} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard raised className="p-5">
            <SectionTitle>Career Timeline</SectionTitle>
            <CareerTimeline steps={ext.career} />
          </GlassCard>
        </motion.div>

        <motion.div custom={4} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard raised className="p-5">
            <SectionTitle>Valeur Marchande</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={player.marketHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
                <XAxis dataKey="year" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} unit="M€" />
                <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="value" stroke="var(--accent)" fill="rgba(224,88,74,0.15)" strokeWidth={2} animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </div>

      {/* Contract + Medical */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div custom={5} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard raised className="p-5">
            <SectionTitle>Contrat</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Salaire", value: player.contract.salary },
                { label: "Prime", value: player.contract.bonus },
                { label: "Date fin", value: player.contract.expiration },
                { label: "Clause", value: player.contract.clause },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                <span>{player.contract.startYear}</span>
                <span>{player.contract.endYear}</span>
              </div>
              <div className="relative mt-2 h-2 overflow-hidden rounded-full" style={{ background: "var(--surface-panel-border)" }}>
                <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: "var(--accent)" }} initial={{ width: 0 }} whileInView={{ width: `${Math.min(contractProgress, 100)}%` }} viewport={{ once: true }} transition={{ duration: 1.2 }} />
              </div>
              {player.contract.daysRemaining <= 90 && (
                <motion.p animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} className="mt-2 text-xs font-semibold" style={{ color: "var(--color-state-warning)" }}>
                  ⚠️ {player.contract.daysRemaining} jours restants
                </motion.p>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div custom={6} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard raised className="p-5">
            <SectionTitle>Médical</SectionTitle>
            <MedicalTimeline title="Historique blessures" events={timelineEvents} />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <GaugeBar label="Risk Score" value={player.riskScore} color="var(--color-state-danger)" />
              <GaugeBar label="Disponibilité" value={player.availability === "Disponible" ? 100 : player.availability === "Limité" ? 60 : 20} color="var(--color-state-success)" />
            </div>
            <div className="mt-4">
              <BodyInjuryViewer
                zones={[
                  { id: "knee-right", name: "Genou droit", severity: player.riskScore > 70 ? "critical" as const : "medium" as const,
                    injuryInfo: player.riskScore > 50 ? { player: player.name, grade: "Grade II", risk: player.riskScore, daysRemaining: 26 } : undefined },
                  { id: "knee-left", name: "Genou gauche", severity: "none" as const },
                  { id: "ankle-right", name: "Cheville", severity: "low" as const },
                ]}
              />
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Performance Ratings + Heatmap */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div custom={7} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard raised className="p-5">
            <SectionTitle>Performance — 10 derniers matchs</SectionTitle>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={ext.ratingHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
                <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <YAxis domain={[6, 10]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="rating" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)", r: 4 }} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 flex flex-wrap gap-2">
              {ext.ratingHistory.slice(0, 5).map((r) => (
                <span key={r.label} className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  <Star size={12} style={{ color: "var(--color-state-warning)" }} /> {r.rating}
                </span>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div custom={8} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard raised className="p-5">
            <SectionTitle>Heatmap — Zones d'activité</SectionTitle>
            <PlayerHeatmap />
          </GlassCard>
        </motion.div>
      </div>

      {/* Match History */}
      <motion.div custom={9} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <SectionTitle>Match History</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match, i) => (
            <motion.div key={match.id} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.02 }}>
              <GlassCard className="p-4">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{match.date}</p>
                <p className="mt-1 font-bold" style={{ color: "var(--text-primary)" }}>FC Carthage {match.score} {match.opponent}</p>
                <div className="mt-2 flex items-center gap-2">
                  <AnimatedBadge tone="info"><Star size={10} className="inline mr-1" />{match.rating}</AnimatedBadge>
                  {match.goals > 0 && <span className="text-xs">⚽ {match.goals}</span>}
                  {match.assists > 0 && <span className="text-xs">🎯 {match.assists}</span>}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Training + Sleep + AI */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div custom={10} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard raised className="p-5">
            <SectionTitle>Training</SectionTitle>
            <div className="space-y-3">
              <GaugeBar label="Présence" value={ext.training.presence} color="var(--color-state-success)" />
              <GaugeBar label="Charge" value={ext.training.charge} color="var(--color-state-warning)" />
              <GaugeBar label="Fatigue" value={ext.training.fatigue} color="var(--color-state-danger)" />
              <GaugeBar label="Physical" value={ext.training.physical} color="var(--accent)" />
              <GaugeBar label="Technical" value={ext.training.technical} color="#4a90d9" />
              <GaugeBar label="Tactical" value={ext.training.tactical} color="#9b59b6" />
            </div>
          </GlassCard>
        </motion.div>

        <motion.div custom={11} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard raised className="p-5">
            <SectionTitle>Sleep & Nutrition</SectionTitle>
            <div className="space-y-4">
              <GaugeBar label="Sleep Quality" value={ext.sleep.quality} color="#4a90d9" />
              <GaugeBar label="Recovery" value={ext.sleep.recovery} color="var(--color-state-success)" />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                  <p style={{ color: "var(--text-muted)" }}>Heures</p>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{ext.sleep.hours}h</p>
                </div>
                <div className="rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                  <p style={{ color: "var(--text-muted)" }}>Poids</p>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{ext.nutrition.weight} kg</p>
                </div>
                <div className="rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                  <p style={{ color: "var(--text-muted)" }}>IMC</p>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{ext.nutrition.bmi}</p>
                </div>
                <div className="rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                  <p style={{ color: "var(--text-muted)" }}>Hydratation</p>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{ext.nutrition.hydration}%</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div custom={12} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <GlassCard raised className="p-5">
            <SectionTitle>Performance AI</SectionTitle>
            <div className="space-y-3">
              <GaugeBar label="Risk Injury" value={ext.aiInsight.riskInjury} color="var(--color-state-danger)" />
              <GaugeBar label="Performance" value={ext.aiInsight.performance} color="var(--color-state-success)" />
              <GaugeBar label="Fatigue" value={ext.aiInsight.fatigue} color="var(--color-state-warning)" />
              <div className="rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--accent)" }}>Recommendation</p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-primary)" }}>{ext.aiInsight.recommendation}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowWhy(!showWhy)}
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: "var(--accent)" }}
              >
                <HelpCircle size={14} /> Why?
              </button>
              {showWhy && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-xs rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}>
                  {ext.aiInsight.why}
                </motion.p>
              )}
              <div className="flex items-center gap-2 rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                <TrendingUp size={16} style={{ color: "var(--color-state-success)" }} />
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>OVR prédit (6 mois)</p>
                  <p className="text-lg font-bold" style={{ color: "var(--color-state-success)" }}>{ext.aiInsight.predictedOvr}</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
