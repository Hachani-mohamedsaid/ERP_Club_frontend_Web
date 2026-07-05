import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, Clock, Users, ScrollText, DollarSign, AlertTriangle } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { RPage, RCard, RHeader, RSection, RRow, RPills, RBtn, RKpiCard } from "../../components/responsable";
import { responsableApi } from "../../lib/api/responsable";
import { useClubResource } from "../../hooks/useClubResource";

type ReqType = "Recrutement" | "Contrat" | "Budget" | "Convocation" | "Médical";
type ReqStatus = "En attente" | "Validé" | "Refusé" | "Retour";

interface ValidationRequest {
  id: string;
  type: ReqType;
  title: string;
  from: string;
  detail: string;
  amount?: string;
  priority: "Critique" | "Haute" | "Normale";
  status: ReqStatus;
  date: string;
}

const TYPE_ICON: Record<ReqType, typeof Clock> = {
  Recrutement: Users,
  Contrat:     ScrollText,
  Budget:      DollarSign,
  Convocation: Clock,
  Médical:     AlertTriangle,
};

const TYPE_COLOR: Record<ReqType, string> = {
  Recrutement: "#3B82F6",
  Contrat:     "#F59E0B",
  Budget:      "#10B981",
  Convocation: "#8B5CF6",
  Médical:     "#EF4444",
};

const PRIORITY_COLOR: Record<string, string> = {
  Critique: "#EF4444",
  Haute:    "#FF7A00",
  Normale:  "#3B82F6",
};

const STATUS_COLOR: Record<ReqStatus, string> = {
  "En attente": "#FF7A00",
  "Validé":     "#22C55E",
  "Refusé":     "#EF4444",
  "Retour":     "#8B5CF6",
};

const FILTER_OPTIONS = ["Tous", "En attente", "Validé", "Refusé", "Retour"] as const;

export function ValidationPage() {
  const { data, loading, reload } = useClubResource(() => responsableApi.getValidation() as Promise<{
    requests: ValidationRequest[];
    stats: { pending: number; approved: number; rejected: number; returned: number };
    byType: { type: string; count: number }[];
  }>);

  const requests = data?.requests ?? [];
  const [filter, setFilter] = useState<string>("En attente");
  const [selected, setSelected] = useState<ValidationRequest | null>(null);
  const [comment, setComment] = useState("");

  const filtered = useMemo(
    () => (filter === "Tous" ? requests : requests.filter(r => r.status === filter)),
    [requests, filter]
  );

  const pending = requests.filter(r => r.status === "En attente").length;

  async function action(id: string, status: ReqStatus) {
    const actionMap: Record<ReqStatus, "approve" | "reject" | "return" | null> = {
      "Validé": "approve",
      "Refusé": "reject",
      Retour: "return",
      "En attente": null,
    };
    const apiAction = actionMap[status];
    if (apiAction) {
      try {
        await responsableApi.decideValidation(id, apiAction, comment || undefined);
        await reload();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Erreur");
      }
    }
    setSelected(null);
    setComment("");
  }

  if (loading) {
    return (
      <RPage>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement des demandes…</p>
      </RPage>
    );
  }

  return (
    <RPage>
      <RHeader
        title="Centre de Validation"
        subtitle="Demandes en attente de décision — Recrutement, Contrats, Budget."
        action={
          <div className="flex items-center gap-2">
            {pending > 0 && (
              <motion.span
                className="rounded-full px-3 py-1 text-sm font-bold text-white"
                style={{ background: "#EF4444", boxShadow: "0 0 16px rgba(239,68,68,0.5)" }}
                animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              >
                {pending} en attente
              </motion.span>
            )}
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "En attente", value: String(requests.filter(r => r.status === "En attente").length), icon: Clock,       color: "#FF7A00" },
          { label: "Validés",    value: String(requests.filter(r => r.status === "Validé").length),     icon: CheckCircle2, color: "#22C55E" },
          { label: "Refusés",    value: String(requests.filter(r => r.status === "Refusé").length),     icon: XCircle,      color: "#EF4444" },
          { label: "Retour",     value: String(requests.filter(r => r.status === "Retour").length),     icon: RotateCcw,    color: "#8B5CF6" },
        ].map(props => <RKpiCard key={props.label} {...props} />)}
      </div>

      <RPills options={[...FILTER_OPTIONS]} value={filter} onChange={setFilter} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* Request list */}
        <RSection title="Demandes" subtitle={`${filtered.length} demande${filtered.length > 1 ? "s" : ""}`}>
          <AnimatePresence mode="wait">
            <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {filtered.map((req, i) => {
                const Icon = TYPE_ICON[req.type];
                const typeColor = TYPE_COLOR[req.type];
                const isPending = req.status === "En attente";
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelected(req)}
                    className="cursor-pointer"
                  >
                    <RRow>
                      <div className="flex items-start gap-3">
                        {/* Pulsing priority dot */}
                        {isPending && (
                          <motion.div className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                            style={{ background: PRIORITY_COLOR[req.priority] }}
                            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }} />
                        )}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: `${typeColor}18` }}>
                          <Icon size={15} style={{ color: typeColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{req.title}</p>
                            <div className="flex gap-1.5">
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                style={{ background: `${PRIORITY_COLOR[req.priority]}18`, color: PRIORITY_COLOR[req.priority] }}>
                                {req.priority}
                              </span>
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                style={{ background: `${STATUS_COLOR[req.status]}18`, color: STATUS_COLOR[req.status] }}>
                                {req.status}
                              </span>
                            </div>
                          </div>
                          <p className="mt-0.5 text-xs truncate" style={{ color: "var(--text-muted)" }}>{req.detail}</p>
                          <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                            Proposé par <strong style={{ color: "var(--accent)" }}>{req.from}</strong> · {req.date}
                          </p>
                          {/* Inline quick actions for pending */}
                          {isPending && (
                            <div className="mt-3 flex gap-2">
                              <RBtn onClick={(e) => { action(req.id, "Validé"); }} variant="success">
                                <CheckCircle2 size={13} /> Valider
                              </RBtn>
                              <RBtn onClick={() => action(req.id, "Refusé")} variant="danger">
                                <XCircle size={13} /> Refuser
                              </RBtn>
                              <RBtn onClick={() => setSelected(req)} variant="ghost">
                                <RotateCcw size={13} /> Retour coach
                              </RBtn>
                            </div>
                          )}
                        </div>
                      </div>
                    </RRow>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <div className="py-12 text-center" style={{ color: "var(--text-muted)" }}>
                  <CheckCircle2 size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucune demande dans cette catégorie</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </RSection>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <RSection
                title={selected.id}
                subtitle="Détail de la demande"
                action={<RBtn onClick={() => setSelected(null)} variant="ghost">Fermer</RBtn>}
              >
                <div className="space-y-4">
                  <div className="rounded-2xl border p-4" style={{ background: `${TYPE_COLOR[selected.type]}08`, borderColor: `${TYPE_COLOR[selected.type]}25` }}>
                    <p className="text-xs uppercase tracking-wide" style={{ color: TYPE_COLOR[selected.type] }}>{selected.type}</p>
                    <p className="mt-1 text-base font-bold" style={{ color: "var(--text-primary)" }}>{selected.title}</p>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{selected.detail}</p>
                    {selected.amount && (
                      <p className="mt-2 text-xl font-extrabold" style={{ color: "var(--accent)" }}>{selected.amount}</p>
                    )}
                  </div>

                  {[
                    { label: "Proposé par", value: selected.from },
                    { label: "Date", value: selected.date },
                    { label: "Priorité", value: selected.priority },
                    { label: "Statut actuel", value: selected.status },
                  ].map(({ label, value }) => (
                    <RRow key={label}>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: "var(--text-muted)" }}>{label}</span>
                        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{value}</span>
                      </div>
                    </RRow>
                  ))}

                  {selected.status === "En attente" && (
                    <>
                      <textarea
                        rows={3}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Commentaire (optionnel)..."
                        className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
                      />
                      <div className="grid grid-cols-1 gap-2">
                        <RBtn onClick={() => action(selected.id, "Validé")} variant="success">
                          <CheckCircle2 size={14} /> Valider la demande
                        </RBtn>
                        <RBtn onClick={() => action(selected.id, "Retour")} variant="ghost">
                          <RotateCcw size={14} /> Retour au coach
                        </RBtn>
                        <RBtn onClick={() => action(selected.id, "Refusé")} variant="danger">
                          <XCircle size={14} /> Refuser
                        </RBtn>
                      </div>
                    </>
                  )}
                </div>
              </RSection>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <RSection title="Tableau de bord Validation" subtitle="Statistiques des demandes">
                <div className="space-y-5">
                  {/* Pie chart status */}
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "En attente", value: requests.filter(r => r.status === "En attente").length },
                            { name: "Validé",     value: requests.filter(r => r.status === "Validé").length },
                            { name: "Refusé",     value: requests.filter(r => r.status === "Refusé").length },
                            { name: "Retour",     value: requests.filter(r => r.status === "Retour").length },
                          ]}
                          dataKey="value" nameKey="name" innerRadius={35} outerRadius={65} paddingAngle={4}
                        >
                          {["#FF7A00","#22C55E","#EF4444","#8B5CF6"].map((c, i) => <Cell key={i} fill={c} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "var(--surface-modal)", border: "1px solid rgba(255,122,0,0.2)", color: "var(--text-primary)", borderRadius: 12 }} />
                        <Legend wrapperStyle={{ color: "var(--text-muted)", fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Type breakdown bar chart */}
                  <div>
                    <p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Demandes par type</p>
                    <div className="h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={["Recrutement","Contrat","Budget","Convocation","Médical"].map(t => ({
                            name: t, count: requests.filter(r => r.type === t).length,
                          }))}
                          barCategoryGap="40%"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={{ background: "var(--surface-modal)", border: "1px solid rgba(255,122,0,0.2)", color: "var(--text-primary)", borderRadius: 12 }} />
                          <Bar dataKey="count" radius={[5, 5, 0, 0]} fill="#FF7A00" fillOpacity={0.85} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Urgent alerts */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Demandes prioritaires</p>
                    {requests.filter(r => r.priority === "Critique" || (r.priority === "Haute" && r.status === "En attente")).map(r => (
                      <motion.div key={r.id}
                        className="flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5"
                        style={{ background: "rgba(255,122,0,0.05)", borderColor: "rgba(255,122,0,0.2)" }}
                        whileHover={{ borderColor: "rgba(255,122,0,0.4)", x: 2 }}
                        onClick={() => setSelected(r)}>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{r.title}</p>
                          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{r.from} · {r.date}</p>
                        </div>
                        <motion.span className="text-[10px] font-bold" style={{ color: "#FF7A00" }}
                          animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.3, repeat: Infinity }}>
                          {r.priority}
                        </motion.span>
                      </motion.div>
                    ))}
                  </div>

                  <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
                    ← Cliquer sur une demande pour gérer
                  </p>
                </div>
              </RSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RPage>
  );
}
