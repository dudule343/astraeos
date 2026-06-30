import type { Metadata } from "next";
import { Epilogue, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Polices secondaires des maquettes : le serif « luxe » (titres Dirigeant +
// parcours) et le mono « data » (chiffres Éditeur). Elles étaient référencées
// dans le CSS mais jamais chargées (repli Georgia / monospace système, d'où la
// typo incohérente d'un espace à l'autre). Exposées en variables CSS comme
// Epilogue ; le CSS les consomme via var(--font-cormorant) / var(--font-jetbrains).
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Astraeos · Admin Éditeur",
  description: "SaaS d'études patrimoniales — espace administrateur éditeur",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${epilogue.variable} ${cormorant.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
