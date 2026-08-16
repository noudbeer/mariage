"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const PHOTOS = [
  { file: "20250726_224139351.JPG", width: 3088, height: 2316 },
  { file: "DSCF0846.JPG", width: 6240, height: 4160 },
  { file: "PXL_20250330_174814639.PORTRAIT.jpg", width: 2736, height: 3648 },
  { file: "PXL_20250705_093521200.PORTRAIT.jpg", width: 2268, height: 4032 },
  { file: "PXL_20260614_074513904.jpg", width: 2160, height: 3840 },
  { file: "PXL_20260614_074517911.jpg", width: 2160, height: 3840 },
  { file: "PXL_20260622_142921345.jpg", width: 4590, height: 8160 },
  { file: "PXL_20260622_142928528.jpg", width: 4590, height: 8160 },
  { file: "PXL_20260622_143046274.jpg", width: 4590, height: 8160 },
  { file: "PXL_20260622_144956960.jpg", width: 3840, height: 2160 },
  { file: "PXL_20260622_144959613.jpg", width: 3840, height: 2160 },
  { file: "PXL_20260623_080258173.jpg", width: 3840, height: 2160 },
  { file: "PXL_20260623_112827176.PORTRAIT.jpg", width: 8160, height: 4590 },
  { file: "PXL_20260623_112910633.PORTRAIT.jpg", width: 8160, height: 4590 },
  { file: "PXL_20260623_113052762.PORTRAIT.jpg", width: 8160, height: 4590 },
  { file: "PXL_20260623_113135624.PORTRAIT.jpg", width: 4590, height: 8160 },
  { file: "Screenshot_20260622-193234~2.jpg", width: 1080, height: 1919 },
] as const;

export default function CouplePhotos() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + PHOTOS.length) % PHOTOS.length)),
    [],
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % PHOTOS.length)),
    [],
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

  const current = openIndex !== null ? PHOTOS[openIndex] : null;

  return (
    <>
      <div className="columns-2 gap-2 sm:columns-3 md:columns-4">
        {PHOTOS.map((photo, i) => (
          <button
            key={photo.file}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label="Ouvrir la photo"
            className="mb-2 block w-full overflow-hidden rounded-lg break-inside-avoid"
          >
            <Image
              src={`/photos/${photo.file}`}
              alt=""
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              priority={i === 0}
              className="h-auto w-full object-cover transition duration-300 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {current &&
        createPortal(
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

            <div onClick={(e) => e.stopPropagation()}>
              <Image
                src={`/photos/${current.file}`}
                alt=""
                width={current.width}
                height={current.height}
                className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
