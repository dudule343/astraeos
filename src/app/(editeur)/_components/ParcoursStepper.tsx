/**
 * Stepper des 6 jalons du parcours patrimonial (v40 · .s1b-parcours-stepper).
 *
 * Source d'autorité de l'avancement : `dossiers.pipeline_stage` → `stageIndex`
 * 1..6 (cf. dossier-parcours.ts). Les 6 libellés sont FIGÉS — ils décrivent le
 * parcours produit, pas une donnée par dossier. L'étape courante (stageIndex)
 * est la seule entrée dynamique. Le badge « Étape 0X/06 » reprend stageIndex.
 *
 * Composant partagé : la fiche conformité (étape 02) et la collecte (étape 03)
 * l'affichent à l'identique au-dessus de leur hero.
 */

const STEPS = [
  { num: 1, label: ["Prospects", "actifs"] },
  { num: 2, label: ["Conformité", "en cours"] },
  { num: 3, label: ["Collecte de", "documents"] },
  { num: 4, label: ["Étude en", "cours"] },
  { num: 5, label: ["Études", "restituées"] },
  { num: 6, label: ["Clients", "en suivi"] },
] as const;

export function ParcoursStepper({ stageIndex }: { stageIndex: number }) {
  return (
    <div className="mb-[18px] flex items-center gap-1.5 overflow-x-auto rounded-md border border-[var(--navy-100)] bg-white px-4 py-3">
      {STEPS.map((s) => {
        const state: "done" | "active" | "todo" =
          s.num < stageIndex ? "done" : s.num === stageIndex ? "active" : "todo";
        const numClass =
          state === "done"
            ? "bg-[var(--green-bg)] text-[var(--green-text)]"
            : state === "active"
              ? "bg-[var(--gold)] text-white"
              : "border border-[var(--navy-100)] bg-white text-[var(--navy-300)]";
        const labelClass = state === "todo" ? "text-[var(--navy-300)]" : "text-[var(--navy)]";
        return (
          <div key={s.num} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${numClass}`}
            >
              {state === "done" ? "✓" : s.num}
            </div>
            <div className={`text-[10px] font-semibold leading-tight ${labelClass}`}>
              {s.label[0]}
              <br />
              {s.label[1]}
            </div>
          </div>
        );
      })}
      <span className="ml-1.5 flex-shrink-0 rounded-[14px] bg-[var(--gold-100)] px-3.5 py-2 text-[9.5px] font-bold uppercase tracking-[0.1em] text-[var(--gold-deep)]">
        Étape {String(stageIndex).padStart(2, "0")}/06
      </span>
    </div>
  );
}
