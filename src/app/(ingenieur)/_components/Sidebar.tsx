"use client";

import {
  SpaceSidebar,
  type NavSection,
} from "@/app/_components/shared/SpaceSidebar";

const BASE = "/espace-ingenieur";

const sections: NavSection[] = [
  {
    title: "Mon espace",
    items: [
      { href: BASE, label: "Tableau de bord" },
      { href: `${BASE}/agenda`, label: "Mon agenda" },
      { href: `${BASE}/profil`, label: "Mon profil" },
    ],
  },
  {
    title: "Clients & prospects",
    items: [
      { href: `${BASE}/prospects`, label: "Mes prospects" },
      { href: `${BASE}/clients`, label: "Mes clients" },
      { href: `${BASE}/client-new`, label: "Nouveau client" },
    ],
  },
  {
    title: "Dossiers & production",
    items: [
      { href: `${BASE}/dossiers`, label: "Pipeline des dossiers" },
      { href: `${BASE}/collectes`, label: "Collectes de documents" },
      { href: `${BASE}/entretiens`, label: "Entretiens visio" },
      { href: "/visio", label: "Nouvelle visio" },
    ],
  },
  {
    title: "Outils",
    items: [
      { href: `${BASE}/marketplace`, label: "Catalogue des packs" },
      { href: `${BASE}/integrations`, label: "Intégrations & clés API" },
    ],
  },
];

export function Sidebar() {
  return <SpaceSidebar spaceTitle="Espace Ingénieur" sections={sections} />;
}
