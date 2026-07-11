import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Building2, CheckCircle2, KeyRound, Loader2, Shield, Upload,
} from "lucide-react";
import { AuthShell, HERO_COUNTERS, OdinLogo } from "../components/auth/AuthShell";
import { registerOrganization } from "../lib/api/registerOrganization";

const FEATURES = [
  "Analyse IA",
  "Recrutement intelligent",
  "GPS Tracking",
  "Performance Analytics",
  "Gestion Staff",
  "Medical Center",
];

const PROVISION_STEPS = [
  "Création de votre organisation…",
  "Configuration du club…",
  "Finalisation…",
];

function StatsSidebar() {
  return (
    <div
      className="sticky top-6 rounded-2xl border p-6"
      style={{
        borderColor: "var(--surface-panel-border)",
        background: "rgba(15,20,35,0.85)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
      }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#F97316" }}>
        Football Intelligence Platform
      </p>
      <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        Trusted by professional clubs
      </p>

      <div className="my-5 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

      <div className="space-y-4">
        {HERO_COUNTERS.map((c) => (
          <div key={c.label} className="flex flex-col gap-0.5">
            <span className="text-2xl font-black leading-none" style={{ color: "var(--text-primary)" }}>
              +{c.end}{c.suffix}
            </span>
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>

      <div className="my-5 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

      <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
        SAP · Salesforce · Odoo · HubSpot — l&apos;expérience Enterprise appliquée au football.
      </p>
    </div>
  );
}

function ProvisioningOverlay({
  email,
  clubName,
  onDone,
}: {
  email: string;
  clubName: string;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStep(1), 600),
      window.setTimeout(() => setStep(2), 1200),
      window.setTimeout(() => setDone(true), 1800),
      window.setTimeout(onDone, 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center backdrop-blur-xl"
      style={{ background: "rgba(13,13,24,0.9)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div key="loading" className="flex flex-col items-center px-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <OdinLogo width={200} />
            <h2 className="mt-5 text-lg font-bold" style={{ color: "#fff" }}>Création de votre organisation</h2>
            <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: "#94A3B8" }}>
              <Loader2 size={15} className="animate-spin" />
              <AnimatePresence mode="wait">
                <motion.span key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  {PROVISION_STEPS[step]}
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="mt-2 text-xs" style={{ color: "#64748B" }}>{clubName} · {email}</p>
            <div className="mt-5 h-1 w-56 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#e0584a,#c0392b)" }} animate={{ width: ["0%", "100%"] }} transition={{ duration: 2, ease: "easeInOut" }} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="success" className="flex flex-col items-center px-6 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.div
              className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", boxShadow: "0 0 50px rgba(34,197,94,0.5)" }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
            >
              <CheckCircle2 size={40} />
            </motion.div>
            <h2 className="mt-5 text-2xl font-black" style={{ color: "#fff" }}>Organisation créée</h2>
            <p className="mt-2 text-sm" style={{ color: "#94A3B8" }}>
              {clubName} · {email}
            </p>
            <p className="mt-1 text-xs" style={{ color: "#64748B" }}>Redirection vers la connexion…</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{label}</label>
      {children}
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [clubName, setClubName] = useState("");
  const [country, setCountry] = useState("");
  const [league, setLeague] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [clubLogoFile, setClubLogoFile] = useState<File | undefined>();
  const [clubLogoPreview, setClubLogoPreview] = useState<string | undefined>();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMeta, setSuccessMeta] = useState({ email: "", clubName: "" });

  function onLogoChange(file: File | undefined) {
    if (!file) return;
    setClubLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setClubLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!fullName.trim() || !clubName.trim() || !country.trim() || !league.trim()) {
      setError("Remplissez le responsable, le club et la localisation.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email professionnel invalide.");
      return;
    }
    if (!phone.trim()) {
      setError("Téléphone requis.");
      return;
    }
    if (password.length < 8) {
      setError("Mot de passe : minimum 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!acceptTerms || !acceptPrivacy) {
      setError("Acceptez les conditions et la politique de confidentialité.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedClub = clubName.trim();

    setPending(true);
    setSuccessMeta({ email: normalizedEmail, clubName: trimmedClub });
    setShowSuccess(true);

    try {
      await registerOrganization({
        fullName: fullName.trim(),
        clubName: trimmedClub,
        country: country.trim(),
        league: league.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        password,
        confirmPassword,
        invitationCode,
        acceptTerms,
        acceptPrivacy,
        clubLogo: clubLogoFile,
      });
    } catch (err) {
      setShowSuccess(false);
      setPending(false);
      setError(err instanceof Error ? err.message : "Erreur réseau.");
    }
  }

  return (
    <AuthShell
      layout="register"
      showBoot={false}
      featurePreview={FEATURES}
      sidebar={<StatsSidebar />}
      overlay={showSuccess && (
        <ProvisioningOverlay
          email={successMeta.email}
          clubName={successMeta.clubName}
          onDone={() => navigate("/login", { replace: true })}
        />
      )}
    >
      <div className="mb-5 flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: "rgba(249,115,22,0.15)", color: "#F97316" }}
        >
          <Building2 size={22} />
        </div>
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Créer votre organisation</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Configurez votre club sur ODIN ERP</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "#F97316" }}>
            <Building2 size={14} /> Organisation & Club
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nom du responsable" id="fullName">
              <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="glass-input w-full px-3 py-2.5 text-sm" placeholder="Ahmed Ben Salah" disabled={pending} />
            </Field>
            <Field label="Nom du club" id="clubName">
              <input id="clubName" value={clubName} onChange={(e) => setClubName(e.target.value)} className="glass-input w-full px-3 py-2.5 text-sm" placeholder="FC Carthage" disabled={pending} />
            </Field>
            <Field label="Pays" id="country">
              <input id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="glass-input w-full px-3 py-2.5 text-sm" placeholder="Tunisie" disabled={pending} />
            </Field>
            <Field label="Championnat" id="league">
              <input id="league" value={league} onChange={(e) => setLeague(e.target.value)} className="glass-input w-full px-3 py-2.5 text-sm" placeholder="Ligue Professionnelle 1" disabled={pending} />
            </Field>
            <Field label="Email professionnel" id="email">
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input w-full px-3 py-2.5 text-sm" placeholder="directeur@fccarthage.tn" disabled={pending} />
            </Field>
            <Field label="Téléphone" id="phone">
              <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="glass-input w-full px-3 py-2.5 text-sm" placeholder="+216 00 000 000" disabled={pending} />
            </Field>
            <Field label="Logo du club" id="clubLogo">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="clubLogo"
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-3 py-2.5 text-xs font-medium transition-colors hover:bg-white/5"
                  style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}
                >
                  <Upload size={14} /> Upload
                </label>
                <input id="clubLogo" type="file" accept="image/*" className="hidden" onChange={(e) => onLogoChange(e.target.files?.[0])} disabled={pending} />
                {clubLogoPreview && <img src={clubLogoPreview} alt="" className="h-10 w-10 rounded-lg object-contain" />}
              </div>
            </Field>
            <Field label="Mot de passe" id="password">
              <input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="glass-input w-full px-3 py-2.5 text-sm" placeholder="••••••••" disabled={pending} />
            </Field>
            <Field label="Confirmer mot de passe" id="confirmPassword">
              <input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="glass-input w-full px-3 py-2.5 text-sm" placeholder="••••••••" disabled={pending} />
            </Field>
          </div>
        </div>

        <Field label="Code invitation (optionnel)" id="invitationCode">
          <div className="relative">
            <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              id="invitationCode"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              className="glass-input w-full py-2.5 pl-9 pr-3 text-sm font-mono"
              placeholder="ODIN-FCC-2026"
              disabled={pending}
            />
          </div>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Club Access Key · laisser vide si ouvert</p>
        </Field>

        <div className="space-y-2.5 rounded-xl border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1" disabled={pending} />
            <span className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              J&apos;accepte les <span className="underline" style={{ color: "#F97316" }}>conditions d&apos;utilisation</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} className="mt-1" disabled={pending} />
            <span className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              J&apos;accepte la <span className="underline" style={{ color: "#F97316" }}>politique de confidentialité</span>
            </span>
          </label>
        </div>

        {error && (
          <p className="flex items-center gap-2 text-xs font-medium" style={{ color: "#EF4444" }}>
            <Shield size={13} /> {error}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={pending}
          whileHover={pending ? undefined : { scale: 1.02, boxShadow: "0 10px 30px rgba(192,57,43,0.5)" }}
          whileTap={pending ? undefined : { scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-90"
          style={{ background: "linear-gradient(135deg,#e0584a,#c0392b)" }}
        >
          {pending ? (
            <><Loader2 size={16} className="animate-spin" /> Création en cours...</>
          ) : (
            <>Créer mon organisation <ArrowRight size={16} /></>
          )}
        </motion.button>
      </form>

      <div className="mt-5 xl:hidden">
        <StatsSidebar />
      </div>

      <p className="mt-5 text-center text-sm">
        Déjà un compte ?{" "}
        <Link to="/login" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "#F97316" }}>
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}
