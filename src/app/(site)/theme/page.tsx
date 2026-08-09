const SWATCHES = [
  { name: "--color-primary", label: "Primaire" },
  { name: "--color-primary-soft", label: "Primaire (doux)" },
  { name: "--color-accent", label: "Accent" },
  { name: "--color-bg", label: "Fond" },
  { name: "--color-surface", label: "Surface" },
  { name: "--color-text", label: "Texte" },
  { name: "--color-text-muted", label: "Texte atténué" },
];

export default function ThemePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Palette du site</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Palette « full color » (fuchsia + terracotta). Pour l&apos;ajuster, il suffit
        d&apos;éditer les variables dans <code>src/app/globals.css</code> — aucun composant à
        modifier.
      </p>

      <section className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {SWATCHES.map((swatch) => (
          <div key={swatch.name} className="flex flex-col gap-2">
            <div
              className="h-20 rounded-lg border border-black/10"
              style={{ background: `var(${swatch.name})` }}
            />
            <p className="text-xs text-[var(--color-text-muted)]">{swatch.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-14 flex flex-col gap-6">
        <h2 className="text-lg font-medium">Aperçu sur des composants réels</h2>

        <div className="flex flex-wrap items-center gap-4">
          <button className="rounded-md bg-[var(--color-primary)] px-4 py-2 font-medium text-white">
            Bouton principal
          </button>
          <button className="rounded-md border border-[var(--color-primary)] px-4 py-2 font-medium text-[var(--color-primary)]">
            Bouton secondaire
          </button>
          <a href="#" className="text-[var(--color-primary)] underline">
            Un lien
          </a>
        </div>

        <div className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-6">
          <p className="text-sm text-[var(--color-primary)]">Vin d&apos;honneur</p>
          <h3 className="text-xl font-semibold">Titre de section</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Texte de paragraphe d&apos;exemple pour visualiser le contraste et la lisibilité
            de la palette sur une carte.
          </p>
        </div>
      </section>
    </main>
  );
}
