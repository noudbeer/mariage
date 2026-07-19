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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90, // 90 jours
    },
  });
}
