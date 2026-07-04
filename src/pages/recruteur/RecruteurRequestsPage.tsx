import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Clock, MessageSquare, ChevronRight } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RecruteurKpiCard } from "../../components/recruteur/RecruteurKpiCard";
import { VALIDATION_REQUESTS, type StepStatus, type ValidationRequest } from "../../data/recruteurData";

const STATUS_META: Record<StepStatus, { color: string; icon: typeof Check; label: string }> = {
  approved: { color: "#22C55E", icon: Check, label: "Approuvé" },
  rejected: { color: "#EF4444", icon: X, label: "Refusé" },
  pending: { color: "#F59E0B", icon: Clock, label: "En attente" },
  waiting: { color: "#64748B", icon: Clock, label: "À venir" },
};

export function RecruteurRequestsPage() {
  const [requests, setRequests] = useState<ValidationRequest[]>(VALIDATION_REQUESTS);
  const [active, setActive] = useState(VALIDATION_REQUESTS[0].id);

  const req = requests.find((r) => r.id === active)!;

  const act = (status: "approved" | "rejected") => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== active) return r;
        const idx = r.steps.findIndex((s) => s.status === "pending");
        if (idx === -1) return r;
        const steps = r.steps.map((s, i) => {
          if (i === idx) return { ...s, status, by: "K. Belaïd" };
          if (i === idx + 1 && status === "approved" && s.status === "waiting") return { ...s, status: "pending" as StepStatus };
          return s;
        });
        return { ...r, steps };
      }),
    );
  };

  return (
    <RecruteurPageTransition>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr]">
        <div className="space-y-2.5">
          {requests.map((r) => {
            const done = r.steps.filter((s) => s.status === "approved").length;
            const rejected = r.steps.some((s) => s.status === "rejected");
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActive(r.id)}
                className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors"
                style={{
                  background: active === r.id ? "rgba(139,92,246,0.12)" : "rgba(15,29,58,0.7)",
                  borderColor: active === r.id ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold" style={{ background: rejected ? "rgba(239,68,68,0.15)" : "rgba(139,92,246,0.15)", color: rejected ? "#EF4444" : "#A855F7" }}>
                  {r.position}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold" style={{ color: "var(--text-primary)" }}>{r.player}</div>
                  <div className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>{r.value} • {r.requestedBy} • {r.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold" style={{ color: rejected ? "#EF4444" : "#22C55E" }}>{done}/{r.steps.length}</div>
                  <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                </div>
              </button>
            );
          })}
        </div>

        <RecruteurKpiCard hover={false}>
          <div className="mb-4 flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--surface-panel-border)" }}>
            <div>
              <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Workflow — {req.player}</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{req.position} • {req.value} • Demandé par {req.requestedBy}</p>
            </div>
          </div>

          <div className="relative ml-3 border-l-2 pl-6" style={{ borderColor: "var(--surface-panel-border)" }}>
            {req.steps.map((step, i) => {
              const meta = STATUS_META[step.status];
              const Icon = meta.icon;
              return (
                <motion.div key={step.step} className="relative mb-5 last:mb-0" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                  <span
                    className="absolute -left-[35px] flex h-7 w-7 items-center justify-center rounded-full ring-4"
                    style={{ background: meta.color, boxShadow: step.status === "pending" ? `0 0 12px ${meta.color}` : undefined, "--tw-ring-color": "rgba(15,29,58,1)" } as React.CSSProperties}
                  >
                    <Icon size={14} className="text-white" />
                  </span>
                  <div className="rounded-xl border p-3" style={{ background: "rgba(255,255,255,0.03)", borderColor: `${meta.color}30` }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{step.label}</span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${meta.color}1f`, color: meta.color }}>{meta.label}</span>
                    </div>
                    {step.by && <div className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>par {step.by}</div>}
                    {step.comment && (
                      <div className="mt-2 flex items-start gap-1.5 rounded-lg p-2 text-[11px]" style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)" }}>
                        <MessageSquare size={12} className="mt-0.5 shrink-0" style={{ color: meta.color }} />
                        {step.comment}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {req.steps.some((s) => s.status === "pending") && (
            <div className="mt-4 flex gap-2 border-t pt-4" style={{ borderColor: "var(--surface-panel-border)" }}>
              <button type="button" onClick={() => act("approved")} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#22C55E,#16A34A)" }}>
                <Check size={15} /> Approuver mon étape
              </button>
              <button type="button" onClick={() => act("rejected")} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#EF4444,#DC2626)" }}>
                <X size={15} /> Refuser
              </button>
            </div>
          )}
        </RecruteurKpiCard>
      </div>
    </RecruteurPageTransition>
  );
}
