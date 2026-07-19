import type { NextRequest } from "next/server";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

// Compteur en mémoire par IP : ne fonctionne correctement qu'avec une seule instance
// du conteneur (voir docker-compose.yml, replicas: 1).
const attempts = new Map<string, number[]>();

export function checkRateLimit(ip: string, scope: string): boolean {
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  const allowed = recent.length < MAX_ATTEMPTS;
  recent.push(now);
  attempts.set(key, recent);
  return allowed;
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
