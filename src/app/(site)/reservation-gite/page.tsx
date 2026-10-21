import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getHouseholdById } from "@/lib/guests";
import { getHouseholdGiteRequests } from "@/lib/gite";
import ScrollReveal from "@/components/hero/ScrollReveal";
import GiteReservationForm from "@/components/gite/GiteReservationForm";

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
        Le gîte est loué sur le lieu du mariage, du lundi au jeudi midi, pour 30€ par
        personne. Piscine, terrain de pétanque, grande terrasse et barbecue sur place.
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
