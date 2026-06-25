import { motion } from "framer-motion";
import { Star, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const SPONSORS_DATA = [
  {
    id: 1,
    name: "Nike",
    logo: "🏢",
    montant: 450000,
    debut: "2023-01-01",
    fin: "2025-12-31",
    paiements: 900000,
    restants: 450000,
    status: "actif",
  },
  {
    id: 2,
    name: "Emirates",
    logo: "✈️",
    montant: 350000,
    debut: "2024-01-01",
    fin: "2026-12-31",
    paiements: 700000,
    restants: 350000,
    status: "actif",
  },
  {
    id: 3,
    name: "Ooredoo",
    logo: "📱",
    montant: 280000,
    debut: "2023-06-01",
    fin: "2025-05-31",
    paiements: 420000,
    restants: 140000,
    status: "expiring",
  },
  {
    id: 4,
    name: "STEG",
    logo: "⚡",
    montant: 200000,
    debut: "2024-03-01",
    fin: "2026-02-28",
    paiements: 400000,
    restants: 200000,
    status: "actif",
  },
];

const SPONSORS_PIE = [
  { name: "Nike", value: 450000 },
  { name: "Emirates", value: 350000 },
  { name: "Ooredoo", value: 280000 },
  { name: "STEG", value: 200000 },
];

const SPONSOR_PAYMENT_CHART = [
  { name: "Nike", paiements: 900000, restants: 450000 },
  { name: "Emirates", paiements: 700000, restants: 350000 },
  { name: "Ooredoo", paiements: 420000, restants: 140000 },
  { name: "STEG", paiements: 400000, restants: 200000 },
];

const COLORS = ["#FF6B57", "#22C55E", "#38BDF8", "#8B5CF6"];

const KPI_SPONSORS = [
  { label: "Sponsors Actifs", value: "4", icon: Star, color: "#38BDF8" },
  { label: "Revenus Sponsors", value: "1.28M €", icon: DollarSign, color: "#22C55E" },
  { label: "Contrats Expirants", value: "1", icon: Calendar, color: "#F59E0B" },
  { label: "Croissance YoY", value: "+18%", icon: TrendingUp, color: "#34D399" },
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

export function SponsorsPage() {
  const [selectedSponsor, setSelectedSponsor] = useState<(typeof SPONSORS_DATA)[0] | null>(null);

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
          Gestion des Sponsors
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Suivi des partenaires et des revenus de sponsoring
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        {KPI_SPONSORS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div key={idx} variants={itemVariants}>
              <GlassCard className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: `${card.color}15` }}
                  >
                    <Icon size={20} style={{ color: card.color }} />
                  </div>
                </div>
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                  {card.label}
                </p>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {card.value}
                </p>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts */}
      <motion.div className="grid grid-cols-1 gap-6 lg:grid-cols-2" variants={containerVariants}>
        {/* Revenue Distribution */}
        <motion.div variants={itemVariants}>
          <GlassCard raised className="p-6">
            <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              📊 Répartition des Revenus
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SPONSORS_PIE}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {SPONSORS_PIE.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-panel)",
                      border: "1px solid var(--surface-panel-border)",
                      color: "var(--text-primary)",
                    }}
                    formatter={(value: any) => `${(value / 1000).toFixed(0)}K €`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Payment Status */}
        <motion.div variants={itemVariants}>
          <GlassCard raised className="p-6">
            <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              💰 Statut des Paiements
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SPONSOR_PAYMENT_CHART}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-panel)",
                      border: "1px solid var(--surface-panel-border)",
                      color: "var(--text-primary)",
                    }}
                    formatter={(value: any) => `${(value / 1000).toFixed(0)}K €`}
                  />
                  <Legend />
                  <Bar dataKey="paiements" fill="#22C55E" isAnimationActive={true} />
                  <Bar dataKey="restants" fill="#FF6B57" isAnimationActive={true} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Sponsors List */}
      <motion.div variants={itemVariants}>
        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Liste des Sponsors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPONSORS_DATA.map((sponsor) => (
              <motion.div
                key={sponsor.id}
                className="p-4 rounded-lg border cursor-pointer hover:border-accent/50 transition-all"
                style={{ borderColor: "var(--surface-panel-border)" }}
                onClick={() => setSelectedSponsor(sponsor)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{sponsor.logo}</span>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {sponsor.name}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {new Date(sponsor.fin).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-bold" style={{ color: "var(--accent)" }}>
                    {(sponsor.montant / 1000).toFixed(0)}K € / an
                  </p>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{
                      background:
                        sponsor.status === "actif" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                      color: sponsor.status === "actif" ? "#22C55E" : "#F59E0B",
                    }}
                  >
                    {sponsor.status === "actif" ? "Actif" : "Expire bientôt"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Sponsor Details Modal */}
      {selectedSponsor && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedSponsor(null)}
        >
          <motion.div
            className="w-full max-w-md bg-[var(--surface-panel)] rounded-2xl p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <p className="text-4xl mb-2">{selectedSponsor.logo}</p>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {selectedSponsor.name}
              </h2>
            </div>
            <div className="space-y-3 mb-6">
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-panel-border)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                  Montant Annuel
                </p>
                <p className="font-bold text-lg" style={{ color: "var(--accent)" }}>
                  {selectedSponsor.montant.toLocaleString("fr-FR")} €
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg" style={{ background: "var(--surface-panel-border)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                    Paiements Reçus
                  </p>
                  <p className="font-semibold" style={{ color: "#22C55E" }}>
                    {(selectedSponsor.paiements / 1000).toFixed(0)}K €
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: "var(--surface-panel-border)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                    Restants
                  </p>
                  <p className="font-semibold" style={{ color: "#FF6B57" }}>
                    {(selectedSponsor.restants / 1000).toFixed(0)}K €
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "var(--surface-panel-border)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                  Durée du Contrat
                </p>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {new Date(selectedSponsor.debut).toLocaleDateString("fr-FR")} - {new Date(selectedSponsor.fin).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedSponsor(null)}
              className="w-full py-2.5 rounded-lg font-medium border transition-all"
              style={{
                borderColor: "var(--surface-panel-border)",
                color: "var(--accent)",
              }}
            >
              Fermer
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
