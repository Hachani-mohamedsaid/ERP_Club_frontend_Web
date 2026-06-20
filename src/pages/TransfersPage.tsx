import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Share2, Activity } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";

const TRANSFERS = [
  {
    id: 1,
    player: "Hassan Maaloul",
    type: "achat",
    montant: 850000,
    date: "2024-01-15",
    club: "ES Sfaxien → FC Carthage",
  },
  {
    id: 2,
    player: "Youssef Ben Ali",
    type: "vente",
    montant: 1200000,
    date: "2024-02-20",
    club: "FC Carthage → AS Ariana",
  },
  {
    id: 3,
    player: "Mohamed Diallo",
    type: "pret_entrant",
    montant: 0,
    date: "2024-03-10",
    club: "Stade Tunisien → FC Carthage (2 saisons)",
  },
  {
    id: 4,
    player: "Nader Trabelsi",
    type: "achat",
    montant: 650000,
    date: "2024-04-05",
    club: "CA Bizertin → FC Carthage",
  },
  {
    id: 5,
    player: "Rami Makhlouf",
    type: "pret_sortant",
    montant: 0,
    date: "2024-05-12",
    club: "FC Carthage → JS Kairouan (1 saison)",
  },
];

const KPI_TRANSFERTS = [
  { label: "Total Achats", value: "1.5M €", trend: "↑ 8%", color: "#FF6B57" },
  { label: "Total Ventes", value: "1.2M €", trend: "↑ 12%", color: "#22C55E" },
  { label: "Prêts Entrants", value: 1, trend: "Stable", color: "#38BDF8" },
  { label: "Bénéfice Net", value: "0.3M €", trend: "↑ 15%", color: "#34D399" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function TransfersPage() {
  const [selectedTransfer, setSelectedTransfer] = useState<(typeof TRANSFERS)[0] | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "achat":
        return <ArrowDownLeft size={18} style={{ color: "#FF6B57" }} />;
      case "vente":
        return <ArrowUpRight size={18} style={{ color: "#22C55E" }} />;
      case "pret_entrant":
        return <Share2 size={18} style={{ color: "#38BDF8" }} />;
      case "pret_sortant":
        return <Share2 size={18} style={{ color: "#8B5CF6" }} />;
      default:
        return <Activity size={18} style={{ color: "var(--accent)" }} />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      achat: "Achat",
      vente: "Vente",
      pret_entrant: "Prêt entrant",
      pret_sortant: "Prêt sortant",
    };
    return labels[type] || type;
  };

  const getToneByType = (type: string) => {
    switch (type) {
      case "achat":
        return "warning" as const;
      case "vente":
        return "success" as const;
      default:
        return "info" as const;
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Gestion des Transferts
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Suivi des achats, ventes et prêts
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        {KPI_TRANSFERTS.map((card, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <GlassCard className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-2 h-8 rounded"
                  style={{ background: card.color }}
                />
                <span className="text-xs font-semibold" style={{ color: card.color }}>
                  {card.trend}
                </span>
              </div>
              <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                {card.label}
              </p>
              <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {card.value}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Transfers Timeline */}
      <motion.div variants={itemVariants}>
        <GlassCard raised className="p-6">
          <h2 className="mb-6 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Historique des Transferts
          </h2>
          <div className="space-y-3">
            {TRANSFERS.map((transfer, idx) => (
              <motion.div
                key={idx}
                className="p-4 rounded-lg border cursor-pointer hover:border-accent/50 transition-all"
                style={{ borderColor: "var(--surface-panel-border)" }}
                onClick={() => setSelectedTransfer(transfer)}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className="p-2.5 rounded-lg flex-shrink-0"
                      style={{
                        background:
                          transfer.type === "achat"
                            ? "#FF6B57"
                            : transfer.type === "vente"
                            ? "#22C55E"
                            : "#38BDF8",
                        opacity: 0.1,
                      }}
                    >
                      {getTypeIcon(transfer.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {transfer.player}
                      </p>
                      <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        {transfer.club}
                      </p>
                      <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                        {new Date(transfer.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {transfer.montant > 0 && (
                      <p
                        className="font-bold"
                        style={{
                          color:
                            transfer.type === "vente"
                              ? "#22C55E"
                              : transfer.type === "achat"
                              ? "#FF6B57"
                              : "var(--text-primary)",
                        }}
                      >
                        {transfer.type === "vente" ? "+" : "-"}
                        {(transfer.montant / 1000000).toFixed(2)}M €
                      </p>
                    )}
                    <Badge tone={getToneByType(transfer.type)}>
                      {getTypeLabel(transfer.type)}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Transfer Details Modal */}
      {selectedTransfer && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedTransfer(null)}
        >
          <motion.div
            className="w-full max-w-md bg-[var(--surface-panel)] rounded-2xl p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              {selectedTransfer.player}
            </h2>
            <div className="space-y-4">
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-panel-border)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                  Type
                </p>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {getTypeLabel(selectedTransfer.type)}
                </p>
              </div>
              {selectedTransfer.montant > 0 && (
                <div className="p-3 rounded-lg" style={{ background: "var(--surface-panel-border)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                    Montant
                  </p>
                  <p className="font-semibold text-lg" style={{ color: "var(--accent)" }}>
                    {selectedTransfer.montant.toLocaleString("fr-FR")} €
                  </p>
                </div>
              )}
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-panel-border)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                  Transfert
                </p>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {selectedTransfer.club}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-panel-border)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                  Date
                </p>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {new Date(selectedTransfer.date).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedTransfer(null)}
                className="w-full py-2.5 rounded-lg font-medium border transition-all"
                style={{
                  borderColor: "var(--surface-panel-border)",
                  color: "var(--accent)",
                }}
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
