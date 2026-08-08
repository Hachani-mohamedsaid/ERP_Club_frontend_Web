import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Clock, ChevronRight } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RecruteurKpiCard } from "../../components/recruteur/RecruteurKpiCard";
import { recruteurApi } from "../../lib/api/recruteur";

type ValRow = {
  id: string;
  title: string;
  detail: string;
  status: string;
  statusLabel: string;
  priority: string;
  requestedBy: string;
  comment: string | null;
  createdAt: string;
  decidedAt: string | null;
};

const STATUS_META: Record<string, { color: string; icon: typeof Check; label: string }> = {
  EN_ATTENTE: { color: "#F59E0B", icon: Clock, label: "En attente" },
  VALIDE: { color: "#22C55E", icon: Check, label: "Validé" },
  REFUSE: { color: "#EF4444", icon: X, label: "Refusé" },
  RETOUR: { color: "#3B82F6", icon: Clock, label: "Retour" },
};

export function RecruteurRequestsPage() {
  const [requests, setRequests] = useState<ValRow[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const rows = await recruteurApi.getValidationRequests();
        if (!cancelled) {
          setRequests(rows ?? []);
          setActive(rows?.[0]?.id ?? null);
        }
      } catch {
        if (!cancelled) setRequests([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const req = requests.find((r) => r.id === active) ?? null;
  const pending = requests.filter((r) => r.status === "EN_ATTENTE").length;

  return (
    <RecruteurPageTransition>
      <div className="mb-2">
        <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
          Demandes validation recrutement
        </h1>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Flux club: Scout → comité → Responsable · {pending} en attente
        </p>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Chargement…
        </p>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center" style={{ borderColor: "var(--surface-panel-border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Aucune demande. Quand le scout envoie la shortlist au comité, elle apparaît ici.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr]">
          <div className="space-y-2.5">
            {requests.map((r) => {
              const meta = STATUS_META[r.status] ?? STATUS_META.EN_ATTENTE;
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
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `${meta.color}22`, color: meta.color }}
                  >
                    <meta.icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {r.title}
                    </div>
                    <div className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {r.requestedBy} · {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              );
            })}
          </div>

          {req && (
            <RecruteurKpiCard hover={false}>
              <div className="mb-4 flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                <div>
                  <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                    {req.title}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {req.detail}
                  </p>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{
                    background: `${(STATUS_META[req.status] ?? STATUS_META.EN_ATTENTE).color}22`,
                    color: (STATUS_META[req.status] ?? STATUS_META.EN_ATTENTE).color,
                  }}
                >
                  {req.statusLabel}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>Demandé par</span>
                  <span style={{ color: "var(--text-primary)" }}>{req.requestedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>Priorité</span>
                  <span style={{ color: "var(--text-primary)" }}>{req.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>Créé</span>
                  <span style={{ color: "var(--text-primary)" }}>
                    {new Date(req.createdAt).toLocaleString("fr-FR")}
                  </span>
                </div>
                {req.decidedAt && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-muted)" }}>Décidé</span>
                    <span style={{ color: "var(--text-primary)" }}>
                      {new Date(req.decidedAt).toLocaleString("fr-FR")}
                    </span>
                  </div>
                )}
                {req.comment && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl border p-3 text-xs"
                    style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}
                  >
                    {req.comment}
                  </motion.p>
                )}
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  La décision finale est prise par le Responsable (Centre de Validation).
                </p>
              </div>
            </RecruteurKpiCard>
          )}
        </div>
      )}
    </RecruteurPageTransition>
  );
}
