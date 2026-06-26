import Link from "next/link";

import { getSessionContext } from "@/lib/auth/context";
import { loadSubmissions, type DciKind } from "@/lib/dci-store";
import { validateDciCanonical } from "@/lib/dci-schema";
import { deriveFacts } from "@/lib/collecte-engine";
import { buildItems } from "@/lib/collecte-catalog";
import type { Facts } from "@/lib/collecte-catalog/types";

import { CollecteBuilder } from "@/app/(editeur)/dossiers/[id]/collecte/CollecteBuilder";

export const dynamic = "force-dynamic";

/** Kinds testés dans l'ordre de priorité pour fonder les Facts. */
const KIND_PRIORITY: DciKind[] = ["complet", "qualification", "simple"];

/**
 * Charge le DCI du prospect <id> (kind 'complet' prioritaire, fallback
 * 'qualification' puis 'simple'), le valide, et en dérive les Facts. Renvoie des
 * Facts vides si aucun DCI exploitable : le moteur ressort alors le catalogue
 * complet. Réplique exactement la logique de la page éditeur.
 */
async function loadFactsForProspect(id: string): Promise<{
  facts: Facts;
  usedKind: DciKind | null;
  displayName: string | null;
}> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { facts: {}, usedKind: null, displayName: null };
    const { submissions } = await loadSubmissions(id, ctx.tenantId);
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

export default async function CollecteBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = rawId.trim();

  const { facts, displayName } = await loadFactsForProspect(id);

  // Pièces pré-sélectionnées + nombre de rubriques (catégories) ouvertes par le
  // moteur sur la situation dérivée du DCI — alimente la detect-line du hero.
  const initialItems = buildItems(facts);
  const openCategories = new Set(initialItems.map((e) => e.category)).size;

  const heroTitle = displayName || "Collecte de documents";

  return (
    <div className="px-10 py-8">
      <Link
        href={`/espace-ingenieur/collectes/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--navy-300)] transition hover:text-[var(--navy)]"
      >
        ← Retour à la fiche de collecte
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
          nom: displayName || "",
          email: "",
        }}
      />
    </div>
  );
}
