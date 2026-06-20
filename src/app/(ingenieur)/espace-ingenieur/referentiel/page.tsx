import { PageScaffold } from "../../_components/PageScaffold";

const STEPS = [
  {
    num: "01",
    label: "Prospection & qualification",
    desc: "Premier contact, recueil du besoin et qualification du prospect avant entrée en relation.",
  },
  {
    num: "02",
    label: "Conformité & entrée en relation",
    desc: "KYC, LCB-FT et vérifications réglementaires : connaissance client et origine des fonds.",
  },
  {
    num: "03",
    label: "Collecte des documents & informations",
    desc: "Constitution du dossier patrimonial via l'espace sécurisé : pièces, comptes, contrats.",
  },
  {
    num: "04",
    label: "Production de l'étude",
    desc: "Rédaction des quatre parties : adéquation, DER, KYC et note de synthèse.",
  },
  {
    num: "05",
    label: "Restitution",
    desc: "Présentation de l'étude au client en rendez-vous, puis remise du livrable signé.",
  },
  {
    num: "06",
    label: "Suivi annuel",
    desc: "Points périodiques et ajustements de la stratégie patrimoniale dans la durée.",
  },
];

export default function ReferentielPage() {
  return (
    <PageScaffold
      eyebrow="Référentiel"
      title="Process & méthodologie"
      description="Les six étapes du parcours patrimonial, du premier contact au suivi annuel du client."
    >
      <ol className="space-y-3">
        {STEPS.map((s) => (
          <li
            key={s.num}
            className="flex items-start gap-4 rounded-lg border border-[var(--navy-100)] bg-white p-5"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-[var(--gold-200)] text-[13px] font-bold text-[var(--medium-400)]">
              {s.num}
            </span>
            <div>
              <div className="mb-1 text-[14px] font-bold text-[var(--navy)]">{s.label}</div>
              <p className="text-[12.5px] leading-relaxed text-[var(--navy-300)]">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </PageScaffold>
  );
}
