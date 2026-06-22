import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import {
  Palette, Shield, Bell, Upload, Save, CheckCircle2,
  Building2, MapPin, Phone, Mail, Globe, Eye, EyeOff,
  Users, Lock, Smartphone, Key,
} from "lucide-react";

/* ── Helper components ──────────────────────────────────────────── */
function Field({ label, value, type = "text", placeholder = "" }: { label: string; value?: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</label>
      <input
        type={type} defaultValue={value} placeholder={placeholder}
        className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
        style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
        onFocus={e => { e.target.style.borderColor = "rgba(255,107,87,0.5)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
      />
    </div>
  );
}

function Toggle({ label, description, defaultOn = true }: { label: string; description?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border p-4"
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
        {description && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{description}</p>}
      </div>
      <button
        type="button" onClick={() => setOn(!on)}
        className="relative h-6 w-11 shrink-0 rounded-full transition-all"
        style={{ background: on ? "linear-gradient(135deg,#FF6B57,#E65240)" : "rgba(255,255,255,0.1)" }}
      >
        <motion.div
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
          animate={{ left: on ? "calc(100% - 22px)" : "2px" }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        />
      </button>
    </div>
  );
}

function PasswordField({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} placeholder="••••••••••"
          className="w-full rounded-xl border py-2.5 pl-4 pr-10 text-sm outline-none"
          style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }} />
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

function SaveRow() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex justify-end gap-3 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <motion.button type="button"
        className="rounded-xl border px-4 py-2.5 text-sm font-medium"
        style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
        whileHover={{ borderColor: "#FF6B57", color: "#FF6B57" }}>
        Annuler
      </motion.button>
      <motion.button
        type="button" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
        style={{ background: saved ? "linear-gradient(135deg,#22C55E,#16A34A)" : "linear-gradient(135deg,#FF6B57,#E65240)", boxShadow: `0 0 20px ${saved ? "rgba(34,197,94,0.4)" : "rgba(255,107,87,0.35)"}` }}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        {saved ? <><CheckCircle2 size={14} /> Sauvegardé!</> : <><Save size={14} /> Sauvegarder</>}
      </motion.button>
    </div>
  );
}

/* ── Tabs config ────────────────────────────────────────────────── */
const TABS = [
  { key: "general",   label: "Général",     icon: Building2 },
  { key: "identite",  label: "Identité",    icon: Palette   },
  { key: "securite",  label: "Sécurité",    icon: Shield    },
  { key: "notifs",    label: "Notifications", icon: Bell    },
] as const;

type Tab = (typeof TABS)[number]["key"];

/* ── Main page ──────────────────────────────────────────────────── */
export function ClubParametresPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [primaryColor, setPrimaryColor] = useState("#FF6B57");
  const [secondaryColor, setSecondaryColor] = useState("#3B82F6");

  return (
    <ClubPageTransition>
      {/* Header */}
      <ClubKpiCard hover={false}>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#FF6B57" }}>Admin Club</span>
          <h1 className="mt-1 text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Paramètres du club</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Gérez l'identité, la sécurité et les préférences de votre club.</p>
        </div>
      </ClubKpiCard>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <motion.button
              key={key} type="button" onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              style={{
                background: active ? "linear-gradient(135deg,#FF6B57,#E65240)" : "rgba(255,255,255,0.04)",
                color: active ? "white" : "var(--text-muted)",
                border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: active ? "0 0 20px rgba(255,107,87,0.35)" : "none",
              }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
              <Icon size={14} /> {label}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {/* ── Général ── */}
          {activeTab === "general" && (
            <ClubKpiCard hover={false}>
              <h2 className="mb-5 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Informations générales</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nom du club" value="FC Carthage" />
                <Field label="Abréviation" value="FCC" />
                <Field label="Email officiel" value="contact@fc-carthage.tn" type="email" />
                <Field label="Téléphone" value="+216 71 000 000" type="tel" />
                <Field label="Site web" value="https://fc-carthage.tn" />
                <Field label="Stade" value="Stade de Radès" />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Adresse</label>
                  <textarea rows={3} defaultValue="Rue du Stade, Radès, Ben Arous 2040, Tunisie"
                    className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }} />
                </div>
                <div className="space-y-3">
                  <Field label="Ville" value="Radès" />
                  <Field label="Pays" value="Tunisie" />
                </div>
              </div>
              <SaveRow />
            </ClubKpiCard>
          )}

          {/* ── Identité ── */}
          {activeTab === "identite" && (
            <ClubKpiCard hover={false}>
              <h2 className="mb-5 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Identité visuelle</h2>

              {/* Logo upload */}
              <div className="mb-6">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Logo du club</label>
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-black text-white"
                    style={{ background: `linear-gradient(135deg,${primaryColor},${secondaryColor})` }}>
                    FC
                  </div>
                  <label className="cursor-pointer">
                    <motion.div
                      className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
                      style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text-secondary)" }}
                      whileHover={{ borderColor: "#FF6B57", color: "#FF6B57" }}>
                      <Upload size={14} /> Changer le logo
                    </motion.div>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
              </div>

              {/* Colors */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Couleur principale</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-xl border-0" />
                    <div>
                      <p className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{primaryColor.toUpperCase()}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Utilisée dans les boutons, badges</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Couleur secondaire</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-xl border-0" />
                    <div>
                      <p className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{secondaryColor.toUpperCase()}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Accentuation graphique</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mb-6 rounded-2xl border p-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                <p className="mb-3 text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Aperçu</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white"
                    style={{ background: `linear-gradient(135deg,${primaryColor},${secondaryColor})` }}>
                    FC
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: "var(--text-primary)" }}>FC Carthage</p>
                    <div className="flex gap-2 mt-1">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: primaryColor }}>Enterprise</span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: secondaryColor }}>Actif</span>
                    </div>
                  </div>
                </div>
              </div>

              <Field label="Slogan du club" value="La fierté de Carthage" />
              <div className="mt-4" />
              <SaveRow />
            </ClubKpiCard>
          )}

          {/* ── Sécurité ── */}
          {activeTab === "securite" && (
            <ClubKpiCard hover={false}>
              <h2 className="mb-5 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Sécurité du compte</h2>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <PasswordField label="Mot de passe actuel" />
                <PasswordField label="Nouveau mot de passe" />
                <PasswordField label="Confirmer le mot de passe" />
                <Field label="Session timeout (min)" value="30" />
              </div>
              <div className="mb-6 space-y-3">
                <Toggle label="Authentification 2FA" description="Code envoyé par email à chaque connexion." />
                <Toggle label="Notifications de connexion" description="Alert email lors d'une nouvelle connexion." />
                <Toggle label="Blocage après 5 tentatives" description="IP bloquée pendant 15 min après 5 échecs." />
                <Toggle label="Exiger HTTPS" description="Refuser toute connexion non sécurisée." />
              </div>
              <div className="rounded-2xl border p-4 text-sm"
                style={{ background: "rgba(255,107,87,0.06)", borderColor: "rgba(255,107,87,0.2)", color: "var(--text-muted)" }}>
                <div className="flex items-center gap-2">
                  <Shield size={14} style={{ color: "#FF6B57" }} />
                  <p><strong style={{ color: "var(--text-primary)" }}>Dernière connexion :</strong> 19/06/2026 10:45 — Chrome / macOS — 197.0.22.14</p>
                </div>
              </div>
              <div className="mt-4" />
              <SaveRow />
            </ClubKpiCard>
          )}

          {/* ── Notifications ── */}
          {activeTab === "notifs" && (
            <ClubKpiCard hover={false}>
              <h2 className="mb-5 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Préférences de notifications</h2>
              <div className="mb-6 space-y-3">
                <Toggle label="Notifications email" description="Recevoir les alertes par email." />
                <Toggle label="Notifications SMS" description="Alertes critiques par SMS." defaultOn={false} />
                <Toggle label="Push navigateur" description="Notifications dans le navigateur." />
              </div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Catégories</h3>
              <div className="space-y-3">
                <Toggle label="Contrats expirants" description="30 jours avant l'expiration." />
                <Toggle label="Budget dépassé" description="Alerte à 80% de consommation." />
                <Toggle label="Joueur blessé" description="Notification immédiate." />
                <Toggle label="Nouveaux paiements" description="Confirmation des transactions." />
                <Toggle label="Rapports disponibles" description="Quand un rapport est généré." defaultOn={false} />
                <Toggle label="Alertes sécurité" description="Connexions suspectes, 2FA, etc." />
              </div>
              <div className="mt-4" />
              <SaveRow />
            </ClubKpiCard>
          )}
        </motion.div>
      </AnimatePresence>
    </ClubPageTransition>
  );
}
