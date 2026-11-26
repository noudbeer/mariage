import { getHouseholdById } from "@/lib/guests";
import { getAllGiteRequests } from "@/lib/gite";
import { PRIX_NUIT_PAR_PERSONNE } from "@/lib/giteTarif";

export const dynamic = "force-dynamic";

interface Line {
  name: string;
  nuits: number;
}

export default function AdminGitePage() {
  const all = getAllGiteRequests();

  // Un foyer peut renvoyer une demande : seule la plus récente fait foi (all est trié du plus récent au plus ancien).
  const seen = new Set<string>();
  const latest = all.filter((r) => {
    if (seen.has(r.householdId)) return false;
    seen.add(r.householdId);
    return true;
  });

  const entries = latest.map((r) => {
    const household = getHouseholdById(r.householdId);
    const nameOf = (id: string) => {
      const m = household?.membres.find((x) => x.id === id);
      return m ? `${m.prenom} ${m.nom}` : id;
    };
    const lines: Line[] = r.memberIds.map((id) => ({
      name: nameOf(id),
      // anciennes demandes : une seule durée pour tout le monde
      nuits: r.nuitsParMembre?.[id] ?? r.nombreNuits,
    }));
    return {
      request: r,
      lines,
      submittedBy: nameOf(r.submittedByMemberId),
      nuitees: lines.reduce((sum, l) => sum + l.nuits, 0),
    };
  });

  const totalPersonnes = entries.reduce((sum, e) => sum + e.lines.length, 0);
  const totalNuitees = entries.reduce((sum, e) => sum + e.nuitees, 0);
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    });

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <a href="/admin" className="text-sm underline">
        ← Récapitulatif
      </a>
      <h1 className="mt-4 text-2xl font-semibold">Demandes de gîte</h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Simples demandes, à valider avec chaque foyer. Seule la dernière demande de chaque foyer est
        affichée.
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Foyers", entries.length],
          ["Personnes", totalPersonnes],
          ["Nuitées", totalNuitees],
          ["Estimation", `${totalNuitees * PRIX_NUIT_PAR_PERSONNE} €`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-black/10 px-4 py-3">
            <dt className="text-xs text-[var(--color-text-muted)]">{label}</dt>
            <dd className="mt-1 text-xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      {entries.length === 0 ? (
        <p className="mt-8">Aucune demande pour le moment.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {entries.map(({ request, lines, submittedBy, nuitees }) => (
            <li
              key={request.id}
              className="rounded-lg border border-black/10 px-4 py-3 text-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">{request.householdId}</span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {formatDate(request.createdAt)} · par {submittedBy}
                </span>
              </div>
              <ul className="mt-2 space-y-0.5">
                {lines.map((l) => (
                  <li key={l.name} className="flex justify-between gap-4">
                    <span>{l.name}</span>
                    <span>
                      {l.nuits} nuit{l.nuits > 1 ? "s" : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-right text-xs text-[var(--color-text-muted)]">
                {nuitees} nuitée{nuitees > 1 ? "s" : ""} · {nuitees * PRIX_NUIT_PAR_PERSONNE} €
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
