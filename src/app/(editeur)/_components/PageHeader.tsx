import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="mb-8 flex items-start justify-between gap-6">
      <div>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
          {eyebrow}
        </div>
        <h1 className="mb-2 text-[28px] font-semibold leading-tight tracking-tight text-[var(--navy)]">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--navy-300)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-shrink-0 gap-2">{actions}</div>}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
          {eyebrow}
        </div>
        <div className="text-[15px] font-semibold text-[var(--navy)]">{title}</div>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

export function GhostButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
    >
      {children}
    </button>
  );
}

export function GoldButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
    >
      {children}
    </button>
  );
}
