import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ParticlesField } from "../recruteur/ParticlesField";
import { itemVariants } from "./SuperAdminPageTransition";

interface SuperAdminHeroProps {
  badge: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  stats?: { value: string; label: string; color?: string }[];
}

export function SuperAdminHero({ badge, title, subtitle, icon: Icon, action, stats }: SuperAdminHeroProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-[24px] border p-6"
      style={{
        background: "linear-gradient(135deg, rgba(15,29,58,0.95), rgba(60,30,10,0.85))",
        borderColor: "rgba(255,122,0,0.25)",
        boxShadow: "0 0 60px rgba(255,122,0,0.08), 0 20px 50px rgba(0,0,0,0.3)",
      }}
    >
      <ParticlesField count={26} color="255,122,0" />

      {/* animated gradient sweep */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[24px]"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,122,0,0.06) 50%, transparent 100%)" }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
      />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {Icon && (
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Icon size={18} style={{ color: "#FF7A00" }} />
              </motion.div>
            )}
            <motion.span
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "#FF7A00" }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              {badge}
            </motion.span>
          </motion.div>

          <motion.h1
            className="mt-2 text-2xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.26 }}
            >
              {subtitle}
            </motion.p>
          )}

          {stats && stats.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-6">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, delay: 0.32 + i * 0.07 }}
                >
                  <div className="text-xl font-extrabold" style={{ color: s.color ?? "#FF7A00" }}>
                    {s.value}
                  </div>
                  <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          {action}
        </motion.div>
      </div>
    </motion.div>
  );
}
