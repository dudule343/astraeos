import {
  fetchClientDossier,
  fetchClientDocuments,
  fmtDate,
  fmtFileSize,
  type ClientDocument,
} from "../../_data/client";
import { DocumentsClient, type ExpectedPiece } from "./DocumentsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Mes documents",
};

// -------------------------------------------------------------------------
// Checklist des pièces usuelles attendues sur un dossier patrimonial.
// On s'aligne sur l'ENUM réel document_type (db/migrations/0001) — pas de
// donnée fictive : ce sont les natures de pièces que le système connaît.
// On exclut les types générés par le cabinet (étude, synthèse, lettre de
// mission) qui ne sont pas à fournir par le client.
// -------------------------------------------------------------------------
const PIECE_DEFS: { documentType: string; label: string; hint: string }[] = [
  {
    documentType: "avis_imposition",
    label: "Avis d'imposition",
    hint: "Le plus récent (revenus, parts fiscales, IFI le cas échéant).",
  },
  {
    documentType: "fiche_paie",
    label: "Bulletins de salaire",
    hint: "Vos trois derniers bulletins, ou bilan si profession indépendante.",
  },
  {
    documentType: "livret_famille",
    label: "Livret de famille",
    hint: "Situation familiale et personnes à charge.",
  },
  {
    documentType: "k_bis",
    label: "Extrait Kbis",
    hint: "Si vous détenez une société (extrait de moins de 3 mois).",
  },
  {
    documentType: "kyc",
    label: "Pièce d'identité",
    hint: "Carte d'identité ou passeport en cours de validité (KYC).",
  },
  {
    documentType: "autre",
    label: "Autre pièce utile",
    hint: "Tout document éclairant votre situation (relevés, baux, contrats…).",
  },
];

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  pending_validation: {
    label: "En attente de validation",
    bg: "var(--orange-bg)",
    text: "var(--orange-text)",
  },
  validated: { label: "Validé", bg: "var(--green-bg)", text: "var(--green-text)" },
  rejected: { label: "À reprendre", bg: "var(--red-bg)", text: "var(--red-text)" },
  archived: { label: "Archivé", bg: "var(--navy-100)", text: "var(--navy-300)" },
};

function statusMeta(status: string) {
  return (
    STATUS_META[status] ?? {
      label: status,
      bg: "var(--navy-100)",
      text: "var(--navy-300)",
    }
  );
}

function Header() {
  return (
    <div className="mb-8">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
        Étape 3 · Mes documents
      </div>
      <h1
        className="mb-2 text-[28px] font-semibold leading-tight tracking-tight text-[var(--navy)]"
        style={{ fontFamily: "var(--serif)" }}
      >
        Mes documents
      </h1>
      <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--navy-300)]">
        Déposez les pièces nécessaires à votre étude patrimoniale et suivez leur état.
        Chaque document est traité de façon confidentielle par votre conseiller.
      </p>
    </div>
  );
}

export default async function DocumentsPage() {
  const dossier = await fetchClientDossier();
  const documents = await fetchClientDocuments();

  // État vide honnête : pas de dossier résolu (pas de session client, pas de
  // personne reliée, ou pas de dossier). On n'invente rien.
  if (!dossier) {
    return (
      <>
        <Header />
        <div className="rounded-lg border border-[var(--navy-100)] bg-white p-8 text-center">
          <p className="text-[13px] leading-relaxed text-[var(--navy-300)]">
            Aucun dossier n&apos;est encore rattaché à votre espace. Dès que votre
            conseiller aura ouvert votre dossier, vous pourrez déposer vos pièces ici.
          </p>
        </div>
      </>
    );
  }

  // Types déjà couverts par au moins un document déposé (toutes catégories).
  const fulfilledTypes = new Set(documents.map((d) => d.documentType));

  const pieces: ExpectedPiece[] = PIECE_DEFS.map((p) => ({
    documentType: p.documentType,
    label: p.label,
    hint: p.hint,
    // "autre" n'est jamais "complet" : c'est un fourre-tout volontaire.
    fulfilled: p.documentType !== "autre" && fulfilledTypes.has(p.documentType),
  }));

  const requiredPieces = pieces.filter((p) => p.documentType !== "autre");
  const providedCount = requiredPieces.filter((p) => p.fulfilled).length;

  return (
    <>
      <Header />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Colonne gauche : checklist + dépôt */}
        <div className="space-y-6 lg:col-span-3">
          <section>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                  Pièces à fournir
                </div>
                <div className="text-[15px] font-semibold text-[var(--navy)]">
                  Checklist de votre dossier
                </div>
              </div>
              <div className="text-[12px] font-semibold text-[var(--navy-300)]">
                {providedCount}/{requiredPieces.length} fournies
              </div>
            </div>

            <ul className="divide-y divide-[var(--navy-100)] rounded-lg border border-[var(--navy-100)] bg-white">
              {requiredPieces.map((p) => (
                <li key={p.documentType} className="flex items-start gap-3 px-4 py-3">
                  <span
                    aria-hidden
                    className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      p.fulfilled
                        ? "bg-[var(--green-bg)] text-[var(--green-text)]"
                        : "border border-[var(--navy-100)] text-[var(--navy-200)]"
                    }`}
                  >
                    {p.fulfilled ? "✓" : ""}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[var(--navy)]">
                      {p.label}
                    </div>
                    <p className="text-[12px] leading-relaxed text-[var(--navy-300)]">
                      {p.hint}
                    </p>
                  </div>
                  <span
                    className="ml-auto flex-shrink-0 self-center text-[11px] font-semibold"
                    style={{
                      color: p.fulfilled ? "var(--green-text)" : "var(--navy-300)",
                    }}
                  >
                    {p.fulfilled ? "Reçu" : "Attendu"}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <DocumentsClient dossierId={dossier.id} pieces={pieces} />
          </section>
        </div>

        {/* Colonne droite : documents déposés + statut */}
        <div className="lg:col-span-2">
          <div className="mb-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Documents déposés
            </div>
            <div className="text-[15px] font-semibold text-[var(--navy)]">
              {documents.length > 0
                ? `${documents.length} document${documents.length > 1 ? "s" : ""}`
                : "Aucun document"}
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="rounded-lg border border-[var(--navy-100)] bg-white p-6 text-center">
              <p className="text-[12.5px] leading-relaxed text-[var(--navy-300)]">
                Vous n&apos;avez encore déposé aucune pièce. Utilisez la zone de dépôt pour
                ajouter vos documents : ils apparaîtront ici avec leur statut.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {documents.map((d: ClientDocument) => {
                const meta = statusMeta(d.status);
                return (
                  <li
                    key={d.id}
                    className="rounded-lg border border-[var(--navy-100)] bg-white p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-[var(--navy)]">
                          {d.filename}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[var(--navy-300)]">
                          {fmtDate(d.createdAt)} · {fmtFileSize(d.fileSizeBytes)}
                        </div>
                      </div>
                      <span
                        className="flex-shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em]"
                        style={{ background: meta.bg, color: meta.text }}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
