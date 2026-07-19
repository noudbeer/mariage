import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getHouseholdById } from "@/lib/guests";
import { config } from "@/lib/config";
import WelcomeHero from "@/components/hero/WelcomeHero";
import ScrollReveal from "@/components/hero/ScrollReveal";

// Nom provisoire, à confirmer.
const VENUE_NAME = "La Médicée";

export default async function BienvenuePage() {
  const session = await getSession();
  if (!session.householdId) {
    redirect("/connexion");
  }

  const household = getHouseholdById(session.householdId);
  if (!household) {
    redirect("/connexion");
  }

  const member = household.membres.find((m) => m.id === session.memberId) ?? household.membres[0];

  return (
    <main>
      <WelcomeHero
        firstName={member.prenom}
        venueName={VENUE_NAME}
        dateLabel={formatWeddingDate()}
      />

      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <ScrollReveal>
          <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-primary)]">
            Le lieu
          </p>
          <h2 className="mt-2 text-3xl font-semibold">{VENUE_NAME}</h2>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Toutes les informations pratiques (adresse, accès) seront précisées sur le
            programme. Des photos du lieu seront ajoutées ici prochainement.
          </p>
        </ScrollReveal>
      </section>
    </main>
  );
}

function formatWeddingDate(): string | undefined {
  if (!config.weddingDate) return undefined;
  const date = new Date(config.weddingDate);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
