"use client";

import { useState } from "react";

interface HouseholdView {
  id: string;
  recipients: { name: string; email: string }[];
  pendingMembers: { name: string; events: string[] }[];
}

const DEFAULT_MESSAGE =
  "Nous préparons activement notre mariage et nous avons hâte de vous y retrouver ! Pour nous aider dans l'organisation, pourriez-vous prendre une minute pour indiquer votre présence aux différents moments de la fête sur notre site ?";

export default function RelanceForm({
  households,
  testRecipient,
}: {
  households: HouseholdView[];
  /** Adresse de test : si définie, toutes les relances lui sont envoyées. */
  testRecipient: string;
}) {
  const reachable = households.filter((h) => h.recipients.length > 0);
  const [selected, setSelected] = useState<Set<string>>(() => new Set(reachable.map((h) => h.id)));
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ sent: string[]; failed: string[] } | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(selected.size === reachable.length ? new Set() : new Set(reachable.map((h) => h.id)));
  }

  async function handleSend() {
    const emailCount = reachable
      .filter((h) => selected.has(h.id))
      .reduce((sum, h) => sum + h.recipients.length, 0);
    const question = testRecipient
      ? `MODE TEST : envoyer ${selected.size} mail(s) de relance à ${testRecipient} uniquement ?`
      : `Envoyer la relance à ${selected.size} foyer(s) (${emailCount} adresse(s)) ?`;
    if (!window.confirm(question)) {
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/admin/relance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ householdIds: [...selected], message }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? "Une erreur est survenue.");
        return;
      }
      setResult(data);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="mt-8 flex flex-col gap-3">
        <p className="font-medium">
          Relance envoyée à {result.sent.length} foyer{result.sent.length > 1 ? "s" : ""}.
        </p>
        {result.failed.length > 0 && (
          <p className="text-sm text-red-600">
            Échec pour : {result.failed.join(", ")} (voir les logs du serveur).
          </p>
        )}
        <a href="/admin/relance" className="text-sm underline">
          Revenir à la liste
        </a>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      <label className="flex flex-col gap-1 text-sm">
        Message (inséré après « Bonjour … », suivi de la liste des personnes sans réponse, de la
        date limite et du bouton vers le site)
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="rounded-md border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </label>

      <div>
        <div className="flex items-center justify-between border-b border-black/10 pb-2 text-sm">
          <span>
            {selected.size} / {reachable.length} foyer(s) sélectionné(s)
          </span>
          <button type="button" onClick={toggleAll} className="underline">
            {selected.size === reachable.length ? "Tout désélectionner" : "Tout sélectionner"}
          </button>
        </div>

        <ul className="divide-y divide-black/5">
          {households.map((h) => {
            const disabled = h.recipients.length === 0;
            return (
              <li key={h.id} className="py-3">
                <label className={`flex gap-3 ${disabled ? "opacity-50" : "cursor-pointer"}`}>
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={selected.has(h.id)}
                    onChange={() => toggle(h.id)}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <p className="font-medium">{h.id}</p>
                    <p className="text-[var(--color-text-muted)]">
                      {disabled
                        ? "Aucune adresse email"
                        : h.recipients.map((r) => r.email).join(", ")}
                    </p>
                    <ul className="mt-1">
                      {h.pendingMembers.map((m) => (
                        <li key={m.name}>
                          {m.name} : <span className="text-[var(--color-text-muted)]">{m.events.join(", ")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSend}
        disabled={loading || selected.size === 0 || !message.trim()}
        className="rounded-md bg-[var(--color-primary)] px-4 py-2 font-medium text-white transition disabled:opacity-60"
      >
        {loading ? "Envoi en cours..." : "Envoyer la relance"}
      </button>
    </div>
  );
}
