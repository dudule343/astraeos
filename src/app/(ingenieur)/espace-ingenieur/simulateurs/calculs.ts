// Moteur de calcul des simulateurs ingénieur.
// Calculs purs, sans dépendance ni DB. Les barèmes fiscaux (IFI, donation,
// succession, PER) reprennent les valeurs publiques en vigueur (2024-2025) :
// ce sont des constantes légales stables, pas une donnée éditable en base.

export const EUR = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export const EUR2 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export const PCT = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  maximumFractionDigits: 2,
});

/* ── Investissement financier : intérêts composés ───────────────────────── */

export type FinancierInput = {
  capital: number; // capital de départ
  versement: number; // versement mensuel
  taux: number; // taux annuel en %
  annees: number; // horizon en années
};

export type FinancierResult = {
  valeurFinale: number;
  totalVerse: number;
  interets: number;
  serie: { annee: number; valeur: number; verse: number }[];
};

export function calcFinancier(i: FinancierInput): FinancierResult {
  const r = i.taux / 100 / 12;
  const mois = Math.round(i.annees * 12);
  let valeur = i.capital;
  const serie: FinancierResult["serie"] = [
    { annee: 0, valeur: i.capital, verse: i.capital },
  ];
  for (let m = 1; m <= mois; m++) {
    valeur = valeur * (1 + r) + i.versement;
    if (m % 12 === 0) {
      serie.push({
        annee: m / 12,
        valeur,
        verse: i.capital + i.versement * m,
      });
    }
  }
  const totalVerse = i.capital + i.versement * mois;
  return {
    valeurFinale: valeur,
    totalVerse,
    interets: valeur - totalVerse,
    serie,
  };
}

/* ── Prêt immobilier : mensualité, coût, amortissement ──────────────────── */

export type PretInput = {
  montant: number;
  taux: number; // taux nominal annuel en %
  duree: number; // en années
  assurance: number; // taux assurance annuel en % du capital initial
};

export type PretResult = {
  mensualite: number; // hors assurance
  mensualiteAssurance: number;
  mensualiteTotale: number;
  coutCredit: number; // intérêts seuls
  coutTotal: number; // intérêts + assurance
  taeg: number; // approximation TAEG en %
};

export function calcPret(i: PretInput): PretResult {
  const n = Math.round(i.duree * 12);
  const r = i.taux / 100 / 12;
  const mensualite =
    r === 0 ? i.montant / n : (i.montant * r) / (1 - Math.pow(1 + r, -n));
  const mensualiteAssurance = (i.montant * (i.assurance / 100)) / 12;
  const totalInterets = mensualite * n - i.montant;
  const totalAssurance = mensualiteAssurance * n;
  // TAEG approché : taux qui égalise le capital aux flux mensuels totaux.
  const fluxMensuel = mensualite + mensualiteAssurance;
  const taeg = solveTaeg(i.montant, fluxMensuel, n);
  return {
    mensualite,
    mensualiteAssurance,
    mensualiteTotale: fluxMensuel,
    coutCredit: totalInterets,
    coutTotal: totalInterets + totalAssurance,
    taeg,
  };
}

function solveTaeg(capital: number, flux: number, n: number): number {
  // Bissection sur le taux mensuel pour retrouver le flux observé.
  let lo = 0;
  let hi = 1; // 100 %/mois borne haute
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    const m =
      mid === 0 ? capital / n : (capital * mid) / (1 - Math.pow(1 + mid, -n));
    if (m > flux) hi = mid;
    else lo = mid;
  }
  const mensuel = (lo + hi) / 2;
  return (Math.pow(1 + mensuel, 12) - 1) * 100;
}

/* ── IFI : barème 2024 ──────────────────────────────────────────────────── */

export type IfiInput = {
  patrimoineNet: number; // valeur nette taxable (après dettes)
};

const IFI_TRANCHES = [
  { jusqu: 800_000, taux: 0 },
  { jusqu: 1_300_000, taux: 0.005 },
  { jusqu: 2_570_000, taux: 0.007 },
  { jusqu: 5_000_000, taux: 0.01 },
  { jusqu: 10_000_000, taux: 0.0125 },
  { jusqu: Infinity, taux: 0.015 },
];

export function calcIfi(i: IfiInput): { du: boolean; impot: number } {
  // L'IFI n'est dû qu'au-delà de 1,3 M€ mais se calcule dès 800 k€.
  if (i.patrimoineNet < 1_300_000) {
    return { du: false, impot: 0 };
  }
  let impot = 0;
  let bas = 0;
  for (const t of IFI_TRANCHES) {
    if (i.patrimoineNet <= bas) break;
    const haut = Math.min(i.patrimoineNet, t.jusqu);
    impot += (haut - bas) * t.taux;
    bas = t.jusqu;
  }
  return { du: true, impot };
}

/* ── Donation en ligne directe : abattement 100 000 € / 15 ans ──────────── */

export type DonationInput = {
  montant: number;
  abattementDejaUtilise: number; // sur les 15 dernières années
};

const DONATION_ABATTEMENT = 100_000; // par parent et par enfant, sur 15 ans
const DONATION_TRANCHES = [
  { jusqu: 8_072, taux: 0.05 },
  { jusqu: 12_109, taux: 0.1 },
  { jusqu: 15_932, taux: 0.15 },
  { jusqu: 552_324, taux: 0.2 },
  { jusqu: 902_838, taux: 0.3 },
  { jusqu: 1_805_677, taux: 0.4 },
  { jusqu: Infinity, taux: 0.45 },
];

export function calcDonation(i: DonationInput): {
  abattementRestant: number;
  baseTaxable: number;
  droits: number;
} {
  const abattementRestant = Math.max(
    0,
    DONATION_ABATTEMENT - i.abattementDejaUtilise,
  );
  const baseTaxable = Math.max(0, i.montant - abattementRestant);
  return {
    abattementRestant,
    baseTaxable,
    droits: baremeProgressif(baseTaxable, DONATION_TRANCHES),
  };
}

/* ── Succession en ligne directe : abattement 100 000 € ─────────────────── */

export type SuccessionInput = {
  partNette: number; // part nette revenant à l'héritier
};

export function calcSuccession(i: SuccessionInput): {
  baseTaxable: number;
  droits: number;
} {
  const baseTaxable = Math.max(0, i.partNette - DONATION_ABATTEMENT);
  // Le barème ligne directe est identique à celui des donations.
  return { baseTaxable, droits: baremeProgressif(baseTaxable, DONATION_TRANCHES) };
}

/* ── PER : économie d'impôt et capital à terme ──────────────────────────── */

export type PerInput = {
  versementAnnuel: number;
  tmi: number; // tranche marginale d'imposition en %
  annees: number;
  rendement: number; // rendement annuel en %
};

export function calcPer(i: PerInput): {
  economieAnnuelle: number;
  economieTotale: number;
  capitalTerme: number;
  totalVerse: number;
} {
  const economieAnnuelle = i.versementAnnuel * (i.tmi / 100);
  const r = i.rendement / 100;
  let capital = 0;
  for (let a = 0; a < i.annees; a++) {
    capital = (capital + i.versementAnnuel) * (1 + r);
  }
  return {
    economieAnnuelle,
    economieTotale: economieAnnuelle * i.annees,
    capitalTerme: capital,
    totalVerse: i.versementAnnuel * i.annees,
  };
}

/* ── util ────────────────────────────────────────────────────────────────── */

function baremeProgressif(
  base: number,
  tranches: { jusqu: number; taux: number }[],
): number {
  let droits = 0;
  let bas = 0;
  for (const t of tranches) {
    if (base <= bas) break;
    const haut = Math.min(base, t.jusqu);
    droits += (haut - bas) * t.taux;
    bas = t.jusqu;
  }
  return droits;
}
