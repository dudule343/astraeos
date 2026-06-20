import { PageScaffold, EmptyState } from "../../_components/PageScaffold";
import { DossierTable } from "../../_components/DossierTable";
import { fetchDossiers } from "../../_data/dossiers";
import { joursEnEtape } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export default async function ConformitePage() {
  const now = new Date();
  const dossiers = (await fetchDossiers()).filter((d) => d.stage === "02_compliance");

  return (
    <PageScaffold
      eyebrow="Parcours patrimonial · étape 02"
      title="Conformité en cours"
      description="Dossiers en entrée en relation : KYC, LCB-FT et vérifications réglementaires avant la collecte."
    >
      {dossiers.length > 0 ? (
        <DossierTable
          dossiers={dossiers}
          contextHeader="Ancienneté"
          contextLabel={(d) => {
            const j = joursEnEtape(d, now);
            return j != null ? `${j} j en conformité` : "—";
          }}
        />
      ) : (
        <EmptyState>
          Aucun dossier en phase de conformité pour le moment. Les nouveaux
          prospects qualifiés apparaîtront ici dès l&apos;entrée en relation.
        </EmptyState>
      )}
    </PageScaffold>
  );
}
