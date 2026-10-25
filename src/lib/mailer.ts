import nodemailer from "nodemailer";
import { config } from "./config";
import { PRIX_NUIT_PAR_PERSONNE } from "./giteTarif";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: { user: config.smtpUser, pass: config.smtpPassword },
  });

  return transporter;
}

export async function sendContactEmail(params: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const { name, email, message } = params;

  await getTransporter().sendMail({
    from: config.smtpFrom,
    to: config.contactEmail,
    replyTo: email,
    subject: `[Site mariage] Message de ${name}`,
    text: `De : ${name} <${email}>\n\n${message}`,
  });
}

export async function sendGiteRequestEmail(params: {
  householdId: string;
  personnes: { nom: string; nuits: number }[];
}): Promise<void> {
  const { householdId, personnes } = params;
  const detail =
    personnes.map((p) => `  - ${p.nom} : ${p.nuits} nuit${p.nuits > 1 ? "s" : ""}`).join("\n") ||
    "  (aucune sélectionnée)";
  const totalNuitees = personnes.reduce((sum, p) => sum + p.nuits, 0);
  const totalEuros = totalNuitees * PRIX_NUIT_PAR_PERSONNE;

  await getTransporter().sendMail({
    from: config.smtpFrom,
    to: config.contactEmail,
    subject: `[Site mariage] Demande de gîte — foyer ${householdId}`,
    text: `Nouvelle demande de réservation du gîte :\n\nFoyer : ${householdId}\nPersonnes concernées :\n${detail}\nNombre de personnes : ${personnes.length}\nTotal nuitées : ${totalNuitees}\nEstimation : ${totalEuros} € (${PRIX_NUIT_PAR_PERSONNE} € par nuit et par personne, en espèces)\n\nCeci est une simple demande, à recontacter pour validation.`,
  });
}

export async function sendOtpEmail(params: {
  to: string;
  code: string;
  fillLink: string;
}): Promise<void> {
  const { to, code, fillLink } = params;

  await getTransporter().sendMail({
    from: config.smtpFrom,
    to,
    subject: "Votre code de connexion — Mariage Tiffany & Simon",
    text: `Votre code de connexion :\n\n${code}\n\nOu ouvrez ce lien depuis votre téléphone pour le remplir automatiquement sur le site : ${fillLink}\n\nCe code est valable 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
    html: `
      <p>Bonjour,</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:6px;text-align:center;color:#d6336c;margin:24px 0;">
        ${code}
      </p>
      <p style="text-align:center;">
        <a href="${fillLink}" style="display:inline-block;padding:12px 24px;background:#d6336c;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:bold;">
          Remplir le code automatiquement
        </a>
      </p>
      <p style="color:#8c6e74;font-size:13px;">
        Ce bouton ouvre le site et pré-remplit le code ci-dessus — il vous restera à confirmer
        la connexion. Ce code est valable 10 minutes et à usage unique. Si vous n'êtes pas à
        l'origine de cette demande, ignorez cet email.
      </p>
    `,
  });
}
