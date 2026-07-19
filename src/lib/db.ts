import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../../drizzle/schema";
import { config } from "./config";
import { loginAudit } from "../../drizzle/schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let instance: Db | null = null;

// Initialisation paresseuse : n'ouvre la base qu'au premier accès réel (pas au chargement
// du module), pour ne pas créer/migrer rsvp.db pendant `next build`.
export function getDb(): Db {
  if (instance) return instance;

  mkdirSync(dirname(config.rsvpDbPath), { recursive: true });
  const sqlite = new Database(config.rsvpDbPath);
  sqlite.pragma("journal_mode = WAL");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: "./drizzle/migrations" });

  instance = db;
  return db;
}

export function recordLoginAttempt(ip: string, emailTried: string, success: boolean): void {
  getDb()
    .insert(loginAudit)
    .values({
      ip,
      emailTried,
      success: success ? 1 : 0,
      createdAt: new Date().toISOString(),
    })
    .run();
}
