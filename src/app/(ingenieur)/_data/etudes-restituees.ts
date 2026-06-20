/**
 * Données d'exemple "Études restituées" (pipe 05), copiées telles quelles
 * depuis la maquette 030_Wireframes_Ingenieur_v28.html (id="page-ing-pipe-05").
 * Source unique : la page lit ici, aucune valeur en dur dans le composant.
 */

export type ClientType = "seule" | "couple" | "morale";
export type StudyTone = "patrimoine" | "immo-direct" | "fin-direct" | "assurance" | "societe";
export type SuiteTone = "signed" | "waiting" | "dormant";

export interface EtudeRestituee {
  /** Lignes de nom : 1 pour une personne seule / morale, 2 pour un couple. */
  clientLines: string[];
  /** Sous-titre représentant (personne morale) éventuel. */
  clientRepr?: string;
  clientType: ClientType;
  clientTypeLabel: string;
  cabinetName: string;
  cabinetCity: string;
  ingenieurInitials: string;
  ingenieurName: string;
  studyTone: StudyTone;
  studyLabel: string;
  /** Étoiles Trustpilot déjà formatées (ex. "★★★★★ 5,0"). */
  trustpilot: string;
  suiteTone: SuiteTone;
  suiteLabel: string;
  suiteDetail?: string;
  /** Date du prochain entretien / mise en place, vide si sans suite. */
  nextDate?: string;
  nextMeta?: string;
}

export interface EtudesRestitueesData {
  steps: { num: string; label: string; count: string; page: string; active?: boolean }[];
  kpis: { label: string; value: string; unit?: string; meta: string; tone?: "gold" }[];
  filters: { label: string; count: string; active?: boolean; alert?: boolean }[];
  rows: EtudeRestituee[];
  moreCount: number;
  totalCount: number;
}

const DATA: EtudesRestitueesData = {
  steps: [
    { num: "01", label: "Prospects actifs", count: "187", page: "prospects" },
    { num: "02", label: "Conformité en cours", count: "18", page: "conformite" },
    { num: "03", label: "Collecte docs", count: "24", page: "collectes" },
    { num: "04", label: "Études en cours", count: "41", page: "etudes" },
    { num: "05", label: "Études restituées", count: "28", page: "etudes-restituees", active: true },
    { num: "06", label: "Clients en suivi", count: "142", page: "clients-suivi" },
  ],
  kpis: [
    { label: "Études restituées", value: "14", meta: "depuis janvier 2026" },
    { label: "Avis Trustpilot reçus", value: "11", meta: "79 % de retour client" },
    { label: "Note moyenne", value: "4,8", unit: "/ 5", tone: "gold", meta: "excellente perception" },
    { label: "Délai moyen restitution", value: "42", unit: "jours", meta: "de la collecte à la restitution" },
  ],
  filters: [
    { label: "Toutes", count: "28", active: true },
    { label: "Convertis en suivi", count: "24" },
    { label: "En décision client", count: "3" },
    { label: "Sans suite", count: "1", alert: true },
  ],
  rows: [
    {
      clientLines: ["Marie DUBOIS"],
      clientType: "seule",
      clientTypeLabel: "Personne seule",
      cabinetName: "Julien VASSEUR",
      cabinetCity: "Senior · 8 ans",
      ingenieurInitials: "RB",
      ingenieurName: "Romain BERTHIER",
      studyTone: "patrimoine",
      studyLabel: "Étude patrimoniale",
      trustpilot: "★★★★★ 5,0",
      suiteTone: "signed",
      suiteLabel: "Investissements validés client",
      suiteDetail: "PEA + AV souscrits",
      nextDate: "22/05/2026",
      nextMeta: "Dans 13 jours",
    },
    {
      clientLines: ["Albert HUYGHE", "Cécile HUYGHE"],
      clientType: "couple",
      clientTypeLabel: "Couple",
      cabinetName: "Luc THILLIEZ",
      cabinetCity: "Dirigeant-praticien",
      ingenieurInitials: "EL",
      ingenieurName: "Émilie LAMBERT",
      studyTone: "patrimoine",
      studyLabel: "Étude patrimoniale",
      trustpilot: "★★★★★ 5,0",
      suiteTone: "signed",
      suiteLabel: "Validation client investissement immobilier",
      nextDate: "28/05/2026",
      nextMeta: "Dans 19 jours",
    },
    {
      clientLines: ["Patrick ARMAND"],
      clientType: "seule",
      clientTypeLabel: "Personne seule",
      cabinetName: "Sophie MERCIER",
      cabinetCity: "5 ans",
      ingenieurInitials: "CF",
      ingenieurName: "Caroline FAURE",
      studyTone: "immo-direct",
      studyLabel: "Invest. immobilier direct",
      trustpilot: "★★★★ 4,2",
      suiteTone: "waiting",
      suiteLabel: "Client en cours de réflexion sur investissement immobilier",
      nextDate: "15/05/2026",
      nextMeta: "Dans 6 jours",
    },
    {
      clientLines: ["Jean-Marc TROCHU", "Pascale TROCHU"],
      clientType: "couple",
      clientTypeLabel: "Couple",
      cabinetName: "Julien VASSEUR",
      cabinetCity: "Senior · 8 ans",
      ingenieurInitials: "AR",
      ingenieurName: "Antoine ROSSI",
      studyTone: "assurance",
      studyLabel: "Étude patrimoniale",
      trustpilot: "★★★★★ 5,0",
      suiteTone: "signed",
      suiteLabel: "Validation client investissement financier",
      suiteDetail: "PER + Mutuelle",
      nextDate: "26/05/2026",
      nextMeta: "Dans 17 jours",
    },
    {
      clientLines: ["SAS GROUPE LEBON"],
      clientRepr: "Repr. : Henri LEBON",
      clientType: "morale",
      clientTypeLabel: "Personne morale",
      cabinetName: "Luc THILLIEZ",
      cabinetCity: "Paris 8e (PRIVEOS)",
      ingenieurInitials: "LT",
      ingenieurName: "Luc THILLIEZ",
      studyTone: "societe",
      studyLabel: "Immatriculation société",
      trustpilot: "★★★★★ 5,0",
      suiteTone: "signed",
      suiteLabel: "Validation client immatriculation société",
      nextDate: "14/05/2026",
      nextMeta: "Dans 5 jours",
    },
    {
      clientLines: ["Régis FOUCAULT"],
      clientType: "seule",
      clientTypeLabel: "Personne seule",
      cabinetName: "Luc THILLIEZ",
      cabinetCity: "Dirigeant-praticien",
      ingenieurInitials: "MK",
      ingenieurName: "Mathieu KELLER",
      studyTone: "patrimoine",
      studyLabel: "Étude patrimoniale",
      trustpilot: "★★★ 3,8",
      suiteTone: "dormant",
      suiteLabel: "Refus des propositions",
      suiteDetail: "Pas de suite donnée",
    },
  ],
  moreCount: 22,
  totalCount: 28,
};

export async function fetchEtudesRestituees(): Promise<EtudesRestitueesData> {
  return DATA;
}
