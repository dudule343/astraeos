// Dérivation pipeline v40 — fonctions pures, sans dépendance Next/Supabase.

export type Dossier = {
  id: string;
  stage: string;
  name: string;
  priority: string | null;
  dciPct: number | null;
  entryDate: string | null;
  stageEnteredAt: string | null;
  deliveredAt: string | null;
  restitDate: string | null;
  daysInStage: number | null;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Différence en jours entiers entre `date` et maintenant (positif = passé). */
export function joursDepuis(date: string | null | undefined, now: Date = new Date()): number | null {
  if (!date) return null;
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((now.getTime() - t) / MS_PER_DAY);
}

/** Ancienneté dans l'étape courante : stage_entered_at, fallback days_in_stage_cached. */
export function joursEnEtape(d: Dossier, now: Date = new Date()): number | null {
  const fromTimestamp = joursDepuis(d.stageEnteredAt, now);
  if (fromTimestamp != null) return fromTimestamp;
  return d.daysInStage ?? null;
}

/** Retard de restitution en Production (jours depuis la date prévue passée), sinon null. */
export function retardRestitution(d: Dossier, now: Date = new Date()): number | null {
  if (d.stage !== "04_etudes" || !d.restitDate) return null;
  const j = joursDepuis(d.restitDate, now);
  if (j == null || j <= 0) return null;
  return j;
}

/**
 * Conservateur : on ne marque en alerte que si la donnée nécessaire existe.
 * - priority urgent → toujours.
 * - 02_compliance & joursEnEtape > 21.
 * - 04_etudes & restitution prévue dépassée.
 * - 04_etudes & joursEnEtape > 25.
 */
export function isAlerte(d: Dossier, now: Date = new Date()): boolean {
  if (d.priority === "urgent") return true;
  const jours = joursEnEtape(d, now);
  if (d.stage === "02_compliance" && jours != null && jours > 21) return true;
  if (d.stage === "04_etudes") {
    if (retardRestitution(d, now) != null) return true;
    if (jours != null && jours > 25) return true;
  }
  return false;
}

/** Libellé court du badge d'alerte (null si pas en alerte). */
export function alerteBadge(d: Dossier, now: Date = new Date()): string | null {
  if (d.priority === "urgent") return "⚠ Urgent";
  const jours = joursEnEtape(d, now);
  if (d.stage === "02_compliance" && jours != null && jours > 21) return "⚠ Alerte KYC";
  if (d.stage === "04_etudes") {
    const retard = retardRestitution(d, now);
    if (retard != null) return `⚠ Retard ${retard}j`;
    if (jours != null && jours > 25) return "⚠ Production en retard";
  }
  return null;
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  const t = new Date(date);
  if (Number.isNaN(t.getTime())) return "—";
  return t.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Ligne de contexte de la carte, selon l'étape et les données réelles. */
export function carteContexte(d: Dossier, now: Date = new Date()): string {
  const jours = joursEnEtape(d, now);
  switch (d.stage) {
    case "01_prospect":
      return `Prospect · ouvert le ${formatDate(d.entryDate)}`;
    case "02_compliance":
      return jours != null ? `KYC en cours · ${jours} j` : "KYC en cours";
    case "03_collecte":
      return `Collecte documents · DCI ${d.dciPct ?? 0}%`;
    case "04_etudes":
      if (d.restitDate) return `Restitution prévue ${formatDate(d.restitDate)}`;
      return jours != null ? `Étude en rédaction · ${jours} j` : "Étude en rédaction";
    case "05_restituee":
      return "Restituée";
    case "06_suivi":
      return `Suivi · prochain RDV ${formatDate(d.restitDate)}`;
    default:
      return "";
  }
}

/** Badge d'état coloré (hors alerte) selon l'étape. */
export type EtatBadge = { text: string; tone: "gold" | "blue" | "success" } | null;

export function etatBadge(d: Dossier, now: Date = new Date()): EtatBadge {
  switch (d.stage) {
    case "01_prospect":
      return { text: "Nouveau · à qualifier", tone: "blue" };
    case "02_compliance":
      return { text: "PEP check", tone: "gold" };
    case "03_collecte":
      return null; // barre de progression à la place
    case "04_etudes":
      return { text: "Doc collecte envoyé", tone: "gold" };
    case "05_restituee": {
      const j = joursDepuis(d.restitDate, now);
      if (d.restitDate && j != null && j < 0) return { text: `📅 J${j}`, tone: "gold" };
      return { text: "✓ Livrée", tone: "success" };
    }
    case "06_suivi":
      return { text: "Suivi annuel", tone: "blue" };
    default:
      return null;
  }
}
