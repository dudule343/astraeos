/**
 * Données d'exemple de la fiche RDV ingénieur — RÉPLIQUE EXACTE de la maquette
 * 030 v28 (`#page-ing-fiche-rdv-mercier` lignes 7742→7847 et
 * `#page-ing-fiche-rdv-joubert` lignes 7849→7957).
 *
 * Source unique de la page `agenda/[id]`. Comme la fiche client, toutes les
 * routes `/espace-ingenieur/agenda/<slug>` retombent sur un modèle de
 * référence : on garde un mapping minimal par slug (mercier / joubert), et
 * tout slug inconnu sert le modèle Mercier.
 */

export type RdvTag = {
  label: string;
  /** style du badge porté de la maquette */
  variant: "calendly" | "docs" | "statut";
};

export type RdvObjectif = {
  /** rang 1/2/3 affiché dans la pastille */
  rank: number;
  /** couleur de la pastille (gold = prioritaire, gold-soft = 2, navy-300 = 3) */
  rankVariant: "gold" | "gold-soft" | "navy-300";
  title: string;
  meta: string;
};

export type RdvDoc = {
  id: string;
  title: string;
  /** ex. "le 6 juin 2026 à 14h32" */
  date: string;
  /** type de modale ouverte dans la maquette (openModalDCI / openModalQualif) */
  kind: "dci" | "qualif";
};

/** Fragment de titre : `strong:true` => prénom/NOM en gras, sinon texte courant. */
export type TitlePart = { text: string; strong: boolean };

export type FicheRdv = {
  slug: string;
  /** salle Jitsi dérivée du RDV (alphanum + tirets) */
  room: string;
  eyebrow: string;
  /** titre du hero, en fragments (prénom + NOM en gras, peut contenir un couple) */
  title: TitlePart[];
  /** sous-titre du hero (date, durée, mode, profil) */
  sub: string;
  tags: RdvTag[];
  /** label passé au bouton « Rejoindre en visio » */
  visioLabel: string;
  /** intitulé court du prospect pour le nom de salle (URL) */
  nom: string;
  /** un second bouton « Modifier le RDV » sous le bouton visio (Joubert) */
  hasModifier: boolean;
  /** lignes de la carte « Synthèse client » (label en gras + reste) */
  synthese: { label: string; value: string }[];
  /** titre de la carte synthèse documents (« par le prospect » / « par le couple ») */
  docsCardTitle: string;
  objectifs: RdvObjectif[];
  docs: RdvDoc[];
  /** texte de la note v21 en bas de la carte documents */
  noteV21: string;
};

const MERCIER: FicheRdv = {
  slug: "mercier",
  room: "rdv-mercier-entretien-initial",
  eyebrow: "Rendez-vous · Entretien initial",
  title: [
    { text: "Nicolas ", strong: false },
    { text: "MERCIER", strong: true },
  ],
  sub: "Mardi 9 juin 2026 · 16h00-17h30 (1h30) · visio · personne seule · 47 ans · architecte associé.",
  tags: [
    { label: "RDV CALENDLY", variant: "calendly" },
    { label: "Documents préparatoires complétés", variant: "docs" },
    { label: "Statut prospect", variant: "statut" },
  ],
  visioLabel: "Entretien initial",
  nom: "Nicolas MERCIER",
  hasModifier: false,
  synthese: [
    {
      label: "Régime de l'union",
      value: "célibataire · personne seule · 0 enfant à charge",
    },
    {
      label: "Activité",
      value: "architecte associé · profession libérale · TMI 41 %",
    },
    { label: "Résidence fiscale", value: "France · Bordeaux (33)" },
    {
      label: "Patrimoine brut estimé",
      value: "≈ 540 000 € (RP + financier + pro)",
    },
    { label: "Capacité d'épargne", value: "≈ 28 000 € / an" },
  ],
  docsCardTitle: "Documents préparatoires complétés par le prospect",
  objectifs: [
    {
      rank: 1,
      rankVariant: "gold",
      title: "Optimiser ma fiscalité",
      meta: "Importance élevée · à initier à court terme (1-2 ans)",
    },
    {
      rank: 2,
      rankVariant: "gold-soft",
      title: "Préparer ma retraite",
      meta: "Importance moyenne · horizon long terme (5-10 ans)",
    },
    {
      rank: 3,
      rankVariant: "navy-300",
      title: "Constituer un capital",
      meta: "Importance moyenne · à initier à moyen terme (3-5 ans)",
    },
  ],
  docs: [
    {
      id: "dci",
      title: "DCI Simplifié complété",
      date: "le 6 juin 2026 à 14h32",
      kind: "dci",
    },
    {
      id: "qualif",
      title: "Questionnaire de qualification complété",
      date: "le 7 juin 2026 à 21h08",
      kind: "qualif",
    },
  ],
  noteV21:
    "à ce stade d'entretien initial, le DCI Complet n'est pas encore demandé. Il sera proposé après l'entretien si le prospect souhaite engager une étude patrimoniale approfondie.",
};

const JOUBERT: FicheRdv = {
  slug: "joubert",
  room: "rdv-joubert-berthoux-entretien-initial",
  eyebrow: "Rendez-vous · Entretien initial",
  title: [
    { text: "Camille ", strong: false },
    { text: "JOUBERT", strong: true },
    { text: " & Yannick ", strong: false },
    { text: "BERTHOUX", strong: true },
  ],
  sub: "Mardi 12 mai 2026 · 11h30-13h00 (1h30) · visio · couple PACS séparation de biens · 3 enfants à charge.",
  tags: [
    { label: "RDV CALENDLY", variant: "calendly" },
    { label: "Documents préparatoires complétés", variant: "docs" },
    { label: "Statut prospect", variant: "statut" },
  ],
  visioLabel: "Entretien initial · Camille JOUBERT & Yannick BERTHOUX",
  nom: "Camille JOUBERT & Yannick BERTHOUX",
  hasModifier: true,
  synthese: [
    {
      label: "Régime de l'union",
      value: "PACS · séparation de biens · 3 enfants (Léa 12 · Tom 8 · Inès 5)",
    },
    {
      label: "Activités",
      value:
        "Camille (RH cadre supérieur · 65 k€) · Yannick (président SASU conseil · 65 k€ + dividendes)",
    },
    { label: "Résidence fiscale", value: "France · Paris 12e" },
    {
      label: "Patrimoine brut estimé",
      value: "≈ 2 955 000 € · net ≈ 1 750 000 €",
    },
    { label: "Capacité d'épargne", value: "≈ 54 000 € / an" },
  ],
  docsCardTitle: "Documents préparatoires complétés par le couple",
  objectifs: [
    {
      rank: 1,
      rankVariant: "gold",
      title: "Protéger ma famille",
      meta: "Importance élevée · à initier à court terme (1-2 ans)",
    },
    {
      rank: 2,
      rankVariant: "gold-soft",
      title: "Optimiser ma fiscalité",
      meta: "Importance moyenne · horizon moyen terme (3-5 ans)",
    },
    {
      rank: 3,
      rankVariant: "navy-300",
      title: "Préparer ma transmission patrimoniale",
      meta: "Importance moyenne · horizon long terme (5-10 ans)",
    },
  ],
  docs: [
    {
      id: "dci",
      title: "DCI Simplifié complété",
      date: "le 9 mai 2026 à 21h47",
      kind: "dci",
    },
    {
      id: "qualif",
      title: "Questionnaire de qualification complété",
      date: "le 10 mai 2026 à 14h12",
      kind: "qualif",
    },
  ],
  noteV21:
    "à ce stade d'entretien initial, le DCI Complet n'est pas encore demandé. Il sera proposé après l'entretien si le couple souhaite engager une étude patrimoniale approfondie.",
};

const FICHES: Record<string, FicheRdv> = {
  mercier: MERCIER,
  joubert: JOUBERT,
  "joubert-berthoux": JOUBERT,
};

/* ── Branchement Supabase ─────────────────────────────────────────────────
 *
 * Quand l'id de la route est un UUID de RDV réel du cabinet, on lit le vrai
 * rendez-vous (`rdv` ⨝ `dossiers` ⨝ `clients` ⨝ `personnes`) et on reconstruit
 * le hero (titre = foyer, sous-titre = date/durée/format/type) et la synthèse
 * client (régime du foyer). Les objectifs DCI et la liste des documents
 * préparatoires restent ceux du modèle (contenu éditorial de la maquette tant
 * que ces flux ne sont pas matérialisés en base). Repli complet sur le modèle.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const RDV_TYPE_LABEL: Record<string, string> = {
  decouverte: "Entretien initial",
  collecte: "RDV collecte",
  restitution: "Restitution de l'étude",
  signature: "Signature",
  suivi_annuel: "Suivi annuel",
  autre: "Rendez-vous",
};

const RDV_FORMAT_LABEL: Record<string, string> = {
  visio: "visio",
  presentiel: "présentiel",
  telephone: "téléphone",
};

const HOUSEHOLD_LABEL: Record<string, string> = {
  couple_marie: "couple marié",
  couple_pacs: "couple PACS",
  celibataire: "personne seule",
  divorce: "personne divorcée",
  veuf: "personne veuve",
};

type RawRdvPersonne = {
  role_in_household: string | null;
  first_name: string | null;
  last_name: string | null;
};

type RawRdv = {
  id: string;
  type: string | null;
  format: string | null;
  scheduled_at: string | null;
  duration_minutes: number | null;
  video_room_url: string | null;
  dossier: {
    client: {
      household_type: string | null;
      nb_children: number | null;
      tax_residency: string | null;
      personnes: RawRdvPersonne[] | null;
    } | null;
  } | null;
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ficheFromRdv(row: RawRdv): FicheRdv {
  const personnes = row.dossier?.client?.personnes ?? [];
  const a = personnes.find((p) => p.role_in_household === "person_a") ?? personnes[0];
  const b = personnes.find((p) => p.role_in_household === "person_b");

  const aFirst = (a?.first_name ?? "").trim();
  const aLast = (a?.last_name ?? "").trim();
  const title: TitlePart[] = aFirst || aLast
    ? [
        { text: `${aFirst} `, strong: false },
        { text: aLast, strong: true },
      ]
    : [{ text: "Rendez-vous", strong: true }];
  let nom = `${aFirst} ${aLast}`.trim();
  if (b) {
    const bFirst = (b.first_name ?? "").trim();
    const bLast = (b.last_name ?? "").trim();
    title.push({ text: " & ", strong: false }, { text: `${bFirst} ${bLast}`.trim(), strong: true });
    nom = `${nom} & ${`${bFirst} ${bLast}`.trim()}`.trim();
  }
  if (!nom) nom = "Rendez-vous";

  const typeLabel = RDV_TYPE_LABEL[row.type ?? "autre"] ?? "Rendez-vous";
  const formatLabel = RDV_FORMAT_LABEL[row.format ?? ""] ?? row.format ?? "visio";

  // Sous-titre : date + créneau + durée + format + composition du foyer.
  const subBits: string[] = [];
  if (row.scheduled_at) {
    const d = new Date(row.scheduled_at);
    if (!Number.isNaN(d.getTime())) {
      const dateStr = d.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const start = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      const mins = row.duration_minutes ?? 60;
      const end = new Date(d.getTime() + mins * 60_000).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const durationLabel =
        mins % 60 === 0 ? `${mins / 60}h` : `${Math.floor(mins / 60)}h${mins % 60}`;
      subBits.push(`${dateStr} · ${start}-${end} (${durationLabel})`);
    }
  }
  subBits.push(formatLabel);
  const householdType = row.dossier?.client?.household_type ?? null;
  if (householdType) subBits.push(HOUSEHOLD_LABEL[householdType] ?? householdType);
  const nbChildren = row.dossier?.client?.nb_children;
  if (nbChildren != null && nbChildren > 0) {
    subBits.push(`${nbChildren} enfant${nbChildren > 1 ? "s" : ""} à charge`);
  }

  // Synthèse client dérivée du foyer réel (régime + résidence + composition).
  const synthese: { label: string; value: string }[] = [
    {
      label: "Composition du foyer",
      value: [
        householdType ? HOUSEHOLD_LABEL[householdType] ?? householdType : null,
        nbChildren != null ? `${nbChildren} enfant${nbChildren > 1 ? "s" : ""} à charge` : null,
      ]
        .filter(Boolean)
        .join(" · ") || "—",
    },
    {
      label: "Résidence fiscale",
      value: (row.dossier?.client?.tax_residency ?? "").trim() || "—",
    },
  ];

  const base = b ? JOUBERT : MERCIER;
  const slug = slugify(nom) || row.id;

  return {
    ...base,
    slug,
    room: row.video_room_url
      ? slugify(row.video_room_url.split("/").pop() ?? row.id)
      : `rdv-${slug}-${slugify(typeLabel)}`,
    eyebrow: `Rendez-vous · ${typeLabel}`,
    title,
    sub: subBits.join(" · ") + ".",
    visioLabel: `${typeLabel} · ${nom}`,
    nom,
    synthese,
    docsCardTitle: b
      ? "Documents préparatoires complétés par le couple"
      : "Documents préparatoires complétés par le prospect",
  };
}

/**
 * Modèle de référence servi par la route, OU le vrai RDV quand l'id est un UUID
 * réel du cabinet. Tout slug/id inconnu retombe sur Mercier (le modèle de la
 * maquette pour cette passe).
 */
export async function getFicheRdv(slug: string): Promise<FicheRdv> {
  const fallback = FICHES[slug.toLowerCase()] ?? MERCIER;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return fallback;
  if (!UUID_RE.test(slug)) return fallback;

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const { getSessionContext } = await import("@/lib/auth/context");

    const ctx = await getSessionContext();
    if (!ctx) return fallback;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("rdv")
      .select(
        `
          id, type, format, scheduled_at, duration_minutes, video_room_url,
          dossier:dossiers!inner (
            client:clients!inner (
              household_type, nb_children, tax_residency,
              personnes ( role_in_household, first_name, last_name )
            )
          )
        `,
      )
      .eq("id", slug)
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .maybeSingle();

    if (error || !data) return fallback;

    return ficheFromRdv(data as unknown as RawRdv);
  } catch {
    return fallback;
  }
}
