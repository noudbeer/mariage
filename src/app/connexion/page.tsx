"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ConnexionPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRequestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Une erreur est survenue. Réessayez.");
        return;
      }

      setStep("code");
    } catch {
      setError("Impossible d'envoyer le code. Vérifiez votre connexion internet.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Une erreur est survenue. Réessayez.");
        return;
      }

      router.push("/bienvenue");
      router.refresh();
    } catch {
      setError("Impossible de vous connecter. Vérifiez votre connexion internet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="font-script text-5xl">Tiffany &amp; Simon</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {step === "email"
            ? "Entrez votre adresse email pour recevoir un code de connexion."
            : `Un code a été envoyé à ${email}. Saisissez-le ci-dessous.`}
        </p>
      </div>

      {step === "email" ? (
        <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@exemple.com"
              className="rounded-md border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </label>

          {/* Honeypot anti-bot : caché visuellement, invisible pour un humain */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            aria-hidden="true"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 font-medium text-white transition disabled:opacity-60"
          >
            {loading ? "Envoi..." : "Recevoir mon code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Code à 6 chiffres
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="rounded-md border border-black/10 px-3 py-2 text-center text-lg tracking-[0.3em] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 font-medium text-white transition disabled:opacity-60"
          >
            {loading ? "Vérification..." : "Se connecter"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="text-sm text-[var(--color-text-muted)] underline"
          >
            Changer d&apos;adresse email
          </button>
        </form>
      )}

      <p className="text-center text-sm text-[var(--color-text-muted)]">
        Un souci pour vous connecter ?{" "}
        <a href="/contact" className="underline">
          Contactez-nous
        </a>
        .
      </p>

      <nav className="flex justify-center gap-4 text-xs text-[var(--color-text-muted)]">
        <a href="/admin" className="underline">
          Espace mariés · suivi des réponses
        </a>
        <a href="/theme" className="underline">
          Espace mariés · thème
        </a>
      </nav>
    </main>
  );
}
