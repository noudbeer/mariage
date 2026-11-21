import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { config } from "./config";

export interface SessionData {
  householdId?: string;
  memberId?: string;
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, {
    cookieName: "mariage_session",
    password: config.sessionSecret,
    cookieOptions: {
      httpOnly: true,
      // Secure en production, sauf SESSION_COOKIE_SECURE=false : utile pour tester le
      // conteneur local depuis un autre appareil en http://192.168.x.x (sinon le navigateur
      // jette le cookie et la connexion échoue). Ne jamais le désactiver en prod (https).
      secure:
        process.env.SESSION_COOKIE_SECURE !== undefined
          ? process.env.SESSION_COOKIE_SECURE === "true"
          : process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90, // 90 jours
    },
  });
}
