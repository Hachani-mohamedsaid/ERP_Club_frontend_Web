import { useState } from "react";
import { TrendingUp, TrendingDown, ArrowRightLeft, RefreshCw, Plus, X, Trash2 } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useFinanceBackendData, type BackendTransfer } from "../hooks/useFinanceBackendData";
import { clubApi } from "../lib/api/club";

type TransferBadgeTone = "danger" | "success" | "info" | "warning" | "neutral";

const TRANSFER_TYPES = [
  { value: "ACHAT", label: "Achat" },
  { value: "VENTE", label: "Vente" },
  { value: "PRET", label: "Prêt" },
  { value: "RETOUR_PRET", label: "Retour prêt" },
  { value: "GRATUIT", label: "Gratuit" },
] as const;

const TYPE_CONFIG: Record<string, { color: string; icon: string; tone: TransferBadgeTone }> = {
  ACHAT: { color: "#EF4444", icon: "📥", tone: "danger" },
  VENTE: { color: "#10B981", icon: "📤", tone: "success" },
  PRET: { color: "#3B82F6", icon: "🔄", tone: "info" },
  RETOUR_PRET: { color: "#8B5CF6", icon: "↩️", tone: "neutral" },
  GRATUIT: { color: "#6B7280", icon: "🤝", tone: "neutral" },
};

function getConfig(t: BackendTransfer) {
  const key = (t.transferType ?? "").toUpperCase();
  return TYPE_CONFIG[key] ?? TYPE_CONFIG.PRET;
}

function getTransferLabel(t: BackendTransfer) {
  const map: Record<string, string> = {
    ACHAT: "Achat",
    VENTE: "Vente",
    PRET: "Prêt",
    RETOUR_PRET: "Retour prêt",
    GRATUIT: "Gratuit",
  };
  return map[(t.transferType ?? "").toUpperCase()] ?? t.transferType;
}

export function TransfertsFinance() {
  const { transfers, loading, refetch } = useFinanceBackendData();
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    playerName: "",
    transferType: "ACHAT",
    club: "",
    fee: "",
  });

  const achats = transfers.filter((t) => (t.transferType ?? "").toUpperCase() === "ACHAT");
  const ventes = transfers.filter((t) => (t.transferType ?? "").toUpperCase() === "VENTE");

  const totalAchats = achats.reduce((s, t) => s + Math.abs(t.fee), 0);
  const totalVentes = ventes.reduce((s, t) => s + Math.abs(t.fee), 0);
  const benefice = totalVentes - totalAchats;

  const kpiCards = [
    { label: "Achats", value: `${(totalAchats / 1000).toFixed(0)} K DT`, change: `${achats.length} transfert(s)`, icon: TrendingDown, color: "#EF4444" },
    { label: "Ventes", value: `${(totalVentes / 1000).toFixed(0)} K DT`, change: `${ventes.length} transfert(s)`, icon: TrendingUp, color: "#10B981" },
    { label: "Bénéfice", value: `${benefice >= 0 ? "+" : ""}${(benefice / 1000).toFixed(0)} K DT`, change: benefice >= 0 ? "positif" : "négatif", icon: ArrowRightLeft, color: benefice >= 0 ? "#10B981" : "#EF4444" },
    { label: "Total transferts", value: String(transfers.length), change: "saison en cours", icon: ArrowRightLeft, color: "#F59E0B" },
  ];

  const handleCreate = async () => {
    if (!form.playerName.trim()) return;
    setSaving(true);
    try {
      const fee = form.fee ? Number(form.fee) : 0;
      await clubApi.createTransfer({
        playerName: form.playerName.trim(),
        transferType: form.transferType,
        club: form.club.trim(),
        fee,
        value: fee > 0 ? `${fee.toLocaleString("fr-FR")} DT` : "0",
        status: "Confirmé",
      });
      setShowAdd(false);
      setForm({ playerName: "", transferType: "ACHAT", club: "", fee: "" });
      await refetch();
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await clubApi.deleteTransfer(id);
      await refetch();
    } catch {
      /* silent */
    } finally {
      setDeletingId(null);
    }
  };

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Gestion des Transferts</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Achats et ventes de joueurs — synchronisés avec la comptabilité (catégorie Transferts)
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={14} className="mr-1" /> Nouveau transfert
        </Button>
      </div>

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

      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Historique des Transferts</h2>
        {transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ArrowRightLeft size={36} style={{ color: "var(--text-muted)" }} className="mb-3" />
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Aucun transfert enregistré</p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              Ajoutez un achat ou une vente pour alimenter la trésorerie et les alertes budget.
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
                        {transfer.playerName || "Joueur"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(transfer.createdAt).toLocaleDateString("fr-FR")}
                        {transfer.club ? ` · ${transfer.club}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {transfer.fee !== 0 ? (
                      <p className="font-semibold" style={{ color: signed >= 0 ? "#10B981" : "#EF4444" }}>
                        {signed >= 0 ? "+" : ""}{signed.toLocaleString("fr-TN")} DT
                      </p>
                    ) : (
                      <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>Gratuit</p>
                    )}
                    <Badge tone={config.tone}>{getTransferLabel(transfer)}</Badge>
                    <button
                      type="button"
                      onClick={() => void handleDelete(transfer.id)}
                      disabled={deletingId === transfer.id}
                      className="rounded-lg p-1.5 opacity-60 hover:opacity-100"
                      style={{ color: "#EF4444" }}
                      aria-label="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowAdd(false)}
        >
          <GlassCard raised className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Nouveau transfert</h2>
              <button type="button" onClick={() => setShowAdd(false)} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                placeholder="Nom du joueur"
                value={form.playerName}
                onChange={(e) => setForm((f) => ({ ...f, playerName: e.target.value }))}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
              />
              <select
                value={form.transferType}
                onChange={(e) => setForm((f) => ({ ...f, transferType: e.target.value }))}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
              >
                {TRANSFER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <input
                placeholder="Club (origine ou destination)"
                value={form.club}
                onChange={(e) => setForm((f) => ({ ...f, club: e.target.value }))}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
              />
              <input
                type="number"
                min={0}
                placeholder="Montant (DT) — achats/ventes uniquement"
                value={form.fee}
                onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                style={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
              />
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setShowAdd(false)}>Annuler</Button>
              <Button className="flex-1" disabled={saving || !form.playerName.trim()} onClick={() => void handleCreate()}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
