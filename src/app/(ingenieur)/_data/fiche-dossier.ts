/**
 * Données d'exemple de la fiche dossier ingénieur — RÉPLIQUE EXACTE de la
 * maquette 030 v28 (`#page-ing-fiche-dossier`, lignes 4950→5101).
 *
 * Dossier modèle : étude patrimoniale Bertrand & Monique DUPONT-TOPIN
 * (ETU-2026-014), pilotée par Julien VASSEUR. Dans la maquette, tous les
 * dossiers du pipeline ouvrent cette fiche exemple via goToPage('ing-fiche-dossier') ;
 * en production chaque dossier a sa propre fiche. Source unique de la page :
 * elle lit ici, jamais de valeur en dur dans le composant.
 */

export type FicheDossierKpi = {
  label: string;
  value: string;
  /** unité affichée en petit après la valeur (€, j, …) */
  unit?: string;
  meta: string;
  /** style de la valeur tel que dans la maquette */
  valueVariant?: "gold" | "green";
};

export type ParcoursEtape = {
  /** numéro affiché dans la pastille */
  num: number;
  /** sur-titre doré en capitales */
  eyebrow: string;
  /** titre de l'étape */
  title: string;
  /** description ; supporte plusieurs lignes pour l'étape 5 */
  description: string;
  /** badge à droite */
  badge: { label: string; variant: "success" | "j1" };
  /** état visuel de l'étape */
  state: "done" | "current";
  /** étape 5 : production de l'étude, mise en forme enrichie */
  rich?: {
    /** ligne en italique sous le titre */
    subtitle: string;
    /** lignes détaillées (HTML <strong> porté en parties) */
    parties: { lead: string; rest: string }[];
    /** encart « Étude livrée » en bas de l'étape */
    livraison: { eyebrow: string; meta: string };
  };
  /**
   * Étape navigable de la maquette : seule l'étape 1 a un onclick
   * (goToPage('ing-detail-etape-1')). Route portée -> client-new.
   */
  href?: string | null;
};

export type FicheDossierAction = {
  label: string;
  /** bouton doré = action principale, sinon ghost */
  primary?: boolean;
  /**
   * Destination réelle de l'action. Présent = bouton actif branché sur une
   * feature existante (salle visio, agenda…). Absent = aucune feature
   * branchée → bouton honnêtement désactivé avec `disabledTitle`.
   */
  href?: string;
  /** titre explicatif quand l'action n'a pas (encore) de back-end. */
  disabledTitle?: string;
  /**
   * Action « Ouvrir l'étude » : déclenche la génération + le téléchargement du
   * PDF réel de l'étude patrimoniale (Server Action pdf-lib), pas un lien.
   */
  etude?: boolean;
};

export type FicheDossier = {
  id: string;
  eyebrow: string;
  heroNameLead: string;
  heroNameStrong: string;
  heroSub: string;
  kpis: FicheDossierKpi[];
  parcours: ParcoursEtape[];
  actions: FicheDossierAction[];
};

/**
 * Construit l'URL d'une salle de visioconférence réelle (Jitsi auto-hébergé +
 * transcription Deepgram, déjà câblés sous /visio/[room]). Même convention de
 * nommage que les RDV : `rdv-<slug>-<objet>`. On entre côté ingénieur.
 */
function visioHref(room: string, slug: string, nom: string): string {
  const q = new URLSearchParams({ role: "engineer", prospect: slug, nom });
  return `/visio/${room}?${q.toString()}`;
}

const FICHE_DOSSIER_MODELE: FicheDossier = {
  id: "ETU-2026-014",
  eyebrow: "Dossier ETU-2026-014 · stratégie de transmission · ouvert le 15/03/2026",
  heroNameLead: "Bertrand & Monique ",
  heroNameStrong: "DUPONT-TOPIN",
  heroSub:
    "Étude patrimoniale · régime de l'union · honoraires 12 800 € HT · restitution prévue demain 12/05/2026 à 14h00 (Zoom · 90 min) · dossier piloté de bout en bout par Julien VASSEUR.",
  kpis: [
    {
      label: "Étape actuelle",
      value: "5 · Restituée",
      meta: "RDV restitution demain 14h00",
      valueVariant: "gold",
    },
    {
      label: "Honoraires HT",
      value: "12 800",
      unit: "€",
      meta: "payés le 28/04/2026",
    },
    {
      label: "Durée du dossier",
      value: "58",
      unit: "j",
      meta: "démarrage 15/03 → livraison 12/05",
    },
    {
      label: "Statut conformité",
      value: "✓ OK",
      meta: "KYC + LCB-FT validés",
      valueVariant: "green",
    },
  ],
  parcours: [
    {
      num: 1,
      eyebrow: "Étape 1 · Créée le 15/03/2026 par Julien VASSEUR",
      title: "Création de l'espace client + envoi du document de collecte",
      description:
        "Espace client créé · document de collecte simplifié envoyé · client a complété en 6 jours",
      badge: { label: "✓ Terminée", variant: "success" },
      state: "done",
      href: "/espace-ingenieur/client-new",
    },
    {
      num: 2,
      eyebrow: "Étape 2 · 15/04/2026 · 14h30 · Zoom 120 min",
      title: "RDV visio enregistré + transcription IA + complétion auto-doc",
      description:
        "Entretien découverte enregistré · transcription IA générée (87 min de parole utile) · doc collecte complet rempli automatiquement à partir du transcript et du doc simplifié",
      badge: { label: "✓ Terminée", variant: "success" },
      state: "done",
    },
    {
      num: 3,
      eyebrow: "Étape 3 · 22/04 → 28/04/2026 · Yousign + Stripe",
      title: "Envoi du pack pour signature + paiement",
      description:
        "Pack envoyé : doc entrée en relation · doc collecte complété · lettre de mission · facture · IBAN · étude anonymisée · synthèse anonymisée — signé et payé le 28/04 (6 jours)",
      badge: { label: "✓ Terminée", variant: "success" },
      state: "done",
    },
    {
      num: 4,
      eyebrow: "Étape 4 · 28/04 → 25/04/2026 · 18 documents",
      title: "Ouverture espace sécurisé · documents demandés organisés par IA",
      description:
        'IA a généré la liste de 18 documents demandés à partir du transcript + collecte signée · client a tout uploadé en 4 jours · cliqué "Terminé" · alerte reçue · ingénieur a validé + fixé RDV restitution',
      badge: { label: "✓ Terminée", variant: "success" },
      state: "done",
    },
    {
      num: 5,
      eyebrow: "Étape 5 · 25/04 → 06/05/2026 · 11 jours",
      title: "Réalisation de l'étude patrimoniale · 4 parties",
      description: "",
      badge: { label: "✓ Livrée", variant: "success" },
      state: "done",
      rich: {
        subtitle: "Production conduite par l'ingénieur · avec l'appui des agents IA ASTRAEOS",
        parties: [
          {
            lead: "Partie 1 · Bilan patrimonial",
            rest: " : insécurités + axes d'optimisation + météo patrimoniale finale",
          },
          {
            lead: "Partie 2 · Étude patrimoniale (préconisations)",
            rest: " : 5 axes structurés (situation client / projection sans action / proposition ASTRAEOS / projection avec action / étapes de mise en place / simulation chiffrée / textes de loi)",
          },
          {
            lead: "Partie 3 · Tableau récapitulatif",
            rest: " : 3 colonnes (Situation initiale / Préconisations / Gains)",
          },
          {
            lead: "Partie 4 · Frise chronologique",
            rest: " de mise en place",
          },
        ],
        livraison: {
          eyebrow: "Étude livrée · v1.0",
          meta: "84 pages · révisée par Julien le 05/05 · version finale livrée 06/05/2026",
        },
      },
    },
    {
      num: 6,
      eyebrow: "Étape 6 · DEMAIN 12/05/2026 · 14h00 · Zoom 90 min",
      title: "Restitution de l'étude au client",
      description:
        "RDV confirmé par le couple · enregistrement actif · suivi des actions de mise en œuvre à planifier ensuite",
      badge: { label: "📅 J-1", variant: "j1" },
      state: "current",
    },
  ],
  actions: [
    {
      // Restitution = le RDV visio Zoom de l'étape 6 (demain 14h, 90 min).
      // Branché sur la vraie salle de visioconférence (Jitsi + transcription).
      label: "📋 Préparer la restitution",
      primary: true,
      href: visioHref(
        "rdv-dupont-topin-restitution",
        "dupont-topin",
        "Bertrand & Monique DUPONT-TOPIN",
      ),
    },
    {
      // Génère et télécharge le vrai PDF de l'étude patrimoniale (pdf-lib).
      label: "📄 Ouvrir l'étude (84 p.)",
      etude: true,
    },
    {
      // RDV découverte du 15/04 enregistré + transcrit (étape 2) : on rouvre la
      // salle visio pour consulter l'enregistrement et le transcript.
      label: "📹 Voir le transcript RDV 15/04",
      href: visioHref(
        "rdv-dupont-topin-decouverte",
        "dupont-topin",
        "Bertrand & Monique DUPONT-TOPIN",
      ),
    },
    {
      // Reporter = repasser par l'agenda (vraie feature de planification).
      label: "📅 Reporter le RDV",
      href: "/espace-ingenieur/agenda",
    },
  ],
};

/* ── Branchement Supabase ─────────────────────────────────────────────────
 *
 * La fiche dossier lit le vrai dossier (`dossiers` ⨝ `clients` ⨝ `personnes`)
 * enrichi de l'étude (`etudes`), des pièces de conformité (`conformite_items`)
 * et des souscriptions (`souscriptions`). On reconstruit le hero et les 4 KPIs
 * depuis la base, et on ajuste l'état des étapes du parcours qui dépendent de
 * données réelles (étude livrée, conformité OK). Le détail éditorial de chaque
 * étape (parcours en 6 temps, encart de production) reste celui du modèle :
 * ce sont des libellés métier, pas des données de dossier. Repli intégral sur
 * le modèle quand la base n'est pas configurée ou l'id est inconnu.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STAGE_STEP: Record<string, number> = {
  "01_prospect": 1,
  "02_compliance": 2,
  "03_collecte": 4,
  "04_etudes": 5,
  "05_restituee": 6,
  "06_suivi": 6,
};

const STAGE_LABEL: Record<string, string> = {
  "01_prospect": "Prospect",
  "02_compliance": "Conformité",
  "03_collecte": "Collecte",
  "04_etudes": "En production",
  "05_restituee": "Restituée",
  "06_suivi": "En suivi",
};

type RawPersonne = {
  role_in_household: string | null;
  first_name: string | null;
  last_name: string | null;
};

type RawDossierFull = {
  id: string;
  pipeline_stage: string | null;
  pipeline_entry_date: string | null;
  study_delivered_at: string | null;
  restitution_meeting_date: string | null;
  total_revenue_cached: number | string | null;
  internal_notes: string | null;
  client: {
    household_type: string | null;
    personnes: RawPersonne[] | null;
  } | null;
  etudes: { status: string | null; delivered_at: string | null }[] | null;
  conformite_items: { status: string | null }[] | null;
  souscriptions: { amount_initial: number | string | null; status: string | null }[] | null;
};

function fmtDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtAmount(value: number | string | null | undefined): string | null {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n).toLocaleString("fr-FR").replace(/ /g, " ");
}

function daysBetween(from: string | null, to: string | null): number | null {
  if (!from) return null;
  const start = new Date(from).getTime();
  const end = to ? new Date(to).getTime() : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  const diff = Math.round((end - start) / 86_400_000);
  return diff >= 0 ? diff : null;
}

function heroFromDossier(row: RawDossierFull): {
  eyebrow: string;
  heroNameLead: string;
  heroNameStrong: string;
  heroSub: string;
} {
  // Raison sociale éventuelle (personne morale) stockée en JSON dans les notes.
  let raisonSociale: string | undefined;
  if (row.internal_notes) {
    try {
      raisonSociale = (JSON.parse(row.internal_notes) as { raison_sociale?: string }).raison_sociale;
    } catch {
      /* notes non-JSON : on ignore */
    }
  }

  const personnes = row.client?.personnes ?? [];
  const a = personnes.find((p) => p.role_in_household === "person_a") ?? personnes[0];
  const b = personnes.find((p) => p.role_in_household === "person_b");
  const lastName = (a?.last_name ?? "").trim();
  const aFirst = (a?.first_name ?? "").trim();
  const lead = b ? [aFirst, (b.first_name ?? "").trim()].filter(Boolean).join(" & ") : aFirst;

  const stage = row.pipeline_stage ?? "01_prospect";
  const stageLabel = STAGE_LABEL[stage] ?? "En cours";
  const entry = fmtDate(row.pipeline_entry_date);

  const subBits: string[] = ["Étude patrimoniale"];
  const honoraires = fmtAmount(row.total_revenue_cached);
  if (honoraires) subBits.push(`honoraires ${honoraires} €`);
  if (row.study_delivered_at) {
    subBits.push(`étude livrée le ${fmtDate(row.study_delivered_at)}`);
  } else if (row.restitution_meeting_date) {
    subBits.push(`restitution prévue le ${fmtDate(row.restitution_meeting_date)}`);
  }
  subBits.push(`stade actuel : ${stageLabel.toLowerCase()}`);

  return {
    eyebrow: `Dossier ${row.id} · ${stageLabel} · ouvert le ${entry}`,
    heroNameLead: raisonSociale ? "" : lead ? `${lead} ` : "",
    heroNameStrong: raisonSociale || lastName || "Dossier",
    heroSub: subBits.join(" · ") + ".",
  };
}

function kpisFromDossier(row: RawDossierFull): FicheDossierKpi[] {
  const stage = row.pipeline_stage ?? "01_prospect";
  const step = STAGE_STEP[stage] ?? 1;
  const stageLabel = STAGE_LABEL[stage] ?? "En cours";

  const honoraires = fmtAmount(row.total_revenue_cached);
  const conformiteItems = row.conformite_items ?? [];
  const conformiteOk =
    conformiteItems.length > 0 &&
    conformiteItems.every((i) => i.status === "signe" || i.status === "valide");

  const dureeRef = row.study_delivered_at ?? row.restitution_meeting_date ?? null;
  const duree = daysBetween(row.pipeline_entry_date, dureeRef);

  return [
    {
      label: "Étape actuelle",
      value: `${step} · ${stageLabel}`,
      meta: row.restitution_meeting_date
        ? `RDV restitution ${fmtDate(row.restitution_meeting_date)}`
        : "Parcours patrimonial en cours",
      valueVariant: "gold",
    },
    {
      label: "Honoraires HT",
      value: honoraires ?? "—",
      unit: honoraires ? "€" : undefined,
      meta: honoraires ? "facturés pour la mission" : "à définir",
    },
    {
      label: "Durée du dossier",
      value: duree != null ? String(duree) : "—",
      unit: duree != null ? "j" : undefined,
      meta: `démarrage ${fmtDate(row.pipeline_entry_date)}`,
    },
    {
      label: "Statut conformité",
      value: conformiteOk ? "✓ OK" : "En cours",
      meta: conformiteOk
        ? "KYC + LCB-FT validés"
        : `${conformiteItems.length} pièce(s) de conformité`,
      valueVariant: conformiteOk ? "green" : undefined,
    },
  ];
}

/**
 * Recale l'état visuel des étapes du parcours sur le stade réel du dossier :
 * les étapes <= étape courante passent « done », l'étape courante « current ».
 * On conserve le contenu éditorial des étapes (titres, descriptions) du modèle.
 */
function parcoursForStep(currentStep: number): ParcoursEtape[] {
  return FICHE_DOSSIER_MODELE.parcours.map((etape) => {
    if (etape.num < currentStep) return { ...etape, state: "done" };
    if (etape.num === currentStep) return { ...etape, state: "current" };
    return { ...etape, state: "done" };
  });
}

/**
 * Fiche dossier réelle alimentée par la base. Dégrade sur le modèle de la
 * maquette quand Supabase n'est pas configuré, la session manque, ou l'id ne
 * correspond à aucun dossier du cabinet. Garde la forme de retour `FicheDossier`.
 */
export async function getFicheDossier(id: string): Promise<FicheDossier> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return FICHE_DOSSIER_MODELE;
  // Les ids de la maquette ne sont pas des UUID : on évite une requête vide.
  if (!UUID_RE.test(id)) return FICHE_DOSSIER_MODELE;

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const { getSessionContext } = await import("@/lib/auth/context");

    const ctx = await getSessionContext();
    if (!ctx) return FICHE_DOSSIER_MODELE;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dossiers")
      .select(
        `
          id, pipeline_stage, pipeline_entry_date, study_delivered_at,
          restitution_meeting_date, total_revenue_cached, internal_notes,
          client:clients!inner (
            household_type,
            personnes ( role_in_household, first_name, last_name )
          ),
          etudes ( status, delivered_at ),
          conformite_items ( status ),
          souscriptions ( amount_initial, status )
        `,
      )
      .eq("id", id)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();

    if (error || !data) return FICHE_DOSSIER_MODELE;

    const row = data as unknown as RawDossierFull;
    const hero = heroFromDossier(row);
    const step = STAGE_STEP[row.pipeline_stage ?? "01_prospect"] ?? 1;

    return {
      ...FICHE_DOSSIER_MODELE,
      id: row.id,
      eyebrow: hero.eyebrow,
      heroNameLead: hero.heroNameLead,
      heroNameStrong: hero.heroNameStrong,
      heroSub: hero.heroSub,
      kpis: kpisFromDossier(row),
      parcours: parcoursForStep(step),
    };
  } catch {
    return FICHE_DOSSIER_MODELE;
  }
}
