import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";
import { loadAllSubmissions, type DciKind } from "@/lib/dci-store";
import { validateDciCanonical } from "@/lib/dci-schema";
import { deriveFacts } from "@/lib/collecte-engine";
import { buildItems } from "@/lib/collecte-catalog";
import type { Facts } from "@/lib/collecte-catalog/types";

/**
 * Module SERVEUR de l'écran « Collecte des documents et informations »
 * (étape 03 du parcours), porté fidèlement de la maquette 032 (page-ing-pipe-03).
 *
 * Données RÉELLES :
 *  - dossiers de l'ingénieur courant au stade `03_collecte` (⨝ clients ⨝ personnes) ;
 *  - nombre de pièces ATTENDUES = pièces conditionnelles dérivées du DCI du
 *    prospect (deriveFacts → buildItems) — plus de 92 en dur ;
 *  - nombre de pièces COLLECTÉES = lignes `collecte_depots` réelles de la
 *    collecte rattachée au dossier (jamais un calcul depuis un %) ;
 *  - « Ingénieur en charge » / « Supervisé par » = vrais noms (users ⨝ cabinets).
 *
 * Dégrade sur les exemples de la maquette quand la base n'est pas configurée,
 * la session manque, ou aucun dossier n'est en collecte.
 */

export type CollecteStatut = "initier" | "collecte" | "pret" | "inactif";
export type CollecteClientType = "seule" | "couple" | "couple-pacs" | "personne-morale";

export type CollecteLigne = {
  /** id du dossier — cible des actions Consulter / Préparer (écran détail). */
  id: string;
  /** Lignes de nom (1 pour personne seule/morale, 2 pour couple). */
  nameLines: string[];
  /** Sous-ligne grise (ex. raison sociale d'une personne morale). */
  subName?: string;
  clientType: CollecteClientType;
  clientTypeLabel: string;
  /** Colonne « Ingénieur en charge ». */
  ingenieurName: string;
  /** Colonne « Supervisé par » (« — » si aucun superviseur). */
  superviseurName: string;
  /** « Date d'initiation » formatée, ou null si la collecte n'est pas initiée. */
  dateInitiation: string | null;
  /** Pourcentage d'avancement (0-100), ou null si non initiée. */
  pct: number | null;
  docsCollected: number;
  docsExpected: number;
  statut: CollecteStatut;
  statutLabel: string;
};

export type CollecteFiltreKey = "all" | "initier" | "collecte" | "pret" | "inactif";

export type CollecteFiltre = {
  key: CollecteFiltreKey;
  label: string;
  count: number;
};

export type CollecteStep = {
  num: number;
  l1: string;
  l2: string;
  route: string;
  state: "done" | "active" | "";
};

export type CollectesScreen = {
  stepper: CollecteStep[];
  filtres: CollecteFiltre[];
  delaiMoyenJours: number;
  rows: CollecteLigne[];
};

const STEPPER: CollecteStep[] = [
  { num: 1, l1: "Prospects", l2: "actifs", route: "/espace-ingenieur/prospects", state: "done" },
  { num: 2, l1: "Conformité", l2: "en cours", route: "/espace-ingenieur/conformite", state: "done" },
  { num: 3, l1: "Collecte de", l2: "documents", route: "/espace-ingenieur/collectes", state: "active" },
  { num: 4, l1: "Étude en", l2: "cours", route: "/espace-ingenieur/etudes", state: "" },
  { num: 5, l1: "Études", l2: "restituées", route: "/espace-ingenieur/etudes-restituees", state: "" },
  { num: 6, l1: "Clients", l2: "en suivi", route: "/espace-ingenieur/clients-suivi", state: "" },
];

const STATUT_LABEL: Record<CollecteStatut, string> = {
  initier: "À initier",
  collecte: "En collecte",
  pret: "Prêt à commencer l'étude",
  inactif: "Inactif · +14 j",
};

/** Données d'exemple = page-ing-pipe-03 de la maquette 032 (9 lignes, 1:1). */
const FALLBACK_ROWS: CollecteLigne[] = [
  {
    id: "dupont-topin",
    nameLines: ["Bertrand DUPONT", "Monique TOPIN"],
    clientType: "couple",
    clientTypeLabel: "Couple",
    ingenieurName: "Julien VASSEUR",
    superviseurName: "Romain BERTHIER",
    dateInitiation: "12/05/2026",
    pct: 73,
    docsCollected: 130,
    docsExpected: 178,
    statut: "collecte",
    statutLabel: "En collecte",
  },
  {
    id: "aubert",
    nameLines: ["Philippe AUBERT", "Catherine AUBERT"],
    clientType: "couple",
    clientTypeLabel: "Couple",
    ingenieurName: "Sophie MERCIER",
    superviseurName: "—",
    dateInitiation: "08/05/2026",
    pct: 100,
    docsCollected: 156,
    docsExpected: 156,
    statut: "pret",
    statutLabel: "Prêt à commencer l'étude",
  },
  {
    id: "moreau",
    nameLines: ["Stéphane MOREAU"],
    clientType: "seule",
    clientTypeLabel: "Personne seule",
    ingenieurName: "Julien VASSEUR",
    superviseurName: "Romain BERTHIER",
    dateInitiation: null,
    pct: null,
    docsCollected: 0,
    docsExpected: 0,
    statut: "initier",
    statutLabel: "À initier",
  },
  {
    id: "dubreuil",
    nameLines: ["Marc DUBREUIL", "Léa DUBREUIL"],
    clientType: "couple",
    clientTypeLabel: "Couple",
    ingenieurName: "Julien VASSEUR",
    superviseurName: "Romain BERTHIER",
    dateInitiation: null,
    pct: null,
    docsCollected: 0,
    docsExpected: 0,
    statut: "initier",
    statutLabel: "À initier",
  },
  {
    id: "lefebvre-sas",
    nameLines: ["Pierre LEFEBVRE"],
    subName: "Groupe Lefebvre · SAS",
    clientType: "personne-morale",
    clientTypeLabel: "Personne morale",
    ingenieurName: "Thomas LEROY",
    superviseurName: "Camille BERTRAND",
    dateInitiation: "05/05/2026",
    pct: 30,
    docsCollected: 80,
    docsExpected: 268,
    statut: "inactif",
    statutLabel: "Inactif · +14 j",
  },
  {
    id: "joubert-berthoux",
    nameLines: ["Camille JOUBERT", "Yannick BERTHOUX"],
    clientType: "couple",
    clientTypeLabel: "Couple",
    ingenieurName: "Luc THILLIEZ",
    superviseurName: "—",
    dateInitiation: "09/05/2026",
    pct: 62,
    docsCollected: 96,
    docsExpected: 155,
    statut: "collecte",
    statutLabel: "En collecte",
  },
  {
    id: "mercier",
    nameLines: ["Patricia MERCIER"],
    clientType: "seule",
    clientTypeLabel: "Personne seule",
    ingenieurName: "Sophie MERCIER",
    superviseurName: "—",
    dateInitiation: null,
    pct: null,
    docsCollected: 0,
    docsExpected: 0,
    statut: "initier",
    statutLabel: "À initier",
  },
  {
    id: "nguyen",
    nameLines: ["Hélène NGUYEN", "Daniel NGUYEN"],
    clientType: "couple",
    clientTypeLabel: "Couple",
    ingenieurName: "Thomas LEROY",
    superviseurName: "Camille BERTRAND",
    dateInitiation: "02/05/2026",
    pct: 100,
    docsCollected: 162,
    docsExpected: 162,
    statut: "pret",
    statutLabel: "Prêt à commencer l'étude",
  },
  {
    id: "rousseau",
    nameLines: ["Sylvie ROUSSEAU"],
    clientType: "seule",
    clientTypeLabel: "Personne seule",
    ingenieurName: "Camille BERTRAND",
    superviseurName: "Luc THILLIEZ",
    dateInitiation: "06/05/2026",
    pct: 24,
    docsCollected: 19,
    docsExpected: 78,
    statut: "inactif",
    statutLabel: "Inactif · +14 j",
  },
];

const FALLBACK: CollectesScreen = {
  stepper: STEPPER,
  filtres: buildFiltres(FALLBACK_ROWS),
  delaiMoyenJours: 9,
  rows: FALLBACK_ROWS,
};

/** slugify identique à espace-ingenieur/prospects/actions.ts (clé DCI). */
function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || ""
  );
}

/** Compte de chaque facette à partir des lignes réelles (source unique). */
function buildFiltres(rows: CollecteLigne[]): CollecteFiltre[] {
  const count = (s: CollecteStatut) => rows.filter((r) => r.statut === s).length;
  return [
    { key: "all", label: "Tous", count: rows.length },
    { key: "initier", label: "À initier", count: count("initier") },
    { key: "collecte", label: "En collecte", count: count("collecte") },
    { key: "pret", label: "Prêt à commencer l'étude", count: count("pret") },
    { key: "inactif", label: "Inactifs", count: count("inactif") },
  ];
}

export function isCollecteFiltre(value: string | undefined): value is CollecteFiltreKey {
  return (
    value === "initier" || value === "collecte" || value === "pret" || value === "inactif"
  );
}

/** Filtre les lignes affichées selon la facette sélectionnée (source unique). */
export function filterCollecteLignes(
  rows: CollecteLigne[],
  filter: CollecteFiltreKey,
): CollecteLigne[] {
  if (filter === "all") return rows;
  return rows.filter((r) => r.statut === filter);
}

type RawPersonne = {
  role_in_household: string | null;
  first_name: string | null;
  last_name: string | null;
};

type RawDossier = {
  id: string;
  pipeline_entry_date: string | null;
  last_activity_at: string | null;
  client: {
    id: string;
    household_type: string | null;
    personnes: RawPersonne[] | null;
  } | null;
};

type RawCollecte = {
  id: string;
  dossier_id: string | null;
  created_at: string;
  opened_at: string | null;
  structure: unknown;
};

/** Priorité des kinds DCI pour fonder les Facts (le plus complet d'abord). */
const KIND_PRIORITY: DciKind[] = ["complet", "qualification", "simple", "rdv"];

function householdNames(personnes: RawPersonne[]): {
  lines: string[];
  type: CollecteClientType;
  typeLabel: string;
} {
  if (personnes.length === 0) {
    return { lines: ["Foyer sans nom"], type: "seule", typeLabel: "Personne seule" };
  }
  const a = personnes.find((p) => p.role_in_household === "person_a") ?? personnes[0];
  const b = personnes.find((p) => p.role_in_household === "person_b");
  const aName = `${(a.first_name ?? "").trim()} ${(a.last_name ?? "").trim()}`.trim();
  if (b) {
    const bName = `${(b.first_name ?? "").trim()} ${(b.last_name ?? "").trim()}`.trim();
    return { lines: [aName, bName], type: "couple", typeLabel: "Couple" };
  }
  return { lines: [aName], type: "seule", typeLabel: "Personne seule" };
}

function daysSince(iso: string | null | undefined): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
}

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Construit, pour le tenant courant, une table slug → nombre de pièces
 * conditionnelles attendues (DCI le plus complet → deriveFacts → buildItems).
 */
async function buildExpectedBySlug(tenantId: string): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  try {
    const { submissions } = await loadAllSubmissions(tenantId);
    const bySlug = new Map<string, (typeof submissions)[number]>();
    for (const sub of submissions) {
      const cur = bySlug.get(sub.prospect_slug);
      const better =
        !cur || KIND_PRIORITY.indexOf(sub.kind) > KIND_PRIORITY.indexOf(cur.kind);
      if (better) bySlug.set(sub.prospect_slug, sub);
    }
    for (const [slug, sub] of bySlug) {
      const validated = validateDciCanonical(sub.payload);
      const facts: Facts = validated.ok ? deriveFacts(validated.value) : {};
      map.set(slug, buildItems(facts).length);
    }
  } catch {
    // DCI indisponible : on retombera sur la structure de la collecte.
  }
  return map;
}

export async function getCollectesScreen(): Promise<CollectesScreen> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return FALLBACK;
  try {
    const ctx = await getSessionContext();
    if (!ctx) return FALLBACK;

    const supabase = createAdminClient();

    const { data: dossiersData, error } = await supabase
      .from("dossiers")
      .select(
        `
          id, pipeline_entry_date, last_activity_at,
          client:clients!inner (
            id, household_type,
            personnes ( role_in_household, first_name, last_name )
          )
        `,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .eq("engineer_id", ctx.userId)
      .eq("pipeline_stage", "03_collecte")
      .order("pipeline_entry_date", { ascending: true });

    if (error || !dossiersData || dossiersData.length === 0) return FALLBACK;
    const dossiers = dossiersData as unknown as RawDossier[];

    // Identité : ingénieur courant + superviseur (directeur du cabinet).
    const [{ data: me }, { data: cabinet }] = await Promise.all([
      supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", ctx.userId)
        .maybeSingle(),
      supabase
        .from("cabinets")
        .select("name, director_user_id")
        .eq("id", ctx.cabinetId)
        .maybeSingle(),
    ]);
    const ingenieurName = me
      ? `${me.first_name ?? ""} ${me.last_name ?? ""}`.trim() || "—"
      : "—";
    let superviseurName = "—";
    if (cabinet?.director_user_id && cabinet.director_user_id !== ctx.userId) {
      const { data: dir } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", cabinet.director_user_id)
        .maybeSingle();
      if (dir) superviseurName = `${dir.first_name ?? ""} ${dir.last_name ?? ""}`.trim() || "—";
    }

    // Collectes du cabinet, indexées par dossier.
    const { data: collectesData } = await supabase
      .from("collectes")
      .select("id, dossier_id, created_at, opened_at, structure")
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId);
    const collecteByDossier = new Map<string, RawCollecte>();
    for (const c of (collectesData ?? []) as RawCollecte[]) {
      if (c.dossier_id) collecteByDossier.set(c.dossier_id, c);
    }

    // Dépôts réels par collecte (une requête, comptés en mémoire).
    const collecteIds = [...collecteByDossier.values()].map((c) => c.id);
    const depotsByCollecte = new Map<string, number>();
    if (collecteIds.length > 0) {
      const { data: depots } = await supabase
        .from("collecte_depots")
        .select("collecte_id")
        .in("collecte_id", collecteIds);
      for (const d of (depots ?? []) as { collecte_id: string }[]) {
        depotsByCollecte.set(d.collecte_id, (depotsByCollecte.get(d.collecte_id) ?? 0) + 1);
      }
    }

    // Pièces attendues par prospect, dérivées du DCI.
    const expectedBySlug = await buildExpectedBySlug(ctx.tenantId);
    const fullCatalog = buildItems({}).length;

    // Ancienneté (jours) des collectes en cours, pour le délai moyen.
    const delaiSamples: number[] = [];

    const rows: CollecteLigne[] = dossiers.map((d) => {
      const personnes = d.client?.personnes ?? [];
      const { lines, type, typeLabel } = householdNames(personnes);
      const collecte = collecteByDossier.get(d.id);

      // Nombre de pièces attendues : DCI du prospect, sinon structure de la
      // collecte, sinon catalogue complet (jamais une constante en dur).
      const slug = slugify(lines.join(" "));
      const structureLen = Array.isArray(collecte?.structure) ? collecte!.structure.length : 0;
      const docsExpected =
        expectedBySlug.get(slug) ?? (structureLen > 0 ? structureLen : fullCatalog);

      // Nombre de pièces collectées : dépôts réels de la collecte.
      const docsCollected = collecte ? (depotsByCollecte.get(collecte.id) ?? 0) : 0;

      let statut: CollecteStatut;
      let pct: number | null;
      if (!collecte) {
        statut = "initier";
        pct = null;
      } else {
        pct = docsExpected > 0 ? Math.min(100, Math.round((docsCollected / docsExpected) * 100)) : 0;
        const inactiveDays = daysSince(d.last_activity_at ?? collecte.created_at);
        if (pct >= 100) statut = "pret";
        else if (inactiveDays > 14) statut = "inactif";
        else statut = "collecte";
      }

      const inactiveDays = collecte ? daysSince(d.last_activity_at ?? collecte.created_at) : 0;
      const statutLabel =
        statut === "inactif" ? `Inactif · +${inactiveDays} j` : STATUT_LABEL[statut];

      if (collecte && (statut === "collecte" || statut === "inactif")) {
        delaiSamples.push(daysSince(collecte.created_at));
      }

      return {
        // id du DOSSIER : cible des liens « Consulter » → l'écran détail
        // /espace-ingenieur/collectes/[id] résout la collecte via dossier_id.
        id: d.id,
        nameLines: lines,
        clientType: type,
        clientTypeLabel: typeLabel,
        ingenieurName,
        superviseurName,
        dateInitiation: collecte ? formatDate(collecte.created_at) : null,
        pct,
        docsCollected,
        docsExpected,
        statut,
        statutLabel,
      };
    });

    // Délai moyen de collecte : ancienneté moyenne des collectes en cours.
    const delaiMoyenJours =
      delaiSamples.length > 0
        ? Math.round(delaiSamples.reduce((a, b) => a + b, 0) / delaiSamples.length)
        : 9;

    return {
      stepper: STEPPER,
      filtres: buildFiltres(rows),
      delaiMoyenJours,
      rows,
    };
  } catch {
    return FALLBACK;
  }
}
