import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getHouseholdById } from "@/lib/guests";
import { getHouseholdRsvpState, isRsvpClosed } from "@/lib/rsvp";
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
    </main>
  );
}

function eventLabels() {
  return Object.fromEntries(
    Object.entries(EVENTS).map(([key, info]) => [key, info.label]),
  ) as Record<string, string>;
}
