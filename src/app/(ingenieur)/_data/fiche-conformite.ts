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

/** Glyphe SVG de la pastille, indépendant de la teinte (cf. maquette l. 6809→6850). */
export type PackPieceGlyph =
  | "circlePlus"
  | "users"
  | "doc"
  | "docPlain"
  | "list"
  | "chart";

export type PackPiece = {
  icon: PackPieceTone;
  glyph: PackPieceGlyph;
  title: string;
  meta: string;
  tagLabel: string;
  tagTone: PackPieceTone;
  defaultChecked: boolean;
};

export const PACK_PIECES: PackPiece[] = [
  {
    icon: "navy",
    glyph: "circlePlus",
    title: "Document d'Entrée en Relation (DER)",
    meta: "PDF · 4 pages · à signer par le client",
    tagLabel: "Contractuel",
    tagTone: "navy",
    defaultChecked: true,
  },
  {
    icon: "gold",
    glyph: "users",
    title: "DCI Complet + Questionnaire de qualification (KYC)",
    meta: "PDF · enveloppe réglementaire · à signer par le client",
    tagLabel: "Contractuel",
    tagTone: "gold",
    defaultChecked: true,
  },
  {
    icon: "gold",
    glyph: "doc",
    title: "Lettre de mission",
    meta: "PDF · honoraires 3 900 € TTC · signée par les 2 parties",
    tagLabel: "Contractuel",
    tagTone: "gold",
    defaultChecked: true,
  },
  {
    icon: "green",
    glyph: "list",
    title: "Facture des honoraires",
    meta: "PDF · FACT-2026-JOU-001 · 3 900 € TTC",
    tagLabel: "Facturation",
    tagTone: "green",
    defaultChecked: true,
  },
  {
    icon: "grey",
    glyph: "docPlain",
    title: "Étude patrimoniale témoin",
    meta: "PDF · 84 pages · anonymisée · aperçu du livrable final",
    tagLabel: "Pédagogique",
    tagTone: "grey",
    defaultChecked: true,
  },
  {
    icon: "grey",
    glyph: "chart",
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
      "ASTRAEOS · Éléments de contractualisation de notre accompagnement patrimonial",
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
      "84 pages · format ASTRAEOS éditorial · audit complet + diagnostic + préconisations",
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
      "Prix total de la mission · virement bancaire attendu · règle ASTRAEOS : règlement intégral avant ouverture de l'espace sécurisé (étape 03)",
    badge: { kind: "pay", label: "En attente" },
  },
];

export const ACTION_BAR = {
  conditionsCount: "0/4 conditions remplies",
  /**
   * Note rendue en 3 fragments car la maquette met « et » en gras
   * (l. 6963 : « …signés (DER · KYC · LM) <strong>et</strong> les 3 900 € TTC reçus »).
   */
  note: {
    lead:
      "L'étape 03 ne s'ouvre qu'une fois les 3 documents signés (DER · KYC · LM) ",
    strong: "et",
    tail:
      " les 3 900 € TTC reçus. Délai client espace sécurisé : 30 jours pour transmettre les documents patrimoniaux.",
  },
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
    role: "Président associé du cabinet ASTRAEOS",
    stamp: "Luc Thilliez",
    signedNote: "Signé électroniquement via Yousign · 11/05/2026",
  },
};

/* ── Modale KYC · Synthèse patrimoniale (onglet ouvert par défaut) ──────── */
/* Réplique exacte de #modal-kyc > #kyc-tab-synthese (maquette l. 21358→21568) :
 * c'est le document de tête de l'enveloppe KYC (DCI Complet + Questionnaire de
 * qualification). Ouvert par les boutons « Consulter » / « Modifier » de la
 * carte KYC et par le deep-link `?doc=kyc` venu de la fiche prospect. */

export const KYC = {
  eyebrow:
    "KYC · Know Your Customer · réglementation ANACOFI / AMF / MIF II",
  client: "Camille JOUBERT & Yannick BERTHOUX",
  sub: "Enveloppe réglementaire composée de 2 sous-documents · DCI Complet (situation patrimoniale détaillée) + Questionnaire de qualification client (profil investisseur) · à signer par les 2 cocontractants.",
  modeMeta: "KYC · DCI Complet + Questionnaire de qualification",
  tabMeta: "Synthèse patrimoniale · DCI Complet (21 sections) · Questionnaire de qualification (18 sections)",
};

export type KycKpi = { label: string; value: string; unit: string; meta: string };
export const KYC_KPIS: KycKpi[] = [
  { label: "Patrimoine brut", value: "2 955", unit: " k€", meta: "Immobilier · financier · atypique" },
  { label: "Patrimoine net", value: "1 750", unit: " k€", meta: "Après imputation des crédits" },
  { label: "Total crédits", value: "1 205", unit: " k€", meta: "RP · Reims · Lyon · SCI Lille" },
  { label: "Endettement", value: "40,8", unit: " %", meta: "Sur patrimoine brut" },
];

/** Segments du donut (dasharray/dashoffset déjà calculés dans la maquette). */
export type KycDonutSegment = {
  color: string;
  dasharray: string;
  dashoffset: string;
  label: string;
  legendValue: string;
};
export const KYC_DONUT: KycDonutSegment[] = [
  { color: "#102D50", dasharray: "153.31 475.01", dashoffset: "0.00", label: "Immobilier d'usage · RP", legendValue: "720 k€ · 24.4 %" },
  { color: "#C68E0E", dasharray: "290.28 338.04", dashoffset: "-153.31", label: "Immobilier locatif", legendValue: "1365 000 € · 46.2 %" },
  { color: "#708196", dasharray: "180.96 447.36", dashoffset: "-443.59", label: "Financier · épargne", legendValue: "852 k€ · 28.8 %" },
  { color: "#695D30", dasharray: "3.77 624.55", dashoffset: "-624.55", label: "Atypique · or", legendValue: "18 k€ · 0.6 %" },
];

export type KycBar = { label: string; width: string; color: string; value: string; title: string };
export const KYC_NET_BARS: KycBar[] = [
  { label: "Camille JOUBERT", width: "92.8%", color: "#C68E0E", value: "697 950 €", title: "Camille JOUBERT · 697 950 € · 39.9 % du patrimoine net" },
  { label: "Yannick BERTHOUX", width: "100.0%", color: "#102D50", value: "751 950 €", title: "Yannick BERTHOUX · 751 950 € · 43.0 % du patrimoine net" },
  { label: "Patrimoine Commun", width: "34.6%", color: "#695D30", value: "260 000 €", title: "Patrimoine Commun · 260 000 € · 14.9 % du patrimoine net" },
  { label: "Commun · trésorerie", width: "2.9%", color: "#DDBB6E", value: "22 000 €", title: "Commun · trésorerie · 22 000 € · 1.2 % du patrimoine net" },
  { label: "Enfants · Léa Tom Inès", width: "2.5%", color: "#877D59", value: "18 500 €", title: "Enfants · Léa Tom Inès · 18 500 € · 1.0 % du patrimoine net" },
];

export const KYC_FISCAL_BARS: KycBar[] = [
  { label: "Taux d'endettement", width: "40.8%", color: "#102D50", value: "40,8 %", title: "Taux d'endettement · 40,8 %" },
  { label: "Taux d'effort", width: "27.3%", color: "#C68E0E", value: "27,3 %", title: "Taux d'effort · 27,3 %" },
  { label: "Reste à vivre", width: "61.0%", color: "#27AE60", value: "6 110 € / mois", title: "Reste à vivre · 6 110 € / mois" },
  { label: "Capacité d'épargne", width: "31.0%", color: "#1F8049", value: "54 000 € / an", title: "Capacité d'épargne · 54 000 € / an" },
];

export type KycMatrixRow = {
  cat?: { label: string; bg: string };
  asset: string;
  camille: string;
  yannick: string;
  commun: string;
  dette: string;
  detteNeg?: boolean;
  net: string;
  kind?: "subtotal" | "total";
};
export const KYC_MATRIX: KycMatrixRow[] = [
  { cat: { label: "IMMO RP", bg: "#102D50" }, asset: "Résidence principale · Paris 12e · T4 95 m² · indivision 60/40", camille: "432 000 €", yannick: "288 000 €", commun: "—", dette: "-280 000 €", detteNeg: true, net: "440 000 €" },
  { cat: { label: "LOCATIF", bg: "#C68E0E" }, asset: "Reims · T3 nu · 100 % Camille", camille: "165 000 €", yannick: "—", commun: "—", dette: "-95 000 €", detteNeg: true, net: "70 000 €" },
  { cat: { label: "LOCATIF", bg: "#C68E0E" }, asset: "Lyon · T2 LMNP réel · 100 % Camille", camille: "220 000 €", yannick: "—", commun: "—", dette: "-110 000 €", detteNeg: true, net: "110 000 €" },
  { cat: { label: "LOCATIF", bg: "#C68E0E" }, asset: "Lille · Immeuble 4 lots · SCI BERTHOUX-JOUBERT IMMO 50/50", camille: "—", yannick: "—", commun: "980 000 €", dette: "-720 000 €", detteNeg: true, net: "260 000 €" },
  { asset: "Sous-total immobilier", camille: "817 000 €", yannick: "288 000 €", commun: "980 000 €", dette: "-1 205 000 €", detteNeg: true, net: "880 000 €", kind: "subtotal" },
  { cat: { label: "FINANCIER", bg: "#708196" }, asset: "PEA Bourse Direct · ETF MSCI World + émergents", camille: "78 000 €", yannick: "—", commun: "—", dette: "—", net: "78 000 €" },
  { cat: { label: "FINANCIER", bg: "#708196" }, asset: "AV Linxea Spirit 2 · 60 % UC / 40 % €", camille: "95 000 €", yannick: "—", commun: "—", dette: "—", net: "95 000 €" },
  { cat: { label: "FINANCIER", bg: "#708196" }, asset: "PER Linxea · versement 5 000 €/an", camille: "22 000 €", yannick: "—", commun: "—", dette: "—", net: "22 000 €" },
  { cat: { label: "FINANCIER", bg: "#708196" }, asset: "CTO Boursorama · actions tech US", camille: "24 000 €", yannick: "—", commun: "—", dette: "—", net: "24 000 €" },
  { cat: { label: "FINANCIER", bg: "#708196" }, asset: "Livret A + LDDS · Camille", camille: "34 950 €", yannick: "—", commun: "—", dette: "—", net: "34 950 €" },
  { cat: { label: "FINANCIER", bg: "#708196" }, asset: "PEA Saxo Bank · actions individuelles européennes", camille: "—", yannick: "145 000 €", commun: "—", dette: "—", net: "145 000 €" },
  { cat: { label: "FINANCIER", bg: "#708196" }, asset: "🇱🇺 AV Vitis Life Luxembourg · droit lux. · 80 % UC", camille: "—", yannick: "240 000 €", commun: "—", dette: "—", net: "240 000 €" },
  { cat: { label: "FINANCIER", bg: "#708196" }, asset: "CTO Saxo · OAT + obligations corporate", camille: "—", yannick: "65 000 €", commun: "—", dette: "—", net: "65 000 €" },
  { cat: { label: "FINANCIER", bg: "#708196" }, asset: "Trésorerie SASU BERTHOUX CONSEIL", camille: "—", yannick: "85 000 €", commun: "—", dette: "—", net: "85 000 €" },
  { cat: { label: "FINANCIER", bg: "#708196" }, asset: "Livret A · Yannick", camille: "—", yannick: "22 950 €", commun: "—", dette: "—", net: "22 950 €" },
  { cat: { label: "FINANCIER", bg: "#708196" }, asset: "3 Livrets A enfants (Léa 8,5 · Tom 6,2 · Inès 3,8 k)", camille: "—", yannick: "—", commun: "18 500 €", dette: "—", net: "18 500 €" },
  { cat: { label: "FINANCIER", bg: "#708196" }, asset: "Compte commun + comptes individuels", camille: "—", yannick: "—", commun: "22 000 €", dette: "—", net: "22 000 €" },
  { asset: "Sous-total financier", camille: "253 950 €", yannick: "557 950 €", commun: "40 500 €", dette: "—", detteNeg: true, net: "852 400 €", kind: "subtotal" },
  { cat: { label: "ATYPIQUE", bg: "#695D30" }, asset: "🥇 Or physique · 4 lingots 250 g · AuCOFFRE", camille: "—", yannick: "18 000 €", commun: "—", dette: "—", net: "18 000 €" },
  { asset: "Sous-total atypique", camille: "—", yannick: "18 000 €", commun: "—", dette: "—", detteNeg: true, net: "18 000 €", kind: "subtotal" },
  { asset: "PATRIMOINE TOTAL", camille: "1 070 950 €", yannick: "863 950 €", commun: "1 020 500 €", dette: "-1 205 000 €", detteNeg: true, net: "1 750 400 €", kind: "total" },
];

/* ── Type du corps live (livrables + conditions) ──────────────────────────
 *
 * La forme du CORPS branché sur Supabase est définie ici (donnée pure), mais
 * son calcul vit dans fiche-conformite-server.ts : ce module est aussi importé
 * par un composant client, donc il ne doit jamais embarquer de code serveur
 * (createAdminClient / getSessionContext → next/headers casse le bundle client).
 */
export type FicheConformiteBody = {
  docCards: DocCard[];
  conditions: ConditionRow[];
  conditionsSub: string;
  conditionsCount: string;
  payBanner: typeof PAY_BANNER;
  /** true quand le corps vient de la base (sinon repli maquette). */
  realData: boolean;
};

/** Données réelles passées au générateur PDF (lib/conformite-pdf.ts). */
export const DER_PDF_INPUT: ConformitePdfInput = {
  dossierId: "CF-2026-JOU",
  clientName: "Madame Camille JOUBERT",
  conjointName: "Monsieur Yannick BERTHOUX",
  honoraires: "3 900 € TTC",
  perimetre: "Bilan patrimonial complet · couple PACS, régime de séparation",
  cabinet: {
    name: "ASTRAEOS",
    addressStreet: "10 avenue Kléber",
    addressZipcode: "75116",
    addressCity: "Paris",
    phone: null,
    email: "contact@priveos.io",
    oriasNumber: "23004036",
    rcProInsurer: "Liberty Specialty Markets Europe SARL (LSME)",
  },
};
