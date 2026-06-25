import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { usePermissions } from "../../hooks/usePermissions";
import { enrichPlayersWithAccounts } from "../../lib/playerAccountLink";
import {
  CLUB_MEMBER_ROLE_LABELS,
  CLUB_MEMBER_ROLE_COLORS,
  type ClubMemberRoleLabel,
} from "../../data/clubMemberRoles";
import {
  Plus, Search, Pencil, Ban, ArrowRightLeft, Eye,
  Users, UserCheck, UserX, Shield, X, Save, Trash2, KeyRound,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */
type Role = ClubMemberRoleLabel;
type Status = "Actif" | "Suspendu" | "Inactif";

interface ClubUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastLogin: string;
  createdAt: string;
  password?: string;
  clubPlayerId?: string | null;
}

const ROLES = CLUB_MEMBER_ROLE_LABELS;
const ROLE_COLOR = CLUB_MEMBER_ROLE_COLORS as Record<Role, string>;

const STATUS_COLOR: Record<Status, string> = {
  Actif:    "#22C55E",
  Suspendu: "#FF6B57",
  Inactif:  "#64748B",
};

/* ── Helpers ────────────────────────────────────────────────────── */
function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

/* ── Modal ──────────────────────────────────────────────────────── */
function UserModal({
  user,
  players,
  onClose,
  onSave,
}: {
  user: Partial<ClubUser> | null;
  players: ReturnType<typeof enrichPlayersWithAccounts>;
  onClose: () => void;
  onSave: (u: Partial<ClubUser>) => void;
}) {
  const [form, setForm] = useState<Partial<ClubUser>>(user ?? { role: "Coach", status: "Actif" });
  const isEdit = Boolean(user?.id);
  const isJoueur = form.role === "Joueur";
  const withAccount = players.filter((p) => p.hasAccount);
  const withoutAccount = players.filter((p) => !p.hasAccount);
  const selectedPlayer = players.find((p) => p.id === form.clubPlayerId);

  useEffect(() => {
    setForm(user ?? { role: "Coach", status: "Actif" });
  }, [user]);

  useEffect(() => {
    if (!isJoueur || isEdit) return;
    if (form.clubPlayerId && selectedPlayer) {
      setForm((prev) => ({ ...prev, name: selectedPlayer.name }));
    }
  }, [form.clubPlayerId, isJoueur, isEdit, selectedPlayer]);

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
        className="w-full max-w-md rounded-[24px] border p-6"
        style={{ background: "rgba(10,18,40,0.98)", borderColor: "rgba(255,107,87,0.25)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#FF6B57" }}>
              {isEdit ? "Modifier" : "Ajouter"}
            </span>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
              {isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-white/10">
            <X size={18} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="space-y-4">
          {isJoueur && !isEdit ? (
            <>
              {withAccount.length > 0 && (
                <div className="rounded-xl border p-3" style={{ borderColor: "rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.06)" }}>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#22C55E" }}>
                    Joueurs avec compte ({withAccount.length})
                  </p>
                  <div className="max-h-24 space-y-1 overflow-y-auto">
                    {withAccount.map((p) => (
                      <p key={p.id} className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {p.name} — {p.accountEmail ?? "compte actif"}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Joueur (effectif)
                </label>
                {withoutAccount.length === 0 ? (
                  <p className="rounded-xl border px-4 py-3 text-xs" style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
                    Tous les joueurs de l&apos;effectif ont déjà un compte. Ajoutez d&apos;abord un joueur dans Gestion Joueurs.
                  </p>
                ) : (
                  <select
                    value={form.clubPlayerId ?? ""}
                    onChange={(e) => {
                      const p = players.find((x) => x.id === e.target.value);
                      setForm((prev) => ({
                        ...prev,
                        clubPlayerId: e.target.value,
                        name: p?.name ?? prev.name,
                      }));
                    }}
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
                  >
                    <option value="">Sélectionner un joueur sans compte…</option>
                    {withoutAccount.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.position ?? "—"})</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Nom complet</label>
                <input
                  type="text"
                  value={form.name ?? ""}
                  readOnly
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none opacity-80"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Email (Gmail)</label>
                <input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
                  placeholder="joueur@gmail.com"
                />
              </div>
            </>
          ) : (
            (["name", "email"] as const).map((field) => (
              <div key={field}>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  {field === "name" ? "Nom complet" : "Email"}
                </label>
                <input
                  type={field === "email" ? "email" : "text"}
                  value={form[field] ?? ""}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
                  placeholder={field === "name" ? "Ahmed Ben Salah" : "ahmed@club.tn"}
                />
              </div>
            ))
          )}

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Rôle</label>
            <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-1">
              {ROLES.map((r) => {
                const color = ROLE_COLOR[r];
                const selected = form.role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, role: r, ...(r !== "Joueur" ? { clubPlayerId: undefined } : {}) })}
                    className="rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-all"
                    style={{
                      background: selected ? `${color}22` : "rgba(255,255,255,0.03)",
                      borderColor: selected ? `${color}80` : "rgba(255,255,255,0.08)",
                      color: selected ? color : "var(--text-muted)",
                      boxShadow: selected ? `0 0 12px ${color}30` : "none",
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Statut</label>
              <div className="flex gap-2">
                {(["Actif", "Suspendu", "Inactif"] as Status[]).map((s) => (
                  <button
                    key={s} type="button"
                    onClick={() => setForm({ ...form, status: s })}
                    className="flex-1 rounded-xl py-2 text-xs font-semibold transition-all"
                    style={{
                      background: form.status === s ? `${STATUS_COLOR[s]}20` : "rgba(255,255,255,0.04)",
                      color: form.status === s ? STATUS_COLOR[s] : "var(--text-muted)",
                      border: `1px solid ${form.status === s ? STATUS_COLOR[s] + "60" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isEdit && (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Mot de passe temporaire</label>
              <input
                type="password"
                value={form.password ?? ""}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
                placeholder="••••••••••"
                minLength={8}
                required
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
            Annuler
          </button>
          <motion.button
            type="button"
            onClick={() => {
              if (!isEdit && isJoueur && !form.clubPlayerId) {
                alert("Sélectionnez un joueur de l'effectif sans compte.");
                return;
              }
              onSave(form);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)", boxShadow: "0 0 20px rgba(255,107,87,0.4)" }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          >
            <Save size={14} /> {isEdit ? "Sauvegarder" : "Créer"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── View drawer ────────────────────────────────────────────────── */
function UserViewDrawer({
  user,
  onClose,
  onEdit,
  onResetPwd,
  onDelete,
  canEdit,
  canDelete,
}: {
  user: ClubUser;
  onClose: () => void;
  onEdit: () => void;
  onResetPwd: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative flex h-full w-full max-w-md flex-col border-l p-6"
        style={{ background: "rgba(10,18,40,0.98)", borderColor: "rgba(255,107,87,0.2)" }}
        initial={{ x: 80 }} animate={{ x: 0 }} exit={{ x: 80 }}
      >
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg,${ROLE_COLOR[user.role]},${ROLE_COLOR[user.role]}80)` }}
            >
              {initials(user.name)}
            </div>
            <div>
              <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>{user.name}</h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user.email}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10">
            <X size={18} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {[
            { label: "Rôle", value: user.role, color: ROLE_COLOR[user.role] },
            { label: "Statut", value: user.status, color: STATUS_COLOR[user.status] },
            { label: "Dernière connexion", value: user.lastLogin },
            { label: "Créé le", value: user.createdAt },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className="mt-1 font-semibold" style={{ color: color ?? "var(--text-primary)" }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-6">
          {canEdit && (
            <>
              <button type="button" onClick={onEdit}
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
                style={{ background: "rgba(59,130,246,0.15)", color: "#3B82F6" }}>
                <Pencil size={14} /> Modifier
              </button>
              <button type="button" onClick={onResetPwd}
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
                style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                <KeyRound size={14} /> Réinitialiser le mot de passe
              </button>
            </>
          )}
          {canDelete && user.role !== "Club Admin" && (
            <button type="button" onClick={onDelete}
              className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
              style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>
              <Trash2 size={14} /> Supprimer
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Role change modal ──────────────────────────────────────────── */
function RoleChangeModal({
  user,
  onClose,
  onSave,
}: {
  user: ClubUser;
  onClose: () => void;
  onSave: (role: Role) => void;
}) {
  const [role, setRole] = useState<Role>(user.role);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm rounded-[24px] border p-6"
        style={{ background: "rgba(10,18,40,0.98)", borderColor: "rgba(255,107,87,0.25)" }}
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Changer le rôle</h2>
        <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>{user.name}</p>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.filter((r) => r !== "Club Admin").map((r) => {
            const color = ROLE_COLOR[r];
            const selected = role === r;
            return (
              <button
                key={r} type="button" onClick={() => setRole(r)}
                className="rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-all"
                style={{
                  background: selected ? `${color}22` : "rgba(255,255,255,0.03)",
                  borderColor: selected ? `${color}80` : "rgba(255,255,255,0.08)",
                  color: selected ? color : "var(--text-muted)",
                }}
              >
                {r}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm" style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
            Annuler
          </button>
          <button type="button" onClick={() => onSave(role)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}>
            <ArrowRightLeft size={14} /> Appliquer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main page ──────────────────────────────────────────────────── */
export function ClubUtilisateursPage() {
  const { can } = usePermissions();
  const { data: members, loading, error, reload } = useClubResource(() => clubApi.getMembers() as Promise<ClubUser[]>);
  const { data: playersRaw } = useClubResource(() => clubApi.getPlayers());
  const users = members ?? [];
  const players = useMemo(() => {
    const raw = Array.isArray(playersRaw) ? playersRaw : [];
    const base = raw.map((p) => {
      const row = p as Record<string, unknown>;
      return {
        id: String(row.id ?? ""),
        name: String(row.name ?? row.fullName ?? ""),
        position: String(row.position ?? ""),
        hasAccount: Boolean(row.hasAccount),
        accountEmail: row.accountEmail ? String(row.accountEmail) : null,
      };
    });
    return enrichPlayersWithAccounts(base, users);
  }, [playersRaw, users]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"Tous" | Role>("Tous");
  const [modalUser, setModalUser] = useState<Partial<ClubUser> | null | undefined>(undefined);
  const [viewUser, setViewUser] = useState<ClubUser | null>(null);
  const [roleUser, setRoleUser] = useState<ClubUser | null>(null);
  const [resetId, setResetId] = useState<string | null>(null);

  const filtered = useMemo(
    () => users.filter((u) => {
      const q = search.toLowerCase();
      return (roleFilter === "Tous" || u.role === roleFilter)
        && (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }),
    [users, search, roleFilter],
  );

  const kpis = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === "Actif").length,
    suspended: users.filter((u) => u.status === "Suspendu").length,
    roles: new Set(users.map((u) => u.role)).size,
  }), [users]);

  async function handleSave(form: Partial<ClubUser>) {
    try {
      if (form.id) {
        await clubApi.updateMember(form.id, {
          fullName: form.name,
          email: form.email,
          clubRole: form.role,
          status: form.status,
        });
      } else {
        if (!form.password || form.password.length < 8) {
          alert("Le mot de passe temporaire doit contenir au moins 8 caractères.");
          return;
        }
        await clubApi.createMember({
          fullName: form.name,
          email: form.email,
          clubRole: form.role,
          password: form.password,
          ...(form.role === "Joueur" && form.clubPlayerId ? { clubPlayerId: form.clubPlayerId } : {}),
        });
      }
      await reload();
      setModalUser(undefined);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  }

  async function changeRole(id: string, role: Role) {
    try {
      await clubApi.updateMember(id, { clubRole: role });
      await reload();
      setRoleUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  }

  async function toggleStatus(id: string) {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    const next = u.status === "Actif" ? "Suspendu" : "Actif";
    try {
      await clubApi.updateMember(id, { status: next });
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
      await clubApi.deleteMember(id);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  }

  return (
    <ClubPageTransition>
      {/* Header */}
      <ClubKpiCard hover={false}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#FF6B57" }}>Admin Club</span>
            <h1 className="mt-1 text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Gestion des utilisateurs</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Ajout, rôles et accès de l'équipe du club.</p>
          </div>
          {can("Parametres", "créer") && (
          <motion.button
            type="button" onClick={() => setModalUser({})}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)", boxShadow: "0 0 20px rgba(255,107,87,0.35)" }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
          >
            <Plus size={15} /> Ajouter utilisateur
          </motion.button>
          )}
        </div>
      </ClubKpiCard>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: kpis.total, icon: Users, color: "#FF6B57" },
          { label: "Actifs", value: kpis.active, icon: UserCheck, color: "#22C55E" },
          { label: "Suspendus", value: kpis.suspended, icon: UserX, color: "#EF4444" },
          { label: "Rôles", value: kpis.roles, icon: Shield, color: "#3B82F6" },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <ClubKpiCard key={label} delay={i * 0.07}>
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${color}1f` }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{value}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
          </ClubKpiCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher utilisateur..."
            className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["Tous", ...ROLES] as const).map((r) => (
            <motion.button
              key={r} type="button" onClick={() => setRoleFilter(r as "Tous" | Role)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold"
              style={{
                background: roleFilter === r ? `${ROLE_COLOR[r as Role] ?? "#FF6B57"}20` : "rgba(255,255,255,0.04)",
                color: roleFilter === r ? (ROLE_COLOR[r as Role] ?? "#FF6B57") : "var(--text-muted)",
                border: `1px solid ${roleFilter === r ? (ROLE_COLOR[r as Role] ?? "#FF6B57") + "50" : "rgba(255,255,255,0.08)"}`,
              }}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
            >
              {r}
            </motion.button>
          ))}
        </div>
      </div>

      {/* User table */}
      <ClubKpiCard hover={false}>
        {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <ClubEmptyState title="Aucun utilisateur" description="Ajoutez des membres de l'équipe via le bouton +." />
        )}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ delay: i * 0.04 }}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}
              >
                {/* Avatar + info */}
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg,${ROLE_COLOR[user.role]},${ROLE_COLOR[user.role]}80)` }}
                    animate={{ boxShadow: user.status === "Actif" ? [`0 0 0px ${ROLE_COLOR[user.role]}00`, `0 0 12px ${ROLE_COLOR[user.role]}50`, `0 0 0px ${ROLE_COLOR[user.role]}00`] : [] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    {initials(user.name)}
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{user.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user.email}</p>
                  </div>
                </div>

                {/* Role + Status + Last login */}
                <div className="flex items-center gap-3">
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ background: `${ROLE_COLOR[user.role]}18`, color: ROLE_COLOR[user.role] }}>
                    {user.role}
                  </span>
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ background: `${STATUS_COLOR[user.status]}18`, color: STATUS_COLOR[user.status] }}>
                    {user.status}
                  </span>
                  <span className="hidden text-xs sm:block" style={{ color: "var(--text-muted)" }}>
                    {user.lastLogin}
                  </span>
                </div>

                {/* Actions — même style que ClubJoueursPage */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Voir la fiche"
                    onClick={() => setViewUser(user)}
                    className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
                    style={{ color: "#FF6B57" }}
                  >
                    <Eye size={14} />
                  </button>
                  {can("Parametres", "modifier") && user.role !== "Club Admin" && (
                    <>
                      <button
                        type="button"
                        title="Modifier"
                        onClick={() => setModalUser(user)}
                        className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        title={user.status === "Actif" ? "Suspendre" : "Réactiver"}
                        onClick={() => toggleStatus(user.id)}
                        className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
                        style={{ color: user.status === "Actif" ? "var(--text-muted)" : "#FF6B57" }}
                      >
                        <Ban size={14} />
                      </button>
                      <button
                        type="button"
                        title="Changer le rôle"
                        onClick={() => setRoleUser(user)}
                        className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <ArrowRightLeft size={14} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-12 text-center" style={{ color: "var(--text-muted)" }}>
              <Users size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      </ClubKpiCard>

      {/* View drawer */}
      <AnimatePresence>
        {viewUser && (
          <UserViewDrawer
            user={viewUser}
            onClose={() => setViewUser(null)}
            onEdit={() => { setModalUser(viewUser); setViewUser(null); }}
            onResetPwd={() => { setResetId(viewUser.id); setViewUser(null); }}
            onDelete={() => { deleteUser(viewUser.id); setViewUser(null); }}
            canEdit={can("Parametres", "modifier")}
            canDelete={can("Parametres", "supprimer")}
          />
        )}
      </AnimatePresence>

      {/* Role change modal */}
      <AnimatePresence>
        {roleUser && (
          <RoleChangeModal
            user={roleUser}
            onClose={() => setRoleUser(null)}
            onSave={(role) => changeRole(roleUser.id, role)}
          />
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalUser !== undefined && (
          <UserModal
            user={modalUser}
            players={players}
            onClose={() => setModalUser(undefined)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      {/* Reset password toast */}
      <AnimatePresence>
        {resetId && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-2xl"
            style={{ background: "rgba(10,18,40,0.97)", borderColor: "rgba(245,158,11,0.4)", boxShadow: "0 0 30px rgba(245,158,11,0.15)" }}
          >
            <KeyRound size={16} style={{ color: "#F59E0B" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Email de réinitialisation envoyé à <strong>{users.find((u) => u.id === resetId)?.email}</strong>
            </p>
            <button type="button" onClick={() => setResetId(null)}>
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ClubPageTransition>
  );
}
