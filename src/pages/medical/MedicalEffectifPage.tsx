import { useCallback, useEffect, useState } from "react";
import { CheckCircle, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { getInitials, getAvailabilityColor, type AvailabilityStatus } from "../../data/medicalMockData";
import { clubApi } from "../../lib/api/club";

interface DisplayPlayer {
  id: string;
  name: string;
  position: string;
  backendStatus: string;
}

const COLUMNS: { status: AvailabilityStatus; icon: typeof CheckCircle; color: string; emoji: string }[] = [
  { status: "Disponible", icon: CheckCircle, color: "var(--color-state-success)", emoji: "🟢" },
  { status: "Partiellement disponible", icon: AlertCircle, color: "var(--color-state-warning)", emoji: "🟠" },
  { status: "Indisponible", icon: XCircle, color: "var(--color-state-danger)", emoji: "🔴" },
];

function normalizePlayers(raw: unknown): DisplayPlayer[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `player-${i}`),
      name: String(row.fullName ?? row.name ?? ""),
      position: String(row.position ?? "—"),
      backendStatus: String(row.status ?? "DISPONIBLE"),
    };
  });
}

function backendToDisplay(status: string): AvailabilityStatus {
  const upper = status.trim().toUpperCase();
  if (upper === "DISPONIBLE") return "Disponible";
  if (upper === "BLESSE" || upper === "LIMITE") return "Partiellement disponible";
  if (upper === "FIN_CONTRAT") return "Indisponible";
  return "Disponible";
}

function displayToBackend(status: AvailabilityStatus): string {
  if (status === "Disponible") return "DISPONIBLE";
  if (status === "Partiellement disponible") return "LIMITE";
  if (status === "Indisponible") return "BLESSE";
  return "DISPONIBLE";
}

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
  const [players, setPlayers] = useState<DisplayPlayer[]>([]);
  const [availability, setAvailability] = useState<Record<string, AvailabilityStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await clubApi.getPlayers();
      const normalized = normalizePlayers(res);
      setPlayers(normalized);
      setAvailability(
        Object.fromEntries(normalized.map((player) => [player.id, backendToDisplay(player.backendStatus)])),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  async function updateStatus(id: string, status: AvailabilityStatus) {
    const previous = availability[id];
    setAvailability((prev) => ({ ...prev, [id]: status }));
    try {
      await clubApi.updatePlayer(id, { status: displayToBackend(status) });
      setToast("Statut mis à jour");
      window.setTimeout(() => setToast(null), 2000);
    } catch {
      setAvailability((prev) => ({ ...prev, [id]: previous }));
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm" style={{ color: "var(--color-state-danger)" }}>{error}</p>
      </div>
    );
  }

  const counts = COLUMNS.map((col) => ({
    ...col,
    count: players.filter((p) => availability[p.id] === col.status).length,
  }));

  return (
    <div className="space-y-6">
      {toast ? (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-[var(--radius-odin-md)] border px-4 py-3 text-sm shadow-lg"
          style={{
            background: "var(--surface-panel-solid)",
            borderColor: "var(--surface-panel-border)",
            color: "var(--text-primary)",
          }}
        >
          {toast}
        </div>
      ) : null}

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
          const columnPlayers = players.filter((p) => availability[p.id] === status);
          return (
            <GlassCard key={status} raised className="flex flex-col p-4" style={{ borderTop: `3px solid ${color}` }}>
              <div className="mb-4 flex items-center gap-2">
                <span>{emoji}</span>
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{status}</h3>
                <span
                  className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: `${color}33`, color }}
                >
                  {columnPlayers.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {columnPlayers.map((p) => (
                  <PlayerMiniCard
                    key={p.id}
                    name={p.name}
                    position={p.position}
                    status={availability[p.id]}
                    onStatusChange={(s) => updateStatus(p.id, s)}
                  />
                ))}
                {columnPlayers.length === 0 && (
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
