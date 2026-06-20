import { ArrowLeft, Share2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const RADAR_DATA = [
  { subject: "Technique", value: 88 },
  { subject: "Physique", value: 85 },
  { subject: "Mental", value: 82 },
  { subject: "Tactique", value: 79 },
  { subject: "Vitesse", value: 91 },
];

const STATS = {
  BU: [
    { label: "Buts", value: 18 },
    { label: "Assists", value: 7 },
    { label: "xG", value: 16.2 },
    { label: "Minutes", value: "1240'" },
  ],
};

const HISTORY = [
  { year: 2024, club: "AS Ariana", level: "U18" },
  { year: 2025, club: "Club Africain", level: "U20" },
  { year: 2026, club: "Prospect FC Carthage", level: "Prospect" },
];

export function ScoutProspectPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-[var(--radius-odin-md)] hover:bg-accent/10 transition-all"
        >
          <ArrowLeft size={20} style={{ color: "var(--accent)" }} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Youssef Ben Ali
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Profil détaillé du prospect
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost">
            <Share2 size={18} />
          </Button>
          <Button type="button" variant="ghost">
            <Download size={18} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard raised className="p-6">
          <div
            className="h-64 rounded-[var(--radius-odin-md)] mb-4 flex items-center justify-center text-lg font-semibold"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}
          >
            Photo Joueur
          </div>
          <div className="space-y-3">
            <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Âge</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>17 ans</p>
            </div>
            <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Nationalité</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Tunisienne</p>
            </div>
            <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Club Actuel</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>AS Ariana</p>
            </div>
            <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Position</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Buteur</p>
            </div>
            <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Potentiel</p>
              <p className="mt-2 text-3xl font-semibold" style={{ color: "var(--accent)" }}>89</p>
            </div>
            <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Valeur Estimée</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>1.2M €</p>
            </div>
            <div className="w-full">
              <Badge tone="success">🟢 Excellent</Badge>
            </div>
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Radar des compétences
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                <PolarGrid stroke="var(--surface-panel-border)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar
                  name="Compétences"
                  dataKey="value"
                  stroke="var(--accent)"
                  fill="var(--accent)"
                  fillOpacity={0.3}
                />
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
      </div>

      <GlassCard raised className="p-6">
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Statistiques détaillées
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {STATS.BU.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[var(--radius-odin-md)] border p-4 text-center"
              style={{ borderColor: "var(--surface-panel-border)" }}
            >
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </p>
              <p className="mt-3 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard raised className="p-6">
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Historique & Progression
        </h2>
        <div className="space-y-0">
          {HISTORY.map((item, index) => (
            <div key={item.year}>
              <div className="flex items-center gap-4 py-4">
                <div className="text-center min-w-12">
                  <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                    {item.year}
                  </p>
                </div>
                <div className="flex-1 rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {item.club}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {item.level}
                  </p>
                </div>
              </div>
              {index < HISTORY.length - 1 && (
                <div className="flex justify-center mb-2">
                  <div style={{ color: "var(--accent)" }}>↓</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="flex gap-3">
        <Button type="button" className="flex-1">
          Créer rapport
        </Button>
        <Button type="button" variant="ghost" className="flex-1">
          Ajouter aux favoris
        </Button>
      </div>
    </div>
  );
}
