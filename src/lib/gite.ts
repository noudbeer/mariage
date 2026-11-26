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
  nuitsParMembre: Record<string, number> | null;
  createdAt: string;
}

type GiteRequestRow = typeof giteRequests.$inferSelect;

function toGiteRequest(row: GiteRequestRow): GiteRequest {
  return {
    id: row.id,
    submittedByMemberId: row.submittedByMemberId,
    memberIds: JSON.parse(row.memberIds) as string[],
    nombrePersonnes: row.nombrePersonnes,
    nombreNuits: row.nombreNuits,
    nuitsParMembre: row.nuitsParMembre
      ? (JSON.parse(row.nuitsParMembre) as Record<string, number>)
      : null,
    createdAt: row.createdAt,
  };
}

export function getHouseholdGiteRequests(householdId: string): GiteRequest[] {
  const rows = getDb()
    .select()
    .from(giteRequests)
    .where(eq(giteRequests.householdId, householdId))
    .all();

  return rows.map(toGiteRequest).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Toutes les demandes, tous foyers confondus, de la plus récente à la plus ancienne. */
export function getAllGiteRequests(): (GiteRequest & { householdId: string })[] {
  return getDb()
    .select()
    .from(giteRequests)
    .all()
    .map((row) => ({ ...toGiteRequest(row), householdId: row.householdId }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export class InvalidGiteRequestError extends Error {}

export function createGiteRequest(
  household: Household,
  submittedByMemberId: string,
  nuitsParMembre: Record<string, number>,
): void {
  const memberIds = Object.keys(nuitsParMembre);
  const householdMemberIds = new Set(household.membres.map((m) => m.id));
  if (!householdMemberIds.has(submittedByMemberId)) {
    throw new InvalidGiteRequestError("Membre inconnu dans ce foyer.");
  }
  if (!memberIds.every((id) => householdMemberIds.has(id))) {
    throw new InvalidGiteRequestError("Un des membres sélectionnés n'appartient pas à ce foyer.");
  }
  const nuits = Object.values(nuitsParMembre);
  if (!nuits.every((n) => Number.isInteger(n) && n >= 1 && n <= 3)) {
    throw new InvalidGiteRequestError("Nombre de nuits invalide.");
  }

  getDb()
    .insert(giteRequests)
    .values({
      householdId: household.id,
      submittedByMemberId,
      memberIds: JSON.stringify(memberIds),
      nombrePersonnes: memberIds.length,
      // durée du séjour la plus longue ; le détail par personne est dans nuitsParMembre
      nombreNuits: nuits.length > 0 ? Math.max(...nuits) : 0,
      nuitsParMembre: JSON.stringify(nuitsParMembre),
      createdAt: new Date().toISOString(),
    })
    .run();
}
