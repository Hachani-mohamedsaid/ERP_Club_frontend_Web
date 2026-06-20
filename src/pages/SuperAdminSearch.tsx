import { GlassCard } from "../components/ui/GlassCard";
import { Search } from "lucide-react";

const ITEMS = [
  { label: "Club - FC Carthage", path: "/superadmin/clubs/1" },
  { label: "Utilisateur - Amine Mansour", path: "/superadmin/users/u1" },
  { label: "Facture - INV-001", path: "/superadmin/payments" },
  { label: "Ticket - SUP-001", path: "/superadmin/support" },
  { label: "Contrat - CT-028", path: "/superadmin/clubs" },
];

export function SuperAdminSearch() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Global Search
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Spotlight pour retrouver club, utilisateur, facture ou ticket.
          </p>
        </div>
      </div>

      <GlassCard raised className="p-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            className="w-full rounded-[var(--radius-odin-md)] border bg-transparent px-12 py-3 text-sm"
            style={{ borderColor: "var(--surface-panel-border)" }}
            placeholder="Rechercher un club, utilisateur, facture, ticket ou contrat..."
          />
        </div>
      </GlassCard>

      <GlassCard raised className="p-6">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Résultats rapides</h2>
        <div className="mt-4 space-y-3">
          {ITEMS.map((item) => (
            <div key={item.label} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.label}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.path}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
