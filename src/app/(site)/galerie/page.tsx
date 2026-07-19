import { config } from "@/lib/config";
import ScrollReveal from "@/components/hero/ScrollReveal";

export const dynamic = "force-dynamic";

export default function GaleriePage() {
  const weddingDate = config.weddingDate ? new Date(config.weddingDate) : null;
  const isPastWedding = weddingDate ? new Date() >= weddingDate : false;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <ScrollReveal>
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

        {isPastWedding && config.immichShareUrl && (
          <div className="mt-6 flex flex-col items-center gap-6">
            <a
              href={config.immichShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[var(--color-primary)] px-8 py-3 font-medium text-white"
            >
              Voir toutes les photos
            </a>

            {/* Repli garanti ci-dessus : Immich peut bloquer l'affichage en iframe
                (X-Frame-Options / CSP) selon la configuration du serveur. */}
            <iframe
              src={config.immichShareUrl}
              title="Album photo du mariage"
              className="h-[70vh] w-full rounded-lg border border-black/10"
              loading="lazy"
            />
          </div>
        )}
      </ScrollReveal>
    </main>
  );
}
