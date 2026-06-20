"use client";

import {
  SpaceSidebar,
  type NavSection,
} from "@/app/_components/shared/SpaceSidebar";

const BASE = "/espace-ingenieur";

const sections: NavSection[] = [
  {
    title: "Mon activité",
    items: [
      { href: BASE, label: "Mon tableau de bord" },
      { href: `${BASE}/agenda`, label: "Calendrier & RDV" },
      { href: `${BASE}/activite`, label: "Mon activité commerciale" },
    ],
  },
  {
    title: "Mes clients",
    items: [
      { href: `${BASE}/clients`, label: "Tous mes clients", badge: { text: "7" } },
      { href: `${BASE}/clients/exemple`, label: "Fiche client (exemple)" },
    ],
  },
  {
    title: "Parcours patrimonial",
    items: [
      { href: `${BASE}/prospects`, label: "Mes prospects", num: "01", badge: { text: "5" } },
      { href: `${BASE}/conformite`, label: "Conformité en cours", num: "02", badge: { text: "1" } },
      { href: `${BASE}/collectes`, label: "Collecte docs & infos", num: "03", badge: { text: "1" } },
      { href: `${BASE}/etudes`, label: "Mes études en cours", num: "04", badge: { text: "4" } },
      { href: `${BASE}/etudes-restituees`, label: "Études restituées", num: "05", badge: { text: "3" } },
      { href: `${BASE}/clients-suivi`, label: "Mes clients en suivi", num: "06", badge: { text: "7" } },
    ],
  },
  {
    title: "Assets du portefeuille",
    items: [
      { href: `${BASE}/assets`, label: "Vue d'ensemble" },
      { href: `${BASE}/assets-financier`, label: "Investissement financier" },
      { href: `${BASE}/assets-assurance`, label: "Assurance" },
      { href: `${BASE}/assets-immobilier`, label: "Investissement immobilier" },
      { href: `${BASE}/assets-honoraires`, label: "Honoraires de conseil" },
    ],
  },
  {
    title: "Partenaires & apporteurs",
    items: [{ href: `${BASE}/partenaires`, label: "Partenaires & apporteurs" }],
  },
  {
    title: "Outils",
    items: [
      { href: `${BASE}/marketplace`, label: "Catalogue produits" },
      { href: `${BASE}/simulateurs`, label: "Simulateurs & calculateurs" },
    ],
  },
  {
    title: "Référentiel",
    items: [{ href: `${BASE}/referentiel`, label: "Process & méthodologie" }],
  },
  {
    title: "Mon profil",
    items: [{ href: `${BASE}/profil`, label: "Profil & agréments" }],
  },
];

export function Sidebar() {
  return <SpaceSidebar spaceTitle="Espace Ingénieur" sections={sections} />;
}
