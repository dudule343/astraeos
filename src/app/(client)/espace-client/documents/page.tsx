import { fetchClientDossier, fetchClientDocuments } from "../../_data/client";
import { DocumentsManager, type PieceDef } from "./DocumentsManager";

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
const PIECE_DEFS: PieceDef[] = [
  { documentType: "avis_imposition", label: "Avis d'imposition", hint: "Le plus récent (revenus, parts fiscales, IFI le cas échéant)." },
  { documentType: "fiche_paie", label: "Bulletins de salaire", hint: "Vos trois derniers bulletins, ou bilan si profession indépendante." },
  { documentType: "livret_famille", label: "Livret de famille", hint: "Situation familiale et personnes à charge." },
  { documentType: "k_bis", label: "Extrait Kbis", hint: "Si vous détenez une société (extrait de moins de 3 mois)." },
  { documentType: "kyc", label: "Pièce d'identité", hint: "Carte d'identité ou passeport en cours de validité (KYC)." },
  { documentType: "autre", label: "Autre pièce utile", hint: "Tout document éclairant votre situation (relevés, baux, contrats…)." },
];

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

  return (
    <>
      <Header />
      <DocumentsManager dossierId={dossier.id} initialDocuments={documents} pieceDefs={PIECE_DEFS} />
    </>
  );
}
