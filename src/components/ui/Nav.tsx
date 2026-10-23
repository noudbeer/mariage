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

  const links = isGuest ? (
    <>
      <a href="/programme" className="font-medium transition-colors hover:text-[var(--color-primary)]">
        Programme
      </a>
      <a href="/reservation-gite" className="font-medium transition-colors hover:text-[var(--color-primary)]">
        Gîte
      </a>
      <a href="/rsvp" className="font-medium transition-colors hover:text-[var(--color-primary)]">
        Ma présence
      </a>
      <a href="/theme" className="font-medium transition-colors hover:text-[var(--color-primary)]">
        Thème
      </a>
      <a href="/temoins" className="font-medium transition-colors hover:text-[var(--color-primary)]">
        Témoins
      </a>
      <a href="/galerie" className="font-medium transition-colors hover:text-[var(--color-primary)]">
        Photos
      </a>
      {isAdmin && (
        <a href="/admin" className="font-medium transition-colors hover:text-[var(--color-primary)]">
          Suivi RSVP
        </a>
      )}
    </>
  ) : (
    <a href="/contact" className="font-medium transition-colors hover:text-[var(--color-primary)]">
      Contact
    </a>
  );

  const actions = isGuest ? (
    <LogoutButton />
  ) : (
    <a
      href="/connexion"
      className="rounded-full bg-[var(--color-primary)] px-4 py-1.5 font-medium text-white"
    >
      Connexion
    </a>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[var(--color-bg)]/90 backdrop-blur">
      <nav className="mx-auto grid max-w-5xl grid-cols-3 items-center px-6 py-3 text-sm">
        <a href={isGuest ? "/bienvenue" : "/"} className="justify-self-start font-script text-xl">
          Tiffany &amp; Simon
        </a>

        <MobileNav links={links} actions={actions} />
      </nav>
    </header>
  );
}
