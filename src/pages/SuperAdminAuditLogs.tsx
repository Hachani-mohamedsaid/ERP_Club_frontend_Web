import { useMemo } from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Search } from "lucide-react";

const LOGS = [
  { user: "Admin FC Carthage", action: "a supprimé un contrat", ip: "192.168.1.10", date: "18/06/2026 14:32", result: "Succès" },
  { user: "Support", action: "a suspendu un club", ip: "192.168.1.45", date: "18/06/2026 13:10", result: "Succès" },
  { user: "Admin System", action: "a modifié les paramètres sécurité", ip: "192.168.1.2", date: "17/06/2026 19:14", result: "Succès" },
];

export function SuperAdminAuditLogs() {
  const groupedLogs = useMemo(() => {
    return LOGS.reduce<Record<string, typeof LOGS>>((acc, log) => {
      const day = log.date.split(" ")[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(log);
      return acc;
    }, {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Audit Logs
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Historique des actions critiques et des accès.
          </p>
        </div>
        <Button variant="ghost">Exporter</Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            className="w-full rounded-[var(--radius-odin-md)] border bg-transparent px-10 py-2 text-sm"
            style={{ borderColor: "var(--surface-panel-border)" }}
            placeholder="User / Action / Date"
          />
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
          <span className="rounded-full border px-3 py-1" style={{ borderColor: "var(--surface-panel-border)" }}>User</span>
          <span className="rounded-full border px-3 py-1" style={{ borderColor: "var(--surface-panel-border)" }}>Action</span>
          <span className="rounded-full border px-3 py-1" style={{ borderColor: "var(--surface-panel-border)" }}>Date</span>
        </div>
      </div>

      <div className="grid gap-4">
        {Object.entries(groupedLogs).map(([day, logs]) => (
          <GlassCard raised className="p-6" key={day}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{day}</h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Timeline des actions</p>
              </div>
              <Button variant="ghost">Voir tout</Button>
            </div>
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.date} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}><strong>{log.user}</strong> {log.action}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{log.ip} · {log.date} · {log.result}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
