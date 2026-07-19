import { loadTemoins } from "@/lib/temoins";

export default function TemoinsPage() {
  const temoins = loadTemoins();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Les témoins</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Une question sur le mariage, un souci pour vous connecter ? N&apos;hésitez pas à
        contacter l&apos;un·e de nos témoins.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {temoins.map((temoin) => (
          <div
            key={temoin.email}
            className="rounded-lg border border-black/10 bg-[var(--color-surface)] p-5"
          >
            <p className="font-medium">
              {temoin.prenom} {temoin.nom}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">{temoin.role}</p>
            <div className="mt-3 flex flex-col gap-1 text-sm">
              <a href={`tel:${temoin.telephone.replace(/\s/g, "")}`} className="underline">
                {temoin.telephone}
              </a>
              <a href={`mailto:${temoin.email}`} className="underline">
                {temoin.email}
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
