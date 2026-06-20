"use client";

import {
  SpaceSidebar,
  type NavSection,
} from "@/app/_components/shared/SpaceSidebar";

const BASE = "/espace-marque";

const sections: NavSection[] = [
  {
    title: "Accueil & synthèse",
    items: [
      { href: BASE, label: "Accueil réseau" },
      { href: `${BASE}/synthese`, label: "Synthèse réseau" },
      { href: `${BASE}/synthese-resultat`, label: "Compte de résultat" },
      { href: `${BASE}/synthese-treso`, label: "Trésorerie" },
      { href: `${BASE}/synthese-activite`, label: "Activité commerciale" },
    ],
  },
  {
    title: "Portefeuille licenciés",
    items: [
      { href: `${BASE}/licencies`, label: "Les licenciés" },
      { href: `${BASE}/performance`, label: "Performance des licenciés" },
      { href: `${BASE}/ingenieurs`, label: "Ingénieurs du réseau" },
    ],
  },
  {
    title: "Recrutement",
    items: [
      { href: `${BASE}/recrutement`, label: "Recrutement des licenciés" },
      { href: `${BASE}/pipe-01`, label: "Prospects actifs" },
      { href: `${BASE}/pipe-02`, label: "Conformité validée" },
      { href: `${BASE}/pipe-03`, label: "Collecte docs & infos" },
      { href: `${BASE}/pipe-04`, label: "Études en cours" },
      { href: `${BASE}/pipe-05`, label: "Études restituées" },
      { href: `${BASE}/pipe-06`, label: "Clients en suivi" },
    ],
  },
  {
    title: "Assets & produits",
    items: [
      { href: `${BASE}/assets-financier`, label: "Investissement financier" },
      { href: `${BASE}/assets-assurance`, label: "Assurance" },
      { href: `${BASE}/assets-immobilier`, label: "Immobilier" },
      { href: `${BASE}/assets-honoraires`, label: "Honoraires de conseil" },
    ],
  },
  {
    title: "Outillage & référentiels",
    items: [
      { href: `${BASE}/out-catalogue`, label: "Catalogue produits" },
      { href: `${BASE}/out-portefeuille`, label: "Constructeur de portefeuille" },
      { href: `${BASE}/out-simulateurs`, label: "Simulateurs" },
      { href: `${BASE}/out-immat`, label: "Immatriculation société" },
      { href: `${BASE}/ref-process`, label: "Process & méthodologie" },
      { href: `${BASE}/ref-compliance`, label: "Documentation compliance" },
    ],
  },
  {
    title: "Partenaires & animation",
    items: [
      { href: `${BASE}/partenaires`, label: "Partenaires & apporteurs" },
      { href: `${BASE}/anim-academie`, label: "Académie réseau" },
      { href: `${BASE}/anim-idees`, label: "Boîte à idées" },
      { href: `${BASE}/anim-blog`, label: "Articles & blog" },
      { href: `${BASE}/identite`, label: "Charte & templates" },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: `${BASE}/admin-overview`, label: "Vue d'ensemble" },
      { href: `${BASE}/admin-identite`, label: "Identité de la marque" },
      { href: `${BASE}/admin-banque`, label: "Connexions bancaires" },
      { href: `${BASE}/admin-integrations`, label: "Intégrations" },
      { href: `${BASE}/admin-utilisateurs`, label: "Utilisateurs réseau" },
      { href: `${BASE}/admin-tarification`, label: "Tarification & commissions" },
      { href: `${BASE}/admin-conformite`, label: "Conformité & juridique" },
      { href: `${BASE}/admin-templates`, label: "Templates & communication" },
      { href: `${BASE}/admin-notifications`, label: "Notifications & alertes" },
      { href: `${BASE}/admin-comptes`, label: "Comptes licenciés" },
      { href: `${BASE}/admin-logs`, label: "Logs application" },
    ],
  },
];

export function Sidebar() {
  return <SpaceSidebar spaceTitle="Espace Marque" sections={sections} />;
}
