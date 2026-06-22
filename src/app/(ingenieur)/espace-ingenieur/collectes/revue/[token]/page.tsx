import Link from "next/link";

import { PageHero } from "@/app/_components/shared/PageHeader";
import { CollectesAdmin } from "@/app/(editeur)/collectes/CollectesAdmin";

export const dynamic = "force-dynamic";

export default async function CollecteRevuePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  // Le token cible une collecte précise dans l'URL ; la revue (CollectesAdmin)
  // se charge elle-même via /api/collecte-admin/* et gère la sélection interne.
  await params;

  return (
    <div className="py-8">
      <div className="px-10">
        <Link
          href="/espace-ingenieur/collectes"
          className="mb-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--navy-300)] transition hover:text-[var(--navy)]"
        >
          ← Retour aux collectes
        </Link>
        <PageHero
          eyebrow="Suivi des pièces"
          title="Revue de la collecte"
          description="Consultez les pièces déposées par le client, relancez l'analyse IA et répondez dans la conversation."
        />
      </div>
      <CollectesAdmin />
    </div>
  );
}
