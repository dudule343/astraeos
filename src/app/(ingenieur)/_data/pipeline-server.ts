import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";
import {
  type Dossier,
  joursDepuis,
  joursEnEtape,
  isAlerte,
  alerteBadge,
  carteContexte,
  etatBadge,
} from "@/lib/pipeline";

import {
  getPipelineScreen,
  type PipelineScreen,
  type PipelineColumn,
  type PipelineCard,
  type CardBadge,
} from "./pipeline";

/**
 * Module SERVEUR de la vue Kanban « Pipeline de mes dossiers ».
 *
 * Lit les vrais dossiers du cabinet (scope tenant/cabinet, comme l'éditeur)
 * et les répartit sur les 6 colonnes du parcours. Les cartes, badges, barres
 * de collecte et alertes sont dérivés des données réelles via `lib/pipeline`
 * (fonctions pures partagées). Dégrade proprement sur la maquette d'origine
 * (`getPipelineScreen`) si la base n'est pas configurée, si la session manque
 * ou si le cabinet n'a encore aucun dossier — on garde l'écran plein plutôt
 * qu'un Kanban vide.
 *
 * NE DOIT JAMAIS être importé par un composant client (next/headers indirect).
 */

const STAGE_ORDER = [
  "01_prospect",
  "02_compliance",
  "03_collecte",
  "04_etudes",
  "05_restituee",
  "06_suivi",
] as const;

type StageKey = (typeof STAGE_ORDER)[number];

const COLUMN_META: Record<
  StageKey,
  Pick<PipelineColumn, "step" | "title" | "subtitle" | "headerVariant" | "countTone" | "emphasized">
> = {
  "01_prospect": {
    step: 1,
    title: "Prospects",
    subtitle: "Nouveau contact · 1er RDV à organiser",
    headerVariant: "gold-soft",
    countTone: "gold",
    emphasized: false,
  },
  "02_compliance": {
    step: 2,
    title: "Conformité",
    subtitle: "KYC, LCB-FT, entrée en relation",
    headerVariant: "plain",
    countTone: "navy",
    emphasized: false,
  },
  "03_collecte": {
    step: 3,
    title: "Collecte",
    subtitle: "Espace sécurisé · documents client",
    headerVariant: "plain",
    countTone: "navy",
    emphasized: false,
  },
  "04_etudes": {
    step: 4,
    title: "Production",
    subtitle: "Rédaction étude · 4 parties",
    headerVariant: "gold-strong",
    countTone: "gold",
    emphasized: true,
  },
  "05_restituee": {
    step: 5,
    title: "Restituées",
    subtitle: "Études livrées · cumul 2026",
    headerVariant: "plain",
    countTone: "gold-300",
    emphasized: false,
  },
  "06_suivi": {
    step: 6,
    title: "Suivi",
    subtitle: "Clients en suivi annuel",
    headerVariant: "plain",
    countTone: "navy",
    emphasized: false,
  },
};

/** Combien de cartes on affiche par colonne avant le pied « … N autres ». */
const MAX_CARDS_PER_COLUMN = 3;

const ETAT_TONE_TO_BADGE_STYLE: Record<"gold" | "blue" | "success", CardBadge["style"]> = {
  gold: "gold",
  blue: "blue",
  success: "success",
};

function cardOf(d: Dossier, now: Date): PipelineCard {
  const alerte = isAlerte(d, now);
  let badge: CardBadge | undefined;
  if (alerte) {
    const label = alerteBadge(d, now);
    if (label) badge = { label, style: "alert" };
  } else {
    const etat = etatBadge(d, now);
    if (etat) badge = { label: etat.text, style: ETAT_TONE_TO_BADGE_STYLE[etat.tone] };
  }

  return {
    id: d.id,
    name: d.name,
    sub: carteContexte(d, now),
    variant: alerte ? "alert" : "default",
    badge,
    // Barre de collecte uniquement à l'étape Collecte (comme la maquette).
    progressPct: d.stage === "03_collecte" ? (d.dciPct ?? 0) : undefined,
    // Toutes les fiches dossier mènent à la même fiche modèle aujourd'hui ;
    // on rend cliquable chaque carte d'un dossier réel.
    linkable: true,
  };
}

/** Tri d'une colonne : alertes d'abord, puis entrée d'étape la plus récente. */
function sortColumn(rows: Dossier[], now: Date): Dossier[] {
  return [...rows].sort((a, b) => {
    const aa = isAlerte(a, now) ? 1 : 0;
    const ab = isAlerte(b, now) ? 1 : 0;
    if (aa !== ab) return ab - aa;
    const ja = joursEnEtape(a, now) ?? 0;
    const jb = joursEnEtape(b, now) ?? 0;
    return jb - ja;
  });
}

function buildScreen(dossiers: Dossier[], now: Date): PipelineScreen {
  const byStage = new Map<StageKey, Dossier[]>();
  for (const k of STAGE_ORDER) byStage.set(k, []);
  for (const d of dossiers) {
    const k = d.stage as StageKey;
    if (byStage.has(k)) byStage.get(k)!.push(d);
  }

  const columns: PipelineColumn[] = STAGE_ORDER.map((stage) => {
    const meta = COLUMN_META[stage];
    const rows = sortColumn(byStage.get(stage) ?? [], now);
    const shown = rows.slice(0, MAX_CARDS_PER_COLUMN);
    const hidden = rows.length - shown.length;
    return {
      ...meta,
      count: rows.length,
      cards: shown.map((d) => cardOf(d, now)),
      footerNote: hidden > 0 ? `… ${hidden} autre${hidden > 1 ? "s" : ""}` : undefined,
    };
  });

  const actifs = dossiers.filter(
    (d) => d.stage !== "05_restituee" && d.stage !== "06_suivi" && d.stage !== "00_archive",
  ).length;
  const livrees = (byStage.get("05_restituee")?.length ?? 0);
  const suivi = byStage.get("06_suivi")?.length ?? 0;
  const enAlerte = dossiers.filter((d) => isAlerte(d, now)).length;

  // Délai moyen collecte → restitution sur les dossiers livrés (en jours).
  const delais = dossiers
    .map((d) => {
      const j = joursDepuis(d.entryDate, new Date(d.deliveredAt ?? 0));
      return d.deliveredAt && j != null && j > 0 ? j : null;
    })
    .filter((j): j is number => j != null);
  const delaiMoyen =
    delais.length > 0 ? Math.round(delais.reduce((a, b) => a + b, 0) / delais.length) : null;

  return {
    hero: {
      eyebrow: "Parcours patrimonial · 6 étapes du dossier",
      sub:
        `Vue Kanban de l'ensemble de mes dossiers · ${actifs} dossier${actifs > 1 ? "s" : ""} ` +
        `actif${actifs > 1 ? "s" : ""} hors suivi · ${livrees} étude${livrees > 1 ? "s" : ""} ` +
        `restituée${livrees > 1 ? "s" : ""} · ${suivi} client${suivi > 1 ? "s" : ""} en suivi.`,
    },
    kpis: [
      { label: "Dossiers actifs", value: String(actifs), tone: null, meta: "en cours · hors suivi" },
      { label: "Études restituées", value: String(livrees), tone: "gold", meta: "cumul 2026" },
      {
        label: "Délai moyen étude",
        value: delaiMoyen != null ? String(delaiMoyen) : "—",
        tone: null,
        unit: delaiMoyen != null ? "j" : undefined,
        meta: "collecte → restitution",
      },
      {
        label: "Dossiers en alerte",
        value: String(enAlerte),
        tone: enAlerte > 0 ? "alert" : null,
        meta: "KYC + production en retard",
      },
    ],
    columns,
  };
}

/**
 * Charge les dossiers du cabinet courant pour la vue Kanban.
 * Réplique le scope de `_data/dossiers.ts` (tenant + cabinet), projeté sur le
 * type pur `Dossier`. Renvoie [] (→ fallback) si la base/session manque.
 */
async function loadDossiers(): Promise<Dossier[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  const ctx = await getSessionContext();
  if (!ctx) return [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("dossiers")
      .select(
        `
          id,
          pipeline_stage,
          priority,
          dci_completion_pct,
          pipeline_entry_date,
          stage_entered_at,
          study_delivered_at,
          restitution_meeting_date,
          days_in_stage_cached,
          internal_notes,
          clients ( personnes ( first_name, last_name, role_in_household ) )
        `,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .order("stage_entered_at", { ascending: false })
      .limit(300);

    if (!data) return [];

    return data.map((d: Record<string, unknown>) => {
      let raisonSociale: string | undefined;
      const notesRaw = d.internal_notes as string | null | undefined;
      if (notesRaw) {
        try {
          raisonSociale = (JSON.parse(notesRaw) as { raison_sociale?: string }).raison_sociale;
        } catch {
          // internal_notes non-JSON : on ignore
        }
      }
      const clientRaw = d.clients as
        | { personnes?: Array<{ first_name?: string; last_name?: string; role_in_household?: string }> }
        | Array<{ personnes?: Array<{ first_name?: string; last_name?: string; role_in_household?: string }> }>
        | null
        | undefined;
      const client = Array.isArray(clientRaw) ? clientRaw[0] : clientRaw;
      const personnes = client?.personnes ?? [];
      const a = personnes.find((p) => p.role_in_household === "person_a") ?? personnes[0];
      const b = personnes.find((p) => p.role_in_household === "person_b");
      const lastName = (a?.last_name ?? "").trim();
      const aFirst = (a?.first_name ?? "").trim();
      let name = raisonSociale ?? "";
      if (!name) {
        if (b) {
          const bFirst = (b.first_name ?? "").trim();
          const lead = [aFirst, bFirst].filter(Boolean).join(" & ");
          name = `${lead} ${lastName}`.trim();
        } else {
          name = `${aFirst} ${lastName}`.trim();
        }
      }

      return {
        id: d.id as string,
        stage: d.pipeline_stage as string,
        name: name || "Dossier sans nom",
        priority: (d.priority as string) ?? null,
        dciPct: (d.dci_completion_pct as number) ?? null,
        entryDate: (d.pipeline_entry_date as string) ?? null,
        stageEnteredAt: (d.stage_entered_at as string) ?? null,
        deliveredAt: (d.study_delivered_at as string) ?? null,
        restitDate: (d.restitution_meeting_date as string) ?? null,
        daysInStage: (d.days_in_stage_cached as number) ?? null,
      } satisfies Dossier;
    });
  } catch {
    return [];
  }
}

/**
 * Écran Kanban alimenté par la base réelle, avec repli sur la maquette pleine.
 */
export async function getPipelineScreenLive(): Promise<PipelineScreen> {
  const dossiers = await loadDossiers();
  if (dossiers.length === 0) return getPipelineScreen();
  return buildScreen(dossiers, new Date());
}
