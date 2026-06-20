import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Lock, ShieldAlert } from "lucide-react";

const KPI = [
  { label: "Tentatives connexion", value: "112" },
  { label: "Utilisateurs bloqués", value: "27" },
  { label: "Sessions actives", value: "120" },
  { label: "Alertes", value: "8" },
];

const SUSPICIOUS = [
  { ip: "192.168.1.101", action: "Connexion suspecte", time: "18/06 15:22" },
  { ip: "192.168.1.200", action: "Trop de tentatives", time: "18/06 14:58" },
];

export function SuperAdminSecurity() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Sécurité
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Supervision des accès et risques de la plateforme.
          </p>
        </div>
        <Button variant="ghost">Paramètres sécurité</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI.map((item) => (
          <GlassCard raised key={item.label} className="p-4">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <GlassCard raised className="p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>IP suspectes</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Connexions critiques récentes.</p>
            </div>
            <Lock size={20} />
          </div>
          <div className="space-y-3">
            {SUSPICIOUS.map((item) => (
              <div key={item.ip} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.action}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.ip} · {item.time}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Actions critiques</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Audit et blocage rapide.</p>
            </div>
            <ShieldAlert size={20} />
          </div>
          <div className="space-y-3">
            {['2FA', 'Password Policy', 'Session Timeout'].map((item) => (
              <div key={item} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item}</p>
                <Button variant="ghost" size="sm" className="mt-2">Configurer</Button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
