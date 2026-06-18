import { Topbar } from "../_components/Topbar";
import { PageHero } from "../_components/PageHeader";
import { CollectesAdmin } from "./CollectesAdmin";

export const dynamic = "force-dynamic";

export default function CollectesPage() {
  return (
    <>
      <Topbar current="Collectes de documents" />
      <div className="py-8">
        <div className="px-7">
          <PageHero
            eyebrow="Suivi des pièces"
            title="Collectes de documents"
            description="Suivez les demandes envoyées, consultez les pièces déposées par vos clients, relancez l'analyse IA et répondez dans la conversation."
          />
        </div>
        <CollectesAdmin />
      </div>
    </>
  );
}
