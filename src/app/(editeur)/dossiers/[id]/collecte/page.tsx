import Link from "next/link";
import { notFound, unstable_rethrow } from "next/navigation";

import { getSessionContext } from "@/lib/auth/context";
import { Topbar } from "../../../_components/Topbar";
import { ParcoursStepper } from "../../../_components/ParcoursStepper";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadSubmissions, type DciKind } from "@/lib/dci-store";
import { validateDciCanonical } from "@/lib/dci-schema";
import { deriveFacts } from "@/lib/collecte-engine";
import { buildItems } from "@/lib/collecte-catalog";
import type { Facts } from "@/lib/collecte-catalog/types";

import { CollecteBuilder } from "./CollecteBuilder";

export const dynamic = "force-dynamic";

/** Kinds testés dans l'ordre de priorité pour fonder les Facts. */
const KIND_PRIORITY: DciKind[] = ["complet", "qualification", "simple"];

/**
 * Charge le DCI du prospect (kind 'complet' prioritaire, fallback 'qualification'
 * puis 'simple'), le valide, et en dérive les Facts. Renvoie des Facts vides si
 * aucun DCI exploitable : le moteur ressort alors le catalogue complet.
 */
async function loadFactsForProspect(slug: string): Promise<{
  facts: Facts;
  usedKind: DciKind | null;
  displayName: string | null;
}> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { facts: {}, usedKind: null, displayName: null };
    const { submissions } = await loadSubmissions(slug, ctx.tenantId);
    for (const kind of KIND_PRIORITY) {
      const sub = submissions[kind];
      if (!sub) continue;
      const validated = validateDciCanonical(sub.payload);
      if (!validated.ok) continue;
      return {
        facts: deriveFacts(validated.value),
        usedKind: kind,
        displayName: sub.display_name ?? null,
      };
    }
  } catch {
    // Pas de DCI exploitable : collecte maximale.
  }
  return { facts: {}, usedKind: null, displayName: null };
}

/**
 * Récupère le contact + l'avancement du dossier : couple (représentant +
 * conjoint) pour le titre du hero, e-mail pour le destinataire, et
 * `pipeline_stage` pour le stepper du parcours.
 */
async function fetchDossierHeader(id: string): Promise<{
  couple: string | null;
  email: string;
  stage: string;
} | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const ctx = await getSessionContext();
    if (!ctx) notFound();
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("dossiers")
      .select("pipeline_stage, clients ( personnes ( first_name, last_name, email ) )")
      .eq("id", id)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();
    // Dossier hors tenant/cabinet : 404 plutôt qu'un entête générique.
    if (!data) notFound();
    const row = data as Record<string, unknown>;
    const clientRaw = row.clients as
      | { personnes?: Array<{ first_name?: string; last_name?: string; email?: string }> }
      | Array<{ personnes?: Array<{ first_name?: string; last_name?: string; email?: string }> }>
      | null
      | undefined;
    const client = Array.isArray(clientRaw) ? clientRaw[0] : clientRaw;
    const personnes = client?.personnes ?? [];
    const fullName = (p?: { first_name?: string; last_name?: string }) =>
      p ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || null : null;
    const couple = [fullName(personnes[0]), fullName(personnes[1])]
      .filter(Boolean)
      .join(" & ");
    const email = personnes.find((p) => p.email)?.email ?? "";
    return {
      couple: couple || null,
      email,
      stage: (row.pipeline_stage as string) ?? "03_collecte",
    };
  } catch (e) {
    // Laisse passer le contrôle de flux Next (notFound) ; n'avale que les
    // erreurs Supabase/réseau (dégradation gracieuse → entête générique).
    unstable_rethrow(e);
    return null;
  }
}

export default async function CollectePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ prospect?: string }>;
}) {
  const { id } = await params;
  const { prospect } = await searchParams;

  // Slug du prospect : query ?prospect=… sinon l'id du dossier.
  const slug = (prospect ?? id).trim();

  const [{ facts, displayName }, header] = await Promise.all([
    loadFactsForProspect(slug),
    fetchDossierHeader(id),
  ]);

  // Pièces pré-sélectionnées + nombre de rubriques (catégories) ouvertes par le
  // moteur sur la situation dérivée du DCI — alimente la detect-line du hero.
  const initialItems = buildItems(facts);
  const openCategories = new Set(initialItems.map((e) => e.category)).size;

  const stage = header?.stage ?? "03_collecte";
  const stageIndex = Number(stage.slice(0, 2)) || 3;

  // Titre du hero = nom du foyer (couple du dossier, sinon display_name du DCI).
  const heroTitle = header?.couple || displayName || "Collecte de documents";

  return (
    <>
      <Topbar current="Collecte de documents" />

      <div className="px-10 py-8">
        <ParcoursStepper stageIndex={stageIndex} />

        <Link
          href={`/dossiers/${id}`}
          className="mb-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--navy-300)] transition hover:text-[var(--navy)]"
        >
          ← Retour à la fiche dossier
        </Link>

        {/* HERO v40 · ci-fiche-header */}
        <section className="mb-6">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
            Étape 03 · Collecte de documents
          </div>
          <h1 className="mb-2 text-[28px] font-semibold leading-tight tracking-tight text-[var(--navy)]">
            {heroTitle}
          </h1>
          <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--gold-deep)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <circle cx="12" cy="12" r="4" />
            </svg>
            {openCategories} rubrique{openCategories > 1 ? "s" : ""} ouverte
            {openCategories > 1 ? "s" : ""} automatiquement par l&apos;IA selon le DCI
          </div>
        </section>

        <CollecteBuilder
          initialFacts={facts}
          dossierId={id}
          defaultParticipant={{
            nom: header?.couple || displayName || "",
            email: header?.email || "",
          }}
        />
      </div>
    </>
  );
}
