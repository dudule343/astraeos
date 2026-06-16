import { Topbar } from "../../_components/Topbar";
import { type KpiBlock } from "../../../(editeur)/_components/KpiCard";
import { PageHero, GhostButton, GoldButton } from "../../../(editeur)/_components/PageHeader";
import {
  fetchCabinetCommissions,
  fetchCabinetEngineers,
  computeFinanceResultat,
  computeBreakdownByCategory,
  computeSourceRows,
  computeEngineerCommissions,
  fmtEur,
} from "../../_data/cabinet";
import { FinanceTabs, type FinanceData } from "./FinanceTabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Finance du cabinet",
};

export default async function FinancePage() {
  const [commissions, engineers] = await Promise.all([
    fetchCabinetCommissions(),
    fetchCabinetEngineers(),
  ]);

  const resultat = computeFinanceResultat(commissions);
  const byCategory = computeBreakdownByCategory(commissions);
  const sourceRows = computeSourceRows(commissions);
  const commRows = computeEngineerCommissions(engineers, commissions);

  const hasData = resultat.totalGenere > 0 || resultat.reverseIngenieurs > 0;

  const kpis: KpiBlock[] = [
    {
      label: "CA généré · part cabinet",
      value: fmtEur(resultat.totalGenere),
      unit: resultat.totalGenere > 0 ? "€" : undefined,
      meta: "commissions recipient_type = cabinet",
      valueTone: "gold",
    },
    {
      label: "CA encaissé",
      value: fmtEur(resultat.totalEncaisse),
      unit: resultat.totalEncaisse > 0 ? "€" : undefined,
      meta: "statut received / reconciled",
    },
    {
      label: "Reste à encaisser",
      value: fmtEur(resultat.resteAEncaisser),
      unit: resultat.resteAEncaisser > 0 ? "€" : undefined,
      meta: "généré non encore reçu",
    },
    {
      label: "Honoraires d'études",
      value: fmtEur(resultat.honorairesGenere),
      unit: resultat.honorairesGenere > 0 ? "€" : undefined,
      meta: "commission_type = study_fee",
    },
    {
      label: "Reversé aux ingénieurs",
      value: fmtEur(resultat.reverseIngenieurs),
      unit: resultat.reverseIngenieurs > 0 ? "€" : undefined,
      meta: "recipient_type = engineer_bonus",
    },
  ];

  const honorairesKpis: KpiBlock[] = [
    {
      label: "Honoraires d'études · généré",
      value: fmtEur(resultat.honorairesGenere),
      unit: resultat.honorairesGenere > 0 ? "€" : undefined,
      meta: "commission_type = study_fee",
    },
    {
      label: "Apports d'affaires · généré",
      value: fmtEur(resultat.apportsGenere),
      unit: resultat.apportsGenere > 0 ? "€" : undefined,
      meta: "upfront + gestion + performance",
    },
    {
      label: "Encaissé · total",
      value: fmtEur(resultat.totalEncaisse),
      unit: resultat.totalEncaisse > 0 ? "€" : undefined,
      meta: "status received / reconciled",
      valueTone: "gold",
    },
    {
      label: "Reste à encaisser",
      value: fmtEur(resultat.resteAEncaisser),
      unit: resultat.resteAEncaisser > 0 ? "€" : undefined,
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
    reverseIngenieurs: resultat.reverseIngenieurs,
    honorairesKpis,
    sourceRows,
    categoryBreakdown: byCategory.map((c) => ({ label: c.label, value: c.generated })),
    commRows,
    totalReverse: resultat.reverseIngenieurs,
    hasData,
  };

  return (
    <>
      <Topbar current="Finance du cabinet" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Tableau de bord · synthèse financière du cabinet"
          title="Finance du cabinet"
          description="Vision macro des flux financiers du Cabinet Paris Étoile : CA généré et encaissé, détail des honoraires d'études et des apports d'affaires, répartition des commissions reversées aux ingénieurs. Charges et trésorerie à venir."
          actions={
            <>
              <GhostButton>Export comptable</GhostButton>
              <GoldButton>🔌 Connexion bancaire</GoldButton>
            </>
          }
        />

        <FinanceTabs data={data} />
      </div>
    </>
  );
}
