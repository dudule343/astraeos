import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";

import { DepotClient } from "./DepotClient";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["italic", "normal"],
});

export const metadata: Metadata = {
  title: "PRIVEOS · Dépôt de documents",
};

export default async function DepotPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <main className={cormorant.variable} style={{ minHeight: "100vh", background: "var(--ivory)" }}>
      <DepotClient token={token} />
    </main>
  );
}
