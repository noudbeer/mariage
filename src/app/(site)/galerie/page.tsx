import { config } from "@/lib/config";
import { getRecentImmichAssets } from "@/lib/immich";
import ScrollReveal from "@/components/hero/ScrollReveal";
import PhotoGrid from "@/components/gallery/PhotoGrid";

export const dynamic = "force-dynamic";

const RECENT_COUNT = 30;

export default async function GaleriePage() {
  const weddingDate = config.weddingDate ? new Date(config.weddingDate) : null;
  const isPastWedding = weddingDate ? new Date() >= weddingDate : false;
  const recentAssets =
    isPastWedding && config.immichShareUrl ? await getRecentImmichAssets(RECENT_COUNT) : [];

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center px-6 py-16 text-center">
      <ScrollReveal className="flex w-full flex-col items-center">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold">Les photos du mariage</h1>

          {!isPastWedding && (
            <p className="mt-4 text-[var(--color-text-muted)]">
              Cette page s&apos;ouvrira automatiquement après le mariage, une fois les
              photos disponibles. Revenez après la fête !
            </p>
          )}

          {isPastWedding && !config.immichShareUrl && (
            <p className="mt-4 text-[var(--color-text-muted)]">
              Les photos arrivent bientôt, merci de votre patience.
            </p>
          )}
        </div>

        {isPastWedding && config.immichShareUrl && (
          <div className="mt-6 flex w-full flex-col items-center gap-6">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={config.immichShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[var(--color-primary)] px-8 py-3 font-medium text-white"
              >
                Voir toutes les photos
              </a>
              <a
                href={config.immichShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[var(--color-primary)] px-8 py-3 font-medium text-[var(--color-primary)]"
              >
                Ajouter mes photos
              </a>
            </div>

            {recentAssets.length > 0 && <PhotoGrid assets={recentAssets} />}
          </div>
        )}
      </ScrollReveal>
    </main>
  );
}
