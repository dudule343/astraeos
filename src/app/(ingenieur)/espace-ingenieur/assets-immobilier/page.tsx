import { PageScaffold, UnderConstruction } from "../../_components/PageScaffold";

export default function AssetsImmobilierPage() {
  return (
    <PageScaffold
      eyebrow="Assets du portefeuille"
      title="Investissement immobilier"
      description="Projets immobiliers engagés par vos clients et montants investis."
    >
      <UnderConstruction hint="Le détail des projets immobiliers sera branché sur les données clients dans une prochaine itération." />
    </PageScaffold>
  );
}
