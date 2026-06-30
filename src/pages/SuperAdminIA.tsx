import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Sparkles, Cpu, Bolt, Loader2, X, AlertTriangle, CheckCircle2,
} from "lucide-react";
import {
  SuperAdminPageTransition,
  SuperAdminPageHeader,
  SuperAdminGhostButton,
  SuperAdminKpiCard,
  SuperAdminKpiGrid,
  SuperAdminSection,
  SuperAdminListRow,
} from "../components/superadmin";
import { platformApi } from "../lib/api/platform";
import { usePlatformResource } from "../hooks/usePlatformResource";

type AiAdminData = {
  status: string;
  model: string;
  provider: string;
  hasApiKey: boolean;
  kpis: {
    assistantStatus: string;
    requestsProcessed: number;
    avgResponseTime: string;
    alertCount: number;
  };
  pipeline: { title: string; subtitle: string; severity: string }[];
  actions: { id: string; label: string; description: string }[];
  logs: { id: string; actionId: string; label: string; result: string; durationMs: number; createdAt: string }[];
};

const SEVERITY_DOT: Record<string, string> = {
  critical: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  success: "#10B981",
};

export function SuperAdminIA() {
  const { data, loading, error, reload, refreshing } = usePlatformResource(
    () => platformApi.getAiAdmin() as Promise<AiAdminData>,
    [],
  );

  const [running, setRunning] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    label: string;
    text: string;
    durationMs: number;
    model: string;
  } | null>(null);

  async function executeAction(actionId: "performance" | "monthly_report" | "anomaly", label: string) {
    setRunning(actionId);
    setActionError(null);
    try {
      const res = await platformApi.runAiAction(actionId);
      setResult({
        label: res.label ?? label,
        text: res.result,
        durationMs: res.durationMs,
        model: res.model,
      });
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erreur lors de l'exécution IA.");
    } finally {
      setRunning(null);
    }
  }

  if (loading && !data) {
    return (
      <SuperAdminPageTransition>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement IA Admin…
        </div>
      </SuperAdminPageTransition>
    );
  }

  if (error || !data) {
    return (
      <SuperAdminPageTransition>
        <p className="text-sm text-red-400">{error ?? "Impossible de charger IA Admin."}</p>
        <SuperAdminGhostButton onClick={reload}>Réessayer</SuperAdminGhostButton>
      </SuperAdminPageTransition>
    );
  }

  const statusColor =
    data.status === "available" ? "#10B981" : data.status === "disabled" ? "#F59E0B" : "#EF4444";

  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="IA Admin"
        subtitle={`Contrôle des services AI — ${data.provider} / ${data.model}`}
        action={
          <div className="flex gap-2">
            <SuperAdminGhostButton onClick={reload} disabled={refreshing}>
              {refreshing ? "Actualisation…" : "Actualiser"}
            </SuperAdminGhostButton>
            <Link
              to="/superadmin/settings"
              className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-white/5"
              style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}
            >
              Paramètres IA
            </Link>
          </div>
        }
      />

      {!data.hasApiKey && (
        <div
          className="mb-6 flex items-start gap-3 rounded-xl border p-4"
          style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)" }}
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-300">Clé OpenAI non configurée</p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              Ajoutez <code className="rounded px-1" style={{ background: "rgba(255,255,255,0.06)" }}>OPENAI_API_KEY</code> sur le serveur backend (Render) ou dans{" "}
              <Link to="/superadmin/settings" className="text-orange-400 underline">Paramètres → IA</Link>.
              Ne jamais mettre la clé dans le code frontend.
            </p>
          </div>
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {actionError}
        </div>
      )}

      <SuperAdminKpiGrid>
        <SuperAdminKpiCard
          label="Assistant IA"
          value={data.kpis.assistantStatus}
          icon={Sparkles}
          color={statusColor}
        />
        <SuperAdminKpiCard
          label="Demandes traitées"
          value={data.kpis.requestsProcessed.toLocaleString("fr-FR")}
          icon={MessageCircle}
          color="#3B82F6"
        />
        <SuperAdminKpiCard
          label="Temps moyen"
          value={data.kpis.avgResponseTime}
          icon={Bolt}
          color="#10B981"
        />
        <SuperAdminKpiCard
          label="Alertes IA"
          value={String(data.kpis.alertCount)}
          icon={Cpu}
          color="#EF4444"
        />
      </SuperAdminKpiGrid>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SuperAdminSection title="Pipeline IA" subtitle="Données plateforme en temps réel." icon={Bolt}>
          <div className="space-y-3">
            {data.pipeline.map((item) => (
              <SuperAdminListRow key={item.title}>
                <div className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: SEVERITY_DOT[item.severity] ?? "#3B82F6" }}
                  />
                  <div>
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.subtitle}</p>
                  </div>
                </div>
              </SuperAdminListRow>
            ))}
          </div>
        </SuperAdminSection>

        <SuperAdminSection title="Actions IA" subtitle="Exécution via OpenAI (backend sécurisé).">
          <div className="space-y-3">
            {data.actions.map((item) => (
              <SuperAdminListRow key={item.id}>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{item.description}</p>
                <SuperAdminGhostButton
                  className="mt-2 px-3 py-1.5 text-xs"
                  disabled={!!running || data.status !== "available"}
                  onClick={() =>
                    executeAction(
                      item.id as "performance" | "monthly_report" | "anomaly",
                      item.label,
                    )
                  }
                >
                  {running === item.id ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Analyse…
                    </span>
                  ) : (
                    "Exécuter"
                  )}
                </SuperAdminGhostButton>
              </SuperAdminListRow>
            ))}
          </div>
        </SuperAdminSection>
      </div>

      {data.logs.length > 0 && (
        <SuperAdminSection
          title="Logs IA récents"
          subtitle="Historique des actions exécutées (session serveur)."
          className="mt-6"
        >
          <div className="space-y-2">
            {data.logs.map((log) => (
              <SuperAdminListRow key={log.id}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{log.label}</p>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {(log.durationMs / 1000).toFixed(1)}s · {new Date(log.createdAt).toLocaleString("fr-FR")}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {log.result.slice(0, 180)}…
                </p>
              </SuperAdminListRow>
            ))}
          </div>
        </SuperAdminSection>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.65)" }}
            onClick={() => setResult(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl"
              style={{
                background: "var(--surface-panel)",
                borderColor: "var(--surface-panel-border)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between border-b px-5 py-4"
                style={{ borderColor: "var(--surface-panel-border)" }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{result.label}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {result.model} · {(result.durationMs / 1000).toFixed(1)}s
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => setResult(null)} className="rounded-lg p-1 hover:bg-white/5">
                  <X className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
                <pre
                  className="whitespace-pre-wrap text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)", fontFamily: "inherit" }}
                >
                  {result.text}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SuperAdminPageTransition>
  );
}
