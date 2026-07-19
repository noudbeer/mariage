import { readFileSync, statSync } from "node:fs";
import { z } from "zod";
import { config } from "./config";

const temoinSchema = z.object({
  prenom: z.string().min(1),
  nom: z.string().min(1),
  role: z.string().min(1),
  telephone: z.string().min(1),
  email: z.email(),
});

const temoinsFileSchema = z.object({
  temoins: z.array(temoinSchema),
});

export type Temoin = z.infer<typeof temoinSchema>;

let cache: { mtimeMs: number; data: Temoin[] } | null = null;

export function loadTemoins(): Temoin[] {
  const path = config.temoinsJsonPath;
  const stat = statSync(path);

  if (cache && cache.mtimeMs === stat.mtimeMs) {
    return cache.data;
  }

  const raw = readFileSync(path, "utf-8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`data/temoins.json n'est pas un JSON valide : ${(err as Error).message}`);
  }

  const result = temoinsFileSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`data/temoins.json invalide :\n${result.error.message}`);
  }

  cache = { mtimeMs: stat.mtimeMs, data: result.data.temoins };
  return result.data.temoins;
}
