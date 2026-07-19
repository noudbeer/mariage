import { readFileSync, statSync } from "node:fs";
import { z } from "zod";
import { config } from "./config";

export const EVENT_KEYS = [
  "ceremonie_religieuse",
  "vin_honneur",
  "repas",
  "soiree",
  "brunch_lendemain",
] as const;

export type EventKey = (typeof EVENT_KEYS)[number];

const invitationsSchema = z.object({
  ceremonie_religieuse: z.boolean(),
  vin_honneur: z.boolean(),
  repas: z.boolean(),
  soiree: z.boolean(),
  brunch_lendemain: z.boolean(),
});

const memberSchema = z.object({
  id: z.string().min(1),
  prenom: z.string().min(1),
  nom: z.string().min(1),
  email: z.email().nullable(),
  invitations: invitationsSchema,
});

const householdSchema = z.object({
  id: z.string().min(1),
  membres: z.array(memberSchema).min(1, "un foyer doit contenir au moins un membre"),
});

const guestsFileSchema = z.object({
  foyers: z.array(householdSchema),
});

export type Member = z.infer<typeof memberSchema>;
export type Household = z.infer<typeof householdSchema>;
export type GuestsFile = z.infer<typeof guestsFileSchema>;

function validateCrossReferences(data: GuestsFile): void {
  const errors: string[] = [];
  const householdIds = new Set<string>();
  const memberIds = new Set<string>();
  const emails = new Map<string, string>(); // email normalisé -> member id

  for (const household of data.foyers) {
    if (householdIds.has(household.id)) {
      errors.push(`id de foyer dupliqué : "${household.id}"`);
    }
    householdIds.add(household.id);

    let householdHasEmail = false;

    for (const member of household.membres) {
      if (memberIds.has(member.id)) {
        errors.push(`id de membre dupliqué : "${member.id}"`);
      }
      memberIds.add(member.id);

      const hasAnyInvitation = EVENT_KEYS.some((key) => member.invitations[key]);
      if (!hasAnyInvitation) {
        errors.push(`le membre "${member.id}" n'a aucune invitation à true`);
      }

      if (member.email) {
        householdHasEmail = true;
        const normalized = member.email.trim().toLowerCase();
        const existingOwner = emails.get(normalized);
        if (existingOwner && existingOwner !== member.id) {
          errors.push(`email "${member.email}" utilisé par plusieurs membres`);
        }
        emails.set(normalized, member.id);
      }
    }

    if (!householdHasEmail) {
      errors.push(
        `le foyer "${household.id}" n'a aucun membre avec un email : personne ne pourra se connecter pour le gérer`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `data/guests.json invalide :\n${errors.map((e) => `  - ${e}`).join("\n")}`,
    );
  }
}

let cache: { mtimeMs: number; data: GuestsFile } | null = null;

export function loadGuests(): GuestsFile {
  const path = config.guestsJsonPath;
  const stat = statSync(path);

  if (cache && cache.mtimeMs === stat.mtimeMs) {
    return cache.data;
  }

  const raw = readFileSync(path, "utf-8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`data/guests.json n'est pas un JSON valide : ${(err as Error).message}`);
  }

  const result = guestsFileSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`data/guests.json invalide :\n${result.error.message}`);
  }

  validateCrossReferences(result.data);

  cache = { mtimeMs: stat.mtimeMs, data: result.data };
  return result.data;
}

export function findMemberByEmail(
  email: string,
): { household: Household; member: Member } | null {
  const normalized = email.trim().toLowerCase();
  const { foyers } = loadGuests();

  for (const household of foyers) {
    for (const member of household.membres) {
      if (member.email && member.email.trim().toLowerCase() === normalized) {
        return { household, member };
      }
    }
  }

  return null;
}

export function getHouseholdById(householdId: string): Household | null {
  const { foyers } = loadGuests();
  return foyers.find((h) => h.id === householdId) ?? null;
}
