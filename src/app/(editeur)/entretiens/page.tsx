import Link from "next/link";

import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero } from "../_components/PageHeader";
import { listRecentEntretiens, type EntretienRecent } from "@/lib/entretiens-store";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function dureeMin(start: string, end: string | null): string {
  if (!end) return "—";
  try {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (!Number.isFinite(ms) || ms <= 0) return "—";
    return `${Math.round(ms / 60000)} min`;
  } catch {
    return "—";
  }
}

function computeKpis(items: EntretienRecent[]): KpiBlock[] {
  const total = items.length;
  const termines = items.filter((e) => e.ended_at).length;
  const enCours = total - termines;
  const avecRapport = items.filter((e) => e.a_rapport).length;
  return [
    { label: "Entretiens", value: String(total), meta: "200 plus récents" },
    { label: "Terminés", value: String(termines), meta: "clôturés avec horodatage" },
    { label: "En cours / non clôturés", value: String(enCours), meta: "sans heure de fin" },
    { label: "Avec rapport IA", value: String(avecRapport), meta: "synthèse générée" },
  ];
}

export default async function EntretiensPage() {
  const items = await listRecentEntretiens(200);
  const kpis = computeKpis(items);

  return (
    <>
      <Topbar current="Entretiens visio" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Opérations clients"
          title="Entretiens visio"
          description="L'historique des entretiens menés en visio : transcription, DCI complété en direct par l'IA, conseils et rapport de synthèse. Cliquez un entretien pour voir le détail."
        />

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {items.length > 0 ? (
          <div className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-left text-[10.5px] uppercase tracking-wide text-[var(--navy-300)]">
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Prospect / client</th>
                  <th className="px-4 py-3 font-semibold">Salle</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Durée</th>
                  <th className="px-4 py-3 text-right font-semibold">Conseils</th>
                  <th className="px-4 py-3 text-center font-semibold">Rapport</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-[var(--navy-100)] last:border-0 hover:bg-[var(--ivory)]"
                  >
                    <td className="px-4 py-3 text-[var(--navy-300)]">{fmtDate(e.started_at)}</td>
                    <td className="px-4 py-3 font-medium text-[var(--navy)]">
                      {e.display_name || e.prospect_slug || "— (sans dossier)"}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[var(--navy-300)]">{e.room}</td>
                    <td className="px-4 py-3">
                      {e.ended_at ? (
                        <span className="rounded-full bg-[var(--green-bg,#e6f4ec)] px-2 py-0.5 text-[10.5px] font-semibold text-[#1F5A36]">
                          Terminé
                        </span>
                      ) : (
                        <span className="rounded-full bg-[var(--gold-100,#f7efd8)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--gold-deep,#9a6c0a)]">
                          En cours
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--navy-300)]">{dureeMin(e.started_at, e.ended_at)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[var(--navy)]">{e.nb_conseils}</td>
                    <td className="px-4 py-3 text-center">{e.a_rapport ? "✓" : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/entretiens/${e.id}`}
                        className="font-semibold text-[var(--gold-deep,#9a6c0a)] hover:underline"
                      >
                        Détail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <section className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
            <div className="mb-3 text-[40px] leading-none">🎥</div>
            <div className="mb-2 text-[16px] font-semibold text-[var(--navy)]">
              Aucun entretien pour l'instant
            </div>
            <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              Les entretiens visio menés apparaîtront ici, avec leur transcription, le DCI complété
              par l'IA, les conseils et le rapport.
            </p>
          </section>
        )}
      </div>
    </>
  );
}
