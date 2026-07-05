import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import {
  Bell,
  CalendarClock,
  Globe,
  Home,
  KeyRound,
  Moon,
  Settings,
  Shield,
  Sun,
  Volume2,
  X,
  Accessibility,
  ChevronDown,
  Check,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { useTheme } from "../../lib/theme";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";
import type { Locale } from "../../i18n/joueurTranslations";
import type { DateFormat, SessionTimeout, TimeFormat } from "../../lib/preferences/types";
import {
  LANDING_OPTIONS_BY_ROLE,
  landingLabel,
} from "../../lib/preferences/landingRoutes";
import { TIMEZONE_OPTIONS } from "../../lib/preferences/formatDateTime";
import { ensurePushPermission } from "../../lib/preferences/notificationHelpers";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

const LANG_OPTIONS: { id: Locale; label: string; native: string }[] = [
  { id: "fr", label: "FR", native: "Français" },
  { id: "en", label: "EN", native: "English" },
  { id: "ar", label: "AR", native: "العربية" },
];

interface SettingsModalProps {
  onClose: () => void;
}

function ModalDecorations() {
  return (
    <>
      <div className="pointer-events-none absolute -left-14 -top-14 h-44 w-44 rounded-full" style={{ background: "rgba(255,122,0,0.08)" }} />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full" style={{ background: "rgba(79,70,229,0.06)" }} />
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
      {children}
    </p>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:bg-white/5"
      style={{ borderColor: "var(--surface-panel-border)", background: "var(--surface-input)" }}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs" style={{ color: "var(--text-muted)" }}>
            {description}
          </span>
        )}
      </span>
      <span
        className="relative flex h-6 w-11 shrink-0 items-center rounded-full px-0.5"
        style={{
          background: checked ? "var(--accent)" : "var(--surface-hover)",
          boxShadow: "inset 0 0 0 1px var(--surface-panel-border)",
        }}
      >
        <span
          className="h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? "translateX(18px)" : "translateX(0)" }}
        />
      </span>
    </button>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === String(value))?.label ?? String(value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative block">
      <span className="mb-1.5 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all duration-150"
        style={{
          borderColor: open ? "var(--accent)" : "var(--surface-panel-border)",
          background: open ? "var(--accent-soft)" : "var(--surface-input)",
          boxShadow: open ? "0 0 0 1px rgba(255,122,0,0.25)" : "none",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="min-w-0 truncate font-medium" style={{ color: "var(--text-primary)" }}>
          {selected}
        </span>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200"
          style={{
            background: "var(--surface-hover)",
            color: open ? "var(--accent)" : "var(--text-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <ChevronDown size={16} strokeWidth={2.5} />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            className="absolute left-0 right-0 z-20 mt-1.5 max-h-52 overflow-y-auto rounded-xl border p-1.5 shadow-lg"
            style={{
              background: "var(--surface-modal)",
              borderColor: "var(--surface-panel-border)",
              boxShadow: "var(--shadow-glass-strong)",
            }}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {options.map((o) => {
              const active = o.value === String(value);
              return (
                <li key={o.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                    style={{
                      background: active ? "var(--accent-soft)" : "transparent",
                      color: active ? "var(--accent)" : "var(--text-primary)",
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate font-medium">{o.label}</span>
                    {active && (
                      <Check size={15} strokeWidth={2.5} style={{ color: "var(--accent)" }} />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const { user } = useAuth();
  const {
    preferences,
    updatePreferences,
    updateNotifications,
    setLandingPage,
    getRoleLandingPage,
    formatAppDateTime,
  } = useUserPreferences();
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";
  const role = user?.role ?? "guest";
  const landingOptions = LANDING_OPTIONS_BY_ROLE[role] ?? [];
  const currentLanding = getRoleLandingPage(role);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showPassword) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, showPassword]);

  const sessionOptions: { value: SessionTimeout; label: string }[] = [
    { value: 0, label: t.settings.sessionNever },
    { value: 15, label: t.settings.session15 },
    { value: 30, label: t.settings.session30 },
    { value: 60, label: t.settings.session60 },
    { value: 120, label: t.settings.session120 },
  ];

  const dateFormatOptions: { value: DateFormat; label: string }[] = [
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  ];

  const timeFormatOptions: { value: TimeFormat; label: string }[] = [
    { value: "24h", label: t.settings.time24 },
    { value: "12h", label: t.settings.time12 },
  ];

  if (!mounted) return null;

  return createPortal(
    <>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-lg overflow-hidden rounded-[20px] border"
          style={{
            background: "var(--surface-modal)",
            borderColor: "rgba(255,122,0,0.25)",
            boxShadow: "var(--shadow-glass-strong)",
          }}
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalDecorations />

          <div className="relative z-[1] p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: "rgba(255,122,0,0.15)", border: "1px solid var(--surface-panel-border)" }}
                >
                  <Settings size={20} style={{ color: "var(--accent)" }} />
                </div>
                <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
                  {t.settings.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors hover:bg-white/10"
                style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}
                aria-label={t.settings.close}
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[min(72vh,620px)] space-y-5 overflow-y-auto pr-1">
              {/* Appearance */}
              <section>
                <SectionTitle>{t.settings.appearance}</SectionTitle>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex w-full items-center justify-between rounded-xl border px-4 py-3"
                    style={{ borderColor: "var(--surface-panel-border)", background: "var(--surface-input)" }}
                  >
                    <span className="flex items-center gap-3">
                      {isDark ? <Moon size={18} /> : <Sun size={18} style={{ color: "#FBBF24" }} />}
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {isDark ? t.settings.darkMode : t.settings.lightMode}
                      </span>
                    </span>
                    <span
                      className="relative flex h-6 w-11 shrink-0 items-center rounded-full px-0.5"
                      style={{
                        background: isDark ? "var(--accent)" : "var(--surface-hover)",
                        boxShadow: "inset 0 0 0 1px var(--surface-panel-border)",
                      }}
                    >
                      <span
                        className="h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
                        style={{ transform: isDark ? "translateX(18px)" : "translateX(0)" }}
                      />
                    </span>
                  </button>
                  <ToggleRow
                    label={t.settings.compactSidebar}
                    description={t.settings.compactSidebarDesc}
                    checked={preferences.compactSidebar}
                    onChange={(v) => updatePreferences({ compactSidebar: v })}
                  />
                </div>
              </section>

              {/* Language */}
              <section>
                <SectionTitle>
                  <span className="inline-flex items-center gap-1.5">
                    <Globe size={12} /> {t.settings.language}
                  </span>
                </SectionTitle>
                <div className="space-y-2">
                  {LANG_OPTIONS.map((lang) => {
                    const active = locale === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setLocale(lang.id)}
                        className="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left"
                        style={{
                          borderColor: active ? "var(--accent)" : "var(--surface-panel-border)",
                          background: active ? "var(--accent-soft)" : "var(--surface-input)",
                        }}
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold"
                          style={{
                            background: active ? "var(--accent)" : "var(--surface-hover)",
                            color: active ? "#fff" : "var(--text-secondary)",
                          }}
                        >
                          {lang.label}
                        </span>
                        <span
                          className="flex-1 text-sm font-semibold"
                          style={{
                            color: "var(--text-primary)",
                            fontFamily: lang.id === "ar" ? "'Segoe UI', 'Tahoma', 'Arial', sans-serif" : "inherit",
                          }}
                        >
                          {lang.native}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Notifications */}
              <section>
                <SectionTitle>
                  <span className="inline-flex items-center gap-1.5">
                    <Bell size={12} /> {t.settings.notifications}
                  </span>
                </SectionTitle>
                <div className="space-y-2">
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    {t.settings.notifMessages}
                  </p>
                  <ToggleRow
                    label={t.settings.pushNotif}
                    checked={preferences.notifications.pushMessages}
                    onChange={async (v) => {
                      if (v) await ensurePushPermission();
                      updateNotifications({ pushMessages: v });
                    }}
                  />
                  <ToggleRow
                    label={t.settings.emailNotif}
                    checked={preferences.notifications.emailMessages}
                    onChange={(v) => updateNotifications({ emailMessages: v })}
                  />
                  <p className="pt-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    {t.settings.notifRdv}
                  </p>
                  <ToggleRow
                    label={t.settings.pushNotif}
                    checked={preferences.notifications.pushRdv}
                    onChange={async (v) => {
                      if (v) await ensurePushPermission();
                      updateNotifications({ pushRdv: v });
                    }}
                  />
                  <ToggleRow
                    label={t.settings.emailNotif}
                    checked={preferences.notifications.emailRdv}
                    onChange={(v) => updateNotifications({ emailRdv: v })}
                  />
                  <p className="pt-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    {t.settings.notifMatch}
                  </p>
                  <ToggleRow
                    label={t.settings.pushNotif}
                    checked={preferences.notifications.pushMatch}
                    onChange={async (v) => {
                      if (v) await ensurePushPermission();
                      updateNotifications({ pushMatch: v });
                    }}
                  />
                  <ToggleRow
                    label={t.settings.emailNotif}
                    checked={preferences.notifications.emailMatch}
                    onChange={(v) => updateNotifications({ emailMatch: v })}
                  />
                </div>
              </section>

              {/* Sound */}
              <section>
                <SectionTitle>
                  <span className="inline-flex items-center gap-1.5">
                    <Volume2 size={12} /> {t.settings.soundAlerts}
                  </span>
                </SectionTitle>
                <ToggleRow
                  label={t.settings.soundAlertsDesc}
                  checked={preferences.soundAlerts}
                  onChange={(v) => updatePreferences({ soundAlerts: v })}
                />
              </section>

              {/* Date & time */}
              <section>
                <SectionTitle>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock size={12} /> {t.settings.dateTime}
                  </span>
                </SectionTitle>
                <div className="space-y-3 rounded-xl border p-3" style={{ borderColor: "var(--surface-panel-border)", background: "var(--surface-input)" }}>
                  <SelectField
                    label={t.settings.timezone}
                    value={preferences.timezone}
                    onChange={(v) => updatePreferences({ timezone: v })}
                    options={TIMEZONE_OPTIONS.map((tz) => ({ value: tz, label: tz }))}
                  />
                  <SelectField
                    label={t.settings.dateFormat}
                    value={preferences.dateFormat}
                    onChange={(v) => updatePreferences({ dateFormat: v as DateFormat })}
                    options={dateFormatOptions.map((o) => ({ value: o.value, label: o.label }))}
                  />
                  <SelectField
                    label={t.settings.timeFormat}
                    value={preferences.timeFormat}
                    onChange={(v) => updatePreferences({ timeFormat: v as TimeFormat })}
                    options={timeFormatOptions.map((o) => ({ value: o.value, label: o.label }))}
                  />
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {t.settings.preview}: {formatAppDateTime(new Date())}
                  </p>
                </div>
              </section>

              {/* Default landing page */}
              {landingOptions.length > 0 && (
                <section>
                  <SectionTitle>
                    <span className="inline-flex items-center gap-1.5">
                      <Home size={12} /> {t.settings.defaultLanding}
                    </span>
                  </SectionTitle>
                  <SelectField
                    label={t.settings.defaultLandingDesc}
                    value={currentLanding}
                    onChange={(v) => setLandingPage(role, v)}
                    options={landingOptions.map((o) => ({
                      value: o.path,
                      label: landingLabel(o, locale),
                    }))}
                  />
                </section>
              )}

              {/* Accessibility */}
              <section>
                <SectionTitle>
                  <span className="inline-flex items-center gap-1.5">
                    <Accessibility size={12} /> {t.settings.accessibility}
                  </span>
                </SectionTitle>
                <div className="space-y-2">
                  <ToggleRow
                    label={t.settings.reducedMotion}
                    description={t.settings.reducedMotionDesc}
                    checked={preferences.reducedMotion}
                    onChange={(v) => updatePreferences({ reducedMotion: v })}
                  />
                  <ToggleRow
                    label={t.settings.largeText}
                    description={t.settings.largeTextDesc}
                    checked={preferences.largeText}
                    onChange={(v) => updatePreferences({ largeText: v })}
                  />
                </div>
              </section>

              {/* Session & security */}
              <section>
                <SectionTitle>
                  <span className="inline-flex items-center gap-1.5">
                    <Shield size={12} /> {t.settings.security}
                  </span>
                </SectionTitle>
                <div className="space-y-3 rounded-xl border p-3" style={{ borderColor: "var(--surface-panel-border)", background: "var(--surface-input)" }}>
                  <SelectField
                    label={t.settings.sessionTimeout}
                    value={preferences.sessionTimeoutMinutes}
                    onChange={(v) => updatePreferences({ sessionTimeoutMinutes: Number(v) as SessionTimeout })}
                    options={sessionOptions.map((o) => ({ value: String(o.value), label: o.label }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition-colors hover:bg-white/5"
                    style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
                  >
                    <KeyRound size={16} />
                    {t.settings.changePassword}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showPassword && <ChangePasswordDialog onClose={() => setShowPassword(false)} />}
      </AnimatePresence>
    </>,
    document.body,
  );
}
