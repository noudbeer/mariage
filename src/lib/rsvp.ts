import { inArray } from "drizzle-orm";
import { getDb } from "./db";
import { rsvpResponses } from "../../drizzle/schema";
import { config } from "./config";
import { EVENT_KEYS, type EventKey, type Household, type Member } from "./guests";

export const RSVP_STATUSES = ["pending", "confirmed", "declined"] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];

/** true si la date limite de réponse (RSVP_DEADLINE) est fixée et dépassée. */
export function isRsvpClosed(): boolean {
  if (!config.rsvpDeadline) return false;
  return new Date() >= new Date(config.rsvpDeadline);
}

export interface MemberRsvpState {
  member: Member;
  events: { key: EventKey; status: RsvpStatus }[];
  commentEventKey: EventKey;
  comment: string | null;
}

/** Événement "principal" d'un membre où rattacher son commentaire (allergies, etc.). */
export function primaryEventForComment(member: Member): EventKey {
  if (member.invitations.repas) return "repas";
  if (member.invitations.brunch_lendemain) return "brunch_lendemain";
  const firstInvited = EVENT_KEYS.find((key) => member.invitations[key]);
  // Toujours défini : guests.json garantit qu'un membre a au moins une invitation à true.
  return firstInvited!;
}

export function getHouseholdRsvpState(household: Household): MemberRsvpState[] {
  const memberIds = household.membres.map((m) => m.id);
  const rows =
    memberIds.length > 0
      ? getDb().select().from(rsvpResponses).where(inArray(rsvpResponses.memberId, memberIds)).all()
      : [];

  return household.membres.map((member) => {
    const events = EVENT_KEYS.filter((key) => member.invitations[key]).map((key) => {
      const row = rows.find((r) => r.memberId === member.id && r.eventKey === key);
      return { key, status: (row?.status as RsvpStatus) ?? "pending" };
    });

    const commentEventKey = primaryEventForComment(member);
    const commentRow = rows.find(
      (r) => r.memberId === member.id && r.eventKey === commentEventKey,
    );

    return { member, events, commentEventKey, comment: commentRow?.comment ?? null };
  });
}

interface StatusUpdate {
  memberId: string;
  eventKey: EventKey;
  status: RsvpStatus;
}

interface CommentUpdate {
  memberId: string;
  comment: string;
}

export class InvalidRsvpUpdateError extends Error {}

export function applyRsvpUpdates(
  household: Household,
  statusUpdates: StatusUpdate[],
  commentUpdates: CommentUpdate[],
): void {
  const membersById = new Map(household.membres.map((m) => [m.id, m]));
  const now = new Date().toISOString();
  const db = getDb();

  for (const update of statusUpdates) {
    const member = membersById.get(update.memberId);
    if (!member || !member.invitations[update.eventKey]) {
      throw new InvalidRsvpUpdateError(
        `Le membre "${update.memberId}" n'est pas invité à "${update.eventKey}".`,
      );
    }

    db.insert(rsvpResponses)
      .values({
        householdId: household.id,
        memberId: update.memberId,
        eventKey: update.eventKey,
        status: update.status,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [rsvpResponses.memberId, rsvpResponses.eventKey],
        set: { status: update.status, updatedAt: now },
      })
      .run();
  }

  for (const update of commentUpdates) {
    const member = membersById.get(update.memberId);
    if (!member) {
      throw new InvalidRsvpUpdateError(`Le membre "${update.memberId}" n'appartient pas à ce foyer.`);
    }
    const eventKey = primaryEventForComment(member);

    db.insert(rsvpResponses)
      .values({
        householdId: household.id,
        memberId: update.memberId,
        eventKey,
        status: "pending",
        comment: update.comment || null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [rsvpResponses.memberId, rsvpResponses.eventKey],
        set: { comment: update.comment || null, updatedAt: now },
      })
      .run();
  }
}

// pour usage côté /admin (récap toutes réponses)
export function getAllRsvpRows() {
  return getDb().select().from(rsvpResponses).all();
}
