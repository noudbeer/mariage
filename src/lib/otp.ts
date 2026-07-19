import { randomInt } from "node:crypto";

interface OtpEntry {
  code: string;
  householdId: string;
  memberId: string;
  expiresAt: number;
  attempts: number;
}

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

// Codes en mémoire par email : comme le rate limiting, ne fonctionne correctement
// qu'avec une seule instance du conteneur (voir docker-compose.yml, replicas: 1).
const otps = new Map<string, OtpEntry>();

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

export function createOtp(email: string, householdId: string, memberId: string): string {
  const code = String(randomInt(100000, 1000000));
  otps.set(normalize(email), {
    code,
    householdId,
    memberId,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
  return code;
}

export function verifyOtp(
  email: string,
  code: string,
): { householdId: string; memberId: string } | null {
  const key = normalize(email);
  const entry = otps.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    otps.delete(key);
    return null;
  }

  entry.attempts += 1;
  if (entry.attempts > MAX_VERIFY_ATTEMPTS) {
    otps.delete(key);
    return null;
  }

  if (entry.code !== code) {
    return null;
  }

  otps.delete(key);
  return { householdId: entry.householdId, memberId: entry.memberId };
}
