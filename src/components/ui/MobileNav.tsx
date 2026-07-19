"use client";

import { useState } from "react";

export default function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div className="hidden items-center gap-5 md:flex">{children}</div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center text-[var(--color-primary)] md:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 flex w-56 flex-col items-stretch gap-1 rounded-lg border border-[var(--color-primary-soft)] bg-[var(--color-bg)] p-2 text-lg shadow-lg [&_a]:block [&_a]:w-full [&_a]:rounded-md [&_a]:px-3 [&_a]:py-2.5 [&_a]:transition-colors [&_a]:hover:bg-[var(--color-primary-soft)]/30 [&_button]:py-2.5 md:hidden">
          {children}
        </div>
      )}
    </div>
  );
}
