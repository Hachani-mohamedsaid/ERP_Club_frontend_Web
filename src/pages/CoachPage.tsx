import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { EvalModal } from "../components/coach/EvalModal";
import { KPICard } from "../components/coach/KPICard";
import { PerformanceChart } from "../components/coach/PerformanceChart";
import { Timeline } from "../components/coach/Timeline";
import { Calendar, ClipboardList, Flag, Target, Users, Zap } from "lucide-react";

export function CoachPage() {
  const KPIS = [
    { label: "Effectif disponible", value: 24, suffix: "", description: "Joueurs prêts", trend: { value: 2, direction: "up" as const }, icon: <Users size={20} /> },
    { label: "Blessés", value: 3, suffix: "", description: "Absences prévues", trend: { value: 1, direction: "down" as const }, icon: <Zap size={20} /> },
    { label: "Match dans", value: 2, suffix: "j", description: "avant le prochain" },
    { label: "Présence entraînement", value: 91, suffix: "%", description: "taux moyen", trend: { value: 4, direction: "up" as const } },
    { label: "Forme équipe", value: 87, suffix: "/100", description: "niveau général", trend: { value: 3, direction: "up" as const } },
    { label: "ODIN Team Score", value: 84, suffix: "/100", description: "évaluation globale", trend: { value: 2, direction: "up" as const } },
  ];

  const performanceData = [
    { name: "Sem 1", value: 78 },
    { name: "Sem 2", value: 81 },
    { name: "Sem 3", value: 79 },
    { name: "Sem 4", value: 85 },
    { name: "Sem 5", value: 87 },
    { name: "Sem 6", value: 84 },
  ];

  const timeline = [
    { id: "1", date: "Aujourd'hui", title: "Entraînement effectué", description: "Séance de 1h30 — Tactique", type: "success" as const },
    { id: "2", date: "Hier", title: "Évaluation: Yassine Brahmi", description: "Technique: 8/10 | Mental: 8/10", type: "info" as const },
    { id: "3", date: "2 jours", title: "Match FC Carthage vs CSS", description: "Victoire 2-0", type: "success" as const },
    { id: "4", date: "3 jours", title: "Blessure: Ahmed Ben Ali", description: "Reprise prévue dans 2 semaines", type: "warning" as const },
  ];

  const unavailable = [
    { name: "Ahmed", reason: "Blessé" },
    { name: "Ali", reason: "Suspendu" },
    { name: "Khaled", reason: "Blessé" },
  ];

  const lastResults = [
    "CAB 2-0 CSS",
    "CAB 1-1 ESS",
    "CAB 3-1 ST",
  ];

  const shortcuts = [
    { label: "Entraînements", path: "/training", icon: ClipboardList },
    { label: "Matchs", path: "/matches", icon: Flag },
    { label: "Performance", path: "/performance", icon: Target },
    { label: "Recrutement", path: "/recruitment", icon: Users },
    { label: "Messages", path: "/messages", icon: Calendar },
  ];

  const navigate = useNavigate();

  function goProfile(playerName: string) {
    navigate(`/players/${encodeURIComponent(playerName)}`);
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [activePlayer, setActivePlayer] = useState<string | undefined>(undefined);

  function openEval(name: string) {
    setActivePlayer(name);
    setModalOpen(true);
  }

  function handleSaveEval(data: any) {
    console.log("Saved eval for", activePlayer, data);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>👋 Bienvenue Coach Nabil</h1>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Prochain match: <span className="font-semibold">FC Carthage vs EST</span> — J-2
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {KPIS.map((k) => (
          <KPICard
            key={k.label}
            label={k.label}
            value={k.value}
            suffix={k.suffix}
            description={k.description}
            trend={k.trend}
            icon={k.icon}
          />
        ))}
      </div>

      <GlassCard className="p-6">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Accès rapide</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {shortcuts.map(({ label, path, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(path)}
              className="glass-input flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 hover:shadow-md hover:scale-105"
              style={{ justifyContent: "start", color: "var(--text-primary)" }}
            >
              <Icon size={18} style={{ color: "var(--accent)" }} />
              {label}
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <PerformanceChart
          title="Performance Équipe (6 semaines)"
          subtitle="Évolution du ODIN Score"
          data={performanceData}
          type="area"
          height={300}
        />

        <GlassCard raised className="p-6">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Composition & Effectifs</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[var(--radius-odin-md)] border px-4 py-4 text-center" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Seniors</p>
              <p className="mt-3 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>18</p>
            </div>
            <div className="rounded-[var(--radius-odin-md)] border px-4 py-4 text-center" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>U21</p>
              <p className="mt-3 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>6</p>
            </div>
            <div className="rounded-[var(--radius-odin-md)] border px-4 py-4 text-center" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>U18</p>
              <p className="mt-3 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>4</p>
            </div>
          </div>

          <div className="mt-6 rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Présence aujourd'hui</p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>91%</p>
              </div>
              <div className="text-3xl font-bold" style={{ color: "var(--accent)" }}>✓</div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color:var(--surface-panel-border)]">
              <div className="h-2 rounded-full" style={{ width: "91%", background: "var(--accent)" }} />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard className="p-4">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Blessures & absences</p>
          <div className="mt-4 space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            {unavailable.map((player) => (
              <div key={player.name} className="rounded-[var(--radius-odin-md)] border p-3 transition-all duration-300 hover:bg-orange-500/5" style={{ borderColor: "var(--surface-panel-border)" }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{player.name}</p>
                  <Badge tone={player.reason === "Blessé" ? "danger" : "warning"}>{player.reason}</Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Derniers résultats</p>
          <div className="mt-4 space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            {lastResults.map((result) => (
              <div key={result} className="rounded-[var(--radius-odin-md)] bg-[color:var(--surface-panel)] px-3 py-2 transition-all duration-300 hover:bg-accent/10">
                {result}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <Timeline title="Activité récente" events={timeline} />

      <GlassCard raised className="p-6">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Effectif</h2>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Liste joueurs (vue coach)</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: "var(--text-muted)" }}>
                <th className="pb-2 text-xs font-medium">Photo</th>
                <th className="pb-2 text-xs font-medium">Nom</th>
                <th className="pb-2 text-xs font-medium">Poste</th>
                <th className="pb-2 text-xs font-medium">Age</th>
                <th className="pb-2 text-xs font-medium">Equipe</th>
                <th className="pb-2 text-xs font-medium">Statut</th>
                <th className="pb-2 text-xs font-medium">ODIN Score</th>
                <th className="pb-2 text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderTop: "1px solid var(--surface-panel-border)" }} className="transition-colors duration-300 hover:bg-accent/5">
                <td className="py-3"><div className="h-8 w-8 rounded-full bg-slate-700" /></td>
                <td className="py-3 font-medium" style={{ color: "var(--text-primary)" }}>Yassine Brahmi</td>
                <td className="py-3" style={{ color: "var(--text-secondary)" }}>Avant-centre</td>
                <td className="py-3">28</td>
                <td className="py-3">Senior</td>
                <td className="py-3"><Badge tone="success">Disponible</Badge></td>
                <td className="py-3 text-right font-semibold" style={{ color: "var(--accent)" }}>87</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => goProfile('Yassine Brahmi')} className="glass-input px-2 py-1 text-xs transition-all duration-300 hover:shadow-md">Voir</button>
                    <button onClick={() => openEval('Yassine Brahmi')} className="glass-input px-2 py-1 text-xs transition-all duration-300 hover:shadow-md">Evaluer</button>
                    <button className="glass-input px-2 py-1 text-xs transition-all duration-300 hover:shadow-md">Affecter</button>
                    <button className="glass-input px-2 py-1 text-xs transition-all duration-300 hover:shadow-md">Historique</button>
                  </div>
                </td>
              </tr>
              <tr style={{ borderTop: "1px solid var(--surface-panel-border)" }} className="transition-colors duration-300 hover:bg-accent/5">
                <td className="py-3"><div className="h-8 w-8 rounded-full bg-slate-700" /></td>
                <td className="py-3 font-medium" style={{ color: "var(--text-primary)" }}>Mehdi Trabelsi</td>
                <td className="py-3" style={{ color: "var(--text-secondary)" }}>Milieu</td>
                <td className="py-3">24</td>
                <td className="py-3">Senior</td>
                <td className="py-3"><Badge tone="neutral">Surveillance</Badge></td>
                <td className="py-3 text-right font-semibold" style={{ color: "var(--accent)" }}>74</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => goProfile('Mehdi Trabelsi')} className="glass-input px-2 py-1 text-xs transition-all duration-300 hover:shadow-md">Voir</button>
                    <button onClick={() => openEval('Mehdi Trabelsi')} className="glass-input px-2 py-1 text-xs transition-all duration-300 hover:shadow-md">Evaluer</button>
                    <button className="glass-input px-2 py-1 text-xs transition-all duration-300 hover:shadow-md">Affecter</button>
                    <button className="glass-input px-2 py-1 text-xs transition-all duration-300 hover:shadow-md">Historique</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

      <EvalModal open={modalOpen} playerName={activePlayer} onClose={() => setModalOpen(false)} onSave={handleSaveEval} />
    </div>
  );
}


