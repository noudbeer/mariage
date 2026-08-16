"use client";

import { useCallback, useEffect, useState } from "react";
import type { ImmichRecentAsset } from "@/lib/immich";

interface Props {
  assets: ImmichRecentAsset[];
}

export default function PhotoGrid({ assets }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + assets.length) % assets.length)),
    [assets.length],
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % assets.length)),
    [assets.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, close, prev, next]);

  const current = openIndex !== null ? assets[openIndex] : null;

  return (
    <>
      <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
        {assets.map((asset, i) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={asset.type === "VIDEO" ? "Ouvrir la vidéo" : "Ouvrir la photo"}
            className="relative aspect-square overflow-hidden rounded-lg bg-black/5"
          >
            {asset.type === "IMAGE" ? (
              // URL Immich dynamique et authentifiée (clé en query string) : next/image
              // n'apporte rien ici sans configuration de remotePatterns dédiée.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset.thumbnailUrl}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--color-primary-soft)]/40 text-3xl">
                🎬
              </div>
            )}
          </button>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fermer"
            className="absolute right-4 top-4 text-3xl text-white/90 hover:text-white"
          >
            ×
          </button>

          {assets.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Photo précédente"
                className="absolute left-2 text-4xl text-white/90 hover:text-white sm:left-6"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Photo suivante"
                className="absolute right-2 text-4xl text-white/90 hover:text-white sm:right-6"
              >
                ›
              </button>
            </>
          )}

          <div className="max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
            {current.type === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.fullUrl}
                alt=""
                className="max-h-[85vh] max-w-full rounded-lg object-contain"
              />
            ) : (
              <video
                src={current.fullUrl}
                controls
                autoPlay
                className="max-h-[85vh] max-w-full rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
