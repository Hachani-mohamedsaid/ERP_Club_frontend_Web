import { motion } from "framer-motion";
import { Eye, Edit, RotateCcw, X, Calendar, Users, DollarSign } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";

const CONTRACTS = [
  {
    id: 1,
    player: "Youssef Ben Ali",
    age: 22,
    salary: 85000,
    prime: 12000,
    debut: "2023-08-01",
    fin: "2026-06-30",
    status: "actif",
  },
  {
    id: 2,
    player: "Mohamed Diallo",
    age: 28,
    salary: 95000,
    prime: 15000,
    debut: "2022-01-15",
    fin: "2025-12-31",
    status: "expiring",
  },
  {
    id: 3,
    player: "Nader Trabelsi",
    age: 25,
    salary: 78000,
    prime: 10000,
    debut: "2023-06-01",
    fin: "2027-05-31",
    status: "actif",
  },
  {
    id: 4,
    player: "Ali Ben Amor",
    age: 31,
    salary: 120000,
    prime: 20000,
    debut: "2021-07-01",
    fin: "2025-06-30",
    status: "expiring",
  },
  {
    id: 5,
    player: "Rami Makhlouf",
    age: 19,
    salary: 45000,
    prime: 5000,
    debut: "2024-01-01",
    fin: "2026-12-31",
    status: "actif",
  },
];

const TIMELINE_EVENTS = [
  { year: 2023, event: "Signature du contrat", type: "signature" },
  { year: 2024, event: "Renouvellement automatique", type: "renewal" },
  { year: 2025, event: "Revalorisation de 5%", type: "upgrade" },
  { year: 2026, event: "Fin du contrat", type: "end" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function ContratsPage() {
  const [selectedContract, setSelectedContract] = useState<(typeof CONTRACTS)[0] | null>(null);

  const getStatusColor = (status: string) => {
    return status === "expiring" ? "warning" : "success";
  };

  const getStatusLabel = (status: string) => {
    return status === "expiring" ? "À renouveler" : "Actif";
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
          Gestion des Contrats Joueurs
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Suivi des contrats et informations détaillées
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <GlassCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                  Contrats Actifs
                </p>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  5
                </p>
              </div>
              <Users size={24} style={{ color: "var(--accent)", opacity: 0.5 }} />
            </div>
          </GlassCard>
        </motion.div>
        <motion.div variants={itemVariants}>
          <GlassCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                  À Renouveler
                </p>
                <p className="text-2xl font-bold" style={{ color: "#F59E0B" }}>
                  2
                </p>
              </div>
              <Calendar size={24} style={{ color: "#F59E0B", opacity: 0.5 }} />
            </div>
          </GlassCard>
        </motion.div>
        <motion.div variants={itemVariants}>
          <GlassCard className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                  Masse Salariale Annuelle
                </p>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  1.82M €
                </p>
              </div>
              <DollarSign size={24} style={{ color: "var(--accent)", opacity: 0.5 }} />
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Contracts Table */}
      <motion.div variants={itemVariants}>
        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Liste des Contrats
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                  <th className="py-3 text-left text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    Joueur
                  </th>
                  <th className="py-3 text-left text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    Âge
                  </th>
                  <th className="py-3 text-right text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    Salaire/Mois
                  </th>
                  <th className="py-3 text-right text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    Prime
                  </th>
                  <th className="py-3 text-center text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    Fin
                  </th>
                  <th className="py-3 text-center text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    Statut
                  </th>
                  <th className="py-3 text-center text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {CONTRACTS.map((contract, idx) => (
                  <motion.tr
                    key={idx}
                    variants={itemVariants}
                    style={{ borderBottom: "1px solid var(--surface-panel-border)" }}
                  >
                    <td className="py-4 text-sm" style={{ color: "var(--text-primary)" }}>
                      <span className="font-medium">{contract.player}</span>
                    </td>
                    <td className="py-4 text-sm" style={{ color: "var(--text-primary)" }}>
                      {contract.age}
                    </td>
                    <td className="py-4 text-right text-sm font-semibold" style={{ color: "var(--accent)" }}>
                      {contract.salary.toLocaleString("fr-FR")} €
                    </td>
                    <td className="py-4 text-right text-sm" style={{ color: "var(--text-primary)" }}>
                      {contract.prime.toLocaleString("fr-FR")} €
                    </td>
                    <td className="py-4 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                      {new Date(contract.fin).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-4 text-center">
                      <Badge tone={getStatusColor(contract.status)}>
                        {getStatusLabel(contract.status)}
                      </Badge>
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedContract(contract)}
                          className="p-1.5 hover:bg-accent/10 rounded transition-colors"
                          title="Voir détails"
                        >
                          <Eye size={16} style={{ color: "var(--accent)" }} />
                        </button>
                        <button className="p-1.5 hover:bg-accent/10 rounded transition-colors" title="Modifier">
                          <Edit size={16} style={{ color: "var(--accent)" }} />
                        </button>
                        <button className="p-1.5 hover:bg-accent/10 rounded transition-colors" title="Renouveler">
                          <RotateCcw size={16} style={{ color: "var(--accent)" }} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      {/* Contract Details Modal */}
      {selectedContract && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-2xl bg-[var(--surface-panel)] rounded-2xl overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {selectedContract.player}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    Détails du contrat
                  </p>
                </div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} style={{ color: "var(--text-primary)" }} />
                </button>
              </div>

              {/* Information Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Infos Personnelles */}
                <div>
                  <h3 className="text-xs uppercase font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
                    Informations Personnelles
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Âge
                      </p>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {selectedContract.age} ans
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informations Financières */}
                <div>
                  <h3 className="text-xs uppercase font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
                    Informations Financières
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Salaire mensuel
                      </p>
                      <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                        {selectedContract.salary.toLocaleString("fr-FR")} €
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Prime victoire
                      </p>
                      <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                        {selectedContract.prime.toLocaleString("fr-FR")} €
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historique Timeline */}
              <div className="mb-6">
                <h3 className="text-xs uppercase font-semibold mb-4" style={{ color: "var(--text-muted)" }}>
                  Historique du Contrat
                </h3>
                <div className="space-y-3">
                  {TIMELINE_EVENTS.map((event, idx) => (
                    <motion.div
                      key={idx}
                      className="flex gap-4"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ background: "var(--accent)" }}
                        />
                        {idx < TIMELINE_EVENTS.length - 1 && (
                          <div
                            className="w-0.5 h-12"
                            style={{ background: "var(--surface-panel-border)" }}
                          />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {event.year} - {event.event}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  className="flex-1 py-2.5 rounded-lg font-medium transition-all"
                  style={{
                    background: "var(--accent)",
                    color: "white",
                  }}
                >
                  Renouveler
                </button>
                <button
                  className="flex-1 py-2.5 rounded-lg font-medium border transition-all"
                  style={{
                    borderColor: "var(--surface-panel-border)",
                    color: "var(--accent)",
                  }}
                >
                  Modifier
                </button>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="flex-1 py-2.5 rounded-lg font-medium border transition-all"
                  style={{
                    borderColor: "var(--surface-panel-border)",
                    color: "var(--text-primary)",
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
