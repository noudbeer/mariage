import { config } from "./config";
import { getHouseholdById } from "./guests";
import type { SessionData } from "./session";

/** true si la session appartient à l'un des mariés (ADMIN_EMAILS). */
export function isAdminSession(session: SessionData): boolean {
  if (!session.householdId || !session.memberId) return false;
  const member = getHouseholdById(session.householdId)?.membres.find(
    (m) => m.id === session.memberId,
  );
  if (!member?.email) return false;
  return config.adminEmails.includes(member.email.trim().toLowerCase());
}
