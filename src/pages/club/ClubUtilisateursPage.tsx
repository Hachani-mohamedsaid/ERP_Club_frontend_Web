import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import {
  Plus, Search, Edit2, Trash2, Ban, KeyRound,
  Users, UserCheck, UserX, Shield, X, Save, ChevronDown,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */
type Role = "Club Admin" | "Coach" | "Médecin" | "Responsable Financier" | "Scout" | "Analyste";
type Status = "Actif" | "Suspendu" | "Inactif";

interface ClubUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastLogin: string;
  createdAt: string;
}

/* ── Mock data ──────────────────────────────────────────────────── */
const INITIAL_USERS: ClubUser[] = [
  { id: "u1", name: "Mohamed Hachani",  email: "m.hachani@fc-carthage.tn",  role: "Club Admin",            status: "Actif",    lastLogin: "18/06 09:32", createdAt: "01/01/2024" },
  { id: "u2", name: "Sonia Khelil",     email: "s.khelil@fc-carthage.tn",   role: "Coach",                 status: "Actif",    lastLogin: "18/06 07:50", createdAt: "15/03/2024" },
  { id: "u3", name: "Tarek Bouzid",     email: "t.bouzid@fc-carthage.tn",   role: "Scout",                 status: "Actif",    lastLogin: "17/06 19:21", createdAt: "20/04/2024" },
  { id: "u4", name: "Ines Makni",       email: "i.makni@fc-carthage.tn",    role: "Médecin",               status: "Inactif",  lastLogin: "10/06 14:00", createdAt: "05/05/2024" },
  { id: "u5", name: "Khaled Trabelsi",  email: "k.trabelsi@fc-carthage.tn", role: "Responsable Financier", status: "Actif",    lastLogin: "17/06 11:00", createdAt: "12/02/2024" },
  { id: "u6", name: "Amal Gharbi",      email: "a.gharbi@fc-carthage.tn",   role: "Analyste",              status: "Suspendu", lastLogin: "01/06 09:00", createdAt: "18/03/2024" },
];

const ROLES: Role[] = ["Club Admin", "Coach", "Médecin", "Responsable Financier", "Scout", "Analyste"];

const ROLE_COLOR: Record<Role, string> = {
  "Club Admin":            "#FF6B57",
  "Coach":                 "#3B82F6",
  "Médecin":               "#10B981",
  "Responsable Financier": "#F59E0B",
  "Scout":                 "#8B5CF6",
  "Analyste":              "#EC4899",
};

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
  onClose,
  onSave,
}: {
  user: Partial<ClubUser> | null;
  onClose: () => void;
  onSave: (u: Partial<ClubUser>) => void;
}) {
  const [form, setForm] = useState<Partial<ClubUser>>(user ?? { role: "Coach", status: "Actif" });
  const isEdit = Boolean(user?.id);

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
          {(["name", "email"] as const).map((field) => (
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
          ))}

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Rôle</label>
            <div className="relative">
              <select
                value={form.role ?? "Coach"}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                className="w-full appearance-none rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
              >
                {ROLES.map((r) => <option key={r} value={r} style={{ background: "#0A1228" }}>{r}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
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
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
                placeholder="••••••••••"
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
            type="button" onClick={() => onSave(form)}
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

/* ── Main page ──────────────────────────────────────────────────── */
export function ClubUtilisateursPage() {
  const [users, setUsers] = useState<ClubUser[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"Tous" | Role>("Tous");
  const [modalUser, setModalUser] = useState<Partial<ClubUser> | null | undefined>(undefined);
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

  function handleSave(form: Partial<ClubUser>) {
    if (form.id) {
      setUsers((prev) => prev.map((u) => (u.id === form.id ? { ...u, ...form } as ClubUser : u)));
    } else {
      const newUser: ClubUser = {
        id: `u${Date.now()}`,
        name: form.name ?? "",
        email: form.email ?? "",
        role: form.role ?? "Coach",
        status: "Actif",
        lastLogin: "—",
        createdAt: new Date().toLocaleDateString("fr-FR"),
      };
      setUsers((prev) => [newUser, ...prev]);
    }
    setModalUser(undefined);
  }

  function toggleStatus(id: string) {
    setUsers((prev) => prev.map((u) =>
      u.id === id ? { ...u, status: u.status === "Actif" ? "Suspendu" : "Actif" } : u
    ));
  }

  function deleteUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
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
          <motion.button
            type="button" onClick={() => setModalUser({})}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)", boxShadow: "0 0 20px rgba(255,107,87,0.35)" }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
          >
            <Plus size={15} /> Ajouter utilisateur
          </motion.button>
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

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {[
                    { icon: Edit2, label: "Modifier", onClick: () => setModalUser(user), color: "#3B82F6" },
                    { icon: KeyRound, label: "Reset MDP", onClick: () => setResetId(user.id), color: "#F59E0B" },
                    { icon: Ban, label: user.status === "Actif" ? "Suspendre" : "Réactiver", onClick: () => toggleStatus(user.id), color: "#FF6B57" },
                    { icon: Trash2, label: "Supprimer", onClick: () => deleteUser(user.id), color: "#EF4444" },
                  ].map(({ icon: Icon, label, onClick, color }) => (
                    <motion.button
                      key={label} type="button" onClick={onClick} title={label}
                      className="flex h-8 w-8 items-center justify-center rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                      whileHover={{ background: `${color}18`, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icon size={13} style={{ color: "var(--text-muted)" }} />
                    </motion.button>
                  ))}
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

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalUser !== undefined && (
          <UserModal
            user={modalUser}
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
