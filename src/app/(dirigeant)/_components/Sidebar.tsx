"use client";

import {
  SpaceSidebar,
  type NavSection,
} from "@/app/_components/shared/SpaceSidebar";

const BASE = "/espace-dirigeant";

const sections: NavSection[] = [
  {
    title: "Cockpit dirigeant",
    items: [
      { href: BASE, label: "Accueil cabinet" },
      { href: `${BASE}/finance`, label: "Finance du cabinet", num: "01" },
      { href: `${BASE}/ingenieurs`, label: "Ingénieurs", num: "02" },
      { href: `${BASE}/performance`, label: "Performance", num: "03" },
    ],
  },
  {
    title: "Développement",
    items: [
      { href: `${BASE}/assets`, label: "Encours & assets" },
      { href: `${BASE}/partenaires`, label: "Partenaires & apporteurs" },
    ],
  },
  {
    title: "Administration",
    items: [{ href: `${BASE}/parametrages`, label: "Paramétrages du cabinet" }],
  },
];

export function Sidebar() {
  return <SpaceSidebar spaceTitle="Espace Dirigeant" sections={sections} />;
}
