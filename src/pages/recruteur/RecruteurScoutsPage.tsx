import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, MapPin, Users, TrendingUp, ChevronRight } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { clubApi } from "../../lib/api/club";
import { scoutApi, type ScoutProspectDto, type ScoutReportDto } from "../../lib/api/scout";

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(5,8,22,0.96)", border: "1px solid rgba(139,92,246,0.3)", color: "white", borderRadius: 12 },
};

interface ClubMemberDto {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Actif" | "Inactif" | "Suspendu";
  lastLogin: string;
  createdAt: string;
}

interface ScoutSummary {
  member: ClubMemberDto;
  players: ScoutProspectDto[];
  reports: ScoutReportDto[];
  validated: number;
  pending: number;
  rate: number;
}

const EMPTY_FORM = { fullName: "", email: "", password: "" };

function genTempPassword() {
  return Math.random().toString(36).slice(-6) + "A1!";
}

function RCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] border p-5 ${className}`}
      style={{ background: "rgba(14,10,35,0.8)", borderColor: "var(--surface-panel-border)" }}>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: ClubMemberDto["status"] }) {
  const colors: Record<ClubMemberDto["status"], string> = {
    "Actif": "#22C55E", "Inactif": "#6B7280", "Suspendu": "#EF4444",
  };
  const c = colors[status];
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ background: `${c}18`, color: c, border: `1px solid ${c}33` }}>
      {status}
    </span>
  );
}

export function RecruteurScoutsPage() {
  const [members, setMembers] = useState<ClubMemberDto[]>([]);
  const [prospects, setProspects] = useState<ScoutProspectDto[]>([]);
  const [reports, setReports] = useState<ScoutReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([clubApi.getMembers() as Promise<ClubMemberDto[]>, scoutApi.getProspects(), scoutApi.getReports()])
      .then(([m, p, r]) => {
        setMembers(m.filter(x => x.role === "Scout"));
        setProspects(p);
        setReports(r);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const scouts: ScoutSummary[] = useMemo(() => members.map(member => {
    const players = prospects.filter(p => p.scoutName === member.name);
    const scoutReports = reports.filter(r => r.scoutName === member.name);
    const validated = players.filter(p => p.status === "done").length;
    const pending = players.length - validated;
    const rate = players.length ? Math.round((validated / players.length) * 100) : 0;
    return { member, players, reports: scoutReports, validated, pending, rate };
  }), [members, prospects, reports]);

  const filtered = scouts.filter(s =>
    s.member.name.toLowerCase().includes(search.toLowerCase()) ||
    s.member.email.toLowerCase().includes(search.toLowerCase())
  );

  const selected = scouts.find(s => s.member.id === selectedId) ?? null;

  const radarData = selected ? [
    { subject: "Joueurs trouvés", A: Math.min(100, selected.players.length * 5) },
    { subject: "Validés %", A: selected.rate },
    { subject: "Rapports", A: Math.min(100, selected.reports.length * 10) },
    { subject: "En attente", A: Math.min(100, selected.pending * 10) },
  ] : [];

  async function submitScout() {
    if (!form.fullName.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      await clubApi.createMember({
        fullName: form.fullName,
        email: form.email,
        clubRole: "Scout",
        password: form.password || genTempPassword(),
      });
      setForm(EMPTY_FORM);
      setShowModal(false);
      fetchAll();
    } catch {
      // keep modal open so the user can retry
    } finally {
      setSaving(false);
    }
  }

  return (
    <RecruteurPageTransition>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Gestion Scouts</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{scouts.length} scouts · {scouts.filter(s => s.member.status === "Actif").length} actifs</p>
        </div>
        <motion.button type="button" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 0 16px rgba(139,92,246,0.35)" }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Plus size={14} /> Ajouter Scout
        </motion.button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Scouts actifs", value: scouts.filter(s => s.member.status === "Actif").length, color: "#22C55E" },
          { label: "Joueurs scoutés", value: scouts.reduce((a, s) => a + s.players.length, 0), color: "#8B5CF6" },
          { label: "Validations",    value: scouts.reduce((a, s) => a + s.validated, 0),   color: "#3B82F6" },
          { label: "En attente",     value: scouts.reduce((a, s) => a + s.pending, 0),     color: "#FF7A00" },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <RCard>
              <p className="text-2xl font-extrabold" style={{ color: k.color }}>{loading ? "…" : k.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{k.label}</p>
            </RCard>
          </motion.div>
        ))}
      </div>

      {error && !loading && (
        <RCard className="text-center"><p className="text-sm text-red-400">{error}</p></RCard>
      )}

      {/* Content */}
      {!error && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
          {/* Scout list */}
          <RCard>
            <div className="mb-4 flex items-center gap-2 rounded-xl border px-3 py-2"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--surface-panel-border)" }}>
              <Search size={14} style={{ color: "var(--text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher scout, email..."
                className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--text-primary)" }} />
            </div>

            {loading && <p className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}

            {!loading && (
              <div className="space-y-2">
                {filtered.map((s, i) => (
                  <motion.div key={s.member.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedId(s.member.id === selectedId ? null : s.member.id)}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all"
                    style={{
                      background: selectedId === s.member.id ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)",
                      borderColor: selectedId === s.member.id ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.06)",
                    }}
                    whileHover={{ borderColor: "rgba(139,92,246,0.25)" }}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                      style={{ background: "rgba(139,92,246,0.18)", color: "#8B5CF6" }}>
                      {s.member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{s.member.name}</p>
                        <StatusBadge status={s.member.status} />
                      </div>
                      <p className="text-[11px] flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        <MapPin size={9} /> {s.member.email}
                      </p>
                    </div>
                    <div className="flex gap-4 text-center shrink-0">
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#8B5CF6" }}>{s.players.length}</p>
                        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Trouvés</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#22C55E" }}>{s.validated}</p>
                        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Validés</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#F59E0B" }}>{s.rate}%</p>
                        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Taux</p>
                      </div>
                      <ChevronRight size={14} style={{ color: "var(--text-muted)" }} className="self-center" />
                    </div>
                  </motion.div>
                ))}
                {filtered.length === 0 && (
                  <p className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>Aucun scout trouvé</p>
                )}
              </div>
            )}
          </RCard>

          {/* Detail panel */}
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.member.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
                <RCard>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-black"
                        style={{ background: "rgba(139,92,246,0.18)", color: "#8B5CF6" }}>
                        {selected.member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: "var(--text-primary)" }}>{selected.member.name}</p>
                        <StatusBadge status={selected.member.status} />
                      </div>
                    </div>
                    <button type="button" onClick={() => setSelectedId(null)} className="rounded-lg p-1.5"
                      style={{ background: "rgba(255,255,255,0.06)" }}>
                      <X size={12} style={{ color: "var(--text-muted)" }} />
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    <p className="flex items-center gap-2"><Users size={11} /> Rapports soumis: <strong style={{ color: "#8B5CF6" }}>{selected.reports.length}</strong></p>
                    <p className="flex items-center gap-2"><TrendingUp size={11} /> Taux validation: <strong style={{ color: "#22C55E" }}>{selected.rate}%</strong></p>
                    <p>📧 {selected.member.email}</p>
                    <p>Dernière connexion: {selected.member.lastLogin}</p>
                    <p>Membre depuis: {selected.member.createdAt}</p>
                  </div>
                </RCard>

                <RCard>
                  <p className="mb-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Performance</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 8 }} />
                        <Radar dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.22} strokeWidth={2} />
                        <Tooltip {...TOOLTIP_STYLE} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </RCard>

                <RCard>
                  <p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Joueurs scoutés (récents)</p>
                  {selected.players.slice(0, 5).map((pl, i) => (
                    <div key={pl.id} className="mb-1.5 flex items-center gap-2 rounded-lg border px-2 py-1.5"
                      style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--surface-panel-border)" }}>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{ background: "rgba(139,92,246,0.2)", color: "#8B5CF6" }}>{i + 1}</div>
                      <span className="text-xs flex-1" style={{ color: "var(--text-muted)" }}>{pl.name}</span>
                      <span className="text-[10px] rounded-full px-2 py-0.5"
                        style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>{pl.status}</span>
                    </div>
                  ))}
                  {selected.players.length === 0 && (
                    <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>Aucun joueur scouté</p>
                  )}
                </RCard>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <RCard className="flex flex-col items-center justify-center py-16">
                  <Users size={32} className="mb-3 opacity-25" style={{ color: "var(--text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sélectionner un scout pour voir le détail</p>
                </RCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowModal(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-md rounded-[24px] border p-6"
              style={{ background: "rgba(14,10,35,0.98)", borderColor: "rgba(139,92,246,0.35)" }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Nouveau Scout</p>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1.5"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <X size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Nom complet</label>
                  <input placeholder="Ex: Ahmed Trabelsi" value={form.fullName}
                    onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Email</label>
                  <input placeholder="scout@email.com" value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Mot de passe temporaire</label>
                  <input placeholder="Généré automatiquement si vide" value={form.password}
                    onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="rounded-xl border px-4 py-2 text-xs" style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}>
                  Annuler
                </button>
                <motion.button type="button" onClick={() => void submitScout()} disabled={saving || !form.fullName.trim() || !form.email.trim()}
                  className="rounded-xl px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  {saving ? "Création…" : "Créer Scout"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RecruteurPageTransition>
  );
}
