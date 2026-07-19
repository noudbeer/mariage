import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findMemberByEmail } from "@/lib/guests";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";
import { recordLoginAttempt } from "@/lib/db";

const GENERIC_ERROR =
  "Adresse email non reconnue. Vérifiez l'orthographe ou contactez-nous.";

const requestOtpSchema = z.object({
  email: z.string().min(1),
  // Honeypot : champ caché côté formulaire, invisible pour un humain.
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (!checkRateLimit(ip, "otp-request")) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { email, website } = parsed.data;

  if (website) {
    recordLoginAttempt(ip, email, false);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const found = findMemberByEmail(email);
  if (!found) {
    recordLoginAttempt(ip, email, false);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const code = createOtp(email, found.household.id, found.member.id);

  try {
    await sendOtpEmail({ to: email, code });
  } catch (err) {
    console.error("Échec envoi email OTP :", err);
    return NextResponse.json(
      { error: "Impossible d'envoyer le code pour le moment. Réessayez plus tard." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
