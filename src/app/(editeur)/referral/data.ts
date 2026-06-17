import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// =========================================================================
// Programme de parrainage ASTRAEOS — état réel du schéma.
//
// Le modèle décrit par la page (parrains = marques/cabinets/mandataires qui
// recommandent la SOLUTION ASTRAEOS, commission = 20 % de l'abonnement SaaS
// du filleul, reversée chaque mois) n'a AUCUN support en base :
//   - pas de table `referrals` / `sponsors` / `filleuls`,
//   - commission_type ∈ {upfront, recurring_management, performance, study_fee}
//     → pas de type "referral",
//   - commission_recipient ∈ {brand_owner, cabinet, engineer_bonus}
//     → pas de "parrain",
//   - les commissions/souscriptions portent sur des PRODUITS financiers placés
//     aux clients finaux (AV, SCPI, PER…), pas sur l'abonnement SaaS.
//   → On ne dérive RIEN de ces tables : ce serait un autre objet (inventer).
//
// La SEULE donnée connexe réelle et bien périmétrée : un client final peut en
// avoir recommandé un autre (clients.acquisition_origin = 'recommandation' +
// clients.referrer_client_id). C'est une vue "recommandation entre clients
// finaux" — distincte du programme SaaS de la page. On la calcule honnêtement
// et on l'affiche en l'étiquetant comme telle, sans la faire passer pour le
// programme de parrainage SaaS.
//
// Pattern calqué sur mon-activite/data.ts : getSessionContext() → si null EMPTY ;
// createAdminClient() ; filtre tenant_id / cabinet_id ; try/catch → EMPTY.
// =========================================================================

export const REFERRAL_COMMISSION_RATE = 0.2; // 20 % — règle annoncée du programme (paramètre de design, pas une donnée client)

export type ClientReferral = {
  /** Nombre de clients finaux acquis via recommandation (réel, scoped tenant/cabinet). */
  recommandationCount: number;
  /** Nombre de clients qui ont effectivement été rattachés à un parrain (referrer_client_id non nul). */
  parrainesCount: number;
  /** Nombre de clients distincts ayant recommandé au moins un autre client. */
  parrainsDistincts: number;
};

export type ReferralData = {
  // Programme SaaS : aucune source. Tout reste null → état vide honnête.
  program: {
    parrainsActifs: number | null;
    filleulsRecus: number | null;
    filleulsPayants: number | null;
    caRecurrent: number | null;
    commissionsVersees: number | null;
    sponsors: never[];
    activity: never[];
  };
  // Recommandation entre clients finaux : réel, mais objet distinct du programme.
  clientReferral: ClientReferral;
  hasProgramData: boolean;
  hasClientReferralData: boolean;
};

const EMPTY: ReferralData = {
  program: {
    parrainsActifs: null,
    filleulsRecus: null,
    filleulsPayants: null,
    caRecurrent: null,
    commissionsVersees: null,
    sponsors: [],
    activity: [],
  },
  clientReferral: {
    recommandationCount: 0,
    parrainesCount: 0,
    parrainsDistincts: 0,
  },
  hasProgramData: false,
  hasClientReferralData: false,
};

type ClientRow = {
  id: string;
  acquisition_origin: string | null;
  referrer_client_id: string | null;
};

export async function fetchReferralData(): Promise<ReferralData> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();

    // Seule donnée réelle et périmétrée : recommandations entre clients finaux.
    const { data, error } = await supabase
      .from("clients")
      .select("id, acquisition_origin, referrer_client_id")
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId);

    if (error || !data) {
      return EMPTY;
    }

    const rows = data as ClientRow[];
    const recommandationCount = rows.filter(
      (c) => c.acquisition_origin === "recommandation",
    ).length;
    const parraines = rows.filter((c) => c.referrer_client_id != null);
    const parrainsDistincts = new Set(
      parraines.map((c) => c.referrer_client_id as string),
    ).size;

    const clientReferral: ClientReferral = {
      recommandationCount,
      parrainesCount: parraines.length,
      parrainsDistincts,
    };

    return {
      ...EMPTY,
      clientReferral,
      hasClientReferralData:
        recommandationCount > 0 || parraines.length > 0,
    };
  } catch {
    return EMPTY;
  }
}

/** Affiche un entier réel, ou "—" si nul/zéro/absent. */
export function fmtCount(n: number | null): string {
  if (n == null || !Number.isFinite(n) || n === 0) return "—";
  return n.toLocaleString("fr-FR");
}

/** Affiche un montant réel en euros, ou "—" si nul/zéro/absent. */
export function fmtEur(n: number | null): string {
  if (n == null || !Number.isFinite(n) || n === 0) return "—";
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}
