import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Server, Activity } from "lucide-react";

const KPI = [
  { label: "CPU", value: "65%" },
  { label: "RAM", value: "72%" },
  { label: "Storage", value: "60%" },
  { label: "Network", value: "42%" },
];

const SERVICES = [
  { name: "Frontend", status: "Online" },
  { name: "Backend", status: "Online" },
  { name: "Database", status: "Online" },
  { name: "Redis", status: "Online" },
  { name: "AI Service", status: "Offline" },
];

const METRICS = [
  { label: "API Requests", value: "5 600" },
  { label: "Latency", value: "120 ms" },
  { label: "Errors", value: "18" },
];

export function SuperAdminMonitoring() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Monitoring Plateforme
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Suivi temps réel des ressources et services.
          </p>
        </div>
        <Button variant="ghost">Actualiser</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI.map((item) => (
          <GlassCard raised key={item.label} className="p-4">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <GlassCard raised className="p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Graphes temps réel</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>API requests, latence, erreurs.</p>
            </div>
            <Activity size={20} />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {METRICS.map((metric) => (
              <div key={metric.label} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{metric.label}</p>
                <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{metric.value}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Services</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>État de la plateforme.</p>
            </div>
            <Server size={20} />
          </div>
          <div className="space-y-3">
            {SERVICES.map((service) => (
              <div key={service.name} className="flex items-center justify-between rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{service.name}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${service.status === "Online" ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#B91C1C]"}`}>{service.status === "Online" ? "🟢 Online" : "🔴 Offline"}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
