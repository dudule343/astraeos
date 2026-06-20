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
};

export type FicheDossier = {
  id: string;
  eyebrow: string;
  heroNameLead: string;
  heroNameStrong: string;
  heroSub: string;
  /**
   * Action du hero « Ouvrir l'étude » : aucune visionneuse d'étude (84 p.)
   * n'est branchée → bouton honnête désactivé (la maquette le rend inerte).
   */
  ouvrirEtude: { href?: string; disabledTitle?: string };
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
  ouvrirEtude: {
    // Pas de visionneuse d'étude (84 p.) branchée → bouton honnête désactivé.
    disabledTitle: "Ouverture de l'étude — disponible une fois la visionneuse PDF branchée",
  },
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
        subtitle: "Production conduite par l'ingénieur · avec l'appui des agents IA PRIVEOS",
        parties: [
          {
            lead: "Partie 1 · Bilan patrimonial",
            rest: " : insécurités + axes d'optimisation + météo patrimoniale finale",
          },
          {
            lead: "Partie 2 · Étude patrimoniale (préconisations)",
            rest: " : 5 axes structurés (situation client / projection sans action / proposition PRIVEOS / projection avec action / étapes de mise en place / simulation chiffrée / textes de loi)",
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
      // L'étude 84 pages n'a pas de visionneuse branchée → désactivé honnête.
      label: "📄 Ouvrir l'étude (84 p.)",
      disabledTitle:
        "Ouverture de l'étude — disponible une fois la visionneuse PDF branchée",
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

/**
 * Fiche dossier modèle. La maquette n'affiche qu'un seul dossier exemple ;
 * on mappe l'id de l'URL sur le modèle (comme la fiche client), sans le perdre :
 * en production chaque dossier aurait ses propres données.
 */
export function getFicheDossier(_id: string): FicheDossier {
  return FICHE_DOSSIER_MODELE;
}
