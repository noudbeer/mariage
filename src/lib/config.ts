function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

// Les champs obligatoires sont lus paresseusement (getters), pas au chargement du module :
// `next build` évalue les modules sans charger .env.local d'exécution, une lecture "eager"
// ferait échouer le build. L'erreur ne doit survenir qu'à l'usage réel (au runtime).
export const config = {
  get sessionSecret() {
    return requireEnv("SESSION_SECRET");
  },
  get weddingDate() {
    return process.env.WEDDING_DATE ?? "";
  },
  get immichShareUrl() {
    return process.env.IMMICH_SHARE_URL ?? "";
  },
  get guestsJsonPath() {
    return process.env.GUESTS_JSON_PATH ?? "./data/guests.json";
  },
  get temoinsJsonPath() {
    return process.env.TEMOINS_JSON_PATH ?? "./data/temoins.json";
  },
  get rsvpDbPath() {
    return process.env.RSVP_DB_PATH ?? "./data/rsvp.db";
  },
  get rsvpDeadline() {
    return process.env.RSVP_DEADLINE ?? "";
  },
  get smtpHost() {
    return requireEnv("SMTP_HOST");
  },
  get smtpPort() {
    return Number(process.env.SMTP_PORT ?? "587");
  },
  get smtpSecure() {
    return process.env.SMTP_SECURE === "true";
  },
  get smtpUser() {
    return requireEnv("SMTP_USER");
  },
  get smtpPassword() {
    return requireEnv("SMTP_PASSWORD");
  },
  get smtpFrom() {
    return process.env.SMTP_FROM || this.smtpUser;
  },
  get contactEmail() {
    return process.env.CONTACT_EMAIL ?? "simon@bernoud.fr";
  },
  // Emails des mariés : une fois connectés (email + code reçu par mail) avec l'un de ces
  // emails, ils ont accès à /admin et /theme (voir src/proxy.ts).
  get adminEmails() {
    return (process.env.ADMIN_EMAILS ?? "simon.bernoud@ikmail.com,tiffanyperrin74@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  },
};
