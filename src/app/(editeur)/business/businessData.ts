// Données portées 1:1 de la maquette (wireframes-editeur.html, #page-business).
// Valeurs strictement identiques à la maquette, zéro invention.

export type Compare = {
  period: string;
  value: string;
  cls: "up" | "down" | "";
};

export type Kpi = {
  phase: "p1" | "p2";
  label: string;
  value: string;
  unit: string;
  valueCls?: string;
  valueStyle?: React.CSSProperties;
  meta: string;
  compares?: Compare[];
};

export const growthKpis: Kpi[] = [
  {
    phase: "p1",
    label: "Revenu mensuel récurrent",
    value: "128 400",
    unit: "€",
    meta: "projeté · mai 2026",
    compares: [
      { period: "M-1 · avr 2026", value: "▲ 114 200 €", cls: "up" },
      { period: "N-1 · mai 2025", value: "▲ 41 200 €", cls: "up" },
    ],
  },
  {
    phase: "p1",
    label: "Revenu annuel récurrent",
    value: "1,54",
    unit: "M€",
    meta: "projection 12 mois glissants",
    compares: [
      { period: "M-1", value: "▲ 1,37 M€", cls: "up" },
      { period: "N-1", value: "▲ 494 K€", cls: "up" },
    ],
  },
  {
    phase: "p1",
    label: "Croissance mensuelle des revenus récurrents",
    value: "+12,4",
    unit: "%",
    valueCls: "up arrow-up",
    meta: "vs mois précédent",
    compares: [
      { period: "M-1", value: "▲ +9,8 %", cls: "up" },
      { period: "N-1", value: "▲ +5,2 %", cls: "up" },
    ],
  },
];

export const volumeKpis: Kpi[] = [
  {
    phase: "p1",
    label: "Acquisitions",
    value: "+3",
    unit: "comptes",
    valueCls: "up arrow-up",
    meta: "nouveaux clients sur la période",
  },
  {
    phase: "p1",
    label: "Désabonnements",
    value: "-1",
    unit: "compte",
    valueCls: "down arrow-down",
    valueStyle: { color: "var(--red-text)" },
    meta: "départ sur la période",
  },
  {
    phase: "p1",
    label: "Mouvement net",
    value: "+2",
    unit: "comptes",
    valueCls: "up arrow-up",
    meta: "acquisitions − désabonnements",
  },
  {
    phase: "p2",
    label: "Durée moyenne d'utilisation",
    value: "22",
    unit: "mois",
    meta: "temps moyen d'un client sur ASTRAEOS",
  },
];

export const ltvKpis: Kpi[] = [
  {
    phase: "p1",
    label: "Valeur de vie client moyenne",
    value: "42 800",
    unit: "€",
    meta: "sur 36 mois en moyenne",
    compares: [
      { period: "T-1", value: "▲ 38 200 €", cls: "up" },
      { period: "N-1", value: "▲ 24 800 €", cls: "up" },
    ],
  },
  {
    phase: "p1",
    label: "Coût d'acquisition client",
    value: "3 200",
    unit: "€",
    meta: "marketing + ventes amorti sur les acquisitions",
    compares: [
      { period: "T-1", value: "▲ 2 800 €", cls: "down" },
      { period: "N-1", value: "▼ 4 200 €", cls: "up" },
    ],
  },
  {
    phase: "p1",
    label: "Ratio valeur de vie / coût d'acquisition",
    value: "13,4",
    unit: "x",
    meta: "excellent · seuil sain > 3x",
    compares: [
      { period: "T-1", value: "▼ 13,6 x", cls: "" },
      { period: "N-1", value: "▲ 5,9 x", cls: "up" },
    ],
  },
];

export const chartBars: { label: string; height: string }[] = [
  { label: "Juin", height: "32%" },
  { label: "Juil", height: "38%" },
  { label: "Août", height: "46%" },
  { label: "Sept", height: "52%" },
  { label: "Oct", height: "58%" },
  { label: "Nov", height: "64%" },
  { label: "Déc", height: "71%" },
  { label: "Jan", height: "76%" },
  { label: "Fév", height: "79%" },
  { label: "Mars", height: "84%" },
  { label: "Avr", height: "89%" },
  { label: "Mai", height: "100%" },
];

export type ExpansionBadge = { cls: "badge-success" | "badge-warning" | "badge-neutral"; text: string };

export type ExpansionRow = {
  id: number;
  logoCls: string;
  logoText: string;
  name: string;
  typeCls: string;
  typeLabel: string;
  abo: string;
  packs: string;
  total: string;
  vsM1: ExpansionBadge;
  vsN1: ExpansionBadge;
};

export const expansionRows: ExpansionRow[] = [
  {
    id: 1,
    logoCls: "tlogo-priveos",
    logoText: "P",
    name: "PRIVEOS Capital",
    typeCls: "tt-marque",
    typeLabel: "Marque",
    abo: "12 800 €",
    packs: "3 400 €",
    total: "198 200 €",
    vsM1: { cls: "badge-success", text: "▲ +18 %" },
    vsN1: { cls: "badge-success", text: "▲ +210 %" },
  },
  {
    id: 2,
    logoCls: "tlogo-dupont",
    logoText: "D",
    name: "Cabinet Dupont & Associés",
    typeCls: "tt-cabinet",
    typeLabel: "Cabinet",
    abo: "2 400 €",
    packs: "2 800 €",
    total: "36 200 €",
    vsM1: { cls: "badge-success", text: "▲ +24 %" },
    vsN1: { cls: "badge-success", text: "▲ +145 %" },
  },
  {
    id: 3,
    logoCls: "tlogo-montblanc",
    logoText: "MB",
    name: "Mont-Blanc Patrimoine",
    typeCls: "tt-cabinet",
    typeLabel: "Cabinet",
    abo: "2 100 €",
    packs: "1 600 €",
    total: "28 400 €",
    vsM1: { cls: "badge-success", text: "▲ +12 %" },
    vsN1: { cls: "badge-success", text: "▲ +88 %" },
  },
  {
    id: 4,
    logoCls: "tlogo-1",
    logoText: "N",
    name: "Notaire Mercier & Cie",
    typeCls: "tt-pro",
    typeLabel: "Autre pro",
    abo: "1 200 €",
    packs: "3 200 €",
    total: "21 600 €",
    vsM1: { cls: "badge-success", text: "▲ +32 %" },
    vsN1: { cls: "badge-neutral", text: "N/A" },
  },
  {
    id: 5,
    logoCls: "tlogo-2",
    logoText: "L",
    name: "Cabinet Lyonnais",
    typeCls: "tt-cabinet",
    typeLabel: "Cabinet",
    abo: "1 800 €",
    packs: "800 €",
    total: "19 800 €",
    vsM1: { cls: "badge-warning", text: "▲ +4 %" },
    vsN1: { cls: "badge-success", text: "▲ +62 %" },
  },
];
