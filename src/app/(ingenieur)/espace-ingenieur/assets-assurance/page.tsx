import { PageScaffold, UnderConstruction } from "../../_components/PageScaffold";

export default function AssetsAssurancePage() {
  return (
    <PageScaffold
      eyebrow="Assets du portefeuille"
      title="Assurance"
      description="Contrats d'assurance-vie et de capitalisation de vos clients, tous types confondus."
    >
      <UnderConstruction hint="Le suivi des contrats d'assurance sera branché sur les données clients dans une prochaine itération." />
    </PageScaffold>
  );
}
