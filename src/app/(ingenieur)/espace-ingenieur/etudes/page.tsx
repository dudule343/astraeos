import { PageScaffold, EmptyState } from "../../_components/PageScaffold";
import { DossierTable, formatDateFr } from "../../_components/DossierTable";
import { fetchDossiers } from "../../_data/dossiers";

export const dynamic = "force-dynamic";

export default async function EtudesPage() {
  const dossiers = (await fetchDossiers()).filter((d) => d.stage === "04_etudes");

  return (
    <PageScaffold
      eyebrow="Parcours patrimonial · étape 04"
      title="Mes études en cours"
      description="Études en production : rédaction des quatre parties (adéquation, DER, KYC, note de synthèse) jusqu'à la restitution."
    >
      {dossiers.length > 0 ? (
        <DossierTable
          dossiers={dossiers}
          contextHeader="Restitution prévue"
          contextLabel={(d) => formatDateFr(d.restitDate)}
        />
      ) : (
        <EmptyState>
          Aucune étude en production actuellement. Les dossiers passés en phase de
          rédaction apparaîtront ici.
        </EmptyState>
      )}
    </PageScaffold>
  );
}
