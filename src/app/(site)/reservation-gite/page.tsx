import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getHouseholdById } from "@/lib/guests";
import { getHouseholdGiteRequests } from "@/lib/gite";
import ScrollReveal from "@/components/hero/ScrollReveal";
import GiteReservationForm from "@/components/gite/GiteReservationForm";
import { PRIX_NUIT_PAR_PERSONNE } from "@/lib/giteTarif";

export const dynamic = "force-dynamic";

export default async function ReservationGitePage() {
  const session = await getSession();
  if (!session.householdId) {
    redirect("/connexion");
  }

  const household = getHouseholdById(session.householdId);
  if (!household) {
    redirect("/connexion");
  }

  const requests = getHouseholdGiteRequests(household.id);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Réservation du gîte</h1>

      <p className="mb-10 text-sm text-[var(--color-text-muted)]">
        Nous avons loué un gîte sur le lieu du mariage, du lundi au jeudi midi, pour profiter
        encore un peu de vous après la fête. Piscine, terrain de pétanque, grande terrasse et
        barbecue vous y attendent.
        <br />
        <br />
        Le prix est fixé à {PRIX_NUIT_PAR_PERSONNE}€ par nuit et par personne, à régler en
        espèces. Si l&apos;aventure vous tente,
        laissez-nous une demande ci-dessous.
      </p>

      <ScrollReveal>
        <GiteReservationForm
          members={household.membres.map((m) => ({ id: m.id, nom: `${m.prenom} ${m.nom}` }))}
          householdAlreadyResponded={requests.length > 0}
        />
      </ScrollReveal>
    </main>
  );
}
