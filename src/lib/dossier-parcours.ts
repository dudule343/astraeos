/**
 * Parcours patrimonial — dérivation des 6 jalons métier de la fiche dossier (v40).
 *
 * Le wireframe v40 (`#page-ing-fiche-dossier`) impose une timeline FIXE à 6 jalons
 * métier, distincte du journal `timeline_events` brut. Les libellés des étapes et
 * le contenu de l'étape 5 (les 4 parties du livrable PRIVEOS) sont FIGÉS — ils
 * décrivent le parcours produit, pas une donnée par dossier. Les statuts et les
 * dates qui les enrichissent sont, eux, dérivés des vraies données :
 *
 *  - source d'autorité de l'avancement : `dossiers.pipeline_stage` → `stageIndex` 1..6 ;
 *  - étude (table `etudes`) : statut/version/livraison du jalon 5, restitution du jalon 6 ;
 *  - conformité (`conformite_items`) : agrégat KYC/LCB-FT pour le KPI + jalon 3.
 *
 * Quand la donnée manque, on reste conservateur : libellé métier figé + statut neutre,
 * pas de date inventée.
 */

import type { ReactNode } from "react";

import type { EtudePhaseKey, EtudeStatus } from "@/lib/etudes";

/** stageIndex 1..6 dérivé du pipeline_stage (`Number(stage.slice(0,2))`). */
export const STAGE_LABELS: Record<string, string> = {
  "01_prospect": "Prospect",
  "02_compliance": "Conformité",
  "03_collecte": "Collecte",
  "04_etudes": "Études",
  "05_restituee": "Restituée",
  "06_suivi": "Suivi",
  "00_archive": "Archivé",
};

export type JalonTone = "done" | "current" | "todo";

/**
 * État d'un jalon (1..6) en fonction de l'étape courante du dossier.
 *  - jalonIndex < stageIndex  → terminé
 *  - jalonIndex === stageIndex → en cours
 *  - jalonIndex > stageIndex  → à venir
 * Les cas spéciaux des jalons 5/6 (étude livrée, restitution J-1) sont gérés
 * par `buildJalons`, qui peut surclasser le statut depuis la table `etudes`.
 */
export function jalonStatus(jalonIndex: number, stageIndex: number): { tone: JalonTone; label: string } {
  if (jalonIndex < stageIndex) return { tone: "done", label: "✓ Terminée" };
  if (jalonIndex === stageIndex) return { tone: "current", label: "En cours" };
  return { tone: "todo", label: "À venir" };
}

/** Position du dégradé or de la ligne verticale (% terminé du parcours). */
export function progressPct(stageIndex: number): number {
  const done = Math.max(0, Math.min(6, stageIndex - 1));
  return Math.round((done / 6) * 100);
}

export type JalonEncart = { titre: string; texte: string };

export type Jalon = {
  num: number;
  eyebrow: string;
  titre: string;
  detail: ReactNode;
  badge: { label: string; tone: JalonTone };
  /** Mise en avant visuelle (étape 5 : fond dégradé). */
  highlight?: boolean;
  /** Carte future en pointillés (étape 6). */
  dashed?: boolean;
  /** Encart blanc bordé (étape 5 : « Étude livrée »). */
  encart?: JalonEncart;
  /** Lien cliquable de la carte (étape 1). */
  href?: string;
};

/** Données d'étude minimales nécessaires à la dérivation des jalons 5/6. */
export type EtudeForParcours = {
  version: number;
  status: EtudeStatus;
  current_phase: EtudePhaseKey | null;
  phase_progress_pct: number | null;
  delivered_at: string | null;
  restitution_meeting_id: string | null;
} | null;

/** Agrégat de conformité pour le jalon 3 et le KPI. */
export type ConformiteForParcours = {
  /** Toutes les pièces présentes sont validées. */
  allValid: boolean;
  /** Au moins une pièce existe en base. */
  hasItems: boolean;
  /** Nombre de pièces validées / total. */
  validCount: number;
  totalCount: number;
  /** Date de signature de la lettre de mission (jalon 3), si dispo. */
  lettreMissionSignedAt: string | null;
};

/**
 * Construit les 6 jalons du parcours v40 à partir des vraies données.
 * `detail` est un ReactNode pour permettre le contenu riche de l'étape 5.
 */
export function buildJalons(args: {
  dossierId: string;
  stageIndex: number;
  createdAt: string;
  representant: string | null;
  etude: EtudeForParcours;
  conformite: ConformiteForParcours;
  fmtDate: (iso: string | null) => string;
}): Jalon[] {
  const { dossierId, stageIndex, createdAt, representant, etude, conformite, fmtDate } = args;
  const acteur = representant ? ` par ${representant}` : "";

  // --- Jalon 1 · Création espace + collecte -------------------------------
  const j1 = jalonStatus(1, stageIndex);
  const jalon1: Jalon = {
    num: 1,
    eyebrow: `Étape 1 · Créée le ${fmtDate(createdAt)}${acteur}`,
    titre: "Création de l'espace client + envoi du document de collecte",
    detail: "Espace client créé · document de collecte simplifié envoyé · le client le complète avant le premier RDV.",
    badge: j1,
    href: `/dossiers/${dossierId}`,
  };

  // --- Jalon 2 · RDV visio + transcription IA -----------------------------
  const j2 = jalonStatus(2, stageIndex);
  const jalon2: Jalon = {
    num: 2,
    eyebrow: "Étape 2 · RDV visio enregistré",
    titre: "RDV visio enregistré + transcription IA + complétion auto-doc",
    detail:
      "Entretien découverte enregistré · transcription IA générée · document de collecte complet rempli automatiquement à partir du transcript et du doc simplifié.",
    badge: j2,
  };

  // --- Jalon 3 · Pack signature + paiement --------------------------------
  // Terminé si la lettre de mission est signée/validée (conformité), sinon dérive du stage.
  const lettreSigned = Boolean(conformite.lettreMissionSignedAt);
  const j3Base = jalonStatus(3, stageIndex);
  const j3: { tone: JalonTone; label: string } = lettreSigned
    ? { tone: "done", label: "✓ Terminée" }
    : j3Base;
  const jalon3: Jalon = {
    num: 3,
    eyebrow: lettreSigned
      ? `Étape 3 · Signé le ${fmtDate(conformite.lettreMissionSignedAt)} · Yousign + Stripe`
      : "Étape 3 · Yousign + Stripe",
    titre: "Envoi du pack pour signature + paiement",
    detail:
      "Pack envoyé : doc entrée en relation · doc collecte complété · lettre de mission · facture · IBAN · étude anonymisée · synthèse anonymisée — signé puis payé.",
    badge: j3,
  };

  // --- Jalon 4 · Espace sécurisé docs -------------------------------------
  const j4 = jalonStatus(4, stageIndex);
  const jalon4: Jalon = {
    num: 4,
    eyebrow: "Étape 4 · Documents demandés organisés par IA",
    titre: "Ouverture espace sécurisé · documents demandés organisés par IA",
    detail:
      "L'IA génère la liste des documents demandés à partir du transcript + collecte signée · le client uploade · l'ingénieur valide puis fixe le RDV de restitution.",
    badge: j4,
  };

  // --- Jalon 5 · Réalisation de l'étude (4 parties) -----------------------
  const etudeLivree =
    etude?.status === "delivered" || Boolean(etude?.delivered_at) || stageIndex >= 5;
  let j5: { tone: JalonTone; label: string };
  if (etudeLivree) {
    j5 = { tone: "done", label: "✓ Livrée" };
  } else if (etude && (etude.status === "in_progress" || etude.status === "draft")) {
    j5 = { tone: "current", label: "En cours" };
  } else {
    j5 = jalonStatus(5, stageIndex);
  }
  const j5Eyebrow = (() => {
    if (etudeLivree && etude?.delivered_at) return `Étape 5 · Livrée le ${fmtDate(etude.delivered_at)}`;
    if (etude && j5.tone === "current") {
      const pct = etude.phase_progress_pct ?? 0;
      return `Étape 5 · Production en cours${pct ? ` · ${pct}%` : ""}`;
    }
    return "Étape 5 · Réalisation de l'étude patrimoniale";
  })();
  const jalon5: Jalon = {
    num: 5,
    eyebrow: j5Eyebrow,
    titre: "Réalisation de l'étude patrimoniale · 4 parties",
    // Contenu MÉTIER FIXE du livrable PRIVEOS (rendu riche injecté dans la page).
    detail: null,
    badge: j5,
    highlight: true,
    encart:
      etudeLivree
        ? {
            titre: `Étude livrée · v${etude?.version ?? 1}.0`,
            texte: etude?.delivered_at
              ? `Révisée par l'ingénieur · version finale livrée le ${fmtDate(etude.delivered_at)}`
              : "Version finale livrée et révisée par l'ingénieur.",
          }
        : undefined,
  };

  // --- Jalon 6 · Restitution ----------------------------------------------
  // 06_suivi → restitution faite. 05_restituee → restitution à venir (J-1, mise en avant).
  const restitFaite = stageIndex >= 6;
  const j6: { tone: JalonTone; label: string } = restitFaite
    ? { tone: "done", label: "✓ Terminée" }
    : { tone: "todo", label: "📅 À venir" };
  const jalon6: Jalon = {
    num: 6,
    eyebrow: etude?.restitution_meeting_id
      ? "Étape 6 · RDV de restitution programmé · Zoom"
      : "Étape 6 · Restitution à planifier",
    titre: "Restitution de l'étude au client",
    detail:
      "RDV de restitution avec le client · enregistrement actif · suivi des actions de mise en œuvre à planifier ensuite.",
    badge: j6,
    dashed: !restitFaite,
  };

  return [jalon1, jalon2, jalon3, jalon4, jalon5, jalon6];
}
