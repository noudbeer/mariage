import { EVENT_KEYS, loadGuests, type EventKey, type Household, type Member } from "./guests";
import { getAllRsvpRows } from "./rsvp";

export interface PendingMember {
  member: Member;
  pendingEvents: EventKey[];
}

export interface HouseholdToRemind {
  household: Household;
  /** Membres du foyer ayant au moins un événement sans réponse. */
  pendingMembers: PendingMember[];
  /** Membres du foyer ayant un email : destinataires de la relance. */
  recipients: Member[];
}

/**
 * Foyers dont au moins un membre n'a pas répondu (ni ✓ ni ✗) à l'un des événements
 * auxquels il est invité. La réponse se fait par foyer : tous les membres avec un email
 * reçoivent la relance, puisque n'importe lequel peut se connecter et répondre pour les autres.
 */
export function getHouseholdsToRemind(): HouseholdToRemind[] {
  const { foyers } = loadGuests();
  const answered = new Set(
    getAllRsvpRows()
      .filter((r) => r.status === "confirmed" || r.status === "declined")
      .map((r) => `${r.memberId}:${r.eventKey}`),
  );

  const result: HouseholdToRemind[] = [];
  for (const household of foyers) {
    const pendingMembers = household.membres
      .map((member) => ({
        member,
        pendingEvents: EVENT_KEYS.filter(
          (key) => member.invitations[key] && !answered.has(`${member.id}:${key}`),
        ),
      }))
      .filter((p) => p.pendingEvents.length > 0);

    if (pendingMembers.length === 0) continue;

    result.push({
      household,
      pendingMembers,
      recipients: household.membres.filter((m) => m.email),
    });
  }
  return result;
}
