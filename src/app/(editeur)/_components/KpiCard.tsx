export type Compare = {
  period: string;
  value: string;
  direction: "up" | "down" | "neutral";
};

export type KpiBlock = {
  phase?: "1" | "2";
  label: string;
  value: string;
  unit?: string;
  meta?: string;
  metaHighlight?: { text: string; tone: "up" | "down" };
  trend?: "up" | "down";
  valueTone?: "gold" | "alert";
  compares?: Compare[];
};

const compareDirectionClass = {
  up: "text-[var(--green-text)]",
  down: "text-[var(--red-text)]",
  neutral: "text-[var(--navy-300)]",
} as const;

function PhaseTag({ phase }: { phase: "1" | "2" }) {
  const isP1 = phase === "1";
  return (
    <span
      className={`absolute right-3 top-3 rounded-sm px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.12em] ${
        isP1
          ? "bg-[var(--gold-200)] text-[var(--medium-400)]"
          : "bg-[var(--navy-100)] text-[var(--navy-300)]"
      }`}
    >
      Phase {phase}
    </span>
  );
}

export function KpiCard({ kpi }: { kpi: KpiBlock }) {
  const valueClass = kpi.valueTone
    ? kpi.valueTone === "gold"
      ? "text-[var(--gold-deep)]"
      : "text-[var(--orange-text)]"
    : kpi.trend === "up"
      ? "text-[var(--green-text)]"
      : kpi.trend === "down"
        ? "text-[var(--red-text)]"
        : "text-[var(--navy)]";

  return (
    <div className="relative rounded-md border border-[var(--navy-100)] bg-white p-4">
      {kpi.phase && <PhaseTag phase={kpi.phase} />}
      <div
        className={`mb-2 ${kpi.phase ? "mt-2" : ""} text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--navy-300)]`}
      >
        {kpi.label}
      </div>
      <div className={`mb-1 text-[24px] font-bold leading-none ${valueClass}`}>
        {kpi.value}
        {kpi.unit && (
          <span className="ml-1 text-[14px] font-semibold text-[var(--navy-300)]">
            {kpi.unit}
          </span>
        )}
      </div>
      {kpi.meta && (
        <div className="mb-3 text-[11px] text-[var(--navy-300)]">
          {kpi.meta}
          {kpi.metaHighlight && (
            <>
              {" "}
              <strong
                className={
                  kpi.metaHighlight.tone === "up"
                    ? "font-semibold text-[var(--green-text)]"
                    : "font-semibold text-[var(--red-text)]"
                }
              >
                {kpi.metaHighlight.text}
              </strong>
            </>
          )}
        </div>
      )}

      {kpi.compares && (
        <div className="grid grid-cols-2 gap-2 border-t border-[var(--navy-100)] pt-2">
          {kpi.compares.map((c) => (
            <div key={c.period}>
              <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--navy-300)]">
                {c.period}
              </div>
              <div className={`text-[11px] font-semibold ${compareDirectionClass[c.direction]}`}>
                {c.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
