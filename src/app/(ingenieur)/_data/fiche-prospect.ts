/* =========================================================================
 * Données de la fiche prospect détaillée (étape 01 du parcours patrimonial).
 * Portées telles quelles depuis la maquette ingénieur v28
 * (#page-ing-fiche-prospect-aubert, lignes 5908→6142).
 *
 * La maquette ne décrit qu'un seul modèle de fiche (Aubert). Comme la fiche
 * client, toutes les routes /espace-ingenieur/prospects/<slug> retombent sur
 * ce modèle de référence : on garde un mapping minimal par slug pour afficher
 * un libellé honnête tout en rendant le même contenu d'exemple.
 * ========================================================================= */

export type ConditionState = "ok" | "wait" | "ko";

export type Condition = {
  state: ConditionState;
  text: string;
  meta: string;
  /** Pastille de statut à droite (Validé / Planifié) ou bouton d'action (Relancer). */
  badge?: { label: string; tone: "ok" | "info" };
  action?: { label: string };
};

export type IdentityRow = { label: string; value: string };
export type IdentityBlock = { eyebrow: string; rows: IdentityRow[] };

export type DocStatus = "ok" | "wait" | "choice";
export type DocAction = "consulter" | "renvoyer" | "envoyer" | "modifier" | "relancer";

export type ProspectDoc = {
  icon: "file" | "book" | "checklist";
  iconStyle?: "default" | "gold" | "navy";
  title: string;
  meta: string;
  status: { kind: DocStatus; label: string };
  actions: { kind: DocAction; label: string; variant: "view" | "edit" | "primary" }[];
};

export type ProspectRdv = {
  day: string;
  month: string;
  title: string;
  meta: string;
  status: { label: string; tone: "todo" };
};

export type FicheProspect = {
  eyebrow: string;
  heroLead: string;
  heroStrong: string;
  heroSub: string;
  conditions: {
    title: string;
    sub: string;
    rows: Condition[];
  };
  identites: {
    badge: string;
    blocks: IdentityBlock[];
    info: string;
  };
  documents: ProspectDoc[];
  rdvs: ProspectRdv[];
  rappel: string;
  /** Note ingénieur : segments avec emphase (bold) explicite, pas de HTML brut. */
  note: { meta: string; segments: { text: string; strong?: boolean }[] };
  actionBar: {
    info: string;
    infoSub: string;
  };
};

const AUBERT: FicheProspect = {
  eyebrow: "Étape 01 · Prospects actifs · Dossier PR-2026-AUB · contact initial 05/05/2026",
  heroLead: "Jean & Martine ",
  heroStrong: "AUBERT",
  heroSub:
    "Couple · marié sous communauté légale · 58 et 56 ans · Lyon 6e · 2 enfants majeurs · recommandés par M. ROCHE (client en suivi).",
  conditions: {
    title: "Conditions de passage à l'étape 02 · Conformité en cours",
    sub: "1 condition sur 3 remplie · les 2 actions restantes débloquent le passage en conformité.",
    rows: [
      {
        state: "ok",
        text: "DCI Simplifié complété par le client",
        meta: "Reçu le 09/05/2026 · 25 questions renseignées",
        badge: { label: "Validé", tone: "ok" },
      },
      {
        state: "wait",
        text: "Questionnaire de qualification client complété",
        meta: "Envoyé le 05/05 · en attente de complétion · 6 jours sans relance",
        action: { label: "Relancer" },
      },
      {
        state: "ko",
        text: "Entretien initial réalisé (visio enregistrée)",
        meta: "RDV planifié pour le jeudi 14/05/2026 à 11h00 · cabinet Paris 16e",
        badge: { label: "Planifié", tone: "info" },
      },
    ],
  },
  identites: {
    badge: "KYC non finalisé",
    blocks: [
      {
        eyebrow: "Membre principal",
        rows: [
          { label: "Civilité · Prénom · Nom", value: "M. Jean AUBERT" },
          { label: "Date de naissance", value: "22/08/1967 · 58 ans" },
          { label: "E-mail", value: "jean.aubert@email-test.fr" },
          { label: "Téléphone", value: "+33 6 84 21 45 36" },
          { label: "Profession déclarée", value: "Dirigeant TPE · cession prévue 2027" },
        ],
      },
      {
        eyebrow: "Conjointe",
        rows: [
          { label: "Civilité · Prénom · Nom", value: "Mme Martine AUBERT" },
          { label: "Date de naissance", value: "14/03/1969 · 56 ans" },
          { label: "E-mail", value: "martine.aubert@email-test.fr" },
          { label: "Téléphone", value: "+33 6 27 84 91 53" },
          { label: "Profession déclarée", value: "Cadre RH · grande distribution" },
        ],
      },
    ],
    info:
      "ces données sont déclaratives (DCI Simplifié). Les pièces justificatives KYC (CNI, justificatif de domicile, avis d'imposition) seront collectées en étape 02 · Conformité.",
  },
  documents: [
    {
      icon: "file",
      iconStyle: "default",
      title: "DCI Simplifié",
      meta: "Envoyé le 05/05/2026 · complété le 09/05/2026 · 25 questions",
      status: { kind: "ok", label: "✓ Complété" },
      actions: [
        { kind: "consulter", label: "Consulter", variant: "view" },
        { kind: "renvoyer", label: "Renvoyer", variant: "edit" },
      ],
    },
    {
      icon: "book",
      iconStyle: "gold",
      title: "DCI Complet",
      meta: "Au choix de l'ingénieur · à envoyer si collecte patrimoniale détaillée nécessaire · 22 sections",
      status: { kind: "choice", label: "● Au choix" },
      actions: [
        { kind: "envoyer", label: "Envoyer", variant: "primary" },
        { kind: "modifier", label: "Modifier", variant: "edit" },
      ],
    },
    {
      icon: "checklist",
      iconStyle: "navy",
      title: "Questionnaire de qualification client",
      meta: "Envoyé le 05/05/2026 · pas encore ouvert par le client · conformité ANACOFI / MIF II",
      status: { kind: "wait", label: "⏳ En attente" },
      actions: [
        { kind: "consulter", label: "Consulter", variant: "view" },
        { kind: "relancer", label: "Relancer", variant: "primary" },
      ],
    },
  ],
  rdvs: [
    {
      day: "14",
      month: "Mai",
      title: "Entretien initial · 1h",
      meta: "Jeudi 14/05 à 11h00 · cabinet Paris 16e · présentiel",
      status: { label: "⏰ À venir", tone: "todo" },
    },
  ],
  rappel: "e-mail 48h avant + SMS 1h avant.",
  note: {
    meta: "Note du 05/05/2026 · Luc THILLIEZ",
    segments: [
      { text: "Recommandés par M. ROCHE. Jean projette une " },
      { text: "cession d'entreprise en 2027", strong: true },
      {
        text:
          " (TPE familiale, vente probable à un industriel). Couple intéressé par optimisation de la transmission patrimoniale aux 2 enfants et structuration d'une ",
      },
      { text: "SCI familiale", strong: true },
      { text: ". Profil patrimonial estimé à 4-5 M€ (à confirmer en visio)." },
    ],
  },
  actionBar: {
    info: "1/3 conditions remplies",
    infoSub:
      "Compléter le questionnaire de qualification et réaliser l'entretien initial pour débloquer le passage.",
  },
};

/** Slugs reconnus (depuis la liste des prospects). Tous rendent le modèle de référence. */
const KNOWN_SLUGS = ["aubert", "mercier", "joubert"] as const;

export function getFicheProspect(slug: string): FicheProspect {
  // La maquette ne fournit qu'un modèle détaillé exploitable (Aubert) pour
  // cette route générique : on le sert quel que soit le slug, comme la fiche
  // client le fait pour ses propres exemples.
  void KNOWN_SLUGS;
  void slug;
  return AUBERT;
}
