import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { AuthShell, OdinLogo } from "../components/auth/AuthShell";
import { GoogleIcon } from "../components/ui/GoogleIcon";

const REGISTER_STEPS = ["Création du compte...", "Vérification email...", "Configuration profil..."];

function RegisterSuccessOverlay({ email, onDone }: { email: string; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStep(1), 600),
      window.setTimeout(() => setStep(2), 1200),
      window.setTimeout(() => setDone(true), 1900),
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
          <motion.div key="loading" className="flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <OdinLogo width={220} />
            <h2 className="mt-5 text-lg font-bold" style={{ color: "#fff" }}>Création de compte</h2>
            <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: "#94A3B8" }}>
              <Loader2 size={15} className="animate-spin" />
              <AnimatePresence mode="wait">
                <motion.span key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  {REGISTER_STEPS[step]}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="mt-5 h-1 w-52 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div className="h-full rounded-full" style={{ background: "#F97316" }} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.9, ease: "easeInOut" }} />
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
            <h2 className="mt-5 text-2xl font-black" style={{ color: "#fff" }}>Compte créé</h2>
            <p className="mt-2 text-sm" style={{ color: "#94A3B8" }}>
              {email} · en attente de validation admin
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clubName, setClubName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!fullName.trim() || !email.trim()) {
      setError("Nom et email requis.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email invalide.");
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
    setPending(true);
    setShowSuccess(true);
  }

  return (
    <AuthShell
      overlay={showSuccess && (
        <RegisterSuccessOverlay
          email={email.trim().toLowerCase()}
          onDone={() => navigate("/login", { replace: true })}
        />
      )}
    >
      <div className="mb-5 flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: "rgba(249,115,22,0.15)", color: "#F97316" }}
        >
          <UserPlus size={22} />
        </div>
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Créer un compte</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Rejoignez votre club sur ODIN ERP</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Nom complet</label>
          <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="glass-input w-full px-3 py-2.5 text-sm" placeholder="Ahmed Ben Salah" disabled={pending} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="clubName" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Club</label>
          <input id="clubName" value={clubName} onChange={(e) => setClubName(e.target.value)} className="glass-input w-full px-3 py-2.5 text-sm" placeholder="FC Carthage" disabled={pending} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input w-full px-3 py-2.5 text-sm" placeholder="vous@club.com" disabled={pending} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Mot de passe</label>
            <input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="glass-input w-full px-3 py-2.5 text-sm" placeholder="••••••••" disabled={pending} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Confirmer</label>
            <input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="glass-input w-full px-3 py-2.5 text-sm" placeholder="••••••••" disabled={pending} />
          </div>
        </div>

        {error && <p className="text-xs font-medium" style={{ color: "#EF4444" }}>{error}</p>}

        <motion.button
          type="submit"
          disabled={pending}
          whileHover={pending ? undefined : { scale: 1.02, boxShadow: "0 10px 30px rgba(192,57,43,0.5)" }}
          whileTap={pending ? undefined : { scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-90"
          style={{ background: "linear-gradient(135deg,#e0584a,#c0392b)" }}
        >
          {pending ? (
            <><Loader2 size={16} className="animate-spin" /> Création en cours...</>
          ) : (
            <>S&apos;inscrire <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.4, repeat: Infinity }}><ArrowRight size={16} /></motion.span></>
          )}
        </motion.button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "var(--surface-panel-border)" }} />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>ou</span>
        <div className="h-px flex-1" style={{ background: "var(--surface-panel-border)" }} />
      </div>

      <button
        type="button"
        onClick={() => console.log("Google sign-up - not implemented")}
        className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
        style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
      >
        <GoogleIcon /> Continuer avec Google
      </button>

      <p className="mt-5 text-center text-sm">
        Déjà un compte ?{" "}
        <Link to="/login" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "#F97316" }}>
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}
