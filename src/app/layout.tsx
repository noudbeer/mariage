import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Police manuscrite pour le prénom des mariés (page de connexion, menu).
const alexBrush = localFont({
  src: "../fonts/AlexBrush-Regular.ttf",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tiffany & Simon — Mariage",
  description: "Programme, confirmation de présence et informations pratiques.",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "T&S Mariage",
  },
};

export const viewport: Viewport = {
  themeColor: "#e08a72",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${alexBrush.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
