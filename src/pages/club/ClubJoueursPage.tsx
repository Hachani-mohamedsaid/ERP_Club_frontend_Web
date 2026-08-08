import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, ChevronDown, Plus, GitCompareArrows, X, Pencil, FileSignature } from "lucide-react";
import { ContractFormModal, type RosterEntry } from "../../components/club/ContractFormModal";
import { useAuth } from "../../contexts/AuthContext";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { GlassCard } from "../../components/ui/GlassCard";
import { Badge } from "../../components/ui/Badge";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { ClubFormModal } from "../../components/club/ClubFormModal";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { usePermissions } from "../../hooks/usePermissions";
import type { SquadPlayer } from "../../data/joueurMockData";

interface SquadPlayerRow extends SquadPlayer {
  hasAccount?: boolean;
  accountEmail?: string | null;
  goals?: number;
}

interface ContractRow {
  id: string;
  holderName: string;
  startDate: string;
  endDate: string;
  salaryMonthly?: number;
  bonus?: number;
  releaseClause?: string | null;
}

type TransferStatus = "À vendre" | "Intransférable" | "Surveillance";

const TRANSFER_TONE: Record<TransferStatus, "success" | "warning" | "info"> = {
  Intransférable: "success",
  "À vendre": "info",
  Surveillance: "warning",
};

const PLAYER_TABS = ["Vue Responsable Club", "Contrat", "Performance", "Historique"] as const;
type PlayerTab = (typeof PLAYER_TABS)[number];

const PLAYER_POSITIONS = ["Tous les postes", "GB", "DG", "DC", "DD", "MC", "MOC", "MDF", "AG", "AD", "BU", "ST"] as const;

const STATUS_OPTIONS = ["DISPONIBLE", "BLESSE", "LIMITE", "FIN_CONTRAT"] as const;

const PLAYER_FIELDS = [
  { key: "fullName", label: "Nom complet" },
  { key: "position", label: "Poste", type: "select" as const, options: ["GB", "DG", "DC", "DD", "MC", "MOC", "MDF", "AG", "AD", "BU", "ST"] },
  { key: "age", label: "Âge", type: "number" },
  { key: "ovr", label: "OVR / ODIN Score", type: "number" },
  { key: "goals", label: "Buts (saison)", type: "number" },
  { key: "marketValue", label: "Valeur marchande (DT)", placeholder: "120000" },
  { key: "salaryMonthly", label: "Salaire mensuel (DT)", type: "number" },
  { key: "status", label: "Statut", type: "select" as const, options: [...STATUS_OPTIONS] },
] as const;

function parseSalary(s?: string) {
  const n = parseInt(String(s ?? "").replace(/\D/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}

function formatMarketValue(v: string): string {
  const n = parseInt(String(v).replace(/\D/g, ""), 10);
  if (!n || Number.isNaN(n)) return v?.trim() ? v : "0 DT";
  return `${n.toLocaleString("fr-FR")} DT`;
}

function formatSalaryAmount(s?: string): string {
  const n = parseSalary(s);
  return n > 0 ? `${n.toLocaleString("fr-FR")} DT` : "—";
}

function ageCategory(age: number): string {
  if (age >= 21) return "Senior";
  if (age >= 18) return "U21";
  if (age >= 16) return "U18";
  return "U16";
}

function transferStatus(player: SquadPlayerRow): TransferStatus {
  if (player.availability === "Fin contrat") return "À vendre";
  if (player.availability === "Blessé" || player.availability === "Limité") return "Surveillance";
  if (player.ovr >= 85) return "Intransférable";
  if (player.ovr >= 70) return "Surveillance";
  return "À vendre";
}

function findContractForPlayer(name: string, contracts: ContractRow[]): ContractRow | undefined {
  const lower = name.trim().toLowerCase();
  return contracts.find(
    (c) =>
      c.holderName.trim().toLowerCase() === lower ||
      c.holderName.trim().toLowerCase().includes(lower) ||
      lower.includes(c.holderName.trim().toLowerCase()),
  );
}

function contractEndForPlayer(name: string, contracts: ContractRow[]): string {
  const match = findContractForPlayer(name, contracts);
  if (!match?.endDate) return "—";
  return new Date(match.endDate).toLocaleDateString("fr-FR");
}

function toInputDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
}

function availabilityToStatus(availability: string): string {
  const map: Record<string, string> = {
    Disponible: "DISPONIBLE",
    Blessé: "BLESSE",
    Limité: "LIMITE",
    "Fin contrat": "FIN_CONTRAT",
  };
  return map[availability] ?? "DISPONIBLE";
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
    status: availabilityToStatus(player.availability ?? "Disponible"),
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
    status: v.status || "DISPONIBLE",
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[24px] border p-6"
        style={{ background: "var(--surface-panel-solid)", borderColor: "rgba(255,107,87,0.25)" }}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
          Ajouter un joueur
        </h2>
        <div className="space-y-3">
          {PLAYER_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {f.label}
              </label>
              {f.type === "select" ? (
                <select
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                  style={{
                    background: "rgba(30,35,50,0.97)",
                    borderColor: "var(--surface-panel-border)",
                    color: "var(--text-primary)",
                  }}
                >
                  {f.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type ?? "text"}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={"placeholder" in f ? f.placeholder : undefined}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "var(--surface-panel-border)",
                    color: "var(--text-primary)",
                  }}
                />
              )}
            </div>
          ))}
          <div
            className="rounded-xl border p-3"
            style={{ borderColor: "rgba(132,204,22,0.25)", background: "rgba(132,204,22,0.06)" }}
          >
            <p className="mb-2 text-xs font-semibold" style={{ color: "#84CC16" }}>
              Compte joueur (requis)
            </p>
            <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Email Gmail
            </label>
            <input
              type="email"
              value={form.accountEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, accountEmail: e.target.value }))}
              placeholder="joueur@gmail.com"
              className="mb-3 w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "var(--surface-panel-border)",
                color: "var(--text-primary)",
              }}
            />
            <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Mot de passe temporaire
            </label>
            <input
              type="password"
              value={form.accountPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, accountPassword: e.target.value }))}
              placeholder="8 caractères minimum"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "var(--surface-panel-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border py-2.5 text-sm"
            style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              if (!form.fullName.trim()) {
                alert("Nom requis.");
                return;
              }
              if (!form.accountEmail.trim()) {
                alert("Email Gmail requis pour le compte joueur.");
                return;
              }
              if (form.accountPassword.length < 8) {
                alert("Mot de passe : 8 caractères minimum.");
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
  const location = useLocation();
  const { user } = useAuth();
  const profileBase = location.pathname.startsWith("/club") ? "/club/joueurs" : "/players";
  const { can, isClubAdmin } = usePermissions();

  const { data, loading, error, reload } = useClubResource(async () => {
    const [players, contracts] = await Promise.all([
      clubApi.getPlayers() as Promise<SquadPlayerRow[]>,
      clubApi.getContracts() as Promise<ContractRow[]>,
    ]);
    return { players, contracts };
  });

  const squad = data?.players ?? [];
  const contracts = data?.contracts ?? [];

  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("Tous les postes");
  const [activeTab, setActiveTab] = useState<PlayerTab>("Vue Responsable Club");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editPlayer, setEditPlayer] = useState<SquadPlayer | null>(null);
  const [contractModal, setContractModal] = useState<{
    mode: "create" | "edit";
    player: SquadPlayerRow;
    contract?: ContractRow;
  } | null>(null);

  const canEditPlayer =
    isClubAdmin || user?.role === "responsable" || can("Joueurs", "modifier") || can("Joueurs", "créer");
  const canManageContracts =
    isClubAdmin || user?.role === "responsable" || can("Contrats", "créer") || can("Contrats", "modifier");

  const rosterHolders: RosterEntry[] = useMemo(
    () =>
      squad.map((p) => ({
        name: p.name,
        salaryMonthly: parseSalary(p.contract?.salary),
      })),
    [squad],
  );

  const focusPlayer = useMemo(() => {
    if (focusId) return squad.find((p) => p.id === focusId) ?? null;
    return [...squad].sort((a, b) => b.ovr - a.ovr)[0] ?? null;
  }, [squad, focusId]);

  const focusContract = focusPlayer ? findContractForPlayer(focusPlayer.name, contracts) : undefined;

  const filtered = useMemo(
    () =>
      squad.filter((p) => {
        const q = search.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(q) || p.position.toLowerCase().includes(q);
        const matchesPos =
          positionFilter === "Tous les postes" ||
          p.position.toUpperCase() === positionFilter.toUpperCase();
        return matchesSearch && matchesPos;
      }),
    [squad, search, positionFilter],
  );

  const teamGroups = useMemo(() => {
    const groups = new Set(squad.map((p) => ageCategory(p.age)));
    return Array.from(groups).sort();
  }, [squad]);

  const focusContractEnd = focusPlayer ? contractEndForPlayer(focusPlayer.name, contracts) : "—";
  const focusMarket = focusPlayer ? formatMarketValue(focusPlayer.marketValue) : "—";
  const focusSalary = focusPlayer ? formatSalaryAmount(focusPlayer.contract?.salary) : "—";
  const focusOvr = focusPlayer ? `${focusPlayer.ovr}/100` : "—";

  const topStats = [
    { label: "Valeur marchande", value: focusMarket },
    { label: "Salaire", value: focusSalary },
    { label: "Fin contrat", value: focusContractEnd },
    { label: "ODIN Score", value: focusOvr },
  ];

  const comparePlayers = selected.map((id) => squad.find((p) => p.id === id)).filter(Boolean);
  const radarData =
    comparePlayers.length === 2
    ? Object.keys(comparePlayers[0]!.radar).map((key) => ({
        stat: key.charAt(0).toUpperCase() + key.slice(1),
        [comparePlayers[0]!.name.split(" ")[0]]: comparePlayers[0]!.radar[key as keyof typeof comparePlayers[0]["radar"]],
        [comparePlayers[1]!.name.split(" ")[0]]: comparePlayers[1]!.radar[key as keyof typeof comparePlayers[1]["radar"]],
      }))
    : [];

  function toggleCompare(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id],
    );
  }

  function openContractModal(player: SquadPlayerRow) {
    const existing = findContractForPlayer(player.name, contracts);
    setContractModal({
      mode: existing ? "edit" : "create",
      player,
      contract: existing,
    });
    setActiveTab("Contrat");
    setFocusId(player.id);
  }

  async function submitContract(values: Record<string, string>) {
    if (!contractModal) return;
    if (!values.holderName?.trim()) throw new Error("Titulaire requis.");
    if (!values.startDate || !values.endDate) throw new Error("Les dates sont requises.");
    const body = {
      holderName: values.holderName.trim(),
      startDate: values.startDate,
      endDate: values.endDate,
      salaryMonthly: Number(values.salaryMonthly) || 0,
      bonus: Number(values.bonus) || 0,
      releaseClause: values.releaseClause || null,
    };
    if (contractModal.mode === "edit" && contractModal.contract?.id) {
      await clubApi.updateContract(contractModal.contract.id, body);
    } else {
      await clubApi.createContract(body);
    }
    await reload();
  }

  return (
    <ClubPageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Joueurs
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Vue synthétique de l'effectif — Focus décisionnel
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCompareOpen(true)}
          disabled={selected.length < 2}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57" }}
        >
              <GitCompareArrows size={15} /> Comparer ({selected.length}/2)
        </button>
            {canEditPlayer && (
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}
              >
                <Plus size={15} /> Ajouter joueur
          </button>
        )}
          </div>
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && !error && squad.length === 0 && (
        <ClubEmptyState title="Aucun joueur" description="Ajoutez votre premier joueur via le bouton +." />
      )}

        {!loading && !error && squad.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {topStats.map(({ label, value }) => (
                <GlassCard key={label} className="p-4">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    {value}
                  </p>
                  {focusPlayer && (
                    <p className="mt-1 truncate text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {focusPlayer.name}
                    </p>
                  )}
                </GlassCard>
              ))}
            </div>

            <GlassCard className="p-6">
              <div className="flex flex-wrap gap-2">
                {PLAYER_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className="cursor-pointer border-0 bg-transparent p-0"
                  >
                    <Badge tone={activeTab === tab ? "info" : "neutral"}>{tab}</Badge>
                  </button>
                ))}
              </div>

              {activeTab === "Vue Responsable Club" && (
                <div className="mt-5">
                  <div className="grid gap-4 lg:grid-cols-3">
                  <div
                    className="rounded-[var(--radius-odin-md)] border p-4"
                    style={{ borderColor: "var(--surface-panel-border)" }}
                  >
                    <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                      Valeur marchande
                    </p>
                    <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                      {focusMarket}
                    </p>
                  </div>
                  <div
                    className="rounded-[var(--radius-odin-md)] border p-4"
                    style={{ borderColor: "var(--surface-panel-border)" }}
                  >
                    <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                      Contrat
                    </p>
                    <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                      {focusContractEnd !== "—" ? `Expire : ${focusContractEnd}` : "Aucun contrat"}
                    </p>
                  </div>
                  <div
                    className="rounded-[var(--radius-odin-md)] border p-4"
                    style={{ borderColor: "var(--surface-panel-border)" }}
                  >
                    <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                      Équipe
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {teamGroups.length === 0 ? (
                        <Badge tone="neutral">—</Badge>
                      ) : (
                        teamGroups.map((g) => (
                          <Badge
                            key={g}
                            tone={focusPlayer && ageCategory(focusPlayer.age) === g ? "success" : "neutral"}
                          >
                            {g}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  </div>
                  {focusPlayer && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="text-xs font-medium underline"
                        style={{ color: "var(--accent)" }}
                        onClick={() => navigate(`${profileBase}/${focusPlayer.id}`)}
                      >
                        Voir la fiche — {focusPlayer.name}
                      </button>
                      {canEditPlayer && (
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                          style={{ borderColor: "rgba(255,107,87,0.4)", color: "#FF6B57" }}
                          onClick={() => setEditPlayer(focusPlayer)}
                        >
                          <Pencil size={12} /> Modifier joueur
                        </button>
                      )}
                      {canManageContracts && (
                          <button
                            type="button"
                          className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                          style={{ borderColor: "rgba(99,102,241,0.4)", color: "#6366F1" }}
                          onClick={() => openContractModal(focusPlayer)}
                        >
                          <FileSignature size={12} />
                          {focusContract ? "Modifier contrat" : "Ajouter contrat"}
                          </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Contrat" && focusPlayer && (
                <div className="mt-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Salaire mensuel</p>
                      <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                        {focusContract?.salaryMonthly
                          ? `${focusContract.salaryMonthly.toLocaleString("fr-FR")} DT`
                          : focusSalary}
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Fin contrat</p>
                      <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                        {focusContractEnd !== "—" ? focusContractEnd : "Aucun contrat"}
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Bonus</p>
                      <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                        {focusContract?.bonus ? `${focusContract.bonus.toLocaleString("fr-FR")} DT` : "—"}
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Clause libératoire</p>
                      <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                        {focusContract?.releaseClause ?? "—"}
                      </p>
                    </div>
                  </div>
                  {canManageContracts && (
                          <button
                            type="button"
                      className="mt-4 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                      style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)" }}
                      onClick={() => openContractModal(focusPlayer)}
                    >
                      <FileSignature size={14} />
                      {focusContract ? "Modifier le contrat" : "Créer un contrat"}
                          </button>
                  )}
                </div>
              )}

              {activeTab === "Performance" && focusPlayer && (
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                    <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>ODIN Score</p>
                    <p className="mt-2 text-lg font-semibold" style={{ color: "var(--accent)" }}>{focusPlayer.ovr}</p>
                  </div>
                  <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                    <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Buts</p>
                    <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{focusPlayer.goals ?? 0}</p>
                  </div>
                  <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                    <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Poste</p>
                    <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{focusPlayer.position}</p>
                  </div>
                </div>
              )}

              {activeTab === "Historique" && (
                <p className="mt-5 text-sm" style={{ color: "var(--text-muted)" }}>
                  Historique disponible dans la fiche joueur.
                  {focusPlayer && (
                          <button
                            type="button"
                      className="ml-2 underline"
                      style={{ color: "var(--accent)" }}
                      onClick={() => navigate(`${profileBase}/${focusPlayer.id}`)}
                    >
                      Voir {focusPlayer.name}
                    </button>
                  )}
                </p>
              )}
            </GlassCard>

            <GlassCard raised className="p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Liste des joueurs
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: "var(--text-muted)" }}
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Rechercher un joueur..."
                      className="glass-input w-48 py-2 pl-8 pr-3 text-sm"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={positionFilter}
                      onChange={(e) => setPositionFilter(e.target.value)}
                      className="glass-input appearance-none py-2 pl-3 pr-8 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {PLAYER_POSITIONS.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ color: "var(--text-muted)" }}>
                      <th className="pb-2 text-xs font-medium w-8" />
                      <th className="pb-2 text-xs font-medium">Nom</th>
                      <th className="pb-2 text-xs font-medium">Valeur marchande</th>
                      <th className="pb-2 text-xs font-medium">Salaire</th>
                      <th className="pb-2 text-xs font-medium">Contrat</th>
                      <th className="pb-2 text-xs font-medium">ODIN Score</th>
                      <th className="pb-2 text-xs font-medium">Statut transfert</th>
                      {(canEditPlayer || canManageContracts) && (
                        <th className="pb-2 text-xs font-medium text-right">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((player) => {
                      const ts = transferStatus(player);
                      const isFocus = focusPlayer?.id === player.id;
                      return (
                        <tr
                          key={player.id}
                          className="cursor-pointer transition-colors hover:bg-white/[0.03]"
                          style={{
                            borderTop: "1px solid var(--surface-panel-border)",
                            background: isFocus ? "rgba(255,107,87,0.06)" : undefined,
                          }}
                          onClick={() => setFocusId(player.id)}
                        >
                          <td className="py-3 pr-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selected.includes(player.id)}
                              onChange={() => toggleCompare(player.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                            {player.name}
                          </td>
                          <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                            {formatMarketValue(player.marketValue)}
                          </td>
                          <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                            {formatSalaryAmount(player.contract?.salary)}
                          </td>
                          <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                            {contractEndForPlayer(player.name, contracts)}
                          </td>
                          <td className="py-3 text-right font-semibold" style={{ color: "var(--accent)" }}>
                            {player.ovr}
                          </td>
                          <td className="py-3">
                            <Badge tone={TRANSFER_TONE[ts]}>{ts}</Badge>
                          </td>
                          {(canEditPlayer || canManageContracts) && (
                            <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-1">
                                {canEditPlayer && (
                                  <button
                                    type="button"
                                    title="Modifier joueur"
                                    onClick={() => {
                                      setFocusId(player.id);
                                      setEditPlayer(player);
                                    }}
                                    className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
                                    style={{ color: "#FF6B57" }}
                                  >
                                    <Pencil size={14} />
                                  </button>
                                )}
                                {canManageContracts && (
                      <button
                        type="button"
                                    title={findContractForPlayer(player.name, contracts) ? "Modifier contrat" : "Ajouter contrat"}
                                    onClick={() => openContractModal(player)}
                        className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
                                    style={{ color: "#6366F1" }}
                      >
                        <FileSignature size={14} />
                      </button>
                                )}
                    </div>
                  </td>
                          )}
                        </tr>
                      );
                    })}
            </tbody>
          </table>
        </div>

              {canEditPlayer && focusPlayer && (
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPlayer(focusPlayer)}
                    className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                    style={{ borderColor: "rgba(255,107,87,0.4)", color: "#FF6B57" }}
                  >
                    <Pencil size={12} /> Modifier {focusPlayer.name}
                  </button>
                  {canManageContracts && (
                    <button
                      type="button"
                      onClick={() => openContractModal(focusPlayer)}
                      className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                      style={{ borderColor: "rgba(99,102,241,0.4)", color: "#6366F1" }}
                    >
                      <FileSignature size={12} />
                      {focusContract ? "Modifier contrat" : "Ajouter contrat"}
                    </button>
                  )}
                </div>
              )}
            </GlassCard>
          </>
        )}
      </div>

      <AnimatePresence>
        {compareOpen && comparePlayers.length === 2 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCompareOpen(false)} />
            <motion.div
              className="relative w-full max-w-lg rounded-[20px] border p-6"
              style={{ background: "rgba(15,29,58,0.95)", borderColor: "var(--surface-panel-border)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
                  {comparePlayers[0]!.name.split(" ")[0]} vs {comparePlayers[1]!.name.split(" ")[0]}
                </h3>
                <button type="button" onClick={() => setCompareOpen(false)}>
                  <X size={18} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                  <Radar
                    name={comparePlayers[0]!.name.split(" ")[0]}
                    dataKey={comparePlayers[0]!.name.split(" ")[0]}
                    stroke="#FF6B57"
                    fill="#FF6B57"
                    fillOpacity={0.2}
                    animationDuration={1000}
                  />
                  <Radar
                    name={comparePlayers[1]!.name.split(" ")[0]}
                    dataKey={comparePlayers[1]!.name.split(" ")[0]}
                    stroke="#6366F1"
                    fill="#6366F1"
                    fillOpacity={0.2}
                    animationDuration={1000}
                  />
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
              const created = (await clubApi.createPlayer(buildPlayerPayload(v))) as Record<string, unknown>;
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
        {contractModal && (
          <ContractFormModal
            holders={rosterHolders}
            defaultHolder={contractModal.player.name}
            lockHolder
            title={contractModal.mode === "edit" ? `Modifier contrat — ${contractModal.player.name}` : `Nouveau contrat — ${contractModal.player.name}`}
            initialValues={
              contractModal.contract
                ? {
                    startDate: toInputDate(contractModal.contract.startDate),
                    endDate: toInputDate(contractModal.contract.endDate),
                    salaryMonthly: String(contractModal.contract.salaryMonthly ?? parseSalary(contractModal.player.contract?.salary)),
                    bonus: String(contractModal.contract.bonus ?? 0),
                    releaseClause: contractModal.contract.releaseClause ?? "",
                  }
                : {
                    salaryMonthly: String(parseSalary(contractModal.player.contract?.salary)),
                  }
            }
            onClose={() => setContractModal(null)}
            onSubmit={submitContract}
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
    </ClubPageTransition>
  );
}
