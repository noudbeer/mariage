import { loadTemoins, type Temoin } from "@/lib/temoins";

export const dynamic = "force-dynamic";

export default function TemoinsPage() {
  const temoins = loadTemoins();
  const temoinsOfficiels = temoins.filter((t) => t.role.toLowerCase().startsWith("témoin"));
  const honneur = temoins.filter((t) => !t.role.toLowerCase().startsWith("témoin"));

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Les témoins</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Une question sur le mariage, un souci pour vous connecter ? N&apos;hésitez pas à
        contacter l&apos;un·e de nos témoins.
      </p>

      <TemoinSection title="Les témoins" temoins={temoinsOfficiels} />
      <TemoinSection title="Demoiselle et garçon d'honneur" temoins={honneur} />
    </main>
  );
}

function TemoinSection({ title, temoins }: { title: string; temoins: Temoin[] }) {
  if (temoins.length === 0) return null;

  const deTiffany = temoins.filter((t) => t.role.includes("Tiffany"));
  const deSimon = temoins.filter((t) => t.role.includes("Simon"));

  return (
    <section className="mt-10">
      <h2 className="text-lg font-medium text-[var(--color-primary)]">{title}</h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <TemoinColumn label="Tiffany" temoins={deTiffany} />
        <TemoinColumn label="Simon" temoins={deSimon} />
      </div>
    </section>
  );
}

function TemoinColumn({ label, temoins }: { label: string; temoins: Temoin[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </h3>
      {temoins.map((temoin) => (
        <div
          key={`${temoin.prenom}-${temoin.nom}`}
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
  );
}
