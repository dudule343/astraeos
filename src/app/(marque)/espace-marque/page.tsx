import { Topbar } from "../_components/Topbar";
import { NetworkExportButton } from "../_components/NetworkExportButton";
import { KpiCard, type KpiBlock } from "../../(editeur)/_components/KpiCard";
import { PageHero, SectionHeader } from "../../(editeur)/_components/PageHeader";
import { EmptyState } from "../../(dirigeant)/_components/EmptyState";
import {
  fetchNetworkCabinets,
  computeNetworkPerfKpis,
  rankNetworkCabinets,
  fmtEurCell,
  fmtCount,
  cabinetInitials,
} from "../_data/network";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Espace Marque · Accueil réseau",
};

const NOW = new Date();
const DATE_FR = NOW.toLocaleDateString("fr-FR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default async function AccueilReseauPage() {
  // Scope RÉSEAU : tous les cabinets du tenant (pas de filtre cabinet_id).
  // Le flag d'auth est OFF → contexte legacy du seed (tenant PRIVEOS Capital).
  const cabinets = await fetchNetworkCabinets();
  const perf = computeNetworkPerfKpis(cabinets);
  const ranked = rankNetworkCabinets(cabinets);

  const aTopCabinet = ranked.length > 0 && ranked[0].caGenere > 0;

  // --- Cockpit tête de réseau : KPIs consolidés ----------------------------
  // Tout ce qui n'est pas dérivable du portefeuille réel reste à "—" honnête.
  const reseauKpis: KpiBlock[] = [
    {
      label: "Licenciés actifs",
      value: fmtCount(perf.cabinetsCount),
      meta: "cabinets du tenant · is_active",
    },
    {
      label: "Clients · réseau",
      value: fmtCount(perf.clientsTotal),
      meta: "total_clients_cached cumulé · tous cabinets",
    },
    {
      label: "Encours sous gestion",
      value: fmtEurCell(perf.encoursTotal),
      meta: "total_aum_cached cumulé · réseau",
      valueTone: "gold",
    },
    {
      label: "CA généré · réseau",
      value: fmtEurCell(perf.caTotal),
      meta: "commissions part-cabinet encaissées · tous cabinets",
    },
  ];

  return (
    <>
      <Topbar current="Accueil" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow={`Tableau de bord · ${DATE_FR}`}
          title="Bienvenue sur le réseau PRIVEOS"
          description="Cockpit de la tête de réseau : indicateurs consolidés de l'ensemble des cabinets licenciés, encours sous gestion, parcours patrimonial et classement des licenciés. Tout pour piloter la marque depuis un seul écran."
          actions={
            <NetworkExportButton
              label="Exporter la synthèse"
              filename="astraeos-reseau-synthese"
              headers={["Rang", "Cabinet", "Ville", "Dirigeant", "Clients", "CA généré (€)", "Encours (€)"]}
              rows={ranked.map((c) => [
                c.rank,
                c.name,
                c.city ?? "",
                c.director ?? "",
                c.clients,
                Math.round(c.caGenere),
                Math.round(c.encours),
              ])}
            />
          }
        />

        {/* ---- Cockpit · KPIs consolidés du réseau ---- */}
        <section className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
          Cockpit · synthèse du réseau PRIVEOS
        </section>
        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {reseauKpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {/* ---- Indicateurs non consolidés dans le périmètre actuel ---- */}
        <div className="mb-8 flex items-start gap-2 rounded-md border border-dashed border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy-300)]">
          <span>ℹ️</span>
          <div>
            <strong className="text-[var(--navy)]">
              Effectif ingénieurs, pipeline consolidé et revenus par période · à venir.
            </strong>{" "}
            Ces indicateurs réseau nécessitent une consolidation multi-cabinets non disponible dans le
            périmètre de données actuel. Ils s&apos;afficheront automatiquement dès que les cabinets du
            réseau enregistreront leur activité.
          </div>
        </div>

        {/* ---- Top licenciés (classement par CA généré / encours) ---- */}
        <SectionHeader
          eyebrow="Réseau · classement des licenciés"
          title="Top licenciés du réseau"
          right={
            <span className="text-[11px] text-[var(--navy-300)]">
              {perf.cabinetsCount > 0
                ? `${perf.cabinetsCount} cabinet${perf.cabinetsCount > 1 ? "s" : ""}`
                : "Aucun cabinet"}
            </span>
          }
        />

        {ranked.length === 0 ? (
          <EmptyState
            icon="🏢"
            title="Aucun cabinet licencié sur le réseau"
            hint="Dès qu'un cabinet sera rattaché à ce tenant, il apparaîtra ici avec son dirigeant, son chiffre d'affaires généré et son encours sous gestion."
          />
        ) : (
          <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  <th className="px-4 py-3 text-right">Rang</th>
                  <th className="px-4 py-3">Cabinet</th>
                  <th className="px-4 py-3">Dirigeant</th>
                  <th className="px-4 py-3 text-right">Clients</th>
                  <th className="px-4 py-3 text-right">CA généré</th>
                  <th className="px-4 py-3 text-right">Encours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--navy-100)]">
                {ranked.map((c) => {
                  const isPodium = c.rank <= 3;
                  return (
                    <tr
                      key={c.id}
                      className="text-[12px] text-[var(--navy)] hover:bg-[var(--light-blue)]"
                    >
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        <span className={isPodium ? "font-bold text-[var(--gold)]" : ""}>
                          {c.rank}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-[10px] font-bold text-white">
                            {cabinetInitials(c.name)}
                          </div>
                          <div>
                            <div className="font-semibold">{c.name}</div>
                            {c.city && (
                              <div className="text-[10.5px] text-[var(--navy-300)]">{c.city}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        {c.director ? (
                          c.director
                        ) : (
                          <span className="text-[var(--navy-300)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[var(--navy-300)]">
                        {c.clients || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                        {fmtEurCell(c.caGenere)}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-semibold tabular-nums ${
                          isPodium ? "text-[var(--gold)]" : ""
                        }`}
                      >
                        {fmtEurCell(c.encours)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!aTopCabinet && ranked.length > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-dashed border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy-300)]">
            <span>ℹ️</span>
            <div>
              <strong className="text-[var(--navy)]">Réseau en cours de constitution.</strong>{" "}
              Les cabinets sont rattachés au tenant mais n&apos;ont pas encore généré de commissions
              encaissées. Le classement par chiffre d&apos;affaires s&apos;activera dès les premières
              souscriptions.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
