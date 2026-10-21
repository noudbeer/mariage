import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import ColorCloud from "@/components/theme/ColorCloud";

export default async function ThemePage() {
  const session = await getSession();
  if (!session.householdId) {
    redirect("/connexion");
  }

  return (
    <main className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden">
      <ColorCloud />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-[var(--color-bg)]/70 px-6 py-4 backdrop-blur-[2px] sm:backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-primary)]">
            Votre tenue pour le jour J
          </p>
          <h1 className="max-w-xl font-script text-4xl sm:text-6xl">
            Une journée en couleur pour ce jour si précieux
          </h1>
        </div>
      </div>
    </main>
  );
}
