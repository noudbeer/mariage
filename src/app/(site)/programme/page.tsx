import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getHouseholdById } from "@/lib/guests";
import { EVENTS, EVENT_ORDER } from "@/lib/events";
import ScrollReveal from "@/components/hero/ScrollReveal";

export default async function ProgrammePage() {
  const session = await getSession();
  if (!session.householdId) {
    redirect("/connexion");
  }

  const household = getHouseholdById(session.householdId);
  if (!household) {
    redirect("/connexion");
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-10 text-2xl font-semibold">Le programme</h1>

      <div className="flex flex-col gap-10">
        {household.membres.map((member) => {
          const invitedEvents = EVENT_ORDER.filter((key) => member.invitations[key]);
          if (invitedEvents.length === 0) return null;

          return (
            <ScrollReveal key={member.id}>
              <section>
                <h2 className="mb-3 text-lg font-medium">
                  {member.prenom} {member.nom}
                </h2>
                <ol className="flex flex-col gap-4 border-l-2 border-[var(--color-primary-soft)] pl-4">
                  {invitedEvents.map((key) => {
                    const event = EVENTS[key];
                    return (
                      <li key={key}>
                        <p className="font-medium text-[var(--color-primary)]">{event.label}</p>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          {event.heure} — {event.lieu}
                        </p>
                        <p className="text-sm">{event.description}</p>
                      </li>
                    );
                  })}
                </ol>
              </section>
            </ScrollReveal>
          );
        })}
      </div>

      <p className="mt-12 text-center text-sm">
        <a href="/rsvp" className="underline">
          Confirmer votre présence
        </a>
      </p>
    </main>
  );
}
