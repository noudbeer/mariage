import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getHouseholdById } from "@/lib/guests";
import { createGiteRequest, InvalidGiteRequestError } from "@/lib/gite";
import { sendGiteRequestEmail } from "@/lib/mailer";

const bodySchema = z.object({
  memberIds: z.array(z.string().min(1)).default([]),
  nombreNuits: z.number().int().min(1).max(3),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.householdId || !session.memberId) {
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }

  const household = getHouseholdById(session.householdId);
  if (!household) {
    return NextResponse.json({ error: "Foyer introuvable." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { memberIds, nombreNuits } = parsed.data;

  try {
    createGiteRequest(household, session.memberId, memberIds, nombreNuits);
  } catch (err) {
    if (err instanceof InvalidGiteRequestError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const noms = household.membres
    .filter((m) => memberIds.includes(m.id))
    .map((m) => `${m.prenom} ${m.nom}`);

  await sendGiteRequestEmail({
    householdId: household.id,
    noms,
    nombrePersonnes: noms.length,
    nombreNuits,
  });

  return NextResponse.json({ ok: true });
}
