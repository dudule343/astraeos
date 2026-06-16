/**
 * Conformité / KYC — étape 02 du parcours patrimonial.
 *
 * Source de vérité côté code pour :
 *  - le cycle de vie d'une pièce de conformité (statuts) ;
 *  - la checklist réglementaire FIXE attendue sur chaque dossier
 *    (DER, KYC, lettre de mission, mandat), extraite du wireframe ingénieur
 *    (SPRINT S1C · Conformité en cours).
 *
 * La table `conformite_items` (cf. migration 20260616185417_conformite.sql)
 * matérialise l'état réel de chaque pièce ; CHECKLIST_CONFORMITE décrit ce
 * qui DOIT exister. La page de conformité fusionne les deux : pour chaque
 * entrée de la checklist, on affiche la ligne en base si elle existe, sinon
 * un état « à faire » par défaut.
 */

/** Statuts possibles d'une pièce — miroir de l'enum SQL `conformite_item_status`. */
export const CONFORMITE_STATUSES = ["a_faire", "envoye", "signe", "valide"] as const;

export type ConformiteStatus = (typeof CONFORMITE_STATUSES)[number];

/** Clés stables des pièces réglementaires (colonne `type` en base). */
export const CONFORMITE_TYPES = ["der", "kyc", "lettre_mission", "mandat"] as const;

export type ConformiteType = (typeof CONFORMITE_TYPES)[number];

/** Une ligne de la table `conformite_items`. */
export type ConformiteItem = {
  id: string;
  tenant_id: string;
  cabinet_id: string | null;
  dossier_id: string;
  type: string;
  label: string;
  status: ConformiteStatus;
  sent_at: string | null;
  signed_at: string | null;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Définition figée d'une pièce de la checklist réglementaire. */
export type ConformiteChecklistEntry = {
  type: ConformiteType;
  label: string;
  /** Sous-titre explicatif (repris du wireframe). */
  description: string;
  /** Le client signe-t-il cette pièce (Yousign) ? Sinon pièce interne. */
  clientSigne: boolean;
};

/**
 * Checklist réglementaire FIXE — l'ordre fait foi pour l'affichage.
 * Extraite du wireframe : cards DER · KYC · Lettre de mission + mandat de
 * conseil (pièce contractuelle du parcours CIF).
 */
export const CHECKLIST_CONFORMITE: readonly ConformiteChecklistEntry[] = [
  {
    type: "der",
    label: "DER",
    description:
      "Document d'Entrée en Relation — informations réglementaires CIF remises au client.",
    clientSigne: true,
  },
  {
    type: "kyc",
    label: "KYC",
    description:
      "Connaissance client — enveloppe DCI complet + questionnaire de qualification, daté et signé.",
    clientSigne: true,
  },
  {
    type: "lettre_mission",
    label: "Lettre de mission",
    description:
      "Contrat cadre + annexe honoraires — signée par le client puis contresignée par l'ingénieur.",
    clientSigne: true,
  },
  {
    type: "mandat",
    label: "Mandat de conseil",
    description:
      "Mandat habilitant l'ingénieur à émettre des recommandations — signé par le client.",
    clientSigne: true,
  },
] as const;

/** Libellés FR des statuts (badges UI). */
export const STATUS_LABELS: Record<ConformiteStatus, string> = {
  a_faire: "À faire",
  envoye: "Envoyé",
  signe: "Signé",
  valide: "Validé",
};

/** Sémantique de couleur par statut, alignée sur la charte du wireframe. */
export const STATUS_TONE: Record<ConformiteStatus, "neutral" | "pending" | "info" | "success"> = {
  a_faire: "neutral", // gris navy-300
  envoye: "pending", // gold
  signe: "info", // bleu/navy
  valide: "success", // vert
};

/** Ordre du cycle de vie : sert à calculer l'avancement et le « next ». */
const STATUS_ORDER: ConformiteStatus[] = ["a_faire", "envoye", "signe", "valide"];

/** Statut suivant dans le cycle, ou null si déjà au bout. */
export function nextStatus(status: ConformiteStatus): ConformiteStatus | null {
  const i = STATUS_ORDER.indexOf(status);
  if (i < 0 || i >= STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[i + 1];
}

/** Libellé du bouton qui fait avancer la pièce (null si déjà validée). */
export function nextActionLabel(status: ConformiteStatus): string | null {
  switch (status) {
    case "a_faire":
      return "Envoyer";
    case "envoye":
      return "Marquer signé";
    case "signe":
      return "Valider";
    default:
      return null;
  }
}

/** Colonne horodatée à renseigner quand on passe à `status`. */
export function timestampColumnFor(
  status: ConformiteStatus,
): "sent_at" | "signed_at" | "validated_at" | null {
  switch (status) {
    case "envoye":
      return "sent_at";
    case "signe":
      return "signed_at";
    case "valide":
      return "validated_at";
    default:
      return null;
  }
}

/** Libellé d'une pièce à partir de sa clé (fallback : la clé brute). */
export function labelForType(type: string): string {
  return CHECKLIST_CONFORMITE.find((e) => e.type === type)?.label ?? type;
}

/**
 * Fusionne la checklist réglementaire fixe avec les lignes en base.
 * Retourne une vue d'affichage stable (toujours toutes les pièces, dans
 * l'ordre de la checklist), que la table existe ou non en prod.
 */
export type ConformiteRow = ConformiteChecklistEntry & {
  status: ConformiteStatus;
  sent_at: string | null;
  signed_at: string | null;
  validated_at: string | null;
  /** id en base si la pièce a déjà été matérialisée, sinon null. */
  itemId: string | null;
};

export function mergeChecklist(items: ConformiteItem[]): ConformiteRow[] {
  const byType = new Map(items.map((it) => [it.type, it]));
  return CHECKLIST_CONFORMITE.map((entry) => {
    const it = byType.get(entry.type);
    return {
      ...entry,
      status: it?.status ?? "a_faire",
      sent_at: it?.sent_at ?? null,
      signed_at: it?.signed_at ?? null,
      validated_at: it?.validated_at ?? null,
      itemId: it?.id ?? null,
    };
  });
}

/** Taux de conformité (pièces validées / total checklist), 0–100. */
export function completionRate(rows: ConformiteRow[]): number {
  if (rows.length === 0) return 0;
  const done = rows.filter((r) => r.status === "valide").length;
  return Math.round((done / rows.length) * 100);
}
