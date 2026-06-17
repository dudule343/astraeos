import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

// =========================================================================
// Données infra de la page éditeur /infra — vue cabinet (tenant + cabinet).
//
// Le schéma applicatif (db/migrations/0001_initial_schema.sql) ne stocke
// AUCUNE métrique d'infrastructure : pas de monitoring uptime, latence,
// erreurs 5xx, incidents, jobs/cron, comptage de tokens, coûts cloud ou
// bande passante. Ces signaux vivent dans Supabase Platform / Cloudflare /
// un APM, hors Postgres métier. → état vide honnête ("—").
//
// Seuls deux signaux sont réellement dérivables de la base :
//   - Coût IA mensuel : SUM(etudes.total_ai_cost_eur) sur les études du
//     cabinet créées ce mois (etudes n'a pas de tenant_id → jointure via
//     dossiers du cabinet).
//   - Stockage documents : SUM(documents.file_size_bytes) du cabinet
//     (documents porte tenant_id + cabinet_id directement).
// =========================================================================

export type InfraData = {
  /** Coût IA cumulé du mois courant (€), ou null si aucune donnée. */
  coutIaMois: number | null;
  /** Nombre d'études prises en compte dans le coût IA du mois. */
  etudesMoisCount: number;
  /** Volume de stockage documents du cabinet en octets, ou null. */
  stockageBytes: number | null;
  /** Nombre de documents stockés. */
  documentsCount: number;
  /** Au moins une métrique réelle dérivée disponible. */
  hasData: boolean;
};

const EMPTY: InfraData = {
  coutIaMois: null,
  etudesMoisCount: 0,
  stockageBytes: null,
  documentsCount: 0,
  hasData: false,
};

export async function fetchInfra(): Promise<InfraData> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return EMPTY;
    const supabase = createAdminClient();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // --- Coût IA du mois courant ---------------------------------------
    // etudes n'a pas de tenant_id : on passe par les dossiers du cabinet.
    let coutIaMois: number | null = null;
    let etudesMoisCount = 0;

    const { data: dossiers, error: dossiersErr } = await supabase
      .from("dossiers")
      .select("id")
      .eq("cabinet_id", ctx.cabinetId)
      .eq("tenant_id", ctx.tenantId);

    const dossierIds = dossiersErr ? [] : (dossiers ?? []).map((d) => d.id as string);

    if (dossierIds.length > 0) {
      const { data: etudes, error: etudesErr } = await supabase
        .from("etudes")
        .select("total_ai_cost_eur, created_at")
        .in("dossier_id", dossierIds)
        .gte("created_at", monthStart);

      if (!etudesErr && etudes) {
        let sum = 0;
        for (const e of etudes) {
          sum += Number(e.total_ai_cost_eur ?? 0);
        }
        etudesMoisCount = etudes.length;
        // Garde null tant qu'aucune étude n'a de coût (≠ afficher "0 €").
        coutIaMois = sum > 0 ? sum : null;
      }
    }

    // --- Stockage documents du cabinet ---------------------------------
    let stockageBytes: number | null = null;
    let documentsCount = 0;

    const { data: docs, error: docsErr } = await supabase
      .from("documents")
      .select("file_size_bytes")
      .eq("cabinet_id", ctx.cabinetId)
      .eq("tenant_id", ctx.tenantId)
      .neq("status", "archived");

    if (!docsErr && docs) {
      let bytes = 0;
      for (const d of docs) {
        bytes += Number(d.file_size_bytes ?? 0);
      }
      documentsCount = docs.length;
      stockageBytes = bytes > 0 ? bytes : null;
    }

    return {
      coutIaMois,
      etudesMoisCount,
      stockageBytes,
      documentsCount,
      hasData: coutIaMois != null || stockageBytes != null,
    };
  } catch {
    return EMPTY;
  }
}

// ---------------------------------------------------------------------------
// Formatage
// ---------------------------------------------------------------------------

const NBSP = " ";

/** Coût en euros, "—" si absent. */
export function fmtEur(n: number | null): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return "—";
  // Coûts IA souvent < 1 € : on garde 2 décimales sous 100 €, entier au-delà.
  if (n < 100) {
    return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${NBSP}€`;
  }
  return `${Math.round(n).toLocaleString("fr-FR")}${NBSP}€`;
}

/** Octets → libellé lisible (Ko / Mo / Go), "—" si absent. */
export function fmtBytes(bytes: number | null): { value: string; unit: string } {
  if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) {
    return { value: "—", unit: "" };
  }
  const go = bytes / 1e9;
  if (go >= 1) return { value: go.toLocaleString("fr-FR", { maximumFractionDigits: 1 }), unit: "Go" };
  const mo = bytes / 1e6;
  if (mo >= 1) return { value: mo.toLocaleString("fr-FR", { maximumFractionDigits: 1 }), unit: "Mo" };
  const ko = bytes / 1e3;
  return { value: ko.toLocaleString("fr-FR", { maximumFractionDigits: 1 }), unit: "Ko" };
}
