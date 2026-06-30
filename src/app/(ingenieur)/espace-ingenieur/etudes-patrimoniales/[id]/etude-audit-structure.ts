/**
 * Squelette FIXE du document d'audit patrimonial (sommaire + table des
 * matières). Module PUR : aucune dépendance serveur, aucun "use client" —
 * importable par la page (Server Component) comme par les composants client.
 *
 * Il décrit la STRUCTURE du document (titres de sections, sous-rubriques,
 * partie « Ingénierie » encore à produire), telle qu'établie par la maquette.
 * Ce sont des libellés de squelette, pas des données client : ils sont donc
 * codés en dur, à l'identique de la maquette. Les valeurs de données (montants,
 * noms…) restent, elles, pilotées par l'étude et affichées en état vide honnête.
 */

/** Une section d'audit : ancre de navigation + titre. */
export type AuditSection = {
  /** id de l'ancre (utilisé par le sommaire, la TdM et le scroll). */
  id: string;
  /** titre affiché (head de section + sommaire). */
  title: string;
};

/** Les 12 sections de la partie « Audit patrimonial » (ordre maquette). */
export const AUDIT_SECTIONS: AuditSection[] = [
  { id: "introduction", title: "Introduction" },
  { id: "situation", title: "Situation du foyer" },
  { id: "objectifs", title: "Rappel des objectifs du client" },
  { id: "patrimoine", title: "Analyse du patrimoine" },
  { id: "budget", title: "Analyse du budget" },
  { id: "retraite", title: "Analyse de la retraite" },
  { id: "fiscalite", title: "Analyse de la fiscalité" },
  { id: "societes", title: "Analyse des sociétés" },
  { id: "assurances", title: "Analyse des assurances" },
  { id: "matrimonial", title: "Analyse matrimoniale" },
  { id: "successoral", title: "Analyse successorale" },
  { id: "risques", title: "Synthèse des risques" },
];

/**
 * Partie « Ingénierie patrimoniale » : encore à produire. Listée en todo dans
 * le sommaire (grisée, non navigable) — honnête : ces sections n'existent pas
 * encore dans le document.
 */
export const INGENIERIE_TODO: string[] = [
  "Préconisations",
  "Chiffrage des préconisations",
  "Synthèse des risques et préconisations",
  "Tableaux annexes",
  "Conclusion",
  "Disclaimers",
];

/** Une ligne de la table des matières. */
export type TocEntry =
  | { kind: "part"; label: string }
  | { kind: "lvl1"; label: string; go: string }
  | { kind: "lvl1-todo"; label: string }
  | { kind: "lvl2"; label: string };

/**
 * Table des matières du document, reprise fidèlement de la maquette. Les
 * NUMÉROS DE PAGE de la maquette sont volontairement omis : le document
 * interactif n'est pas paginé, afficher des numéros serait une fausse donnée.
 * Les rubriques de niveau 1 (lvl1) sont cliquables ; les sous-rubriques (lvl2)
 * sont des repères ; la partie « Ingénierie » est en todo (non navigable).
 */
export const TOC_ENTRIES: TocEntry[] = [
  { kind: "part", label: "Audit patrimonial" },
  { kind: "lvl1", label: "Introduction", go: "introduction" },
  { kind: "lvl1", label: "Situation du foyer", go: "situation" },
  { kind: "lvl2", label: "Composition du foyer" },
  { kind: "lvl2", label: "Coordonnées" },
  { kind: "lvl2", label: "Fiscalité" },
  { kind: "lvl2", label: "Régime matrimonial" },
  { kind: "lvl2", label: "Évènements familiaux" },
  { kind: "lvl2", label: "Situation professionnelle" },
  { kind: "lvl1", label: "Rappel des objectifs du client", go: "objectifs" },
  { kind: "lvl2", label: "Optimisation de la structure professionnelle et de l'efficience fiscale" },
  { kind: "lvl2", label: "Planification de l'autonomie financière et préparation de la retraite" },
  { kind: "lvl2", label: "Protection du conjoint et organisation d'une dévolution successorale maîtrisée" },
  { kind: "lvl1", label: "Analyse du patrimoine", go: "patrimoine" },
  { kind: "lvl2", label: "Synthèse du patrimoine" },
  { kind: "lvl2", label: "Analyse des classes d'actifs" },
  { kind: "lvl2", label: "Analyse du passif" },
  { kind: "lvl1", label: "Analyse du budget", go: "budget" },
  { kind: "lvl2", label: "Synthèse du budget" },
  { kind: "lvl2", label: "Composition des revenus" },
  { kind: "lvl2", label: "Composition des charges" },
  { kind: "lvl2", label: "Analyse des ratios" },
  { kind: "lvl1", label: "Analyse de la retraite", go: "retraite" },
  { kind: "lvl1", label: "Analyse de la fiscalité", go: "fiscalite" },
  { kind: "lvl2", label: "Composition de la fiscalité" },
  { kind: "lvl1", label: "Analyse des sociétés", go: "societes" },
  { kind: "lvl2", label: "Analyse juridique" },
  { kind: "lvl2", label: "Analyse sociale" },
  { kind: "lvl2", label: "Optimisation de la trésorerie" },
  { kind: "lvl2", label: "Optimisation fiscale" },
  { kind: "lvl1", label: "Analyse des assurances", go: "assurances" },
  { kind: "lvl2", label: "Assurance des personnes" },
  { kind: "lvl2", label: "Assurance des biens" },
  { kind: "lvl1", label: "Analyse matrimoniale", go: "matrimonial" },
  { kind: "lvl2", label: "Régime matrimonial" },
  { kind: "lvl2", label: "Conséquences quant à la gestion des biens" },
  { kind: "lvl2", label: "Responsabilité face aux dettes" },
  { kind: "lvl2", label: "Conséquences en cas de séparation" },
  { kind: "lvl2", label: "Aménagements du contrat de mariage" },
  { kind: "lvl1", label: "Analyse successorale", go: "successoral" },
  { kind: "lvl2", label: "Droits successoraux au sein du foyer" },
  { kind: "lvl2", label: "Analyse des successions selon l'ordre des départs" },
  { kind: "lvl1", label: "Synthèse des risques", go: "risques" },
  { kind: "part", label: "Ingénierie patrimoniale" },
  { kind: "lvl1-todo", label: "Préconisations" },
  { kind: "lvl1-todo", label: "Chiffrage des préconisations" },
  { kind: "lvl1-todo", label: "Synthèse des risques et préconisations" },
  { kind: "lvl1-todo", label: "Tableaux annexes" },
  { kind: "lvl1-todo", label: "Conclusion" },
  { kind: "lvl1-todo", label: "Disclaimers" },
];

/**
 * Heure de validation « HH:MM » depuis l'ISO `valide_at`. Chaîne vide si
 * absente / invalide (le tampon n'affiche alors pas d'heure).
 */
export function formatHeureValidation(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
