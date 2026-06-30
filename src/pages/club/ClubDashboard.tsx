import { CalendarDays, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { KpiFormation } from "../../components/dashboard/KpiFormation";
import { GlassCard } from "../../components/ui/GlassCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useResponsableDashboard } from "../../hooks/useResponsableDashboard";

function SectionLabel({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof CheckCircle2;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-odin-md)]"
        style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
      >
        <Icon size={17} />
      </div>
      <div>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function formatUpdatedAt(date: Date | null): string {
  if (!date) return "Mis à jour à l'instant";
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (mins < 1) return "Mis à jour à l'instant";
  if (mins === 1) return "Mis à jour il y a 1 min";
  return `Mis à jour il y a ${mins} min`;
}

export function ClubDashboard() {
  const navigate = useNavigate();
  const {
    loading,
    error,
    hasOrg,
    executiveKpis,
    secondaryKpis,
    validationQueue,
    pendingCount,
    smartNotifications,
    fetchedAt,
  } = useResponsableDashboard();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (!hasOrg) {
    return (
      <GlassCard className="p-6">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Connectez-vous avec votre compte club pour charger les données du dashboard.
        </p>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <p className="text-sm font-medium" style={{ color: "#EF4444" }}>
          {error}
        </p>
      </GlassCard>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16" style={{ color: "var(--text-muted)" }}>
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Chargement du dashboard…</span>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      <motion.div variants={itemVariants}>
        <KpiFormation items={executiveKpis} updatedLabel={formatUpdatedAt(fetchedAt)} />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        variants={containerVariants}
      >
        {secondaryKpis.map((card) => (
          <motion.div
            key={card.label}
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <GlassCard className="p-5">
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {card.value}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                {card.note}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="grid grid-cols-1 gap-6 xl:grid-cols-3" variants={containerVariants}>
        <motion.div variants={itemVariants} className="xl:col-span-2" whileHover={{ y: -5 }}>
          <GlassCard raised className="p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <SectionLabel
                icon={CheckCircle2}
                title="Centre de Validation"
                subtitle="Demandes en attente de décision"
              />
              <Badge tone="info">
                {pendingCount} demande{pendingCount !== 1 ? "s" : ""}
              </Badge>
            </div>

            {validationQueue.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Aucune demande en attente.
              </p>
            ) : (
              <div className="space-y-3">
                {validationQueue.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-[var(--radius-odin-md)] border px-4 py-3"
                    style={{ borderColor: "var(--surface-panel-border)", background: "var(--surface-panel)" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className="text-xs font-medium uppercase tracking-wide"
                          style={{ color: "var(--text-muted)" }}
                        >
                          [{index + 1}] {item.title}
                        </p>
                        <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {item.subtitle}
                        </p>
                      </div>
                      <Badge tone={item.tone}>{item.title}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <Button type="button" onClick={() => navigate("/responsable/validation")}>
                Voir tout
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
          <GlassCard className="p-6">
            <SectionLabel
              icon={CalendarDays}
              title="Notifications intelligentes"
              subtitle="Résumé des événements à traiter"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {smartNotifications.map((item) => (
                <Badge key={item} tone="neutral">
                  {item}
                </Badge>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
