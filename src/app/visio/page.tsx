"use client";

import dynamic from "next/dynamic";

// Chargé sans SSR : l'identifiant de salle aléatoire n'est généré que côté
// navigateur — pas de mismatch d'hydratation, pas de setState dans un effect.
const VisioLobby = dynamic(() => import("./VisioLobby"), { ssr: false });

export default function VisioLobbyPage() {
  return <VisioLobby />;
}
