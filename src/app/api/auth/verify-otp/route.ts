import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { verifyOtp } from "@/lib/otp";
import { recordLoginAttempt } from "@/lib/db";

const GENERIC_ERROR = "Code invalide ou expiré.";

const verifyOtpSchema = z.object({
  email: z.string().min(1),
  code: z.string().length(6),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (!checkRateLimit(ip, "otp-verify")) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { email, code } = parsed.data;
  const result = verifyOtp(email, code);

  if (!result) {
    recordLoginAttempt(ip, email, false);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const session = await getSession();
  session.householdId = result.householdId;
  session.memberId = result.memberId;
  await session.save();

  recordLoginAttempt(ip, email, true);
  return NextResponse.json({ ok: true });
}
