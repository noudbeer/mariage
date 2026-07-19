import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getHouseholdById, EVENT_KEYS } from "@/lib/guests";
import { applyRsvpUpdates, InvalidRsvpUpdateError, RSVP_STATUSES, isRsvpClosed } from "@/lib/rsvp";

const bodySchema = z.object({
  statusUpdates: z
    .array(
      z.object({
        memberId: z.string().min(1),
        eventKey: z.enum(EVENT_KEYS),
        status: z.enum(RSVP_STATUSES),
      }),
    )
    .default([]),
  commentUpdates: z
    .array(
      z.object({
        memberId: z.string().min(1),
        comment: z.string().max(500),
      }),
    )
    .default([]),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.householdId) {
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }

  const household = getHouseholdById(session.householdId);
  if (!household) {
    return NextResponse.json({ error: "Foyer introuvable." }, { status: 401 });
  }

  if (isRsvpClosed()) {
    return NextResponse.json(
      { error: "Les réponses ne sont plus modifiables, la date limite est dépassée." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    applyRsvpUpdates(household, parsed.data.statusUpdates, parsed.data.commentUpdates);
  } catch (err) {
    if (err instanceof InvalidRsvpUpdateError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
