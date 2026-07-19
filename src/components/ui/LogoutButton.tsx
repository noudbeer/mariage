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
      className="text-sm text-[var(--color-text-muted)] underline"
    >
      Se déconnecter
    </button>
  );
}
