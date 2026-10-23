"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/connexion");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="cursor-pointer text-sm text-[var(--color-text-muted)] underline transition-colors hover:text-[var(--color-primary)]"
    >
      Se déconnecter
    </button>
  );
}
