import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { giteRequests } from "../../drizzle/schema";
import type { Household } from "./guests";

export interface GiteRequest {
  id: number;
  submittedByMemberId: string;
  memberIds: string[];
  nombrePersonnes: number;
  nombreNuits: number;
  createdAt: string;
}

export function getHouseholdGiteRequests(householdId: string): GiteRequest[] {
  const rows = getDb()
    .select()
    .from(giteRequests)
    .where(eq(giteRequests.householdId, householdId))
    .all();

  return rows
    .map((row) => ({
      id: row.id,
      submittedByMemberId: row.submittedByMemberId,
      memberIds: JSON.parse(row.memberIds) as string[],
      nombrePersonnes: row.nombrePersonnes,
      nombreNuits: row.nombreNuits,
      createdAt: row.createdAt,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export class InvalidGiteRequestError extends Error {}

export function createGiteRequest(
  household: Household,
  submittedByMemberId: string,
  memberIds: string[],
  nombreNuits: number,
): void {
  const householdMemberIds = new Set(household.membres.map((m) => m.id));
  if (!householdMemberIds.has(submittedByMemberId)) {
    throw new InvalidGiteRequestError("Membre inconnu dans ce foyer.");
  }
  if (!memberIds.every((id) => householdMemberIds.has(id))) {
    throw new InvalidGiteRequestError("Un des membres sélectionnés n'appartient pas à ce foyer.");
  }
  if (nombreNuits < 1 || nombreNuits > 3) {
    throw new InvalidGiteRequestError("Nombre de nuits invalide.");
  }

  getDb()
    .insert(giteRequests)
    .values({
      householdId: household.id,
      submittedByMemberId,
      memberIds: JSON.stringify(memberIds),
      nombrePersonnes: memberIds.length,
      nombreNuits,
      createdAt: new Date().toISOString(),
    })
    .run();
}
