import { getHouseholdsToRemind } from "@/lib/relance";
import { EVENTS } from "@/lib/events";
import { config } from "@/lib/config";
import RelanceForm from "@/components/admin/RelanceForm";

export const dynamic = "force-dynamic";

export default function RelancePage() {
  const households = getHouseholdsToRemind().map((h) => ({
    id: h.household.id,
    recipients: h.recipients.map((m) => ({ name: `${m.prenom} ${m.nom}`, email: m.email! })),
    pendingMembers: h.pendingMembers.map((p) => ({
      name: `${p.member.prenom} ${p.member.nom}`,
      events: p.pendingEvents.map((key) => EVENTS[key].label),
    })),
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <a href="/admin" className="text-sm underline">
        ← Récapitulatif
      </a>
      <h1 className="mt-4 text-2xl font-semibold">Relancer les invités</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Foyers dont au moins une personne n&apos;a pas encore répondu pour tous ses événements.
        Un email est envoyé par foyer, à tous ses membres ayant une adresse email.
      </p>

      {config.relanceTestRecipient && (
        <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Mode test :</strong> aucun invité ne recevra de mail. Toutes les relances sont
          envoyées à <strong>{config.relanceTestRecipient}</strong> (un mail par foyer coché). Pour
          envoyer réellement, mettre <code>RELANCE_TEST_RECIPIENT=</code> (vide) dans le .env.
        </p>
      )}

      {households.length === 0 ? (
        <p className="mt-8">Tout le monde a répondu 🎉</p>
      ) : (
        <RelanceForm households={households} testRecipient={config.relanceTestRecipient} />
      )}
    </main>
  );
}
