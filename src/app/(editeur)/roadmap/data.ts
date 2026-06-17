import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// Roadmap & releases = pilotage PRODUIT interne (backlog / en cours / recette /
// livré). Aucune table du schéma ne modélise un backlog produit, des releases
// logicielles, des tickets ou des bugs : les 16 entités sont strictement métier
// (clients, dossiers, études, souscriptions, commissions…). On ne fabrique donc
// AUCUN faux compteur. timeline_events est un journal d'activité PAR DOSSIER
// client, pas un changelog produit — l'utiliser comme "releases livrées" serait
// inventer une sémantique fausse.
//
// Conséquence honnête : la roadmap est un contenu éditorial assumé (prévisionnel
// édité à la main), sans métrique temps réel. Ce module se contente de vérifier
// que le contexte/tenant est résoluble (sanity check de connexion), et expose un
// indicateur `contextOk` pour que la page puisse, le cas échéant, signaler
// honnêtement l'absence de source de pilotage produit. Il n'invente jamais de
// chiffre.

export type RoadmapCard = {
  title: string;
  meta: string;
  tone?: "blocker" | "done";
};

export type RoadmapColumn = {
  title: string;
  cards: RoadmapCard[];
};

export type RoadmapData = {
  /** Contexte de session résolu (sanity check, pas une métrique produit). */
  contextOk: boolean;
  /**
   * Colonnes de la roadmap produit. Aucune source en base ne les alimente
   * aujourd'hui → liste vide. La page bascule alors sur un état vide honnête.
   * Le jour où une table backlog/releases existera, c'est ici qu'on la lira.
   */
  columns: RoadmapColumn[];
  /** Vrai uniquement si une source réelle alimente la roadmap. Jamais le cas pour l'instant. */
  hasData: boolean;
};

const EMPTY: RoadmapData = {
  contextOk: false,
  columns: [],
  hasData: false,
};

export async function fetchRoadmap(): Promise<RoadmapData> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;

    // Sanity check de connexion : on confirme juste que le tenant existe.
    // On ne dérive AUCUNE métrique produit de la base métier (ce serait inventer).
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("tenants")
      .select("id", { head: true, count: "exact" })
      .eq("id", ctx.tenantId);

    return {
      contextOk: !error,
      // Aucune table de roadmap produit → aucune colonne alimentée par la base.
      columns: [],
      hasData: false,
    };
  } catch {
    return EMPTY;
  }
}
