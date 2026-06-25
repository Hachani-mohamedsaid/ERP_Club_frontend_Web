import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Pencil, Ban, ArrowRightLeft, FileSignature, X, GitCompareArrows, Plus } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { ClubFormModal } from "../../components/club/ClubFormModal";
import { PlayerDetailDrawer } from "../../components/club/PlayerDetailDrawer";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { usePermissions } from "../../hooks/usePermissions";
import type { SquadPlayer } from "../../data/joueurMockData";

interface SquadPlayerRow extends SquadPlayer {
  hasAccount?: boolean;
  accountEmail?: string | null;
  goals?: number;
}

const STATUS_COLORS: Record<string, string> = {
  Disponible: "#22C55E", Blessé: "#EF4444", "Fin contrat": "#F59E0B", Limité: "#6366F1",
};

const PLAYER_POSITIONS = ["GB", "DG", "DC", "DD", "MC", "MOC", "MDF", "AG", "AD", "BU", "ST"] as const;

const PLAYER_FIELDS = [
  { key: "fullName", label: "Nom complet" },
  { key: "position", label: "Poste", type: "select" as const, options: [...PLAYER_POSITIONS] },
  { key: "age", label: "Âge", type: "number" },
  { key: "ovr", label: "OVR", type: "number" },
  { key: "goals", label: "Buts (saison)", type: "number" },
  { key: "marketValue", label: "Valeur marchande", placeholder: "0" },
  { key: "salaryMonthly", label: "Salaire mensuel (DT)", type: "number" },
] as const;

function parseSalary(s?: string) {
  const n = parseInt(String(s ?? "").replace(/\D/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}

function playerToForm(player: SquadPlayer & { goals?: number }): Record<string, string> {
  return {
    fullName: player.name,
    position: player.position.toUpperCase(),
    age: String(player.age),
    ovr: String(player.ovr),
    goals: String(player.goals ?? 0),
    marketValue: player.marketValue ?? "0",
    salaryMonthly: String(parseSalary(player.contract?.salary)),
  };
}

function buildPlayerPayload(v: Record<string, string>) {
  return {
    fullName: v.fullName,
    position: (v.position || "MC").toUpperCase(),
    age: Number(v.age) || 0,
    ovr: Number(v.ovr) || 0,
    goals: Number(v.goals) || 0,
    marketValue: v.marketValue || "0",
    salaryMonthly: Number(v.salaryMonthly) || 0,
  };
}

function PlayerAddModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    fullName: "",
    position: "MC",
    age: "",
    ovr: "",
    goals: "0",
    marketValue: "0",
    salaryMonthly: "",
    accountEmail: "",
    accountPassword: "",
  });
  const [saving, setSaving] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[24px] border p-6"
        style={{ background: "rgba(10,18,40,0.98)", borderColor: "rgba(255,107,87,0.25)" }}
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Ajouter un joueur</h2>
        <div className="space-y-3">
          {PLAYER_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{f.label}</label>
              {f.type === "select" ? (
                <select
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                  style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
                >
                  {f.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type ?? "text"}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={"placeholder" in f ? f.placeholder : undefined}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
                />
              )}
            </div>
          ))}
          <div className="rounded-xl border p-3" style={{ borderColor: "rgba(132,204,22,0.25)", background: "rgba(132,204,22,0.06)" }}>
            <p className="mb-2 text-xs font-semibold" style={{ color: "#84CC16" }}>Compte joueur (requis)</p>
            <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Email Gmail</label>
            <input
              type="email"
              value={form.accountEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, accountEmail: e.target.value }))}
              placeholder="joueur@gmail.com"
              className="mb-3 w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
            />
            <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Mot de passe temporaire</label>
            <input
              type="password"
              value={form.accountPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, accountPassword: e.target.value }))}
              placeholder="8 caractères minimum"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm" style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>Annuler</button>
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              if (!form.fullName.trim()) { alert("Nom requis."); return; }
              if (!form.accountEmail.trim()) { alert("Email Gmail requis pour le compte joueur."); return; }
              if (form.accountPassword.length < 8) { alert("Mot de passe : 8 caractères minimum."); return; }
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
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ClubJoueursPage() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { data: players, loading, error, reload } = useClubResource(() => clubApi.getPlayers() as Promise<SquadPlayerRow[]>);
  const squad = players ?? [];
  const [search, setSearch] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [drawerPlayer, setDrawerPlayer] = useState<SquadPlayer | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editPlayer, setEditPlayer] = useState<SquadPlayer | null>(null);
  const [transferPlayer, setTransferPlayer] = useState<SquadPlayer | null>(null);

  const filtered = squad.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.position.toLowerCase().includes(search.toLowerCase())
  );

  const comparePlayers = selected.map((id) => squad.find((p) => p.id === id)).filter(Boolean);
  const radarData = comparePlayers.length === 2
    ? Object.keys(comparePlayers[0]!.radar).map((key) => ({
        stat: key.charAt(0).toUpperCase() + key.slice(1),
        [comparePlayers[0]!.name.split(" ")[0]]: comparePlayers[0]!.radar[key as keyof typeof comparePlayers[0]["radar"]],
        [comparePlayers[1]!.name.split(" ")[0]]: comparePlayers[1]!.radar[key as keyof typeof comparePlayers[1]["radar"]],
      }))
    : [];

  function toggleCompare(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id]);
  }

  async function toggleInjuryStatus(player: SquadPlayer) {
    const next = player.availability === "Blessé" ? "DISPONIBLE" : "BLESSE";
    try {
      await clubApi.updatePlayer(player.id, { status: next });
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  }

  const canEdit = can("Joueurs", "modifier");

  return (
    <ClubPageTransition>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <motion.div className="relative flex-1 min-w-[200px] max-w-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un joueur..."
            className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm backdrop-blur-[10px]"
            style={{ background: "rgba(15,29,58,0.8)", borderColor: "rgba(255,255,255,0.05)", color: "var(--text-primary)" }}
          />
        </motion.div>
        <button
          type="button"
          onClick={() => setCompareOpen(true)}
          disabled={selected.length < 2}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57" }}
        >
          <GitCompareArrows size={16} /> Comparer ({selected.length}/2)
        </button>
        {can("Joueurs", "créer") && (
          <button type="button" onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}>
            <Plus size={16} /> Ajouter joueur
          </button>
        )}
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && !error && squad.length === 0 && (
        <ClubEmptyState title="Aucun joueur" description="Ajoutez votre premier joueur via le bouton +." />
      )}

      <ClubKpiCard hover={false} className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["", "Nom", "Poste", "Âge", "OVR", "Buts", "Valeur", "Salaire", "Statut", "Compte", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((player, i) => (
                <motion.tr
                  key={player.id}
                  className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setDrawerPlayer(player)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(player.id)} onChange={() => toggleCompare(player.id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <motion.div whileHover={{ rotate: 1, scale: 1.02 }}>
                        <PlayerAvatar name={player.name} size={36} />
                      </motion.div>
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{player.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{player.position}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{player.age}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: "#FF6B57" }}>{player.ovr}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>{player.goals ?? 0}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{player.marketValue}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{player.contract?.salary ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: `${STATUS_COLORS[player.availability] ?? STATUS_COLORS.Disponible}20`, color: STATUS_COLORS[player.availability] ?? STATUS_COLORS.Disponible }}>
                      {player.availability ?? "Disponible"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {player.hasAccount ? (
                      <span className="text-xs font-medium" style={{ color: "#22C55E" }} title={player.accountEmail ?? undefined}>Compte actif</span>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>Sans compte</span>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        title="Voir la fiche"
                        onClick={() => setDrawerPlayer(player)}
                        className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
                        style={{ color: "#FF6B57" }}
                      >
                        <Eye size={14} />
                      </button>
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            title="Modifier"
                            onClick={() => setEditPlayer(player)}
                            className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            title={player.availability === "Blessé" ? "Marquer disponible" : "Marquer blessé"}
                            onClick={() => toggleInjuryStatus(player)}
                            className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
                            style={{ color: player.availability === "Blessé" ? "#FF6B57" : "var(--text-muted)" }}
                          >
                            <Ban size={14} />
                          </button>
                          <button
                            type="button"
                            title="Changer de poste"
                            onClick={() => setTransferPlayer(player)}
                            className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <ArrowRightLeft size={14} />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        title="Voir les contrats"
                        onClick={() => navigate("/club/contrats", { state: { playerName: player.name } })}
                        className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <FileSignature size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </ClubKpiCard>

      <PlayerDetailDrawer player={drawerPlayer} open={!!drawerPlayer} onClose={() => setDrawerPlayer(null)} />

      <AnimatePresence>
        {compareOpen && comparePlayers.length === 2 && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCompareOpen(false)} />
            <motion.div
              className="relative w-full max-w-lg rounded-[20px] border p-6"
              style={{ background: "rgba(15,29,58,0.95)", borderColor: "rgba(255,255,255,0.05)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
                  {comparePlayers[0]!.name.split(" ")[0]} vs {comparePlayers[1]!.name.split(" ")[0]}
                </h3>
                <button type="button" onClick={() => setCompareOpen(false)}><X size={18} style={{ color: "var(--text-muted)" }} /></button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                  <Radar name={comparePlayers[0]!.name.split(" ")[0]} dataKey={comparePlayers[0]!.name.split(" ")[0]} stroke="#FF6B57" fill="#FF6B57" fillOpacity={0.2} animationDuration={1000} />
                  <Radar name={comparePlayers[1]!.name.split(" ")[0]} dataKey={comparePlayers[1]!.name.split(" ")[0]} stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} animationDuration={1000} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdd && (
          <PlayerAddModal
            onClose={() => setShowAdd(false)}
            onSubmit={async (v) => {
              const created = await clubApi.createPlayer(buildPlayerPayload(v)) as Record<string, unknown>;
              const playerId = String(created.id ?? "");
              if (playerId && v.accountEmail && v.accountPassword) {
                await clubApi.createMember({
                  fullName: v.fullName,
                  email: v.accountEmail.trim(),
                  clubRole: "Joueur",
                  password: v.accountPassword,
                  clubPlayerId: playerId,
                });
              }
              await reload();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editPlayer && (
          <ClubFormModal
            title={`Modifier — ${editPlayer.name}`}
            fields={[...PLAYER_FIELDS]}
            initialValues={playerToForm(editPlayer)}
            submitLabel="Sauvegarder"
            onClose={() => setEditPlayer(null)}
            onSubmit={async (v) => {
              await clubApi.updatePlayer(editPlayer.id, buildPlayerPayload(v));
              await reload();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transferPlayer && (
          <ClubFormModal
            title={`Changer de poste — ${transferPlayer.name}`}
            fields={[{ key: "position", label: "Nouveau poste", placeholder: "MC, ST, DC…" }]}
            initialValues={{ position: transferPlayer.position }}
            submitLabel="Appliquer"
            onClose={() => setTransferPlayer(null)}
            onSubmit={async (v) => {
              await clubApi.updatePlayer(transferPlayer.id, { position: v.position || transferPlayer.position });
              await reload();
            }}
          />
        )}
      </AnimatePresence>
    </ClubPageTransition>
  );
}
