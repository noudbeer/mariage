import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getHouseholdById } from "@/lib/guests";
import { EVENTS, EVENT_ORDER, formatEventDate } from "@/lib/events";
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
      <div className="sm:px-30">
        <h1 className="mb-10 text-2xl font-semibold">Le programme</h1>
      </div>

      <div className="flex flex-col divide-y-1 divide-[var(--color-primary)]">
        {household.membres.map((member) => {
          const invitedEvents = EVENT_ORDER.filter((key) => member.invitations[key]);
          if (invitedEvents.length === 0) return null;

          const days = new Map<string, (typeof invitedEvents)[number][]>();
          for (const key of invitedEvents) {
            const date = EVENTS[key].date;
            const existing = days.get(date);
            if (existing) {
              existing.push(key);
            } else {
              days.set(date, [key]);
            }
          }

          return (
            <ScrollReveal key={member.id} className="py-10 first:pt-0 last:pb-0">
              <section className="sm:px-30">
                <h2 className="mb-3 text-lg font-medium">
                  {member.prenom} {member.nom}
                </h2>
                <div className="flex flex-col gap-6">
                  {[...days.entries()].map(([date, keys]) => (
                    <div key={date}>
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                        {formatEventDate(date)}
                      </h3>
                      <ol className="flex flex-col gap-4 border-l-2 border-[var(--color-primary-soft)] pl-4">
                        {keys.map((key) => {
                          const event = EVENTS[key];
                          return (
                            <li key={key}>
                              <p className="font-medium text-[var(--color-primary)]">
                                {event.label}
                              </p>
                              <p className="text-sm text-[var(--color-text-muted)]">
                                {event.heure} — {event.lieu}
                              </p>
                              <p className="text-sm">{event.description}</p>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  ))}
                </div>
              </section>
            </ScrollReveal>
          );
        })}
      </div>

      <p className="mt-12 text-center text-sm sm:px-30">
        <a href="/rsvp" className="underline">
          Confirmer votre présence
        </a>
      </p>

      <ScrollReveal>
        <div className="mt-10 rounded-lg border border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)]/10 p-6 text-center">
          <h2 className="mb-2 font-medium">Un gîte sur place</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Nous avons loué un gîte pour 36 personnes sur le lieu du mariage, du lundi au
            jeudi midi, pour 30€ par nuit et par personne. Piscine, terrain de pétanque, grande terrasse
            et barbecue sur place !
          </p>
          <a
            href="/reservation-gite"
            className="mt-4 inline-block rounded-full bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-white"
          >
            Faire une demande de réservation
          </a>
        </div>
      </ScrollReveal>
    </main>
  );
}
