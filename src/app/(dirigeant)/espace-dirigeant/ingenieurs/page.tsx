import { Topbar } from "../../_components/Topbar";
import { ExportButton } from "../../_components/ExportButton";
import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";
import { PageHero } from "@/app/_components/shared/PageHeader";
import {
  fetchCabinetEngineers,
  fetchCabinetCommissions,
  fetchCabinetDossiers,
  fetchEtudesByEngineer,
  computeEngineerStats,
  fmtEur,
  fmtAnciennete,
  initials,
} from "../../_data/cabinet";
import { IngenieursTable, type IngenieurRow } from "./IngenieursTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Ingénieurs",
};

export default async function IngenieursPage() {
  const [engineers, commissions, dossiers] = await Promise.all([
    fetchCabinetEngineers(),
    fetchCabinetCommissions(),
    fetchCabinetDossiers(),
  ]);
  const etudesByEngineer = await fetchEtudesByEngineer(dossiers);

  const stats = computeEngineerStats(engineers, commissions, dossiers, etudesByEngineer);

  const nbIngenieurs = engineers.length;
  const totalCa = stats.reduce((acc, s) => acc + s.caGenere, 0);
  const caMoyen = nbIngenieurs > 0 ? totalCa / nbIngenieurs : 0;
  const totalEtudes = stats.reduce((acc, s) => acc + s.etudes, 0);
  const certifsAJour = engineers.filter((e) => !!e.orias_number).length;
  const ancienneteMoyenneMois =
    nbIngenieurs > 0
      ? Math.round(stats.reduce((acc, s) => acc + s.ancienneteMois, 0) / nbIngenieurs)
      : 0;

  const kpis: KpiBlock[] = [
    {
      label: "Ingénieurs actifs",
      value: nbIngenieurs > 0 ? String(nbIngenieurs) : "—",
      meta: "users · role engineer · actifs",
    },
    {
      label: "CA moyen par ingénieur",
      value: fmtEur(caMoyen),
      unit: caMoyen > 0 ? "€" : undefined,
      meta: "souscriptions générées / ingénieur",
    },
    {
      label: "Études générées",
      value: totalEtudes > 0 ? String(totalEtudes) : "—",
      meta: "études via dossiers du cabinet",
    },
    {
      label: "Certifications à jour",
      value: nbIngenieurs > 0 ? `${certifsAJour}` : "—",
      unit: nbIngenieurs > 0 ? `/ ${nbIngenieurs}` : undefined,
      meta: "ORIAS renseigné · IAS/CIF non modélisé",
    },
    {
      label: "Ancienneté moyenne",
      value: ancienneteMoyenneMois > 0 ? fmtAnciennete(ancienneteMoyenneMois) : "—",
      meta: "depuis users.created_at",
    },
  ];

  const rows: IngenieurRow[] = stats.map((s) => ({
    initials: initials(s.engineer.first_name, s.engineer.last_name),
    name: `${s.engineer.first_name} ${s.engineer.last_name}`.trim(),
    clients: s.clientsServed,
    ca: s.caGenere,
    etudes: s.etudes,
    nouveaux: s.nouveauxClients,
    anciennete: fmtAnciennete(s.ancienneteMois),
    orias: s.engineer.orias_number,
  }));

  const exportRows: (string | number)[][] = rows.map((r) => [
    r.name,
    r.clients,
    Math.round(r.ca),
    r.etudes,
    r.nouveaux,
    r.anciennete,
    r.orias ?? "—",
  ]);

  return (
    <>
      <Topbar current="Ingénieurs" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow={`Cabinet Paris Étoile · ${nbIngenieurs} ingénieur${nbIngenieurs > 1 ? "s" : ""} patrimonia${nbIngenieurs > 1 ? "ux" : "l"}`}
          title="Performance des ingénieurs"
          description="Vue agrégée de la production des ingénieurs patrimoniaux du cabinet : classement par CA généré, études générées et nouveaux clients, certifications ORIAS, ancienneté et pilotage de la formation."
          actions={
            <>
              <ExportButton
                label="Export"
                filename="ingenieurs-cabinet"
                headers={[
                  "Ingénieur",
                  "Clients servis",
                  "CA généré (€)",
                  "Études",
                  "Nouveaux clients",
                  "Ancienneté",
                  "ORIAS",
                ]}
                rows={exportRows}
              />
              <button
                type="button"
                data-stub="Communication formation"
                data-stub-body="L'envoi d'une communication de formation aux ingénieurs (sélection des destinataires, modèle de message) n'est pas encore branché. Cette fonctionnalité arrivera dans une prochaine itération."
                className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
              >
                Communication formation
              </button>
            </>
          }
        />

        <section className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
          Synthèse · performance des ingénieurs du cabinet
        </section>
        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <IngenieursTable rows={rows} />

        <section className="mt-8 mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
          Acquisition · pipeline de recrutement
        </section>
        <section className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-10 text-center">
          <div className="mb-3 text-[32px] leading-none">🚧</div>
          <div className="mb-2 text-[15px] font-semibold text-[var(--navy)]">
            Pipeline de recrutement à venir
          </div>
          <p className="mx-auto max-w-md text-[12px] leading-relaxed text-[var(--navy-300)]">
            Le suivi des candidatures d&apos;ingénieurs (de la candidature initiale à la signature)
            n&apos;est pas encore modélisé en base — aucune table candidatures n&apos;existe à ce
            jour. Cette section sera codée dans une prochaine itération.
          </p>
        </section>
      </div>
    </>
  );
}
