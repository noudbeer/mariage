import nodemailer from "nodemailer";
import { config } from "./config";

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
