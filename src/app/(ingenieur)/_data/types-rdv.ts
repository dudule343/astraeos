/**
 * Données de l'écran « Mes types de rendez-vous » (#page-ing-types-rdv).
 * Valeurs reprises telles quelles de la maquette 030 v28 (4 types de RDV,
 * KPIs de configuration, bandeau lien public). Source de vérité unique de
 * l'écran de configuration des types de RDV.
 */

export type RdvVisibility = "public" | "private";

export interface RdvTypeKpi {
  label: string;
  value: string;
  valueSmall?: boolean;
  unit?: string;
  meta: string;
}

export interface RdvTypeDoc {
  label: string;
  /** Picto : document par défaut, "chart" pour le questionnaire de qualif. */
  icon: "doc" | "chart";
}

export interface RdvTypeDayCell {
  letter: string;
  active: boolean;
}

export interface RdvType {
  id: string;
  visibility: RdvVisibility;
  durationLabel: string;
  name: string;
  desc: string;
  /** Documents auto-envoyés à la réservation. */
  docs: RdvTypeDoc[];
  /** Disponibilités spécifiques (texte fort + complément). */
  dispoMain: string;
  dispoSub: string;
  dispoSubItalic?: boolean;
  /** Grille 7 jours (présente sur Type 1 et Type 4). */
  dayCells?: RdvTypeDayCell[];
  /** Message d'accompagnement (segments avec variables surlignées). */
  message: MessageSegment[];
  signatureName: string;
  signatureRole: string;
  /** Liste des variables disponibles, affichée sous le Type 1 seulement. */
  showVariables?: boolean;
  delaiMini: string;
  tampon: string;
}

/** Segment de message : texte simple ou variable surlignée ({prenom}, …). */
export type MessageSegment =
  | { kind: "text"; value: string }
  | { kind: "var"; value: string };

export interface TypesRdvScreen {
  heroEyebrow: string;
  heroSub: string;
  kpis: RdvTypeKpi[];
  publicLinkSlug: string;
  publicLinkBase: string;
  dispoGlobalStrong: string;
  dispoGlobalRest: string;
  dispoGlobalNote: string;
  syncAccount: string;
  syncMeta: string;
  variablesList: string[];
  types: RdvType[];
}

const DAY_CELLS_LUN_VEN: RdvTypeDayCell[] = [
  { letter: "L", active: true },
  { letter: "M", active: true },
  { letter: "M", active: true },
  { letter: "J", active: true },
  { letter: "V", active: true },
  { letter: "S", active: false },
  { letter: "D", active: false },
];

const SIGNATURE_NAME = "Luc THILLIEZ";
const SIGNATURE_ROLE = "Président associé du cabinet PRIVEOS";

function t(value: string): MessageSegment {
  return { kind: "text", value };
}
function v(value: string): MessageSegment {
  return { kind: "var", value };
}

const SCREEN: TypesRdvScreen = {
  heroEyebrow: "Agenda · Configuration personnelle · Sprint S1A",
  heroSub:
    "Définissez les RDV que vous proposez sur votre lien public PRIVEOS (style Calendly) ou en interne. Chaque type pilote la durée, les documents auto-envoyés, le message, la visibilité et les disponibilités.",
  kpis: [
    {
      label: "Types de RDV configurés",
      value: "4",
      meta: "2 publics · 2 privés",
    },
    {
      label: "RDV pris ce mois",
      value: "22",
      meta: "via lien public : 14 · manuel : 8",
    },
    {
      label: "Type le plus pris",
      value: "Entretien initial",
      valueSmall: true,
      meta: "11 sur 22 RDV du mois",
    },
    {
      label: "Délai mini réservation",
      value: "24",
      unit: "h",
      meta: "Paramètre global · modifiable",
    },
  ],
  publicLinkBase: "priveos.com/rdv/",
  publicLinkSlug: "luc-thilliez",
  dispoGlobalStrong: "Lun – Ven",
  dispoGlobalRest: " · 9h – 19h",
  dispoGlobalNote: "Déjeuner bloqué : 12h – 13h30",
  syncAccount: "Google Calendar · luc.thilliez@…",
  syncMeta: "Sync bidirectionnelle · dernière synchro à 11:42",
  variablesList: [
    "{prenom}",
    "{nom}",
    "{date}",
    "{heure}",
    "{lieu}",
    "{ingenieur}",
    "{cabinet}",
  ],
  types: [
    {
      id: "entretien-initial",
      visibility: "public",
      durationLabel: "1h",
      name: "Entretien initial",
      desc: "Découverte des besoins · 1ᵉʳ contact client · accessible publiquement sur votre lien Calendly",
      docs: [
        { label: "DCI Simplifié", icon: "doc" },
        { label: "Questionnaire de qualification client", icon: "chart" },
      ],
      dispoMain: "Lun – Ven · 9h00 → 19h00",
      dispoSub: "Pause déjeuner : 12h00 → 13h30 (bloquée)",
      dayCells: DAY_CELLS_LUN_VEN,
      message: [
        t("Bonjour "),
        v("{prenom}"),
        t(", je vous confirme notre entretien initial du "),
        v("{date}"),
        t(" à "),
        v("{heure}"),
        t(" (durée 1h, "),
        v("{lieu}"),
        t("). Pour préparer notre échange, merci de compléter le DCI Simplifié et le questionnaire de qualification joints (10 minutes au total). Au plaisir."),
      ],
      signatureName: SIGNATURE_NAME,
      signatureRole: SIGNATURE_ROLE,
      showVariables: true,
      delaiMini: "24 heures",
      tampon: "15 minutes",
    },
    {
      id: "entretien-intermediaire",
      visibility: "private",
      durationLabel: "1h",
      name: "Entretien intermédiaire à l'étude",
      desc: "Précision pendant la production · validation d'hypothèses · calage manuel par l'ingénieur uniquement",
      docs: [{ label: "Synthèse intermédiaire de l'étude", icon: "doc" }],
      dispoMain: "Lun – Ven · 9h00 → 19h00",
      dispoSub:
        "Calage manuel à l'initiative de l'ingénieur (non visible sur lien public)",
      dispoSubItalic: true,
      message: [
        t("Bonjour "),
        v("{prenom}"),
        t(", j'ai bien avancé sur votre étude patrimoniale et je souhaite vous présenter quelques points intermédiaires. Je vous propose le "),
        v("{date}"),
        t(" à "),
        v("{heure}"),
        t(" en "),
        v("{lieu}"),
        t(" (durée 1h). Une synthèse intermédiaire est jointe."),
      ],
      signatureName: SIGNATURE_NAME,
      signatureRole: SIGNATURE_ROLE,
      delaiMini: "48 heures",
      tampon: "15 minutes",
    },
    {
      id: "restitution-etude",
      visibility: "private",
      durationLabel: "2h",
      name: "Restitution de l'étude patrimoniale",
      desc: "Présentation des préconisations · présentiel cabinet recommandé · 2h pour échanger sereinement",
      docs: [
        { label: "Étude patrimoniale finalisée (PDF)", icon: "doc" },
        { label: "Note de synthèse exécutive", icon: "doc" },
      ],
      dispoMain: "Lun – Ven · 14h00 → 18h00",
      dispoSub: "Créneaux de 2h consécutives uniquement · présentiel cabinet",
      dispoSubItalic: true,
      message: [
        t("Bonjour "),
        v("{prenom}"),
        t(", j'ai le plaisir de vous transmettre votre étude patrimoniale finalisée. Je vous propose de la parcourir ensemble le "),
        v("{date}"),
        t(" à "),
        v("{heure}"),
        t(" au cabinet (durée 2h). Merci de prendre connaissance de la note de synthèse exécutive en pièce jointe."),
      ],
      signatureName: SIGNATURE_NAME,
      signatureRole: SIGNATURE_ROLE,
      delaiMini: "72 heures",
      tampon: "30 minutes",
    },
    {
      id: "entretien-suivi",
      visibility: "public",
      durationLabel: "1h",
      name: "Entretien de suivi",
      desc: "Suivi récurrent · client en portefeuille · accessible sur lien public pour les clients existants",
      docs: [{ label: "Reporting patrimonial à date", icon: "doc" }],
      dispoMain: "Lun – Ven · 9h00 → 19h00",
      dispoSub: "",
      dayCells: DAY_CELLS_LUN_VEN,
      message: [
        t("Bonjour "),
        v("{prenom}"),
        t(", je vous confirme notre entretien de suivi du "),
        v("{date}"),
        t(" à "),
        v("{heure}"),
        t(" (durée 1h, "),
        v("{lieu}"),
        t("). Je vous transmets en pièce jointe votre reporting patrimonial à date afin que nous puissions échanger sur les ajustements éventuels."),
      ],
      signatureName: SIGNATURE_NAME,
      signatureRole: SIGNATURE_ROLE,
      delaiMini: "24 heures",
      tampon: "15 minutes",
    },
  ],
};

export function getTypesRdvScreen(): TypesRdvScreen {
  return SCREEN;
}
