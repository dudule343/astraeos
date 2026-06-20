/**
 * Données d'exemple de l'écran "Conformité en cours" (pipe 02) — RÉPLIQUE EXACTE
 * de la maquette 030 v28 (`#page-ing-pipe-02`, lignes 16082→16302).
 *
 * Source unique de la page. Ingénieur connecté = Julien VASSEUR. Les noms,
 * chiffres, badges, statuts par document et montants sont ceux de la maquette,
 * "comme si des clients avaient été saisis à la main".
 */

/** Étape du stepper de parcours (6 étapes). */
export type StepperItem = {
  step: string;
  label: string;
  count: string;
  href: string;
  active: boolean;
};

/** KPI cliquable de l'en-tête. */
export type ConformiteKpi = {
  label: string;
  /** value rendu en JSX dans la page (peut contenir une unité / fraction) */
  filter?: "a-signer" | "signe-attente" | "paye";
};

/** Sous-statut d'un document (DER / KYC / LM) avec sa couleur portée de la maquette. */
export type DocStatus = {
  code: string;
  /** partie courante du sous-statut (avant l'emphase) */
  text: string;
  /** suffixe mis en avant en italique (`<em>` dans la maquette, ex. "Non signé") */
  em?: string;
  tone: "green" | "gold" | "orange" | "navy";
};

export type PayTone = "attente" | "partiel" | "recu" | "offert" | "annule";
export type StatusTone = "waiting" | "signed" | "paid";
export type ClientKind = "couple" | "personne-morale" | "seul";

/** Une ligne du tableau conformité. */
export type ConformiteRow = {
  id: string;
  /** lignes de nom (couple = 2 lignes) */
  names: string[];
  /** sous-titre représentant légal (PM) */
  legalRep?: string;
  /** libellé type sous le nom */
  typeLabel: string;
  kind: ClientKind;
  /** nouvelle entrante : surlignage gold de la ligne */
  highlighted?: boolean;
  /** statut de filtre data-status */
  dataStatus: "a-signer" | "signe-attente" | "paye";
  cabinet: { name: string; sub: string };
  supervisor: { initials: string; name: string };
  docs: DocStatus[];
  payment: { tone: PayTone; label: string; meta: string };
  status: { tone: StatusTone; label: string };
  /** la fiche conformité existe en tant que route ? (sinon action honnête désactivée) */
  ficheReady: boolean;
};

export const STEPPER: StepperItem[] = [
  { step: "01", label: "Prospects actifs", count: "187", href: "/espace-ingenieur/prospects", active: false },
  { step: "02", label: "Conformité en cours", count: "18", href: "/espace-ingenieur/conformite", active: true },
  { step: "03", label: "Collecte docs", count: "24", href: "/espace-ingenieur/collectes", active: false },
  { step: "04", label: "Études en cours", count: "41", href: "/espace-ingenieur/etudes", active: false },
  { step: "05", label: "Études restituées", count: "28", href: "/espace-ingenieur/etudes-restituees", active: false },
  { step: "06", label: "Clients en suivi", count: "142", href: "/espace-ingenieur/clients-suivi", active: false },
];

export const BANK_BANNER = {
  title: "Synchronisation avec la banque du cabinet PRIVEOS active",
  meta: "Dernière synchronisation · 24/05/2026 à 17:42 · les statuts de paiement sont actualisés automatiquement",
  status: "Active",
};

export const ROWS: ConformiteRow[] = [
  {
    id: "joubert",
    names: ["Camille JOUBERT", "Yannick BERTHOUX"],
    typeLabel: "Couple PACS · nouvelle entrante",
    kind: "couple",
    highlighted: true,
    dataStatus: "a-signer",
    cabinet: { name: "Luc THILLIEZ", sub: "Dirigeant-praticien" },
    supervisor: { initials: "LT", name: "Luc THILLIEZ" },
    docs: [
      { code: "DER", text: "▸ Envoyé · Lu · ", em: "Non signé", tone: "gold" },
      { code: "KYC", text: "▸ Envoyé · ", em: "Non vu", tone: "gold" },
      { code: "LM", text: "○ À finaliser par l'ingénieur", tone: "navy" },
    ],
    payment: { tone: "attente", label: "En attente", meta: "3 900 € TTC" },
    status: { tone: "waiting", label: "Génération en cours" },
    ficheReady: true,
  },
  {
    id: "dupont-topin",
    names: ["Bertrand DUPONT", "Monique TOPIN"],
    typeLabel: "Couple",
    kind: "couple",
    dataStatus: "paye",
    cabinet: { name: "Luc THILLIEZ", sub: "Dirigeant-praticien" },
    supervisor: { initials: "JV", name: "Julien VASSEUR" },
    docs: [
      { code: "DER", text: "✓ Signé", tone: "green" },
      { code: "KYC", text: "✓ Signé", tone: "green" },
      { code: "LM", text: "✓ Signé", tone: "green" },
    ],
    payment: { tone: "recu", label: "Reçu", meta: "3 900 € · 28/04/2026 · Qonto" },
    status: { tone: "paid", label: "Paiement reçu · prêt étape 03" },
    ficheReady: true,
  },
  {
    id: "moreau",
    names: ["Stéphane MOREAU"],
    typeLabel: "Personne seule",
    kind: "seul",
    dataStatus: "paye",
    cabinet: { name: "Julien VASSEUR", sub: "Senior · 8 ans" },
    supervisor: { initials: "RB", name: "Romain BERTHIER" },
    docs: [
      { code: "DER", text: "✓ Signé", tone: "green" },
      { code: "KYC", text: "✓ Signé", tone: "green" },
      { code: "LM", text: "✓ Signé", tone: "green" },
    ],
    payment: { tone: "recu", label: "Reçu", meta: "3 900 € · 02/05/2026 · Qonto" },
    status: { tone: "paid", label: "Paiement reçu · prêt étape 03" },
    ficheReady: true,
  },
  {
    id: "lefebvre-sas",
    names: ["SAS GROUPE LEFEBVRE"],
    legalRep: "Représentant légal · signataire : Pierre LEFEBVRE",
    typeLabel: "Personne morale",
    kind: "personne-morale",
    dataStatus: "paye",
    cabinet: { name: "Luc THILLIEZ", sub: "Dirigeant-praticien" },
    supervisor: { initials: "JV", name: "Julien VASSEUR" },
    docs: [
      { code: "DER", text: "✓ Signé", tone: "green" },
      { code: "KYC PM", text: "✓ Signé", tone: "green" },
      { code: "LM", text: "✓ Signée", tone: "green" },
    ],
    payment: { tone: "recu", label: "Reçu", meta: "7 800 € · 15/05/2026 · Virement" },
    status: { tone: "paid", label: "Paiement reçu · prêt étape 03" },
    ficheReady: true,
  },
  {
    id: "leroy",
    names: ["Anne LEROY", "Pierre LEROY"],
    typeLabel: "Couple",
    kind: "couple",
    dataStatus: "signe-attente",
    cabinet: { name: "Julien VASSEUR", sub: "Senior · 8 ans" },
    supervisor: { initials: "AR", name: "Antoine ROSSI" },
    docs: [
      { code: "DER", text: "✓ Signé", tone: "green" },
      { code: "KYC", text: "✓ Signé", tone: "green" },
      { code: "LM", text: "✓ Signé", tone: "green" },
    ],
    payment: {
      tone: "partiel",
      label: "Partiel",
      meta: "1 950 € / 3 900 € · Pierre OK · Anne en attente",
    },
    status: { tone: "signed", label: "Tous signés · attente complément" },
    ficheReady: false,
  },
  {
    id: "guyot",
    names: ["Hélène GUYOT"],
    typeLabel: "Personne seule",
    kind: "seul",
    dataStatus: "a-signer",
    cabinet: { name: "Sophie MERCIER", sub: "5 ans" },
    supervisor: { initials: "CF", name: "Caroline FAURE" },
    docs: [
      { code: "DER", text: "✓ Signé", tone: "green" },
      { code: "KYC", text: "▸ Lu · Non signé", tone: "orange" },
      { code: "LM", text: "▸ Envoyée · ", em: "Non vue", tone: "navy" },
    ],
    payment: { tone: "attente", label: "En attente", meta: "3 900 € TTC" },
    status: { tone: "waiting", label: "À signer" },
    ficheReady: false,
  },
  {
    id: "delacroix",
    names: ["Marc DELACROIX", "Sandra DELACROIX"],
    typeLabel: "Couple",
    kind: "couple",
    dataStatus: "a-signer",
    cabinet: { name: "Luc THILLIEZ", sub: "Dirigeant-praticien" },
    supervisor: { initials: "MK", name: "Mathieu KELLER" },
    docs: [
      { code: "DER", text: "▸ Envoyé · Vu · ", em: "Non signé", tone: "orange" },
      { code: "KYC", text: "▸ Envoyé · Vu · ", em: "Non signé", tone: "orange" },
      { code: "LM", text: "▸ Envoyé · Vu · ", em: "Non signé", tone: "orange" },
    ],
    payment: { tone: "offert", label: "Offert", meta: "Recommandation M. ROCHE" },
    status: { tone: "waiting", label: "À signer" },
    ficheReady: false,
  },
];

export const KPIS = {
  aSigner: { count: "1", unit: "client", meta: "3 documents à signer (DER · KYC · LM)" },
  enConformite: { count: "3", unit: "clients", meta: "2 docs en attente validation interne" },
  paiement: { recu: "2", total: "4", pct: "50 %", attente: "2 en attente" },
  delai: { value: "12", unit: "jours", meta: "signature ensemble docs + paiement" },
};

/** Total réel de dossiers en étape 02 (le tableau n'en montre que 7). */
export const TOTAL_DOSSIERS = 18;
