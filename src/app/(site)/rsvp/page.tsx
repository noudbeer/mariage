import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getHouseholdById } from "@/lib/guests";
import { getHouseholdRsvpState, isRsvpClosed } from "@/lib/rsvp";
import { getHouseholdGiteRequests } from "@/lib/gite";
import { EVENTS } from "@/lib/events";
import { config } from "@/lib/config";
import RsvpForm from "@/components/rsvp/RsvpForm";

export const dynamic = "force-dynamic";

export default async function RsvpPage() {
  const session = await getSession();
  if (!session.householdId) {
    redirect("/connexion");
  }

  const household = getHouseholdById(session.householdId);
  if (!household) {
    redirect("/connexion");
  }

  const state = getHouseholdRsvpState(household);
  const closed = isRsvpClosed();
  const giteRequests = getHouseholdGiteRequests(household.id);
  const membersById = new Map(household.membres.map((m) => [m.id, m]));

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Ma présence</h1>

      {closed ? (
        <p className="mb-10 text-sm text-[var(--color-primary)]">
          Les réponses sont closes depuis le{" "}
          {new Date(config.rsvpDeadline).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          . Vos réponses ci-dessous ne sont plus modifiables — contactez-nous si besoin
          d&apos;un changement.
        </p>
      ) : (
        <p className="mb-10 text-sm text-[var(--color-text-muted)]">
          Répondez pour chaque personne de votre foyer et chaque événement — vous pouvez
          confirmer certain·es et laisser les autres en attente ou décliner, indépendamment.
        </p>
      )}

      <RsvpForm initialState={state} eventLabels={eventLabels()} readOnly={closed} />

      {giteRequests.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-medium">Vos demandes de gîte</h2>
          <div className="flex flex-col gap-3">
            {giteRequests.map((request) => (
              <div key={request.id} className="rounded-md border border-black/10 p-4 text-sm">
                <p>
                  {request.nombrePersonnes} personne(s) — {request.nombreNuits} nuit(s)
                </p>
                <p className="text-[var(--color-text-muted)]">
                  {request.memberIds
                    .map((id) => membersById.get(id))
                    .filter((m): m is NonNullable<typeof m> => !!m)
                    .map((m) => `${m.prenom} ${m.nom}`)
                    .join(", ") || "Aucun membre sélectionné"}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Envoyée le{" "}
                  {new Date(request.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--color-text-muted)]">
            Ceci est une simple demande, nous vous recontacterons pour valider votre
            inscription.
          </p>
        </section>
      )}
    </main>
  );
}

function eventLabels() {
  return Object.fromEntries(
    Object.entries(EVENTS).map(([key, info]) => [key, info.label]),
  ) as Record<string, string>;
}
