import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { isAdminSession } from "@/lib/admin";
import { config } from "@/lib/config";
import { getHouseholdsToRemind } from "@/lib/relance";
import { sendReminderEmail } from "@/lib/mailer";

const bodySchema = z.object({
  householdIds: z.array(z.string().min(1)).min(1),
  message: z.string().trim().min(1).max(3000),
});

function formatDeadline(): string | null {
  if (!config.rsvpDeadline) return null;
  return new Date(config.rsvpDeadline).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  });
}

export async function POST(request: NextRequest) {
  // /api n'est pas couvert par src/proxy.ts : la vérification admin se fait ici.
  const session = await getSession();
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const selected = new Set(parsed.data.householdIds);
  // Recalcul côté serveur : un foyer qui a répondu entre-temps n'est pas relancé.
  const targets = getHouseholdsToRemind().filter(
    (h) => selected.has(h.household.id) && h.recipients.length > 0,
  );

  const rsvpLink = `${config.siteUrl || request.nextUrl.origin}/connexion`;
  const deadline = formatDeadline();
  const sent: string[] = [];
  const failed: string[] = [];

  // Envoi séquentiel pour ne pas saturer le serveur SMTP.
  for (const target of targets) {
    try {
      await sendReminderEmail({
        to: target.recipients.map((m) => m.email!),
        greetingNames: target.recipients.map((m) => m.prenom),
        pendingNames: target.pendingMembers.map((p) => p.member.prenom),
        message: parsed.data.message,
        rsvpLink,
        deadline,
      });
      sent.push(target.household.id);
    } catch (err) {
      console.error(`Échec envoi relance au foyer ${target.household.id} :`, err);
      failed.push(target.household.id);
    }
  }

  return NextResponse.json({ sent, failed });
}
