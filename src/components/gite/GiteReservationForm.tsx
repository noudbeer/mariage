"use client";

import { useState } from "react";

interface MemberOption {
  id: string;
  nom: string;
}

interface Props {
  members: MemberOption[];
  householdAlreadyResponded: boolean;
}

export default function GiteReservationForm({ members, householdAlreadyResponded }: Props) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [nombreNuits, setNombreNuits] = useState(3);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleMember(id: string) {
    setSaved(false);
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const memberIds = members.filter((m) => selected[m.id]).map((m) => m.id);

    try {
      const response = await fetch("/api/gite-reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds, nombreNuits }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Une erreur est survenue.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Impossible d'envoyer la demande. Vérifiez votre connexion.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {householdAlreadyResponded && (
        <p className="rounded-md border border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)]/20 px-4 py-3 text-sm">
          Un membre de votre foyer a déjà fait une demande pour le gîte. Vous pouvez tout de
          même en soumettre une nouvelle si besoin.
        </p>
      )}

      <section className="rounded-lg border border-black/10 p-5">
        <h2 className="mb-3 font-medium">Qui dans le foyer souhaite dormir au gîte ?</h2>
        <div className="flex flex-col gap-2">
          {members.map((member) => (
            <label key={member.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!selected[member.id]}
                onChange={() => toggleMember(member.id)}
              />
              {member.nom}
            </label>
          ))}
        </div>

        <label className="mt-4 flex flex-col gap-1 text-sm">
          Nombre de nuits (du lundi au jeudi midi, 3 nuits max)
          <input
            type="number"
            min={1}
            max={3}
            value={nombreNuits}
            onChange={(e) => {
              setSaved(false);
              setNombreNuits(Number(e.target.value));
            }}
            className="w-24 rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </label>
      </section>

      <p className="text-xs text-[var(--color-text-muted)]">
        Ceci est une simple demande : nous vous recontacterons pour valider votre inscription.
      </p>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-md bg-[var(--color-primary)] px-6 py-2 font-medium text-white disabled:opacity-60"
        >
          {saving ? "Envoi..." : "Envoyer ma demande"}
        </button>
        {saved && <span className="text-sm text-green-700">Demande envoyée ✓</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
