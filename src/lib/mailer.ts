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

export async function sendOtpEmail(params: { to: string; code: string }): Promise<void> {
  const { to, code } = params;

  await getTransporter().sendMail({
    from: config.smtpFrom,
    to,
    subject: "Votre code de connexion — Mariage Tiffany & Simon",
    text: `Votre code de connexion est : ${code}\n\nCe code est valable 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
  });
}
