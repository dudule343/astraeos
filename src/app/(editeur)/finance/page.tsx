import { Topbar } from "../_components/Topbar";
import { type KpiBlock } from "../_components/KpiCard";
import { PageHero, GoldButton } from "../_components/PageHeader";
import {
  fetchEditeurCommissions,
  computeEditeurResultat,
  computeBreakdownByCategory,
  computeSourceRows,
  computeMonthlyRevenue,
  fmtEur,
} from "./data";
import { FinanceTabs, type FinanceData } from "./FinanceTabs";
import { FinanceExportButton } from "./FinanceExportButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Finance consolidée",
};

const definitions: FinanceData["definitions"] = [
  {
    title: "1. Produits — Chiffre d'affaires",
    icon: "📈",
    items: [
      {
        term: "Chiffre d'affaires généré",
        desc: "Total des commissions « part éditeur » (recipient_type = brand_owner) dues sur la période, qu'elles soient encaissées ou non. Réparties en honoraires d'études et apports d'affaires.",
        formula: "CA généré = Σ(commissions brand_owner)",
      },
      {
        term: "Chiffre d'affaires encaissé",
        desc: "Total des commissions réellement perçues (status received ou reconciled). Peut être inférieur au CA généré si certaines commissions sont encore en attente (pending).",
        formula: "CA encaissé = Σ(commissions status ∈ {received, reconciled})",
      },
      {
        term: "Reste à encaisser",
        desc: "Commissions générées mais non encore perçues. Correspond aux commissions au statut pending. Indique la créance en cours sur les cabinets / partenaires.",
        formula: "Reste à encaisser = CA généré − CA encaissé",
      },
    ],
  },
  {
    title: "2. Types de commissions",
    icon: "💼",
    items: [
      {
        term: "Honoraires d'études",
        desc: "Commissions de type study_fee : la part facturée par l'éditeur au titre des études patrimoniales produites sur la plateforme.",
        formula: "Honoraires = Σ(commissions commission_type = study_fee)",
      },
      {
        term: "Apports d'affaires",
        desc: "Commissions de type upfront, recurring_management et performance : la part éditeur sur les souscriptions placées (frais d'entrée, gestion récurrente, surperformance).",
        formula: "Apports = Σ(upfront + recurring_management + performance)",
      },
    ],
  },
  {
    title: "3. Charges & résultat",
    icon: "💸",
    items: [
      {
        term: "Charges d'exploitation",
        desc: "Coûts engagés pour faire tourner l'éditeur (salaires, prestataires, hébergement, licences SaaS, marketing). Non modélisés en base à ce jour — la vue « Détail des charges » reste en attente d'une comptabilité connectée.",
      },
      {
        term: "Résultat net",
        desc: "Bénéfice après charges et impôt. Non calculable tant que les charges ne sont pas connectées : seuls les produits perçus sont reconstitués depuis les commissions.",
        formula: "Résultat net = Produits − Charges − Impôt",
      },
    ],
  },
  {
    title: "4. Trésorerie",
    icon: "🏦",
    items: [
      {
        term: "Trésorerie disponible",
        desc: "Somme des soldes des comptes bancaires de l'éditeur. Aucune connexion bancaire n'étant disponible en base, cette donnée n'est pas affichée (état vide honnête).",
      },
    ],
  },
  {
    title: "5. Périmètre & dates",
    icon: "📊",
    items: [
      {
        term: "Périmètre éditeur (consolidé)",
        desc: "Vue consolidée tous cabinets : on retient toutes les commissions dont l'éditeur est le destinataire (recipient_type = brand_owner, recipient_tenant_id = tenant courant), sans filtre par cabinet.",
      },
      {
        term: "Cumul depuis janvier",
        desc: "Total cumulé d'un indicateur depuis le 1er janvier de l'année en cours. Le CA réalisé par mois est bucketé via paid_date (sinon subscription_date).",
      },
    ],
  },
];

export default async function FinancePage() {
  const commissions = await fetchEditeurCommissions();

  const resultat = computeEditeurResultat(commissions);
  const byCategory = computeBreakdownByCategory(commissions);
  const sourceRows = computeSourceRows(commissions);
  const monthly = computeMonthlyRevenue(commissions);

  const hasData = resultat.totalGenere > 0;

  const eur = (n: number) => (n > 0 ? "€" : undefined);

  const kpis: KpiBlock[] = [
    {
      label: "CA réalisé · généré",
      value: fmtEur(resultat.totalGenere),
      unit: eur(resultat.totalGenere),
      meta: "commissions recipient_type = brand_owner",
      valueTone: "gold",
    },
    {
      label: "CA encaissé",
      value: fmtEur(resultat.totalEncaisse),
      unit: eur(resultat.totalEncaisse),
      meta: "statut received / reconciled",
    },
    {
      label: "Reste à encaisser",
      value: fmtEur(resultat.resteAEncaisser),
      unit: eur(resultat.resteAEncaisser),
      meta: "commissions status = pending",
    },
    {
      label: "Honoraires d'études",
      value: fmtEur(resultat.honorairesGenere),
      unit: eur(resultat.honorairesGenere),
      meta: "commission_type = study_fee",
    },
    {
      label: "Apports d'affaires",
      value: fmtEur(resultat.apportsGenere),
      unit: eur(resultat.apportsGenere),
      meta: "upfront + gestion + performance",
    },
  ];

  const detailKpis: KpiBlock[] = [
    {
      label: "Honoraires d'études · généré",
      value: fmtEur(resultat.honorairesGenere),
      unit: eur(resultat.honorairesGenere),
      meta: "commission_type = study_fee",
    },
    {
      label: "Apports d'affaires · généré",
      value: fmtEur(resultat.apportsGenere),
      unit: eur(resultat.apportsGenere),
      meta: "upfront + gestion + performance",
    },
    {
      label: "Encaissé · total",
      value: fmtEur(resultat.totalEncaisse),
      unit: eur(resultat.totalEncaisse),
      meta: "status received / reconciled",
      valueTone: "gold",
    },
    {
      label: "Reste à encaisser",
      value: fmtEur(resultat.resteAEncaisser),
      unit: eur(resultat.resteAEncaisser),
      meta: "commissions status = pending",
    },
  ];

  const arretedAu = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const data: FinanceData = {
    kpis,
    arretedAu,
    honorairesGenere: resultat.honorairesGenere,
    honorairesEncaisse: resultat.honorairesEncaisse,
    apportsGenere: resultat.apportsGenere,
    apportsEncaisse: resultat.apportsEncaisse,
    totalGenere: resultat.totalGenere,
    totalEncaisse: resultat.totalEncaisse,
    resteAEncaisser: resultat.resteAEncaisser,
    detailKpis,
    sourceRows,
    categoryBreakdown: byCategory.map((c) => ({ label: c.label, value: c.generated })),
    monthly,
    definitions,
    hasData,
  };

  return (
    <>
      <Topbar current="Finance consolidée" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Pilotage interne"
          title="Finance consolidée"
          description="Pilotage financier de l'éditeur ASTRAEOS — chiffre d'affaires généré et encaissé sur la part marque, détail par source et par catégorie de produit, vue consolidée tous cabinets. Charges, trésorerie et prévisionnel à venir."
          actions={
            <>
              <FinanceExportButton data={data} />
              <GoldButton
                dataStub="Connexion Qonto"
                dataStubBody="La connexion bancaire Qonto (synchronisation des soldes et de la trésorerie) sera disponible dans une prochaine itération. Aucun flux bancaire n'est connecté pour l'instant."
              >
                🔌 Connexion Qonto
              </GoldButton>
            </>
          }
        />

        <FinanceTabs data={data} />
      </div>
    </>
  );
}
