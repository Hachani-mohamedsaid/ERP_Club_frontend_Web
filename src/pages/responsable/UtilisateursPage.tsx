import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, UserX, KeyRound, Shield, Users, CheckCircle2, UserCheck } from "lucide-react";
import { RPage, RCard, RHeader, RSection, RRow, RPills, RBtn, RKpiCard, RSearch, pageVariants, cardVariants } from "../../components/responsable";

type UserRole = "Club Admin" | "Coach" | "Médecin" | "Scout" | "Analyste" | "Financier";
type UserStatus = "Actif" | "Désactivé";

interface ClubUser {
  id: string; name: string; email: string; role: UserRole;
  status: UserStatus; lastLogin: string; permissions: string[];
}

const ROLE_COLOR: Record<UserRole, string> = {
  "Club Admin": "#FF7A00",
  Coach:        "#3B82F6",
  Médecin:      "#EF4444",
  Scout:        "#F59E0B",
  Analyste:     "#8B5CF6",
  Financier:    "#10B981",
};

const INIT_USERS: ClubUser[] = [
  { id: "u1", name: "Mohamed Hachani",  email: "m.hachani@fc.tn",  role: "Club Admin", status: "Actif",    lastLogin: "Aujourd'hui 10:30", permissions: ["MANAGE_USERS","MANAGE_STAFF","VIEW_AUDIT"] },
  { id: "u2", name: "Sonia Baccouche",  email: "sonia@fc.tn",      role: "Coach",      status: "Actif",    lastLogin: "Aujourd'hui 09:15", permissions: ["VIEW_PLAYERS","EDIT_TRAININGS","VIEW_MATCHES"] },
  { id: "u3", name: "Ines Mejri",       email: "ines@fc.tn",        role: "Médecin",    status: "Actif",    lastLogin: "Hier 14:20",        permissions: ["VIEW_PLAYERS","VIEW_TEAMS"] },
  { id: "u4", name: "Tarek Bouzid",     email: "tarek@fc.tn",       role: "Scout",      status: "Actif",    lastLogin: "18/06 11:00",       permissions: ["SCOUT_VIEW","SCOUT_CREATE"] },
  { id: "u5", name: "Rami Ben Slimane", email: "rami@fc.tn",        role: "Analyste",   status: "Actif",    lastLogin: "17/06 16:30",       permissions: ["VIEW_PLAYERS","VIEW_REPORTS","VIEW_AI"] },
  { id: "u6", name: "Karim Gharbi",     email: "k.gharbi@fc.tn",   role: "Financier",  status: "Désactivé",lastLogin: "10/06 09:00",       permissions: ["BUDGET_VIEW"] },
];

const ROLES: UserRole[] = ["Club Admin", "Coach", "Médecin", "Scout", "Analyste", "Financier"];
const FILTERS = ["Tous", "Actif", "Désactivé"];

const EMPTY_FORM = { name: "", email: "", role: "Coach" as UserRole };

export function UtilisateursPage() {
  const [users, setUsers] = useState<ClubUser[]>(INIT_USERS);
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | "role" | null>(null);
  const [editing, setEditing] = useState<ClubUser | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState("");

  const filtered = users.filter(u => {
    const matchStatus = filter === "Tous" || u.status === filter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  function toggleStatus(id: string) {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === "Actif" ? "Désactivé" : "Actif" } : u
    ));
  }
  function resetPwd(name: string) {
    setToast(`Mot de passe réinitialisé pour ${name}`);
    setTimeout(() => setToast(""), 3000);
  }
  function openAdd() { setForm(EMPTY_FORM); setEditing(null); setModal("add"); }
  function openEdit(u: ClubUser) { setForm({ name: u.name, email: u.email, role: u.role }); setEditing(u); setModal("edit"); }
  function saveForm() {
    if (!form.name || !form.email) return;
    if (editing) {
      setUsers(prev => prev.map(u => u.id === editing.id ? { ...u, ...form } : u));
    } else {
      const nu: ClubUser = { ...form, id: `u${Date.now()}`, status: "Actif", lastLogin: "Jamais", permissions: [] };
      setUsers(prev => [nu, ...prev]);
    }
    setModal(null);
  }

  return (
    <RPage>
      <RHeader
        title="Gestion Utilisateurs"
        subtitle="Comptes, rôles et accès au sein du club."
        action={<RBtn onClick={openAdd}><Plus size={14} /> Créer compte</RBtn>}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <RKpiCard label="Total"    value={String(users.length)}                                     icon={Users}      color="#3B82F6" />
        <RKpiCard label="Actifs"   value={String(users.filter(u => u.status === "Actif").length)}    icon={UserCheck}  color="#22C55E" />
        <RKpiCard label="Désactivés" value={String(users.filter(u => u.status === "Désactivé").length)} icon={UserX}  color="#EF4444" />
        <RKpiCard label="Rôles"    value={String(ROLES.length)}                                      icon={Shield}     color="#FF7A00" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <RSearch value={search} onChange={setSearch} placeholder="Rechercher nom ou email..." />
        </div>
        <RPills options={FILTERS} value={filter} onChange={setFilter} />
      </div>

      <RSection title="Comptes utilisateurs" subtitle={`${filtered.length} utilisateur${filtered.length > 1 ? "s" : ""}`}>
        <motion.div className="space-y-3" variants={pageVariants} initial="hidden" animate="visible">
          {filtered.map((u, i) => {
            const color = ROLE_COLOR[u.role];
            return (
              <motion.div key={u.id} variants={cardVariants}>
                <RRow>
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-bold text-white text-sm"
                      style={{ background: `${color}22`, color }}
                      animate={u.status === "Actif" ? { boxShadow: [`0 0 0px ${color}00`, `0 0 14px ${color}45`, `0 0 0px ${color}00`] } : {}}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      {u.name.split(" ").map(n => n[0]).join("")}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: `${color}18`, color }}>{u.role}</span>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: u.status === "Actif" ? "rgba(34,197,94,0.15)" : "rgba(100,116,139,0.15)", color: u.status === "Actif" ? "#22C55E" : "#94A3B8" }}>
                          {u.status}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email} · Connexion: {u.lastLogin}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        Permissions: {u.permissions.length > 0 ? u.permissions.slice(0, 2).join(", ") + (u.permissions.length > 2 ? ` +${u.permissions.length - 2}` : "") : "Aucune"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5 flex-wrap justify-end">
                      <RBtn onClick={() => openEdit(u)} variant="ghost"><Pencil size={11} /> Modifier</RBtn>
                      <RBtn onClick={() => resetPwd(u.name)} variant="ghost"><KeyRound size={11} /> Réinit. MDP</RBtn>
                      <RBtn onClick={() => toggleStatus(u.id)} variant={u.status === "Actif" ? "danger" : "success"}>
                        {u.status === "Actif" ? <><UserX size={11} /> Désactiver</> : <><UserCheck size={11} /> Activer</>}
                      </RBtn>
                    </div>
                  </div>
                </RRow>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>Aucun utilisateur trouvé</div>
          )}
        </motion.div>
      </RSection>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white"
            style={{ background: "rgba(34,197,94,0.9)", boxShadow: "0 0 24px rgba(34,197,94,0.4)" }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}>
            <CheckCircle2 size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {(modal === "add" || modal === "edit") && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-md rounded-[24px] border p-6"
              style={{ background: "rgba(10,16,30,0.97)", borderColor: "rgba(255,122,0,0.3)" }}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                {modal === "add" ? "Créer un compte" : "Modifier l'utilisateur"}
              </h3>
              <div className="space-y-3">
                {[
                  { key: "name",  label: "Nom complet", placeholder: "Ex: Karim Ayari" },
                  { key: "email", label: "Email",        placeholder: "email@club.tn" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                    <input placeholder={f.placeholder} value={form[f.key as keyof typeof form] as string}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }} />
                  </div>
                ))}
                <div>
                  <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Rôle</label>
                  <select value={form.role}
                    onChange={e => setForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <RBtn onClick={saveForm}><CheckCircle2 size={14} /> Enregistrer</RBtn>
                <RBtn onClick={() => setModal(null)} variant="ghost">Annuler</RBtn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RPage>
  );
}
