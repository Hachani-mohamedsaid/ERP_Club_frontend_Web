import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, RotateCcw, Clock, ChevronRight } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RecruteurKpiCard } from "../../components/recruteur/RecruteurKpiCard";
import { responsableApi } from "../../lib/api/responsable";

interface ValidationRequestDto {
  id: string;
  type: string;
  title: string;
  from: string;
  detail: string;
  amount?: string;
  priority: string;
  status: string;
  date: string;
}

const STATUS_META: Record<string, { color: string; icon: typeof Check; label: string }> = {
  "Validé":     { color: "#22C55E", icon: Check, label: "Validé" },
  "Refusé":     { color: "#EF4444", icon: X, label: "Refusé" },
  "En attente": { color: "#F59E0B", icon: Clock, label: "En attente" },
  "Retour":     { color: "#64748B", icon: RotateCcw, label: "Retour" },
};

export function RecruteurRequestsPage() {
  const [requests, setRequests] = useState<ValidationRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [deciding, setDeciding] = useState(false);

  const fetchRequests = useCallback(() => {
    setLoading(true);
    setError(null);
    (responsableApi.getValidation() as Promise<{ requests: ValidationRequestDto[] }>)
      .then((res) => {
        const recruitment = res.requests.filter(r => r.type === "Recrutement");
        setRequests(recruitment);
        setActive(prev => prev ?? recruitment[0]?.id ?? null);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const req = requests.find((r) => r.id === active) ?? null;

  async function act(action: "approve" | "reject" | "return") {
    if (!req) return;
    setDeciding(true);
    try {
      await responsableApi.decideValidation(req.id, action);
      fetchRequests();
    } catch {
      // leave state untouched on failure
    } finally {
      setDeciding(false);
    }
  }

  if (loading) {
    return (
      <RecruteurPageTransition>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16" style={{ borderColor: "var(--surface-panel-border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>
        </div>
      </RecruteurPageTransition>
    );
  }

  if (error) {
    return (
      <RecruteurPageTransition>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </RecruteurPageTransition>
    );
  }

  if (requests.length === 0 || !req) {
    return (
      <RecruteurPageTransition>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16" style={{ borderColor: "var(--surface-panel-border)" }}>
          <Clock size={28} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune demande de validation recrutement</p>
        </div>
      </RecruteurPageTransition>
    );
  }

  const meta = STATUS_META[req.status] ?? STATUS_META["En attente"];
  const Icon = meta.icon;

  return (
    <RecruteurPageTransition>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr]">
        <div className="space-y-2.5">
          {requests.map((r) => {
            const m = STATUS_META[r.status] ?? STATUS_META["En attente"];
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${m.color}1f`, color: m.color }}>
                  <m.icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold" style={{ color: "var(--text-primary)" }}>{r.title}</div>
                  <div className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>{r.detail}</div>
                  <div className="truncate text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{r.from} • {r.date}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-bold" style={{ color: m.color }}>{r.status}</div>
                  <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                </div>
              </button>
            );
          })}
        </div>

        <RecruteurKpiCard hover={false}>
          <div className="mb-4 flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--surface-panel-border)" }}>
            <div>
              <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{req.title}</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{req.detail}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Demandé par {req.from} • {req.date} {req.amount && `• ${req.amount}`}
              </p>
            </div>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0" style={{ background: `${meta.color}1f`, color: meta.color }}>{req.priority}</span>
          </div>

          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border p-3" style={{ background: "rgba(255,255,255,0.03)", borderColor: `${meta.color}30` }}>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: meta.color }}>
                <Icon size={14} className="text-white" />
              </span>
              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Statut: {meta.label}</span>
            </div>
          </motion.div>

          {req.status === "En attente" && (
            <div className="mt-4 flex gap-2 border-t pt-4" style={{ borderColor: "var(--surface-panel-border)" }}>
              <button type="button" disabled={deciding} onClick={() => void act("approve")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#22C55E,#16A34A)" }}>
                <Check size={15} /> Approuver
              </button>
              <button type="button" disabled={deciding} onClick={() => void act("return")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#64748B,#475569)" }}>
                <RotateCcw size={15} /> Retour
              </button>
              <button type="button" disabled={deciding} onClick={() => void act("reject")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#EF4444,#DC2626)" }}>
                <X size={15} /> Refuser
              </button>
            </div>
          )}
        </RecruteurKpiCard>
      </div>
    </RecruteurPageTransition>
  );
}
