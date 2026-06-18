import { AlertTriangle, Bot, CalendarDays, ChartColumn, CheckCircle2, Handshake, Search, ShieldCheck, TrendingUp, CheckCheck, X } from "lucide-react";
import { motion } from "framer-motion";
import { KpiFormation } from "./KpiFormation";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const KPI_CARDS = [
  { label: "Effectif", value: "27", note: "3 groupes actifs" },
  { label: "Blessés", value: "3", note: "Disponibilité 89%" },
  { label: "Contrats expirants", value: "4", note: "90 / 60 / 30 jours" },
  { label: "Prospects à valider", value: "8", note: "Demandes coach en attente" },
  { label: "Budget restant", value: "184 000 DT", note: "Suivi mensuel" },
  { label: "Présence entraînement", value: "92%", note: "Semaine courante" },
  { label: "ODIN Club Score", value: "87/100", note: "Indice global" },
];

const PROSPECTS = [
  { name: "Youssef Ben Ali", age: 17, position: "Attaquant", club: "AS Ariana", nationality: "TN", potential: 89 },
  { name: "Nader Trabelsi", age: 19, position: "Milieu défensif", club: "Stade Tunisien", nationality: "TN", potential: 84 },
  { name: "Mouhamed Diallo", age: 21, position: "Ailier", club: "AFAD Djékanou", nationality: "CI", potential: 81 },
];

const REPORTS = [
  { label: "Rapport sportif", items: ["Classement", "Victoires", "Défaites", "ODIN Score"] },
  { label: "Rapport financier", items: ["Budget", "Revenus", "Dépenses", "Cash flow"] },
  { label: "Rapport recrutement", items: ["Prospects", "Recrutés", "Refusés"] },
  { label: "Rapport médical", items: ["Blessures", "Temps moyen de récupération"] },
];

const AI_INSIGHTS = [
  { label: "Player Performance Index", value: "Ahmed — 88/100", tone: "success" as const },
  { label: "Injury Risk", value: "12%", tone: "warning" as const },
  { label: "Talent Ranking", value: "Top Prospects", tone: "info" as const },
  { label: "Budget Forecast", value: "6 / 12 mois", tone: "neutral" as const },
];

const NOTIFICATIONS = [
  "Contrat expire bientôt",
  "Joueur blessé",
  "Prospect validé",
  "Budget dépassé",
  "Match demain",
  "Nouvelle facture",
];

const VALIDATION_QUEUE = [
  { title: "Recrutement joueur", subtitle: "Youssef Ben Ali", tone: "info" as const },
  { title: "Renouvellement contrat", subtitle: "Ahmed Ben Salah", tone: "warning" as const },
  { title: "Dépense exceptionnelle", subtitle: "40 000 DT", tone: "danger" as const },
];

const DECISION_HISTORY = [
  { date: "12/06/2026", type: "Recrutement", description: "Youssef Ben Ali", decision: "Accepté", tone: "success" as const },
  { date: "10/06/2026", type: "Renouvellement", description: "Ahmed Ben Salah", decision: "Accepté", tone: "success" as const },
  { date: "08/06/2026", type: "Dépense", description: "Équipement médical", decision: "Refusée", tone: "danger" as const },
  { date: "05/06/2026", type: "Recrutement", description: "Nader Trabelsi", decision: "Accepté", tone: "success" as const },
  { date: "02/06/2026", type: "Budget", description: "Dépense marketing", decision: "Refusée", tone: "danger" as const },
];

function SectionLabel({ icon: Icon, title, subtitle }: { icon: typeof AlertTriangle; title: string; subtitle: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-4 flex items-start gap-3"
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-odin-md)]"
        style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
      >
        <Icon size={17} />
      </div>
      <div>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
      </div>
    </motion.div>
  );
}

export function Dashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <KpiFormation />
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        variants={containerVariants}
      >
        {KPI_CARDS.map((card) => (
          <motion.div 
            key={card.label} 
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <GlassCard className="p-5">
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{card.label}</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{card.value}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{card.note}</p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="grid grid-cols-1 gap-6 xl:grid-cols-3" variants={containerVariants}>
        <motion.div 
          variants={itemVariants}
          className="xl:col-span-2"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <GlassCard raised className="p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <SectionLabel icon={CheckCircle2} title="Centre de Validation" subtitle="Demandes en attente de décision" />
              <Badge tone="info">3 demandes</Badge>
            </div>

            <motion.div className="space-y-3" variants={containerVariants}>
              {VALIDATION_QUEUE.map((item, index) => (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  className="rounded-[var(--radius-odin-md)] border px-4 py-3"
                  style={{ borderColor: "var(--surface-panel-border)", background: "var(--surface-panel)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>[{index + 1}] {item.title}</p>
                      <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.subtitle}</p>
                    </div>
                    <Badge tone={item.tone}>{item.title}</Badge>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div className="mt-4 flex flex-wrap gap-2" variants={itemVariants}>
              <Button type="button">Accepter</Button>
              <Button type="button" variant="ghost">Refuser</Button>
            </motion.div>
          </GlassCard>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <GlassCard className="p-6">
            <SectionLabel icon={CalendarDays} title="Notifications intelligentes" subtitle="Résumé des événements à traiter" />
            <motion.div className="flex flex-wrap gap-2" variants={containerVariants}>
              {NOTIFICATIONS.map((item) => (
                <motion.div
                  key={item}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge tone="neutral">{item}</Badge>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <GlassCard raised className="p-6">
            <SectionLabel icon={CalendarDays} title="Historique des Décisions" subtitle="Traçabilité des validations" />
            <motion.div className="space-y-2" variants={containerVariants}>
              {DECISION_HISTORY.map((item) => (
                <motion.div
                  key={`${item.date}-${item.type}`}
                  variants={itemVariants}
                  whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
                  className="rounded-[var(--radius-odin-md)] border px-4 py-3 transition-colors"
                  style={{ borderColor: "var(--surface-panel-border)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{item.date}</p>
                      <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.type}</p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.tone === "success" ? (
                        <CheckCheck size={16} style={{ color: "var(--color-state-success)" }} />
                      ) : (
                        <X size={16} style={{ color: "var(--color-state-danger)" }} />
                      )}
                      <Badge tone={item.tone}>{item.decision}</Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <GlassCard className="p-6">
            <SectionLabel icon={Search} title="Scouting" subtitle="Prospects et validation recrutement" />
            <motion.div className="space-y-3" variants={containerVariants}>
              {PROSPECTS.map((prospect) => (
                <motion.div
                  key={prospect.name}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  className="rounded-[var(--radius-odin-md)] border px-4 py-3"
                  style={{ borderColor: "var(--surface-panel-border)", background: "var(--surface-panel)" }}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{prospect.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{prospect.age} ans · {prospect.position} · {prospect.club}</p>
                    </div>
                    <Badge tone="info">Potentiel {prospect.potential}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span>Nationalité {prospect.nationality}</span>
                    <span>•</span>
                    <span>Rapport scout disponible</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div className="mt-4 flex flex-wrap gap-2" variants={itemVariants}>
              <Button type="button" variant="glass"><Handshake size={15} /> Valider une demande</Button>
              <Button type="button" variant="ghost"><TrendingUp size={15} /> Voir le pipeline</Button>
            </motion.div>
          </GlassCard>
        </motion.div>
      </motion.div>

      <motion.div className="grid grid-cols-1 gap-6 xl:grid-cols-2" variants={containerVariants}>
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <GlassCard className="p-6">
            <SectionLabel icon={ChartColumn} title="Reports" subtitle="Synthèse des rapports métiers" />
            <motion.div className="grid gap-3 sm:grid-cols-2" variants={containerVariants}>
              {REPORTS.map((report) => (
                <motion.div 
                  key={report.label} 
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-[var(--radius-odin-md)] border px-4 py-3" 
                  style={{ borderColor: "var(--surface-panel-border)" }}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{report.label}</p>
                    <Badge tone="info">OK</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {report.items.map((item) => <Badge key={item} tone="neutral">{item}</Badge>)}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <GlassCard raised className="p-6">
            <SectionLabel icon={Bot} title="ODIN AI" subtitle="Score, risque blessure et budget forecast" />
            <motion.div className="grid gap-3 sm:grid-cols-2" variants={containerVariants}>
              {AI_INSIGHTS.map((insight) => (
                <motion.div 
                  key={insight.label} 
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  className="rounded-[var(--radius-odin-md)] border px-4 py-3" 
                  style={{ borderColor: "var(--surface-panel-border)" }}
                >
                  <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{insight.label}</p>
                  <p className="mt-2 text-base font-semibold" style={{ color: "var(--text-primary)" }}>{insight.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <GlassCard className="p-6">
          <SectionLabel icon={ShieldCheck} title="Permissions Responsable Club" subtitle="Vue autorisée et périmètre de contrôle" />
          <motion.div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" variants={containerVariants}>
            {[
              ["Voir tous les joueurs", "Voir statistiques", "Voir finances"],
              ["Voir contrats", "Voir scouting", "Voir rapports"],
              ["Valider recrutement", "Valider contrats", "Valider budgets"],
              ["Pas de gestion utilisateurs", "Pas de rôles", "Pas de configuration système"],
            ].map((group, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="rounded-[var(--radius-odin-md)] border px-4 py-3" 
                style={{ borderColor: "var(--surface-panel-border)" }}
              >
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {index < 3 ? <CheckCircle2 size={15} style={{ color: "var(--color-state-success)" }} /> : <AlertTriangle size={15} style={{ color: "var(--color-state-danger)" }} />}
                  {index < 3 ? "Autorisé" : "Interdit"}
                </div>
                <div className="mt-3 space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {group.map((item) => (
                    <div key={item} className="flex items-center gap-2"><span className="text-xs">•</span><span>{item}</span></div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
