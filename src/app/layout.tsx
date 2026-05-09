import type { Metadata } from "next";
import { Epilogue } from "next/font/google";
import "./globals.css";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Astraeos · Admin Éditeur",
  description: "SaaS d'études patrimoniales — espace administrateur éditeur",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={epilogue.variable}>
      <body>{children}</body>
    </html>
  );
}
