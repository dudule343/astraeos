import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

/**
 * Résout l'en-tête RÉEL d'une fiche conformité à partir d'un id de dossier.
 *
 * La fiche conformité détaillée porte un atelier de génération des livrables
 * (DER / KYC / LM) volontairement démonstratif. Quand l'id correspond à un
 * dossier réel du cabinet, on remplace au moins le hero (nom du foyer, type)
 * pour que le drill-down soit cohérent avec la ligne cliquée, plutôt que
 * d'afficher systématiquement le foyer modèle. Renvoie null si l'id n'est pas
 * un dossier réel (la page retombe alors sur le modèle de la maquette).
 */

export type FicheConformiteHero = {
  client1Lead: string;
  client1Strong: string;
  client2Lead: string;
  client2Strong: string;
  /** Libellé du foyer (« Couple », « Personne seule », « Personne morale »). */
  typeLabel: string;
  /** Le dossier réel a-t-il déjà des pièces de conformité saisies ? */
  hasConformiteItems: boolean;
};

type RawPersonne = {
  role_in_household: string | null;
  first_name: string | null;
  last_name: string | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getFicheConformiteHero(
  id: string,
): Promise<FicheConformiteHero | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  // Les ids de la maquette (« joubert », …) ne sont pas des UUID : on évite une
  // requête garantie vide et on retombe directement sur le modèle.
  if (!UUID_RE.test(id)) return null;
  try {
    const ctx = await getSessionContext();
    if (!ctx) return null;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossiers")
      .select(
        `
          id,
          client:clients!inner (
            household_type,
            personnes ( role_in_household, first_name, last_name )
          ),
          conformite_items ( id )
        `,
      )
      .eq("id", id)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as unknown as {
      client: { household_type: string | null; personnes: RawPersonne[] | null } | null;
      conformite_items: { id: string }[] | null;
    };
    const personnes = row.client?.personnes ?? [];
    if (personnes.length === 0) return null;

    const a = personnes.find((p) => p.role_in_household === "person_a") ?? personnes[0];
    const b = personnes.find((p) => p.role_in_household === "person_b");
    const aFirst = (a.first_name ?? "").trim();
    const aLast = (a.last_name ?? "").trim();

    if (b) {
      const isPacs = row.client?.household_type === "couple_pacs";
      return {
        client1Lead: aFirst ? `${aFirst} ` : "",
        client1Strong: aLast || "Foyer",
        client2Lead: ` & ${(b.first_name ?? "").trim()} `,
        client2Strong: (b.last_name ?? "").trim() || "",
        typeLabel: isPacs ? "Couple PACS" : "Couple",
        hasConformiteItems: (row.conformite_items ?? []).length > 0,
      };
    }

    return {
      client1Lead: aFirst ? `${aFirst} ` : "",
      client1Strong: aLast || "Foyer",
      client2Lead: "",
      client2Strong: "",
      typeLabel: "Personne seule",
      hasConformiteItems: (row.conformite_items ?? []).length > 0,
    };
  } catch {
    return null;
  }
}
