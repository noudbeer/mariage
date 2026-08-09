import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { config as appConfig } from "@/lib/config";
import { getHouseholdById } from "@/lib/guests";
import type { SessionData } from "@/lib/session";

const GUEST_PROTECTED_PREFIXES = ["/bienvenue", "/programme", "/rsvp", "/galerie", "/temoins"];
const ADMIN_PREFIXES = ["/theme", "/admin"];

function isAdminSession(session: SessionData): boolean {
  if (!session.householdId || !session.memberId) return false;
  const member = getHouseholdById(session.householdId)?.membres.find(
    (m) => m.id === session.memberId,
  );
  if (!member?.email) return false;
  return appConfig.adminEmails.includes(member.email.trim().toLowerCase());
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isGuestProtected = GUEST_PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (!isAdminRoute && !isGuestProtected) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, {
    cookieName: "mariage_session",
    password: appConfig.sessionSecret,
  });

  if (!session.householdId) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }

  if (isAdminRoute && !isAdminSession(session)) {
    return NextResponse.redirect(new URL("/bienvenue", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/bienvenue/:path*",
    "/programme/:path*",
    "/rsvp/:path*",
    "/galerie/:path*",
    "/temoins/:path*",
    "/theme/:path*",
    "/admin/:path*",
  ],
};
