import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2,
  Target, Calendar, Flag, Ruler, Heart, MapPin, DollarSign, Users,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
  BarChart, Bar, CartesianGrid, XAxis, YAxis,
} from "recharts";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { useRecruteurTalents } from "../../hooks/useRecruteurTalents";

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(5,8,22,0.96)", border: "1px solid rgba(139,92,246,0.3)", color: "white", borderRadius: 12 },
};

const TABS = ["Vue générale", "Statistiques", "Blessures & Risque"] as const;
type Tab = typeof TABS[number];

function Gauge({ value, color }: { value: number; color: string }) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
      <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: color }}
        initial={{ width: 0 }} animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, ease: "easeOut" }} />
    </div>
  );
}

const RCard = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <motion.div className={`rounded-[20px] border p-5 ${className}`}
    style={{
      background: "rgba(14,10,35,0.8)",
      borderColor: glow ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.06)",
      boxShadow: glow ? "0 0 40px rgba(139,92,246,0.12)" : "0 8px 24px rgba(0,0,0,0.2)",
    }}
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    {children}
  </motion.div>
);

export function RecruteurPlayerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, error, getById } = useRecruteurTalents();
  const [tab, setTab] = useState<Tab>("Vue générale");

  if (loading) {
    return (
      <RecruteurPageTransition>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16" style={{ borderColor: "var(--surface-panel-border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>
        </div>
      </RecruteurPageTransition>
    );
  }

  const player = getById(id);

  if (error || !player) {
    return (
      <RecruteurPageTransition>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16" style={{ borderColor: "var(--surface-panel-border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{error ?? "Joueur introuvable"}</p>
          <motion.button type="button" onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}>
            <ArrowLeft size={14} /> Retour
          </motion.button>
        </div>
      </RecruteurPageTransition>
    );
  }

  const radarData = [
    { subject: "Vitesse",     A: player.speed     },
    { subject: "Technique",   A: player.technique },
    { subject: "Physique",    A: player.physical  },
    { subject: "Vision",      A: player.vision    },
    { subject: "Mental",      A: player.mental    },
    { subject: "Finition",    A: player.finishing },
  ];

  const riskColor = player.injuryRisk < 20 ? "#22C55E" : player.injuryRisk < 45 ? "#FF7A00" : "#EF4444";

  return (
    <RecruteurPageTransition>
      {/* Back */}
      <div className="flex items-center gap-3">
        <motion.button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
          style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}
          whileHover={{ borderColor: "rgba(139,92,246,0.4)", color: "#8B5CF6" }} whileTap={{ scale: 0.96 }}>
          <ArrowLeft size={14} /> Retour
        </motion.button>
        <h1 className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>Profil Joueur</h1>
      </div>

      {/* Hero */}
      <RCard glow>
        <div className="relative overflow-hidden">
          <motion.div className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.05),transparent)" }}
            animate={{ x: ["-100%","200%"] }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 4 }} />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Avatar */}
            <motion.div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[20px] text-2xl font-black text-white"
              style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.35),rgba(99,102,241,0.25))", border: "2px solid rgba(139,92,246,0.4)" }}
              animate={{ boxShadow: ["0 0 0px #8B5CF600","0 0 28px #8B5CF660","0 0 0px #8B5CF600"] }}
              transition={{ duration: 2.5, repeat: Infinity }}>
              {player.countryFlag} {player.name.split(" ").map(n => n[0]).join("")}
            </motion.div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{player.name}</h2>
                <span className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{ background: "rgba(139,92,246,0.2)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.4)" }}>
                  AI Score: {player.aiScore}/100
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1"><Target size={12} style={{ color: "#8B5CF6" }} /> {player.positionFull}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {player.age} ans</span>
                <span className="flex items-center gap-1"><Flag size={12} /> {player.country} {player.countryFlag}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {player.club}</span>
                <span className="flex items-center gap-1"><Heart size={12} /> Pied {player.foot}</span>
                <span className="flex items-center gap-1"><Ruler size={12} /> {player.height}</span>
                <span className="flex items-center gap-1"><DollarSign size={12} style={{ color: "#22C55E" }} /> {player.value}</span>
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                {player.league} · {player.matches} matchs
              </p>
            </div>

            {/* Score ring */}
            <div className="flex shrink-0 flex-col items-center gap-2">
              <svg width={72} height={72}>
                <circle cx={36} cy={36} r={30} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
                <motion.circle cx={36} cy={36} r={30} fill="none" stroke="#8B5CF6" strokeWidth={5}
                  strokeDasharray={2 * Math.PI * 30}
                  style={{ transformOrigin: "center", rotate: "-90deg" }}
                  initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 30 * (1 - player.aiScore / 100) }}
                  transition={{ duration: 1.2, ease: "easeOut" }} />
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#8B5CF6" fontSize={15} fontWeight="900">
                  {player.aiScore}
                </text>
              </svg>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>AI Score</p>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: riskColor === "#22C55E" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: riskColor }}>
                Risque {player.injuryRisk}%
              </span>
            </div>
          </div>

          {/* Quick metrics */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {[
              { label: "Buts",     value: player.goals,         color: "#22C55E" },
              { label: "Passes D.",value: player.assists,       color: "#3B82F6" },
              { label: "Matchs",   value: player.matches,       color: "#06B6D4" },
              { label: "Compat.",  value: `${player.teamCompat}%`, color: "#F59E0B" },
              { label: "Potentiel",value: `${player.potential}%`,  color: "#A855F7" },
              { label: "Valeur",   value: player.value,         color: "#22C55E" },
            ].map(m => (
              <div key={m.label} className="rounded-xl border p-2 text-center"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--surface-panel-border)" }}>
                <p className="text-base font-extrabold" style={{ color: m.color }}>{m.value}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </RCard>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <motion.button key={t} type="button" onClick={() => setTab(t)}
            className="rounded-xl px-4 py-2 text-xs font-semibold"
            style={{
              background: tab === t ? "linear-gradient(135deg,#8B5CF6,#6D28D9)" : "rgba(255,255,255,0.04)",
              color: tab === t ? "white" : "var(--text-muted)",
              boxShadow: tab === t ? "0 0 16px rgba(139,92,246,0.35)" : "none",
            }}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            {t}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* ── Vue générale ── */}
          {tab === "Vue générale" && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                {/* Radar */}
                <RCard>
                  <p className="mb-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Profil FIFA</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.07)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                        <Radar name="Joueur" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.22} strokeWidth={2} />
                        <Tooltip {...TOOLTIP_STYLE} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </RCard>

                {/* Attributes */}
                <RCard>
                  <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Attributs</p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Vitesse",   value: player.speed,     color: "#F59E0B" },
                      { label: "Technique", value: player.technique,  color: "#8B5CF6" },
                      { label: "Physique",  value: player.physical,   color: "#EF4444" },
                      { label: "Vision",    value: player.vision,     color: "#3B82F6" },
                      { label: "Mental",    value: player.mental,     color: "#22C55E" },
                      { label: "Finition",  value: player.finishing,  color: "#F59E0B" },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: "var(--text-muted)" }}>{label}</span>
                          <span className="font-bold" style={{ color }}>{value}/100</span>
                        </div>
                        <Gauge value={value} color={color} />
                      </div>
                    ))}
                  </div>
                </RCard>
              </div>

              <div className="space-y-4">
                {/* IA Compatibility */}
                <RCard>
                  <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Compatibilité recrutement</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Compat. équipe",   value: player.teamCompat,      color: "#22C55E" },
                      { label: "Potentiel",         value: player.potential,       color: "#8B5CF6" },
                      { label: "Transfert réussi",  value: player.transferSuccess, color: "#F59E0B" },
                    ].map(m => (
                      <div key={m.label} className="rounded-xl border p-2.5 text-center"
                        style={{ background: `${m.color}08`, borderColor: `${m.color}20` }}>
                        <p className="text-lg font-extrabold" style={{ color: m.color }}>{m.value}%</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                      </div>
                    ))}
                  </div>
                </RCard>

                <RCard>
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={14} style={{ color: "#8B5CF6" }} />
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Agent</p>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Non renseigné pour ce profil.</p>
                </RCard>
              </div>
            </div>
          )}

          {/* ── Statistiques ── */}
          {tab === "Statistiques" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Buts",     value: player.goals,   color: "#22C55E" },
                  { label: "Passes D.",value: player.assists, color: "#3B82F6" },
                  { label: "Matchs",   value: player.matches, color: "#06B6D4" },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <RCard>
                      <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                    </RCard>
                  </motion.div>
                ))}
              </div>
              <RCard>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Attributs techniques</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={radarData.map(r => ({ name: r.subject, value: r.A }))} layout="vertical" barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} width={75} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="value" radius={[0,6,6,0]} fill="#8B5CF6" fillOpacity={0.85} name="Valeur" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </RCard>
            </div>
          )}

          {/* ── Blessures & Risque ── */}
          {tab === "Blessures & Risque" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <RCard>
                <p className="mb-4 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Risque blessure IA</p>
                <div className="flex items-center gap-4 mb-5">
                  <motion.div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 text-xl font-black"
                    style={{ borderColor: riskColor, color: "var(--text-primary)" }}
                    animate={{ boxShadow: [`0 0 0px ${riskColor}00`, `0 0 20px ${riskColor}55`, `0 0 0px ${riskColor}00`] }}
                    transition={{ duration: 2, repeat: Infinity }}>
                    {player.injuryRisk}%
                  </motion.div>
                  <div>
                    <p className="font-bold" style={{ color: riskColor }}>
                      {player.injuryRisk < 20 ? "Risque faible" : player.injuryRisk < 45 ? "Risque modéré" : "Risque élevé"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Basé sur historique + charge physique + âge</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      Disponibilité: <strong style={{ color: player.injuryRisk < 30 ? "#22C55E" : "#FF7A00" }}>
                        {player.injuryRisk < 30 ? "Élevée" : "Modérée"}
                      </strong>
                    </p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "Risque blessure",  value: player.injuryRisk, color: riskColor },
                    { label: "Fatigue estimée",  value: Math.round(player.injuryRisk * 0.8), color: "#FF7A00" },
                    { label: "Disponibilité",    value: 100 - player.injuryRisk, color: "#22C55E" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: "var(--text-muted)" }}>{label}</span>
                        <span className="font-bold" style={{ color }}>{value}%</span>
                      </div>
                      <Gauge value={value} color={color} />
                    </div>
                  ))}
                </div>
              </RCard>

              <RCard>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Historique blessures</p>
                <div className="flex flex-col items-center justify-center py-10">
                  <CheckCircle2 size={28} style={{ color: "#22C55E" }} className="mb-2 opacity-70" />
                  <p className="text-sm font-medium" style={{ color: "#22C55E" }}>Aucune blessure enregistrée</p>
                </div>
              </RCard>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Ajouter à la shortlist", color: "#22C55E" },
          { label: "Comparer",               color: "#8B5CF6" },
          { label: "Contacter l'agent",      color: "#3B82F6" },
          { label: "Lancer négociation",     color: "#FF7A00" },
        ].map(({ label, color }) => (
          <motion.button key={label} type="button"
            className="rounded-xl border px-4 py-2 text-xs font-semibold"
            style={{ background: `${color}12`, borderColor: `${color}30`, color }}
            whileHover={{ scale: 1.05, background: `${color}22` }} whileTap={{ scale: 0.96 }}>
            {label}
          </motion.button>
        ))}
      </div>
    </RecruteurPageTransition>
  );
}
