import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, CheckCircle, AlertCircle } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { Button } from "../../components/ui/Button";
import { INJURIES, type Injury, type InjuryStatus } from "../../data/medicalMockData";

type Filter = "Tous" | "Actives" | "En rééducation" | "Terminées";

const FILTERS: Filter[] = ["Tous", "Actives", "En rééducation", "Terminées"];

function severityTone(severity: Injury["severity"]) {
  if (severity === "Critique" || severity === "Grade III") return "danger";
  if (severity === "Grade II") return "warning";
  return "info";
}

function statusTone(status: InjuryStatus) {
  if (status === "Active") return "danger";
  if (status === "En rééducation") return "warning";
  return "success";
}

function InjuryCard({ injury }: { injury: Injury }) {
  const isCritical = injury.severity === "Critique" || injury.severity === "Grade III";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard
        raised
        className="relative overflow-hidden p-5"
        style={{ borderTop: `3px solid ${isCritical ? "var(--color-state-danger)" : injury.status === "En rééducation" ? "var(--color-state-warning)" : "var(--color-state-info)"}` }}
      >
        {isCritical && (
          <div className="absolute right-3 top-3">
            <AlertCircle size={18} style={{ color: "var(--color-state-danger)" }} />
          </div>
        )}
        <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{injury.injury}</h3>
        <AnimatedBadge tone={severityTone(injury.severity)}>{injury.severity}</AnimatedBadge>
        <p className="mt-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{injury.player}</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
              {injury.daysRemaining > 0 ? `${injury.daysRemaining}j` : "—"}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>restant</p>
          </div>
          <AnimatedBadge tone={statusTone(injury.status)}>{injury.status}</AnimatedBadge>
        </div>
        <div className="mt-4 flex gap-2 border-t pt-3" style={{ borderColor: "var(--surface-panel-border)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Début: {injury.startDate} • Retour: {injury.returnDate}
          </p>
        </div>
        <div className="mt-3 flex gap-2">
          <button type="button" className="flex flex-1 items-center justify-center gap-1 rounded-[var(--radius-odin-md)] py-2 text-xs font-medium transition-colors hover:bg-white/5" style={{ color: "var(--text-secondary)" }}>
            <Pencil size={12} /> Modifier
          </button>
          {injury.status !== "Terminée" && (
            <button type="button" className="flex flex-1 items-center justify-center gap-1 rounded-[var(--radius-odin-md)] py-2 text-xs font-medium transition-colors hover:bg-white/5" style={{ color: "var(--color-state-success)" }}>
              <CheckCircle size={12} /> Clôturer
            </button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function MedicalBlessuresPage() {
  const [filter, setFilter] = useState<Filter>("Tous");

  const filtered = INJURIES.filter((inj) => {
    if (filter === "Tous") return true;
    if (filter === "Actives") return inj.status === "Active";
    if (filter === "En rééducation") return inj.status === "En rééducation";
    return inj.status === "Terminée";
  });

  const stats = {
    total: INJURIES.length,
    active: INJURIES.filter((i) => i.status === "Active").length,
    reeducation: INJURIES.filter((i) => i.status === "En rééducation").length,
    done: INJURIES.filter((i) => i.status === "Terminée").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background: filter === f ? "var(--accent)" : "rgba(var(--accent-rgb), 0.1)",
                color: filter === f ? "white" : "var(--text-secondary)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <Button>
          <Plus size={16} /> Ajouter une blessure
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total, color: "var(--text-primary)" },
          { label: "Actives", value: stats.active, color: "var(--color-state-danger)" },
          { label: "En rééducation", value: stats.reeducation, color: "var(--color-state-warning)" },
          { label: "Terminées", value: stats.done, color: "var(--color-state-success)" },
        ].map(({ label, value, color }) => (
          <GlassCard key={label} className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((injury) => (
          <InjuryCard key={injury.id} injury={injury} />
        ))}
      </div>
    </div>
  );
}
