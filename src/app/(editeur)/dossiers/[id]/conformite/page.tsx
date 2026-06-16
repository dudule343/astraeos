import Link from "next/link";

import { Topbar } from "../../../_components/Topbar";
import { KpiCard, type KpiBlock } from "../../../_components/KpiCard";
import { PageHero } from "../../../_components/PageHeader";
import {
  mergeChecklist,
  completionRate,
  nextActionLabel,
  STATUS_LABELS,
  type ConformiteRow,
  type ConformiteStatus,
} from "@/lib/conformite";

import { loadConformiteItems, advanceConformiteItem } from "./actions";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

/** Bordure gauche de la card, miroir de .s1c-doc-card todo/pending/signed du wireframe. */
const CARD_BORDER: Record<ConformiteStatus, string> = {
  a_faire: "border-l-[var(--navy-200)]",
  envoye: "border-l-[var(--gold)]",
  signe: "border-l-[var(--navy)]",
  valide: "border-l-[var(--green-text)]",
};

/** Classes du badge de statut selon le tone défini dans conformite.ts. */
const BADGE_TONE: Record<ConformiteStatus, string> = {
  a_faire: "bg-[var(--navy-100)] text-[var(--navy-300)]",
  envoye: "bg-[var(--gold-200)] text-[var(--medium-400)]",
  signe: "bg-[var(--navy-100)] text-[var(--navy)]",
  valide: "bg-[var(--green-bg)] text-[var(--green-text)]",
};

function StatusBadge({ status }: { status: ConformiteStatus }) {
  return (
    <span
      className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${BADGE_TONE[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function PieceCard({ row, dossierId }: { row: ConformiteRow; dossierId: string }) {
  const action = nextActionLabel(row.status);
  const isDone = row.status === "valide";

  return (
    <div
      className={`rounded-md border border-[var(--navy-100)] border-l-[3px] bg-white p-4 ${CARD_BORDER[row.status]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-semibold text-[var(--navy)]">{row.label}</span>
            <StatusBadge status={row.status} />
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--navy-300)]">
            {row.description}
          </p>
        </div>

        <div className="shrink-0">
          {isDone ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--green-bg)] px-3 py-2 text-[11.5px] font-bold text-[var(--green-text)]">
              <span className="h-2 w-2 rounded-full bg-[var(--green-text)]" />
              Validé
            </span>
          ) : (
            action && (
              <form action={advanceConformiteItem.bind(null, dossierId, row.type)}>
                <button
                  type="submit"
                  className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white hover:brightness-110"
                >
                  {action}
                </button>
              </form>
            )
          )}
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--navy-100)] pt-3">
        <div>
          <dt className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--navy-300)]">
            Envoyé
          </dt>
          <dd className="text-[11.5px] text-[var(--navy)]">{fmtDate(row.sent_at)}</dd>
        </div>
        <div>
          <dt className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--navy-300)]">
            Signé
          </dt>
          <dd className="text-[11.5px] text-[var(--navy)]">{fmtDate(row.signed_at)}</dd>
        </div>
        <div>
          <dt className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--navy-300)]">
            Validé
          </dt>
          <dd className="text-[11.5px] text-[var(--navy)]">{fmtDate(row.validated_at)}</dd>
        </div>
      </dl>
    </div>
  );
}

export default async function ConformitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const items = await loadConformiteItems(id);
  const rows = mergeChecklist(items);

  const nbValide = rows.filter((r) => r.status === "valide").length;

  const kpis: KpiBlock[] = [
    {
      label: "Taux de conformité",
      value: `${completionRate(rows)} %`,
      meta: "pièces validées / checklist",
    },
    {
      label: "Pièces validées",
      value: `${nbValide}/${rows.length}`,
      meta: "DER · KYC · lettre de mission · mandat",
    },
    { label: "Étape", value: "Conformité 2/6", meta: "parcours patrimonial" },
  ];

  return (
    <>
      <Topbar current="Conformité / KYC" />

      <div className="px-10 py-8">
        <Link
          href={`/dossiers/${id}`}
          className="mb-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--navy-300)] transition hover:text-[var(--navy)]"
        >
          ← Retour à la fiche dossier
        </Link>

        <PageHero
          eyebrow="Étape 2 · Conformité réglementaire"
          title="Conformité / KYC"
          description="Checklist réglementaire CIF : DER, KYC, lettre de mission, mandat. Faites avancer chaque pièce (à faire → envoyé → signé → validé)."
        />

        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <section className="space-y-3">
          {rows.map((row) => (
            <PieceCard key={row.type} row={row} dossierId={id} />
          ))}
        </section>
      </div>
    </>
  );
}
