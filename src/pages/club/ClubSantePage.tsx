import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles, Save, X } from "lucide-react";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { ClubHeatInjuryMap } from "../../components/club/ClubHeatInjuryMap";
import { BodyInjuryViewer } from "../../components/medical/BodyInjuryViewer";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { usePermissions } from "../../hooks/usePermissions";
import { useClubProfile } from "../../hooks/useClubProfile";
import {
  BODY_PART_OPTIONS,
  INJURY_TYPE_OPTIONS,
  buildBodyZones,
  buildHeatZones,
  buildPreviewBodyZones,
  getBodyPartLabel,
  lookupBodyPartOverride,
  buildOverrideEntries,
  normalizeInjuryData,
  riskToPercent,
} from "../../lib/injuryNormalize";

function InjuryFormModal({
  players,
  onClose,
  onSubmit,
}: {
  players: { name: string }[];
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    playerName: "",
    injuryType: INJURY_TYPE_OPTIONS[0],
    bodyPart: BODY_PART_OPTIONS[0].id,
    returnDate: "",
    riskScore: "5",
  });
  const [saving, setSaving] = useState(false);

  const selectedZoneId = form.bodyPart;
  const previewZones = useMemo(
    () => buildPreviewBodyZones(selectedZoneId, Number(form.riskScore) || 0),
    [selectedZoneId, form.riskScore],
  );

  function selectZoneById(zoneId: string) {
    setForm((prev) => ({ ...prev, bodyPart: zoneId }));
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl rounded-[24px] border p-6"
        style={{ background: "var(--surface-panel-solid)", borderColor: "rgba(255,107,87,0.25)" }}
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Enregistrer une blessure</h2>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Joueur
            </label>
            {players.length > 0 ? (
              <select
                value={form.playerName}
                onChange={(e) => setForm((prev) => ({ ...prev, playerName: e.target.value }))}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: "rgba(30,35,50,0.97)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
              >
                <option value="">Sélectionner un joueur…</option>
                {players.map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            ) : (
              <input
                value={form.playerName}
                onChange={(e) => setForm((prev) => ({ ...prev, playerName: e.target.value }))}
                placeholder="Nom du joueur"
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
              />
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Type de blessure
            </label>
            <select
              value={form.injuryType}
              onChange={(e) => setForm((prev) => ({ ...prev, injuryType: e.target.value }))}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(30,35,50,0.97)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
            >
              {INJURY_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Zone
            </label>
            <select
              value={form.bodyPart}
              onChange={(e) => setForm((prev) => ({ ...prev, bodyPart: e.target.value }))}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(30,35,50,0.97)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
            >
              {BODY_PART_OPTIONS.map((z) => (
                <option key={z.id} value={z.id}>{z.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Retour prévu
            </label>
            <input
              type="date"
              value={form.returnDate}
              onChange={(e) => setForm((prev) => ({ ...prev, returnDate: e.target.value }))}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Score risque IA (0-10)
            </label>
            <input
              type="number"
              min={0}
              max={10}
              value={form.riskScore}
              onChange={(e) => setForm((prev) => ({ ...prev, riskScore: e.target.value }))}
              placeholder="8"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
            />
          </div>
          </div>

          <div
            className="flex flex-col items-center justify-center rounded-2xl border p-3"
            style={{ borderColor: "rgba(255,107,87,0.2)", background: "rgba(255,255,255,0.02)" }}
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Aperçu zone — {getBodyPartLabel(form.bodyPart)}
            </p>
            <BodyInjuryViewer
              zones={previewZones}
              selectedZoneId={selectedZoneId}
              onZoneClick={(zone) => selectZoneById(zone.id)}
            />
            <p className="mt-1 text-center text-[10px]" style={{ color: "var(--text-muted)" }}>
              Cliquez sur le corps ou choisissez dans la liste Zone
            </p>
          </div>
        </div>

        <motion.button
          type="button"
          disabled={saving}
          onClick={async () => {
            if (!form.playerName.trim()) {
              alert("Sélectionnez un joueur.");
              return;
            }
            setSaving(true);
            try {
              await onSubmit(form);
              onClose();
            } catch (err) {
              alert(err instanceof Error ? err.message : "Erreur");
            } finally {
              setSaving(false);
            }
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}
        >
          <Save size={14} /> {saving ? "Enregistrement…" : "Enregistrer"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function RiskBar({ percent }: { percent: number }) {
  const color = percent >= 70 ? "#EF4444" : percent >= 40 ? "#F59E0B" : "#22C55E";
  return (
    <div className="flex items-center gap-2">
      <Sparkles size={12} style={{ color: "#F59E0B" }} />
      <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, background: color }} />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{percent}%</span>
    </div>
  );
}

const BODY_ZONE_STORAGE_KEY = "club-injury-body-zones";

export function ClubSantePage() {
  const { can } = usePermissions();
  const { clubName } = useClubProfile();
  const { data, loading, error, reload } = useClubResource(() => clubApi.getInjuries());
  const { data: playersRaw } = useClubResource(() => clubApi.getPlayers());
  const [showAdd, setShowAdd] = useState(false);
  const [bodyPartOverrides, setBodyPartOverrides] = useState<Record<string, string>>(() => {
    try {
      const raw = sessionStorage.getItem(BODY_ZONE_STORAGE_KEY);
      return raw ? JSON.parse(raw) as Record<string, string> : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    sessionStorage.setItem(BODY_ZONE_STORAGE_KEY, JSON.stringify(bodyPartOverrides));
  }, [bodyPartOverrides]);

  const normalized = useMemo(() => normalizeInjuryData(data), [data]);
  const injured = useMemo(
    () => normalized.injured.map((row) => ({
      ...row,
      bodyPart: lookupBodyPartOverride(row, bodyPartOverrides),
    })),
    [normalized.injured, bodyPartOverrides],
  );
  const kpis = normalized.kpis;
  const heatZones = useMemo(() => buildHeatZones(injured), [injured]);
  const bodyZones = useMemo(() => buildBodyZones(heatZones, injured), [heatZones, injured]);

  const players = useMemo(() => {
    const list = Array.isArray(playersRaw) ? playersRaw : [];
    return list
      .map((p) => {
        const row = p as Record<string, unknown>;
        return { name: String(row.name ?? row.fullName ?? "") };
      })
      .filter((p) => p.name);
  }, [playersRaw]);

  const kpiCards = [
    { label: "Blessés", value: kpis.injured, color: "#EF4444", suffix: "" },
    { label: "Disponibles", value: kpis.available, color: "#22C55E", suffix: "" },
    { label: "Risque moyen", value: kpis.avgRisk, color: "#F59E0B", suffix: "%" },
  ];

  return (
    <ClubPageTransition>
      <div className="mb-4 flex justify-end">
        {can("Sante", "créer") && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}
          >
            <Plus size={16} /> Enregistrer une blessure
          </button>
        )}
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpiCards.map((kpi, i) => (
          <ClubKpiCard key={kpi.label} delay={i * 0.05}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
            <p className="mt-2 text-3xl font-bold" style={{ color: kpi.color }}>
              {kpi.value}{kpi.suffix}
            </p>
          </ClubKpiCard>
        ))}
      </div>

      <ClubKpiCard delay={0.08} hover={false}>
        <ClubHeatInjuryMap clubName={clubName} heatZones={heatZones} bodyZones={bodyZones} />
      </ClubKpiCard>

      <ClubKpiCard delay={0.1} hover={false}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Liste Blessés</h3>
        {injured.length === 0 ? (
          <ClubEmptyState title="Aucune blessure" description="L'effectif est au complet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Joueur", "Blessure", "Zone", "Retour prévu", "Risk IA"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {injured.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                    className="hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <PlayerAvatar name={p.name} size={32} />
                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#EF4444" }}>{p.injury}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                      {p.bodyPart ? getBodyPartLabel(p.bodyPart) : "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{p.returnDate}</td>
                    <td className="px-4 py-3">
                      <RiskBar percent={riskToPercent(p.riskIA)} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ClubKpiCard>

      <AnimatePresence>
        {showAdd && (
          <InjuryFormModal
            players={players}
            onClose={() => setShowAdd(false)}
            onSubmit={async (v) => {
              const zoneId = v.bodyPart;
              const playerName = v.playerName.trim();
              const created = await clubApi.createInjury({
                playerName,
                injuryType: v.injuryType,
                bodyPart: zoneId,
                returnDate: v.returnDate || null,
                riskScore: Number(v.riskScore) || 0,
              }) as Record<string, unknown>;

              const id = String(created.id ?? `local-${Date.now()}`);
              const injury = String(created.injury ?? created.injuryType ?? v.injuryType);
              const returnDate = String(created.returnDate ?? (
                v.returnDate
                  ? new Date(`${v.returnDate}T12:00:00`).toLocaleDateString("fr-FR")
                  : "—"
              ));
              const savedZone = String(created.bodyPart ?? zoneId);

              setBodyPartOverrides((prev) => ({
                ...prev,
                ...buildOverrideEntries(savedZone, {
                  id,
                  name: String(created.name ?? created.playerName ?? playerName),
                  injury,
                  returnDate,
                }, v.returnDate || undefined),
              }));
              await reload();
            }}
          />
        )}
      </AnimatePresence>
    </ClubPageTransition>
  );
}
