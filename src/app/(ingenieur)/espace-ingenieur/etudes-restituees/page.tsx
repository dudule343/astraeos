import { PageScaffold, EmptyState } from "../../_components/PageScaffold";
import { DossierTable, formatDateFr } from "../../_components/DossierTable";
import { fetchDossiers } from "../../_data/dossiers";

export const dynamic = "force-dynamic";

export default async function EtudesRestitueesPage() {
  const dossiers = (await fetchDossiers()).filter((d) => d.stage === "05_restituee");

  return (
    <PageScaffold
      eyebrow="Parcours patrimonial · étape 05"
      title="Études restituées"
      description="Études livrées au client à l'issue du rendez-vous de restitution. Cumul de l'année en cours."
    >
      {dossiers.length > 0 ? (
        <DossierTable
          dossiers={dossiers}
          contextHeader="Livrée le"
          contextLabel={(d) => formatDateFr(d.deliveredAt ?? d.restitDate)}
        />
      ) : (
        <EmptyState>
          Aucune étude restituée pour le moment. Les études livrées en
          restitution apparaîtront ici.
        </EmptyState>
      )}
    </PageScaffold>
  );
}
