"use client";

import { useState } from "react";
import { PRIX_NUIT_PAR_PERSONNE } from "@/lib/giteTarif";

interface MemberOption {
  id: string;
  nom: string;
}

interface Props {
  members: MemberOption[];
  householdAlreadyResponded: boolean;
}

export default function GiteReservationForm({ members, householdAlreadyResponded }: Props) {
  // memberId -> nombre de nuits ; absent = ne dort pas au gîte
  const [nuitsParMembre, setNuitsParMembre] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleMember(id: string) {
    setSaved(false);
    setNuitsParMembre((prev) => {
      const next = { ...prev };
      if (id in next) delete next[id];
      else next[id] = 3;
      return next;
    });
  }

  function setNuits(id: string, nuits: number) {
    setSaved(false);
    setNuitsParMembre((prev) => ({ ...prev, [id]: nuits }));
  }

  const lignesDevis = members
    .filter((m) => m.id in nuitsParMembre)
    .map((m) => ({ ...m, nuits: nuitsParMembre[m.id] }));
  const totalDevis = lignesDevis.reduce((sum, l) => sum + l.nuits * PRIX_NUIT_PAR_PERSONNE, 0);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch("/api/gite-reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuitsParMembre }),
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
        <p className="mb-3 text-xs text-[var(--color-text-muted)]">
          Du lundi au jeudi midi, 3 nuits maximum par personne.
        </p>
        <div className="flex flex-col gap-2">
          {members.map((member) => {
            const checked = member.id in nuitsParMembre;
            return (
              <div key={member.id} className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleMember(member.id)}
                  />
                  {member.nom}
                </label>
                {checked && (
                  <select
                    value={nuitsParMembre[member.id]}
                    onChange={(e) => setNuits(member.id, Number(e.target.value))}
                    aria-label={`Nombre de nuits pour ${member.nom}`}
                    className="rounded-md border border-black/10 px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    {[1, 2, 3].map((n) => (
                      <option key={n} value={n}>
                        {n} nuit{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {lignesDevis.length > 0 && (
        <section className="rounded-lg border border-black/10 p-5">
          <h2 className="mb-3 font-medium">Estimation</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {lignesDevis.map((ligne) => (
              <li key={ligne.id} className="flex justify-between gap-4">
                <span>
                  {ligne.nom} — {ligne.nuits} nuit{ligne.nuits > 1 ? "s" : ""} ×{" "}
                  {PRIX_NUIT_PAR_PERSONNE} €
                </span>
                <span className="tabular-nums">{ligne.nuits * PRIX_NUIT_PAR_PERSONNE} €</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between gap-4 border-t border-black/10 pt-3 font-medium">
            <span>Total</span>
            <span className="tabular-nums">{totalDevis} €</span>
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            À régler en espèces sur place.
          </p>
        </section>
      )}

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
