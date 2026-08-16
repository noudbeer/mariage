import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Autorise l'accès au serveur de dev depuis le réseau local (test sur téléphone),
  // sinon Next bloque les ressources dev (HMR, chunks JS) pour les requêtes cross-origin.
  allowedDevOrigins: ["192.168.1.153"],
};

export default nextConfig;
