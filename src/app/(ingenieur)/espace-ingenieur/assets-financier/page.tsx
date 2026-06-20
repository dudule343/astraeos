import { PageScaffold, UnderConstruction } from "../../_components/PageScaffold";

export default function AssetsFinancierPage() {
  return (
    <PageScaffold
      eyebrow="Assets du portefeuille"
      title="Investissement financier"
      description="Encours sous gestion, contrats titres et comptes-titres de vos clients."
    >
      <UnderConstruction hint="Le détail des encours financiers sera branché sur les contrats de vos clients dans une prochaine itération." />
    </PageScaffold>
  );
}
