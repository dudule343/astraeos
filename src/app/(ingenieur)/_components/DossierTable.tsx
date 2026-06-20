import Link from "next/link";

import type { Dossier } from "@/lib/pipeline";
import { formatDateFr, initials, stageLabel } from "../_data/dossiers";

/**
 * Tableau réutilisable de dossiers, dans le style .dt de la maquette
 * (thead navy, lignes paires ivoire, avatar à initiales doré).
 * `contextLabel(d)` produit la 3e colonne contextuelle propre à chaque page.
 */
export function DossierTable({
  dossiers,
  contextHeader,
  contextLabel,
}: {
  dossiers: Dossier[];
  contextHeader: string;
  contextLabel: (d: Dossier) => string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--navy-100)] bg-white">
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="bg-[var(--navy)] text-left text-[10.5px] uppercase tracking-[0.06em] text-white">
            <th className="px-4 py-2.5 font-semibold">Client</th>
            <th className="px-4 py-2.5 font-semibold">Étape</th>
            <th className="px-4 py-2.5 font-semibold">{contextHeader}</th>
          </tr>
        </thead>
        <tbody>
          {dossiers.map((d, i) => (
            <tr
              key={d.id}
              className={i % 2 === 1 ? "bg-[var(--ivory)]" : "bg-white"}
            >
              <td className="border-b border-[var(--navy-100)] px-4 py-2.5">
                <Link
                  href={`/espace-ingenieur/dossiers`}
                  className="flex items-center gap-2.5 hover:text-[var(--gold)]"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--gold-300)] bg-[var(--light-blue)] text-[10px] font-bold text-[var(--navy)]">
                    {initials(d.name)}
                  </span>
                  <span className="font-semibold text-[var(--navy)]">{d.name}</span>
                </Link>
              </td>
              <td className="border-b border-[var(--navy-100)] px-4 py-2.5 text-[var(--navy-300)]">
                {stageLabel(d.stage)}
              </td>
              <td className="border-b border-[var(--navy-100)] px-4 py-2.5 text-[var(--navy-300)]">
                {contextLabel(d)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { formatDateFr };
