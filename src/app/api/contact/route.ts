import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendContactEmail } from "@/lib/mailer";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  message: z.string().min(1).max(2000),
  // Honeypot : champ caché côté formulaire, invisible pour un humain.
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (!checkRateLimit(ip, "contact")) {
    return NextResponse.json(
      { error: "Trop de messages envoyés. Réessayez dans quelques minutes." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }

  const { name, email, message, website } = parsed.data;

  if (website) {
    // Bot détecté par le honeypot : réponse générique, aucun email envoyé.
    return NextResponse.json({ ok: true });
  }

  try {
    await sendContactEmail({ name, email, message });
  } catch (err) {
    console.error("Échec envoi email de contact :", err);
    return NextResponse.json(
      { error: "Impossible d'envoyer le message pour le moment. Réessayez plus tard." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
