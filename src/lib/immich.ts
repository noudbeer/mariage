import { config } from "./config";

export interface ImmichRecentAsset {
  id: string;
  type: "IMAGE" | "VIDEO";
  thumbnailUrl: string;
  fullUrl: string;
}

interface ImmichAsset {
  id: string;
  type: "IMAGE" | "VIDEO";
  fileCreatedAt?: string;
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * Récupère les `limit` photos/vidéos les plus récentes de l'album partagé, via l'API
 * publique d'Immich (authentifiée par la clé du lien de partage). Renvoie un tableau vide
 * en cas d'erreur ou de configuration manquante — la page doit rester utilisable sans ça
 * (repli sur le lien "Voir toutes les photos").
 */
export async function getRecentImmichAssets(limit: number): Promise<ImmichRecentAsset[]> {
  const { immichShareUrl, immichShareKey } = config;
  if (!immichShareUrl || !immichShareKey) return [];

  try {
    const origin = new URL(immichShareUrl).origin;
    const key = encodeURIComponent(immichShareKey);

    const link = (await fetchJson(`${origin}/api/shared-links/me?key=${key}`)) as {
      album?: { id?: string };
    } | null;
    const albumId = link?.album?.id;
    if (!albumId) return [];

    const album = (await fetchJson(`${origin}/api/albums/${albumId}?key=${key}`)) as {
      assets?: ImmichAsset[];
    } | null;
    const assets = album?.assets ?? [];

    return assets
      .slice()
      .sort((a, b) => (b.fileCreatedAt ?? "").localeCompare(a.fileCreatedAt ?? ""))
      .slice(0, limit)
      .map((a) => ({
        id: a.id,
        type: a.type,
        thumbnailUrl: `${origin}/api/assets/${a.id}/thumbnail?key=${key}&size=preview`,
        fullUrl:
          a.type === "VIDEO"
            ? `${origin}/api/assets/${a.id}/video/playback?key=${key}`
            : `${origin}/api/assets/${a.id}/original?key=${key}`,
      }));
  } catch {
    return [];
  }
}
