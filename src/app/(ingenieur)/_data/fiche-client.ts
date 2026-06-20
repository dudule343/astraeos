/**
 * Données d'exemple de la fiche client ingénieur — RÉPLIQUE EXACTE de la
 * maquette 030 v28 (`#page-ing-fiche-client`, lignes 4618→4774).
 *
 * Fiche client modèle : Bertrand & Monique DUPONT-TOPIN. Dans la maquette,
 * tous les clients de l'agenda ouvrent cette fiche exemple ; en production
 * chaque client a sa propre fiche. Source unique de la page fiche client :
 * la page lit ici, jamais de valeur en dur dans le composant.
 */

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
  /** RDV / dossier vers lequel pointe « Voir → » ; null = bouton honnête */
  href: string | null;
};

export type DocumentSigne = {
  title: string;
  meta: string;
  /** dernier doc = bouton doré « Ouvrir », les autres « Consulter / Télécharger » */
  primary?: boolean;
};

export type RdvHisto = {
  when: string;
  title: string;
  meta: string;
  /** premier RDV = à venir, surligné doré à gauche */
  upcoming?: boolean;
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
};

/** Fiche client modèle de la maquette. */
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
      href: "/espace-ingenieur/dossiers/etu-2026-014",
    },
    {
      variant: "immo",
      title: "Investissement immobilier réalisé",
      meta: "SCPI Corum Origin · 80 000 € · souscription accompagnée le 02/05/2026",
      href: null,
    },
    {
      variant: "financier",
      title: "Investissement financier réalisé",
      meta: "Contrat d'assurance-vie Linxea Spirit 2 · versement initial 150 000 € le 30/04/2026",
      href: null,
    },
    {
      variant: "audit",
      title: "Audit patrimonial initial réalisé",
      meta: "Premier accompagnement · livré le 22/05/2025 · honoraires 8 600 € HT",
      href: null,
    },
  ],
  documents: [
    {
      title: "Lettre de mission · ETU-2026-014",
      meta: "Signée le 28/04/2026 · Yousign",
    },
    {
      title: "Document collecte complet · validé",
      meta: "Complété et signé le 28/04/2026",
    },
    {
      title: "Document entrée en relation",
      meta: "Signé le 28/04/2026 · Yousign",
    },
    {
      title: "Étude patrimoniale livrée · v1.0",
      meta: "Livrée le 06/05/2026 · 84 pages",
      primary: true,
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
    },
    {
      when: "15/04/2026 · 14h30",
      title: "Entretien découverte complet",
      meta: "📹 Zoom · 120 min · transcript IA · complétion auto-doc",
    },
    {
      when: "22/05/2025 · 16h00",
      title: "Restitution étude 2025",
      meta: "🏢 Présentiel · cabinet · 90 min",
    },
  ],
};

/**
 * Renvoie la fiche client pour un id donné. Dans la maquette toutes les
 * fiches ouvrent le modèle DUPONT-TOPIN ; on conserve ce comportement tant
 * que les vraies fiches Supabase ne sont pas rebranchées.
 */
export function getFicheClient(_id: string): FicheClient {
  return FICHE_CLIENT_MODELE;
}

/** Salle Jitsi auto-hébergée pour le RDV à venir de cette fiche. */
export function visioRoomFor(fiche: FicheClient): string {
  return `client-${fiche.id}`;
}
