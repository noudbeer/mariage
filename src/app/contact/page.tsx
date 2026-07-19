"use client";

import { useState, type FormEvent } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Une erreur est survenue. Réessayez.");
        return;
      }

      setSent(true);
    } catch {
      setError("Impossible d'envoyer le message. Vérifiez votre connexion internet.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">Message envoyé</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Merci, nous vous répondrons dès que possible.
        </p>
        <a href="/connexion" className="mt-2 text-sm underline">
          Retour à la connexion
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Nous contacter</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Un souci pour vous connecter, une question ? Écrivez-nous, nous vous répondrons
          rapidement.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Nom
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Message
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
          {loading ? "Envoi..." : "Envoyer"}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--color-text-muted)]">
        <a href="/connexion" className="underline">
          Retour à la connexion
        </a>
      </p>
    </main>
  );
}
