import { Topbar } from "../_components/Topbar";
import { PageHero } from "@/app/_components/shared/PageHeader";
import { AgendaView } from "./AgendaView";

export const dynamic = "force-dynamic";

export default function AgendaPage() {
  return (
    <>
      <Topbar current="Mon agenda" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Agenda Google Calendar · vue personnelle"
          title="Mon agenda"
          description="Vos prochains rendez-vous synchronisés depuis Google Calendar · entretiens initiaux, restitutions d'étude et signatures sur les 14 prochains jours."
        />

        <AgendaView />
      </div>
    </>
  );
}
