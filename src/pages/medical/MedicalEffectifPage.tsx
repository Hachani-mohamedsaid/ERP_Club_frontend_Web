import { useState } from "react";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { PLAYERS, getInitials, getAvailabilityColor, type AvailabilityStatus } from "../../data/medicalMockData";

const COLUMNS: { status: AvailabilityStatus; icon: typeof CheckCircle; color: string; emoji: string }[] = [
  { status: "Disponible", icon: CheckCircle, color: "var(--color-state-success)", emoji: "🟢" },
  { status: "Partiellement disponible", icon: AlertCircle, color: "var(--color-state-warning)", emoji: "🟠" },
  { status: "Indisponible", icon: XCircle, color: "var(--color-state-danger)", emoji: "🔴" },
];

function PlayerMiniCard({
  name,
  position,
  status,
  onStatusChange,
}: {
  name: string;
  position: string;
  status: AvailabilityStatus;
  onStatusChange: (s: AvailabilityStatus) => void;
}) {
  return (
    <div
      className="rounded-[var(--radius-odin-md)] border p-3 transition-colors hover:border-accent/30"
      style={{ borderColor: "var(--surface-panel-border)" }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          {getInitials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>{name}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{position}</p>
        </div>
      </div>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as AvailabilityStatus)}
        className="glass-input mt-3 w-full py-1.5 text-xs"
        style={{ color: getAvailabilityColor(status) }}
      >
        {COLUMNS.map((c) => (
          <option key={c.status} value={c.status}>{c.status}</option>
        ))}
      </select>
    </div>
  );
}

export function MedicalEffectifPage() {
  const [availability, setAvailability] = useState<Record<string, AvailabilityStatus>>(
    Object.fromEntries(PLAYERS.map((p) => [p.id, p.availability]))
  );

  function updateStatus(id: string, status: AvailabilityStatus) {
    setAvailability((prev) => ({ ...prev, [id]: status }));
  }

  const counts = COLUMNS.map((col) => ({
    ...col,
    count: PLAYERS.filter((p) => availability[p.id] === col.status).length,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {counts.map(({ status, emoji, color, count }) => (
          <GlassCard key={status} className="p-4 text-center">
            <p className="text-2xl">{emoji}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color }}>{count}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{status}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map(({ status, emoji, color }) => {
          const players = PLAYERS.filter((p) => availability[p.id] === status);
          return (
            <GlassCard key={status} raised className="flex flex-col p-4" style={{ borderTop: `3px solid ${color}` }}>
              <div className="mb-4 flex items-center gap-2">
                <span>{emoji}</span>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{status}</h3>
                <span
                  className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: `${color}33`, color }}
                >
                  {players.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {players.map((p) => (
                  <PlayerMiniCard
                    key={p.id}
                    name={p.name}
                    position={p.position}
                    status={availability[p.id]}
                    onStatusChange={(s) => updateStatus(p.id, s)}
                  />
                ))}
                {players.length === 0 && (
                  <p className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>Aucun joueur</p>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="p-4">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Le coach visualise cette disponibilité en temps réel. Le médecin peut modifier le statut de chaque joueur.
        </p>
      </GlassCard>
    </div>
  );
}
