export const CLIENT_BASE = "/espace-client";

export type ClientNavItem = {
  href: string;
  label: string;
  /** Numéro d'étape affiché dans la pastille (parcours rassurant). */
  step: string;
};

/** Navigation du portail client — parcours en étapes, pas l'UI admin CGP. */
export const CLIENT_NAV: ClientNavItem[] = [
  { href: CLIENT_BASE, label: "Tableau de bord", step: "1" },
  { href: `${CLIENT_BASE}/questionnaire`, label: "Mon questionnaire", step: "2" },
  { href: `${CLIENT_BASE}/questionnaire-risque`, label: "Questionnaire de risque", step: "3" },
  { href: `${CLIENT_BASE}/documents`, label: "Mes documents", step: "4" },
  { href: `${CLIENT_BASE}/suivi`, label: "Suivi & restitution", step: "5" },
];
