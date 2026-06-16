import Link from "next/link";

import { Topbar } from "../../../_components/Topbar";
import { PageHero } from "../../../_components/PageHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { STAGE_LABELS } from "@/lib/dossier-parcours";
import {
  mergeChecklist,
  trackerStepsFor,
  conditionsForStage03,
  docCardConfig,
  CARD_TYPES,
  PAY_LABELS,
  type CardType,
  type ConformiteRow,
  type TrackerState,
  type PayState,
  type Stage03Condition,
} from "@/lib/conformite";

import { loadConformiteItems, advanceConformiteItem, relancerClient } from "./actions";
import { PackSend, type PackPiece } from "./PackSend";
import { moveDossierStage } from "../../actions";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

type ConformiteHeader = {
  id: string;
  stage: string;
  representant: string | null;
  conjoint: string | null;
  emails: string[];
  entryDate: string | null;
  /** Honoraires bruts (nombre lu en base), ou null. */
  revenue: string | null;
  /** Métadonnées libres parsées des internal_notes (régime, parts, paiement). */
  notes: ConformiteNotes;
};

type ConformiteNotes = {
  raison_sociale?: string;
  revenue?: string;
  regime?: string;
  parts_fiscales?: string | number;
  enfants?: string | number;
  payment_state?: PayState;
};

/**
 * Charge l'entête de la page conformité depuis le réel (couple, honoraires,
 * pipeline_stage). Réutilise le pattern fetchDossier de la fiche dossier.
 * Dégradation gracieuse : null sans clé service_role → page affichée avec un
 * entête générique et la checklist reconstruite à vide.
 */
async function fetchHeader(id: string): Promise<ConformiteHeader | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const supabase = createAdminClient();
    const { data: d } = await supabase
      .from("dossiers")
      .select(
        `
          id,
          pipeline_stage,
          pipeline_entry_date,
          total_revenue_cached,
          internal_notes,
          clients ( personnes ( first_name, last_name, email ) )
        `,
      )
      .eq("id", id)
      .maybeSingle();

    if (!d) return null;

    const row = d as Record<string, unknown>;

    let notes: ConformiteNotes = {};
    const notesRaw = row.internal_notes as string | null | undefined;
    if (notesRaw) {
      try {
        notes = JSON.parse(notesRaw) as ConformiteNotes;
      } catch {
        // ignore
      }
    }

    const clientRaw = row.clients as
      | { personnes?: Array<{ first_name?: string; last_name?: string; email?: string }> }
      | Array<{ personnes?: Array<{ first_name?: string; last_name?: string; email?: string }> }>
      | null
      | undefined;
    const client = Array.isArray(clientRaw) ? clientRaw[0] : clientRaw;
    const personnes = client?.personnes ?? [];

    const fullName = (p?: { first_name?: string; last_name?: string }) =>
      p ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || null : null;

    const emails = personnes
      .map((p) => p.email)
      .filter((e): e is string => Boolean(e));

    return {
      id: row.id as string,
      stage: (row.pipeline_stage as string) ?? "02_compliance",
      representant: fullName(personnes[0]),
      conjoint: fullName(personnes[1]),
      emails,
      entryDate: (row.pipeline_entry_date as string) ?? null,
      revenue: (row.total_revenue_cached as string) ?? notes.revenue ?? null,
      notes,
    };
  } catch {
    return null;
  }
}

/** Honoraires formatés « 3 900 € TTC » à partir du brut, fallback générique. */
function fmtHonoraires(revenue: string | null): string {
  if (!revenue) return "honoraires à définir";
  const n = Number(String(revenue).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n) || n === 0) return `${revenue} € TTC`;
  return `${n.toLocaleString("fr-FR")} € TTC`;
}

/* --- Stepper 6 étapes ----------------------------------------------------- */

const STEPPER = [
  { num: 1, label: ["Prospects", "actifs"] },
  { num: 2, label: ["Conformité", "en cours"] },
  { num: 3, label: ["Collecte de", "documents"] },
  { num: 4, label: ["Étude en", "cours"] },
  { num: 5, label: ["Études", "restituées"] },
  { num: 6, label: ["Clients", "en suivi"] },
] as const;

function Stepper({ stageIndex }: { stageIndex: number }) {
  return (
    <div className="mb-[18px] flex items-center gap-1.5 overflow-x-auto rounded-md border border-[var(--navy-100)] bg-white px-4 py-3">
      {STEPPER.map((s) => {
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

/* --- Bandeau paiement ----------------------------------------------------- */

const PAY_PILL_TONE: Record<PayState, string> = {
  attente: "bg-[var(--gold-100)] text-[var(--gold-deep)]",
  partiel: "bg-[var(--gold-200)] text-[var(--medium-400)]",
  recu: "bg-[var(--green-bg)] text-[var(--green-text)]",
  offert: "bg-[var(--green-bg)] text-[var(--green-text)]",
  annule: "bg-[var(--navy-100)] text-[var(--navy-300)]",
};

function PaymentBanner({ honoraires, payState }: { honoraires: string; payState: PayState }) {
  return (
    <div className="mb-[18px] flex items-center gap-3.5 rounded-md border border-[var(--navy-100)] border-l-[3px] border-l-[var(--gold)] bg-white px-[18px] py-3.5">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--gold-100)] text-[var(--gold-deep)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-semibold text-[var(--navy)]">
          Règlement des honoraires · <strong>{honoraires}</strong> ·{" "}
          <span className="font-bold text-[var(--gold-deep)]">{PAY_LABELS[payState].toLowerCase()}</span>
        </div>
        <div className="mt-0.5 text-[11px] text-[var(--navy-300)]">
          Synchronisation avec la banque du cabinet active · le statut sera actualisé
          automatiquement à réception du virement
        </div>
      </div>
      <span
        className={`flex-shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.04em] ${PAY_PILL_TONE[payState]}`}
      >
        {PAY_LABELS[payState]}
      </span>
    </div>
  );
}

/* --- Card pièce (DER / KYC / LM) ------------------------------------------ */

const DOC_ICON_TONE: Record<"navy" | "gold" | "gold-tint", string> = {
  navy: "bg-[var(--navy-100)] text-[var(--navy)]",
  gold: "bg-[var(--gold-100)] text-[var(--gold-deep)]",
  "gold-tint": "bg-[var(--gold-100)] text-[var(--gold-deep)]",
};

const TRACKER_DOT: Record<TrackerState, string> = {
  done: "bg-[var(--gold)]",
  current: "border-2 border-[var(--gold)] bg-white",
  todo: "border-2 border-[var(--navy-100)] bg-white",
};

function DocCard({ row, dossierId, honoraires }: { row: ConformiteRow; dossierId: string; honoraires: string }) {
  const cfg = docCardConfig[row.type as CardType];
  const steps = trackerStepsFor(row, fmtDate);
  const isLM = row.type === "lettre_mission";
  const subtitle = cfg.subtitle.replace("{honoraires}", honoraires);
  const canSend = row.status === "a_faire";

  return (
    <div className="rounded-md border border-[var(--navy-100)] border-l-[3px] border-l-[var(--gold)] bg-white p-4">
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md ${DOC_ICON_TONE[cfg.iconTone]}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-bold text-[var(--navy)]">{cfg.title}</div>
          <div className="mt-0.5 text-[11px] leading-snug text-[var(--navy-300)]">{subtitle}</div>
        </div>
      </div>

      <div className="mt-2">
        <span className="rounded-full bg-[var(--gold)]/15 px-2.5 py-1 text-[10px] font-bold text-[var(--gold-deep)]">
          {cfg.readyPill}
        </span>
      </div>

      {/* Tracker */}
      <div
        className="mt-3.5 grid gap-1 border-t border-[var(--navy-100)] pt-3.5"
        style={{ gridTemplateColumns: `repeat(${isLM ? 4 : 3}, 1fr)` }}
      >
        {steps.map((step) => (
          <div key={step.label} className="flex flex-col items-center text-center">
            <div className={`mb-1.5 h-3 w-3 rounded-full ${TRACKER_DOT[step.state]}`} />
            <div
              className={`text-[9.5px] font-semibold leading-tight ${step.state === "todo" ? "text-[var(--navy-300)]" : "text-[var(--navy)]"}`}
            >
              {step.label}
            </div>
            <div className="mt-0.5 text-[9px] text-[var(--navy-300)]">{step.date ?? "—"}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-3.5 grid grid-cols-3 gap-1.5">
        <button
          type="button"
          className="flex items-center justify-center gap-1 rounded-md border border-[var(--navy-100)] bg-white px-2 py-1.5 text-[10.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
        >
          Modifier
        </button>
        {canSend ? (
          <form action={advanceConformiteItem.bind(null, dossierId, row.type)}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1 rounded-md bg-[var(--gold)] px-2 py-1.5 text-[10.5px] font-bold text-white hover:brightness-110"
            >
              Envoyer
            </button>
          </form>
        ) : (
          <span className="flex items-center justify-center rounded-md bg-[var(--ivory-deep)] px-2 py-1.5 text-[10.5px] font-semibold text-[var(--navy-300)]">
            Envoyé
          </span>
        )}
        <button
          type="button"
          className="flex items-center justify-center gap-1 rounded-md border border-[var(--navy-100)] bg-white px-2 py-1.5 text-[10.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
        >
          {isLM ? "Signer" : "Consulter"}
        </button>
      </div>
    </div>
  );
}

/* --- Documents témoins pédagogiques --------------------------------------- */

function TemoinsCard() {
  const temoins = [
    {
      title: "Étude patrimoniale témoin",
      desc: "84 pages · format PRIVEOS éditorial · audit complet + diagnostic + préconisations",
    },
    {
      title: "Synthèse exécutive témoin",
      desc: "12 pages · plan d'action + gains chiffrés + chronologie de mise en œuvre",
    },
  ];
  return (
    <div className="mb-[18px] rounded-md border border-[var(--navy-100)] bg-white">
      <div className="border-b border-[var(--navy-100)] px-6 py-4 text-[13px] font-bold text-[var(--navy)]">
        Documents pédagogiques joints (lecture seule pour le client)
      </div>
      <div className="px-[22px] py-4">
        <p className="mb-3 text-[11px] leading-relaxed text-[var(--navy-300)]">
          Ces 2 documents sont joints au pack envoyé au client · ils permettent de{" "}
          <strong>mesurer concrètement les livrables</strong> qu&apos;il recevra à l&apos;issue de
          l&apos;étude patrimoniale. Le contenu est anonymisé.
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {temoins.map((t) => (
            <div
              key={t.title}
              className="flex items-start gap-3 rounded-md border border-[var(--navy-100)] bg-[var(--ivory)] p-3"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-white text-[var(--navy-300)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-semibold text-[var(--navy)]">{t.title}</div>
                <div className="mt-0.5 text-[11px] text-[var(--navy-300)]">{t.desc}</div>
                <span className="mt-1.5 inline-block rounded-sm bg-[var(--navy-100)] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  Anonymisée
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --- Conditions étape 03 -------------------------------------------------- */

const COND_PILL_TONE: Record<Stage03Condition["pillTone"], string> = {
  neutral: "bg-[var(--ivory-deep)] text-[var(--navy-300)]",
  success: "bg-[var(--green-bg)] text-[var(--green-text)]",
  "light-blue": "bg-[var(--light-blue)] text-[var(--navy)]",
  pay: "bg-[var(--gold-100)] text-[var(--gold-deep)]",
};

function ConditionsCard({
  conditions,
  filled,
  total,
}: {
  conditions: Stage03Condition[];
  filled: number;
  total: number;
}) {
  return (
    <div className="mb-[18px] rounded-md border border-[var(--navy-100)] bg-white p-[22px]">
      <div className="text-[14px] font-bold text-[var(--navy)]">
        Conditions de passage à l&apos;étape 03 · Collecte de documents
      </div>
      <div className="mt-1 text-[11.5px] text-[var(--navy-300)]">
        {filled} condition{filled > 1 ? "s" : ""} sur {total} remplie{filled > 1 ? "s" : ""} · le
        passage à l&apos;étape 03 ouvre l&apos;espace sécurisé client.
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {conditions.map((c) => (
          <div
            key={c.label}
            className="flex items-center gap-3 rounded-md border border-[var(--navy-100)] px-3.5 py-2.5"
          >
            <div
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[13px] ${
                c.state === "ok"
                  ? "bg-[var(--green-bg)] text-[var(--green-text)]"
                  : c.state === "wait"
                    ? "bg-[var(--gold-100)]"
                    : "bg-[var(--ivory-deep)] text-[var(--navy-300)]"
              }`}
            >
              {c.state === "ok" ? "✓" : c.state === "wait" ? "⏳" : "○"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-semibold text-[var(--navy)]">{c.label}</div>
              <div className="text-[11px] text-[var(--navy-300)]">{c.meta}</div>
            </div>
            <span
              className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] ${COND_PILL_TONE[c.pillTone]}`}
            >
              {c.pill}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- Page ----------------------------------------------------------------- */

export default async function ConformitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [header, items] = await Promise.all([fetchHeader(id), loadConformiteItems(id)]);
  const rows = mergeChecklist(items);
  const cardRows = rows.filter((r) => CARD_TYPES.includes(r.type as CardType));

  const stage = header?.stage ?? "02_compliance";
  const stageIndex = Number(stage.slice(0, 2)) || 2;

  const honoraires = fmtHonoraires(header?.revenue ?? null);
  const payState: PayState = header?.notes.payment_state ?? "attente";

  // Couple « X & Y » dérivé des personnes (représentant + conjoint).
  const coupleNames = [header?.representant, header?.conjoint].filter(Boolean).join(" & ");
  const heroTitle = coupleNames
    ? `${coupleNames} · génération des livrables réglementaires`
    : "Génération des livrables réglementaires";

  const heroSub = [
    header?.notes.regime ? `Régime ${header.notes.regime}` : null,
    header?.notes.enfants ? `${header.notes.enfants} enfants à charge` : null,
    header?.notes.parts_fiscales ? `${header.notes.parts_fiscales} parts fiscales` : null,
    `honoraires ${honoraires}`,
    "garantie de résultat · délai 5 semaines après signature des 3 documents et règlement intégral",
  ]
    .filter(Boolean)
    .join(" · ");

  const eyebrow = `Étape ${String(stageIndex).padStart(2, "0")} · ${STAGE_LABELS[stage] ?? "Conformité"} en cours · Dossier ${id.slice(0, 8).toUpperCase()} · entrée ${fmtDate(header?.entryDate ?? null)}`;

  const { conditions, filled, total } = conditionsForStage03(rows, honoraires, payState);
  const allMet = filled === total;

  const emails =
    header?.emails && header.emails.length > 0
      ? header.emails
      : ["client@email.fr"];

  // Pièces du pack : 3 conformité + facture + 2 témoins (cohérent v40).
  const packPieces: PackPiece[] = [
    {
      id: "der",
      title: "Document d'Entrée en Relation (DER)",
      meta: "PDF · à signer par le client",
      tagLabel: "Contractuel",
      tagTone: "navy",
      type: "der",
    },
    {
      id: "kyc",
      title: "DCI Complet + Questionnaire de qualification (KYC)",
      meta: "PDF · enveloppe réglementaire · à signer par le client",
      tagLabel: "Contractuel",
      tagTone: "gold",
      type: "kyc",
    },
    {
      id: "lettre_mission",
      title: "Lettre de mission",
      meta: `PDF · ${honoraires} · signée par les 2 parties`,
      tagLabel: "Contractuel",
      tagTone: "gold",
      type: "lettre_mission",
    },
    {
      id: "facture",
      title: "Facture des honoraires",
      meta: `PDF · FACT-${id.slice(0, 8).toUpperCase()} · ${honoraires}`,
      tagLabel: "Facturation",
      tagTone: "green",
      type: null,
    },
    {
      id: "etude_temoin",
      title: "Étude patrimoniale témoin",
      meta: "PDF · 84 pages · anonymisée · aperçu du livrable final",
      tagLabel: "Pédagogique",
      tagTone: "neutral",
      type: null,
    },
    {
      id: "synthese_temoin",
      title: "Synthèse exécutive témoin",
      meta: "PDF · 12 pages · anonymisée · plan d'action + gains chiffrés",
      tagLabel: "Pédagogique",
      tagTone: "neutral",
      type: null,
    },
  ];

  const mailSubject =
    "PRIVEOS · Éléments de contractualisation de notre accompagnement patrimonial";
  const mailBody = `
    <p>Madame, Monsieur,</p>
    <p>Faisant suite à notre échange, je vous fais parvenir les éléments permettant de contractualiser notre relation. Vous trouverez en pièces jointes :</p>
    <ul>
      <li>le <strong>document d'entrée en relation</strong> (DER) ;</li>
      <li>votre <strong>document de collecte d'informations complet</strong> ainsi que le <strong>questionnaire de qualification</strong> ;</li>
      <li>la <strong>lettre de mission</strong> reprenant nos honoraires ;</li>
      <li>la <strong>facture</strong> adossée à nos honoraires ;</li>
      <li>et deux éléments pour mesurer le livrable : l'<strong>étude patrimoniale témoin</strong> et la <strong>synthèse exécutive témoin</strong>.</li>
    </ul>
    <p><strong>La prochaine étape pour vous</strong> consiste à signer électroniquement les trois documents contractuels (DER, KYC et lettre de mission) et à régler les honoraires. Dès réception, nous ouvrirons votre espace sécurisé pour la collecte des pièces et lancerons la réalisation de votre étude patrimoniale (délai 5 semaines).</p>
    <p>Je reste à votre entière disposition.<br>Bien à vous,<br><strong>Luc THILLIEZ</strong> · Président associé du cabinet PRIVEOS</p>
  `;

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
          eyebrow={eyebrow}
          title={heroTitle}
          description={heroSub}
          actions={
            <>
              <Link
                href={`/dossiers/${id}`}
                className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
              >
                ← Retour conformité
              </Link>
              <form action={relancerClient.bind(null, id)}>
                <button
                  type="submit"
                  className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
                >
                  Relancer les clients
                </button>
              </form>
            </>
          }
        />

        <Stepper stageIndex={stageIndex} />

        <PaymentBanner honoraires={honoraires} payState={payState} />

        {/* 3 cards DER · KYC · LM */}
        <div className="mb-[18px] grid grid-cols-1 gap-3.5 lg:grid-cols-3">
          {cardRows.map((row) => (
            <DocCard key={row.type} row={row} dossierId={id} honoraires={honoraires} />
          ))}
        </div>

        <PackSend
          dossierId={id}
          emails={emails}
          pieces={packPieces}
          subject={mailSubject}
          bodyHtml={mailBody}
        />

        <TemoinsCard />

        <ConditionsCard conditions={conditions} filled={filled} total={total} />

        {/* Bandeau d'action · ouverture étape 03 */}
        <div className="flex items-center justify-between gap-4 rounded-md border border-[var(--navy-100)] bg-white px-[22px] py-4">
          <div className="text-[11.5px] leading-relaxed text-[var(--navy)]">
            <strong>
              {filled}/{total} conditions remplies
            </strong>{" "}
            pour ouvrir l&apos;espace sécurisé (étape 03 · Collecte de documents).
            <br />
            <span className="text-[var(--navy-300)]">
              L&apos;étape 03 ne s&apos;ouvre qu&apos;une fois les 3 documents signés (DER · KYC ·
              LM) <strong>et</strong> les {honoraires} reçus · délai client 30 jours pour transmettre
              les documents patrimoniaux.
            </span>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2.5">
            <form action={relancerClient.bind(null, id)}>
              <button
                type="submit"
                className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
              >
                Relancer le client
              </button>
            </form>
            {allMet ? (
              <form action={moveDossierStage.bind(null, id, "next")}>
                <button
                  type="submit"
                  className="rounded-md bg-[var(--navy)] px-4 py-2 text-[11.5px] font-bold text-white hover:brightness-125"
                >
                  Ouvrir l&apos;espace sécurisé (étape 03) →
                </button>
              </form>
            ) : (
              <button
                type="button"
                disabled
                title="Les 4 conditions doivent être remplies (3 docs signés + règlement) pour ouvrir l'étape 03."
                className="cursor-not-allowed rounded-md bg-[var(--navy)] px-4 py-2 text-[11.5px] font-bold text-white opacity-50"
              >
                Ouvrir l&apos;espace sécurisé (étape 03) →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
