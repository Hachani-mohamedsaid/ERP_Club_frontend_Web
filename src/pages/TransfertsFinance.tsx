import { TrendingUp, TrendingDown, ArrowRightLeft, RefreshCw } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { useFinanceBackendData, BackendTransfer } from "../hooks/useFinanceBackendData";

type TransferBadgeTone = "danger" | "success" | "info" | "warning" | "neutral";

const TYPE_CONFIG: Record<string, { color: string; icon: string; tone: TransferBadgeTone }> = {
  ACHAT: { color: "#EF4444", icon: "📥", tone: "danger" },
  VENTE: { color: "#10B981", icon: "📤", tone: "success" },
  PRET: { color: "#3B82F6", icon: "🔄", tone: "info" },
  RETOUR_PRET: { color: "#8B5CF6", icon: "↩️", tone: "neutral" },
  GRATUIT: { color: "#6B7280", icon: "🤝", tone: "neutral" },
};

function getConfig(t: BackendTransfer) {
  const key = (t.transferType ?? "").toUpperCase();
  return TYPE_CONFIG[key] ?? TYPE_CONFIG["PRET"];
}

function getTransferLabel(t: BackendTransfer) {
  const map: Record<string, string> = { ACHAT: "Achat", VENTE: "Vente", PRET: "Prêt", RETOUR_PRET: "Retour prêt", GRATUIT: "Gratuit" };
  return map[(t.transferType ?? "").toUpperCase()] ?? t.transferType;
}

export function TransfertsFinance() {
  const { transfers, loading, report } = useFinanceBackendData();

  const achats = transfers.filter(t => (t.transferType ?? "").toUpperCase() === "ACHAT");
  const ventes = transfers.filter(t => (t.transferType ?? "").toUpperCase() === "VENTE");

  const totalAchats = achats.reduce((s, t) => s + Math.abs(t.fee), 0);
  const totalVentes = ventes.reduce((s, t) => s + Math.abs(t.fee), 0);
  const benefice = totalVentes - totalAchats;

  const kpiCards = [
    { label: "Achats", value: `${(totalAchats / 1000).toFixed(0)} K DT`, change: String(achats.length) + " transfert(s)", icon: TrendingDown, color: "#EF4444" },
    { label: "Ventes", value: `${(totalVentes / 1000).toFixed(0)} K DT`, change: String(ventes.length) + " transfert(s)", icon: TrendingUp, color: "#10B981" },
    { label: "Bénéfice", value: `${benefice >= 0 ? "+" : ""}${(benefice / 1000).toFixed(0)} K DT`, change: benefice >= 0 ? "positif" : "négatif", icon: ArrowRightLeft, color: benefice >= 0 ? "#10B981" : "#EF4444" },
    { label: "Total transferts", value: String(transfers.length), change: "saison en cours", icon: ArrowRightLeft, color: "#F59E0B" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span className="ml-3 text-sm" style={{ color: "var(--text-muted)" }}>Chargement des transferts…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Gestion des Transferts</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Suivi des achats, ventes et prêts de joueurs</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <GlassCard key={kpi.label} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
                  <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{kpi.value}</p>
                  <p className="mt-1 text-xs font-medium" style={{ color: kpi.color }}>{kpi.change}</p>
                </div>
                <Icon size={20} style={{ color: kpi.color, opacity: 0.6 }} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Transfers List */}
      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Historique des Transferts</h2>
        {transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ArrowRightLeft size={36} style={{ color: "var(--text-muted)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Aucun transfert enregistré</p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              Les transferts des joueurs s'afficheront ici. Ils sont gérés depuis l'interface Club Admin.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transfers.map((transfer) => {
              const config = getConfig(transfer);
              const signed = (transfer.transferType ?? "").toUpperCase() === "VENTE" ? transfer.fee : -transfer.fee;
              return (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between rounded-lg p-4 transition-transform hover:scale-[1.01]"
                  style={{ border: "1px solid var(--surface-panel-border)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{config.icon}</span>
                    <div>
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                        {transfer.playerName ?? "Joueur"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(transfer.transferDate).toLocaleDateString("fr-FR")}
                        {transfer.fromClub && ` · ${transfer.fromClub}`}
                        {transfer.toClub && ` → ${transfer.toClub}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {transfer.fee !== 0 && (
                      <p className="font-semibold" style={{ color: signed >= 0 ? "#10B981" : "#EF4444" }}>
                        {signed >= 0 ? "+" : ""}{signed.toLocaleString("fr-TN")} DT
                      </p>
                    )}
                    {transfer.fee === 0 && (
                      <p className="font-semibold text-sm" style={{ color: "var(--text-muted)" }}>Gratuit</p>
                    )}
                    <Badge tone={config.tone}>{getTransferLabel(transfer)}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Info note */}
      <GlassCard className="p-4">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          ℹ️ <strong style={{ color: "var(--text-primary)" }}>Gestion des transferts :</strong> Les transferts sont créés et gérés par le <strong>Club Admin</strong> depuis l'interface "Club → Joueurs → Transferts". Le responsable Finance consulte les données ici en lecture seule.
        </p>
      </GlassCard>
    </div>
  );
}
