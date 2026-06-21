// Module SERVEUR : fetchers Supabase du portefeuille de l'ingénieur connecté.
// IMPORTÉ UNIQUEMENT par les pages serveur (page.tsx) et les modules d'axe
// serveur (assets.ts, assets-financier.ts, …). JAMAIS par un composant client :
// il importe getSessionContext + createAdminClient.
//
// Source unique alignée sur le dirigeant : tables `souscriptions ⨝ produits`,
// `commissions ⨝ souscriptions`, filtrées tenant_id/cabinet_id et — côté
// ingénieur — `souscriptions.engineer_id = ctx.userId`.

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

import {
  initialsOf,
  type ProduitCategory,
  type StudyFeeRow,
  type SubscriptionRow,
  type SubscriptionStatus,
} from "./assets-pure";

const VALID_CATEGORIES = new Set<ProduitCategory>([
  "av_multisupport",
  "av_lux",
  "per",
  "scpi",
  "fpci",
  "opci",
  "structure",
  "prevoyance",
  "credit",
  "autre",
]);

function asCategory(raw: unknown): ProduitCategory {
  return VALID_CATEGORIES.has(raw as ProduitCategory) ? (raw as ProduitCategory) : "autre";
}

function clientNameOf(clientRaw: unknown): string {
  const client = Array.isArray(clientRaw) ? clientRaw[0] : clientRaw;
  const c = client as
    | { personnes?: Array<{ first_name?: string | null; last_name?: string | null }> }
    | null
    | undefined;
  const p = c?.personnes?.[0];
  if (!p) return "";
  return `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
}

function first<T>(raw: T | T[] | null | undefined): T | null {
  if (raw == null) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

/**
 * Souscriptions du portefeuille de l'ingénieur connecté (toutes catégories).
 * Chaque axe filtre ensuite par classe d'actifs. Dégrade à [] si Supabase
 * n'est pas configuré, sans session, ou en cas d'erreur.
 */
export async function fetchEngineerSubscriptions(): Promise<SubscriptionRow[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  const ctx = await getSessionContext();
  if (!ctx) return [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("souscriptions")
      .select(
        `
          id,
          client_id,
          amount_initial,
          subscription_date,
          status,
          produit:produits ( name, category, partner_name ),
          clients ( personnes ( first_name, last_name ) )
        `,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .eq("engineer_id", ctx.userId)
      .order("subscription_date", { ascending: false })
      .limit(500);

    if (error || !data) return [];

    return data.map((row: Record<string, unknown>) => {
      const produit = first(row.produit as unknown) as
        | { name?: string | null; category?: unknown; partner_name?: string | null }
        | null;
      const clientName = clientNameOf(row.clients) || "Dossier sans nom";
      return {
        id: row.id as string,
        clientId: row.client_id as string,
        clientName,
        initials: initialsOf(clientName),
        amountInitial: Number(row.amount_initial ?? 0),
        subscriptionDate: (row.subscription_date as string) ?? null,
        status: (row.status as SubscriptionStatus) ?? "pending_signature",
        produitName: produit?.name ?? null,
        produitCategory: asCategory(produit?.category),
        partnerName: produit?.partner_name ?? null,
      } satisfies SubscriptionRow;
    });
  } catch {
    return [];
  }
}

/**
 * Commissions d'honoraires d'étude (commission_type = 'study_fee') des
 * souscriptions de l'ingénieur. Sert l'axe « Honoraires de conseil ».
 * Dégrade à [].
 */
export async function fetchEngineerStudyFees(): Promise<StudyFeeRow[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  const ctx = await getSessionContext();
  if (!ctx) return [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("commissions")
      .select(
        `
          id,
          amount_eur,
          paid_date,
          due_date,
          commission_type,
          souscription:souscriptions!inner (
            client_id, engineer_id, cabinet_id, tenant_id, subscription_date,
            clients ( personnes ( first_name, last_name ) )
          )
        `,
      )
      .eq("commission_type", "study_fee")
      .eq("souscription.tenant_id", ctx.tenantId)
      .eq("souscription.cabinet_id", ctx.cabinetId)
      .eq("souscription.engineer_id", ctx.userId)
      .limit(500);

    if (error || !data) return [];

    return data.map((row: Record<string, unknown>) => {
      const sous = first(row.souscription as unknown) as
        | { client_id?: string; subscription_date?: string | null; clients?: unknown }
        | null;
      const clientName = clientNameOf(sous?.clients) || "Dossier sans nom";
      return {
        id: row.id as string,
        clientId: (sous?.client_id as string) ?? "",
        clientName,
        initials: initialsOf(clientName),
        amountEur: Number(row.amount_eur ?? 0),
        date:
          (row.paid_date as string) ??
          (row.due_date as string) ??
          (sous?.subscription_date as string) ??
          null,
      } satisfies StudyFeeRow;
    });
  } catch {
    return [];
  }
}
