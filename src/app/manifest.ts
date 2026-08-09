import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tiffany & Simon — Mariage",
    short_name: "T&S Mariage",
    description: "Programme, confirmation de présence et informations pratiques.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf5",
    theme_color: "#d6336c",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
