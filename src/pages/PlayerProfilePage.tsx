import { useState } from "react";
import { ArrowLeft, Download, Share2, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const PLAYER = {
  id: 1,
  name: "Youssef Ben Ali",
  photo: "https://images.unsplash.com/photo-1554993413-b4b28511a1d1?w=400&h=500&fit=crop",
  position: "Attaquant",
  age: 17,
  taille: "185cm",
  poids: "78kg",
  club: "AS Ariana",
  nationalite: "Tunisie",
  potentiel: 89,
  valeur: "1.2M €",
  nationaliteFlag: "🇹🇳",
};

const RADAR_DATA = [
  { name: "Technique", value: 85 },
  { name: "Physique", value: 88 },
  { name: "Mental", value: 89 },
  { name: "Tactique", value: 82 },
  { name: "Vitesse", value: 87 },
];

const STATS = [
  { label: "Buts", value: 23 },
  { label: "Assists", value: 8 },
  { label: "Passes réussies", value: 342 },
  { label: "Minutes", value: 1850 },
];

const CAREER_HISTORY = [
  { year: "2023", club: "Académie AS Ariana", role: "U17", level: "Démarrage" },
  { year: "2024", club: "AS Ariana U19", role: "Équipe Jeunes", level: "Progression" },
  { year: "2026", club: "AS Ariana (Senior)", role: "Équipe Pro", level: "Actuel" },
];

const PERFORMANCE_CHART = [
  { month: "Jan", score: 72 },
  { month: "Fév", score: 76 },
  { month: "Mar", score: 81 },
  { month: "Avr", score: 85 },
  { month: "Mai", score: 87 },
  { month: "Jun", score: 89 },
];

const SCOUT_REPORTS = [
  {
    date: "2026-06-15",
    scout: "Ahmed Mhenni",
    title: "Explosion offensive remarquable",
    rating: 9.1,
    comment: "Profil exceptionnel en phase de finition. Travail sans ballon impressionnant.",
  },
  {
    date: "2026-06-10",
    scout: "Fatima Gharbi",
    title: "Potentiel défensif limité",
    rating: 6.8,
    comment: "Faiblesse marquée en tâche défensive. À améliorer.",
  },
];

const AI_COMPATIBILITY = {
  score: 92,
  reason: "Profil offensif haute-vitesse compatible avec le jeu aérien de FC Carthage",
  recommendation: "Parfait pour remplacer un attaquant de pointe",
};

export function PlayerProfilePage() {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showImage, setShowImage] = useState(true);


  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm transition-colors"
        style={{ color: "var(--accent)" }}
      >
        <ArrowLeft size={16} />
        Retour
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <GlassCard raised className="overflow-hidden">
            <div className="w-full overflow-hidden rounded-t-[var(--radius-odin-md)] relative">
              {showImage ? (
                <div className="h-56 w-full">
                  <img
                    src={PLAYER.photo}
                    alt={PLAYER.name}
                    onError={() => setShowImage(false)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(2,6,23,0.55) 100%)' }} />
                </div>
              ) : (
                <div
                  className="h-56 w-full"
                  style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))' }}
                />
              )}

              <div className="absolute left-6 top-6">
                <h1 className="text-2xl font-bold text-white">{PLAYER.name}</h1>
                <p className="mt-1 text-sm text-white/80">{PLAYER.position} • {PLAYER.club}</p>
              </div>
            </div>
            <div className="p-6">
              <div className="mt-2">
                <div className="mt-4 space-y-3">
                {[
                  { label: "Âge", value: `${PLAYER.age} ans` },
                  { label: "Taille", value: PLAYER.taille },
                  { label: "Poids", value: PLAYER.poids },
                  { label: "Nationalité", value: `${PLAYER.nationaliteFlag} ${PLAYER.nationalite}` },
                  { label: "Club", value: PLAYER.club },
                  { label: "Position", value: PLAYER.position },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
                    <span style={{ color: "var(--text-primary)" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-[var(--radius-odin-md)] border p-4 text-center" style={{ borderColor: "var(--surface-panel-border)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Potentiel</p>
                  <p className="mt-2 text-2xl font-bold" style={{ color: "var(--accent)" }}>
                    {PLAYER.potentiel}
                  </p>
                </div>
                <div className="rounded-[var(--radius-odin-md)] border p-4 text-center" style={{ borderColor: "var(--surface-panel-border)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Valeur</p>
                  <p className="mt-2 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    {PLAYER.valeur}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-[var(--radius-odin-md)] py-2 transition-colors"
                  style={{
                    background: isFavorite ? "var(--accent)" : "var(--surface-panel)",
                    color: isFavorite ? "white" : "var(--accent)",
                    border: `1px solid var(--surface-panel-border)`,
                  }}
                >
                  <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                  Favoris
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 rounded-[var(--radius-odin-md)] py-2"
                  style={{
                    background: "var(--surface-panel)",
                    color: "var(--text-primary)",
                    border: `1px solid var(--surface-panel-border)`,
                  }}
                >
                  <Share2 size={16} />
                  Partager
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 rounded-[var(--radius-odin-md)] py-2"
                  style={{
                    background: "var(--surface-panel)",
                    color: "var(--text-primary)",
                    border: `1px solid var(--surface-panel-border)`,
                  }}
                >
                  <Download size={16} />
                  PDF
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <GlassCard raised className="p-6">
            <h2 className="mb-6 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Profil Technique
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid stroke="var(--surface-panel-border)" />
                  <PolarAngleAxis dataKey="name" stroke="var(--text-muted)" style={{ fontSize: 12 }} />
                  <PolarRadiusAxis stroke="var(--surface-panel-border)" />
                  <Radar name="Score" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.4} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-panel)",
                      border: "1px solid var(--surface-panel-border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard raised className="p-3">
            <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Statistiques Clés
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[var(--radius-odin-md)] border p-4 text-center"
                  style={{ borderColor: "var(--surface-panel-border)" }}
                >
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold" style={{ color: "var(--accent)" }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard raised className="p-6">
            <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Progression Récente
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PERFORMANCE_CHART}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-panel)",
                      border: "1px solid var(--surface-panel-border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={{ fill: "var(--accent)", r: 4 }}
                    name="Potentiel"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Historique Clubs
        </h2>
        <div className="space-y-3">
          {CAREER_HISTORY.map((period, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
                {idx < CAREER_HISTORY.length - 1 && (
                  <div
                    className="h-12 w-0.5"
                    style={{ background: "var(--surface-panel-border)" }}
                  />
                )}
              </div>
              <div className="flex-1 pt-1">
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {period.club}
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {period.role} • {period.level}
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  {period.year}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Rapports Scouts
        </h2>
        <div className="space-y-4">
          {SCOUT_REPORTS.map((report, idx) => (
            <div key={idx} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {report.title}
                    </p>
                    <Badge tone={report.rating >= 8 ? "success" : report.rating >= 7 ? "info" : "warning"}>
                      {report.rating}/10
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    Par {report.scout} • {report.date}
                  </p>
                  <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {report.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard raised className="p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🤖</div>
          <div className="flex-1">
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Analyse IA
            </h3>
            <div className="mt-4 rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--accent)", background: "rgba(var(--accent-rgb), 0.04)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Compatibilité FC Carthage
                </p>
                <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                  {AI_COMPATIBILITY.score}%
                </p>
              </div>

              <div className="h-2 rounded-full bg-[color:var(--surface-panel-border)]">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${AI_COMPATIBILITY.score}%`, background: "var(--accent)" }}
                />
              </div>
              <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                {AI_COMPATIBILITY.reason}
              </p>
              <p className="mt-2 text-sm font-semibold" style={{ color: "var(--accent)" }}>
                💡 {AI_COMPATIBILITY.recommendation}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
