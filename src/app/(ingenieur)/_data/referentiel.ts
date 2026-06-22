/**
 * Source de vérité unique pour l'écran « Process & méthodologie »
 * (page-ing-ref-process). Exemples EXACTS de la maquette v28 — référentiel
 * opérationnel du Cabinet Paris Étoile, comme s'il avait été constitué à la
 * main. Aucune valeur en dur dans la page.
 */

/** Section listée dans une carte (Manuel opératoire / Contrat-cadre). */
export type RefListItem = {
  /** Libellé de la ligne (peut contenir un fragment mis en valeur via `strong`). */
  label: string;
  /** Fragment doré préfixé en gras (ex. « Licence de marque »). */
  strong?: string;
  /** Reste de la ligne après le fragment doré. */
  rest?: string;
  /** Lien à droite (« Voir → », « v3.1 → »). */
  link: string;
  /** Ressource ouverte au clic sur le lien (aperçu PDF réel). */
  asset: RefAsset;
  /** true => ligne mise en valeur (fond doré + liseré gauche). */
  highlight?: boolean;
};

/** Toutes les ressources téléchargeables du référentiel (PDF / SVG réels). */
export type RefAsset =
  | "der"
  | "lettre_mission"
  | "manuel"
  | "contrat_cadre"
  | "kyc"
  | "questionnaire"
  | "etude_patrimoniale"
  | "dossier_client"
  | "charte_graphique"
  | "fond_ecran"
  | "logo_principal"
  | "logo_or_blanc";

/** Modèle de la bibliothèque documentaire. */
export type ModeleDoc = {
  title: string;
  desc: string;
  /** Ressource générée pour de vrai → boutons Aperçu / Télécharger branchés. */
  asset: RefAsset;
};

/** Carte des éléments de communication (logo / fond / charte). */
export type CommItem = {
  /** Variante visuelle de la carte. */
  variant: "navy" | "white" | "navy-gradient" | "ivory";
  /** Grand libellé central (« ASTRAEOS », « FOND D'ÉCRAN », « CHARTE GRAPHIQUE »). */
  title: string;
  /** Si vrai, le titre est rendu en serif doré façon logo. */
  logo?: boolean;
  /** Si vrai, le logo serif est doré (sur fond blanc). */
  logoGold?: boolean;
  /** Sous-titre (« Logo principal », « PDF · 24 pages »…). */
  subtitle: string;
  /** Ressource téléchargée par le bouton « Télécharger » de la carte. */
  asset: RefAsset;
};

export type ReferentielScreen = {
  heroEyebrow: string;
  heroSub: string;
  ia: {
    eyebrow: string;
    titre: string;
    description: string;
    placeholder: string;
    cta: string;
    suggestions: string[];
  };
  manuel: {
    title: string;
    description: string;
    sections: RefListItem[];
  };
  contrat: {
    title: string;
    description: string;
    descriptionStrong: string;
    descriptionRest: string;
    items: RefListItem[];
    note: string;
  };
  modeles: {
    title: string;
    liste: ModeleDoc[];
  };
  communication: {
    title: string;
    items: CommItem[];
  };
};

const SCREEN: ReferentielScreen = {
  heroEyebrow: "Référentiel · méthode & ressources pour mes ingénieurs",
  heroSub:
    "Référentiel opérationnel du Cabinet Paris Étoile : zone IA pour interrogation contextuelle, manuel opératoire, contrat-cadre licenciés, bibliothèque de modèles documentaires, éléments de communication.",
  ia: {
    eyebrow: "Assistant IA · méthodologie",
    titre: "Interrogez le référentiel ASTRAEOS",
    description:
      "L'IA est entraînée sur l'ensemble du référentiel : process, contrat licenciés, bibliothèque, FAQ. Posez vos questions en langage naturel, obtenez la réponse contextualisée et le lien vers le document source.",
    placeholder: "Comment rédiger un pacte d'associés selon le process ASTRAEOS ?",
    cta: "Demander à l'IA",
    suggestions: ["Process onboarding client", "Modèle KYC", "Lettre de mission"],
  },
  manuel: {
    title: "Manuel opératoire",
    description:
      "Document maître décrivant l'ensemble des process opérationnels du Cabinet Paris Étoile · 168 pages · mis à jour le 24 avril 2026.",
    sections: [
      { label: "Section 1 · Onboarding client (étapes 01 → 03)", link: "Voir →", asset: "manuel" },
      { label: "Section 2 · Étude patrimoniale (étape 04)", link: "Voir →", asset: "manuel" },
      { label: "Section 3 · Restitution & signature (étape 05)", link: "Voir →", asset: "manuel" },
      { label: "Section 4 · Suivi récurrent (étape 06)", link: "Voir →", asset: "manuel" },
    ],
  },
  contrat: {
    title: "Contrat-cadre licenciés · licence de marque",
    description: "Au moment de la souscription, un seul modèle est utilisé : ",
    descriptionStrong: "licence de marque",
    descriptionRest: ". Inclut les documents pré-contractuels obligatoires.",
    items: [
      {
        label: "",
        strong: "Licence de marque",
        rest: " · contrat unique · 5 ingénieurs",
        link: "v3.1 →",
        asset: "contrat_cadre",
        highlight: true,
      },
      { label: "Document d'Information Précontractuelle (DIP)", link: "Voir →", asset: "contrat_cadre" },
      { label: "État général du marché", link: "Voir →", asset: "contrat_cadre" },
    ],
    note: "Note : à l'avenir, des modèles franchise / mandataire pourront s'ajouter selon l'évolution juridique du réseau.",
  },
  modeles: {
    title: "Bibliothèque de modèles documentaires",
    liste: [
      {
        title: "Document d'entrée en relation",
        desc: "Modèle conforme ORIAS · CIF · IAS, à signer par le client lors du 1er rendez-vous.",
        asset: "der",
      },
      {
        title: "KYC · Know Your Customer",
        desc: "Formulaire LCB-FT, identification complète + justificatifs.",
        asset: "kyc",
      },
      {
        title: "Questionnaire de qualification",
        desc: "Profil patrimonial · objectifs · horizon · tolérance risque.",
        asset: "questionnaire",
      },
      {
        title: "Lettre de mission",
        desc: "Cadre contractuel de l'étude · objet · honoraires · délais.",
        asset: "lettre_mission",
      },
      {
        title: "Étude patrimoniale anonymisée",
        desc: "Modèle d'étude type · structure · diagnostic · préconisations.",
        asset: "etude_patrimoniale",
      },
      {
        title: "Dossier client anonymisé",
        desc: "Dossier complet anonymisé pour formation et exemple type.",
        asset: "dossier_client",
      },
    ],
  },
  communication: {
    title: "Éléments de communication",
    items: [
      {
        variant: "navy",
        title: "ASTRAEOS",
        logo: true,
        subtitle: "Logo principal",
        asset: "logo_principal",
      },
      {
        variant: "white",
        title: "ASTRAEOS",
        logo: true,
        logoGold: true,
        subtitle: "Logo doré sur blanc",
        asset: "logo_or_blanc",
      },
      {
        variant: "navy-gradient",
        title: "FOND D'ÉCRAN",
        subtitle: "Présentation",
        asset: "fond_ecran",
      },
      {
        variant: "ivory",
        title: "CHARTE GRAPHIQUE",
        subtitle: "PDF · 24 pages",
        asset: "charte_graphique",
      },
    ],
  },
};

export function getReferentielScreen(): ReferentielScreen {
  return SCREEN;
}
