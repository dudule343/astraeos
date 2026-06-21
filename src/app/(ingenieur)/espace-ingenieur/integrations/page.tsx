// Espace ingénieur — Intégrations & clés API (route /espace-ingenieur/integrations).
//
// Bug corrigé (21/06) : la page ré-exportait la page éditeur, qui rend la topbar
// éditeur (breadcrumb « ASTRAEOS Admin ») — mauvais espace. On réutilise ici le
// même contenu réel (PageHero + KeyManager, BYOK clés API du cabinet) mais SANS la
// topbar éditeur, comme les autres pages ingénieur (pas de topbar dédiée). Les
// composants partagés (PageHero) et KeyManager (autonome) sont stylés en Tailwind
// global, donc rendus correctement dans le layout ingénieur.
import { notFound } from "next/navigation";

import { PageHero } from "@/app/_components/shared/PageHeader";
import { KeyManager } from "@/app/(editeur)/integrations/KeyManager";
import { getSessionContext } from "@/lib/auth/context";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Espace Ingénieur · Intégrations & clés API",
};

export default async function IntegrationsPage() {
  const ctx = await getSessionContext();
  if (!ctx) notFound();

  return (
    <div className="px-10 py-8">
      <PageHero
        eyebrow="Paramètres · Intégrations"
        title="Clés API du cabinet"
        description={
          "Connectez vos services en saisissant vos propres clés API (BYOK). Elles sont validées en direct puis stockées de façon sécurisée, et activent l'intelligence du cockpit visio : transcription, conseils en direct et compte-rendu."
        }
      />

      <KeyManager />

      <p className="mt-6 max-w-2xl text-[11.5px] leading-relaxed text-[var(--navy-300)]">
        Chaque cabinet utilise ses propres clés : la facturation des appels IA et transcription
        reste de votre côté, et aucune clé n&apos;est partagée entre cabinets. Vous pouvez les
        remplacer ou les supprimer à tout moment.
      </p>
    </div>
  );
}
