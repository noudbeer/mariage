import { config } from "./config";

export interface ImmichRecentAsset {
  id: string;
  type: "IMAGE" | "VIDEO";
  thumbnailUrl: string;
  fullUrl: string;
}

interface ImmichAsset {
  id: string;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "OTHER";
}

/**
 * Paramètre d'authentification du lien de partage, à ajouter en query string à chaque appel.
 * - `IMMICH_SHARE_KEY` renseignée → `key=...` (prioritaire) ;
 * - sinon déduit de `IMMICH_SHARE_URL` : `/s/<slug>` → `slug=...`, `/share/<key>` → `key=...`.
 */
function shareAuth(shareUrl: string, shareKey: string): string | null {
  if (shareKey) return `key=${encodeURIComponent(shareKey)}`;
  const match = new URL(shareUrl).pathname.match(/^\/(s|share)\/([^/]+)/);
  if (!match) return null;
  const [, kind, value] = match;
  return `${kind === "s" ? "slug" : "key"}=${encodeURIComponent(value)}`;
}

async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * Récupère les `limit` photos/vidéos les plus récentes de l'album partagé, via l'API
 * publique d'Immich (authentifiée par le lien de partage). Depuis Immich v3, l'album ne
 * renvoie plus la liste de ses assets : on passe par `POST /search/metadata` filtré sur
 * l'album. Renvoie un tableau vide en cas d'erreur ou de configuration manquante — la page
 * doit rester utilisable sans ça (repli sur le lien "Voir toutes les photos").
 */
export async function getRecentImmichAssets(limit: number): Promise<ImmichRecentAsset[]> {
  const { immichShareUrl, immichShareKey } = config;
  if (!immichShareUrl) return [];

  try {
    const origin = new URL(immichShareUrl).origin;
    const auth = shareAuth(immichShareUrl, immichShareKey);
    if (!auth) return [];

    const link = (await fetchJson(`${origin}/api/shared-links/me?${auth}`)) as {
      album?: { id?: string };
    } | null;
    const albumId = link?.album?.id;
    if (!albumId) return [];

    const result = (await fetchJson(`${origin}/api/search/metadata?${auth}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumIds: [albumId], size: limit, order: "desc" }),
    })) as { assets?: { items?: ImmichAsset[] } } | null;
    const assets = result?.assets?.items ?? [];

    return assets
      .filter((a): a is ImmichAsset & { type: "IMAGE" | "VIDEO" } =>
        a.type === "IMAGE" || a.type === "VIDEO",
      )
      .map((a) => ({
        id: a.id,
        type: a.type,
        thumbnailUrl: `${origin}/api/assets/${a.id}/thumbnail?${auth}&size=preview`,
        fullUrl:
          a.type === "VIDEO"
            ? `${origin}/api/assets/${a.id}/video/playback?${auth}`
            : `${origin}/api/assets/${a.id}/original?${auth}`,
      }));
  } catch {
    return [];
  }
}
