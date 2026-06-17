// Helpers purs portés du HTML d'origine (countSectionStatuses, buildItemSummary,
// buildGroupSummary, buildSectionSynthesis, checkCrossSectionAlerts).
// Différence clé avec le HTML : ils ne produisent PLUS de chaîne HTML. Ils
// renvoient des données structurées, le balisage (<strong>) est rendu en JSX
// côté composant → aucune interpolation HTML, donc la classe XSS disparaît.
import type { DciGroup, SessionField, SessionSection } from "./types";

export type StatusCounts = {
  total: number;
  validated: number;
  aiSuggest: number;
  aiDisagree: number;
  empty: number;
};

export function countSectionStatuses(section: SessionSection): StatusCounts {
  let total = 0,
    validated = 0,
    aiSuggest = 0,
    aiDisagree = 0,
    empty = 0;
  const tally = (f: SessionField) => {
    total++;
    if (f.status === "validated" || f.status === "ai-agree") validated++;
    if (f.status === "ai-suggest") aiSuggest++;
    if (f.status === "ai-disagree") aiDisagree++;
    if (f.status === "empty") empty++;
  };
  (section.groups || []).forEach((g) => {
    if (g.type === "person" || g.type === "block") {
      (g.fields || []).forEach((f) => tally(f as SessionField));
    } else if (g.type === "repeatable") {
      (g.items || []).forEach((it) => (it.fields || []).forEach((f) => tally(f as SessionField)));
    }
  });
  return { total, validated, aiSuggest, aiDisagree, empty };
}

/** Synthèse 1-ligne du titre d'une card répétable (ex: "Léa · 12 ans"). */
export function buildItemSummary(kind: string, fields: SessionField[]): string {
  const get = (label: string) => {
    const f = fields.find((f) => f.label === label || f.label.startsWith(label));
    return f && f.value ? f.value : "";
  };
  const join = (...labels: string[]) => labels.filter(Boolean).join(" · ");
  switch (kind) {
    case "enfant":
      return join(get("Prénom"), get("Âge"));
    case "societe":
      return join(get("Dénomination"), get("Forme juridique"));
    case "immo-usage":
    case "immo-locatif":
      return join(get("Type de bien"), get("Ville"), get("Surface") ? get("Surface") + " m²" : "");
    case "immo-indirect":
      return join(get("Type"), get("Nom du support"));
    case "av":
      return join(get("Nom du contrat"), get("Compagnie"));
    case "liquidite":
      return join(get("Type de support"), get("Établissement"));
    case "emprunt":
      return join(get("Type de prêt"), get("Établissement"));
    case "evenement":
      return join(get("Nature"), get("Date"));
    case "objectif":
      return join(get("Objectif"), get("Importance"));
    default:
      return "";
  }
}

/** Synthèse compacte d'un groupe replié (texte simple, rendu tel quel en JSX). */
export function buildGroupSummary(g: DciGroup): string {
  if (g.type === "person") {
    const fields = (g.fields || []) as SessionField[];
    const get = (key: string) => fields.find((f) => f.key === key && f.value)?.value || "";
    const find = (label: string) => fields.find((f) => f.label === label && f.value)?.value || "";
    const civ = get("civilite"),
      prenom = get("prenom"),
      nom = get("nom"),
      naiss = get("naissance"),
      datenais = get("datenais"),
      age = get("age");
    const nat = find("Nationalité");
    const cap = find("Capacité juridique");
    const nomComplet =
      civ && prenom && nom
        ? `${civ} ${prenom} ${nom}${naiss && naiss !== nom ? "-" + naiss : ""}`
        : prenom || nom || "Identité incomplète";
    return [
      nomComplet,
      age || (datenais ? "né(e) le " + datenais : ""),
      datenais && age ? "né(e) le " + datenais : "",
      nat,
      cap,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  if (g.type === "block") {
    return (g.fields || [])
      .filter((f) => f.value)
      .slice(0, 4)
      .map((f) => f.value)
      .join(" · ");
  }
  // repeatable
  if (!g.items || g.items.length === 0) return "";
  return g.items
    .map((it) => buildItemSummary(g.kind, it.fields as SessionField[]))
    .filter(Boolean)
    .join(" · ");
}

export type SynthLine = { label: string; value: string };
export type SectionSynthesis = { title: string; lines: SynthLine[] } | null;

/** Totaux patrimoniaux cumulés d'un groupe répétable. Renvoie des données
 *  structurées (label + valeur) ; le <strong> est rendu en JSX. */
export function buildSectionSynthesis(g: DciGroup): SectionSynthesis {
  if (g.type !== "repeatable" || !g.items || g.items.length === 0) return null;
  const items = g.items;
  const sumField = (label: string): number | null => {
    let total = 0,
      hasAny = false;
    items.forEach((it) => {
      const f = it.fields.find((f) => f.label === label || f.label.startsWith(label));
      if (f && f.value) {
        const n = parseFloat(String(f.value).replace(/[^\d,.-]/g, "").replace(",", "."));
        if (!isNaN(n)) {
          total += n;
          hasAny = true;
        }
      }
    });
    return hasAny ? total : null;
  };
  const eur = (n: number) => n.toLocaleString("fr-FR") + " €";
  const lines: SynthLine[] = [];
  const push = (label: string, v: number | null, suffix = "") => {
    if (v !== null) lines.push({ label, value: eur(v) + suffix });
  };
  switch (g.kind) {
    case "immo-usage":
      push("Valeur brute cumulée", sumField("Valeur brute actuelle estimée"));
      break;
    case "immo-locatif":
      push("Valeur brute cumulée", sumField("Valeur brute actuelle estimée"));
      push("Loyers annuels cumulés", sumField("Loyer annuel hors charges"));
      break;
    case "societe":
      push("Valorisation cumulée", sumField("Valeur estimée de la société"));
      break;
    case "liquidite":
      push("Total liquidités", sumField("Montant actuel"));
      break;
    case "av":
      push("Encours AV cumulés", sumField("Valorisation actuelle"));
      break;
    case "emprunt":
      push("Capital restant dû cumulé", sumField("Capital restant dû"));
      {
        const m = sumField("Mensualité hors assurance");
        if (m !== null) lines.push({ label: "Mensualités cumulées", value: eur(m) + "/mois" });
      }
      break;
    case "immo-indirect":
      push("Encours indirects cumulés", sumField("Valorisation actuelle"));
      break;
    default:
      break;
  }
  if (lines.length === 0) return null;
  return {
    title: `Synthèse · ${items.length} élément${items.length > 1 ? "s" : ""}`,
    lines,
  };
}

export type CrossAlert = {
  section: string;
  level: "danger";
  title: string;
  /** Nom de société, déjà sûr (rendu en JSX). */
  nom: string;
};

/** Alertes croisées inter-champs (ex: société à prépondérance immobilière +
 *  Pacte Dutreil = incompatible, art. 787 B CGI). Renvoie les ingrédients ;
 *  le message est rendu en JSX dans le composant. */
export function checkCrossSectionAlerts(sections: SessionSection[]): CrossAlert[] {
  const alerts: CrossAlert[] = [];
  sections.forEach((s) => {
    (s.groups || []).forEach((g) => {
      if (g.type === "repeatable" && g.kind === "societe") {
        g.items.forEach((it) => {
          const prepImmo = it.fields.find((f) => f.label.includes("prépondérance immobilière"));
          const dutreil = it.fields.find((f) => f.label.includes("Pacte Dutreil"));
          if (prepImmo?.value === "Oui" && dutreil?.value === "Oui") {
            const nom =
              it.fields.find((f) => f.label.includes("Dénomination"))?.value || "Cette société";
            alerts.push({ section: s.id, level: "danger", title: "Incompatibilité Pacte Dutreil", nom });
          }
        });
      }
    });
  });
  return alerts;
}
