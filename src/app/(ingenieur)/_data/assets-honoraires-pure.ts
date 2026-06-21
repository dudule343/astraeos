// Module PUR de l'axe « Honoraires de conseil ». Types, données de repli
// (maquette v28), builders purs (écran + CSV). AUCUN import serveur : importable
// par les composants `"use client"` (HonorairesTable, ExportHonorairesButton).

import { formatDateFr, formatEurosFr, toCsv, type StudyFeeRow } from "./assets-pure";

export type HonorairesKpi = {
  label: string;
  value: string;
  unit?: string;
  valueGold?: boolean;
  meta: string;
  compare: { period: "M-1" | "T-1" | "N-1"; value: string; dir: "up" | "down" }[];
};

export type EtudeMission = {
  /** Identifiant du dossier d'étude (cible de navigation). */
  dossierId: string;
  initials: string;
  client: string;
  entreeRelation: string;
  typesConseil: string[];
  datesEtude: string[];
  honoraires: string;
};

export type RepartitionMission = {
  count: number;
  label: string;
  meta: string;
};

export type HonorairesTotal = {
  resume: string;
  montant: string;
};

export type AssetsHonorairesScreen = {
  kpis: HonorairesKpi[];
  missions: EtudeMission[];
  total: HonorairesTotal;
  repartition: RepartitionMission[];
};

const FALLBACK_KPIS: HonorairesKpi[] = [
  {
    label: "Études et missions réalisées",
    value: "4",
    valueGold: true,
    meta: "cumul 2026 · portefeuille",
    compare: [
      { period: "M-1", value: "+1", dir: "up" },
      { period: "T-1", value: "+2", dir: "up" },
      { period: "N-1", value: "+3", dir: "up" },
    ],
  },
  {
    label: "Honoraires HT facturés",
    value: "48 800",
    unit: "€",
    meta: "cumul 2026 · portefeuille",
    compare: [
      { period: "M-1", value: "+12 800 €", dir: "up" },
      { period: "T-1", value: "+18 %", dir: "up" },
      { period: "N-1", value: "+24 %", dir: "up" },
    ],
  },
  {
    label: "Honoraire moyen",
    value: "12 200",
    unit: "€",
    meta: "moyenne du portefeuille",
    compare: [
      { period: "M-1", value: "+8 %", dir: "up" },
      { period: "T-1", value: "+4 %", dir: "up" },
      { period: "N-1", value: "+6 %", dir: "up" },
    ],
  },
];

const FALLBACK_MISSIONS: EtudeMission[] = [
  {
    dossierId: "etu-2026-014",
    initials: "BD",
    client: "Bertrand & Monique DUPONT-TOPIN",
    entreeRelation: "15/03/2025",
    typesConseil: ["Étude patrimoniale", "Immatriculation de société", "Pacte d'associés"],
    datesEtude: ["12/05/2026", "03/04/2026", "22/04/2026"],
    honoraires: "12 800 €",
  },
  {
    dossierId: "etu-2025-lamoureux",
    initials: "PL",
    client: "Pierre LAMOUREUX",
    entreeRelation: "04/03/2024",
    typesConseil: ["Étude patrimoniale", "Optimisation rémunération gérant"],
    datesEtude: ["22/05/2025", "14/09/2025"],
    honoraires: "14 200 €",
  },
  {
    dossierId: "etu-2026-huyghe",
    initials: "AH",
    client: "Albert & Cécile HUYGHE",
    entreeRelation: "22/01/2025",
    typesConseil: ["Étude patrimoniale"],
    datesEtude: ["14/04/2026"],
    honoraires: "10 800 €",
  },
  {
    dossierId: "etu-2025-lacroix",
    initials: "ML",
    client: "Maître LACROIX",
    entreeRelation: "12/01/2024",
    typesConseil: ["Étude patrimoniale"],
    datesEtude: ["28/02/2025"],
    honoraires: "11 000 €",
  },
];

const FALLBACK_TOTAL: HonorairesTotal = {
  resume: "4 études réalisées · 4 clients sur 7",
  montant: "48 800 €",
};

const FALLBACK_REPARTITION: RepartitionMission[] = [
  { count: 2, label: "Étude patrimoniale", meta: "50 % du portefeuille" },
  { count: 1, label: "Optimisation de la rémunération du gérant", meta: "25 % du portefeuille" },
  { count: 1, label: "Immatriculation de sociétés", meta: "25 % · statuts et / ou pacte d'associés" },
];

/** Données de repli : maquette v28 (rendu identique sans base / base vide). */
export const FALLBACK_HONORAIRES: AssetsHonorairesScreen = {
  kpis: FALLBACK_KPIS,
  missions: FALLBACK_MISSIONS,
  total: FALLBACK_TOTAL,
  repartition: FALLBACK_REPARTITION,
};

/**
 * Construit l'écran « honoraires de conseil » à partir des commissions
 * study_fee réelles, regroupées par client. Builder PUR.
 */
export function buildHonorairesScreen(fees: StudyFeeRow[]): AssetsHonorairesScreen {
  const byClient = new Map<string, StudyFeeRow[]>();
  for (const f of fees) {
    const arr = byClient.get(f.clientId) ?? [];
    arr.push(f);
    byClient.set(f.clientId, arr);
  }

  const missions: EtudeMission[] = [...byClient.entries()].map(([clientId, rows]) => {
    const total = rows.reduce((a, r) => a + r.amountEur, 0);
    const earliest = rows
      .map((r) => r.date)
      .filter((d): d is string => !!d)
      .sort()[0];
    return {
      dossierId: clientId,
      initials: rows[0].initials,
      client: rows[0].clientName,
      entreeRelation: formatDateFr(earliest ?? null),
      typesConseil: ["Étude patrimoniale"],
      datesEtude: rows.map((r) => formatDateFr(r.date)),
      honoraires: formatEurosFr(total),
    } satisfies EtudeMission;
  });

  const totalHt = fees.reduce((a, f) => a + f.amountEur, 0);
  const count = fees.length;
  const average = count > 0 ? Math.round(totalHt / count) : 0;

  const kpis: HonorairesKpi[] = [
    {
      label: "Études et missions réalisées",
      value: String(count),
      valueGold: true,
      meta: "cumul · portefeuille",
      compare: FALLBACK_KPIS[0].compare,
    },
    {
      label: "Honoraires HT facturés",
      value: formatEurosFr(totalHt).replace(" €", ""),
      unit: "€",
      meta: "cumul · portefeuille",
      compare: FALLBACK_KPIS[1].compare,
    },
    {
      label: "Honoraire moyen",
      value: formatEurosFr(average).replace(" €", ""),
      unit: "€",
      meta: "moyenne du portefeuille",
      compare: FALLBACK_KPIS[2].compare,
    },
  ];

  return {
    kpis,
    missions,
    total: {
      resume: `${count} étude${count > 1 ? "s" : ""} · ${missions.length} client${missions.length > 1 ? "s" : ""}`,
      montant: formatEurosFr(totalHt),
    },
    repartition: [
      {
        count,
        label: "Étude patrimoniale",
        meta: "100 % du portefeuille",
      },
    ],
  };
}

/**
 * CSV du détail des études patrimoniales facturées (source = screen). Une ligne
 * par étude + ligne de total. Helper PUR, consommé par le bouton d'export.
 */
export function buildHonorairesCsv(screen: AssetsHonorairesScreen): string {
  const header = [
    "Client",
    "Entrée en relation",
    "Type(s) de conseil",
    "Date(s) de l'étude",
    "Honoraires facturés",
  ];
  const body = screen.missions.map((m) => [
    m.client,
    m.entreeRelation,
    m.typesConseil.join(" / "),
    m.datesEtude.join(" / "),
    m.honoraires,
  ]);
  const total = ["Total portefeuille", screen.total.resume, "", "", screen.total.montant];
  return toCsv([header, ...body, total]);
}
