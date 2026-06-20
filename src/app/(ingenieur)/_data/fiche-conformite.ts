/**
 * Données de l'écran "Fiche conformité" (étape 02) — RÉPLIQUE EXACTE de la
 * maquette 030 v28 (`#page-ing-fiche-conformite-joubert`, lignes 6632→6976,
 * + la modale DER `#modal-der`, lignes 20642→20775).
 *
 * Source unique de la page. Modèle de référence = dossier Joubert (Camille
 * JOUBERT & Yannick BERTHOUX). En production chaque dossier conformité a sa
 * propre fiche ; ici toutes les routes [id] rendent ce modèle, comme la fiche
 * client de la maquette.
 *
 * Ingénieur connecté = Julien VASSEUR. Dirigeant-praticien du dossier = Luc
 * THILLIEZ. Honoraires 3 900 € TTC. Tous les libellés, dates, statuts et
 * montants sont ceux de la maquette.
 */

import type { ConformitePdfInput } from "@/lib/conformite-pdf";

/* ── En-tête ──────────────────────────────────────────────────────────── */

export const HERO = {
  eyebrow:
    "Étape 02 · Conformité en cours · Dossier CF-2026-JOU · entrée 11/05/2026",
  /** Le titre comporte 2 noms en gras, on le rend en JSX dans la page. */
  client1Lead: "Camille ",
  client1Strong: "JOUBERT",
  client2Lead: " & Yannick ",
  client2Strong: "BERTHOUX",
  titleTail: " · génération des livrables réglementaires",
  sub: {
    lead:
      "Couple PACS · régime séparation · 3 enfants à charge · 4 parts fiscales · honoraires ",
    honoraires: "3 900 € TTC",
    tail:
      " · garantie de résultat · délai 5 semaines après signature des 3 documents et règlement intégral des honoraires.",
  },
};

/* ── Stepper parcours patrimonial (6 étapes) ──────────────────────────── */

export type ParcoursStep = {
  num: string;
  /** label sur 2 lignes (séparées par \n) */
  label: string;
  state: "done" | "active" | "todo";
};

export const PARCOURS_STEPS: ParcoursStep[] = [
  { num: "1", label: "Prospects\nactifs", state: "done" },
  { num: "2", label: "Conformité\nen cours", state: "active" },
  { num: "3", label: "Collecte de\ndocuments", state: "todo" },
  { num: "4", label: "Étude en\ncours", state: "todo" },
  { num: "5", label: "Études\nrestituées", state: "todo" },
  { num: "6", label: "Clients\nen suivi", state: "todo" },
];

export const PARCOURS_BADGE = "Étape 02/06";

/* ── Bandeau paiement honoraires (lecture seule) ──────────────────────── */

export const PAY_BANNER = {
  honoraires: "3 900 € TTC",
  statusInline: "en attente",
  meta:
    "Synchronisation avec la banque du cabinet active · dernière synchro 24/05/2026 à 17:42 · le statut sera actualisé automatiquement à réception du virement",
  pill: "En attente",
};

/* ── 3 cartes documents (DER · KYC · LM) ──────────────────────────────── */

export type DocCardKey = "der" | "kyc" | "lm";

export type TrackerStep = {
  label: string;
  date: string;
  state: "done" | "current" | "todo";
};

export type DocCard = {
  key: DocCardKey;
  icon: "navy" | "gold" | "doc";
  title: string;
  subtitle: string;
  statusPill: string;
  tracker: TrackerStep[];
  /** libellé du 3e bouton (Consulter / Signer) */
  viewLabel: string;
};

export const DOC_CARDS: DocCard[] = [
  {
    key: "der",
    icon: "navy",
    title: "DER",
    subtitle:
      "Document d'Entrée en Relation · 3 champs modifiables (personnes · date · lieu)",
    statusPill: "● Prêt à l'envoi",
    tracker: [
      { label: "Préparé", date: "11/05/2026", state: "done" },
      { label: "À envoyer", date: "attente", state: "current" },
      { label: "Signé client", date: "—", state: "todo" },
    ],
    viewLabel: "Consulter",
  },
  {
    key: "kyc",
    icon: "gold",
    title: "KYC",
    subtitle:
      "Enveloppe = DCI Complet + Questionnaire de qualification · signé par le client",
    statusPill: "● Prêt à l'envoi",
    tracker: [
      { label: "Vérifié", date: "11/05/2026", state: "done" },
      { label: "À envoyer", date: "attente", state: "current" },
      { label: "Signé client", date: "—", state: "todo" },
    ],
    viewLabel: "Consulter",
  },
  {
    key: "lm",
    icon: "doc",
    title: "Lettre de mission",
    subtitle: "Honoraires 3 900 € TTC · signée par les 2 parties",
    statusPill: "● Prête à l'envoi",
    tracker: [
      { label: "Préparée", date: "11/05/2026", state: "done" },
      { label: "À envoyer", date: "attente", state: "current" },
      { label: "Signée client", date: "—", state: "todo" },
      { label: "Signée ingénieur", date: "—", state: "todo" },
    ],
    viewLabel: "Signer",
  },
];

/* ── Espace d'envoi groupé du pack de contractualisation ───────────────── */

export type PackPieceTone = "navy" | "gold" | "green" | "grey";

export type PackPiece = {
  icon: PackPieceTone;
  title: string;
  meta: string;
  tagLabel: string;
  tagTone: PackPieceTone;
  defaultChecked: boolean;
};

export const PACK_PIECES: PackPiece[] = [
  {
    icon: "navy",
    title: "Document d'Entrée en Relation (DER)",
    meta: "PDF · 4 pages · à signer par le client",
    tagLabel: "Contractuel",
    tagTone: "navy",
    defaultChecked: true,
  },
  {
    icon: "gold",
    title: "DCI Complet + Questionnaire de qualification (KYC)",
    meta: "PDF · enveloppe réglementaire · à signer par le client",
    tagLabel: "Contractuel",
    tagTone: "gold",
    defaultChecked: true,
  },
  {
    icon: "gold",
    title: "Lettre de mission",
    meta: "PDF · honoraires 3 900 € TTC · signée par les 2 parties",
    tagLabel: "Contractuel",
    tagTone: "gold",
    defaultChecked: true,
  },
  {
    icon: "green",
    title: "Facture des honoraires",
    meta: "PDF · FACT-2026-JOU-001 · 3 900 € TTC",
    tagLabel: "Facturation",
    tagTone: "green",
    defaultChecked: true,
  },
  {
    icon: "grey",
    title: "Étude patrimoniale témoin",
    meta: "PDF · 84 pages · anonymisée · aperçu du livrable final",
    tagLabel: "Pédagogique",
    tagTone: "grey",
    defaultChecked: true,
  },
  {
    icon: "grey",
    title: "Synthèse exécutive témoin",
    meta: "PDF · 12 pages · anonymisée · plan d'action + gains chiffrés",
    tagLabel: "Pédagogique",
    tagTone: "grey",
    defaultChecked: true,
  },
];

export const PACK = {
  pieceCount: "7 PIÈCES DISPONIBLES",
  mail: {
    to: "camille.joubert@email.fr · yannick.berthoux@email.fr",
    subject:
      "PRIVEOS · Éléments de contractualisation de notre accompagnement patrimonial",
  },
};

/* ── Documents pédagogiques témoins (lecture seule) ────────────────────── */

export type TemoinDoc = {
  variant: "etude" | "synthese";
  title: string;
  desc: string;
};

export const TEMOIN_DOCS: TemoinDoc[] = [
  {
    variant: "etude",
    title: "Étude patrimoniale témoin",
    desc:
      "84 pages · format PRIVEOS éditorial · audit complet + diagnostic + préconisations",
  },
  {
    variant: "synthese",
    title: "Synthèse exécutive témoin",
    desc:
      "12 pages · plan d'action + gains chiffrés + chronologie de mise en œuvre",
  },
];

/* ── Conditions de passage à l'étape 03 ───────────────────────────────── */

export type ConditionRow = {
  check: "wait" | "ko";
  text: string;
  meta: string;
  /** badge à droite : pill paiement ou pastille texte */
  badge: { kind: "text" | "pay"; label: string; bg?: "ivory" | "blue" };
};

export const CONDITIONS_SUB =
  "0 condition sur 4 remplie · le passage à l'étape 03 ouvre l'espace sécurisé client pour collecter les pièces patrimoniales détaillées.";

export const CONDITIONS: ConditionRow[] = [
  {
    check: "wait",
    text: "DER daté et signé par le client",
    meta: "Lu le 12/05/2026 · en attente de signature électronique Yousign",
    badge: { kind: "text", label: "En attente", bg: "ivory" },
  },
  {
    check: "wait",
    text:
      "KYC daté et signé par le client (DCI Complet + Questionnaire de qualification)",
    meta: "Envoyé le 11/05 · en attente de consultation et signature électronique",
    badge: { kind: "text", label: "En attente", bg: "ivory" },
  },
  {
    check: "ko",
    text: "Lettre de mission datée et signée par les deux parties",
    meta:
      "À finaliser par l'ingénieur (honoraires + champs) puis envoyer pour signature",
    badge: { kind: "text", label: "Non générée", bg: "blue" },
  },
  {
    check: "wait",
    text: "Règlement des honoraires reçu · 3 900 € TTC",
    meta:
      "Prix total de la mission · virement bancaire attendu · règle PRIVEOS : règlement intégral avant ouverture de l'espace sécurisé (étape 03)",
    badge: { kind: "pay", label: "En attente" },
  },
];

export const ACTION_BAR = {
  conditionsCount: "0/4 conditions remplies",
  note:
    "L'étape 03 ne s'ouvre qu'une fois les 3 documents signés (DER · KYC · LM) et les 3 900 € TTC reçus. Délai client espace sécurisé : 30 jours pour transmettre les documents patrimoniaux.",
};

/* ── Contenu du document DER (modale, pré-rendu) ──────────────────────── */

export const DER = {
  modalEyebrow: "DER · Document d'Entrée en Relation · obligation réglementaire",
  client: "Camille JOUBERT & Yannick BERTHOUX",
  modalSub:
    "Document figé au niveau du cabinet · 3 champs modifiables uniquement : le mode personne/personnes, la date et le lieu de signature.",
  /** 3 champs réellement éditables (mode personne/personnes, lieu, date). */
  fields: {
    personnes: "des Clients",
    lieu: "Paris",
    date: "11/05/2026",
  },
  signClients: "Mme Camille JOUBERT & M. Yannick BERTHOUX",
  signConseiller: {
    name: "Luc THILLIEZ",
    role: "Président associé du cabinet PRIVEOS",
    stamp: "Luc Thilliez",
    signedNote: "Signé électroniquement via Yousign · 11/05/2026",
  },
};

/** Données réelles passées au générateur PDF (lib/conformite-pdf.ts). */
export const DER_PDF_INPUT: ConformitePdfInput = {
  dossierId: "CF-2026-JOU",
  clientName: "Madame Camille JOUBERT",
  conjointName: "Monsieur Yannick BERTHOUX",
  honoraires: "3 900 € TTC",
  perimetre: "Bilan patrimonial complet · couple PACS, régime de séparation",
  cabinet: {
    name: "PRIVEOS",
    addressStreet: "10 avenue Kléber",
    addressZipcode: "75116",
    addressCity: "Paris",
    phone: null,
    email: "contact@priveos.io",
    oriasNumber: "23004036",
    rcProInsurer: "Liberty Specialty Markets Europe SARL (LSME)",
  },
};
