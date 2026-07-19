import { loadGuests, EVENT_KEYS } from "@/lib/guests";
import { getAllRsvpRows } from "@/lib/rsvp";
import { EVENTS } from "@/lib/events";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const { foyers } = loadGuests();
  const rows = getAllRsvpRows();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Récapitulatif des réponses</h1>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left">
              <th className="py-2 pr-4">Foyer</th>
              <th className="py-2 pr-4">Nom</th>
              {EVENT_KEYS.map((key) => (
                <th key={key} className="py-2 pr-4">
                  {EVENTS[key].label}
                </th>
              ))}
              <th className="py-2 pr-4">Remarque</th>
            </tr>
          </thead>
          <tbody>
            {foyers.map((household) =>
              household.membres.map((member) => (
                <tr key={member.id} className="border-b border-black/5">
                  <td className="py-2 pr-4 text-[var(--color-text-muted)]">{household.id}</td>
                  <td className="py-2 pr-4">
                    {member.prenom} {member.nom}
                  </td>
                  {EVENT_KEYS.map((key) => {
                    if (!member.invitations[key]) {
                      return (
                        <td key={key} className="py-2 pr-4 text-black/20">
                          —
                        </td>
                      );
                    }
                    const row = rows.find((r) => r.memberId === member.id && r.eventKey === key);
                    const status = row?.status ?? "pending";
                    const label =
                      status === "confirmed" ? "✓" : status === "declined" ? "✗" : "…";
                    return (
                      <td key={key} className="py-2 pr-4">
                        {label}
                      </td>
                    );
                  })}
                  <td className="py-2 pr-4 text-[var(--color-text-muted)]">
                    {rows.find((r) => r.memberId === member.id && r.comment)?.comment ?? ""}
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
