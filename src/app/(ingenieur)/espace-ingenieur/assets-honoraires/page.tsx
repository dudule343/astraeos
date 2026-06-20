import { PageScaffold, UnderConstruction } from "../../_components/PageScaffold";

export default function AssetsHonorairesPage() {
  return (
    <PageScaffold
      eyebrow="Assets du portefeuille"
      title="Honoraires de conseil"
      description="Honoraires facturés et perçus au titre de votre activité de conseil patrimonial."
    >
      <UnderConstruction hint="Le suivi des honoraires de conseil sera branché sur la facturation dans une prochaine itération." />
    </PageScaffold>
  );
}
