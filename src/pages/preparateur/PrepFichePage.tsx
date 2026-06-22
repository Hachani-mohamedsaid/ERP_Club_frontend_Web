import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Heart, AlertTriangle,
  CheckCircle2, Target, Ruler, Weight, Calendar,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar,
} from "recharts";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PLAYER_DETAILS } from "../../data/preparateurData";

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(10,16,30,0.95)", border: "1px solid rgba(255,122,0,0.2)", color: "white", borderRadius: 12 },
};

const CHARGE_HISTORY = [
  { week: "S-5", charge: 68, fatigue: 30 }, { week: "S-4", charge: 74, fatigue: 45 },
  { week: "S-3", charge: 81, fatigue: 60 }, { week: "S-2", charge: 88, fatigue: 72 },
  { week: "S-1", charge: 92, fatigue: 85 }, { week: "Actuel", charge: 90, fatigue: 80 },
];

const PERF_HISTORY = [
  { match: "J24", rating: 7.2, distance: 10.4, sprints: 22 },
  { match: "J25", rating: 8.0, distance: 11.1, sprints: 28 },
  { match: "J26", rating: 6.8, distance: 9.8,  sprints: 18 },
  { match: "J27", rating: 7.5, distance: 10.7, sprints: 24 },
  { match: "J28", rating: 8.5, distance: 11.4, sprints: 31 },
];

// Extended player data (add metrics to existing structure)
const EXTENDED = {
  "1": { distance: 10.8, sprints: 28, acceleration: 42, deceleration: 38, rpe: 8.2, wellness: 58, foot: "Droit", nationality: "TUN" },
  "2": { distance: 11.2, sprints: 31, acceleration: 45, deceleration: 40, rpe: 6.1, wellness: 88, foot: "Droit", nationality: "TUN" },
  "3": { distance: 9.4,  sprints: 18, acceleration: 28, deceleration: 25, rpe: 5.5, wellness: 74, foot: "Gauche", nationality: "TUN" },
  "4": { distance: 10.5, sprints: 26, acceleration: 38, deceleration: 35, rpe: 7.4, wellness: 66, foot: "Droit",  nationality: "TUN" },
  "5": { distance: 10.2, sprints: 24, acceleration: 36, deceleration: 32, rpe: 7.8, wellness: 55, foot: "Droit",  nationality: "TUN" },
  "6": { distance: 10.9, sprints: 29, acceleration: 41, deceleration: 37, rpe: 6.8, wellness: 75, foot: "Gauche", nationality: "TUN" },
  "7": { distance: 10.6, sprints: 27, acceleration: 39, deceleration: 36, rpe: 6.5, wellness: 80, foot: "Droit",  nationality: "TUN" },
  "8": { distance: 8.1,  sprints: 12, acceleration: 18, deceleration: 16, rpe: 6.0, wellness: 85, foot: "Droit",  nationality: "TUN" },
} as Record<string, { distance: number; sprints: number; acceleration: number; deceleration: number; rpe: number; wellness: number; foot: string; nationality: string }>;

const AVAIL_COLOR: Record<string, string> = {
  Disponible: "#22C55E", Blessé: "#EF4444", Limité: "#FF7A00", "En sélection": "#3B82F6",
};

function Gauge({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
      <motion.div className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: "easeOut" }} />
    </div>
  );
}

const TABS = ["Vue d'ensemble", "Charge & Fatigue", "Performances", "Blessures"] as const;
type Tab = (typeof TABS)[number];

export function PrepFichePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const player = PLAYER_DETAILS.find(p => p.id === id) ?? PLAYER_DETAILS[0];
  const ext = EXTENDED[player.id] ?? EXTENDED["1"];
  const [tab, setTab] = useState<Tab>("Vue d'ensemble");

  const availColor = AVAIL_COLOR[player.availability] ?? "#22C55E";

  const radarData = [
    { subject: "Vitesse",     A: Math.min(100, ext.sprints * 3) },
    { subject: "Endurance",   A: 100 - player.fatigue },
    { subject: "Force",       A: player.charge },
    { subject: "Récup.",      A: player.recovery },
    { subject: "Wellness",    A: ext.wellness },
    { subject: "RPE inv.",    A: 100 - ext.rpe * 10 },
  ];

  return (
    <PrepPageTransition>
      {/* Back header */}
      <div className="flex items-center gap-3">
        <motion.button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
          style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}
          whileHover={{ borderColor: "rgba(255,122,0,0.35)", color: "var(--accent)" }} whileTap={{ scale: 0.96 }}>
          <ArrowLeft size={14} /> Retour
        </motion.button>
        <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Fiche Joueur</h1>
      </div>

      {/* Hero card */}
      <motion.div className="relative overflow-hidden rounded-[22px] border p-6"
        style={{ background: "linear-gradient(135deg,rgba(10,20,50,0.95),rgba(50,20,5,0.85))", borderColor: "rgba(255,122,0,0.25)", boxShadow: "0 0 50px rgba(255,122,0,0.08),0 20px 50px rgba(0,0,0,0.3)" }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* glow sweep */}
        <motion.div className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(90deg,transparent 0%,rgba(255,122,0,0.06) 50%,transparent 100%)" }}
          animate={{ x: ["-100%", "200%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 3 }} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <motion.div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[20px] text-2xl font-black text-white"
            style={{ background: `${availColor}25`, border: `2px solid ${availColor}50` }}
            animate={{ boxShadow: [`0 0 0px ${availColor}00`, `0 0 24px ${availColor}60`, `0 0 0px ${availColor}00`] }}
            transition={{ duration: 2.2, repeat: Infinity }}>
            {player.name.split(" ").map(n => n[0]).join("")}
          </motion.div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{player.name}</h2>
              <span className="rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: `${availColor}20`, color: availColor, border: `1px solid ${availColor}40` }}>
                {player.availability}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1"><Target size={12} /> {player.position}</span>
              <span className="flex items-center gap-1"><Calendar size={12} /> {player.age} ans</span>
              <span className="flex items-center gap-1"><Ruler size={12} /> {player.height}</span>
              <span className="flex items-center gap-1"><Weight size={12} /> {player.weight}</span>
              <span className="flex items-center gap-1"><Heart size={12} /> Pied {ext.foot}</span>
              <span className="flex items-center gap-1"><Target size={12} /> {ext.nationality}</span>
            </div>
          </div>
          {/* Wellness ring */}
          <div className="flex shrink-0 flex-col items-center gap-1">
            <motion.div className="flex h-14 w-14 items-center justify-center rounded-full border-4 text-lg font-black"
              style={{ borderColor: ext.wellness >= 75 ? "#22C55E" : ext.wellness >= 50 ? "#FF7A00" : "#EF4444", color: "var(--text-primary)" }}
              animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}>
              {ext.wellness}
            </motion.div>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Wellness</p>
          </div>
        </div>

        {/* Quick metrics bar */}
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[
            { label: "Charge",        value: `${player.charge}%`,      color: player.charge >= 85 ? "#EF4444" : "#FF7A00" },
            { label: "Fatigue",       value: `${player.fatigue}%`,     color: player.fatigue >= 75 ? "#EF4444" : "#FF7A00" },
            { label: "Récupération",  value: `${player.recovery}%`,    color: "#22C55E" },
            { label: "Distance",      value: `${ext.distance} km`,     color: "#3B82F6" },
            { label: "Sprints",       value: String(ext.sprints),      color: "#F59E0B" },
            { label: "RPE",           value: `${ext.rpe}/10`,          color: ext.rpe >= 8 ? "#EF4444" : "#FF7A00" },
          ].map(m => (
            <div key={m.label} className="rounded-xl border p-2.5 text-center"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-lg font-extrabold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <motion.button key={t} type="button" onClick={() => setTab(t)}
            className="rounded-xl px-4 py-2 text-xs font-semibold"
            style={{
              background: tab === t ? "linear-gradient(135deg,var(--accent),#E66000)" : "rgba(255,255,255,0.04)",
              color: tab === t ? "white" : "var(--text-muted)",
              boxShadow: tab === t ? "0 0 16px rgba(255,122,0,0.3)" : "none",
            }}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            {t}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>

          {/* ── Vue d'ensemble ── */}
          {tab === "Vue d'ensemble" && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.2fr]">
              {/* Left: info + KPI avancés */}
              <div className="space-y-4">
                <PrepKpiCard hover={false}>
                  <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>KPI avancés</p>
                  <div className="space-y-3">
                    {[
                      { label: "Distance parcourue", value: `${ext.distance} km`, pct: (ext.distance / 13) * 100, color: "#3B82F6" },
                      { label: "Sprints",            value: String(ext.sprints),  pct: (ext.sprints / 40) * 100,   color: "#F59E0B" },
                      { label: "Accélérations",      value: String(ext.acceleration), pct: (ext.acceleration / 60) * 100, color: "#FF7A00" },
                      { label: "Décélérations",      value: String(ext.deceleration), pct: (ext.deceleration / 60) * 100, color: "#8B5CF6" },
                      { label: "RPE",                value: `${ext.rpe}/10`,     pct: ext.rpe * 10,               color: ext.rpe >= 8 ? "#EF4444" : "#FF7A00" },
                      { label: "Wellness Score",     value: `${ext.wellness}/100`, pct: ext.wellness,             color: ext.wellness >= 75 ? "#22C55E" : "#FF7A00" },
                    ].map(({ label, value, pct, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: "var(--text-muted)" }}>{label}</span>
                          <span className="font-bold" style={{ color }}>{value}</span>
                        </div>
                        <Gauge value={pct} color={color} />
                      </div>
                    ))}
                  </div>
                </PrepKpiCard>

                <PrepKpiCard hover={false}>
                  <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Programmes actifs</p>
                  {player.activePrograms.length > 0 ? player.activePrograms.map((p) => (
                    <div key={p} className="mb-2 flex items-center gap-2 rounded-xl border px-3 py-2"
                      style={{ background: "rgba(255,122,0,0.06)", borderColor: "rgba(255,122,0,0.2)" }}>
                      <CheckCircle2 size={12} style={{ color: "#22C55E" }} />
                      <span className="text-xs" style={{ color: "var(--text-primary)" }}>{p}</span>
                    </div>
                  )) : (
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Aucun programme actif</p>
                  )}
                </PrepKpiCard>
              </div>

              {/* Right: Radar */}
              <PrepKpiCard hover={false}>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Profil physique</p>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.07)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                      <Radar name="Joueur" dataKey="A" stroke="#FF7A00" fill="#FF7A00" fillOpacity={0.25} strokeWidth={2} />
                      <Tooltip {...TOOLTIP_STYLE} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>Dernier match: <strong style={{ color: "var(--text-primary)" }}>{player.lastMatch.opponent}</strong></span>
                  <span>Note: <strong style={{ color: "var(--accent)" }}>{player.lastMatch.rating}/10</strong></span>
                </div>
              </PrepKpiCard>
            </div>
          )}

          {/* ── Charge & Fatigue ── */}
          {tab === "Charge & Fatigue" && (
            <PrepKpiCard hover={false}>
              <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Évolution charge & fatigue (6 semaines)</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHARGE_HISTORY}>
                    <defs>
                      <linearGradient id="chargeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF7A00" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#FF7A00" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: number, name: string) => [`${v}%`, name === "charge" ? "Charge" : "Fatigue"]} />
                    <Area type="monotone" dataKey="charge" stroke="#FF7A00" strokeWidth={2.5} fill="url(#chargeGrad)" name="charge" />
                    <Area type="monotone" dataKey="fatigue" stroke="#EF4444" strokeWidth={2} fill="url(#fatGrad)" name="fatigue" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Charge actuelle", value: `${player.charge}%`, color: player.charge >= 85 ? "#EF4444" : "#FF7A00" },
                  { label: "Fatigue",         value: `${player.fatigue}%`, color: player.fatigue >= 75 ? "#EF4444" : "#FF7A00" },
                  { label: "Récupération",    value: `${player.recovery}%`, color: "#22C55E" },
                ].map(m => (
                  <div key={m.label} className="rounded-xl border p-3 text-center"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
                    <p className="text-xl font-extrabold" style={{ color: m.color }}>{m.value}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                  </div>
                ))}
              </div>
            </PrepKpiCard>
          )}

          {/* ── Performances ── */}
          {tab === "Performances" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PrepKpiCard hover={false}>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Notes matchs</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PERF_HISTORY} barCategoryGap="40%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="match" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[5, 10]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [v, "Note"]} />
                      <Bar dataKey="rating" radius={[6,6,0,0]} fill="#FF7A00" fillOpacity={0.85} name="Note" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </PrepKpiCard>
              <PrepKpiCard hover={false}>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Distance & Sprints</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PERF_HISTORY}>
                      <defs>
                        <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="match" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Area type="monotone" dataKey="distance" stroke="#3B82F6" strokeWidth={2} fill="url(#distGrad)" name="Distance (km)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </PrepKpiCard>
            </div>
          )}

          {/* ── Blessures ── */}
          {tab === "Blessures" && (
            <PrepKpiCard hover={false}>
              <p className="mb-4 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Historique blessures ({player.injuryHistory.length} entrée{player.injuryHistory.length !== 1 ? "s" : ""})
              </p>
              {player.injuryHistory.length > 0 ? (
                <div className="space-y-3">
                  {player.injuryHistory.map((inj, i) => {
                    const statusColor = inj.status === "Récupéré" ? "#22C55E" : inj.status === "En cours" ? "#EF4444" : "#FF7A00";
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                        className="flex items-start gap-3 rounded-xl border p-4"
                        style={{ background: `${statusColor}06`, borderColor: `${statusColor}25` }}>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: `${statusColor}15` }}>
                          <AlertTriangle size={14} style={{ color: statusColor }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{inj.injury}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Année: {inj.date}</p>
                        </div>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ background: `${statusColor}18`, color: statusColor }}>{inj.status}</span>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <CheckCircle2 size={32} style={{ color: "#22C55E" }} className="mb-3 opacity-60" />
                  <p className="text-sm font-medium" style={{ color: "#22C55E" }}>Aucune blessure enregistrée</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Joueur en parfaite santé</p>
                </div>
              )}
            </PrepKpiCard>
          )}

        </motion.div>
      </AnimatePresence>
    </PrepPageTransition>
  );
}
