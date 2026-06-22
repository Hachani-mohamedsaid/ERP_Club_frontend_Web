import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { SuperAdminCard } from "./SuperAdminKpiCard";

interface SuperAdminPageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function SuperAdminPageHeader({ title, subtitle, action }: SuperAdminPageHeaderProps) {
  return (
    <SuperAdminCard hover={false} glow>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* animated badge */}
          <div className="relative inline-flex items-center overflow-hidden rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]"
            style={{ background: "rgba(255,122,0,0.15)", color: "#FF7A00", border: "1px solid rgba(255,122,0,0.3)" }}
          >
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,122,0,0.25), transparent)" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
            />
            <span className="relative">Super Admin</span>
          </div>

          <motion.h1
            className="mt-2 text-xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            {title}
          </motion.h1>

          <motion.p
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        </div>

        {action && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            {action}
          </motion.div>
        )}
      </div>
    </SuperAdminCard>
  );
}
