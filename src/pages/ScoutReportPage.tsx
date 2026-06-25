import { Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";

export function ScoutReportPage() {
  const [report, setReport] = useState({
    date: new Date().toISOString().split("T")[0],
    match: "",
    opponent: "",
    technique: 50,
    physique: 50,
    mental: 50,
    tactique: 50,
    vitesse: 50,
    strengths: "",
    weaknesses: "",
    recommendation: "",
    decision: "observe",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Créer un rapport scout
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Évaluation détaillée du prospect
        </p>
      </div>

      <GlassCard raised className="p-6">
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Informations générales
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Date
            </label>
            <input
              type="date"
              value={report.date}
              onChange={(e) => setReport({ ...report, date: e.target.value })}
              className="glass-input w-full mt-2 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Match observé
            </label>
            <input
              type="text"
              placeholder="Ex: AS Ariana vs ES Sahel"
              value={report.match}
              onChange={(e) => setReport({ ...report, match: e.target.value })}
              className="glass-input w-full mt-2 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Adversaire
            </label>
            <input
              type="text"
              placeholder="Ex: ES Sahel"
              value={report.opponent}
              onChange={(e) => setReport({ ...report, opponent: e.target.value })}
              className="glass-input w-full mt-2 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard raised className="p-6">
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Évaluation (0-100)
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {["technique", "physique", "mental", "tactique", "vitesse"].map((skill) => (
            <div key={skill}>
              <label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {skill.charAt(0).toUpperCase() + skill.slice(1)}
              </label>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={report[skill as keyof typeof report]}
                  onChange={(e) =>
                    setReport({ ...report, [skill]: parseInt(e.target.value) })
                  }
                  className="flex-1 cursor-pointer"
                />
                <span className="text-lg font-bold min-w-8 text-center" style={{ color: "var(--accent)" }}>
                  {report[skill as keyof typeof report]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard raised className="p-6">
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Commentaires
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Points forts
            </label>
            <textarea
              value={report.strengths}
              onChange={(e) => setReport({ ...report, strengths: e.target.value })}
              placeholder="Décrivez les points forts observés..."
              rows={3}
              className="glass-input w-full mt-2 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Points faibles
            </label>
            <textarea
              value={report.weaknesses}
              onChange={(e) => setReport({ ...report, weaknesses: e.target.value })}
              placeholder="Décrivez les points à améliorer..."
              rows={3}
              className="glass-input w-full mt-2 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Recommandation
            </label>
            <textarea
              value={report.recommendation}
              onChange={(e) => setReport({ ...report, recommendation: e.target.value })}
              placeholder="Votre recommandation globale..."
              rows={3}
              className="glass-input w-full mt-2 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard raised className="p-6">
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Décision
        </h2>
        <div className="flex gap-3 flex-wrap">
          {[
            { value: "recruit", label: "🟢 Recruter", tone: "success" as const },
            { value: "observe", label: "🟡 Observer encore", tone: "warning" as const },
            { value: "refuse", label: "🔴 Refuser", tone: "danger" as const },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setReport({ ...report, decision: option.value })}
              className={`px-4 py-2 rounded-[var(--radius-odin-md)] transition-all ${
                report.decision === option.value ? "ring-2" : ""
              }`}
              style={{
                background: report.decision === option.value ? "var(--accent)" : "transparent",
                color: report.decision === option.value ? "white" : "var(--text-primary)",
                borderColor: "var(--surface-panel-border)",
                borderWidth: "1px",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {submitted && (
        <GlassCard className="p-4 flex items-center gap-3" style={{ background: "var(--color-state-success)" }}>
          <CheckCircle size={20} style={{ color: "white" }} />
          <p className="text-sm font-medium" style={{ color: "white" }}>
            Rapport envoyé avec succès!
          </p>
        </GlassCard>
      )}

      <Button type="button" className="w-full flex items-center justify-center gap-2" onClick={handleSubmit}>
        <Send size={18} />
        Envoyer le rapport
      </Button>
    </div>
  );
}
