import type { ReactNode } from "react";

import { PageHero } from "@/app/_components/shared/PageHeader";

/** Cadre commun des pages de rubrique : padding + hero. */
export function PageScaffold({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="px-10 py-8">
      <PageHero eyebrow={eyebrow} title={title} description={description} actions={actions} />
      {children}
    </div>
  );
}

/**
 * État vide honnête : la section existe mais n'est pas encore branchée.
 * Aucune fausse donnée, aucun toast.
 */
export function UnderConstruction({
  hint,
}: {
  hint?: string;
}) {
  return (
    <section className="rounded-lg border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
      <div className="mb-2 text-[15px] font-semibold text-[var(--navy)]">
        Section en cours de construction
      </div>
      <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
        {hint ??
          "Cette rubrique sera branchée sur vos données dans une prochaine itération."}
      </p>
    </section>
  );
}

/** État vide quand une source de données existe mais ne renvoie rien. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[var(--navy-100)] bg-white p-12 text-center">
      <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
        {children}
      </p>
    </section>
  );
}
