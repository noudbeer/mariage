import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { config as appConfig } from "@/lib/config";
import type { SessionData } from "@/lib/session";

const GUEST_PROTECTED_PREFIXES = ["/bienvenue", "/programme", "/rsvp", "/galerie", "/temoins"];
const BASIC_AUTH_PREFIXES = ["/theme", "/admin"];

function unauthorizedBasicAuth() {
  return new NextResponse("Authentification requise.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Espace interne"' },
  });
}

function hasValidBasicAuth(request: NextRequest): boolean {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  const decoded = atob(header.slice("Basic ".length));
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;

  const user = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);
  return user === appConfig.adminUser && password === appConfig.adminPassword;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (BASIC_AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return hasValidBasicAuth(request) ? NextResponse.next() : unauthorizedBasicAuth();
  }

  const isGuestProtected = GUEST_PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (!isGuestProtected) {
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
