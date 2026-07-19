"use client";

import { useState } from "react";
import type { MemberRsvpState, RsvpStatus } from "@/lib/rsvp";
import type { EventKey } from "@/lib/guests";

interface Props {
  initialState: MemberRsvpState[];
  eventLabels: Record<string, string>;
  readOnly?: boolean;
}

const STATUS_OPTIONS: { value: RsvpStatus; label: string }[] = [
  { value: "confirmed", label: "Présent·e" },
  { value: "declined", label: "Absent·e" },
  { value: "pending", label: "?" },
];

export default function RsvpForm({ initialState, eventLabels, readOnly = false }: Props) {
  const [statuses, setStatuses] = useState<Record<string, Record<string, RsvpStatus>>>(() =>
    Object.fromEntries(
      initialState.map((m) => [
        m.member.id,
        Object.fromEntries(m.events.map((e) => [e.key, e.status])),
      ]),
    ),
  );
  const [comments, setComments] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialState.map((m) => [m.member.id, m.comment ?? ""])),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setStatus(memberId: string, eventKey: EventKey, status: RsvpStatus) {
    setSaved(false);
    setStatuses((prev) => ({
      ...prev,
      [memberId]: { ...prev[memberId], [eventKey]: status },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const statusUpdates = initialState.flatMap((m) =>
      m.events.map((e) => ({
        memberId: m.member.id,
        eventKey: e.key,
        status: statuses[m.member.id][e.key],
      })),
    );
    const commentUpdates = initialState.map((m) => ({
      memberId: m.member.id,
      comment: comments[m.member.id] ?? "",
    }));

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusUpdates, commentUpdates }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Une erreur est survenue.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Impossible d'enregistrer vos réponses. Vérifiez votre connexion.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {initialState.map(({ member, events }) => (
        <section key={member.id} className="rounded-lg border border-black/10 p-5">
          <h2 className="mb-4 font-medium">
            {member.prenom} {member.nom}
          </h2>

          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <div key={event.key} className="flex items-center justify-between gap-4">
                <span className="text-sm">{eventLabels[event.key]}</span>
                <div className="flex gap-1">
                  {STATUS_OPTIONS.map((opt) => {
                    const active = statuses[member.id]?.[event.key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={readOnly}
                        onClick={() => setStatus(member.id, event.key, opt.value)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          active
                            ? "bg-[var(--color-primary)] text-white"
                            : "bg-[var(--color-primary-soft)]/40 text-[var(--color-text)]"
                        } ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <label className="mt-4 flex flex-col gap-1 text-sm">
            Allergies / remarque (optionnel)
            <textarea
              value={comments[member.id] ?? ""}
              onChange={(e) =>
                setComments((prev) => ({ ...prev, [member.id]: e.target.value }))
              }
              readOnly={readOnly}
              rows={2}
              className={`rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                readOnly ? "bg-black/5" : ""
              }`}
            />
          </label>
        </section>
      ))}

      {!readOnly && (
        <div className="sticky bottom-4 flex items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-[var(--color-primary)] px-6 py-2 font-medium text-white disabled:opacity-60"
          >
            {saving ? "Enregistrement..." : "Valider mes réponses"}
          </button>
          {saved && <span className="text-sm text-green-700">Enregistré ✓</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      )}
    </div>
  );
}
