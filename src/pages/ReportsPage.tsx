import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, LineChart, Line,
} from "recharts";
import { BarChart3, TrendingUp, Users, Heart, Download, RefreshCw } from "lucide-react";
import { RPage, RCard, RHeader, RSection, RKpiCard, RPills, cardVariants, pageVariants } from "../components/responsable";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { AICard } from "../components/coach/AICard";
import { NotificationPanel } from "../components/coach/NotificationPanel";

/* ── Data ──────────────────────────────────────────────────────── */
const RECRUITMENT_BREAKDOWN = [
  { name: "Validés", value: 14 }, { name: "En cours", value: 9 }, { name: "Refusés", value: 5 },
];
const REVENUE_HISTORY = [
  { name: "Jan", value: 720 }, { name: "Fév", value: 810 }, { name: "Mar", value: 910 },
  { name: "Avr", value: 860 }, { name: "Mai", value: 980 }, { name: "Juin", value: 1040 },
];
const MEDICAL_TREND = [
  { name: "S1", value: 18 }, { name: "S2", value: 16 }, { name: "S3", value: 14 },
  { name: "S4", value: 12 }, { name: "S5", value: 10 },
];
const RADAR_DATA = [
  { subject: "Physique", A: 88 }, { subject: "Technique", A: 82 },
  { subject: "Tactique", A: 79 }, { subject: "Mental", A: 84 }, { subject: "Discipline", A: 75 },
];
const MATCHS_DATA = [
  { name: "J23", goals: 2, conceded: 0 }, { name: "J24", goals: 1, conceded: 1 },
  { name: "J25", goals: 3, conceded: 1 }, { name: "J26", goals: 0, conceded: 2 },
  { name: "J27", goals: 2, conceded: 0 }, { name: "J28", goals: 4, conceded: 1 },
];
const PLAYER_SCORES = [
  { name: "Brahmi", score: 87 }, { name: "Sassi K.", score: 81 }, { name: "Hammami", score: 78 },
  { name: "Gharbi", score: 76 }, { name: "Trabelsi", score: 74 }, { name: "Mejri", score: 71 },
];

const COLORS = ["#22C55E", "#FF7A00", "#EF4444"];
const NOTIFICATIONS_COACH = [
  { title: "Charge physique élevée", subtitle: "Séance du 22 juin" },
  { title: "Blessure mineure détectée", subtitle: "Ali Ben Youssef — genou" },
  { title: "Nouvelle opportunité", subtitle: "Prospect milieu défensif à valider" },
];

const RESP_TABS = ["Vue globale", "Recrutement", "Médical", "Matchs"];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "rgba(10,16,30,0.95)", border: "1px solid rgba(255,122,0,0.2)",
    color: "var(--text-primary)", borderRadius: 12,
  },
};

/* ── Coach Reports (existing style) ─────────────────────────────── */
function CoachReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Rapports</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Rapports sportifs, progression et gestion des blessures</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Performance équipe", value: "87/100", tone: "success" as const },
          { label: "Évolution joueurs",  value: "+6%",    tone: "info" as const },
          { label: "Blessures actives",  value: 3,        tone: "warning" as const },
        ].map((item) => (
          <GlassCard key={item.label} className="p-4">
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{item.label}</p>
            <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}</p>
            <Badge tone={item.tone}>{item.tone === "success" ? "Stable" : item.tone === "info" ? "Suivi" : "Urgent"}</Badge>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassCard raised className="p-6 xl:col-span-2">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Radar des performances</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                <PolarGrid stroke="var(--surface-panel-border)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar name="Team" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} />
                <Tooltip {...TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <div className="space-y-4">
          <AICard title="Recommandation IA" message="Yassine Brahmi est en forme optimale pour le prochain match." accent="success" />
          <AICard title="Risque Blessure" message="Ahmed Ben Salah : risque élevé 72% dans les 48 prochaines heures." accent="warning" />
          <NotificationPanel notifications={NOTIFICATIONS_COACH} />
        </div>
      </div>
    </div>
  );
}

/* ── Responsable Reports ─────────────────────────────────────────── */
function ResponsableReports() {
  const [tab, setTab] = useState("Vue globale");

  return (
    <RPage>
      <RHeader
        title="Rapports Club"
        subtitle="Recrutement, finances, médical et performances consolidés."
        action={
          <div className="flex gap-2">
            <motion.button type="button"
              className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}
              whileHover={{ borderColor: "rgba(255,122,0,0.3)", color: "var(--accent)" }} whileTap={{ scale: 0.96 }}>
              <RefreshCw size={12} /> Actualiser
            </motion.button>
            <motion.button type="button"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg,var(--accent),#E66000)", boxShadow: "0 0 16px rgba(255,122,0,0.3)" }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Download size={12} /> Export PDF
            </motion.button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <RKpiCard label="Revenus mensuels"  value="1.04M DT"  icon={TrendingUp} color="#22C55E" trend="+8% vs mois dernier" />
        <RKpiCard label="ROE"               value="+18%"      icon={BarChart3}  color="#3B82F6" trend="Objectif: 20%" />
        <RKpiCard label="Prospects actifs"  value="14"        icon={Users}      color="#FF7A00" trend="Recrutement" />
        <RKpiCard label="Blessures actives" value="3"         icon={Heart}      color="#EF4444" trend="Sur 28 joueurs" />
      </div>

      <RPills options={RESP_TABS} value={tab} onChange={setTab} />

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>

          {/* ── Vue globale ── */}
          {tab === "Vue globale" && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <RCard hover={false} className="xl:col-span-2">
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Revenus mensuels (kDT)</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REVENUE_HISTORY}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF7A00" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#FF7A00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v}k DT`, "Revenus"]} />
                      <Area type="monotone" dataKey="value" stroke="#FF7A00" strokeWidth={2.5} fill="url(#revGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </RCard>

              <div className="space-y-4">
                <RCard hover={false}>
                  <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Recrutement</p>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={RECRUITMENT_BREAKDOWN} dataKey="value" nameKey="name" innerRadius={35} outerRadius={65} paddingAngle={4}>
                          {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                        </Pie>
                        <Tooltip {...TOOLTIP_STYLE} />
                        <Legend wrapperStyle={{ color: "var(--text-muted)", fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </RCard>

                <RCard hover={false}>
                  <p className="mb-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>KPIs clés</p>
                  {[
                    { label: "Taux victoire",     value: "64%",   color: "#22C55E" },
                    { label: "Buts /match",        value: "2.1",   color: "#FF7A00" },
                    { label: "Occupation balle",   value: "58%",   color: "#3B82F6" },
                    { label: "Satisfaction staff", value: "91%",   color: "#8B5CF6" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between py-1.5 text-sm">
                      <span style={{ color: "var(--text-muted)" }}>{label}</span>
                      <span className="font-bold" style={{ color }}>{value}</span>
                    </div>
                  ))}
                </RCard>
              </div>
            </div>
          )}

          {/* ── Recrutement ── */}
          {tab === "Recrutement" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <RCard hover={false}>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Statuts recrutement</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={RECRUITMENT_BREAKDOWN} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={4}>
                        {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ color: "var(--text-muted)", fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </RCard>

              <RCard hover={false}>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Pipeline mensuel</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "Mar", prospects: 8, validés: 3 },
                      { name: "Avr", prospects: 12, validés: 5 },
                      { name: "Mai", prospects: 10, validés: 4 },
                      { name: "Jun", prospects: 14, validés: 6 },
                    ]} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="prospects" radius={[4, 4, 0, 0]} fill="#3B82F6" fillOpacity={0.7} name="Prospects" />
                      <Bar dataKey="validés"   radius={[4, 4, 0, 0]} fill="#22C55E" fillOpacity={0.9} name="Validés" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </RCard>
            </div>
          )}

          {/* ── Médical ── */}
          {tab === "Médical" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <RCard hover={false}>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Tendance blessures (semaines)</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MEDICAL_TREND}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [v, "Blessures actives"]} />
                      <Line type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2.5} dot={{ fill: "#EF4444", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </RCard>

              <RCard hover={false}>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Disponibilité effectif</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[
                        { name: "Disponibles", value: 22 },
                        { name: "Blessés", value: 3 },
                        { name: "Suspendus", value: 2 },
                        { name: "Absents", value: 1 },
                      ]} dataKey="value" nameKey="name" innerRadius={40} outerRadius={75} paddingAngle={4}>
                        {["#22C55E","#EF4444","#FF7A00","#64748B"].map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ color: "var(--text-muted)", fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </RCard>
            </div>
          )}

          {/* ── Matchs ── */}
          {tab === "Matchs" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <RCard hover={false}>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Buts pour / contre (6 derniers matchs)</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MATCHS_DATA} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="goals"    radius={[4, 4, 0, 0]} fill="#22C55E" fillOpacity={0.9} name="Buts marqués" />
                      <Bar dataKey="conceded" radius={[4, 4, 0, 0]} fill="#EF4444" fillOpacity={0.8} name="Buts encaissés" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </RCard>

              <RCard hover={false}>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Scores joueurs</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PLAYER_SCORES} layout="vertical" barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                      <XAxis type="number" domain={[60, 100]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [v, "Score OVR"]} />
                      <Bar dataKey="score" radius={[0, 5, 5, 0]} fill="url(#scoreGrad)" name="Score OVR" />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#FF7A00" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#FF7A00" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </RCard>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </RPage>
  );
}

/* ── Export ─────────────────────────────────────────────────────── */
export function ReportsPage() {
  const { user } = useAuth();
  return user?.role === "responsable" ? <ResponsableReports /> : <CoachReports />;
}
