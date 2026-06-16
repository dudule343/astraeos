import Link from "next/link";

import { Topbar } from "../../../_components/Topbar";
import { KpiCard, type KpiBlock } from "../../../_components/KpiCard";
import { PageHero } from "../../../_components/PageHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadSubmissions, type DciKind } from "@/lib/dci-store";
import { validateDciCanonical } from "@/lib/dci-schema";
import { deriveFacts } from "@/lib/collecte-engine";
import { buildItems } from "@/lib/collecte-catalog";
import type { Facts } from "@/lib/collecte-catalog/types";

import { CollecteBuilder } from "./CollecteBuilder";

export const dynamic = "force-dynamic";

/** Total de référence du référentiel documentaire. */
const TOTAL_PIECES = 286;

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
    const { submissions } = await loadSubmissions(slug);
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

/** Récupère le contact du dossier pour pré-remplir le destinataire. */
async function fetchDossierContact(
  id: string,
): Promise<{ nom: string; email: string } | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("dossiers")
      .select("clients ( personnes ( first_name, last_name, email ) )")
      .eq("id", id)
      .maybeSingle();
    if (!data) return null;
    const clientRaw = (data as Record<string, unknown>).clients as
      | { personnes?: Array<{ first_name?: string; last_name?: string; email?: string }> }
      | Array<{ personnes?: Array<{ first_name?: string; last_name?: string; email?: string }> }>
      | null
      | undefined;
    const client = Array.isArray(clientRaw) ? clientRaw[0] : clientRaw;
    const person = client?.personnes?.[0];
    if (!person) return null;
    return {
      nom: `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim(),
      email: person.email ?? "",
    };
  } catch {
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

  const [{ facts, usedKind, displayName }, contact] = await Promise.all([
    loadFactsForProspect(slug),
    fetchDossierContact(id),
  ]);

  const initialCount = buildItems(facts).length;

  const sourceLabel =
    usedKind === "complet"
      ? "DCI complet"
      : usedKind === "qualification"
        ? "Questionnaire de qualification"
        : usedKind === "simple"
          ? "DCI simplifié"
          : "Aucun DCI (collecte maximale)";

  const kpis: KpiBlock[] = [
    { label: "Source des faits", value: sourceLabel, meta: `prospect ${slug}` },
    {
      label: "Pièces pré-sélectionnées",
      value: `${initialCount}`,
      meta: `sur ${TOTAL_PIECES} du référentiel`,
    },
    {
      label: "Faits dérivés du DCI",
      value: `${Object.keys(facts).length}`,
      meta: "ajustables à la main",
    },
  ];

  return (
    <>
      <Topbar current="Collecte conditionnelle" />

      <div className="px-10 py-8">
        <Link
          href={`/dossiers/${id}`}
          className="mb-4 inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--navy-300)] transition hover:text-[var(--navy)]"
        >
          ← Retour à la fiche dossier
        </Link>

        <PageHero
          eyebrow="Étape 3 · Collecte des pièces"
          title="Collecte conditionnelle"
          description="La situation du foyer (dérivée du DCI) croise le référentiel des 286 pièces pour ne demander que les pièces pertinentes. Ajustez les faits à gauche : la liste de pièces à droite se recalcule instantanément."
        />

        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <CollecteBuilder
          initialFacts={facts}
          defaultParticipant={{
            nom: contact?.nom || displayName || "",
            email: contact?.email || "",
          }}
        />
      </div>
    </>
  );
}
