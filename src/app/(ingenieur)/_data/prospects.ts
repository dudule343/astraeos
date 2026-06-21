// Données d'exemple de l'écran "Mes prospects actifs" (étape 01 du parcours
// patrimonial), portées telles quelles depuis la maquette ingénieur v28
// (page-ing-pipe-01). Source unique : la page lit d'ici, rien n'est en dur
// dans le composant. Mêmes noms, mêmes dates, mêmes statuts que la maquette.

import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

export type ProspectStatus =
  | { kind: "pill"; tone: "sent" | "waiting" | "relance" | "met"; label: string }
  | { kind: "custom"; label: string; bg: string; color: string };

export type ProspectRow = {
  /** Slug de fiche prospect existante, sinon null (ligne non cliquable). */
  href: string | null;
  /** Mise en valeur de la ligne (nouvelle entrante). */
  highlight?: boolean;
  type: "couple" | "couple-pacs" | "seul" | "personne-morale";
  /** Nom(s) du / des prospect(s). Une ligne par personne pour les couples. */
  names: string[];
  /** Mention sous le nom pour les personnes morales. */
  pmMention?: string;
  typeLabel: string;
  cabinet: { name: string; meta: string };
  /** Ingénieur en charge. null = pas encore d'ingénieur (—). */
  ingenieur: { initials: string; name: string } | null;
  rencontre: { date: string; meta: string };
  documents: { date: string; meta: string };
  status: ProspectStatus;
};

export type ProspectsView = {
  ingenieurConnecte: string;
  kpis: {
    actifs: { value: string; meta: string };
    convertis: { value: string; meta: string };
    documents: { value: string; total: string; meta: string };
    delai: { value: string; unit: string; meta: string };
  };
  quickFilters: { label: string; count: number; active?: boolean; alert?: boolean }[];
  stepper: { step: string; label: string; count: string; href: string; active?: boolean }[];
  rows: ProspectRow[];
  reste: { count: number; total: number };
};

const VIEW: ProspectsView = {
  ingenieurConnecte: "Julien VASSEUR",
  kpis: {
    actifs: { value: "24", meta: "nouveaux cette semaine" },
    convertis: { value: "2", meta: "Passés à l'étape 02 · conformité" },
    documents: { value: "19", total: "24", meta: "du portefeuille couvert" },
    delai: { value: "8", unit: "jours", meta: "De l'étape 01 à l'étape 02" },
  },
  quickFilters: [
    { label: "Tous", count: 187, active: true },
    { label: "Nouveaux cette semaine", count: 24 },
    { label: "Sans documents envoyés", count: 31 },
    { label: "Dormants > 30 jours", count: 17, alert: true },
    { label: "À relancer", count: 42 },
  ],
  stepper: [
    { step: "01", label: "Prospects actifs", count: "187", href: "/espace-ingenieur/prospects", active: true },
    { step: "02", label: "Conformité en cours", count: "18", href: "/espace-ingenieur/conformite" },
    { step: "03", label: "Collecte docs", count: "24", href: "/espace-ingenieur/collectes" },
    { step: "04", label: "Études en cours", count: "41", href: "/espace-ingenieur/etudes" },
    { step: "05", label: "Études restituées", count: "28", href: "/espace-ingenieur/etudes-restituees" },
    { step: "06", label: "Clients en suivi", count: "142", href: "/espace-ingenieur/clients-suivi" },
  ],
  rows: [
    {
      // Ligne cliquable vers la fiche prospect (page-ing-fiche-prospect-aubert
      // de la maquette, mappée sur prospects/[id] par le standard de portage).
      href: "/espace-ingenieur/prospects/aubert",
      highlight: true,
      type: "couple",
      names: ["Jean AUBERT", "Martine AUBERT"],
      typeLabel: "Couple",
      cabinet: { name: "Luc THILLIEZ", meta: "Dirigeant-praticien" },
      ingenieur: { initials: "JV", name: "Julien VASSEUR" },
      rencontre: { date: "05/05/2026", meta: "Il y a 5 jours" },
      documents: { date: "05/05/2026", meta: "DCI · Qualif envoyés" },
      status: { kind: "pill", tone: "sent", label: "DCI complété · 1/3" },
    },
    {
      href: "/espace-ingenieur/prospects/mercier",
      type: "seul",
      names: ["Nicolas MERCIER"],
      typeLabel: "Personne seule",
      cabinet: { name: "Luc THILLIEZ", meta: "Dirigeant-praticien" },
      ingenieur: { initials: "JV", name: "Julien VASSEUR" },
      rencontre: { date: "22/03/2026", meta: "Il y a 48 jours" },
      documents: { date: "25/03/2026", meta: "3 jours après rencontre" },
      status: { kind: "pill", tone: "waiting", label: "En attente retour" },
    },
    {
      href: null,
      type: "couple",
      names: ["Philippe LEFRANC", "Sylvie LEFRANC"],
      typeLabel: "Couple",
      cabinet: { name: "Sophie MERCIER", meta: "5 ans" },
      ingenieur: { initials: "CF", name: "Caroline FAURE" },
      rencontre: { date: "28/03/2026", meta: "Il y a 42 jours" },
      documents: { date: "02/04/2026", meta: "5 jours après rencontre" },
      status: { kind: "pill", tone: "relance", label: "À relancer" },
    },
    {
      href: "/espace-ingenieur/prospects/joubert",
      type: "couple-pacs",
      names: ["Camille JOUBERT", "Yannick BERTHOUX"],
      typeLabel: "Couple PACS",
      cabinet: { name: "Luc THILLIEZ", meta: "Dirigeant-praticien" },
      ingenieur: null,
      rencontre: { date: "28/04/2026", meta: "Il y a 12 jours" },
      documents: { date: "28/04/2026", meta: "DCI · Qualif complétés" },
      status: { kind: "custom", label: "Prêt étape 02 · 3/3", bg: "#E8F5EE", color: "#1F8049" },
    },
    {
      href: null,
      type: "couple",
      names: ["Bernard TESSIER", "Catherine TESSIER"],
      typeLabel: "Couple",
      cabinet: { name: "Camille BERTRAND", meta: "Junior · 2 ans" },
      ingenieur: { initials: "LR", name: "Léa RICCI" },
      rencontre: { date: "08/04/2026", meta: "Il y a 31 jours" },
      documents: { date: "—", meta: "Non envoyés" },
      status: { kind: "pill", tone: "met", label: "Rencontré" },
    },
    {
      href: null,
      type: "couple",
      names: ["Olivier CHARPENTIER", "Nathalie CHARPENTIER"],
      typeLabel: "Couple",
      cabinet: { name: "Luc THILLIEZ", meta: "Dirigeant-praticien" },
      ingenieur: { initials: "MK", name: "Mathieu KELLER" },
      rencontre: { date: "12/04/2026", meta: "Il y a 27 jours" },
      documents: { date: "15/04/2026", meta: "3 jours après rencontre" },
      status: { kind: "pill", tone: "relance", label: "À relancer" },
    },
    {
      href: null,
      type: "seul",
      names: ["Maxime ROUX"],
      typeLabel: "Personne seule",
      cabinet: { name: "Luc THILLIEZ", meta: "Dirigeant-praticien" },
      ingenieur: null,
      rencontre: { date: "14/04/2026", meta: "Il y a 25 jours" },
      documents: { date: "16/04/2026", meta: "2 jours après rencontre" },
      status: { kind: "pill", tone: "sent", label: "Docs envoyés" },
    },
    {
      href: null,
      type: "couple",
      names: ["François BONNET", "Isabelle BONNET"],
      typeLabel: "Couple",
      cabinet: { name: "Julien VASSEUR", meta: "Senior · 8 ans" },
      ingenieur: { initials: "RB", name: "Romain BERTHIER" },
      rencontre: { date: "16/04/2026", meta: "Il y a 23 jours" },
      documents: { date: "19/04/2026", meta: "3 jours après rencontre" },
      status: { kind: "pill", tone: "waiting", label: "En attente retour" },
    },
    {
      href: null,
      type: "seul",
      names: ["Léa BRUNET"],
      typeLabel: "Personne seule",
      cabinet: { name: "Thomas LEROY", meta: "3 ans" },
      ingenieur: null,
      rencontre: { date: "18/04/2026", meta: "Il y a 21 jours" },
      documents: { date: "—", meta: "Non envoyés" },
      status: { kind: "pill", tone: "met", label: "Rencontré" },
    },
    {
      href: null,
      type: "couple",
      names: ["Christian ROCHE", "Marie ROCHE"],
      typeLabel: "Couple",
      cabinet: { name: "Sophie MERCIER", meta: "5 ans" },
      ingenieur: { initials: "CF", name: "Caroline FAURE" },
      rencontre: { date: "20/04/2026", meta: "Il y a 19 jours" },
      documents: { date: "22/04/2026", meta: "2 jours après rencontre" },
      status: { kind: "pill", tone: "sent", label: "Docs envoyés" },
    },
    {
      href: null,
      type: "personne-morale",
      names: ["SAS GROUPE LEFEBVRE"],
      pmMention: "Représentant légal · signataire : Pierre LEFEBVRE",
      typeLabel: "Personne morale",
      cabinet: { name: "Luc THILLIEZ", meta: "Dirigeant-praticien" },
      ingenieur: { initials: "JV", name: "Julien VASSEUR" },
      rencontre: { date: "25/04/2026", meta: "Il y a 14 jours" },
      documents: { date: "28/04/2026", meta: "3 jours après rencontre" },
      status: { kind: "pill", tone: "sent", label: "Docs envoyés" },
    },
  ],
  reste: { count: 177, total: 187 },
};

// Libellés courts par type de soumission, pour la colonne "Documents".
const KIND_LABEL: Record<string, string> = {
  rdv: "RDV",
  simple: "DCI simplifié",
  qualification: "Qualif",
  complet: "DCI complet",
};

/**
 * Lit les vrais prospects entrés via le parcours en ligne (table
 * `dci_submissions`, regroupés par prospect), scopés au cabinet courant, et les
 * transforme en lignes du tableau. Best-effort : en l'absence de base/contexte,
 * renvoie [] et l'écran retombe sur les exemples de la maquette.
 */
async function loadRealProspects(): Promise<ProspectRow[]> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
    const ctx = await getSessionContext();
    if (!ctx) return [];
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("dci_submissions")
      .select("prospect_slug, kind, display_name, payload, updated_at")
      .eq("tenant_id", ctx.tenantId)
      .order("updated_at", { ascending: false })
      .limit(200);
    if (!data || data.length === 0) return [];

    type Acc = { name: string; kinds: Set<string>; rdvDate: string | null };
    const byProspect = new Map<string, Acc>();
    for (const r of data as Array<{
      prospect_slug: string;
      kind: string;
      display_name: string | null;
      payload: Record<string, unknown> | null;
      updated_at: string;
    }>) {
      const cur =
        byProspect.get(r.prospect_slug) ??
        { name: r.display_name ?? r.prospect_slug, kinds: new Set<string>(), rdvDate: null };
      cur.kinds.add(r.kind);
      if (r.display_name) cur.name = r.display_name;
      if (r.kind === "rdv" && r.payload && typeof r.payload.dateLabel === "string") {
        cur.rdvDate = r.payload.dateLabel as string;
      }
      byProspect.set(r.prospect_slug, cur);
    }

    return [...byProspect.values()].map((p, i): ProspectRow => {
      const done = [...p.kinds].map((k) => KIND_LABEL[k] ?? k).join(" · ");
      const status: ProspectStatus =
        p.kinds.size >= 3
          ? { kind: "custom", label: `Parcours ${p.kinds.size}/4`, bg: "#E8F5EE", color: "#1F8049" }
          : { kind: "pill", tone: "sent", label: `${done} reçu` };
      return {
        href: null,
        highlight: i === 0,
        type: "seul",
        names: [p.name],
        typeLabel: "Prospect · parcours en ligne",
        cabinet: { name: "Luc THILLIEZ", meta: "Dirigeant-praticien" },
        ingenieur: null,
        rencontre: {
          date: p.rdvDate ?? "—",
          meta: p.kinds.has("rdv") ? "RDV pris en ligne" : "Pas encore de RDV",
        },
        documents: { date: "—", meta: done ? `${done} reçu(s)` : "Aucun document" },
        status,
      };
    });
  } catch {
    return [];
  }
}

export async function fetchProspectsView(): Promise<ProspectsView> {
  const realRows = await loadRealProspects();
  if (realRows.length === 0) return VIEW;
  return {
    ...VIEW,
    kpis: {
      ...VIEW.kpis,
      actifs: {
        value: String(VIEW.rows.length + realRows.length),
        meta: `dont ${realRows.length} via parcours en ligne`,
      },
    },
    rows: [...realRows, ...VIEW.rows],
  };
}
