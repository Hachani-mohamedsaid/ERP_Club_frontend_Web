import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { GoogleIcon } from "../components/ui/GoogleIcon";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const role = login(email);
    const destination = role === "coach" ? "/coach" : role === "scout" ? "/scout" : "/dashboard";
    navigate(destination);
  }

  function handleQuickLogin(email: string) {
    const role = login(email);
    const destination = role === "coach" ? "/coach" : role === "scout" ? "/scout" : "/dashboard";
    navigate(destination);
  }

  function handleGoogleClick() {
    console.log("Google sign-in clicked - not yet implemented");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <div className="odin-backdrop" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-odin-md)] text-base font-semibold"
            style={{ background: "var(--accent)", color: "white" }}
          >
            O
          </div>
          <div className="text-center">
            <p
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              ODIN ERP
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Connexion à votre espace club
            </p>
          </div>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vous@club.com"
                className="glass-input w-full px-3 py-2.5 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="glass-input w-full px-3 py-2.5 text-sm"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Se connecter
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div
              className="h-px flex-1"
              style={{ background: "var(--surface-panel-border)" }}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              ou
            </span>
            <div
              className="h-px flex-1"
              style={{ background: "var(--surface-panel-border)" }}
            />
          </div>

          <button
            type="button"
            className="w-full text-center px-4 py-2.5 rounded-[var(--radius-odin-md)] border text-sm font-medium transition-all duration-300 mb-2"
            style={{ borderColor: "var(--surface-panel-border)", color: "var(--accent)" }}
            onClick={() => handleQuickLogin("coach@club.com")}
          >
            Se connecter comme Coach
          </button>
          <button
            type="button"
            className="w-full text-center px-4 py-2.5 rounded-[var(--radius-odin-md)] border text-sm font-medium transition-all duration-300 mb-2"
            style={{ borderColor: "var(--surface-panel-border)", color: "var(--accent)" }}
            onClick={() => handleQuickLogin("scout@club.com")}
          >
            Se connecter comme Scout
          </button>
          <button
            type="button"
            className="w-full text-center px-4 py-2.5 rounded-[var(--radius-odin-md)] border text-sm font-medium transition-all duration-300"
            style={{ borderColor: "var(--surface-panel-border)", color: "var(--accent)" }}
            onClick={() => handleQuickLogin("responsable@club.com")}
          >
            Se connecter comme Responsable
          </button>

          <div className="my-5 flex items-center gap-3">
            <div
              className="h-px flex-1"
              style={{ background: "var(--surface-panel-border)" }}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              ou
            </span>
            <div
              className="h-px flex-1"
              style={{ background: "var(--surface-panel-border)" }}
            />
          </div>

          <Button
            type="button"
            variant="glass"
            className="w-full"
            onClick={handleGoogleClick}
          >
            <GoogleIcon />
            Continuer avec Google
          </Button>

          <p className="mt-5 text-center text-sm">
            <Link
              to="/forgot-password"
              className="transition-opacity hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
            >
              Mot de passe oublié ?
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
