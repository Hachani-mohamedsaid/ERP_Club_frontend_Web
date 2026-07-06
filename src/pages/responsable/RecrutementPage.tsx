import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Star, Handshake, FileText, Plus, Search,
  Eye, CheckCircle2, Flag, X, Save,
} from "lucide-react";
import { RPage, RCard, RHeader, RSection, RRow, RPills, RBtn, RKpiCard, RSearch, pageVariants, cardVariants } from "../../components/responsable";
import { responsableApi } from "../../lib/api/responsable";
import { useClubResource } from "../../hooks/useClubResource";

interface Prospect {
  id: string;
  name: string;
  age: number;
  pos: string;
  club: string;
  nat: string;
  potential: number;
  score: number;
  status: string;
  note: string;
}

const POSITIONS = ["GB", "DG", "DC", "DD", "MC", "MOC", "MDF", "AG", "AD", "BU", "ST"] as const;

const STATUS_COLOR: Record<string, string> = {
  "Shortlisté":    "#22C55E",
  "En observation":"#3B82F6",
  "Contacté":      "#FF7A00",
  "Non traité":    "#64748B",
  "Refusé":        "#EF4444",
};

const TABS = ["Prospects", "Shortlist", "Agents", "Rapports Scouting"] as const;
type Tab = (typeof TABS)[number];

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11}
          style={{ color: i <= Math.round(value) ? "#F59E0B" : "rgba(255,255,255,0.15)" }}
          fill={i <= Math.round(value) ? "#F59E0B" : "none"} />
      ))}
    </div>
  );
}

function ProspectAddModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    position: "ST",
    club: "",
    nat: "TN",
    potential: "75",
    score: "70",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[24px] border p-6"
        style={{ background: "var(--surface-panel-solid)", borderColor: "rgba(255,122,0,0.3)" }}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Ajouter un prospect</h2>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {[
            { key: "fullName", label: "Nom complet", type: "text", placeholder: "Youssef Ben Ali" },
            { key: "age", label: "Âge", type: "number", placeholder: "19" },
            { key: "club", label: "Club actuel", type: "text", placeholder: "AS Ariana" },
            { key: "nat", label: "Nationalité", type: "text", placeholder: "TN" },
            { key: "potential", label: "Potentiel (0-99)", type: "number", placeholder: "85" },
            { key: "score", label: "Score scout (0-99)", type: "number", placeholder: "78" },
          ].map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {f.label}
              </label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
              />
            </div>
          ))}

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Poste</label>
            <select
              value={form.position}
              onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(30,35,50,0.97)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
            >
              {POSITIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Notes scouting</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Profil, points forts, observations..."
              className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            if (!form.fullName.trim()) {
              alert("Le nom du prospect est requis.");
              return;
            }
            setSaving(true);
            try {
              await onSubmit(form);
              onClose();
            } catch (err) {
              alert(err instanceof Error ? err.message : "Erreur lors de l'ajout.");
            } finally {
              setSaving(false);
            }
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#FF7A00,#E66000)" }}
        >
          <Save size={14} /> {saving ? "Enregistrement…" : "Enregistrer le prospect"}
        </button>
      </motion.div>
    </motion.div>
  );
}

function ProspectReportModal({
  prospect,
  onClose,
  onSave,
}: {
  prospect: Prospect;
  onClose: () => void;
  onSave: (id: string, values: { notes: string; score: number; potential: number }) => Promise<void>;
}) {
  const [notes, setNotes] = useState(prospect.note || "");
  const [score, setScore] = useState(String(prospect.score));
  const [potential, setPotential] = useState(String(prospect.potential));
  const [saving, setSaving] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg rounded-[24px] border p-6"
        style={{ background: "var(--surface-panel-solid)", borderColor: "rgba(139,92,246,0.35)" }}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: "#8B5CF6" }}>Rapport scouting</p>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>{prospect.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          {[
            ["Poste", prospect.pos],
            ["Âge", `${prospect.age} ans`],
            ["Club", prospect.club],
            ["Nationalité", prospect.nat],
            ["Statut", prospect.status],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border px-3 py-2" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Score scout</label>
              <input
                type="number"
                min={0}
                max={99}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Potentiel</label>
              <input
                type="number"
                min={0}
                max={99}
                value={potential}
                onChange={(e) => setPotential(e.target.value)}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Analyse / notes</label>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Points forts, axes d'amélioration, recommandation..."
              className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
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
            Fermer
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave(prospect.id, {
                  notes,
                  score: Number(score) || 0,
                  potential: Number(potential) || 0,
                });
                onClose();
              } catch (err) {
                alert(err instanceof Error ? err.message : "Erreur");
              } finally {
                setSaving(false);
              }
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}
          >
            <Save size={14} /> {saving ? "Enregistrement…" : "Enregistrer le rapport"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function RecrutementPage() {
  const { data: PROSPECTS, loading, reload } = useClubResource(
    () => responsableApi.getProspects() as Promise<Prospect[]>,
  );

  const prospects = PROSPECTS ?? [];
  const SHORTLIST = prospects.filter((p) => p.status === "Shortlisté" || p.status === "Contacté");
  const AGENTS: { id: string; name: string; agency: string; speciality: string; deals: number; rating: number; phone: string }[] = [];
  const REPORTS: { id: string; prospect: string; scout: string; date: string; rating: number; file: string }[] = [];

  const [activeTab, setActiveTab] = useState<Tab>("Prospects");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [reportProspect, setReportProspect] = useState<Prospect | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  }

  async function shortlistProspect(p: Prospect) {
    if (p.status === "Shortlisté" || p.status === "Contacté") {
      setActiveTab("Shortlist");
      showToast(`${p.name} est déjà dans la shortlist.`);
      return;
    }
    setBusyId(p.id);
    try {
      await responsableApi.updateProspect(p.id, { status: "Shortlisté" });
      await reload();
      setActiveTab("Shortlist");
      showToast(`${p.name} ajouté à la shortlist.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusyId(null);
    }
  }

  async function saveReport(id: string, values: { notes: string; score: number; potential: number }) {
    await responsableApi.updateProspect(id, values);
    await reload();
    showToast("Rapport scouting enregistré.");
  }

  async function validateFromShortlist(p: Prospect) {
    setBusyId(p.id);
    try {
      await responsableApi.updateProspect(p.id, { status: "Contacté" });
      await reload();
      showToast(`${p.name} marqué comme contacté.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusyId(null);
    }
  }

  const filteredProspects = useMemo(
    () => prospects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.pos.toLowerCase().includes(search.toLowerCase())),
    [search, prospects]
  );

  if (loading) {
    return (
      <RPage>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement du module recrutement…</p>
      </RPage>
    );
  }

  return (
    <RPage>
      <RHeader
        title="Module Recrutement"
        subtitle="Prospects, shortlist, agents et rapports scouting."
        action={
          <RBtn onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Ajouter prospect
          </RBtn>
        }
      />

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-xl border px-4 py-3 text-sm font-medium"
          style={{ background: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.35)", color: "#22C55E" }}
        >
          {toast}
        </motion.div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <RKpiCard label="Prospects"  value={String(prospects.length)} icon={Users}     color="#3B82F6" trend="Base de données" />
        <RKpiCard label="Shortlist"  value={String(SHORTLIST.length)} icon={Star}      color="#F59E0B" trend="Cibles prioritaires" />
        <RKpiCard label="Agents"     value={String(AGENTS.length)}    icon={Handshake} color="#10B981" trend="Réseau actif" />
        <RKpiCard label="Rapports"   value={String(REPORTS.length)}   icon={FileText}  color="#8B5CF6" trend="Ce mois" />
      </div>

      <RPills options={[...TABS]} value={activeTab} onChange={v => setActiveTab(v as Tab)} />

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

          {/* ── Prospects ── */}
          {activeTab === "Prospects" && (
            <div className="space-y-4">
              <RSearch value={search} onChange={setSearch} placeholder="Rechercher prospect, position..." />
              <motion.div className="grid grid-cols-1 gap-4 lg:grid-cols-2" variants={pageVariants} initial="hidden" animate="visible">
                {filteredProspects.length === 0 ? (
                  <RCard>
                    <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
                      Aucun prospect. Cliquez sur « Ajouter prospect » pour commencer.
                    </p>
                  </RCard>
                ) : (
                filteredProspects.map(p => (
                  <motion.div key={p.id} variants={cardVariants}>
                    <RCard>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <motion.div
                            className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black text-white"
                            style={{ background: `linear-gradient(135deg,${STATUS_COLOR[p.status]},${STATUS_COLOR[p.status]}80)` }}
                            animate={{ boxShadow: [`0 0 0px ${STATUS_COLOR[p.status]}00`, `0 0 16px ${STATUS_COLOR[p.status]}50`, `0 0 0px ${STATUS_COLOR[p.status]}00`] }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                          >
                            {p.name.split(" ").map(n => n[0]).join("")}
                          </motion.div>
                          <div>
                            <p className="font-bold" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.pos} · {p.age} ans · {p.club}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <Flag size={10} style={{ color: "var(--text-muted)" }} />
                              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{p.nat}</span>
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                style={{ background: `${STATUS_COLOR[p.status]}18`, color: STATUS_COLOR[p.status] }}>
                                {p.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Potentiel</p>
                          <p className="text-2xl font-extrabold" style={{ color: "var(--accent)" }}>{p.potential}</p>
                          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Score: {p.score}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>{p.note}</p>
                      <div className="mt-3 flex gap-2">
                        <RBtn
                          variant="success"
                          onClick={() => shortlistProspect(p)}
                        >
                          <CheckCircle2 size={12} />
                          {busyId === p.id
                            ? "En cours…"
                            : p.status === "Shortlisté" || p.status === "Contacté"
                              ? "Voir shortlist"
                              : "Shortlister"}
                        </RBtn>
                        <RBtn variant="ghost" onClick={() => setReportProspect(p)}>
                          <Eye size={12} /> Rapport
                        </RBtn>
                      </div>
                    </RCard>
                  </motion.div>
                ))
                )}
              </motion.div>
            </div>
          )}

          {/* ── Shortlist ── */}
          {activeTab === "Shortlist" && (
            <RSection title="Cibles prioritaires" subtitle="Joueurs en phase active de recrutement.">
              <div className="space-y-3">
                {SHORTLIST.length === 0 ? (
                  <RCard>
                    <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
                      Aucun joueur en shortlist. Utilisez « Shortlister » depuis l'onglet Prospects.
                    </p>
                  </RCard>
                ) : (
                SHORTLIST.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                    <RRow>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                            style={{ background: "linear-gradient(135deg,var(--accent),#E66000)" }}>
                            {p.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.pos} · {p.club}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-extrabold" style={{ color: "var(--accent)" }}>{p.potential}</p>
                            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Potentiel</p>
                          </div>
                          <RBtn variant="primary" onClick={() => validateFromShortlist(p)}>
                            <CheckCircle2 size={12} />
                            {busyId === p.id ? "…" : "Valider"}
                          </RBtn>
                          <RBtn variant="ghost" onClick={() => setReportProspect(p)}>
                            <Eye size={12} /> Rapport
                          </RBtn>
                        </div>
                      </div>
                    </RRow>
                  </motion.div>
                ))
                )}
              </div>
            </RSection>
          )}

          {/* ── Agents ── */}
          {activeTab === "Agents" && (
            <RSection title="Réseau d'agents" subtitle="Partenaires et contacts de recrutement.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {AGENTS.map(a => (
                  <RCard key={a.id}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-black"
                        style={{ background: "rgba(255,122,0,0.15)", color: "var(--accent)" }}>
                        {a.name[0]}
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: "var(--text-primary)" }}>{a.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{a.agency}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-muted)" }}>Spécialité</span>
                        <span style={{ color: "var(--text-primary)" }}>{a.speciality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-muted)" }}>Deals</span>
                        <span className="font-semibold" style={{ color: "var(--accent)" }}>{a.deals}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span style={{ color: "var(--text-muted)" }}>Rating</span>
                        <StarRating value={a.rating} />
                      </div>
                    </div>
                    <RBtn variant="ghost" className="mt-4 w-full justify-center text-xs">{a.phone}</RBtn>
                  </RCard>
                ))}
              </div>
            </RSection>
          )}

          {/* ── Rapports Scouting ── */}
          {activeTab === "Rapports Scouting" && (
            <RSection title="Rapports Scouting" subtitle="Analyses détaillées par nos scouts." action={<RBtn><Plus size={13} /> Nouveau rapport</RBtn>}>
              <div className="space-y-3">
                {REPORTS.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <RRow>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(139,92,246,0.15)" }}>
                            <FileText size={14} style={{ color: "#8B5CF6" }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{r.prospect}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Scout: {r.scout} · {r.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-extrabold" style={{ color: "#F59E0B" }}>{r.rating}/10</p>
                            <StarRating value={r.rating / 2} />
                          </div>
                          <RBtn variant="ghost"><Eye size={12} /> Voir</RBtn>
                        </div>
                      </div>
                    </RRow>
                  </motion.div>
                ))}
              </div>
            </RSection>
          )}

        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {reportProspect && (
          <ProspectReportModal
            prospect={reportProspect}
            onClose={() => setReportProspect(null)}
            onSave={saveReport}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdd && (
          <ProspectAddModal
            onClose={() => setShowAdd(false)}
            onSubmit={async (values) => {
              await responsableApi.createProspect({
                fullName: values.fullName,
                name: values.fullName,
                age: Number(values.age) || 0,
                position: values.position,
                externalClub: values.club || "—",
                club: values.club || "—",
                nationality: values.nat || "TN",
                nat: values.nat || "TN",
                potential: Number(values.potential) || 0,
                score: Number(values.score) || 0,
                notes: values.notes || undefined,
                status: "Non traité",
              });
              await reload();
            }}
          />
        )}
      </AnimatePresence>
    </RPage>
  );
}
