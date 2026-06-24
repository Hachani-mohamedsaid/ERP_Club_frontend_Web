import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { ClubFormModal } from "../../components/club/ClubFormModal";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { usePermissions } from "../../hooks/usePermissions";

interface Infrastructure {
  id: string;
  name: string;
  infraType: string;
  status: string;
  capacity: string | null;
  occupationPct: number;
  nextMaintenance: string | null;
}

const STATUS_STYLE: Record<string, { color: string; glow: string }> = {
  Excellent: { color: "#22C55E", glow: "0 0 20px rgba(34,197,94,0.3)" },
  Bon: { color: "#6366F1", glow: "none" },
  Maintenance: { color: "#F59E0B", glow: "none" },
};

export function ClubInfrastructuresPage() {
  const { can } = usePermissions();
  const { data, loading, error, reload } = useClubResource(() => clubApi.getInfrastructures() as Promise<Infrastructure[]>);
  const items = data ?? [];
  const [showAdd, setShowAdd] = useState(false);

  return (
    <ClubPageTransition>
      <div className="mb-4 flex justify-end">
        {can("Parametres", "créer") && (
          <button type="button" onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}>
            <Plus size={16} /> Ajouter infrastructure
          </button>
        )}
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && items.length === 0 && (
        <ClubEmptyState title="Aucune infrastructure" description="Ajoutez vos terrains, salles et équipements." />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((infra, i) => {
          const style = STATUS_STYLE[infra.status] ?? STATUS_STYLE.Bon;
          return (
            <ClubKpiCard key={infra.id} delay={i * 0.05}>
              <div className="rounded-[16px] border p-5" style={{ borderColor: `${style.color}30`, boxShadow: style.glow }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{infra.name}</h3>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{infra.infraType}</p>
                  </div>
                  <Building2 size={20} style={{ color: style.color }} />
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  {infra.capacity && <p style={{ color: "var(--text-secondary)" }}>Capacité : {infra.capacity}</p>}
                  <p style={{ color: "var(--text-secondary)" }}>Occupation : {infra.occupationPct}%</p>
                  <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{ background: `${style.color}20`, color: style.color }}>
                    {infra.status}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: style.color, width: `${infra.occupationPct}%` }}
                    initial={{ width: 0 }} animate={{ width: `${infra.occupationPct}%` }} />
                </div>
              </div>
            </ClubKpiCard>
          );
        })}
      </div>

      <AnimatePresence>
        {showAdd && (
          <ClubFormModal
            title="Nouvelle infrastructure"
            fields={[
              { key: "name", label: "Nom" },
              { key: "infraType", label: "Type", placeholder: "Terrain" },
              { key: "status", label: "État", placeholder: "Bon" },
              { key: "capacity", label: "Capacité" },
              { key: "occupationPct", label: "Occupation %", type: "number" },
            ]}
            onClose={() => setShowAdd(false)}
            onSubmit={async (v) => {
              await clubApi.createInfrastructure({
                name: v.name,
                infraType: v.infraType || "Terrain",
                status: v.status || "Bon",
                capacity: v.capacity,
                occupationPct: Number(v.occupationPct) || 0,
              });
              await reload();
            }}
          />
        )}
      </AnimatePresence>
    </ClubPageTransition>
  );
}
