import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SuperAdminPageTransition,
  SuperAdminPageHeader,
  SuperAdminGhostButton,
  SuperAdminActionButton,
  SuperAdminSection,
  SuperAdminListRow,
  SuperAdminFilterPills,
} from "../components/superadmin";
import {
  SlidersHorizontal, Mail, Palette, HardDrive, Brain,
  Shield, CreditCard, Save, Eye, EyeOff, CheckCircle2,
} from "lucide-react";

const TABS = ["Général", "SMTP", "Branding", "Stockage", "IA", "Sécurité", "Billing"] as const;
type Tab = (typeof TABS)[number];

/* ── Generic input ────────────────────────────────────────────── */
function SettingsInput({ label, value, type = "text", placeholder = "" }: { label: string; value: string; type?: string; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</label>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="rounded-xl border px-4 py-2.5 text-sm outline-none transition-all"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
          color: "var(--text-primary)",
        }}
        onFocus={e => { e.target.style.borderColor = "rgba(255,122,0,0.5)"; e.target.style.boxShadow = "0 0 0 2px rgba(255,122,0,0.1)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

/* ── Toggle row ───────────────────────────────────────────────── */
function SettingsToggle({ label, description, defaultValue = true }: { label: string; description?: string; defaultValue?: boolean }) {
  const [enabled, setEnabled] = useState(defaultValue);
  return (
    <SuperAdminListRow>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
          {description && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className="relative h-6 w-11 shrink-0 rounded-full transition-all"
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

/* ── Password input ───────────────────────────────────────────── */
function PasswordInput({ label, placeholder }: { label: string; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder ?? "••••••••••"}
          className="w-full rounded-xl border py-2.5 pl-4 pr-10 text-sm outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,255,255,0.08)",
            color: "var(--text-primary)",
          }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

/* ── Textarea ─────────────────────────────────────────────────── */
function SettingsTextarea({ label, value, rows = 3 }: { label: string; value: string; rows?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</label>
      <textarea
        defaultValue={value}
        rows={rows}
        className="rounded-xl border px-4 py-2.5 text-sm outline-none resize-none"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
          color: "var(--text-primary)",
        }}
      />
    </div>
  );
}

/* ── Save bar ─────────────────────────────────────────────────── */
function SaveBar() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex justify-end gap-3 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <SuperAdminGhostButton>Annuler</SuperAdminGhostButton>
      <SuperAdminActionButton onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
        {saved ? <><CheckCircle2 size={14} /> Sauvegardé!</> : <><Save size={14} /> Sauvegarder</>}
      </SuperAdminActionButton>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export function SuperAdminSettings() {
  const [activeTab, setActiveTab] = useState<Tab>("Général");

  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Paramètres Plateforme"
        subtitle="Administration système, intégrations et configuration globale."
        action={<SuperAdminGhostButton>Réinitialiser tout</SuperAdminGhostButton>}
      />

      {/* Tab icons row */}
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
                boxShadow: active ? "0 0 20px rgba(255,122,0,0.35)" : "none",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={14} />
              {label}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
        >
          {/* ── Général ── */}
          {activeTab === "Général" && (
            <SuperAdminSection title="Configuration générale" subtitle="Paramètres globaux de la plateforme.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SettingsInput label="Nom de la plateforme" value="ODIN ERP" />
                <SettingsInput label="URL de la plateforme" value="https://odin.erp.tn" />
                <SettingsInput label="Email de contact" value="admin@odin.erp.tn" type="email" />
                <SettingsInput label="Téléphone support" value="+216 71 000 000" />
                <SettingsInput label="Fuseau horaire" value="GMT+1 Africa/Tunis" />
                <SettingsInput label="Langue par défaut" value="Français" />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <SettingsToggle label="Mode maintenance" description="Désactive l'accès aux utilisateurs non-admins." defaultValue={false} />
                <SettingsToggle label="Inscriptions ouvertes" description="Permet la création de nouveaux comptes clubs." />
                <SettingsToggle label="Mode debug" description="Active les logs étendus pour le diagnostic." defaultValue={false} />
              </div>
              <SaveBar />
            </SuperAdminSection>
          )}

          {/* ── SMTP ── */}
          {activeTab === "SMTP" && (
            <SuperAdminSection title="Configuration SMTP" subtitle="Serveur d'envoi des emails transactionnels.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SettingsInput label="Hôte SMTP" value="smtp.mailgun.org" />
                <SettingsInput label="Port" value="587" />
                <SettingsInput label="Email expéditeur" value="noreply@odin.erp.tn" type="email" />
                <SettingsInput label="Nom expéditeur" value="ODIN ERP Platform" />
                <SettingsInput label="Nom d'utilisateur" value="postmaster@odin.erp.tn" />
                <PasswordInput label="Mot de passe SMTP" />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <SettingsToggle label="Chiffrement TLS" description="Recommandé pour la sécurité des emails." />
                <SettingsToggle label="Authentification DKIM" description="Signature des emails pour éviter le spam." />
              </div>
              <div className="mt-4 flex gap-3">
                <SuperAdminGhostButton><Mail size={14} /> Tester la connexion SMTP</SuperAdminGhostButton>
              </div>
              <SaveBar />
            </SuperAdminSection>
          )}

          {/* ── Branding ── */}
          {activeTab === "Branding" && (
            <SuperAdminSection title="Branding & Identité visuelle" subtitle="Personnalisation de la plateforme.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SettingsInput label="Nom du produit" value="ODIN ERP" />
                <SettingsInput label="Slogan" value="The Football SaaS Platform" />
                <SettingsInput label="URL Logo principal" value="/assets/logo.svg" placeholder="https://..." />
                <SettingsInput label="URL Favicon" value="/assets/favicon.ico" placeholder="https://..." />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Couleur principale</label>
                  <div className="flex items-center gap-3">
                    <input type="color" defaultValue="#FF7A00"
                      className="h-10 w-14 cursor-pointer rounded-lg border"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
                    />
                    <span className="font-mono text-sm" style={{ color: "var(--text-primary)" }}>#FF7A00</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Couleur secondaire</label>
                  <div className="flex items-center gap-3">
                    <input type="color" defaultValue="#3B82F6"
                      className="h-10 w-14 cursor-pointer rounded-lg border"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
                    />
                    <span className="font-mono text-sm" style={{ color: "var(--text-primary)" }}>#3B82F6</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <SettingsTextarea label="CSS personnalisé" value="/* Custom styles */" rows={4} />
              </div>
              <SaveBar />
            </SuperAdminSection>
          )}

          {/* ── Stockage ── */}
          {activeTab === "Stockage" && (
            <SuperAdminSection title="Stockage & Médias" subtitle="Configuration du stockage de fichiers.">
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: "Stockage utilisé", value: "42 GB / 200 GB", pct: 21, color: "#22C55E" },
                  { label: "Fichiers totaux", value: "12 480", pct: null, color: "#3B82F6" },
                  { label: "Dernier backup", value: "18/06 03:00", pct: null, color: "#FF7A00" },
                ].map(({ label, value, pct, color }) => (
                  <SuperAdminListRow key={label}>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
                    <p className="mt-1 font-bold" style={{ color }}>{value}</p>
                    {pct !== null && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <motion.div className="h-full rounded-full" style={{ background: color }}
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                        />
                      </div>
                    )}
                  </SuperAdminListRow>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SettingsInput label="Provider de stockage" value="AWS S3" />
                <SettingsInput label="Bucket / Conteneur" value="odin-erp-prod" />
                <SettingsInput label="Région" value="eu-west-3 (Paris)" />
                <SettingsInput label="Taille max upload (MB)" value="50" />
                <PasswordInput label="Access Key ID" placeholder="AKIA..." />
                <PasswordInput label="Secret Access Key" />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <SettingsToggle label="CDN activé" description="CloudFront pour accélérer les médias." />
                <SettingsToggle label="Backup automatique quotidien" description="Sauvegarde à 3h00 chaque nuit." />
                <SettingsToggle label="Compression automatique des images" />
              </div>
              <SaveBar />
            </SuperAdminSection>
          )}

          {/* ── IA ── */}
          {activeTab === "IA" && (
            <SuperAdminSection title="Configuration IA" subtitle="Paramètres des modules d'intelligence artificielle.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SettingsInput label="Fournisseur IA" value="OpenAI" />
                <SettingsInput label="Modèle par défaut" value="gpt-4o" />
                <PasswordInput label="Clé API OpenAI" placeholder="sk-..." />
                <SettingsInput label="Tokens max par requête" value="4096" />
                <SettingsInput label="Température" value="0.7" />
                <SettingsInput label="Langue de génération" value="Français" />
              </div>
              <div className="mt-4">
                <SettingsTextarea label="Prompt système global" value="Tu es ODIN AI, l'assistant intelligent de la plateforme football ERP. Tu aides les clubs à analyser leurs données, optimiser leurs performances et prendre de meilleures décisions." rows={4} />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <SettingsToggle label="Module IA activé" description="Active les fonctionnalités d'analyse intelligente." />
                <SettingsToggle label="Suggestions automatiques" description="Recommandations proactives sur le dashboard." />
                <SettingsToggle label="Analyse de performance joueurs" />
                <SettingsToggle label="Prédictions financières" />
              </div>
              <SaveBar />
            </SuperAdminSection>
          )}

          {/* ── Sécurité ── */}
          {activeTab === "Sécurité" && (
            <SuperAdminSection title="Paramètres de sécurité" subtitle="Politiques d'accès et de protection.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SettingsInput label="Durée de session (minutes)" value="30" />
                <SettingsInput label="Tentatives max avant blocage" value="5" />
                <SettingsInput label="Durée de blocage (minutes)" value="15" />
                <SettingsInput label="Longueur minimale mot de passe" value="12" />
                <SettingsInput label="JWT secret rotation (jours)" value="30" />
                <SettingsInput label="Whitelist IPs admins" value="" placeholder="192.168.1.0/24" />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <SettingsToggle label="2FA obligatoire pour Super Admin" />
                <SettingsToggle label="2FA obligatoire pour Responsables Club" defaultValue={false} />
                <SettingsToggle label="Audit logs activés" />
                <SettingsToggle label="Notifications de connexion suspecte" />
                <SettingsToggle label="HTTPS forcé" />
                <SettingsToggle label="CORS restrictif" />
              </div>
              <SaveBar />
            </SuperAdminSection>
          )}

          {/* ── Billing ── */}
          {activeTab === "Billing" && (
            <SuperAdminSection title="Facturation & Paiements" subtitle="Intégration Stripe et configuration des plans.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <PasswordInput label="Clé publique Stripe" placeholder="pk_live_..." />
                <PasswordInput label="Clé secrète Stripe" placeholder="sk_live_..." />
                <PasswordInput label="Webhook secret Stripe" placeholder="whsec_..." />
                <SettingsInput label="Devise par défaut" value="TND" />
                <SettingsInput label="Email facturation" value="billing@odin.erp.tn" type="email" />
                <SettingsInput label="Pays fiscal" value="Tunisie" />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <SettingsToggle label="Mode test Stripe" description="Utiliser les clés de test pour les transactions." defaultValue={false} />
                <SettingsToggle label="Facturation automatique" description="Prélèvement automatique à la date d'échéance." />
                <SettingsToggle label="Envoi de factures PDF" />
                <SettingsToggle label="Relances de paiement automatiques" />
              </div>
              <div className="mt-4 flex gap-3">
                <SuperAdminGhostButton><CreditCard size={14} /> Tester webhook Stripe</SuperAdminGhostButton>
              </div>
              <SaveBar />
            </SuperAdminSection>
          )}
        </motion.div>
      </AnimatePresence>
    </SuperAdminPageTransition>
  );
}
