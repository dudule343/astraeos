"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE = "/espace-marque";

type NavItem = { href: string; label: string };
type NavSection = { title: string; items: NavItem[] };

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
      { href: `${BASE}/admin-documents`, label: "Référentiel documentaire" },
      { href: `${BASE}/admin-notifications`, label: "Notifications & alertes" },
      { href: `${BASE}/admin-comptes`, label: "Comptes licenciés" },
      { href: `${BASE}/admin-logs`, label: "Logs application" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-[280px] flex-shrink-0 overflow-y-auto border-r border-[var(--navy-100)] bg-[var(--ivory)] px-4 pt-7 pb-8">
      <div className="mb-7 px-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[30px] items-center justify-center rounded-[4px] bg-gradient-to-b from-[var(--gold)] to-[var(--medium-400)] text-base font-extrabold text-white">
            A
          </div>
          <div className="text-[19px] font-bold tracking-[0.08em] text-[var(--navy)]">
            ASTRAEOS
          </div>
        </div>
        <div className="ml-10 mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--navy-300)]">
          Espace Marque
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="mb-[18px]">
          <div className="mb-1.5 flex items-center gap-[7px] px-3 text-[9.5px] font-bold uppercase tracking-[0.18em] text-[var(--navy-300)]">
            <span className="h-1 w-1 rounded-full bg-[var(--gold)]" />
            {section.title}
          </div>

          {section.items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-px flex w-full items-center gap-2.5 rounded-[5px] px-3 py-[7px] text-left text-[12.5px] leading-tight transition-colors ${
                  isActive
                    ? "bg-[var(--navy)] font-medium text-white"
                    : "text-[var(--navy)] hover:bg-[var(--light-blue)]"
                }`}
              >
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
