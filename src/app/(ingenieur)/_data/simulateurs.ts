// Simulateurs & calculateurs mis à disposition des cabinets licenciés.
// Source unique pour la page `simulateurs/` (écran maquette `page-ing-out-simulateurs`).
// Valeurs reprises à l'identique de la maquette ingénieur v28 : 6 cartes
// (financier, prêt immobilier, IFI, donation, succession, PER), chacune avec
// son pictogramme premium, son titre et sa description.

export type SimulateurIcon =
  | "financier"
  | "pret-immo"
  | "ifi"
  | "donation"
  | "succession"
  | "per";

export type Simulateur = {
  id: string;
  title: string;
  description: string;
  icon: SimulateurIcon;
};

export const simulateurs: Simulateur[] = [
  {
    id: "financier",
    title: "Investissement financier",
    description:
      "Calculateur d'intérêts composés. Capital de départ, versements mensuels, taux annuel, horizon. Visualisation graphique de la croissance.",
    icon: "financier",
  },
  {
    id: "pret-immo",
    title: "Prêt immobilier",
    description:
      "Simulation de prêt immobilier (prêt simple, prêt gigogne). Calcul des mensualités, durée, TAEG, coût total du crédit, tableau d'amortissement.",
    icon: "pret-immo",
  },
  {
    id: "ifi",
    title: "Impôt sur la Fortune Immobilière",
    description:
      "Calcul de l'IFI selon barème en vigueur, prise en compte des dettes déductibles et abattements.",
    icon: "ifi",
  },
  {
    id: "donation",
    title: "Donation",
    description:
      "Optimisation des donations entre vifs : abattements par enfant, par petit-enfant, durée de réutilisation (15 ans).",
    icon: "donation",
  },
  {
    id: "succession",
    title: "Succession",
    description:
      "Calcul des droits de succession, simulation par héritier, estimation des pénalités selon les barèmes en vigueur.",
    icon: "succession",
  },
  {
    id: "per",
    title: "PER · Plan Épargne Retraite",
    description:
      "Optimisation des versements PER, économie d'impôt selon TMI, simulation de rente future et capital à la sortie.",
    icon: "per",
  },
];

export function getSimulateursScreen() {
  return {
    heroEyebrow: "Outils · simulateurs & calculateurs · consultation & calculateurs",
    heroSub:
      "Outils mis à disposition des cabinets licenciés et des clients : simulations fiscales, financières et immobilières.",
    simulateurs,
  };
}
