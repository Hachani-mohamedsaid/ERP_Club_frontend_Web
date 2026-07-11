import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CalendarDays } from "lucide-react";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { ClubFormModal } from "../../components/club/ClubFormModal";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { usePermissions } from "../../hooks/usePermissions";
import {
  INFRA_TYPE_OPTIONS,
  INFRA_STATUS_OPTIONS,
  normalizeInfrastructure,
  countInfraByCategory,
  buildMaintenanceCalendar,
  formatInfraDate,
  type Infrastructure,
} from "../../lib/infrastructureNormalize";

const STATUS_STYLE: Record<string, { color: string; glow: string }> = {
  Excellent: { color: "#22C55E", glow: "0 0 20px rgba(34,197,94,0.3)" },
  Bon: { color: "#6366F1", glow: "none" },
  Maintenance: { color: "#F59E0B", glow: "none" },
};

const KPI_LABELS = [
  { key: "terrains" as const, label: "TERRAINS" },
  { key: "salles" as const, label: "SALLES" },
  { key: "bus" as const, label: "BUS" },
  { key: "centre" as const, label: "CENTRE MÉDICAL" },
];

export function ClubInfrastructuresPage() {
  const { can } = usePermissions();
  const { data, loading, error, reload } = useClubResource(async () => {
    const raw = (await clubApi.getInfrastructures()) as Record<string, unknown>[];
    return raw.map(normalizeInfrastructure);
  });
  const items = data ?? [];
  const [showAdd, setShowAdd] = useState(false);

  const counts = useMemo(() => countInfraByCategory(items), [items]);
  const maintenanceCalendar = useMemo(() => buildMaintenanceCalendar(items), [items]);

  return (
    <ClubPageTransition>
      <div className="mb-4 flex justify-end">
        {can("Parametres", "créer") && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}
          >
            <Plus size={16} /> Ajouter infrastructure
          </button>
        )}
      </div>

      {loading && (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Chargement…
        </p>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && items.length === 0 && (
        <ClubEmptyState
          title="Aucune infrastructure"
          description="Ajoutez vos terrains, salles et équipements."
        />
      )}

      {items.length > 0 && (
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="min-w-0 flex-1">
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {KPI_LABELS.map(({ key, label }, i) => (
                <ClubKpiCard key={key} delay={i * 0.04} hover={false} className="!p-4">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                    {counts[key]}
                  </p>
                </ClubKpiCard>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((infra, i) => (
                <InfrastructureCard key={infra.id} infra={infra} delay={i * 0.05} />
              ))}
            </div>
          </div>

          <aside className="w-full shrink-0 xl:w-72">
            <ClubKpiCard delay={0.1} className="!p-5">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays size={18} style={{ color: "#FF6B57" }} />
                <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  Maintenance Calendar
                </h3>
              </div>
              {maintenanceCalendar.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Aucune maintenance planifiée.
                </p>
              ) : (
                <ul className="space-y-3">
                  {maintenanceCalendar.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-xl border px-3 py-2.5"
                      style={{
                        borderColor: "var(--surface-panel-border)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {entry.infraName}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                        {entry.taskType}
                      </p>
                      <p className="mt-1 text-xs font-medium" style={{ color: "#FF6B57" }}>
                        {formatInfraDate(entry.scheduledDate)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </ClubKpiCard>
          </aside>
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <ClubFormModal
            title="Nouvelle infrastructure"
            fields={[
              { key: "name", label: "Nom" },
              {
                key: "infraType",
                label: "Type",
                type: "select",
                options: [...INFRA_TYPE_OPTIONS],
              },
              {
                key: "status",
                label: "État",
                type: "select",
                options: [...INFRA_STATUS_OPTIONS],
              },
              { key: "capacity", label: "Capacité", placeholder: "22 000" },
              { key: "occupationPct", label: "Occupation %", type: "number" },
              { key: "nextMaintenance", label: "Prochaine maintenance", type: "date" },
              {
                key: "maintenanceTask",
                label: "Tâche maintenance",
                placeholder: "Entretien pelouse",
              },
            ]}
            initialValues={{
              infraType: INFRA_TYPE_OPTIONS[0],
              status: INFRA_STATUS_OPTIONS[1],
            }}
            onClose={() => setShowAdd(false)}
            onSubmit={async (v) => {
              await clubApi.createInfrastructure({
                name: v.name,
                infraType: v.infraType || INFRA_TYPE_OPTIONS[0],
                status: v.status || INFRA_STATUS_OPTIONS[1],
                capacity: v.capacity,
                occupationPct: Number(v.occupationPct) || 0,
                nextMaintenance: v.nextMaintenance || undefined,
                maintenanceTask: v.maintenanceTask || undefined,
              });
              await reload();
            }}
          />
        )}
      </AnimatePresence>
    </ClubPageTransition>
  );
}

function InfrastructureCard({ infra, delay }: { infra: Infrastructure; delay: number }) {
  const style = STATUS_STYLE[infra.status] ?? STATUS_STYLE.Bon;

  return (
    <ClubKpiCard delay={delay}>
      <div
        className="rounded-[16px] border p-5"
        style={{ borderColor: `${style.color}30`, boxShadow: style.glow }}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            {infra.name}
          </h3>
          <span
            className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ background: `${style.color}20`, color: style.color }}
          >
            {infra.status}
          </span>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          {infra.capacity && (
            <div className="flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Capacité</span>
              <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                {infra.capacity}
              </span>
            </div>
          )}
          <div>
            <div className="mb-1.5 flex justify-between">
              <span style={{ color: "var(--text-muted)" }}>Taux d&apos;occupation</span>
              <span className="font-semibold" style={{ color: style.color }}>
                {infra.occupationPct}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: style.color }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, infra.occupationPct))}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
          <div className="flex justify-between pt-1">
            <span style={{ color: "var(--text-muted)" }}>Prochaine maintenance</span>
            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
              {formatInfraDate(infra.nextMaintenance)}
            </span>
          </div>
        </div>
      </div>
    </ClubKpiCard>
  );
}
