import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(email);
    setSubmitted(true);
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
          </div>
        </div>

        <GlassCard className="p-8">
          {submitted ? (
            <div className="space-y-4 text-center">
              <p
                className="text-base font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Mot de passe oublié ?
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Si un compte existe avec cette adresse, un lien a été envoyé.
              </p>
              <Link
                to="/login"
                className="inline-block text-sm transition-opacity hover:opacity-80"
                style={{ color: "var(--accent)" }}
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h1
                  className="text-base font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Mot de passe oublié ?
                </h1>
                <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  Saisissez votre adresse email et nous vous enverrons un lien pour
                  réinitialiser votre mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="reset-email"
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="vous@club.com"
                    className="glass-input w-full px-3 py-2.5 text-sm"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full">
                  Envoyer le lien de réinitialisation
                </Button>
              </form>

              <p className="mt-5 text-center text-sm">
                <Link
                  to="/login"
                  className="transition-opacity hover:opacity-80"
                  style={{ color: "var(--text-muted)" }}
                >
                  Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
