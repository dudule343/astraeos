"use client";

import {
  SpaceSidebar,
  type NavSection,
} from "@/app/_components/shared/SpaceSidebar";

const sections: NavSection[] = [
  {
    title: "Cockpit éditeur",
    items: [
      { href: "/", label: "Accueil" },
      { href: "/business", label: "Pilotage business", num: "01" },
      { href: "/acquisition", label: "Acquisition & conversion", num: "02" },
      { href: "/adoption", label: "Adoption produit", num: "03" },
      { href: "/ttv", label: "Vitesse première valeur", num: "04" },
      { href: "/health", label: "Santé clients", num: "05" },
      { href: "/product", label: "Analyse produit", num: "06" },
      { href: "/quality", label: "Support & qualité", num: "07" },
      { href: "/infra", label: "Infrastructure", num: "08" },
    ],
  },
  {
    title: "Acquisition",
    items: [
      { href: "/leads", label: "Pipeline acquisition" },
      { href: "/referral", label: "Programme de parrainage" },
    ],
  },
  {
    title: "Opérations clients",
    items: [
      { href: "/mon-activite", label: "Mon activité" },
      { href: "/prospects", label: "Mes prospects" },
      { href: "/clients", label: "Clients totaux actifs" },
      { href: "/dossiers", label: "Pipeline des dossiers" },
      { href: "/collectes", label: "Collectes de documents" },
      { href: "/entretiens", label: "Entretiens visio" },
      { href: "/visio", label: "Nouvelle visio" },
      { href: "/agenda", label: "Mon agenda" },
      { href: "/trial", label: "Période d'essai" },
      { href: "/client-new", label: "Nouveau client" },
      { href: "/marketplace", label: "Catalogue des packs" },
    ],
  },
  {
    title: "Pilotage interne",
    items: [
      { href: "/finance", label: "Finance consolidée" },
      { href: "/comms", label: "Communications & annonces" },
      { href: "/roadmap", label: "Roadmap & releases" },
      { href: "/team", label: "Équipe interne" },
      { href: "/profil", label: "Mon profil" },
      { href: "/integrations", label: "Intégrations & clés API" },
      { href: "/referentiel-documents", label: "Référentiel documentaire" },
    ],
  },
];

export function Sidebar() {
  return <SpaceSidebar spaceTitle="Admin Éditeur" sections={sections} />;
}
