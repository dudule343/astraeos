import { Topbar } from "./Topbar";

/**
 * Placeholder honnête du chrome marque (tête de réseau).
 * Même structure que le PlaceholderPage de l'éditeur, mais branché sur la
 * Topbar marque (fil d'ariane « Réseau PRIVEOS »). Décrit clairement ce que
 * la page montrera une fois branchée sur du réel, avec un badge « à venir ».
 */
export function PlaceholderPage({
  current,
  eyebrow,
  title,
  description,
}: {
  current: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <Topbar current={current} />

      <div className="px-10 py-8">
        <section className="mb-8">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
            {eyebrow}
          </div>
          <h1 className="mb-2 text-[28px] font-semibold leading-tight tracking-tight text-[var(--navy)]">
            {title}
          </h1>
          <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--navy-300)]">
            {description}
          </p>
        </section>

        <section className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
          <div className="mb-3 text-[40px] leading-none">🚧</div>
          <div className="mb-2 text-[16px] font-semibold text-[var(--navy)]">Page à venir</div>
          <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
            Cette page du réseau PRIVEOS sera branchée sur les données réelles consolidées des
            cabinets du tenant dans une prochaine itération.
          </p>
        </section>
      </div>
    </>
  );
}
