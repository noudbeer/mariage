"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

  // Balayage horizontal (mobile) : gauche → suivante, droite → précédente.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || assets.length < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) next();
    else prev();
  }

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
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-black/5 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
          >
            {asset.type === "IMAGE" ? (
              // URL Immich dynamique et authentifiée (clé en query string) : next/image
              // n'apporte rien ici sans configuration de remotePatterns dédiée.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset.thumbnailUrl}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-90"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--color-primary-soft)]/40 text-3xl transition duration-300 group-hover:brightness-90">
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
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fermer"
            className="absolute z-10 cursor-pointer p-2 right-4 top-4 text-3xl text-white/90 hover:text-white"
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
                className="absolute z-10 cursor-pointer p-2 left-2 text-4xl text-white/90 hover:text-white sm:left-6"
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
                className="absolute z-10 cursor-pointer p-2 right-2 text-4xl text-white/90 hover:text-white sm:right-6"
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
