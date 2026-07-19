import { getSession } from "@/lib/session";
import { getHouseholdById } from "@/lib/guests";
import { config } from "@/lib/config";
import LogoutButton from "./LogoutButton";
import MobileNav from "./MobileNav";

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

        <MobileNav>
          {isGuest ? (
            <>
              <a href="/programme" className="font-medium transition-colors hover:text-[var(--color-primary)]">
                Programme
              </a>
              <a href="/rsvp" className="font-medium transition-colors hover:text-[var(--color-primary)]">
                Ma présence
              </a>
              <a href="/galerie" className="font-medium transition-colors hover:text-[var(--color-primary)]">
                Photos
              </a>
              <a href="/temoins" className="font-medium transition-colors hover:text-[var(--color-primary)]">
                Témoins
              </a>
              {isAdmin && (
                <>
                  <a href="/admin" className="font-medium transition-colors hover:text-[var(--color-primary)]">
                    Suivi RSVP
                  </a>
                  <a href="/theme" className="font-medium transition-colors hover:text-[var(--color-primary)]">
                    Thème
                  </a>
                </>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <a href="/contact" className="font-medium transition-colors hover:text-[var(--color-primary)]">
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
        </MobileNav>
      </nav>
    </header>
  );
}
