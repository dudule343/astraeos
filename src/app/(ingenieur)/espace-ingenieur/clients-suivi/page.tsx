import { PageScaffold, EmptyState } from "../../_components/PageScaffold";
import { DossierTable, formatDateFr } from "../../_components/DossierTable";
import { fetchDossiers } from "../../_data/dossiers";

export const dynamic = "force-dynamic";

export default async function ClientsSuiviPage() {
  const dossiers = (await fetchDossiers()).filter((d) => d.stage === "06_suivi");

  return (
    <PageScaffold
      eyebrow="Parcours patrimonial · étape 06"
      title="Mes clients en suivi"
      description="Clients dont l'étude est livrée et qui entrent dans le suivi annuel : points périodiques et ajustements de stratégie."
    >
      {dossiers.length > 0 ? (
        <DossierTable
          dossiers={dossiers}
          contextHeader="Prochain point"
          contextLabel={(d) => formatDateFr(d.restitDate)}
        />
      ) : (
        <EmptyState>
          Aucun client en suivi pour le moment. Les clients dont l&apos;étude a
          été restituée basculeront ici pour leur suivi annuel.
        </EmptyState>
      )}
    </PageScaffold>
  );
}
