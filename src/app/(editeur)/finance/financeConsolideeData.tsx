// Données portées 1:1 de la maquette wireframes-editeur.html (#page-finance,
// lignes 3352-4053). Valeurs hardcodées identiques à la maquette.

export type Kpi = {
  label: string;
  value: string;
  unit?: string;
  meta?: React.ReactNode;
};

export const headlineKpis: Kpi[] = [
  {
    label: "CA réalisé · mai",
    value: "42 800",
    unit: "€",
    meta: (
      <>
        <strong className="up">▲ +18 %</strong> vs M-1
      </>
    ),
  },
  { label: "CA encaissé · mai", value: "38 200", unit: "€", meta: "89 % des facturations" },
  {
    label: "Charges totales · mai",
    value: "28 400",
    unit: "€",
    meta: (
      <>
        <strong className="down">▲ +6 %</strong> vs M-1
      </>
    ),
  },
  { label: "Marge brute", value: "14 400", unit: "€", meta: "34 % du CA" },
  { label: "Marge nette", value: "9 800", unit: "€", meta: "23 % du CA" },
  { label: "Trésorerie disponible", value: "128 600", unit: "€", meta: "3 comptes bancaires" },
  { label: "Autonomie financière", value: "4,5", unit: "mois", meta: "au taux de charges actuel" },
];

export type ResultatRow = {
  label: React.ReactNode;
  c2026: React.ReactNode;
  c2025: React.ReactNode;
  evo: React.ReactNode;
  annuel: React.ReactNode;
  rowStyle?: React.CSSProperties;
  c2026Cls?: string;
  c2026Style?: React.CSSProperties;
  c2025Cls?: string;
  annuelCls?: string;
  section?: boolean;
};

const up = (t: string) => <strong className="up">{t}</strong>;
const down = (t: string) => <strong className="down">{t}</strong>;

export const resultatRows: ResultatRow[] = [
  { section: true, label: "▾ Produits d'exploitation", c2026: "", c2025: "", evo: "", annuel: "" },
  {
    label: "Chiffre d'affaires · Abonnements packs récurrents",
    c2026: "142 000 €",
    c2026Cls: "cell-money",
    c2025: "98 400 €",
    evo: up("▲ +44 %"),
    annuel: "258 200 €",
  },
  {
    label: "Chiffre d'affaires · Packs unitaires & ponctuels",
    c2026: "62 800 €",
    c2026Cls: "cell-money",
    c2025: "48 200 €",
    evo: up("▲ +30 %"),
    annuel: "112 400 €",
  },
  {
    label: "Chiffre d'affaires · Formations & supervisions",
    c2026: "28 600 €",
    c2026Cls: "cell-money",
    c2025: "22 100 €",
    evo: up("▲ +29 %"),
    annuel: "52 800 €",
  },
  {
    label: "Commissions partenariats commerciaux",
    c2026: "18 200 €",
    c2026Cls: "cell-money",
    c2025: "9 400 €",
    evo: up("▲ +94 %"),
    annuel: "24 600 €",
  },
  {
    label: "Total chiffre d'affaires",
    rowStyle: { background: "var(--ivory)", fontWeight: 700 },
    c2026: "251 600 €",
    c2026Cls: "cell-money gold",
    c2025: "178 100 €",
    c2025Cls: "cell-money",
    evo: up("▲ +41 %"),
    annuel: "448 000 €",
    annuelCls: "cell-money",
  },
  {
    label: "Production stockée & immobilisée",
    c2026: "— €",
    c2025: "— €",
    evo: "—",
    annuel: "— €",
  },
  {
    label: "Subventions d'exploitation",
    c2026: "2 400 €",
    c2025: "— €",
    evo: up("— → 2 400 €"),
    annuel: "— €",
  },
  {
    label: <strong>Total produits d&apos;exploitation</strong>,
    rowStyle: { background: "var(--gold-200)", fontWeight: 700 },
    c2026: "254 000 €",
    c2026Cls: "cell-money gold",
    c2025: "178 100 €",
    c2025Cls: "cell-money",
    evo: up("▲ +43 %"),
    annuel: "448 000 €",
    annuelCls: "cell-money",
  },

  { section: true, label: "▾ Charges d'exploitation", c2026: "", c2025: "", evo: "", annuel: "" },
  {
    label: "Achats & services extérieurs (outils, hébergement)",
    c2026: "28 400 €",
    c2025: "22 600 €",
    evo: down("▲ +26 %"),
    annuel: "52 200 €",
  },
  {
    label: "Honoraires & prestataires externes",
    c2026: "42 800 €",
    c2025: "38 400 €",
    evo: down("▲ +11 %"),
    annuel: "82 600 €",
  },
  {
    label: "Salaires & charges sociales",
    c2026: "98 400 €",
    c2025: "62 200 €",
    evo: down("▲ +58 %"),
    annuel: "152 800 €",
  },
  {
    label: "Marketing & publicité",
    c2026: "14 200 €",
    c2025: "8 600 €",
    evo: down("▲ +65 %"),
    annuel: "21 400 €",
  },
  {
    label: "Locations, déplacements, autres",
    c2026: "8 200 €",
    c2025: "6 800 €",
    evo: down("▲ +21 %"),
    annuel: "16 200 €",
  },
  {
    label: "Dotations aux amortissements & provisions",
    c2026: "3 600 €",
    c2025: "2 800 €",
    evo: down("▲ +29 %"),
    annuel: "6 800 €",
  },
  {
    label: <strong>Total charges d&apos;exploitation</strong>,
    rowStyle: { background: "var(--ivory)", fontWeight: 700 },
    c2026: "195 600 €",
    c2026Cls: "cell-money",
    c2025: "141 400 €",
    c2025Cls: "cell-money",
    evo: down("▲ +38 %"),
    annuel: "332 000 €",
    annuelCls: "cell-money",
  },

  {
    label: <strong>Résultat d&apos;exploitation (EBITDA)</strong>,
    rowStyle: { background: "var(--green-bg)", fontWeight: 700 },
    c2026: "58 400 €",
    c2026Cls: "cell-money",
    c2026Style: { color: "var(--green-text)" },
    c2025: "36 700 €",
    c2025Cls: "cell-money",
    evo: up("▲ +59 %"),
    annuel: "116 000 €",
    annuelCls: "cell-money",
  },

  {
    section: true,
    label: "▾ Résultat financier & net",
    c2026: "",
    c2025: "",
    evo: "",
    annuel: "",
  },
  {
    label: "Charges financières (intérêts, frais bancaires)",
    c2026: "1 800 €",
    c2025: "1 200 €",
    evo: down("▲ +50 %"),
    annuel: "2 800 €",
  },
  {
    label: "Produits financiers (intérêts trésorerie)",
    c2026: "820 €",
    c2025: "120 €",
    evo: up("▲ +583 %"),
    annuel: "380 €",
  },
  {
    label: <strong>Résultat avant impôt</strong>,
    rowStyle: { background: "var(--ivory)" },
    c2026: "57 420 €",
    c2026Cls: "cell-money",
    c2025: "35 620 €",
    c2025Cls: "cell-money",
    evo: up("▲ +61 %"),
    annuel: "113 580 €",
    annuelCls: "cell-money",
  },
  {
    label: "Impôt sur les sociétés (estimation)",
    c2026: "14 360 €",
    c2025: "8 905 €",
    evo: down("▲ +61 %"),
    annuel: "28 400 €",
  },
  {
    label: <strong>Résultat net</strong>,
    rowStyle: { background: "var(--gold-200)", fontWeight: 700 },
    c2026: "43 060 €",
    c2026Cls: "cell-money gold",
    c2025: "26 715 €",
    c2025Cls: "cell-money",
    evo: up("▲ +61 %"),
    annuel: "85 180 €",
    annuelCls: "cell-money",
  },
];

export const resultatQuickFilters = [
  "Année en cours",
  "Cumul depuis janv. → mai 2026",
  "Trimestre Q2",
  "12 derniers mois",
];

// ── Onglet 2 : Détail du CA ──────────────────────────────────────────────
export const caRepartition = [
  { label: "📦 Abonnements packs récurrents", pct: "56 %", value: "142 000 €" },
  { label: "🛒 Packs unitaires & ponctuels", pct: "25 %", value: "62 800 €" },
  { label: "🎓 Formations & supervisions", pct: "11 %", value: "28 600 €" },
  { label: "🤝 Commissions partenaires", pct: "7 %", value: "18 200 €" },
];

export const caMonthlyBars = [
  { label: "Janv", height: "42%", navy: false },
  { label: "Févr", height: "48%", navy: false },
  { label: "Mars", height: "55%", navy: false },
  { label: "Avril", height: "68%", navy: false },
  { label: "Mai*", height: "82%", navy: true },
];

export type PackRow = {
  pack: React.ReactNode;
  souscriptions: React.ReactNode;
  genere: React.ReactNode;
  encaisse: React.ReactNode;
  reste: React.ReactNode;
  pca: React.ReactNode;
  part: React.ReactNode;
  rowStyle?: React.CSSProperties;
  pcaStyle?: React.CSSProperties;
  total?: boolean;
};

export const packRows: PackRow[] = [
  {
    pack: "Pack Investissements · Abonnement portefeuille",
    souscriptions: "18 actifs",
    genere: "78 300 €",
    encaisse: "76 488 €",
    reste: "1 812 €",
    pca: "— €",
    part: "31 %",
  },
  {
    pack: "Pack Investissements · Constitution portefeuille",
    souscriptions: "22",
    genere: "22 000 €",
    encaisse: "22 000 €",
    reste: "— €",
    pca: "— €",
    part: "9 %",
  },
  {
    pack: "Bibliothèque de documents actualisés",
    souscriptions: "14",
    genere: "13 860 €",
    encaisse: "13 860 €",
    reste: "— €",
    pca: "— €",
    part: "5,5 %",
  },
  {
    pack: "Rédaction et immatriculation de société",
    souscriptions: "8",
    genere: "9 600 €",
    encaisse: "8 400 €",
    reste: "1 200 €",
    pca: "— €",
    part: "4 %",
  },
  {
    pack: "Pack Supervision d'études",
    souscriptions: "22",
    genere: "17 600 €",
    encaisse: "17 600 €",
    reste: "— €",
    pca: "— €",
    part: "7 %",
  },
  {
    pack: "Pack Formation",
    souscriptions: "11",
    genere: "11 000 €",
    encaisse: "11 000 €",
    reste: "— €",
    pca: "— €",
    part: "4,5 %",
  },
  {
    pack: "Commissions Partenaire Immobilier",
    souscriptions: "8 dossiers",
    genere: "11 200 €",
    encaisse: "9 800 €",
    reste: "1 400 €",
    pca: "— €",
    part: "4,5 %",
  },
  {
    pack: "Commissions Partenaire Assurance",
    souscriptions: "14 dossiers",
    genere: "7 000 €",
    encaisse: "6 200 €",
    reste: "800 €",
    pca: "— €",
    part: "2,5 %",
  },
  {
    pack: "Abonnements annuels payés d'avance (4 clients)",
    souscriptions: "4 actifs",
    genere: "63 700 €",
    encaisse: "63 700 €",
    reste: "— €",
    pca: <strong>26 542 €</strong>,
    pcaStyle: { color: "var(--purple-text)" },
    part: "25 %",
    rowStyle: { background: "var(--purple-bg)" },
  },
];

export const projectionMonths = [
  { label: "Mai*", value: "3 317 €" },
  { label: "Juin", value: "3 317 €" },
  { label: "Juil", value: "3 317 €" },
  { label: "Août", value: "3 317 €" },
  { label: "Sept", value: "3 317 €" },
  { label: "Oct", value: "3 317 €" },
  { label: "Nov", value: "3 317 €" },
  { label: "Déc", value: "3 323 €" },
];

// ── Onglet 3 : Détail des charges ────────────────────────────────────────
export type ChargeCard = {
  icon: string;
  title: string;
  rows: { label: string; value: string; bold?: boolean }[];
};

export const chargeCards: ChargeCard[] = [
  {
    icon: "#i-team",
    title: "Charges humaines · 72 % des charges",
    rows: [
      { label: "Salaires & charges sociales (6 salariés)", value: "98 400 €" },
      { label: "Honoraires prestataires externes (commerciaux, dev)", value: "42 800 €" },
      { label: "Sous-total charges humaines", value: "141 200 €", bold: true },
    ],
  },
  {
    icon: "#i-infra",
    title: "Outils SaaS & infrastructure · 14 %",
    rows: [
      { label: "Hébergement & cloud (AWS, OVH)", value: "8 400 €" },
      { label: "Licences logicielles (GitHub, Linear, Notion…)", value: "12 200 €" },
      { label: "Outils data & intégrations API", value: "7 800 €" },
      { label: "Sous-total outils SaaS", value: "28 400 €", bold: true },
    ],
  },
  {
    icon: "#i-acquisition",
    title: "Marketing & publicité · 7 %",
    rows: [
      { label: "LinkedIn Ads & Google Ads", value: "8 600 €" },
      { label: "Production contenus (vidéos, articles, podcasts)", value: "3 200 €" },
      { label: "Salons professionnels & événements", value: "2 400 €" },
      { label: "Sous-total marketing", value: "14 200 €", bold: true },
    ],
  },
  {
    icon: "#i-finance",
    title: "Autres charges · 7 %",
    rows: [
      { label: "Locations bureaux & charges", value: "4 200 €" },
      { label: "Honoraires juridiques & comptables", value: "3 600 €" },
      { label: "Déplacements & restauration", value: "2 200 €" },
      { label: "Dotations & provisions", value: "3 600 €" },
      { label: "Sous-total autres", value: "13 600 €", bold: true },
    ],
  },
];

// ── Onglet 4 : Trésorerie ────────────────────────────────────────────────
export const tresoAccounts = [
  {
    label: "Compte Courant Qonto",
    value: "82 400",
    meta: "Compte principal d'exploitation · IBAN ...4321",
    delta: "▲ +4 200 € sur 7 jours",
  },
  {
    label: "Livret épargne BNP",
    value: "38 200",
    meta: "Trésorerie placée · 3,2 % rendement",
    delta: "▲ +102 € intérêts mai",
  },
  {
    label: "Compte secondaire Boursobank",
    value: "8 000",
    meta: "Réserve de précaution · IBAN ...9876",
    delta: "stable",
  },
];

export type TresoView = "jour" | "semaine" | "mois" | "trimestre" | "annee";

export const tresoPeriodButtons: { period: TresoView; label: string }[] = [
  { period: "jour", label: "Jour (30 derniers)" },
  { period: "semaine", label: "Semaine (12 dernières)" },
  { period: "mois", label: "Mois (12 derniers)" },
  { period: "trimestre", label: "Trimestre (8 derniers)" },
  { period: "annee", label: "Année (5 dernières)" },
];

export type TresoBar = { height: string; label?: string; navy: boolean };

export const tresoBars: Record<TresoView, TresoBar[]> = {
  mois: [
    { height: "38%", label: "Juin 25", navy: true },
    { height: "42%", label: "Juil 25", navy: true },
    { height: "48%", label: "Août 25", navy: true },
    { height: "52%", label: "Sept 25", navy: true },
    { height: "58%", label: "Oct 25", navy: true },
    { height: "62%", label: "Nov 25", navy: true },
    { height: "64%", label: "Déc 25", navy: true },
    { height: "68%", label: "Janv 26", navy: true },
    { height: "72%", label: "Févr 26", navy: true },
    { height: "78%", label: "Mars 26", navy: true },
    { height: "82%", label: "Avril 26", navy: true },
    { height: "88%", label: "Mai 26", navy: false },
  ],
  jour: [
    { height: "74%", label: "8", navy: true },
    { height: "73%", navy: true },
    { height: "75%", navy: true },
    { height: "76%", navy: true },
    { height: "75%", navy: true },
    { height: "78%", label: "13", navy: true },
    { height: "77%", navy: true },
    { height: "78%", navy: true },
    { height: "79%", navy: true },
    { height: "80%", navy: true },
    { height: "81%", label: "18", navy: true },
    { height: "80%", navy: true },
    { height: "82%", navy: true },
    { height: "83%", navy: true },
    { height: "82%", navy: true },
    { height: "84%", label: "23", navy: true },
    { height: "84%", navy: true },
    { height: "85%", navy: true },
    { height: "85%", navy: true },
    { height: "86%", navy: true },
    { height: "86%", label: "28", navy: true },
    { height: "87%", navy: true },
    { height: "87%", navy: true },
    { height: "87%", label: "1 mai", navy: true },
    { height: "87%", navy: true },
    { height: "88%", navy: true },
    { height: "87%", navy: true },
    { height: "87%", navy: true },
    { height: "88%", navy: true },
    { height: "88%", label: "6", navy: true },
    { height: "89%", label: "8", navy: false },
  ],
  semaine: [
    { height: "62%", label: "S07", navy: true },
    { height: "65%", label: "S08", navy: true },
    { height: "67%", label: "S09", navy: true },
    { height: "68%", label: "S10", navy: true },
    { height: "72%", label: "S11", navy: true },
    { height: "74%", label: "S12", navy: true },
    { height: "78%", label: "S13", navy: true },
    { height: "80%", label: "S14", navy: true },
    { height: "82%", label: "S15", navy: true },
    { height: "84%", label: "S16", navy: true },
    { height: "86%", label: "S17", navy: true },
    { height: "88%", label: "S18", navy: false },
  ],
  trimestre: [
    { height: "18%", label: "Q3 24", navy: true },
    { height: "24%", label: "Q4 24", navy: true },
    { height: "32%", label: "Q1 25", navy: true },
    { height: "40%", label: "Q2 25", navy: true },
    { height: "54%", label: "Q3 25", navy: true },
    { height: "66%", label: "Q4 25", navy: true },
    { height: "78%", label: "Q1 26", navy: true },
    { height: "88%", label: "Q2 26*", navy: false },
  ],
  annee: [
    { height: "8%", label: "2022", navy: true },
    { height: "18%", label: "2023", navy: true },
    { height: "42%", label: "2024", navy: true },
    { height: "68%", label: "2025", navy: true },
    { height: "88%", label: "2026*", navy: false },
  ],
};

export const tresoStats = [
  { label: "Solde au 8 mai", value: "128 600 €", valueColor: "var(--navy)" },
  { label: "Variation 30 j", value: "+ 14 800 €", valueColor: "var(--green-text)" },
  { label: "Meilleur mois", value: "Mai 2026", valueColor: "var(--navy)" },
  { label: "Autonomie", value: "4,5 mois", valueColor: "var(--navy)" },
];

// ── Onglet 5 : Prévisionnel ──────────────────────────────────────────────
export const previKpis: Kpi[] = [
  { label: "Objectif CA 2026", value: "680 000", unit: "€", meta: "37 % atteint à mi-mai" },
  {
    label: "Objectif charges 2026",
    value: "480 000",
    unit: "€",
    meta: "41 % consommés à mi-mai",
  },
  { label: "Objectif résultat net", value: "160 000", unit: "€", meta: "27 % atteint" },
];

export type PreviMonth = {
  id: string;
  mois: string;
  objCa: string;
  caReal: React.ReactNode;
  caRealCls?: string;
  ecart: React.ReactNode;
  objCharges: string;
  chargesReal: string;
  resPrevu: string;
  resReel: React.ReactNode;
  resReelCls?: string;
  rowStyle?: React.CSSProperties;
  editTitle: string;
  editLabel: string;
  fields: { label: string; value: string }[];
  saveLabel: string;
  goldBtn?: boolean;
};

export const previMonths: PreviMonth[] = [
  {
    id: "janv",
    mois: "Janvier",
    objCa: "42 000 €",
    caReal: "38 800 €",
    caRealCls: "cell-money",
    ecart: <strong className="down">-7 %</strong>,
    objCharges: "38 000 €",
    chargesReal: "36 200 €",
    resPrevu: "4 000 €",
    resReel: "2 600 €",
    resReelCls: "cell-money gold",
    editTitle: "▾ Édition des objectifs · Janvier 2026",
    editLabel: "Enregistrer Janvier",
    saveLabel: "Enregistrer Janvier",
    fields: [
      { label: "Objectif CA", value: "42 000" },
      { label: "Objectif charges", value: "38 000" },
      { label: "Forfaits ponctuels (qty)", value: "6" },
      { label: "Récurrent attendu", value: "22 000" },
    ],
  },
  {
    id: "fevr",
    mois: "Février",
    objCa: "48 000 €",
    caReal: "42 400 €",
    caRealCls: "cell-money",
    ecart: <strong className="down">-12 %</strong>,
    objCharges: "40 000 €",
    chargesReal: "38 600 €",
    resPrevu: "8 000 €",
    resReel: "3 800 €",
    resReelCls: "cell-money gold",
    editTitle: "▾ Édition des objectifs · Février 2026",
    editLabel: "Enregistrer Février",
    saveLabel: "Enregistrer Février",
    fields: [
      { label: "Objectif CA", value: "48 000" },
      { label: "Objectif charges", value: "40 000" },
      { label: "Forfaits ponctuels (qty)", value: "8" },
      { label: "Récurrent attendu", value: "24 000" },
    ],
  },
  {
    id: "mars",
    mois: "Mars",
    objCa: "54 000 €",
    caReal: "52 600 €",
    caRealCls: "cell-money",
    ecart: <strong>≈</strong>,
    objCharges: "42 000 €",
    chargesReal: "42 800 €",
    resPrevu: "12 000 €",
    resReel: "9 800 €",
    resReelCls: "cell-money gold",
    editTitle: "▾ Édition des objectifs · Mars 2026",
    editLabel: "Enregistrer Mars",
    saveLabel: "Enregistrer Mars",
    fields: [
      { label: "Objectif CA", value: "54 000" },
      { label: "Objectif charges", value: "42 000" },
      { label: "Forfaits ponctuels (qty)", value: "10" },
      { label: "Récurrent attendu", value: "26 000" },
    ],
  },
  {
    id: "avril",
    mois: "Avril",
    objCa: "58 000 €",
    caReal: "62 200 €",
    caRealCls: "cell-money",
    ecart: <strong className="up">+7 %</strong>,
    objCharges: "44 000 €",
    chargesReal: "44 200 €",
    resPrevu: "14 000 €",
    resReel: "18 000 €",
    resReelCls: "cell-money gold",
    editTitle: "▾ Édition des objectifs · Avril 2026",
    editLabel: "Enregistrer Avril",
    saveLabel: "Enregistrer Avril",
    fields: [
      { label: "Objectif CA", value: "58 000" },
      { label: "Objectif charges", value: "44 000" },
      { label: "Forfaits ponctuels (qty)", value: "12" },
      { label: "Récurrent attendu", value: "28 000" },
    ],
  },
  {
    id: "mai",
    mois: "Mai (en cours)",
    objCa: "62 000 €",
    caReal: "42 800 €",
    caRealCls: "cell-money",
    ecart: "— en cours",
    objCharges: "46 000 €",
    chargesReal: "28 400 €",
    resPrevu: "16 000 €",
    resReel: "— en cours",
    rowStyle: { background: "var(--gold-200)" },
    goldBtn: true,
    editTitle: "▾ Édition des objectifs · Mai 2026 (mois en cours)",
    editLabel: "Enregistrer Mai",
    saveLabel: "Enregistrer Mai",
    fields: [
      { label: "Objectif CA", value: "62 000" },
      { label: "Objectif charges", value: "46 000" },
      { label: "Forfaits ponctuels (qty)", value: "14" },
      { label: "Récurrent attendu", value: "30 000" },
    ],
  },
  {
    id: "juin",
    mois: "Juin (objectif)",
    objCa: "66 000 €",
    caReal: "—",
    ecart: "—",
    objCharges: "48 000 €",
    chargesReal: "—",
    resPrevu: "18 000 €",
    resReel: "—",
    editTitle: "▾ Édition des objectifs · Juin 2026",
    editLabel: "Enregistrer Juin",
    saveLabel: "Enregistrer Juin",
    fields: [
      { label: "Objectif CA", value: "66 000" },
      { label: "Objectif charges", value: "48 000" },
      { label: "Forfaits ponctuels (qty)", value: "16" },
      { label: "Récurrent attendu", value: "32 000" },
    ],
  },
];

export const previGlobalFields = [
  { label: "Objectif CA annuel", value: "680 000", help: "en €" },
  { label: "Objectif charges annuelles", value: "480 000", help: "en €" },
  { label: "Objectif résultat net", value: "160 000", help: "en €" },
  { label: "Croissance attendue", value: "+52 %", help: "vs 2025" },
];

// ── Onglet 6 : Définitions ───────────────────────────────────────────────
export type DefItem = { term: string; desc: React.ReactNode; formula?: string };
export type DefBlock = { icon: string; title: string; items: DefItem[] };

export const definitionBlocks: DefBlock[] = [
  {
    icon: "#i-business",
    title: "1. Produits — Chiffre d'affaires",
    items: [
      {
        term: "Chiffre d'affaires généré",
        desc: (
          <>
            Total des montants <strong>facturés</strong> sur la période, qu&apos;ils soient
            encaissés ou non. Inclut les abonnements packs récurrents, les packs unitaires, les
            formations, les supervisions et les commissions des partenariats.
          </>
        ),
        formula: "CA généré = Σ(factures émises sur la période)",
      },
      {
        term: "Chiffre d'affaires encaissé",
        desc: (
          <>
            Total des paiements <strong>réellement perçus</strong> sur la période. Peut être
            inférieur au CA généré si certaines factures sont en attente de règlement.
          </>
        ),
        formula: "CA encaissé = Σ(paiements reçus sur la période)",
      },
      {
        term: "Produits constatés d'avance (PCA)",
        desc: "Quand un client paye un abonnement annuel d'avance, le revenu est étalé sur 12 mois en comptabilité. Le montant non encore « consommé » est un produit constaté d'avance, à reconnaître progressivement.",
        formula: "PCA = montant payé d'avance × (mois restants ÷ 12)",
      },
    ],
  },
  {
    icon: "#i-finance",
    title: "2. Charges d'exploitation",
    items: [
      {
        term: "Charges d'exploitation",
        desc: "Total des coûts engagés pour faire tourner l'activité : salaires & charges sociales, prestataires externes, hébergement cloud, licences SaaS, marketing, locations, déplacements, dotations aux amortissements.",
      },
      {
        term: "Charges humaines",
        desc: "Salaires bruts + charges sociales (employeur + salariales) + honoraires des prestataires externes (commerciaux indépendants, développeur freelance, etc.).",
      },
    ],
  },
  {
    icon: "#i-chart",
    title: "3. Soldes intermédiaires de gestion",
    items: [
      {
        term: "Marge brute",
        desc: "Différence entre le CA et les charges directes (charges variables liées à l'activité : hébergement par client, support direct…).",
        formula: "Marge brute = CA − charges directes variables",
      },
      {
        term: "Résultat d'exploitation (EBITDA)",
        desc: "Bénéfice généré par l'activité avant prise en compte des intérêts financiers, impôts, dotations aux amortissements et provisions.",
        formula: "EBITDA = Produits exploitation − Charges exploitation (hors dotations)",
      },
      {
        term: "Résultat avant impôt",
        desc: "EBITDA + produits financiers − charges financières − dotations aux amortissements.",
        formula: "RAI = EBITDA − dotations + produits financiers − charges financières",
      },
      {
        term: "Marge nette / Résultat net",
        desc: "Bénéfice après impôt sur les sociétés. C'est ce qui revient à l'entreprise et peut être réinvesti, distribué ou mis en réserve.",
        formula: "Résultat net = Résultat avant impôt − Impôt sur les sociétés",
      },
    ],
  },
  {
    icon: "#i-finance",
    title: "4. Trésorerie",
    items: [
      {
        term: "Trésorerie disponible",
        desc: "Somme de tous les soldes des comptes bancaires d'ASTRAEOS (compte courant, livret épargne, comptes secondaires).",
      },
      {
        term: "Autonomie financière",
        desc: "Nombre de mois pendant lesquels ASTRAEOS peut fonctionner avec la trésorerie actuelle, au taux moyen actuel des charges, sans aucun encaissement.",
        formula: "Autonomie = Trésorerie ÷ Charges mensuelles moyennes",
      },
    ],
  },
  {
    icon: "#i-business",
    title: "5. Indicateurs SaaS spécifiques",
    items: [
      {
        term: "Revenu mensuel récurrent (MRR)",
        desc: "Somme de tous les abonnements mensuels actifs. Indicateur clé de la santé d'un SaaS car il représente le revenu prévisible récurrent.",
        formula: "MRR = Σ(abonnements mensuels actifs)",
      },
      {
        term: "Revenu annuel récurrent (ARR)",
        desc: "Projection annuelle du MRR : MRR × 12 mois. Permet de visualiser l'ordre de grandeur du revenu récurrent annualisé.",
      },
      {
        term: "Cumul depuis janvier (anciennement YTD)",
        desc: "Total cumulé d'un indicateur depuis le 1er janvier de l'année en cours jusqu'à la date actuelle. Permet de comparer N vs N-1 sur la même période écoulée.",
      },
    ],
  },
];
