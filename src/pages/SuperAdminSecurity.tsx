import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  SuperAdminPageTransition,
  SuperAdminPageHeader,
  SuperAdminGhostButton,
  SuperAdminActionButton,
  SuperAdminKpiCard,
  SuperAdminKpiGrid,
  SuperAdminSection,
  SuperAdminListRow,
  SuperAdminFilterPills,
} from "../components/superadmin";
import {
  Lock, ShieldAlert, LogIn, Activity, AlertTriangle,
  Smartphone, Globe, Ban, CheckCircle2, XCircle, Loader2,
} from "lucide-react";
import { platformApi } from "../lib/api/platform";
import { usePlatformResource } from "../hooks/usePlatformResource";

const SEVERITY_COLOR: Record<string, string> = {
  Critique: "#EF4444",
  Haute: "#FF7A00",
  Normale: "#3B82F6",
};

const TABS = ["Vue globale", "IPs Bloquées", "Activité suspecte", "Abus API", "MFA"] as const;
type Tab = (typeof TABS)[number];

export function SuperAdminSecurity() {
  const [activeTab, setActiveTab] = useState<Tab>("Vue globale");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { data, loading, error, reload, refreshing } = usePlatformResource(
    () => platformApi.getSecurity(),
    [],
  );

  async function handleRefresh() {
    await reload();
    setLastUpdated(new Date());
  }

  useEffect(() => {
    if (data && lastUpdated === null) setLastUpdated(new Date());
  }, [data, lastUpdated]);

  if (loading && !data) {
    return (
      <SuperAdminPageTransition>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement sécurité…</p>
      </SuperAdminPageTransition>
    );
  }

  if (error || !data) {
    return (
      <SuperAdminPageTransition>
        <p className="text-sm text-red-400">{error ?? "Erreur"}</p>
        <SuperAdminGhostButton onClick={handleRefresh}>Réessayer</SuperAdminGhostButton>
      </SuperAdminPageTransition>
    );
  }

  const {
    kpis,
    failedLoginsByHour,
    mfaData,
    blockedIps,
    suspicious,
    apiAbuse,
    mfaByRole,
    securityActions,
  } = data as {
    kpis: { failedAttemptsToday: number; blockedIps: number; activeSessions: number; mfaAdoption: number; mfaTrend: string };
    failedLoginsByHour: { hour: string; count: number }[];
    mfaData: { name: string; value: number; color: string }[];
    blockedIps: { ip: string; reason: string; blockedAt: string; country: string }[];
    suspicious: { type: string; user: string; ip: string; time: string; severity: string }[];
    apiAbuse: { endpoint: string; calls: number; limit: number }[];
    mfaByRole: { role: string; pct: number }[];
    securityActions: { label: string; done: boolean }[];
  };

  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Security Center"
        subtitle={
          lastUpdated
            ? `Supervision complète — mis à jour à ${lastUpdated.toLocaleTimeString("fr-FR")}`
            : "Supervision complète des accès, menaces et conformité."
        }
        action={
          <SuperAdminActionButton onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
            {refreshing ? "Actualisation…" : "Rafraîchir"}
          </SuperAdminActionButton>
        }
      />

      {refreshing && (
        <div
          className="mb-3 h-0.5 w-full overflow-hidden rounded-full"
          style={{ background: "rgba(255,122,0,0.15)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#FF7A00,#E66000)" }}
            initial={{ x: "-100%", width: "40%" }}
            animate={{ x: "250%" }}
            transition={{ duration: 0.9, ease: "easeInOut", repeat: Infinity }}
          />
        </div>
      )}

      <div className={`space-y-4 ${refreshing ? "opacity-90 transition-opacity" : ""}`}>
      <SuperAdminKpiGrid cols={4}>
        <SuperAdminKpiCard label="Tentatives échouées" value={String(kpis.failedAttemptsToday)} icon={LogIn} color="#EF4444" trend="Aujourd'hui" />
        <SuperAdminKpiCard label="IPs bloquées" value={String(kpis.blockedIps)} icon={Ban} color="#FF7A00" trend="Actives" />
        <SuperAdminKpiCard label="Sessions actives" value={String(kpis.activeSessions)} icon={Activity} color="#10B981" trend="En temps réel" />
        <SuperAdminKpiCard label="MFA adopté" value={`${kpis.mfaAdoption}%`} icon={Smartphone} color="#3B82F6" trend={kpis.mfaTrend} />
      </SuperAdminKpiGrid>

      <SuperAdminFilterPills options={[...TABS]} value={activeTab} onChange={(v) => setActiveTab(v as Tab)} />

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }} className="space-y-4">
          {activeTab === "Vue globale" && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <SuperAdminSection title="Connexions / heure" subtitle="Activité de connexion aujourd'hui.">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={failedLoginsByHour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="hour" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0F1D3A", borderColor: "rgba(239,68,68,0.3)", color: "#F1F5F9" }} />
                    <Bar dataKey="count" fill="#EF4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SuperAdminSection>

              <SuperAdminSection title="MFA Adoption" subtitle="Taux d'activation 2FA (proxy admins).">
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={mfaData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4}>
                        {mfaData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0F1D3A", borderColor: "rgba(255,122,0,0.3)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {mfaData.map((item) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}%</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SuperAdminSection>

              <SuperAdminSection title="Alertes récentes" subtitle="Activités suspectes détectées.">
                <div className="space-y-3">
                  {suspicious.slice(0, 4).map((item, i) => (
                    <SuperAdminListRow key={i}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <AlertTriangle size={14} style={{ color: SEVERITY_COLOR[item.severity] }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.type}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.user} · {item.time}</p>
                          </div>
                        </div>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${SEVERITY_COLOR[item.severity]}18`, color: SEVERITY_COLOR[item.severity] }}>
                          {item.severity}
                        </span>
                      </div>
                    </SuperAdminListRow>
                  ))}
                </div>
              </SuperAdminSection>

              <SuperAdminSection title="Actions de sécurité" subtitle="Configurations recommandées.">
                <div className="space-y-3">
                  {securityActions.map(({ label, done }) => (
                    <SuperAdminListRow key={label}>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {done ? <CheckCircle2 size={14} style={{ color: "#22C55E" }} /> : <XCircle size={14} style={{ color: "#EF4444" }} />}
                          <span style={{ color: "var(--text-primary)" }}>{label}</span>
                        </div>
                      </div>
                    </SuperAdminListRow>
                  ))}
                </div>
              </SuperAdminSection>
            </div>
          )}

          {activeTab === "IPs Bloquées" && (
            <SuperAdminSection title="IPs bloquées" subtitle={`${blockedIps.length} adresse(s) bloquée(s).`}>
              <div className="space-y-3">
                {blockedIps.map((item) => (
                  <SuperAdminListRow key={item.ip}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "#EF444418" }}>
                        <Globe size={14} style={{ color: "#EF4444" }} />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.ip}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.reason} · {item.country}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Bloqué le {item.blockedAt}</p>
                      </div>
                    </div>
                  </SuperAdminListRow>
                ))}
              </div>
            </SuperAdminSection>
          )}

          {activeTab === "Activité suspecte" && (
            <SuperAdminSection title="Activités suspectes" subtitle="Événements de sécurité détectés.">
              <div className="space-y-3">
                {suspicious.map((item, i) => (
                  <SuperAdminListRow key={i}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <AlertTriangle size={14} style={{ color: SEVERITY_COLOR[item.severity] }} />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.type}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.user} · IP {item.ip}</p>
                        </div>
                      </div>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${SEVERITY_COLOR[item.severity]}18`, color: SEVERITY_COLOR[item.severity] }}>
                        {item.severity}
                      </span>
                    </div>
                  </SuperAdminListRow>
                ))}
              </div>
            </SuperAdminSection>
          )}

          {activeTab === "Abus API" && (
            <SuperAdminSection title="Abus API détectés" subtitle="Endpoints et volume de requêtes.">
              <div className="space-y-4">
                {apiAbuse.map((item) => {
                  const pct = Math.min((item.calls / item.limit) * 100, 100);
                  const over = item.calls > item.limit;
                  return (
                    <SuperAdminListRow key={item.endpoint}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div>
                          <p className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>{item.endpoint}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.calls} req · limite {item.limit}</p>
                        </div>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: over ? "#EF444418" : "#22C55E18", color: over ? "#EF4444" : "#22C55E" }}>
                          {over ? "Dépassé" : "OK"}
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: over ? "#EF4444" : "#22C55E" }} />
                      </div>
                    </SuperAdminListRow>
                  );
                })}
              </div>
            </SuperAdminSection>
          )}

          {activeTab === "MFA" && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <SuperAdminSection title="Adoption 2FA par rôle" subtitle="Estimation par rôle club.">
                <div className="space-y-4">
                  {mfaByRole.map(({ role, pct }) => (
                    <div key={role}>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span style={{ color: "var(--text-primary)" }}>{role}</span>
                        <span style={{ color: pct >= 70 ? "#22C55E" : pct >= 50 ? "#FF7A00" : "#EF4444" }}>{pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 70 ? "#22C55E" : pct >= 50 ? "#FF7A00" : "#EF4444" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </SuperAdminSection>
              <SuperAdminSection title="Actions recommandées" subtitle="Améliorer la sécurité.">
                <div className="space-y-3">
                  {securityActions.filter((a) => !a.done).map(({ label }) => (
                    <SuperAdminListRow key={label}>
                      <div className="flex items-center gap-2 text-sm">
                        <ShieldAlert size={13} style={{ color: "#FF7A00" }} />
                        <span style={{ color: "var(--text-primary)" }}>{label}</span>
                      </div>
                    </SuperAdminListRow>
                  ))}
                </div>
              </SuperAdminSection>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      </div>
    </SuperAdminPageTransition>
  );
}
