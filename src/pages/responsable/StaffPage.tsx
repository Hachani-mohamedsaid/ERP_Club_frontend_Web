import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, ArrowRightLeft, Users, Shield, Activity, CheckCircle2 } from "lucide-react";
import { RPage, RCard, RHeader, RSection, RRow, RPills, RBtn, RKpiCard, RSearch, pageVariants, cardVariants } from "../../components/responsable";

type StaffRole = "Coach" | "Médecin" | "Préparateur" | "Analyste" | "Kiné" | "Scout";

interface StaffMember {
  id: string; name: string; role: StaffRole; team: string; phone: string; email: string;
  status: "Actif" | "Absent"; since: string;
}

const ROLE_COLOR: Record<StaffRole, string> = {
  Coach:       "#FF7A00",
  Médecin:     "#EF4444",
  Préparateur: "#3B82F6",
  Analyste:    "#8B5CF6",
  Kiné:        "#10B981",
  Scout:       "#F59E0B",
};

const INITIAL_STAFF: StaffMember[] = [
  { id: "s1", name: "Sonia Baccouche",  role: "Coach",       team: "Équipe 1ère",    phone: "+216 99 001 001", email: "sonia@fc.tn",   status: "Actif",  since: "2022" },
  { id: "s2", name: "Nabil Gharbi",     role: "Coach",       team: "Équipe U21",     phone: "+216 99 001 002", email: "nabil@fc.tn",   status: "Actif",  since: "2023" },
  { id: "s3", name: "Ines Mejri",       role: "Médecin",     team: "Staff médical",  phone: "+216 99 001 003", email: "ines@fc.tn",    status: "Actif",  since: "2021" },
  { id: "s4", name: "Karim Saidi",      role: "Kiné",        team: "Staff médical",  phone: "+216 99 001 004", email: "karim@fc.tn",   status: "Actif",  since: "2024" },
  { id: "s5", name: "Rami Ben Slimane", role: "Analyste",    team: "Data & Vidéo",   phone: "+216 99 001 005", email: "rami@fc.tn",    status: "Actif",  since: "2023" },
  { id: "s6", name: "Tarek Bouzid",     role: "Scout",       team: "Recrutement",    phone: "+216 99 001 006", email: "tarek@fc.tn",   status: "Absent", since: "2022" },
  { id: "s7", name: "Ahmed Dridi",      role: "Préparateur", team: "Équipe 1ère",    phone: "+216 99 001 007", email: "ahmed@fc.tn",   status: "Actif",  since: "2023" },
];

const ROLES: StaffRole[] = ["Coach", "Médecin", "Préparateur", "Analyste", "Kiné", "Scout"];
const ALL_FILTERS = ["Tous", ...ROLES];

const EMPTY_FORM = { name: "", role: "Coach" as StaffRole, team: "", phone: "", email: "" };

export function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | "transfer" | null>(null);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = staff.filter(s => {
    const matchesRole = filter === "Tous" || s.role === filter;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.team.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditing(null);
    setModal("add");
  }
  function openEdit(s: StaffMember) {
    setForm({ name: s.name, role: s.role, team: s.team, phone: s.phone, email: s.email });
    setEditing(s);
    setModal("edit");
  }
  function saveForm() {
    if (!form.name) return;
    if (editing) {
      setStaff(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s));
    } else {
      const newS: StaffMember = { ...form, id: `s${Date.now()}`, status: "Actif", since: "2026" };
      setStaff(prev => [newS, ...prev]);
    }
    setModal(null);
  }
  function deleteStaff(id: string) {
    setStaff(prev => prev.filter(s => s.id !== id));
  }

  return (
    <RPage>
      <RHeader
        title="Gestion Staff"
        subtitle="Coaches, médecins, analystes et personnel du club."
        action={<RBtn onClick={openAdd}><Plus size={14} /> Ajouter membre</RBtn>}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <RKpiCard label="Total staff"  value={String(staff.length)}                                    icon={Users}    color="#3B82F6" />
        <RKpiCard label="Actifs"       value={String(staff.filter(s => s.status === "Actif").length)}   icon={Activity} color="#22C55E" />
        <RKpiCard label="Coaches"      value={String(staff.filter(s => s.role === "Coach").length)}     icon={Shield}   color="#FF7A00" />
        <RKpiCard label="Staff médical"value={String(staff.filter(s => ["Médecin","Kiné"].includes(s.role)).length)} icon={CheckCircle2} color="#EF4444" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <RSearch value={search} onChange={setSearch} placeholder="Rechercher nom, équipe..." />
        </div>
        <RPills options={["Tous", ...ROLES]} value={filter} onChange={setFilter} />
      </div>

      <RSection title="Membres du staff" subtitle={`${filtered.length} membre${filtered.length > 1 ? "s" : ""}`}>
        <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-2" variants={pageVariants} initial="hidden" animate="visible">
          {filtered.map(s => {
            const color = ROLE_COLOR[s.role];
            return (
              <motion.div key={s.id} variants={cardVariants}>
                <RCard>
                  <div className="flex items-start gap-3">
                    <motion.div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold text-white"
                      style={{ background: `${color}22`, color }}
                      animate={{ boxShadow: s.status === "Actif" ? [`0 0 0px ${color}00`, `0 0 14px ${color}50`, `0 0 0px ${color}00`] : "none" }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    >
                      {s.name.split(" ").map(n => n[0]).join("")}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold" style={{ color: "var(--text-primary)" }}>{s.name}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.team} · Depuis {s.since}</p>
                        </div>
                        <div className="flex gap-1">
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: `${color}18`, color }}>
                            {s.role}
                          </span>
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: s.status === "Actif" ? "rgba(34,197,94,0.15)" : "rgba(100,116,139,0.15)", color: s.status === "Actif" ? "#22C55E" : "#64748B" }}>
                            {s.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                        <span>{s.phone}</span>
                        <span className="truncate">{s.email}</span>
                      </div>
                      <div className="mt-3 flex gap-1.5">
                        <RBtn onClick={() => openEdit(s)} variant="ghost"><Pencil size={11} /> Modifier</RBtn>
                        <RBtn onClick={() => deleteStaff(s.id)} variant="danger"><Trash2 size={11} /> Supprimer</RBtn>
                        <RBtn variant="ghost"><ArrowRightLeft size={11} /> Affecter</RBtn>
                      </div>
                    </div>
                  </div>
                </RCard>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-2 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Aucun membre trouvé
            </div>
          )}
        </motion.div>
      </RSection>

      {/* Modal add/edit */}
      <AnimatePresence>
        {(modal === "add" || modal === "edit") && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-md rounded-[24px] border p-6"
              style={{ background: "rgba(10,16,30,0.97)", borderColor: "rgba(255,122,0,0.3)" }}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                {modal === "add" ? "Ajouter membre staff" : "Modifier membre"}
              </h3>
              <div className="space-y-3">
                {[
                  { key: "name",  label: "Nom complet",  placeholder: "Ex: Ahmed Dridi" },
                  { key: "team",  label: "Équipe",       placeholder: "Ex: Équipe 1ère" },
                  { key: "phone", label: "Téléphone",    placeholder: "+216 99 000 000" },
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
                    onChange={e => setForm(prev => ({ ...prev, role: e.target.value as StaffRole }))}
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
