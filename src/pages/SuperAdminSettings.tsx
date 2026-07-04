import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SuperAdminPageTransition,
  SuperAdminPageHeader,
  SuperAdminGhostButton,
  SuperAdminActionButton,
  SuperAdminSection,
  SuperAdminListRow,
} from "../components/superadmin";
import {
  SlidersHorizontal, Mail, Palette, HardDrive, Brain,
  Shield, CreditCard, Save, CheckCircle2, AlertCircle,
} from "lucide-react";
import { platformApi } from "../lib/api/platform";
import {
  mergeSettings,
  readLocalSettings,
  type PlatformSettingsFull,
} from "../lib/api/platform/settings";
import { usePlatformResource } from "../hooks/usePlatformResource";

const TABS = ["Général", "SMTP", "Branding", "Stockage", "IA", "Sécurité", "Billing"] as const;
type Tab = (typeof TABS)[number];

const TIMEZONES = [
  "Africa/Tunis",
  "Europe/Paris",
  "Europe/London",
  "America/New_York",
  "Asia/Dubai",
];

const inputClass =
  "rounded-xl border px-4 py-2.5 text-sm outline-none w-full";
const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  borderColor: "var(--surface-panel-border)",
  color: "var(--text-primary)",
};

function ControlledInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        style={inputStyle}
      />
    </div>
  );
}

function ControlledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <select className={inputClass} style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function SettingsToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <SuperAdminListRow>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
          {description && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => onChange(!enabled)}
          className="relative h-6 w-11 shrink-0 rounded-full"
          style={{ background: enabled ? "linear-gradient(135deg,#FF7A00,#E66000)" : "rgba(255,255,255,0.1)" }}
        >
          <motion.div
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
            animate={{ left: enabled ? "calc(100% - 22px)" : "2px" }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
        </button>
      </div>
    </SuperAdminListRow>
  );
}

function SaveBar({
  saving,
  saved,
  saveError,
  onCancel,
  onSave,
}: {
  saving: boolean;
  saved: boolean;
  saveError: string | null;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: "var(--surface-panel-border)" }}>
      {saveError && (
        <p className="flex items-center gap-1.5 text-sm text-red-400">
          <AlertCircle size={14} /> {saveError}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <SuperAdminGhostButton onClick={onCancel}>Annuler</SuperAdminGhostButton>
        <SuperAdminActionButton onClick={onSave} disabled={saving}>
          {saved ? <><CheckCircle2 size={14} /> Sauvegardé!</> : <><Save size={14} /> Sauvegarder</>}
        </SuperAdminActionButton>
      </div>
    </div>
  );
}

export function SuperAdminSettings() {
  const [activeTab, setActiveTab] = useState<Tab>("Général");
  const [form, setForm] = useState<PlatformSettingsFull>(() => readLocalSettings());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data, loading, reload } = usePlatformResource(() => platformApi.getSettings(), []);

  useEffect(() => {
    if (data) setForm(mergeSettings(data as Record<string, unknown>));
  }, [data]);

  function patch<K extends keyof PlatformSettingsFull>(key: K, value: PlatformSettingsFull[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
    setSaveError(null);
  }

  function handleCancel() {
    if (data) setForm(mergeSettings(data as Record<string, unknown>));
    else setForm(readLocalSettings());
    setSaveError(null);
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const result = await platformApi.updateSettings(form as unknown as Record<string, unknown>);
      setForm(mergeSettings(result as Record<string, unknown>));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await reload();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  const saveBar = (
    <SaveBar saving={saving} saved={saved} saveError={saveError} onCancel={handleCancel} onSave={handleSave} />
  );

  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Paramètres Plateforme"
        subtitle="Administration système, intégrations et configuration globale."
      />

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Général", icon: SlidersHorizontal },
          { label: "SMTP", icon: Mail },
          { label: "Branding", icon: Palette },
          { label: "Stockage", icon: HardDrive },
          { label: "IA", icon: Brain },
          { label: "Sécurité", icon: Shield },
          { label: "Billing", icon: CreditCard },
        ].map(({ label, icon: Icon }) => {
          const active = activeTab === label;
          return (
            <motion.button
              key={label}
              type="button"
              onClick={() => setActiveTab(label as Tab)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              style={{
                background: active ? "linear-gradient(135deg,#FF7A00,#E66000)" : "rgba(255,255,255,0.04)",
                color: active ? "white" : "var(--text-muted)",
                border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Icon size={14} />
              {label}
            </motion.button>
          );
        })}
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
          {activeTab === "Général" && (
            <SuperAdminSection title="Configuration générale" subtitle="Paramètres globaux de la plateforme.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ControlledInput label="Nom de la plateforme" value={form.platformName} onChange={(v) => patch("platformName", v)} />
                <ControlledInput label="URL de la plateforme" value={form.platformUrl} onChange={(v) => patch("platformUrl", v)} />
                <ControlledInput label="Email de contact" value={form.contactEmail} onChange={(v) => patch("contactEmail", v)} type="email" />
                <ControlledInput label="Téléphone support" value={form.supportPhone} onChange={(v) => patch("supportPhone", v)} />
                <ControlledSelect
                  label="Fuseau horaire"
                  value={form.timezone}
                  onChange={(v) => patch("timezone", v)}
                  options={TIMEZONES.map((tz) => ({ value: tz, label: tz }))}
                />
                <ControlledSelect
                  label="Langue par défaut"
                  value={form.defaultLanguage}
                  onChange={(v) => patch("defaultLanguage", v)}
                  options={[
                    { value: "fr", label: "Français" },
                    { value: "en", label: "English" },
                    { value: "ar", label: "العربية" },
                  ]}
                />
                <ControlledInput label="Devise" value={form.currency} onChange={(v) => patch("currency", v)} />
                <ControlledInput
                  label="Jours d'essai gratuit"
                  value={String(form.trialDays)}
                  onChange={(v) => patch("trialDays", Number(v) || 14)}
                  type="number"
                />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <SettingsToggle label="Mode maintenance" description="Désactive l'accès aux utilisateurs non-admins." enabled={form.maintenanceMode} onChange={(v) => patch("maintenanceMode", v)} />
                <SettingsToggle label="Inscriptions ouvertes" description="Permet la création de nouveaux comptes clubs." enabled={form.openRegistration} onChange={(v) => patch("openRegistration", v)} />
                <SettingsToggle label="Mode debug" description="Active les logs étendus pour le diagnostic." enabled={form.debugMode} onChange={(v) => patch("debugMode", v)} />
              </div>
              {saveBar}
            </SuperAdminSection>
          )}

          {activeTab === "SMTP" && (
            <SuperAdminSection title="Configuration SMTP" subtitle="Envoi d'emails transactionnels et notifications.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ControlledInput label="Serveur SMTP" value={form.smtpHost} onChange={(v) => patch("smtpHost", v)} placeholder="smtp.gmail.com" />
                <ControlledInput label="Port" value={String(form.smtpPort)} onChange={(v) => patch("smtpPort", Number(v) || 587)} type="number" />
                <ControlledInput label="Utilisateur SMTP" value={form.smtpUser} onChange={(v) => patch("smtpUser", v)} />
                <ControlledInput label="Mot de passe SMTP" value={form.smtpPassword} onChange={(v) => patch("smtpPassword", v)} type="password" />
                <ControlledInput label="Nom expéditeur" value={form.smtpFromName} onChange={(v) => patch("smtpFromName", v)} />
                <ControlledInput label="Email expéditeur" value={form.smtpFromEmail} onChange={(v) => patch("smtpFromEmail", v)} type="email" />
              </div>
              <div className="mt-4">
                <SettingsToggle label="Connexion sécurisée (TLS)" description="Recommandé pour la production." enabled={form.smtpSecure} onChange={(v) => patch("smtpSecure", v)} />
              </div>
              {saveBar}
            </SuperAdminSection>
          )}

          {activeTab === "Branding" && (
            <SuperAdminSection title="Identité visuelle" subtitle="Logo, couleurs et apparence de la plateforme.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ControlledInput label="Couleur principale" value={form.primaryColor} onChange={(v) => patch("primaryColor", v)} placeholder="#FF7A00" />
                <ControlledInput label="Slogan / Tagline" value={form.tagline} onChange={(v) => patch("tagline", v)} />
                <ControlledInput label="URL du logo" value={form.logoUrl} onChange={(v) => patch("logoUrl", v)} placeholder="https://..." />
                <ControlledInput label="URL favicon" value={form.faviconUrl} onChange={(v) => patch("faviconUrl", v)} placeholder="https://..." />
              </div>
              {form.logoUrl && (
                <div className="mt-4 flex items-center gap-4 rounded-xl border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                  <img src={form.logoUrl} alt="Logo preview" className="h-12 w-12 rounded-lg object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: form.primaryColor }}>{form.platformName}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{form.tagline}</p>
                  </div>
                </div>
              )}
              <div className="mt-4">
                <SettingsToggle label="Mode sombre par défaut" description="Appliqué aux nouveaux utilisateurs." enabled={form.darkModeDefault} onChange={(v) => patch("darkModeDefault", v)} />
              </div>
              {saveBar}
            </SuperAdminSection>
          )}

          {activeTab === "Stockage" && (
            <SuperAdminSection title="Stockage & CDN" subtitle="Fichiers, médias et limites d'upload.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ControlledSelect
                  label="Fournisseur"
                  value={form.storageProvider}
                  onChange={(v) => patch("storageProvider", v as PlatformSettingsFull["storageProvider"])}
                  options={[
                    { value: "local", label: "Local (serveur)" },
                    { value: "s3", label: "Amazon S3" },
                    { value: "cloudinary", label: "Cloudinary" },
                  ]}
                />
                <ControlledInput label="Taille max upload (Mo)" value={String(form.maxUploadMb)} onChange={(v) => patch("maxUploadMb", Number(v) || 25)} type="number" />
                <ControlledInput label="Bucket S3" value={form.s3Bucket} onChange={(v) => patch("s3Bucket", v)} />
                <ControlledInput label="Région S3" value={form.s3Region} onChange={(v) => patch("s3Region", v)} />
                <ControlledInput label="URL CDN" value={form.cdnUrl} onChange={(v) => patch("cdnUrl", v)} placeholder="https://cdn.odin.erp.tn" />
              </div>
              {saveBar}
            </SuperAdminSection>
          )}

          {activeTab === "IA" && (
            <SuperAdminSection title="Configuration IA" subtitle="Modèles, clés API et limites ODIN AI.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ControlledSelect
                  label="Fournisseur IA"
                  value={form.aiProvider}
                  onChange={(v) => patch("aiProvider", v as PlatformSettingsFull["aiProvider"])}
                  options={[
                    { value: "openai", label: "OpenAI" },
                    { value: "anthropic", label: "Anthropic" },
                    { value: "local", label: "Modèle local" },
                  ]}
                />
                <ControlledInput label="Modèle" value={form.aiModel} onChange={(v) => patch("aiModel", v)} placeholder="gpt-4o-mini" />
                <ControlledInput label="Max tokens" value={String(form.aiMaxTokens)} onChange={(v) => patch("aiMaxTokens", Number(v) || 4096)} type="number" />
                <ControlledInput label="Clé API" value={form.aiApiKey} onChange={(v) => patch("aiApiKey", v)} type="password" placeholder="sk-..." />
              </div>
              <div className="mt-4">
                <SettingsToggle label="IA activée" description="Active les assistants IA sur toute la plateforme." enabled={form.aiEnabled} onChange={(v) => patch("aiEnabled", v)} />
              </div>
              {saveBar}
            </SuperAdminSection>
          )}

          {activeTab === "Sécurité" && (
            <SuperAdminSection title="Sécurité & Accès" subtitle="Authentification, sessions et politique mots de passe.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ControlledInput label="Timeout session (minutes)" value={String(form.sessionTimeoutMin)} onChange={(v) => patch("sessionTimeoutMin", Number(v) || 480)} type="number" />
                <ControlledInput label="Tentatives login max" value={String(form.maxLoginAttempts)} onChange={(v) => patch("maxLoginAttempts", Number(v) || 5)} type="number" />
                <ControlledInput label="Longueur min. mot de passe" value={String(form.passwordMinLength)} onChange={(v) => patch("passwordMinLength", Number(v) || 8)} type="number" />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <SettingsToggle label="2FA obligatoire (admins)" description="Exige l'authentification à deux facteurs." enabled={form.mfaRequired} onChange={(v) => patch("mfaRequired", v)} />
                <SettingsToggle label="Blocage IP automatique" description="Bloque les IPs après échecs répétés." enabled={form.ipBlockEnabled} onChange={(v) => patch("ipBlockEnabled", v)} />
                <SettingsToggle label="Mot de passe fort requis" description="Majuscules, chiffres et caractères spéciaux." enabled={form.requireStrongPassword} onChange={(v) => patch("requireStrongPassword", v)} />
              </div>
              {saveBar}
            </SuperAdminSection>
          )}

          {activeTab === "Billing" && (
            <SuperAdminSection title="Facturation SaaS" subtitle="Stripe, taxes et politique de suspension.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ControlledInput label="Préfixe facture" value={form.invoicePrefix} onChange={(v) => patch("invoicePrefix", v)} placeholder="INV" />
                <ControlledInput label="Taux TVA (%)" value={String(form.taxRate)} onChange={(v) => patch("taxRate", Number(v) || 0)} type="number" />
                <ControlledInput label="Période de grâce (jours)" value={String(form.gracePeriodDays)} onChange={(v) => patch("gracePeriodDays", Number(v) || 7)} type="number" />
                <ControlledInput label="Clé publique Stripe" value={form.stripePublicKey} onChange={(v) => patch("stripePublicKey", v)} placeholder="pk_live_..." />
                <ControlledInput label="Clé secrète Stripe" value={form.stripeSecretKey} onChange={(v) => patch("stripeSecretKey", v)} type="password" placeholder="sk_live_..." />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <SettingsToggle label="Stripe activé" description="Paiements en ligne automatiques." enabled={form.stripeEnabled} onChange={(v) => patch("stripeEnabled", v)} />
                <SettingsToggle label="Suspension auto si impayé" description={`Suspend le club après ${form.gracePeriodDays}j de retard.`} enabled={form.autoSuspendOnFailure} onChange={(v) => patch("autoSuspendOnFailure", v)} />
              </div>
              {saveBar}
            </SuperAdminSection>
          )}
        </motion.div>
      </AnimatePresence>
    </SuperAdminPageTransition>
  );
}
