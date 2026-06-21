/**
 * Module PUR de la fiche client ingénieur (#page-ing-fiche-client).
 *
 * AUCUN import serveur (next/headers, getSessionContext, createAdminClient,
 * supabase/server) : importé par le composant client `FicheClientInteractive`.
 * Contient les types d'affichage, les types/libellés des champs éditables
 * (enums DB), les helpers purs et la fiche de repli (modèle DUPONT-TOPIN).
 *
 * Les vraies données sont lues par `fiche-client-server.ts` et passées par
 * props à la page serveur, qui dégrade sur le repli ci-dessous.
 */

import { type Client } from "./clients";

export type Personne = {
  name: string;
  kycBadge: string;
  rows: { label: string; value: string }[];
};

export type RegimeField = {
  label: string;
  value: string;
  /** true → la valeur est mise en avant en doré (patrimoine commun) */
  gold?: boolean;
};

export type HistoItem = {
  /** variante d'icône / couleur du picto, portée de la maquette */
  variant: "etude" | "immo" | "financier" | "audit";
  title: string;
  meta: string;
  href: string | null;
};

export type DocumentAction =
  | { kind: "pdf"; pdf: "der" | "lettre_mission" }
  | { kind: "link"; href: string };

export type DocumentSigne = {
  title: string;
  meta: string;
  /** dernier doc = bouton doré « Ouvrir », les autres « Consulter / Télécharger » */
  primary?: boolean;
  /** action réelle des boutons de la ligne (jamais un bouton mort) */
  action: DocumentAction;
};

export type RdvHisto = {
  when: string;
  title: string;
  meta: string;
  /** premier RDV = à venir, surligné doré à gauche */
  upcoming?: boolean;
  /** lien de téléchargement de l'enregistrement vidéo (si l'entretien a été enregistré) */
  recordingHref?: string;
};

export type FicheClient = {
  id: string;
  eyebrow: string;
  /** prénom(s) avant le nom mis en gras dans le hero */
  heroNameLead: string;
  heroNameStrong: string;
  heroSub: string;
  personnes: Personne[];
  regimeFields: RegimeField[];
  historique: HistoItem[];
  documents: DocumentSigne[];
  rdvs: RdvHisto[];
  /**
   * Données éditables (identité du foyer + personnes), au format DB exact,
   * alimentées depuis Supabase. `null` quand la fiche provient du repli modèle
   * (non éditable). Le composant interactif n'affiche le mode édition que si
   * `editable` est présent.
   */
  editable: FicheClientEditable | null;
};

// ---------------------------------------------------------------------------
// Données éditables — valeurs DB exactes (foyer + personnes)
// ---------------------------------------------------------------------------

export type FoyerEditable = {
  household_type: string;
  marital_regime: string | null;
  marriage_date: string | null; // ISO yyyy-mm-dd
  household_address: string | null;
  nb_children: number;
  nb_dependents: number;
  tax_residency: string | null;
  acquisition_origin: string | null;
};

export type PersonneEditable = {
  role_in_household: "person_a" | "person_b";
  first_name: string;
  last_name: string;
  birth_name: string | null;
  birth_date: string | null; // ISO yyyy-mm-dd
  nationality: string | null;
  profession: string | null;
  employer: string | null;
  employment_status: string | null;
  tmi_estimated: number | null;
  phone: string | null;
  email: string | null;
};

export type FicheClientEditable = {
  clientId: string;
  foyer: FoyerEditable;
  personnes: PersonneEditable[];
};

// ---------------------------------------------------------------------------
// Libellés FR des enums DB (valeurs DB exactes en clé)
// ---------------------------------------------------------------------------

export const HOUSEHOLD_TYPE_LABELS: Record<string, string> = {
  couple_marie: "Couple marié",
  couple_pacs: "Couple pacsé",
  celibataire: "Célibataire",
  divorce: "Divorcé(e)",
  veuf: "Veuf(ve)",
};

export const MARITAL_REGIME_LABELS: Record<string, string> = {
  communaute_reduite_acquets: "Communauté réduite aux acquêts",
  communaute_universelle: "Communauté universelle",
  separation_biens: "Séparation de biens",
  participation_aux_acquets: "Participation aux acquêts",
};

export const ACQUISITION_ORIGIN_LABELS: Record<string, string> = {
  recommandation: "Recommandation",
  captation_directe: "Captation directe",
  reattribution: "Réattribution",
  marketing: "Marketing",
  autre: "Autre",
};

export const EMPLOYMENT_STATUS_LABELS: Record<string, string> = {
  cdi: "CDI",
  cdd: "CDD",
  cadre_dirigeant: "Cadre dirigeant",
  tns_liberal: "TNS · profession libérale",
  tns_artisan: "TNS · artisan / commerçant",
  fonctionnaire: "Fonctionnaire",
  retraite: "Retraité",
  chomeur: "Sans emploi",
  etudiant: "Étudiant",
  autre: "Autre",
};

/** Options ordonnées prêtes pour un <select> (valeur DB + libellé FR). */
export type EnumOption = { value: string; label: string };

export const HOUSEHOLD_TYPE_OPTIONS: EnumOption[] = [
  "couple_marie",
  "couple_pacs",
  "celibataire",
  "divorce",
  "veuf",
].map((value) => ({ value, label: HOUSEHOLD_TYPE_LABELS[value] }));

export const MARITAL_REGIME_OPTIONS: EnumOption[] = [
  "communaute_reduite_acquets",
  "communaute_universelle",
  "separation_biens",
  "participation_aux_acquets",
].map((value) => ({ value, label: MARITAL_REGIME_LABELS[value] }));

export const ACQUISITION_ORIGIN_OPTIONS: EnumOption[] = [
  "recommandation",
  "captation_directe",
  "reattribution",
  "marketing",
  "autre",
].map((value) => ({ value, label: ACQUISITION_ORIGIN_LABELS[value] }));

export const EMPLOYMENT_STATUS_OPTIONS: EnumOption[] = [
  "cdi",
  "cdd",
  "cadre_dirigeant",
  "tns_liberal",
  "tns_artisan",
  "fonctionnaire",
  "retraite",
  "chomeur",
  "etudiant",
  "autre",
].map((value) => ({ value, label: EMPLOYMENT_STATUS_LABELS[value] }));

// ---------------------------------------------------------------------------
// Helpers purs
// ---------------------------------------------------------------------------

/** Âge en années à partir d'une date de naissance ISO. */
export function ageFromBirthDate(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

/** Date ISO → « jj/mm/aaaa », « — » si absente / invalide. */
export function formatFicheDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Fiche client modèle (repli, maquette 030 v28)
// ---------------------------------------------------------------------------

/** Fiche client modèle de la maquette. Non éditable (editable === null). */
export const FICHE_CLIENT_MODELE: FicheClient = {
  id: "dupont-topin",
  eyebrow: "Fiche client · régime de l'union · client depuis le 15/03/2025",
  heroNameLead: "Bertrand & Monique ",
  heroNameStrong: "DUPONT-TOPIN",
  heroSub:
    "Régime de l'union : 2 personnes physiques liées par mariage (régime de la communauté réduite aux acquêts) · 62 ans et 58 ans · domicile principal Paris 7e · 3 enfants majeurs.",
  personnes: [
    {
      name: "Bertrand DUPONT",
      kycBadge: "KYC OK · 18/03/2025",
      rows: [
        { label: "Date de naissance", value: "14/06/1963 · 62 ans" },
        { label: "Profession", value: "Directeur commercial · TotalEnergies" },
        { label: "Statut professionnel", value: "Salarié cadre supérieur" },
        { label: "Revenus annuels", value: "185 000 € (brut)" },
        { label: "E-mail", value: "bertrand.dupont@email-test.fr" },
        { label: "Téléphone", value: "+33 6 12 34 56 78" },
      ],
    },
    {
      name: "Monique TOPIN",
      kycBadge: "KYC OK · 18/03/2025",
      rows: [
        { label: "Date de naissance", value: "03/09/1967 · 58 ans" },
        { label: "Profession", value: "Médecin généraliste · libérale" },
        { label: "Statut professionnel", value: "Profession libérale (BNC)" },
        { label: "Revenus annuels", value: "148 000 € (BNC net)" },
        { label: "E-mail", value: "monique.topin@email-test.fr" },
        { label: "Téléphone", value: "+33 6 87 65 43 21" },
      ],
    },
  ],
  regimeFields: [
    { label: "Régime matrimonial", value: "Communauté réduite aux acquêts" },
    { label: "Date du mariage", value: "22/06/1991 · Paris 7e" },
    { label: "Contrat de mariage", value: "Non · régime légal" },
    { label: "Enfants communs", value: "3 majeurs · 32, 30, 27 ans" },
    { label: "Donations entre époux", value: "Aucune enregistrée" },
    { label: "Testaments", value: "Bertrand : oui · Monique : non" },
    { label: "Adresse fiscale", value: "23 av. Bosquet · Paris 7e" },
    { label: "Patrimoine commun", value: "2 380 000 €", gold: true },
  ],
  historique: [
    {
      variant: "etude",
      title: "Étude patrimoniale réalisée",
      meta: "Stratégie de transmission · livrée le 06/05/2026 · 84 pages · honoraires 12 800 € HT",
      href: "/espace-ingenieur/dossiers/ETU-2026-014",
    },
    {
      variant: "immo",
      title: "Investissement immobilier réalisé",
      meta: "SCPI Corum Origin · 80 000 € · souscription accompagnée le 02/05/2026",
      href: "/espace-ingenieur/dossiers/ETU-2026-014",
    },
    {
      variant: "financier",
      title: "Investissement financier réalisé",
      meta: "Contrat d'assurance-vie Linxea Spirit 2 · versement initial 150 000 € le 30/04/2026",
      href: "/espace-ingenieur/dossiers/ETU-2026-014",
    },
    {
      variant: "audit",
      title: "Audit patrimonial initial réalisé",
      meta: "Premier accompagnement · livré le 22/05/2025 · honoraires 8 600 € HT",
      href: "/espace-ingenieur/dossiers/ETU-2026-014",
    },
  ],
  documents: [
    {
      title: "Lettre de mission · ETU-2026-014",
      meta: "Signée le 28/04/2026 · Yousign",
      action: { kind: "pdf", pdf: "lettre_mission" },
    },
    {
      title: "Document collecte complet · validé",
      meta: "Complété et signé le 28/04/2026",
      action: { kind: "link", href: "/espace-ingenieur/collectes" },
    },
    {
      title: "Document entrée en relation",
      meta: "Signé le 28/04/2026 · Yousign",
      action: { kind: "pdf", pdf: "der" },
    },
    {
      title: "Étude patrimoniale livrée · v1.0",
      meta: "Livrée le 06/05/2026 · 84 pages",
      primary: true,
      action: { kind: "link", href: "/espace-ingenieur/dossiers/ETU-2026-014" },
    },
  ],
  rdvs: [
    {
      when: "Demain · 14h00",
      title: "Restitution étude patrimoniale",
      meta: "📹 Zoom · 90 min · enregistrement actif",
      upcoming: true,
    },
    {
      when: "25/04/2026 · 10h00",
      title: "Validation collecte documents",
      meta: "📹 Zoom · 45 min · transcript disponible",
      recordingHref: "/api/recordings/download?room=rdv-dupont-topin-collecte",
    },
    {
      when: "15/04/2026 · 14h30",
      title: "Entretien découverte complet",
      meta: "📹 Zoom · 120 min · transcript IA · complétion auto-doc",
      recordingHref: "/api/recordings/download?room=rdv-dupont-topin-decouverte",
    },
    {
      when: "22/05/2025 · 16h00",
      title: "Restitution étude 2025",
      meta: "🏢 Présentiel · cabinet · 90 min",
    },
  ],
  editable: null,
};

/**
 * Reconstruit l'IDENTITÉ (hero) d'un client de repli à partir de la liste
 * maquette, pour que cliquer « Voir » ouvre la bonne en-tête. Les sections
 * détaillées restent les données d'exemple (fiche non éditable).
 */
export function ficheModeleFromClient(client: Client): FicheClient {
  return {
    ...FICHE_CLIENT_MODELE,
    id: client.slug,
    eyebrow: `Fiche client · ${client.type} · client depuis le ${client.date1ereEtude}`,
    heroNameLead: "",
    heroNameStrong: client.nom,
    heroSub: `${client.details} · dernière interaction : ${client.derniereInteraction}. Sections détaillées ci-dessous : données d'exemple (fiche modèle).`,
    editable: null,
  };
}
