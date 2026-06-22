/**
 * Données de l'écran « Profil & agréments » (page-ing-profil), portées à
 * l'identique de la maquette v28. Source unique : la page lit ici, aucune
 * valeur en dur dans le composant.
 */

export type AgrementStatut = "Valide" | "À renseigner";

export interface Agrement {
  titre: string;
  detail: string;
  statut: AgrementStatut;
}

export interface Diplome {
  titre: string;
  detail: string;
}

export interface Notification {
  titre: string;
  detail: string;
  active: boolean;
}

export interface ProfilScreen {
  heroEyebrow: string;
  heroSub: string;

  identite: {
    initiales: string;
    nomComplet: string;
    role: string;
    membreDepuis: string;
    statutBadge: string;
    derniereConnexion: string;
  };

  identitePersonnelle: { label: string; value: string }[];

  agrements: Agrement[];

  formation: Diplome[];
  specialites: string[];

  notifications: Notification[];

  signature: {
    initiales: string;
    nom: string;
    titre: string;
    contact: string;
    lienRdv: string;
    pied: string;
  };
}

const screen: ProfilScreen = {
  heroEyebrow: "Mon profil · Cabinet Paris Étoile · ingénieur patrimonial",
  heroSub:
    "Votre identité personnelle, vos agréments réglementaires (CIF, IAS, ORIAS, CJA), vos préférences de notifications et la signature email. Les éléments réglementaires sont synchronisés avec votre profil ASTRAEOS · modifications via la tête de réseau.",

  identite: {
    initiales: "LT",
    nomComplet: "Luc THILLIEZ",
    role: "Ingénieur patrimonial · dirigeant-praticien du Cabinet Paris Étoile",
    membreDepuis: "Membre ASTRAEOS depuis le 14 mars 2018 · ID #ASTRAEOS-ING-0001",
    statutBadge: "Compte actif & conforme",
    derniereConnexion: "Dernière connexion · 12/05/2026 · 09h12",
  },

  identitePersonnelle: [
    { label: "Civilité", value: "Monsieur" },
    { label: "Nom", value: "THILLIEZ" },
    { label: "Prénom", value: "Luc" },
    { label: "Date de naissance", value: "08/05/1980 · 46 ans" },
    { label: "Nationalité", value: "Française" },
    { label: "Email professionnel", value: "luc.thilliez@email-test.fr" },
    { label: "Téléphone", value: "+33 6 12 34 56 78" },
    { label: "Adresse cabinet", value: "62 av. des Champs-Élysées\n75008 Paris" },
  ],

  agrements: [
    {
      titre: "CIF · Conseiller en investissements financiers",
      detail: "N° E007654 · délivré par l'AMF · valide jusqu'au 31/12/2027",
      statut: "Valide",
    },
    {
      titre: "IAS · Intermédiaire en assurance niv. 1",
      detail: "N° ORIAS 18 002 345 · valide jusqu'au 31/03/2027",
      statut: "Valide",
    },
    {
      titre: "CJA · Compétence juridique appropriée",
      detail: "Master 2 Gestion de patrimoine · Université Paris-Dauphine 2003",
      statut: "Valide",
    },
    {
      titre: "RC Pro · Responsabilité civile professionnelle",
      detail: "MMA Assurance · 2 000 000 € · valide jusqu'au 31/12/2026",
      statut: "Valide",
    },
  ],

  formation: [
    {
      titre: "Master 2 Gestion de patrimoine",
      detail: "Université Paris-Dauphine · 2003",
    },
    {
      titre: "DESS Finance & fiscalité",
      detail: "Université Paris 1 Panthéon-Sorbonne · 2002",
    },
  ],
  specialites: [
    "Transmission patrimoniale",
    "Optimisation fiscale",
    "Dirigeants TPE/PME",
    "Stratégie successorale",
  ],

  notifications: [
    {
      titre: "Nouveaux prospects",
      detail: "Email + notification ASTRAEOS",
      active: true,
    },
    {
      titre: "Échéances études en retard",
      detail: "Email J-3 et J+0 · push instant",
      active: true,
    },
    {
      titre: "Rendez-vous à venir",
      detail: "Rappel email 24h avant + push 1h avant",
      active: true,
    },
    {
      titre: "Documents reçus client",
      detail: "Notification ASTRAEOS uniquement",
      active: true,
    },
    {
      titre: "Newsletter ASTRAEOS",
      detail: "Hebdomadaire · veille marché",
      active: false,
    },
  ],

  signature: {
    initiales: "LT",
    nom: "Luc THILLIEZ",
    titre: "Président associé du cabinet ASTRAEOS",
    contact: "📧 luc.thilliez@email-test.fr · 📞 +33 6 12 34 56 78",
    lienRdv: "priveos.com/rdv/luc-thilliez · prendre rendez-vous",
    pied:
      "Cabinet Paris Étoile · 62 av. des Champs-Élysées · 75008 Paris\nCIF E007654 (AMF) · IAS 18 002 345 (ORIAS) · membre ASTRAEOS",
  },
};

export function getProfilScreen(): ProfilScreen {
  return screen;
}
