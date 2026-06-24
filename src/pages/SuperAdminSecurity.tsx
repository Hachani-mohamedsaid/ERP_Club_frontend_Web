import { useState } from "react";
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
  Lock, ShieldAlert, LogIn, UserX, Activity, AlertTriangle,
  Smartphone, Globe, Ban, CheckCircle2, XCircle, Eye,
} from "lucide-react";

/* ── Data ──────────────────────────────────────────────────────── */
const FAILED_LOGINS = [
  { hour: "08h", count: 3 },
  { hour: "09h", count: 8 },
  { hour: "10h", count: 5 },
  { hour: "11h", count: 12 },
  { hour: "12h", count: 4 },
  { hour: "13h", count: 7 },
  { hour: "14h", count: 15 },
  { hour: "15h", count: 6 },
  { hour: "16h", count: 9 },
  { hour: "17h", count: 2 },
];

const MFA_DATA = [
  { name: "2FA Activé", value: 68, color: "#22C55E" },
  { name: "2FA Désactivé", value: 32, color: "#EF4444" },
];

const BLOCKED_IPS = [
  { ip: "192.168.1.200", reason: "Brute force (28 tentatives)", blockedAt: "18/06 14:58", country: "TN" },
  { ip: "45.22.178.91", reason: "Scan de ports détecté", blockedAt: "18/06 12:00", country: "RU" },
  { ip: "103.55.42.10", reason: "API abuse (1200 req/min)", blockedAt: "17/06 22:15", country: "CN" },
  { ip: "82.100.53.7", reason: "Credential stuffing", blockedAt: "17/06 09:30", country: "DE" },
];

const SUSPICIOUS = [
  { type: "Brute Force", user: "amine@club.com", ip: "192.168.1.200", time: "18/06 14:58", severity: "Critique" },
  { type: "Connexion hors pays", user: "sarra@club.com", ip: "45.22.178.91", time: "18/06 12:00", severity: "Haute" },
  { type: "Token API expiré utilisé", user: "api-bot@es-sahel.tn", ip: "103.55.42.10", time: "17/06 22:15", severity: "Haute" },
  { type: "Changement de mot de passe suspect", user: "tarek@club.com", ip: "82.100.53.7", time: "17/06 09:30", severity: "Normale" },
];

const API_ABUSE = [
  { endpoint: "/api/users", calls: 1200, limit: 500 },
  { endpoint: "/api/clubs", calls: 340, limit: 500 },
  { endpoint: "/api/payments", calls: 890, limit: 300 },
  { endpoint: "/api/reports", calls: 120, limit: 200 },
];

const SEVERITY_COLOR: Record<string, string> = {
  Critique: "#EF4444",
  Haute: "#FF7A00",
  Normale: "#3B82F6",
};

const TABS = ["Vue globale", "IPs Bloquées", "Activité suspecte", "Abus API", "MFA"] as const;
type Tab = (typeof TABS)[number];

export function SuperAdminSecurity() {
  const [activeTab, setActiveTab] = useState<Tab>("Vue globale");

  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Security Center"
        subtitle="Supervision complète des accès, menaces et conformité."
        action={<SuperAdminActionButton><Lock size={14} /> Forcer 2FA global</SuperAdminActionButton>}
      />

      <SuperAdminKpiGrid cols={4}>
        <SuperAdminKpiCard label="Tentatives échouées" value="112" icon={LogIn} color="#EF4444" trend="Aujourd'hui" />
        <SuperAdminKpiCard label="IPs bloquées" value="27" icon={Ban} color="#FF7A00" trend="Actives" />
        <SuperAdminKpiCard label="Sessions actives" value="120" icon={Activity} color="#10B981" trend="En temps réel" />
        <SuperAdminKpiCard label="MFA adopté" value="68%" icon={Smartphone} color="#3B82F6" trend="+5% ce mois" />
      </SuperAdminKpiGrid>

      <SuperAdminFilterPills options={[...TABS]} value={activeTab} onChange={(v) => setActiveTab(v as Tab)} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
          className="space-y-4"
        >
          {/* ── Vue globale ── */}
          {activeTab === "Vue globale" && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <SuperAdminSection title="Connexions échouées / heure" subtitle="Tentatives de connexion invalides aujourd'hui.">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={FAILED_LOGINS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="hour" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0F1D3A", borderColor: "rgba(239,68,68,0.3)", color: "#F1F5F9" }} />
                    <Bar dataKey="count" fill="#EF4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </SuperAdminSection>

              <SuperAdminSection title="MFA Adoption" subtitle="Taux d'activation de l'authentification à deux facteurs.">
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={MFA_DATA} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4}>
                        {MFA_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0F1D3A", borderColor: "rgba(255,122,0,0.3)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {MFA_DATA.map((item) => (
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
                  {SUSPICIOUS.slice(0, 3).map((item, i) => (
                    <SuperAdminListRow key={i}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <AlertTriangle size={14} style={{ color: SEVERITY_COLOR[item.severity] }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.type}</p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.user} · {item.time}</p>
                          </div>
                        </div>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: `${SEVERITY_COLOR[item.severity]}18`, color: SEVERITY_COLOR[item.severity] }}>
                          {item.severity}
                        </span>
                      </div>
                    </SuperAdminListRow>
                  ))}
                </div>
              </SuperAdminSection>

              <SuperAdminSection title="Actions de sécurité" subtitle="Configurations recommandées.">
                <div className="space-y-3">
                  {[
                    { label: "2FA obligatoire pour admins", done: true },
                    { label: "Password Policy (min 12 chars)", done: true },
                    { label: "Session timeout 30 min", done: false },
                    { label: "Rate limiting API", done: true },
                    { label: "Audit logs activés", done: true },
                    { label: "Backup chiffré", done: false },
                  ].map(({ label, done }) => (
                    <SuperAdminListRow key={label}>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {done
                            ? <CheckCircle2 size={14} style={{ color: "#22C55E" }} />
                            : <XCircle size={14} style={{ color: "#EF4444" }} />}
                          <span style={{ color: "var(--text-primary)" }}>{label}</span>
                        </div>
                        {!done && <SuperAdminGhostButton className="px-2 py-1 text-[10px]">Activer</SuperAdminGhostButton>}
                      </div>
                    </SuperAdminListRow>
                  ))}
                </div>
              </SuperAdminSection>
            </div>
          )}

          {/* ── IPs Bloquées ── */}
          {activeTab === "IPs Bloquées" && (
            <SuperAdminSection
              title="IPs bloquées"
              subtitle={`${BLOCKED_IPS.length} adresses IP actuellement bloquées.`}
              action={<SuperAdminGhostButton>Débloquer tout</SuperAdminGhostButton>}
            >
              <div className="space-y-3">
                {BLOCKED_IPS.map((item) => (
                  <SuperAdminListRow key={item.ip}>
                    <div className="flex items-center justify-between gap-3">
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
                      <div className="flex gap-2">
                        <SuperAdminGhostButton className="px-2 py-1 text-[10px]"><Eye size={11} /> Voir</SuperAdminGhostButton>
                        <SuperAdminGhostButton className="px-2 py-1 text-[10px]"><Ban size={11} /> Débloquer</SuperAdminGhostButton>
                      </div>
                    </div>
                  </SuperAdminListRow>
                ))}
              </div>
            </SuperAdminSection>
          )}

          {/* ── Activité suspecte ── */}
          {activeTab === "Activité suspecte" && (
            <SuperAdminSection title="Activités suspectes" subtitle="Événements de sécurité détectés et classifiés.">
              <div className="space-y-3">
                {SUSPICIOUS.map((item, i) => (
                  <SuperAdminListRow key={i}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{ background: `${SEVERITY_COLOR[item.severity]}18` }}
                          animate={item.severity === "Critique"
                            ? { boxShadow: [`0 0 0px ${SEVERITY_COLOR[item.severity]}00`, `0 0 12px ${SEVERITY_COLOR[item.severity]}60`, `0 0 0px ${SEVERITY_COLOR[item.severity]}00`] }
                            : {}}
                          transition={{ duration: 1.8, repeat: Infinity }}
                        >
                          <AlertTriangle size={14} style={{ color: SEVERITY_COLOR[item.severity] }} />
                        </motion.div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.type}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.user} · IP {item.ip}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.time}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: `${SEVERITY_COLOR[item.severity]}18`, color: SEVERITY_COLOR[item.severity] }}>
                          {item.severity}
                        </span>
                        <SuperAdminGhostButton className="px-2 py-1 text-[10px]">Enquêter</SuperAdminGhostButton>
                      </div>
                    </div>
                  </SuperAdminListRow>
                ))}
              </div>
            </SuperAdminSection>
          )}

          {/* ── Abus API ── */}
          {activeTab === "Abus API" && (
            <SuperAdminSection title="Abus API détectés" subtitle="Endpoints dépassant les limites de rate limiting.">
              <div className="space-y-4">
                {API_ABUSE.map((item) => {
                  const pct = Math.min((item.calls / item.limit) * 100, 100);
                  const over = item.calls > item.limit;
                  return (
                    <SuperAdminListRow key={item.endpoint}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div>
                          <p className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>{item.endpoint}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.calls} req · limite {item.limit} req/min</p>
                        </div>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: over ? "#EF444418" : "#22C55E18", color: over ? "#EF4444" : "#22C55E" }}>
                          {over ? "Dépassé" : "OK"}
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: over ? "linear-gradient(90deg,#EF4444,#FF7A00)" : "#22C55E" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </SuperAdminListRow>
                  );
                })}
              </div>
            </SuperAdminSection>
          )}

          {/* ── MFA ── */}
          {activeTab === "MFA" && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <SuperAdminSection title="Adoption 2FA par rôle" subtitle="Taux d'activation par type d'utilisateur.">
                <div className="space-y-4">
                  {[
                    { role: "Super Admin", pct: 100 },
                    { role: "Admin Club", pct: 88 },
                    { role: "Responsable", pct: 82 },
                    { role: "Coach", pct: 55 },
                    { role: "Préparateur Physique", pct: 48 },
                    { role: "Analyste Performance", pct: 44 },
                    { role: "Recruteur", pct: 39 },
                    { role: "Scout", pct: 41 },
                    { role: "Finance", pct: 75 },
                    { role: "Médecin", pct: 30 },
                    { role: "Joueur", pct: 12 },
                  ].map(({ role, pct }) => (
                    <div key={role}>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span style={{ color: "var(--text-primary)" }}>{role}</span>
                        <span style={{ color: pct >= 70 ? "#22C55E" : pct >= 50 ? "#FF7A00" : "#EF4444" }}>{pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: pct >= 70 ? "#22C55E" : pct >= 50 ? "#FF7A00" : "#EF4444" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SuperAdminSection>

              <SuperAdminSection title="Actions recommandées" subtitle="Améliorer la sécurité de la plateforme.">
                <div className="space-y-3">
                  {[
                    { label: "Forcer 2FA pour les Responsables Club", priority: "Haute" },
                    { label: "Notifier Scouts sans 2FA (59%)", priority: "Normale" },
                    { label: "Politique de session stricte", priority: "Haute" },
                    { label: "Rapport mensuel sécurité PDF", priority: "Normale" },
                  ].map(({ label, priority }) => (
                    <SuperAdminListRow key={label}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <ShieldAlert size={13} style={{ color: SEVERITY_COLOR[priority] ?? "#3B82F6" }} />
                          <span style={{ color: "var(--text-primary)" }}>{label}</span>
                        </div>
                        <SuperAdminGhostButton className="shrink-0 px-2 py-1 text-[10px]">Appliquer</SuperAdminGhostButton>
                      </div>
                    </SuperAdminListRow>
                  ))}
                </div>
              </SuperAdminSection>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </SuperAdminPageTransition>
  );
}
