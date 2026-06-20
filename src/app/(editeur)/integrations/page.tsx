import { notFound } from "next/navigation";

import { Topbar } from "../_components/Topbar";
import { PageHero } from "@/app/_components/shared/PageHeader";
import { KeyManager } from "./KeyManager";
import { getSessionContext } from "@/lib/auth/context";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  // Page STAFF : pas de session → on ne rend pas la console de clés. Le statut
  // affiché provient ensuite des endpoints /api/ia-settings et
  // /api/visio/stt-settings, désormais scopés au cabinet de la session.
  const ctx = await getSessionContext();
  if (!ctx) notFound();

  return (
    <>
      <Topbar current="Intégrations & clés API" />

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
    </>
  );
}
