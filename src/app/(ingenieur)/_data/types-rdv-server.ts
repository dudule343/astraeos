// Module SERVEUR de l'écran « Mes types de rendez-vous ».
//
// IMPORTÉ UNIQUEMENT par la page serveur (agenda/types/page.tsx). JAMAIS par un
// composant client : il importe getSessionContext + createAdminClient.
//
// Source : la table `rdv_types` (catalogue de base des types de RDV de
// l'ingénieur, scope tenant/cabinet). Quand des lignes existent, elles
// remplacent la liste `types` de la maquette (les champs riches non modélisés —
// documents, message, disponibilités détaillées — prennent des valeurs neutres
// via buildRdvTypeFromCore). Dégrade proprement sur la maquette v28 complète
// quand la base n'est pas configurée, sans session, si la table n'existe pas
// encore, ou si aucun type n'est enregistré.

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import {
  buildRdvTypeFromCore,
  getTypesRdvScreen,
  minutesToDurationLabel,
  type TypesRdvScreen,
} from "./types-rdv";

type RawRdvType = {
  id: string;
  label: string | null;
  duree_min: number | null;
  couleur: string | null;
  actif: boolean | null;
};

export async function getTypesRdvScreenServer(): Promise<TypesRdvScreen> {
  const screen = getTypesRdvScreen();

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return screen;

  try {
    const ctx = await getSessionContext();
    if (!ctx) return screen;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("rdv_types")
      .select("id, label, duree_min, couleur, actif")
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .order("created_at", { ascending: true });

    // Table absente / erreur / aucune ligne : on garde la maquette.
    if (error || !data || data.length === 0) return screen;

    // La table `rdv_types` ne porte pas de colonne `visibility` (catalogue de
    // base seulement) : les types persistés sont publics par défaut.
    const types = (data as RawRdvType[]).map((row, i) =>
      buildRdvTypeFromCore({
        id: row.id,
        name: row.label?.trim() || `Type ${i + 1}`,
        durationLabel: minutesToDurationLabel(row.duree_min ?? 60),
        visibility: "public",
      }),
    );

    return { ...screen, types };
  } catch {
    return screen;
  }
}
