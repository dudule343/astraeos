import Link from "next/link";

import { PageScaffold } from "../../_components/PageScaffold";

const CATEGORIES = [
  {
    href: "/espace-ingenieur/assets-financier",
    label: "Investissement financier",
    desc: "Encours sous gestion, contrats titres et comptes-titres de vos clients.",
  },
  {
    href: "/espace-ingenieur/assets-assurance",
    label: "Assurance",
    desc: "Contrats d'assurance-vie et de capitalisation, tous types confondus.",
  },
  {
    href: "/espace-ingenieur/assets-immobilier",
    label: "Investissement immobilier",
    desc: "Projets immobiliers engagés et montants investis par vos clients.",
  },
  {
    href: "/espace-ingenieur/assets-honoraires",
    label: "Honoraires de conseil",
    desc: "Honoraires facturés et perçus au titre de votre activité de conseil.",
  },
];

export default function AssetsPage() {
  return (
    <PageScaffold
      eyebrow="Assets du portefeuille"
      title="Vue d'ensemble"
      description="Répartition des actifs de vos clients par grande classe. Sélectionnez une catégorie pour le détail."
    >
      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-lg border border-[var(--navy-100)] bg-white p-5 transition hover:border-[var(--gold)] hover:shadow-[0_2px_8px_rgba(16,45,80,0.08)]"
          >
            <div className="mb-1.5 text-[14px] font-bold text-[var(--navy)]">{c.label}</div>
            <p className="text-[12px] leading-relaxed text-[var(--navy-300)]">{c.desc}</p>
          </Link>
        ))}
      </div>
    </PageScaffold>
  );
}
