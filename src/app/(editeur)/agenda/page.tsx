import { Topbar } from "../_components/Topbar";
import { PageHero } from "../_components/PageHeader";
import { AgendaView } from "./AgendaView";

export const dynamic = "force-dynamic";

const ENGINEER_NAME = "Luc Thilliez";

export default function AgendaPage() {
  return (
    <>
      <Topbar current="Mon agenda" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow={`Agenda Google Calendar · vue par ${ENGINEER_NAME}`}
          title="Mon agenda"
          description="Vos prochains rendez-vous synchronisés depuis Google Calendar · entretiens initiaux, restitutions d'étude et signatures sur les 14 prochains jours."
        />

        <AgendaView />
      </div>
    </>
  );
}
