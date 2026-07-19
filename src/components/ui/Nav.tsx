import { getSession } from "@/lib/session";
import { getHouseholdById } from "@/lib/guests";
import { config } from "@/lib/config";
import LogoutButton from "./LogoutButton";

export default async function Nav() {
  const session = await getSession();
  const isGuest = Boolean(session.householdId);

  let isAdmin = false;
  if (session.householdId && session.memberId) {
    const household = getHouseholdById(session.householdId);
    const member = household?.membres.find((m) => m.id === session.memberId);
    if (member?.email) {
      isAdmin = config.adminEmails.includes(member.email.trim().toLowerCase());
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[var(--color-bg)]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3 text-sm">
        <a href={isGuest ? "/bienvenue" : "/"} className="font-script text-xl">
          Tiffany &amp; Simon
        </a>

        <div className="flex items-center gap-5">
          {isGuest ? (
            <>
              <a href="/programme" className="hover:underline">
                Programme
              </a>
              <a href="/rsvp" className="hover:underline">
                Ma présence
              </a>
              <a href="/galerie" className="hover:underline">
                Photos
              </a>
              <a href="/temoins" className="hover:underline">
                Témoins
              </a>
              {isAdmin && (
                <>
                  <a href="/admin" className="hover:underline">
                    Suivi RSVP
                  </a>
                  <a href="/theme" className="hover:underline">
                    Thème
                  </a>
                </>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <a href="/contact" className="hover:underline">
                Contact
              </a>
              <a
                href="/connexion"
                className="rounded-full bg-[var(--color-primary)] px-4 py-1.5 font-medium text-white"
              >
                Connexion
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
