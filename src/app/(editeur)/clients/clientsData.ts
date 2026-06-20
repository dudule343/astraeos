// Données portées à l'identique de la maquette (wireframes-editeur.html, #page-clients).
// Aucune valeur n'est inventée : libellés, chiffres, badges et lignes sont VERBATIM.

export type Kpi = { label: string; value: string; unit?: string; meta: string };

export const kpis: Kpi[] = [
  { label: "Total clients", value: "23", meta: "portefeuille global" },
  { label: "Marques", value: "3", meta: "franchise · licence · réseau" },
  { label: "Cabinets directs", value: "17", meta: "indépendants + mandataires" },
  { label: "Autres professionnels", value: "3", meta: "notaires · avocats · EC" },
  { label: "Total ingénieurs", value: "~280", meta: "utilisateurs créés" },
  {
    label: "Revenu mensuel récurrent",
    value: "128 400",
    unit: "€",
    meta: "cumul mensuel récurrent",
  },
];

export type QuickFilter = { label: string; count: string };

export const quickFilters: QuickFilter[] = [
  { label: "Tous", count: "23" },
  { label: "Marques", count: "3" },
  { label: "Cabinets directs", count: "17" },
  { label: "Autres pros", count: "3" },
  { label: "À risque", count: "3" },
];
