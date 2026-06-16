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

/* ------------------------------------------------------------------------- *
 * Dérivation v40 — page `#page-ing-fiche-conformite-joubert`
 *
 * Le pack contractuel v40 = DER + KYC + Lettre de mission. Le mandat reste
 * en base (CHECKLIST_CONFORMITE, taux global) mais n'est PAS rendu en card.
 * ------------------------------------------------------------------------- */

/** Les 3 pièces affichées en card v40 (le mandat est exclu de la grille). */
export const CARD_TYPES = ["der", "kyc", "lettre_mission"] as const;

export type CardType = (typeof CARD_TYPES)[number];

/** État d'un jalon de tracker. */
export type TrackerState = "done" | "current" | "todo";

export type TrackerStep = {
  label: string;
  state: TrackerState;
  /** Date affichée sous le jalon (déjà formatée), ou null. */
  date: string | null;
};

/**
 * Configuration figée des cards (icône / sous-titre / libellés de jalons),
 * extraite du wireframe v40. La lettre de mission a 4 jalons (le 4e =
 * contreseing ingénieur, statut 'valide').
 */
export const docCardConfig: Record<
  CardType,
  {
    title: string;
    subtitle: string;
    /** Tonalité de l'icône : navy / gold / gold-tint. */
    iconTone: "navy" | "gold" | "gold-tint";
    /** Libellé du pill « prêt à l'envoi » (genre accordé). */
    readyPill: string;
    /** Libellés des jalons préparé / signé client (+ ingénieur pour LM). */
    prepared: string;
    signedClient: string;
  }
> = {
  der: {
    title: "DER",
    subtitle: "Document d'Entrée en Relation · 3 champs modifiables (personnes · date · lieu)",
    iconTone: "navy",
    readyPill: "● Prêt à l'envoi",
    prepared: "Préparé",
    signedClient: "Signé client",
  },
  kyc: {
    title: "KYC",
    subtitle: "Enveloppe = DCI Complet + Questionnaire de qualification · signé par le client",
    iconTone: "gold",
    readyPill: "● Prêt à l'envoi",
    prepared: "Vérifié",
    signedClient: "Signé client",
  },
  lettre_mission: {
    title: "Lettre de mission",
    subtitle: "Honoraires {honoraires} · signée par les 2 parties",
    iconTone: "gold-tint",
    readyPill: "● Prête à l'envoi",
    prepared: "Préparée",
    signedClient: "Signée client",
  },
};

/**
 * Jalons du tracker d'une pièce, dérivés de `row.status`.
 *  - a_faire → préparé (done) + à envoyer (current)
 *  - envoye  → à envoyer (done) + signé client (current)
 *  - signe   → signé client (done) ; pour la LM, contreseing ingénieur (current)
 *  - valide  → tous done
 * La lettre de mission ajoute un 4e jalon « Signée ingénieur » = statut 'valide'.
 */
export function trackerStepsFor(
  row: ConformiteRow,
  fmtDate: (iso: string | null) => string,
): TrackerStep[] {
  const cfg = docCardConfig[row.type as CardType];
  const isLM = row.type === "lettre_mission";
  const s = row.status;

  const preparedDate = row.itemId ? fmtDate(row.sent_at ?? row.signed_at ?? row.validated_at) : null;

  const stepPrepared: TrackerStep = {
    label: cfg.prepared,
    state: "done",
    date: preparedDate,
  };

  const sentState: TrackerState = s === "a_faire" ? "current" : "done";
  const stepSent: TrackerStep = {
    label: "À envoyer",
    state: sentState,
    date: s === "a_faire" ? "attente" : fmtDate(row.sent_at),
  };

  // Signé client : current dès l'envoi, done une fois signé/validé.
  const signedClientState: TrackerState =
    s === "signe" || s === "valide" ? "done" : s === "envoye" ? "current" : "todo";
  const stepSignedClient: TrackerStep = {
    label: cfg.signedClient,
    state: signedClientState,
    date: s === "signe" || s === "valide" ? fmtDate(row.signed_at) : "—",
  };

  if (!isLM) return [stepPrepared, stepSent, stepSignedClient];

  // Lettre de mission : 4e jalon = contreseing ingénieur (statut 'valide').
  const signedEngState: TrackerState = s === "valide" ? "done" : s === "signe" ? "current" : "todo";
  const stepSignedEngineer: TrackerStep = {
    label: "Signée ingénieur",
    state: signedEngState,
    date: s === "valide" ? fmtDate(row.validated_at) : "—",
  };
  return [stepPrepared, stepSent, stepSignedClient, stepSignedEngineer];
}

/** Tonalité de la pastille de paiement (5 états du wireframe v40). */
export type PayState = "attente" | "partiel" | "recu" | "offert" | "annule";

export const PAY_LABELS: Record<PayState, string> = {
  attente: "En attente",
  partiel: "Partiel",
  recu: "Reçu",
  offert: "Offert",
  annule: "Annulé",
};

/** Une condition de passage à l'étape 03 (lignes du bloc conditions v40). */
export type Stage03Condition = {
  label: string;
  meta: string;
  /** ok = rempli ; wait = en cours ⏳ ; ko = non générée ○. */
  state: "ok" | "wait" | "ko";
  /** Texte de la pastille de droite. */
  pill: string;
  /** Tonalité de la pastille (light-blue = non générée, pay = paiement). */
  pillTone: "neutral" | "success" | "light-blue" | "pay";
};

/** Une pièce est-elle signée (par le client) ? */
function isSigned(status: ConformiteStatus): boolean {
  return status === "signe" || status === "valide";
}

/**
 * Les 4 conditions de passage à l'étape 03, dérivées des statuts réels +
 * du signal de paiement. Renvoie aussi le compteur N/4.
 */
export function conditionsForStage03(
  rows: ConformiteRow[],
  honoraires: string,
  payState: PayState,
): { conditions: Stage03Condition[]; filled: number; total: number } {
  const byType = new Map(rows.map((r) => [r.type, r]));
  const der = byType.get("der");
  const kyc = byType.get("kyc");
  const lm = byType.get("lettre_mission");

  const derOk = der ? isSigned(der.status) : false;
  const kycOk = kyc ? isSigned(kyc.status) : false;
  // LM « signée par les 2 parties » = contreseing ingénieur = statut 'valide'.
  const lmOk = lm?.status === "valide";
  const lmGenerated = Boolean(lm?.itemId) && lm?.status !== "a_faire";
  const payOk = payState === "recu" || payState === "offert";

  const conditions: Stage03Condition[] = [
    {
      label: "DER daté et signé par le client",
      meta: derOk
        ? "Signé électroniquement · Yousign"
        : "En attente de signature électronique Yousign",
      state: derOk ? "ok" : "wait",
      pill: derOk ? "Signé" : "En attente",
      pillTone: derOk ? "success" : "neutral",
    },
    {
      label: "KYC daté et signé par le client (DCI Complet + Questionnaire de qualification)",
      meta: kycOk
        ? "Signé électroniquement · Yousign"
        : "En attente de consultation et signature électronique",
      state: kycOk ? "ok" : "wait",
      pill: kycOk ? "Signé" : "En attente",
      pillTone: kycOk ? "success" : "neutral",
    },
    {
      label: "Lettre de mission datée et signée par les deux parties",
      meta: lmOk
        ? "Signée par le client et contresignée par l'ingénieur"
        : lmGenerated
          ? "En attente de signature des deux parties"
          : "À finaliser par l'ingénieur (honoraires + champs) puis envoyer pour signature",
      state: lmOk ? "ok" : lmGenerated ? "wait" : "ko",
      pill: lmOk ? "Signée" : lmGenerated ? "En attente" : "Non générée",
      pillTone: lmOk ? "success" : lmGenerated ? "neutral" : "light-blue",
    },
    {
      label: `Règlement des honoraires reçu · ${honoraires}`,
      meta: "Prix total de la mission · virement bancaire attendu · règle PRIVEOS : règlement intégral avant ouverture de l'espace sécurisé (étape 03)",
      state: payOk ? "ok" : "wait",
      pill: PAY_LABELS[payState],
      pillTone: "pay",
    },
  ];

  const filled = conditions.filter((c) => c.state === "ok").length;
  return { conditions, filled, total: conditions.length };
}
