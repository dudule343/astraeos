/**
 * Sous-section « Synthèse des risques » du document d'audit (maquette, partie
 * Audit, lignes 3602-3897).
 *
 * Tableau de bord interactif (compteur, pastilles de priorité, cartes de
 * thématiques) puis fiches de risque regroupées par thématique. Portage fidèle
 * de la maquette : mêmes modules à ascenseur (.immo-mod / .page.modfold), mêmes
 * fiches (.ablock.fold avec .ab-h / .ab-grid / .dim / .rio / .fond / .ab-foot),
 * mêmes classes et mêmes SVG, pour que le JS global (accordéons, filtres du
 * board, panneaux de confiance) s'y raccroche ensuite. Chaque fiche est
 * enveloppée d'un <Bloc> dont la clé reprend EXACTEMENT la valeur data-block de
 * la maquette : sélectionnable, éditable et validable par le volet de révision.
 *
 * État vide HONNÊTE : les MONTANTS du patrimoine (valorisations, soldes,
 * revenus, charges, rendements, ratios financiers du foyer) N'EXISTENT PAS en
 * base. Les chiffres-exemple de la maquette ne sont jamais recopiés comme s'ils
 * étaient réels : ils deviennent « — » (éditables via le volet). Sont conservés
 * les références légales, les seuils/barèmes/amendes statutaires, les ordres de
 * grandeur de marché et les niveaux de confiance des panneaux CERTIF, qui
 * décrivent la méthode d'analyse et non la situation chiffrée du foyer. Les noms
 * et dates nominatifs de l'exemple sont branchés sur le foyer réel quand il
 * existe, sinon laissés en placeholder honnête.
 *
 * Les compteurs (total, par priorité, par thématique) sont DÉRIVÉS du nombre
 * réel de fiches rendues, jamais figés. La rémunération « PRIVEOS » de la
 * maquette est rebrandée « ASTRAEOS ».
 *
 * Server Component : il ne compose que des éléments statiques et des <Bloc>
 * (composant client) rendus dans l'arbre du BlocProvider.
 */

import { Fragment, type ReactNode } from "react";

import { Bloc } from "../Bloc";
import ValeurEditable from "../ValeurEditable";
import type { ValeurFormat } from "../format-valeur";
import { formatFicheDate } from "../../../../_data/fiche-client";
import type { EtudeDonnees, EtudePersonne } from "../../../../_data/etudes-patrimoniales";

import "../../../../_styles/sections/risques.css";

// Cible du panneau de confiance (« CERTIF ») de chaque fiche, transcrite des
// appels openCertif(...) / f_openCertif(...) de la maquette. Portée par
// data-certif sur le badge .cert, comme dans les sections sœurs (assurances,
// sociétés, retraite) : la logique d'ouverture du tiroir s'y raccroche.
const CERTIF_BY_KEY: Record<string, string> = {
  "Potentiel de refinancement": "refi",
  "Contribution sur les revenus locatifs": "crl",
  "Diagnostic de performance énergétique": "dpe",
  "Niveau des charges locatives": "crl",
  "Régime de la location meublée non professionnelle": "lmnpreg",
  "Assurance emprunteur — remboursement et fiscalité": "assur",
  "Multiplicité des banques — déchéance du terme": "dech",
  "Excédent de liquidités": "liq",
  "Faible performance des contrats": "perf",
  "Charge d’emprunt — veille des taux": "veille",
  "Assurance emprunteur — quotités et délégation": "assemp",
  "Caution solidaire — exposition personnelle": "caut",
  "Assurance-vie au cœur du patrimoine": "patrav",
  "Patrimoine professionnel à sécuriser": "patrpro",
  "Transmission du patrimoine": "patrtr",
  "Capacité d’épargne à mobiliser": "budgep",
  "Dépendance aux revenus libéraux": "budgconc",
  "Marge d’endettement disponible": "budglev",
  "Taux de remplacement et baisse des ressources": "retrisq",
  "Impôt sur la fortune immobilière (IFI)": "fiscifi",
  "Bien détenu à l’étranger – mise en conformité": "fiscetr",
  "Gouvernance et transmission": "socgouv",
  "Modalités de cession des parts sociales": "soccess",
  "Protection sociale — SCI": "scisoc",
  "Protection sociale et retraite — Monsieur": "eimsoc",
  "Pilotage de la rémunération — Monsieur": "eimrem",
  "Trésorerie excédentaire — Monsieur": "eimtres",
  "Structuration fiscale (EI au régime BNC) — Monsieur": "eimfisc",
  "Protection sociale et retraite — Madame": "eifsoc",
  "Pilotage de la rémunération — Madame": "eifrem",
  "Trésorerie excédentaire — Madame": "eiftres",
  "Structuration fiscale (EI au régime BNC) — Madame": "eiffisc",
  "Saturation fiscale des activités libérales": "globfisc",
  "Fragilité juridique et successorale de la SCI": "globjur",
  "Trésoreries professionnelles dormantes": "globtres",
  "Prévoyance décès et contrat Madelin": "assPrev",
  "Tarification évolutive de la prévoyance": "assPrev",
  "Clause bénéficiaire des assurances-vie": "assClau",
  "Absence d’assurance des parkings": "assImmo",
  "Mauvaise désignation de l’assuré": "assImmo",
  "Sous-évaluation du matériel professionnel": "assProMat",
  "Absence de garantie des pertes d’exploitation": "assProPE",
  "Absence de couverture des risques numériques": "assProCyber",
  "Protection des personnes": "globAssP",
  "Assurance des biens": "globAssB",
  "Actifs professionnels": "globAssPro",
  "Autonomie patrimoniale": "matRegAuto",
  "Présomption d’indivision": "matRegIndiv",
  "Protection du patrimoine personnel": "matDetProt",
  "Engagements solidaires": "matDetSolid",
  "Clause de contribution au jour le jour": "matContrib",
  "Absence d’inventaire initial": "matInventaire",
  "Attribution préférentielle": "succAttrib",
  "Droits de succession": "succDroits",
};

type Prio = "haute" | "moy" | "faible";

const PRIO_LABEL: Record<Prio, string> = {
  haute: "Priorité élevée",
  moy: "Priorité moyenne",
  faible: "Priorité faible",
};

type ChipKind = "book" | "file" | "checkdoc" | "balance" | "avalider";

type Chip = { icon: ChipKind; kind: string; text: ReactNode };

type Justif = { text: ReactNode; fn?: string; sources?: string };

type Card = {
  key: string;
  pi: number;
  prio: Prio;
  cert: { cls: string; label: string };
  icon: ReactNode;
  title: ReactNode;
  constat: ReactNode[];
  rio: { r: ReactNode; o: ReactNode; opt: ReactNode };
  impact?: ReactNode;
  justif?: Justif;
  fond?: { title: string; chips: Chip[] };
  foot: ReactNode;
};

type Group = { anchorId: string; label: string; cards: Card[] };

type Theme = { id: number; title: string; pic: ReactNode; groups: Group[] };

// ---------------------------------------------------------------------------
// Helpers réels (nom du foyer / enfants / date de mariage)
// ---------------------------------------------------------------------------

function roleRank(role: EtudePersonne["role"]): number {
  return role === "person_a" ? 0 : 1;
}

function sortedPersonnes(donnees: EtudeDonnees): EtudePersonne[] {
  return [...donnees.foyer.personnes].sort((a, b) => roleRank(a.role) - roleRank(b.role));
}

// ---------------------------------------------------------------------------
// Icônes constantes des fiches (reprises 1:1 de la maquette)
// ---------------------------------------------------------------------------

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 19V5M4 15l5-4 4 3 7-7" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PrioFlag() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 21V4" />
      <path d="M5 4h11l-2.2 3.5L16 11H5" />
    </svg>
  );
}

function FondIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 3v18M5 21h14M5 7h14M7 7l-3 6.5a3 3 0 0 0 6 0zM17 7l-3 6.5a3 3 0 0 0 6 0z" />
    </svg>
  );
}

function ChipIcon({ kind }: { kind: ChipKind }) {
  switch (kind) {
    case "book":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M5 4a1 1 0 0 1 1-1h13v18H6a1 1 0 0 1-1-1z" />
          <path d="M9 3v18" />
        </svg>
      );
    case "file":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M14 3v4a1 1 0 0 0 1 1h4M7 21h10a2 2 0 0 0 2-2V8l-5-5H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
        </svg>
      );
    case "checkdoc":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
        </svg>
      );
    case "balance":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 3v18M5 7h14M7 7l-3 6.5a3 3 0 0 0 6 0zM17 7l-3 6.5a3 3 0 0 0 6 0z" />
        </svg>
      );
    case "avalider":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" strokeDasharray="3.5 3" />
          <path d="M12 8.5v4M12 16h.01" />
        </svg>
      );
  }
}

// --- Icônes .mx des fiches (fond navy, détails ivoire/or) ------------------

function Shield({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
      {children}
    </svg>
  );
}

const IcoRefi = (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#102D50" />
    <path d="M7.5 10.2a4.6 4.6 0 0 1 8-1.6" fill="none" stroke="#FAF8F3" strokeWidth={1.8} strokeLinecap="round" />
    <path d="M16.5 13.8a4.6 4.6 0 0 1-8 1.6" fill="none" stroke="#FAF8F3" strokeWidth={1.8} strokeLinecap="round" />
    <path d="M15.8 5.6l.4 3.3-3.3.4" fill="none" stroke="#C68E0E" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.2 18.4l-.4-3.3 3.3-.4" fill="none" stroke="#C68E0E" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IcoCrl = (
  <svg viewBox="0 0 24 24">
    <rect x="4.5" y="3" width="15" height="18" rx="2" fill="#102D50" />
    <path d="M9 9l6 6" stroke="#FAF8F3" strokeWidth={1.7} strokeLinecap="round" />
    <circle cx="9.6" cy="9.4" r="1.15" fill="#FAF8F3" />
    <circle cx="14.4" cy="14.6" r="1.15" fill="#FAF8F3" />
  </svg>
);

const IcoDpe = (
  <svg viewBox="0 0 24 24">
    <rect x="3.5" y="3" width="17" height="18" rx="2.5" fill="#102D50" />
    <path d="M6.8 7.5h6.5M6.8 11h8.4M6.8 14.5h4.5" stroke="#FAF8F3" strokeWidth={1.7} strokeLinecap="round" />
    <path d="M15 13l3.2-5v3.4h1.8l-3.2 5v-3.4z" fill="#C68E0E" />
  </svg>
);

const IcoCharges = (
  <svg viewBox="0 0 24 24">
    <path d="M6 2.6h12v19l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z" fill="#102D50" />
    <path d="M9 7.5h6M9 11h6M9 14.5h4" stroke="#FAF8F3" strokeWidth={1.6} strokeLinecap="round" />
  </svg>
);

const IcoLmnp = (
  <svg viewBox="0 0 24 24">
    <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" fill="#102D50" />
    <path d="M14.4 11.7a3 3 0 1 0 0 4.6M9.2 13.1h4.6M9.2 14.9h4.6" stroke="#FAF8F3" strokeWidth={1.5} fill="none" strokeLinecap="round" />
  </svg>
);

const IcoShieldCheck = (
  <Shield>
    <path d="M8.5 12l2.3 2.3 4.4-4.8" stroke="#FAF8F3" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Shield>
);

const IcoBank = (
  <svg viewBox="0 0 24 24">
    <path d="M12 2.5 2.8 7.5h18.4z" fill="#102D50" />
    <rect x="4.2" y="9" width="2.5" height="7.5" fill="#102D50" />
    <rect x="10.75" y="9" width="2.5" height="7.5" fill="#102D50" />
    <rect x="17.3" y="9" width="2.5" height="7.5" fill="#102D50" />
    <rect x="2.8" y="18" width="18.4" height="2.2" rx="1" fill="#102D50" />
  </svg>
);

const IcoCloudRain = (
  <svg viewBox="0 0 24 24">
    <path d="M7 15h10a3.3 3.3 0 0 0 .5-6.56A4.8 4.8 0 0 0 8 6.4 3.8 3.8 0 0 0 7 15z" fill="#102D50" />
    <g stroke="#102D50" strokeWidth={2} strokeLinecap="round">
      <line x1="9" y1="17.5" x2="8" y2="20.5" />
      <line x1="13" y1="17.5" x2="12" y2="20.5" />
      <line x1="17" y1="17.5" x2="16" y2="20.5" />
    </g>
  </svg>
);

const IcoClock = (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="13" r="8" fill="#102D50" />
    <path d="M12 9v4l3 2" stroke="#FAF8F3" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 3h6" stroke="#102D50" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

const IcoShieldExclA = (
  <Shield>
    <path d="M12 8v4.5M12 16h.01" stroke="#FAF8F3" strokeWidth={2} fill="none" strokeLinecap="round" />
  </Shield>
);

const IcoShieldExclB = (
  <Shield>
    <path d="M12 8.5v4M12 15h.01" stroke="#FAF8F3" strokeWidth={1.7} strokeLinecap="round" />
  </Shield>
);

const IcoShieldExclC = (
  <Shield>
    <path d="M12 7.6v4.4M12 14.8h.01" stroke="#FAF8F3" strokeWidth={1.6} strokeLinecap="round" />
  </Shield>
);

const IcoShieldHeart = (
  <Shield>
    <path d="M12 7.5c-1.2-1.6-4-1.2-4 1 0 1.8 4 4 4 4s4-2.2 4-4c0-2.2-2.8-2.6-4-1z" fill="#FAF8F3" />
  </Shield>
);

const IcoShieldBriefcase = (
  <Shield>
    <path d="M8 9h8v7H8zM10 9V7.5h4V9" stroke="#FAF8F3" strokeWidth={1.6} fill="none" strokeLinejoin="round" />
  </Shield>
);

const IcoShieldUp = (
  <Shield>
    <path d="M12 8v8M8.5 11.5L12 8l3.5 3.5" stroke="#FAF8F3" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Shield>
);

const IcoShieldCheckUp = (
  <Shield>
    <path d="M7 14l3-3 2 2 4-5" stroke="#FAF8F3" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Shield>
);

const IcoShieldArrow = (
  <Shield>
    <path d="M8 12h7M12 8.5l3.5 3.5L12 15.5" stroke="#FAF8F3" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Shield>
);

const IcoShieldClock = (
  <Shield>
    <circle cx="12" cy="12.5" r="4.6" stroke="#FAF8F3" strokeWidth={1.5} fill="none" />
    <path d="M12 10.2v2.4l1.6 1" stroke="#FAF8F3" strokeWidth={1.5} fill="none" strokeLinecap="round" />
  </Shield>
);

const IcoShieldHouseTax = (
  <Shield>
    <path d="M7 17v-4l5-3.5 5 3.5v4" stroke="#FAF8F3" strokeWidth={1.5} fill="none" strokeLinejoin="round" />
    <path d="M11 12.5h2.4M11 14h2" stroke="#FAF8F3" strokeWidth={1.3} />
  </Shield>
);

const IcoShieldBalance = (
  <Shield>
    <path d="M12 7v9M8 16h8M9.5 8.5L6 12h7M14.5 8.5L18 12h-7" stroke="#FAF8F3" strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Shield>
);

const IcoShieldLines = (
  <Shield>
    <path d="M8 7h8M8 11h8M8 15h5" stroke="#FAF8F3" strokeWidth={1.5} fill="none" strokeLinecap="round" />
  </Shield>
);

const IcoShieldPlus = (
  <Shield>
    <path d="M12 8.6v6.8M8.6 12h6.8" stroke="#FAF8F3" strokeWidth={1.6} strokeLinecap="round" />
  </Shield>
);

const IcoShieldEuroG = (
  <Shield>
    <path d="M14.6 9.5a3 3 0 1 0 0 5M8.7 11h4.4M8.7 13h3.7" stroke="#FAF8F3" strokeWidth={1.3} fill="none" strokeLinecap="round" />
  </Shield>
);

const IcoShieldEuroCircle = (
  <Shield>
    <circle cx="12" cy="12" r="3.9" stroke="#FAF8F3" strokeWidth={1.3} fill="none" />
    <path d="M12 9.7v4.6M10.3 12h3.4" stroke="#FAF8F3" strokeWidth={1.1} strokeLinecap="round" />
  </Shield>
);

const IcoShieldDoc = (
  <Shield>
    <path d="M12 8v8M9 11h6M9 14h4" stroke="#FAF8F3" strokeWidth={1.4} fill="none" strokeLinecap="round" />
  </Shield>
);

const IcoShieldBalanceBroken = (
  <Shield>
    <path d="M12 7.6v7.8M8.2 15.4h7.6M9.6 9.2l-2.4 3.8h4.8zM14.4 9.2l2.4 3.8h-4.8z" stroke="#FAF8F3" strokeWidth={1.15} fill="none" strokeLinejoin="round" />
  </Shield>
);

const IcoShieldRoof = (
  <Shield>
    <path d="M7.4 12.4 12 8.8l4.6 3.6M8.6 11.9V16h6.8v-4.1" stroke="#FAF8F3" strokeWidth={1.25} fill="none" strokeLinejoin="round" strokeLinecap="round" />
  </Shield>
);

// --- Icônes .pic des modules de thématique (trait or) ----------------------

const PicIntro = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L20 6" />
    <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
  </svg>
);

const PicPatrimoine = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a9 9 0 1 0 9 9h-9z" />
    <path d="M12 3v9" />
  </svg>
);

const PicBudget = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12" />
    <circle cx="17" cy="13" r="1.3" fill="#C68E0E" stroke="none" />
  </svg>
);

const PicRetraite = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12M6 21h12M8 3v3l4 4 4-4V3M8 21v-3l4-4 4 4v3" />
  </svg>
);

const PicFiscalite = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18M5 21V10M9.5 21V10M14.5 21V10M19 21V10M3.5 10l8.5-6 8.5 6" />
  </svg>
);

const PicSocietes = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
  </svg>
);

const PicAssurances = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l8 3.5v5.2c0 4.6-3.4 7.8-8 9.3-4.6-1.5-8-4.7-8-9.3V6.5z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const PicMatrimonial = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="14" r="6" />
    <circle cx="15" cy="10" r="6" />
  </svg>
);

const PicTransmission = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#C68E0E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21v-8" />
    <path d="M12 13c-2.3 0-4-1.7-4-4.3 0-.5.6-.8 1-.5l3 2.2 3-2.2c.4-.3 1 0 1 .5 0 2.6-1.7 4.3-4 4.3z" />
    <path d="M9 8.4 12 6l3 2.4" />
    <path d="M8 16.5c-1.9 0-3.5-1.6-3.5-3.6 1.9 0 3.5 1.6 3.5 3.6z" />
    <path d="M16 16.5c1.9 0 3.5-1.6 3.5-3.6-1.9 0-3.5 1.6-3.5 3.6z" />
  </svg>
);

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function SubttlArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Rendu d'une fiche de risque
// ---------------------------------------------------------------------------

function RiskCard({ c }: { c: Card }) {
  return (
    <Bloc blocKey={c.key} className="ablock fold">
      <div className="ab-h">
        <span className="mx">{c.icon}</span>
        <span className="tt">{c.title}</span>
        <span
          className={`prio prio-${c.prio} eng-only`}
          data-prio={c.prio}
          data-pi={c.pi}
          title="Cliquez pour définir la gravité"
        >
          <PrioFlag />
          <span className="plab">{PRIO_LABEL[c.prio]}</span>
        </span>
        <span className={`cert ${c.cert.cls} eng-only`} data-certif={CERTIF_BY_KEY[c.key]}>
          <span>{c.cert.label}</span>
          <span className="co">
            <EyeIcon />
          </span>
        </span>
      </div>

      <div className="ab-grid">
        <div className="dim">
          <div className="dh">
            <InfoIcon /> Constat &amp; origine
          </div>
          <ul className="dlist">
            {c.constat.map((li, i) => (
              <li key={i}>{li}</li>
            ))}
          </ul>
        </div>
        <div className="dim">
          <div className="rio">
            <div className="it r">
              <span className="lab">Risque</span>
              {c.rio.r}
            </div>
            <div className="it o">
              <span className="lab">Opportunité</span>
              {c.rio.o}
            </div>
            <div className="it opt">
              <span className="lab">Optimisation</span>
              {c.rio.opt}
            </div>
          </div>
        </div>
      </div>

      {c.impact ? (
        <div className="ab-grid" style={{ borderTop: "1px solid var(--navy-100)" }}>
          <div className="dim">
            <div className="dh">
              <ChartIcon /> Impact quantifié
            </div>
            <p>{c.impact}</p>
          </div>
          <div className="dim">
            <div className="dh">
              <CheckCircleIcon /> Justification
              {c.justif?.fn ? <span className="fn client-only">{c.justif.fn}</span> : null}
            </div>
            <p>
              {c.justif?.text}
              {c.justif?.sources ? (
                <>
                  {" "}
                  <span className="eye eng-only">
                    <EyeIcon /> {c.justif.sources}
                  </span>
                </>
              ) : null}
            </p>
          </div>
        </div>
      ) : null}

      {c.fond ? (
        <div className="fond">
          <div className="fl">
            <FondIcon /> {c.fond.title}
          </div>
          <div className="chips">
            {c.fond.chips.map((ch, i) => (
              <div className="lawchip" key={i}>
                <span className="k">
                  <ChipIcon kind={ch.icon} />
                  {ch.kind}
                </span>
                <span className="lt">{ch.text}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="ab-foot">
        <ArrowIcon />
        <span>{c.foot}</span>
      </div>
    </Bloc>
  );
}

// ---------------------------------------------------------------------------
// Section complète
// ---------------------------------------------------------------------------

export default function RisquesSection({ donnees }: { donnees: EtudeDonnees }): ReactNode {
  // Branchement réel des nominatifs de l'exemple sur le foyer.
  const personnes = sortedPersonnes(donnees);
  const nomFamille = (personnes[0]?.nom ?? "").trim();
  const assure = nomFamille ? `Monsieur ${nomFamille}` : "le titulaire (nom à préciser)";
  const enfants = donnees.foyer.nbChildren === 2 ? "les deux enfants" : "les enfants";
  const mDate = donnees.foyer.marriageDate;
  const anneeMariage = mDate ? new Date(mDate).getFullYear() : null;
  const depuisMariage = mDate ? `depuis le ${formatFicheDate(mDate)}` : "depuis la conclusion du mariage";
  const signeEn = anneeMariage != null ? `signé en ${anneeMariage}` : "signé lors de sa conclusion";
  const contratMariageAnnee = anneeMariage != null ? `de ${anneeMariage}` : "sans millésime renseigné";

  // Montants du foyer saisis par l'ingénieur (persistés dans donnees.valeurs,
  // « — » tant qu'absents). Constantes légales et taux de méthode restent en dur.
  const v = (k: string, format: ValeurFormat = "euro") => (
    <ValeurEditable vKey={k} format={format} initial={donnees.valeurs[k] ?? null} />
  );

  const THEMES: Theme[] = [
    // ===================== Thème 1 — Patrimoine =====================
    {
      id: 1,
      title: "Patrimoine",
      pic: PicPatrimoine,
      groups: [
        {
          anchorId: "synr-1",
          label: "Patrimoine immobilier",
          cards: [
            {
              key: "Potentiel de refinancement",
              pi: 1,
              prio: "moy",
              cert: { cls: "c-forte", label: "Confiance forte · 95 %" },
              icon: IcoRefi,
              title: "Potentiel de refinancement",
              constat: [
                <>
                  La résidence principale et les parkings (<strong>{v("refi_rp_parkings_valeur")}</strong>) sont libres de toute
                  hypothèque ; le capital restant dû total s’élève à <strong>{v("refi_crd_total")}</strong> sur les deux
                  appartements.
                </>,
                <>Le service annuel de la dette reste modéré au regard de la valeur du parc.</>,
                <>
                  La valeur nette immobilisée demeure importante — une capacité de levier bancaire{" "}
                  <strong>partiellement exploitée</strong>, encore largement disponible.
                </>,
              ],
              rio: {
                r: "Une valeur « inerte » : un capital immobilisé qui ne travaille pas et ne génère pas de nouveaux revenus.",
                o: (
                  <>
                    Utiliser ces biens en garantie (hypothèque de second rang, crédit lombard) pour
                    financer de nouveaux investissements <strong>sans apport personnel</strong>.
                  </>
                ),
                opt: "Mobiliser une quotité prudente de la valeur du parc pour amorcer une nouvelle phase de diversification, immobilière ou financière.",
              },
              impact: (
                <>
                  À une quotité prudente de 60 à 70 %, et après déduction du capital restant dû ({v("refi_crd_total")}),
                  la capacité de refinancement mobilisable s’élève à <strong>{v("refi_capacite_mobilisable")}</strong>, déployables
                  sans céder le moindre actif (voir module ci-dessous).
                </>
              ),
              justif: {
                text: "Valeurs de marché de l’inventaire ; capital restant dû des financements en cours.",
                fn: "¹",
                sources: "2 sources",
              },
              fond: {
                title: "Fondements juridiques & fiscaux",
                chips: [
                  {
                    icon: "book",
                    kind: "Texte de loi",
                    text: (
                      <>
                        Hypothèque conventionnelle — <b>Code civil, art. 2385 et s.</b>
                      </>
                    ),
                  },
                  {
                    icon: "file",
                    kind: "Pratique bancaire",
                    text: "Quotité de financement (60 à 70 %)",
                  },
                ],
              },
              foot: (
                <>
                  <b>Optimisation chiffrée :</b> capacité de refinancement (ci-dessous) ·{" "}
                  <b>Préconisation :</b> crédit hypothécaire sur la résidence principale.
                </>
              ),
            },
            {
              key: "Contribution sur les revenus locatifs",
              pi: 2,
              prio: "faible",
              cert: { cls: "c-forte", label: "Confiance forte · 87 %" },
              icon: IcoCrl,
              title: "Contribution sur les revenus locatifs",
              constat: [
                <>
                  Une <strong>Contribution sur les revenus locatifs</strong> est acquittée pour deux
                  appartements ({v("crl_appart_1")} et {v("crl_appart_2")}).
                </>,
                <>
                  Cette contribution vise principalement les revenus perçus par des personnes morales
                  soumises à l’impôt sur les sociétés.
                </>,
                <>
                  Or ces biens sont détenus par des <strong>personnes physiques</strong> —
                  l’assujettissement ne paraît pas juridiquement fondé.
                </>,
              ],
              rio: {
                r: "Une charge indue, modérée à l’unité mais récurrente, qui pèse sur la rentabilité nette des biens concernés.",
                o: "Engager une démarche de régularisation pour solliciter le remboursement des sommes versées sur les exercices non prescrits.",
                opt: "Cesser le règlement et récupérer les montants des trois dernières années auprès de l’administration fiscale.",
              },
              impact: (
                <>
                  Économie pérenne de <strong>{v("crl_economie_annuelle")}</strong>, et remboursement potentiel d’environ{" "}
                  <strong>{v("crl_remboursement_3ans")}</strong> au titre des trois derniers exercices.
                </>
              ),
              justif: {
                text: "Avis d’imposition et comptes locatifs ; régime juridique de la contribution.",
                fn: "²",
                sources: "2 sources",
              },
              fond: {
                title: "Fondements juridiques & fiscaux",
                chips: [
                  {
                    icon: "book",
                    kind: "Texte de loi",
                    text: <b>CGI, art. 234 nonies à 234 quindecies</b>,
                  },
                  { icon: "file", kind: "Doctrine", text: <b>BOI-RFPI-CTRL-20</b> },
                  {
                    icon: "checkdoc",
                    kind: "Procédure",
                    text: (
                      <>
                        Réclamation — <b>LPF, art. L.190 et R.196-1</b>
                      </>
                    ),
                  },
                ],
              },
              foot: (
                <>
                  <b>Préconisation :</b> régularisation auprès de l’administration fiscale et demande de
                  remboursement.
                </>
              ),
            },
            {
              key: "Diagnostic de performance énergétique",
              pi: 3,
              prio: "moy",
              cert: { cls: "c-forte", label: "Confiance forte · 89 %" },
              icon: IcoDpe,
              title: "Absence de diagnostic de performance énergétique",
              constat: [
                <>
                  Plusieurs actifs ne disposent d’aucun{" "}
                  <strong>diagnostic de performance énergétique</strong> en cours de validité.
                </>,
                <>
                  La réglementation impose un diagnostic opposable pour toute mise en location,
                  renouvellement de bail ou vente.
                </>,
                <>
                  L’absence de classification empêche de mesurer l’exposition aux futures interdictions
                  de louer.
                </>,
              ],
              rio: {
                r: "Nullité possible du bail ou de la vente, amende administrative (jusqu’à 3 000 € pour une personne physique, 15 000 € pour une SCI), loyer gelé si le bien est classé F ou G.",
                o: "Anticiper les diagnostics permet de sécuriser les baux, de fiabiliser les valeurs et d’identifier d’éventuels travaux d’amélioration.",
                opt: "Réaliser les diagnostics manquants avant toute relocation ou cession, et budgéter les éventuels travaux de rénovation énergétique.",
              },
              impact:
                "Risque réglementaire et de dépréciation : un classement défavorable contraindrait à des travaux non budgétés et gèlerait les loyers, pesant sur le rendement et la valeur vénale.",
              justif: {
                text: "Dossier locatif ; réglementation sur la décence énergétique.",
                fn: "³",
                sources: "2 sources",
              },
              fond: {
                title: "Fondements juridiques & fiscaux",
                chips: [
                  {
                    icon: "book",
                    kind: "Texte de loi",
                    text: (
                      <>
                        <b>CCH, art. L.126-26 et s.</b> — loi Climat et Résilience
                      </>
                    ),
                  },
                  { icon: "book", kind: "Texte de loi", text: "Gel des loyers (classes F et G)" },
                ],
              },
              foot: (
                <>
                  <b>Préconisation :</b> réalisation des diagnostics de performance énergétique sur les
                  biens concernés.
                </>
              ),
            },
            {
              key: "Niveau des charges locatives",
              pi: 4,
              prio: "faible",
              cert: { cls: "c-forte", label: "Confiance forte · 86 %" },
              icon: IcoCharges,
              title: "Niveau des charges locatives — vigilance et optimisation",
              constat: [
                <>
                  Sur l’appartement meublé détenu en nom propre, les charges représentent{" "}
                  <strong>{v("charges_meuble_montant")}</strong>, soit ≈ <strong>{v("charges_meuble_ratio", "percent")}</strong> du chiffre d’affaires — un poste à
                  surveiller.
                </>,
                <>
                  Sur les studios détenus en <strong>SCI</strong>, ce ratio atteint près de{" "}
                  <strong>{v("charges_sci_ratio", "percent")}</strong> (honoraires comptables, copropriété, assurances, frais d’agence)
                  — analysé dans le thème « Sociétés ».
                </>,
              ],
              rio: {
                r: "L’empilement de frais fixes capte près de la moitié des loyers avant même l’imposition des associés, ralentissant la performance.",
                o: "Renégocier les postes les plus lourds (honoraires, agence) et rationaliser les protections assurantielles.",
                opt: "Revue ligne à ligne des charges pour rehausser le rendement net sans toucher au capital.",
              },
              fond: {
                title: "Fondements juridiques & fiscaux",
                chips: [
                  {
                    icon: "book",
                    kind: "Texte de loi",
                    text: (
                      <>
                        Charges déductibles — <b>CGI, art. 39 ; BOI-BIC-CHAMP-40-20</b>
                      </>
                    ),
                  },
                ],
              },
              foot: (
                <>
                  <b>Préconisation :</b> audit et renégociation des charges d’exploitation locatives.
                </>
              ),
            },
            {
              key: "Régime de la location meublée non professionnelle",
              pi: 5,
              prio: "moy",
              cert: { cls: "c-forte", label: "Confiance forte · 90 %" },
              icon: IcoLmnp,
              title: "Régime de la location meublée non professionnelle (LMNP)",
              constat: [
                <>
                  L’appartement meublé est exploité en location meublée non professionnelle : les
                  recettes ({v("lmnp_recettes")}) restent inférieures à 23 000 € et aux autres revenus du foyer.
                </>,
                <>
                  Ce régime relève des bénéfices industriels et commerciaux, au régime réel, avec
                  amortissement du bien et du mobilier.
                </>,
              ],
              rio: {
                r: (
                  <>
                    À la cession, les amortissements pratiqués sont désormais{" "}
                    <strong>réintégrés dans la plus-value</strong> (réforme 2025), ce qui alourdit
                    l’imposition. Un franchissement durable des seuils ferait{" "}
                    <strong>basculer le bien en LMP</strong> — changement de régime de plus-value et
                    affiliation sociale.
                  </>
                ),
                o: (
                  <>
                    L’amortissement du bien et du mobilier, au régime réel,{" "}
                    <strong>neutralise tout ou partie de l’imposition des loyers</strong> pendant la
                    phase de détention ; les déficits s’imputent et se reportent.
                  </>
                ),
                opt: "Arbitrer la durée de détention au regard de la réforme, et piloter le niveau des recettes pour conserver, le cas échéant, le statut non professionnel.",
              },
              impact: (
                <>
                  Loyers de <b>{v("lmnp_loyers_annuels")}</b> par an largement neutralisés par l’amortissement pendant la
                  détention ; en contrepartie, plus-value brute portée à <b>{v("lmnp_plusvalue_brute")}</b> à la cession après
                  réintégration des amortissements (voir le coût d’opportunité immobilier).
                </>
              ),
              justif: {
                text: "Régime des bénéfices industriels et commerciaux, seuils du statut et réforme de la plus-value.",
                fn: "⁶",
                sources: "sources",
              },
              fond: {
                title: "Fondements juridiques & fiscaux",
                chips: [
                  {
                    icon: "book",
                    kind: "Texte de loi",
                    text: (
                      <>
                        Seuils LMNP / LMP — <b>CGI, art. 155, IV</b>
                      </>
                    ),
                  },
                  {
                    icon: "book",
                    kind: "Texte de loi",
                    text: (
                      <>
                        Régime réel BIC — <b>BOI-BIC-CHAMP-40-20</b>
                      </>
                    ),
                  },
                  {
                    icon: "book",
                    kind: "Texte de loi",
                    text: (
                      <>
                        Réintégration des amortissements — <b>CGI, art. 150 VB III</b>
                      </>
                    ),
                  },
                ],
              },
              foot: (
                <>
                  <b>Préconisation :</b> arbitrer la stratégie de détention (LMNP / LMP) au regard de la
                  réforme de 2025 et de la trajectoire des recettes.
                </>
              ),
            },
            {
              key: "Assurance emprunteur — remboursement et fiscalité",
              pi: 6,
              prio: "moy",
              cert: { cls: "c-moy", label: "Confiance modérée · 78 %" },
              icon: IcoShieldCheck,
              title:
                "Assurance emprunteur (décès / perte totale et irréversible d’autonomie) — remboursement du prêt et fiscalité",
              constat: [
                <>
                  Pour les biens financés par emprunt — détenus via la SCI, ou en location meublée non
                  professionnelle (LMNP) et professionnelle (LMP) — une assurance emprunteur garantit le
                  remboursement du prêt en cas de décès ou de perte totale et irréversible d’autonomie
                  d’un assuré.
                </>,
                <>
                  Le remboursement anticipé par l’assureur a un effet fiscal qui dépend du{" "}
                  <strong>régime de la structure</strong>.
                </>,
              ],
              rio: {
                r: (
                  <>
                    En SCI à l’impôt sur les sociétés, le capital remboursé par l’assurance constitue un{" "}
                    <strong>produit exceptionnel imposable</strong> (accroissement de l’actif net) — une
                    charge fiscale parfois inattendue.{" "}
                    <strong>Le même mécanisme s’applique en location meublée au régime réel</strong>{" "}
                    (LMNP ou LMP).
                  </>
                ),
                o: (
                  <>
                    Anticiper le traitement et, le cas échéant, opter pour l’<strong>étalement</strong>{" "}
                    du produit sur cinq exercices ; choisir le régime (impôt sur le revenu ou sur les
                    sociétés) en connaissance de cause.
                  </>
                ),
                opt: "Calibrer les têtes assurées et les quotités d’assurance, et documenter le régime applicable, pour maîtriser l’impact fiscal de la garantie.",
              },
              impact: (
                <>
                  <b>SCI à l’impôt sur les sociétés :</b> produit = capital restant dû remboursé (à titre
                  d’illustration, ≈ {v("assur_crd_local")} sur le local financé), imposé à l’impôt sur les sociétés,{" "}
                  <b>étalable sur 5 ans</b>. <b>SCI à l’impôt sur le revenu :</b> l’indemnité constitue
                  des <b>recettes foncières</b> dès lors que les intérêts ont été déduits.{" "}
                  <b>Location meublée au réel (LMNP ou LMP) :</b> le capital remboursé constitue un{" "}
                  <b>produit imposable au titre des bénéfices industriels et commerciaux</b>, étalable
                  sur cinq exercices.
                </>
              ),
              justif: {
                text: "Qualification de l’indemnité d’assurance selon le régime de la structure.",
                fn: "⁴",
                sources: "sources",
              },
              fond: {
                title: "Fondements juridiques & fiscaux",
                chips: [
                  {
                    icon: "balance",
                    kind: "Jurisprudence",
                    text: <b>Conseil d’État, 6 août 2008, n°301336</b>,
                  },
                  {
                    icon: "book",
                    kind: "Texte de loi",
                    text: (
                      <>
                        Produit exceptionnel, étalement — <b>CGI, art. 38 et 38 quater</b>
                      </>
                    ),
                  },
                  {
                    icon: "file",
                    kind: "Doctrine",
                    text: (
                      <>
                        Société à l’IR : recettes foncières — <b>BOI-RFPI-BASE-20-80</b>
                      </>
                    ),
                  },
                  {
                    icon: "book",
                    kind: "Texte de loi",
                    text: (
                      <>
                        Location meublée au réel (BIC) — <b>CGI, art. 38 et 38 quater</b>
                      </>
                    ),
                  },
                ],
              },
              foot: (
                <>
                  <b>Préconisation :</b> cadrer le régime fiscal de l’assurance emprunteur et la
                  stratégie d’étalement, pour la SCI comme pour la location meublée (analyse détaillée
                  dans le thème « Sociétés »).
                </>
              ),
            },
            {
              key: "Multiplicité des banques — déchéance du terme",
              pi: 7,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 75 %" },
              icon: IcoBank,
              title: "Multiplicité des banques — risque de déchéance du terme",
              constat: [
                <>
                  Plusieurs établissements financent ou pourraient financer les différents actifs du
                  foyer et de ses structures.
                </>,
                <>
                  Chaque prêt comporte des <strong>obligations déclaratives</strong> sur les
                  engagements existants auprès des autres prêteurs.
                </>,
              ],
              rio: {
                r: (
                  <>
                    L’omission ou l’inexactitude d’une déclaration d’engagement peut caractériser une
                    fausse déclaration et entraîner la <strong>déchéance du terme</strong> — exigibilité
                    immédiate du capital restant dû.
                  </>
                ),
                o: "Cartographier l’ensemble des engagements et fiabiliser les déclarations sécurise les financements et la relation bancaire.",
                opt: "Tenir un tableau de bord des prêts (établissement, encours, sûretés, clauses) et respecter scrupuleusement les obligations d’information.",
              },
              impact:
                "Exigibilité anticipée des prêts concernés, dégradation de la relation bancaire et surcoût de refinancement en urgence — un risque de liquidité disproportionné au regard du manquement.",
              justif: {
                text: "Clauses des contrats de prêt et obligations de sincérité des déclarations.",
                fn: "⁵",
                sources: "sources",
              },
              fond: {
                title: "Fondements juridiques & fiscaux",
                chips: [
                  {
                    icon: "book",
                    kind: "Texte de loi",
                    text: (
                      <>
                        Déchéance du terme — <b>Code civil, art. 1103 et 1104</b>
                      </>
                    ),
                  },
                  {
                    icon: "checkdoc",
                    kind: "Obligation",
                    text: "Sincérité des déclarations d’engagements",
                  },
                ],
              },
              foot: (
                <>
                  <b>Préconisation :</b> cartographie consolidée des engagements bancaires et mise en
                  conformité déclarative.
                </>
              ),
            },
          ],
        },
        {
          anchorId: "synr-2",
          label: "Patrimoine financier",
          cards: [
            {
              key: "Excédent de liquidités",
              pi: 8,
              prio: "faible",
              cert: { cls: "c-forte", label: "Confiance forte · 96 %" },
              icon: IcoCloudRain,
              title: "Excédent de liquidités",
              constat: [
                <>
                  Liquidités immédiatement disponibles : <strong>{v("liq_disponibles")}</strong>, soit <strong>{v("liq_mois_couverts", "number")}</strong>{" "}
                  de dépenses courantes.
                </>,
                <>Norme d’épargne de précaution : 3 à 6 mois, soit une réserve cible de ~{v("liq_reserve_cible")}.</>,
                <>Origine : accumulation progressive sur comptes courants et livrets, sans réallocation.</>,
              ],
              rio: {
                r: "Érosion monétaire : ces fonds, peu ou pas rémunérés, perdent du pouvoir d’achat face à l’inflation (~2,5 %/an).",
                o: "Liquidité = atout : apport pour un investissement à effet de levier, ou saisie d’opportunités lors d’une correction de marché.",
                opt: (
                  <>
                    Arbitrer l’excédent (~{v("liq_excedent")}) vers des supports rémunérateurs, en conservant une
                    réserve de précaution de ~{v("liq_reserve_cible")}.
                  </>
                ),
              },
              impact: (
                <>
                  Excédent au-delà de la réserve : <strong>{v("liq_excedent")}</strong>. À 1,9 % il rapporterait ~{v("liq_rendement_bas")} ; à
                  5 %, ~{v("liq_rendement_haut")} — un différentiel de <strong>{v("liq_differentiel")}</strong> de performance non captée.
                </>
              ),
              justif: {
                text: "Réserve recommandée 3-6 mois (pratique de place) ; train de vie issu de l’analyse budgétaire.",
                fn: "¹",
                sources: "3 sources",
              },
              foot: (
                <>
                  <b>Optimisation chiffrée :</b> coût d’opportunité (ci-dessous) · <b>Préconisation :</b>{" "}
                  arbitrage vers l’assurance-vie luxembourgeoise.
                </>
              ),
            },
            {
              key: "Faible performance des contrats",
              pi: 9,
              prio: "moy",
              cert: { cls: "c-forte", label: "Confiance forte · 88 %" },
              icon: IcoCloudRain,
              title: "Faible performance des contrats",
              constat: [
                <>
                  Depuis l’origine des contrats, rendements nets de <strong>{v("perf_rdt_monsieur", "percent")}</strong> (Monsieur) et{" "}
                  <strong>{v("perf_rdt_madame", "percent")}</strong> (Madame). Inflation moyenne sur la période : {v("perf_inflation_periode", "percent")}.
                </>,
                <>
                  Contrats des enfants : {v("perf_rdt_enfant_1", "percent")} et {v("perf_rdt_enfant_2", "percent")} pour une inflation de {v("perf_inflation_enfants", "percent")} sur la période —
                  performance réelle à apprécier.
                </>,
                <>
                  Origine : forte exposition aux fonds euros ; une injection récente de{" "}
                  <strong>{v("perf_injection_recente")}</strong> fige une part prépondérante du capital.
                </>,
              ],
              rio: {
                r: (
                  <>
                    Rendement réel négatif de <strong>{v("perf_rdt_reel_negatif", "percent")}</strong> : le patrimoine se déprécie en
                    pouvoir d’achat malgré la protection nominale.
                  </>
                ),
                o: "Réallouer un capital de cette taille sur des supports diversifiés peut transformer une perte réelle en croissance significative.",
                opt: "Arbitrage vers une enveloppe performante (assurance-vie luxembourgeoise, unités de compte pilotées), réserve de précaution maintenue.",
              },
              impact: (
                <>
                  Sur ~{v("perf_capital_concerne")}, le différentiel de {v("perf_differentiel_taux", "percent")} représente <strong>{v("perf_richesse_perdue")}</strong> de richesse réelle
                  perdue, avant fiscalité. Sur 10 ans, manque à gagner cumulé <strong>{v("perf_manque_gagner_10ans")}</strong>{" "}
                  (détail ci-dessous).
                </>
              ),
              justif: {
                text: "Rendements et versements issus des relevés annuels ; inflation moyenne INSEE.",
                fn: "²",
                sources: "3 sources",
              },
              foot: (
                <>
                  <b>Optimisation chiffrée :</b> coût d’opportunité (ci-dessous) · <b>Préconisation :</b>{" "}
                  arbitrage des avoirs vers l’assurance-vie luxembourgeoise.
                </>
              ),
            },
          ],
        },
        {
          anchorId: "synr-3",
          label: "Analyse du passif",
          cards: [
            {
              key: "Charge d’emprunt — veille des taux",
              pi: 10,
              prio: "moy",
              cert: { cls: "c-forte", label: "Confiance forte · 90 %" },
              icon: IcoClock,
              title:
                "Évaluation de la charge d’emprunt — opportunité de renégociation ou de rachat",
              constat: [
                <>
                  Les financements en cours s’échelonnent de <strong>{v("passif_credits_taux", "percent")}</strong>.
                </>,
                <>
                  Le prêt de l’appartement meublé ({v("passif_taux_pret_meuble", "percent")}) et le crédit à la consommation ({v("passif_taux_credit_conso", "percent")}) ressortent{" "}
                  <strong>au-dessus des conditions de marché</strong> actuelles (≈ 3,50 % sur 15 ans).
                </>,
              ],
              rio: {
                r: (
                  <>
                    Une veille insuffisante laisserait courir une{" "}
                    <strong>charge d’intérêts supérieure au marché</strong> sur les lignes les plus
                    chères.
                  </>
                ),
                o: (
                  <>
                    Renégociation ou <strong>rachat</strong> du prêt meublé et du crédit à la
                    consommation dès que les taux moyens afficheront environ{" "}
                    <strong>1 % d’écart à la baisse</strong>, allégeant la charge de la dette.
                  </>
                ),
                opt: (
                  <>
                    Mettre en place une veille des taux et chiffrer le <strong>point mort</strong> d’un
                    rachat — indemnités de remboursement anticipé incluses — avant toute opération.
                  </>
                ),
              },
              impact: (
                <>
                  Allègement mécanique de la charge d’intérêts et amélioration du cash-flow, à arbitrer
                  contre les indemnités de remboursement anticipé (≈ {v("passif_ira_meuble")} sur le meublé, sans indemnité
                  sur le crédit à la consommation).
                </>
              ),
              justif: {
                text: "Comparaison des taux des contrats et des conditions de marché à durée équivalente.",
                fn: "¹",
                sources: "sources",
              },
              foot: (
                <>
                  <b>Préconisation :</b> instaurer une veille des taux et étudier le rachat des lignes
                  les plus chères (chiffré dans la partie « Préconisations »).
                </>
              ),
            },
            {
              key: "Assurance emprunteur — quotités et délégation",
              pi: 11,
              prio: "moy",
              cert: { cls: "c-moy", label: "Confiance modérée · 79 %" },
              icon: IcoShieldCheck,
              title: "Couverture et coût de l’assurance emprunteur — quotités et délégation",
              constat: [
                <>
                  Le prêt du local professionnel (SCI) est assuré à une{" "}
                  <strong>quotité de 30 % par tête</strong>, soit 60 % au global.
                </>,
                <>
                  Son coût (≈ {v("assemp_cout_assurance")}) <strong>pèse sur la rentabilité</strong> de la SCI.
                </>,
              ],
              rio: {
                r: (
                  <>
                    La faible quotité globale (60 %) contraindrait le{" "}
                    <strong>conjoint survivant à supporter seul environ 70 %</strong> de l’échéance en
                    cas de décès du partenaire.
                  </>
                ),
                o: (
                  <>
                    Une renégociation ou une <strong>délégation d’assurance</strong> permettrait une
                    économie de trésorerie sur la durée résiduelle, à garanties au moins équivalentes.
                  </>
                ),
                opt: (
                  <>
                    Relever les quotités (cible <strong>100 % par tête</strong> sur les prêts SCI) et
                    mettre l’assurance en concurrence par délégation.
                  </>
                ),
              },
              impact: (
                <>
                  Économie de trésorerie sur la durée résiduelle et meilleure protection du conjoint
                  survivant. En crédit professionnel, le droit à la délégation est moins protecteur, mais
                  une démarche commerciale peut{" "}
                  <b>augmenter les garanties tout en abaissant le coût</b>.
                </>
              ),
              justif: {
                text: "Quotités et coûts relevés sur le contrat d’assurance emprunteur.",
                fn: "²",
                sources: "sources",
              },
              fond: {
                title: "Fondements juridiques",
                chips: [
                  {
                    icon: "avalider",
                    kind: "À valider",
                    text: (
                      <>
                        Droit à la délégation d’assurance (crédit professionnel) —{" "}
                        <b>référence base ASTRAEOS</b>
                      </>
                    ),
                  },
                ],
              },
              foot: (
                <>
                  <b>Préconisation :</b> relever les quotités et mettre en concurrence l’assurance
                  emprunteur par délégation (chiffré dans la partie « Préconisations »).
                </>
              ),
            },
            {
              key: "Caution solidaire — exposition personnelle",
              pi: 12,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 80 %" },
              icon: IcoShieldExclA,
              title: "Caution solidaire — la dette des SCI pèse sur le patrimoine personnel",
              constat: [
                <>
                  Les deux financements logés dans les SCI (studios locatifs et local professionnel)
                  représentent <strong>{v("caution_crd_sci")}</strong> de capital restant dû.
                </>,
                <>
                  Ces prêts sont assortis d’une <strong>caution solidaire</strong> consentie
                  personnellement par les associés : la banque peut les poursuivre directement, pour la
                  totalité de la dette.
                </>,
              ],
              rio: {
                r: (
                  <>
                    Sous le régime de la <strong>séparation de biens</strong>, l’engagement de caution
                    n’est pas couvert par les protections propres aux régimes communautaires : il pèse
                    sur le <strong>patrimoine propre</strong> de chaque caution, au-delà du capital
                    social.
                  </>
                ),
                o: (
                  <>
                    La <strong>renégociation des cautions bancaires</strong> et la mise en place d’une{" "}
                    <strong>délégation d’assurance emprunteur</strong> permettent d’alléger et de
                    circonscrire cette exposition.
                  </>
                ),
                opt: "Documenter l’étendue exacte de chaque caution, calibrer les têtes et quotités d’assurance, et tenir un tableau de bord unique des engagements.",
              },
              impact: (
                <>
                  La caution porte le taux d’endettement <b>de {v("caution_taux_avant", "percent")} à {v("caution_taux_apres", "percent")}</b> : un écart de près de{" "}
                  <b>{v("caution_ecart_service")} de service annuel</b> de la dette, supporté personnellement en cas de
                  défaillance des sociétés. La renégociation viserait à substituer ou plafonner ces
                  engagements ; la délégation d’assurance à garantir le remboursement en cas de décès ou
                  d’invalidité d’un associé.
                </>
              ),
              justif: {
                text: "Contrats de prêt des SCI et actes de cautionnement ; régime de la séparation de biens.",
                fn: "¹",
                sources: "sources",
              },
              fond: {
                title: "Fondements juridiques",
                chips: [
                  {
                    icon: "avalider",
                    kind: "À valider",
                    text: (
                      <>
                        Cautionnement solidaire de l’associé — <b>référence base ASTRAEOS</b>
                      </>
                    ),
                  },
                  {
                    icon: "checkdoc",
                    kind: "Obligation",
                    text: "Déclarations d’engagements aux prêteurs",
                  },
                ],
              },
              foot: (
                <>
                  <b>Préconisations :</b> renégociation des cautions bancaires des SCI et délégation
                  d’assurance emprunteur (chiffrées dans la partie « Préconisations »).
                </>
              ),
            },
          ],
        },
        {
          anchorId: "synr-4",
          label: "Synthèse de l’analyse du patrimoine",
          cards: [
            {
              key: "Assurance-vie au cœur du patrimoine",
              pi: 13,
              prio: "moy",
              cert: { cls: "c-moy", label: "Confiance modérée · 80 %" },
              icon: IcoShieldHeart,
              title: "Une assurance-vie au cœur du patrimoine, levier de transmission",
              constat: [
                <>
                  L’assurance-vie représente <strong>{v("av_valeur_totale")}</strong>, premier actif du foyer (environ {v("av_part_patrimoine", "percent")}{" "}
                  du patrimoine brut).
                </>,
                <>Elle concentre une part importante de l’épargne financière disponible.</>,
              ],
              rio: {
                r: "Une concentration sur un même cadre expose à l’évolution de sa fiscalité et à la performance de ses supports ; des clauses bénéficiaires non actualisées peuvent contrarier la volonté de transmission.",
                o: "L’assurance-vie demeure un outil de transmission très efficace : clause bénéficiaire sur mesure et fiscalité avantageuse hors succession, dans les limites légales.",
                opt: "Actualiser les clauses bénéficiaires, arbitrer entre fonds en euros et unités de compte selon l’horizon, et répartir les capitaux entre plusieurs contrats.",
              },
              impact: (
                <>
                  Bien calibrée, l’assurance-vie permet de transmettre une part importante des{" "}
                  <strong>{v("av_valeur_totale")}</strong> dans un cadre fiscal optimisé.
                </>
              ),
              justif: { text: "Relevés des contrats d’assurance-vie et clauses bénéficiaires." },
              foot: (
                <>
                  <b>Préconisation :</b> auditer les clauses bénéficiaires et l’allocation des contrats
                  (parties « Successoral » et « Préconisations »).
                </>
              ),
            },
            {
              key: "Patrimoine professionnel à sécuriser",
              pi: 14,
              prio: "moy",
              cert: { cls: "c-moy", label: "Confiance modérée · 78 %" },
              icon: IcoShieldBriefcase,
              title: "Un patrimoine professionnel significatif, à sécuriser et rendre liquide",
              constat: [
                <>
                  Le patrimoine professionnel s’élève à <strong>{v("patrpro_valeur")}</strong>, deuxième poste du
                  patrimoine ({v("patrpro_part_patrimoine", "percent")}).
                </>,
                <>Il est étroitement lié à l’activité libérale et peu liquide.</>,
              ],
              rio: {
                r: "La valeur de l’outil professionnel dépend de la poursuite de l’activité ; sa transmission ou sa cession, non anticipée, peut être lourdement fiscalisée.",
                o: "Une structuration adaptée (société d’exercice, holding) et l’anticipation de la cession permettent de sécuriser et de valoriser cet actif.",
                opt: "Étudier la détention via une structure dédiée et préparer la transmission (pacte Dutreil le cas échéant).",
              },
              impact: (
                <>
                  Les <strong>{v("patrpro_valeur")}</strong> de patrimoine professionnel gagnent en sécurité et en
                  liquidité par une structuration anticipée.
                </>
              ),
              justif: { text: "Bilans des activités libérales et structure de détention." },
              foot: (
                <>
                  <b>Préconisation :</b> étudier la structuration et la transmission de l’outil
                  professionnel (parties « Sociétés » et « Préconisations »).
                </>
              ),
            },
            {
              key: "Transmission du patrimoine",
              pi: 15,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 82 %" },
              icon: IcoShieldUp,
              title: "Un patrimoine conséquent appelant une stratégie de transmission",
              constat: [
                <>
                  Le patrimoine net atteint <strong>{v("patrimoine_net")}</strong>, détenu sous le régime de la séparation
                  de biens, avec deux enfants.
                </>,
                <>La détention combine indivision, SCI et biens propres.</>,
              ],
              rio: {
                r: "Sans anticipation, la transmission sera soumise à une fiscalité successorale potentiellement lourde ; la complexité de la détention peut compliquer le partage.",
                o: "De nombreux leviers existent (donation-partage, démembrement de propriété, donation de parts de SCI, assurance-vie) pour organiser et alléger la transmission.",
                opt: "Mettre en place une stratégie de transmission progressive, en exploitant les abattements et le démembrement.",
              },
              impact: (
                <>
                  Une anticipation structurée peut réduire significativement la fiscalité de
                  transmission des <strong>{v("patrimoine_net")}</strong> de patrimoine net.
                </>
              ),
              justif: {
                text: "Composition et structure de détention du patrimoine, régime matrimonial.",
              },
              foot: (
                <>
                  <b>Préconisation :</b> bâtir une stratégie de transmission sur mesure (parties
                  « Successoral » et « Préconisations »).
                </>
              ),
            },
          ],
        },
      ],
    },
    // ================= Thème 2 — Budget et capacité d’épargne =================
    {
      id: 2,
      title: "Budget et capacité d’épargne",
      pic: PicBudget,
      groups: [
        {
          anchorId: "synr-5",
          label: "Analyse du budget",
          cards: [
            {
              key: "Capacité d’épargne à mobiliser",
              pi: 16,
              prio: "moy",
              cert: { cls: "c-moy", label: "Confiance modérée · 82 %" },
              icon: IcoShieldCheckUp,
              title: "Une capacité d’épargne élevée, à structurer et à investir",
              constat: [
                <>
                  Le foyer dégage <strong>{v("budget_epargne_annuelle")} d’épargne par an</strong> (environ {v("budget_epargne_mensuelle")} par mois), soit {v("budget_epargne_taux", "percent")}{" "}
                  de ses revenus.
                </>,
                <>
                  Laissé sur des comptes peu rémunérés, cet excédent ne contribue pas à la constitution
                  du patrimoine.
                </>,
              ],
              rio: {
                r: "Une épargne non investie subit l’érosion de l’inflation et représente un coût d’opportunité significatif sur la durée.",
                o: "Orienter cet excédent vers des supports adaptés (assurance-vie, immobilier, placements financiers) enclenche un effet de capitalisation.",
                opt: "Mettre en place des versements programmés et une allocation cible cohérente avec l’horizon et le profil de risque.",
              },
              impact: (
                <>
                  Réorientés vers des supports rémunérés, ces <strong>{v("budget_epargne_annuelle")} annuels</strong> représentent,
                  capitalisés, un levier patrimonial majeur sur 10 à 20 ans.
                </>
              ),
              justif: { text: "Soldes des comptes et flux d’épargne issus du budget du foyer." },
              foot: (
                <>
                  <b>Préconisation :</b> définir une stratégie d’investissement de l’excédent d’épargne
                  (détaillée dans la partie « Préconisations »).
                </>
              ),
            },
            {
              key: "Dépendance aux revenus libéraux",
              pi: 17,
              prio: "moy",
              cert: { cls: "c-forte", label: "Confiance forte · 88 %" },
              icon: IcoShieldExclA,
              title: "Des revenus concentrés sur l’activité libérale",
              constat: [
                <>
                  Les deux activités libérales représentent <strong>{v("budget_revenus_liberaux")}</strong> de revenus, soit
                  environ {v("budget_part_liberaux", "percent")} du total.
                </>,
                <>
                  Les charges courantes, les impôts et le service de la dette demeurent dus
                  indépendamment de l’activité.
                </>,
              ],
              rio: {
                r: "En cas d’arrêt d’activité (maladie, accident), la chute des revenus professionnels exposerait le foyer à un déséquilibre budgétaire rapide.",
                o: "Une prévoyance bien calibrée (indemnités journalières, garantie maintien de revenu) sécurise le budget en cas de coup dur.",
                opt: "Renforcer progressivement la part des revenus passifs (fonciers, financiers) pour diversifier les sources.",
              },
              impact: (
                <>
                  Un revenu de remplacement adapté couvrirait les <strong>{v("budget_charges_annuelles")} de charges</strong> et {v("budget_service_dette_annuel")}{" "}
                  de service de la dette annuels en cas d’incapacité.
                </>
              ),
              justif: {
                text: "Structure des revenus issue des avis d’imposition et des comptes de résultat.",
              },
              foot: (
                <>
                  <b>Préconisation :</b> auditer la couverture prévoyance des deux praticiens (renvoi à
                  la partie « Analyse des assurances »).
                </>
              ),
            },
            {
              key: "Marge d’endettement disponible",
              pi: 18,
              prio: "faible",
              cert: { cls: "c-moy", label: "Confiance modérée · 84 %" },
              icon: IcoShieldArrow,
              title: "Une marge d’endettement préservée, mobilisable en effet de levier",
              constat: [
                <>
                  Le taux d’effort s’établit à <strong>{v("budget_taux_effort", "percent")}</strong>, nettement en deçà des seuils
                  d’octroi usuels (de l’ordre de 35 %).
                </>,
                <>Le foyer conserve donc une capacité d’endettement substantielle.</>,
              ],
              rio: {
                r: "Une marge inutilisée est un levier patrimonial dormant : l’épargne seule capitalise plus lentement que l’effet de levier du crédit.",
                o: "Cette marge autorise un financement complémentaire pour acquérir un actif (immobilier de rapport, parts de société), en mobilisant l’effet de levier.",
                opt: "Calibrer un nouveau financement en cohérence avec la capacité d’épargne et la fiscalité du foyer.",
              },
              impact:
                "À l’approche du seuil d’usage (35 %), la capacité d’emprunt résiduelle se chiffre en plusieurs centaines de milliers d’euros, déployables sans déséquilibrer le budget.",
              justif: { text: "Taux d’effort calculé sur les revenus et les charges d’emprunt du foyer." },
              foot: (
                <>
                  <b>Préconisation :</b> étudier un investissement à effet de levier adossé à la capacité
                  résiduelle (chiffré dans la partie « Préconisations »).
                </>
              ),
            },
          ],
        },
      ],
    },
    // ===================== Thème 3 — Retraite =====================
    {
      id: 3,
      title: "Retraite",
      pic: PicRetraite,
      groups: [
        {
          anchorId: "synr-6",
          label: "Analyse des états retraite",
          cards: [
            {
              key: "Taux de remplacement et baisse des ressources",
              pi: 19,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 82 %" },
              icon: IcoShieldClock,
              title: <>Un taux de remplacement faible : baisse des ressources de {v("retr_taux_baisse", "percent")} à la retraite</>,
              constat: [
                <>
                  Le revenu professionnel annuel actuel du couple s’élève à <strong>{v("retr_revenu_actuel")}</strong> (net
                  imposable).
                </>,
                <>
                  Le montant prévisionnel des pensions (régime de base et complémentaire) est estimé à{" "}
                  <strong>{v("retr_pension_estimee")}</strong> bruts par an.
                </>,
                <>
                  Cette projection met en évidence une baisse de revenus de <strong>{v("retr_baisse_revenus")}</strong> au
                  moment du départ à la retraite.
                </>,
              ],
              rio: {
                r: "La diminution des ressources peut engendrer un déséquilibre budgétaire si les charges fixes (crédits en cours, impôts, dépenses de santé) et le train de vie ne sont pas ajustés. Sans anticipation, le couple pourrait puiser prématurément dans son capital, compromettant la pérennité du patrimoine à long terme.",
                o: "La mise en place d’une stratégie de revenus complémentaires permettrait de combler tout ou partie de cet écart.",
                opt: "Anticiper la constitution de revenus complémentaires (immobilier locatif, placements financiers, épargne retraite) et ajuster progressivement les charges fixes avant le départ.",
              },
              impact:
                "Ce différentiel de revenus réduit la marge de manœuvre financière face à des dépenses imprévues ou liées à une future perte d’autonomie.",
              justif: {
                text: "Relevés de carrière, estimations des régimes de retraite et revenus professionnels du foyer.",
              },
              foot: (
                <>
                  <b>Préconisation :</b> bâtir une stratégie de revenus complémentaires pour sécuriser le
                  niveau de vie à la retraite (partie « Préconisations »).
                </>
              ),
            },
          ],
        },
      ],
    },
    // ===================== Thème 4 — Fiscalité =====================
    {
      id: 4,
      title: "Fiscalité",
      pic: PicFiscalite,
      groups: [
        {
          anchorId: "synr-7",
          label: "Analyse de la fiscalité",
          cards: [
            {
              key: "Impôt sur la fortune immobilière (IFI)",
              pi: 20,
              prio: "moy",
              cert: { cls: "c-moy", label: "Confiance modérée · 78 %" },
              icon: IcoShieldHouseTax,
              title: "Impôt sur la fortune immobilière : un seuil de déclenchement proche",
              constat: [
                <>
                  Au 1<sup>er</sup> janvier 2026, le patrimoine net taxable à l’IFI atteint{" "}
                  <strong>{v("ifi_assiette")}</strong> (incluant un appartement situé à l’étranger pour {v("ifi_appart_etranger")}).
                </>,
                <>
                  Cette situation s’explique par l’absence de dettes sur la totalité du parc immobilier
                  personnel.
                </>,
                <>
                  Le local professionnel (détenu en SCI) est actuellement exonéré, mais son
                  amortissement et surtout la cessation d’activité future réintégreront cet actif
                  (environ {v("ifi_local_pro")}) dans l’assiette.
                </>,
              ],
              rio: {
                r: "Le foyer devient officiellement redevable de l’IFI dès 2026. La non-imposition actuelle ne repose que sur la non-déclaration de l’appartement étranger : s’il venait à être identifié, le couple serait redevable de l’IFI, avec intérêts de retard et pénalités.",
                o: "Anticiper permet d’organiser l’assiette : recours à l’endettement déductible, démembrement de propriété ou donations réduisent légalement la base taxable.",
                opt: "Structurer un passif déductible et anticiper la réintégration du bien professionnel pour contenir l’assiette.",
              },
              impact: (
                <>
                  L’absence de passif déductible rend l’assiette perméable à toute hausse des prix de
                  l’immobilier. À l’arrêt de l’activité, le patrimoine taxable dépassera{" "}
                  <strong>{v("ifi_assiette_future")}</strong>, plaçant le foyer dans une tranche d’IFI supérieure sans passif
                  pour contrebalancer.
                </>
              ),
              justif: {
                text: "Composition du patrimoine immobilier et règles de l’impôt sur la fortune immobilière.",
              },
              foot: (
                <>
                  <b>Préconisation :</b> régulariser la situation et structurer l’assiette IFI (partie
                  « Préconisations »).
                </>
              ),
            },
            {
              key: "Bien détenu à l’étranger – mise en conformité",
              pi: 21,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 76 %" },
              icon: IcoShieldExclB,
              title: "Bien détenu à l’étranger : un risque de redressement à neutraliser",
              constat: [
                <>
                  Maintenir l’appartement étranger (estimé à {v("ifi_appart_etranger")}) hors des déclarations fiscales, et
                  organiser une mise en location sans déclarer les revenus perçus, exposerait le foyer à
                  une fragilité juridique.
                </>,
                <>
                  Ce risque serait démultiplié si les loyers étaient encaissés sur un compte bancaire
                  étranger lui-même non déclaré à l’administration française.
                </>,
              ],
              rio: {
                r: "Les flux financiers issus d’une location, identifiés via l’Échange automatique d’informations (EAI) entre l’État de situation du bien et la France, déclencheraient une alerte automatique auprès de l’administration.",
                o: "La régularisation spontanée (déclaration du bien, des comptes et des revenus) sécurise durablement la situation et écarte tout risque de redressement.",
                opt: "Déclarer l’appartement et les comptes étrangers, et régulariser les revenus locatifs auprès de l’administration française.",
              },
              impact:
                "Un compte étranger non déclaré expose à une amende de 1 500 € par an, à une taxation d’office des revenus locatifs majorée d’intérêts et de pénalités pouvant atteindre 40 %, voire 80 % en cas de manœuvres frauduleuses. Pour les avoirs non déclarés à l’étranger, le délai de reprise de l’administration passe de 3 à 10 ans.",
              justif: {
                text: "Règles de déclaration des biens et comptes détenus à l’étranger et dispositif d’échange automatique d’informations.",
              },
              foot: (
                <>
                  <b>Préconisation :</b> régulariser sans délai la déclaration de l’appartement et des
                  comptes étrangers (partie « Préconisations »).
                </>
              ),
            },
          ],
        },
      ],
    },
    // ===================== Thème 5 — Sociétés =====================
    {
      id: 5,
      title: "Sociétés",
      pic: PicSocietes,
      groups: [
        {
          anchorId: "synr-8",
          label: "La SCI",
          cards: [
            {
              key: "Gouvernance et transmission",
              pi: 22,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 80 %" },
              icon: IcoShieldBalance,
              title: "Gouvernance et transmission : une paralysie potentielle de la structure",
              constat: [
                <>Le capital est détenu à parts égales (50/50).</>,
                <>
                  Les statuts exigent une majorité de plus de 50 % pour les décisions ordinaires (AGO)
                  et de 66,6 % pour les décisions extraordinaires (AGE).
                </>,
                <>Les descendants entrent dans la société sans agrément.</>,
                <>
                  Les testaments prévoient un legs au profit du conjoint survivant de 1/4 en pleine
                  propriété et 3/4 en usufruit.
                </>,
              ],
              rio: {
                r: (
                  <>
                    En cas de désaccord entre les deux époux, aucune décision ne peut être validée ; un
                    blocage persistant pourrait paralyser le fonctionnement de la société et ouvrir la
                    voie à une dissolution judiciaire. Au premier décès, l’application du testament
                    donnerait aux enfants la nue-propriété de {v("soc_np_enfants_part", "percent")} des parts (3/4 de la moitié du défunt),
                    avec un droit de vote en AGE conférant une minorité de blocage automatique.
                  </>
                ),
                o: "Un pacte d’associés, une clause d’agrément et une révision des dispositions testamentaires permettent de sécuriser la gouvernance et la transmission.",
                opt: "Insérer une clause d’agrément, adapter les règles de majorité et de gérance, et réviser les legs pour préserver le contrôle du conjoint survivant.",
              },
              impact: (
                <>
                  Le conjoint survivant ne disposerait que de <strong>{v("soc_voix_survivant", "percent")}</strong> des voix ({v("soc_voix_origine", "percent")}{" "}
                  d’origine + {v("soc_voix_herite", "percent")} hérités en pleine propriété), en deçà des deux tiers (66,67 %) requis
                  pour modifier les statuts ou céder l’actif.
                </>
              ),
              justif: { text: "Statuts de la SCI, dispositions testamentaires et répartition du capital." },
              foot: (
                <>
                  <b>Préconisation :</b> mettre en place un pacte d’associés et réviser les dispositions
                  testamentaires (partie « Préconisations »).
                </>
              ),
            },
            {
              key: "Modalités de cession des parts sociales",
              pi: 23,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 80 %" },
              icon: IcoShieldLines,
              title:
                "Cession des parts sous seing privé : risque de fraude et lourdeur du recouvrement",
              constat: [
                <>
                  Les statuts de la SCI prévoient que les parts sociales peuvent être cédées sans
                  recourir strictement à un acte notarié.
                </>,
                <>
                  Cette modalité sous seing privé est souvent privilégiée pour sa souplesse apparente
                  lors des mouvements de capital.
                </>,
              ],
              rio: {
                r: "L’absence d’acte notarié expose la société à un risque accru de fraude (usurpation d’identité d’un cédant ou d’un cessionnaire). L’acte sous seing privé n’étant pas un titre exécutoire, tout litige ou défaut de paiement impose d’obtenir au préalable un jugement définitif (procédure au fond souvent longue) avant de pouvoir agir.",
                o: "Le recours à l’acte authentique confère la force exécutoire, permet d’agir en référé et facilite la reconnaissance du droit par le juge.",
                opt: "Prévoir, statutairement ou par pacte, le recours à l’acte notarié pour les cessions de parts.",
              },
              impact:
                "Sans force exécutoire, le créancier ne peut diligenter de saisies immédiates sur le patrimoine du débiteur défaillant ; l’acte notarié permet au contraire d’obtenir rapidement une provision ou l’exécution forcée des engagements.",
              justif: { text: "Clauses statutaires relatives à la cession des parts sociales." },
              foot: (
                <>
                  <b>Préconisation :</b> privilégier l’acte authentique pour les cessions de parts
                  (partie « Préconisations »).
                </>
              ),
            },
            {
              key: "Protection sociale — SCI",
              pi: 24,
              prio: "moy",
              cert: { cls: "c-moy", label: "Confiance modérée · 80 %" },
              icon: IcoShieldPlus,
              title: "Une protection sociale non portée par la structure",
              constat: [
                <>La gérance n’est pas rémunérée et la SCI ne supporte aucune charge sociale.</>,
                <>Aucune couverture santé, prévoyance ou retraite n’est constituée via la société.</>,
              ],
              rio: {
                r: "En cas d’arrêt de travail, d’invalidité ou de décès, la structure n’ouvre aucun droit ; la couverture du couple dépend entièrement des contrats personnels et des entreprises individuelles.",
                o: "La protection est assurée par les entreprises individuelles et des contrats personnels ; un audit permet de vérifier l’absence de trou de garantie.",
                opt: "Vérifier l’adéquation des garanties portées par les entreprises individuelles et compléter si nécessaire par une prévoyance dédiée.",
              },
              impact:
                "Exposition du foyer en cas d’aléa non couvert ; la SCI ne constitue pas un outil de protection sociale.",
              justif: { text: "Statut de la gérance et absence de charges sociales dans la structure." },
              foot: (
                <>
                  <b>Préconisation :</b> auditer et compléter la couverture sociale du couple (partie
                  « Préconisations »).
                </>
              ),
            },
          ],
        },
        {
          anchorId: "synr-9",
          label: "Entreprise individuelle de Monsieur",
          cards: [
            {
              key: "Protection sociale et retraite — Monsieur",
              pi: 25,
              prio: "moy",
              cert: { cls: "c-moy", label: "Confiance modérée · 82 %" },
              icon: IcoShieldPlus,
              title: "Protection sociale et retraite : une dépendance au régime obligatoire",
              constat: [
                <>
                  La couverture santé et prévoyance relève de la loi Madelin et du régime des praticiens
                  et auxiliaires médicaux.
                </>,
                <>
                  La retraite repose sur le régime obligatoire CARCDSF (base, complémentaire, prestation
                  complémentaire de vieillesse), par points.
                </>,
              ],
              rio: {
                r: "La forte dépendance au régime obligatoire et l’absence de capitalisation complémentaire exposent à une chute du taux de remplacement à la retraite ; les prestations Madelin versées en rente seront imposables.",
                o: "La mise en place d’une épargne retraite et d’une prévoyance complémentaire sécurise le niveau de vie futur.",
                opt: "Constituer une épargne retraite dédiée et compléter les garanties de prévoyance.",
              },
              impact: "Sans capitalisation, baisse significative du niveau de vie au départ à la retraite.",
              justif: { text: "Régime de retraite des chirurgiens-dentistes et fonctionnement par points." },
              foot: (
                <>
                  <b>Préconisation :</b> mettre en place une épargne retraite complémentaire (partie
                  « Préconisations »).
                </>
              ),
            },
            {
              key: "Pilotage de la rémunération — Monsieur",
              pi: 26,
              prio: "faible",
              cert: { cls: "c-moy", label: "Confiance modérée · 82 %" },
              icon: IcoShieldEuroG,
              title: "Un déséquilibre entre consommation immédiate et capitalisation",
              constat: [
                <>Le statut de l’Entreprise Individuelle interdit tout arbitrage entre rémunération et dividendes.</>,
                <>La stratégie actuelle privilégie la consommation immédiate de la richesse.</>,
              ],
              rio: {
                r: "L’impôt porte sur 100 % du profit, même si une partie était laissée dans l’entreprise pour investir ; la capitalisation patrimoniale pérenne est entravée et la dépendance à la retraite demeure élevée.",
                o: "Une structure à l’impôt sur les sociétés ouvrirait l’arbitrage rémunération / dividendes et une capitalisation pilotée.",
                opt: "Piloter la rémunération via une structure à l’IS et orienter l’excédent vers la capitalisation.",
              },
              impact: (
                <>En l’état, le prélèvement représente {v("eim_prelevement_pct", "percent")} du bénéfice, sur des revenus déjà lourdement taxés.</>
              ),
              justif: { text: "Transparence fiscale du régime de l’Entreprise Individuelle." },
              foot: (
                <>
                  <b>Préconisation :</b> étudier une structuration à l’IS pour piloter la rémunération
                  (partie « Préconisations »).
                </>
              ),
            },
            {
              key: "Trésorerie excédentaire — Monsieur",
              pi: 27,
              prio: "faible",
              cert: { cls: "c-forte", label: "Confiance forte · 85 %" },
              icon: IcoShieldEuroCircle,
              title: "Une trésorerie excédentaire statique et non rémunérée",
              constat: [
                <>Les liquidités sont laissées intégralement sur le compte courant, sans rémunération.</>,
                <>Le besoin en fonds de roulement négatif génère une ressource de trésorerie constante.</>,
              ],
              rio: {
                r: "La non-rémunération des liquidités face à l’inflation constitue une perte de valeur réelle pour le patrimoine du foyer.",
                o: "Le placement du matelas de sécurité sur un support monétaire liquide couvrirait au moins les frais bancaires annuels.",
                opt: "Placer la trésorerie de précaution et, le cas échéant, extraire le surplus vers des supports de placement personnels.",
              },
              impact:
                "Le solde correspondant presque exactement au fonds de sécurité, la marge d’extraction est limitée ; le gain porte d’abord sur la rémunération du matelas de sécurité.",
              justif: { text: "Soldes bancaires professionnels et niveau du fonds de sécurité." },
              foot: (
                <>
                  <b>Préconisation :</b> placer la trésorerie de précaution et mobiliser le surplus
                  (partie « Préconisations »).
                </>
              ),
            },
            {
              key: "Structuration fiscale (EI au régime BNC) — Monsieur",
              pi: 28,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 80 %" },
              icon: IcoShieldDoc,
              title: "Structuration EI au régime BNC : pression fiscale et sociale maximale",
              constat: [
                <>Monsieur exerce en Entreprise Individuelle à l’impôt sur le revenu.</>,
                <>
                  L’intégralité du bénéfice net ({v("eim_benefice_net")}, dernier exercice) est soumise au barème
                  progressif de l’impôt sur le revenu (TMI à 41 %) et aux cotisations sociales (URSSAF /
                  CARCDSF).
                </>,
              ],
              rio: {
                r: "L’absence de personnalité morale (contrairement à une SELARL ou une SELAS à l’IS) interdit tout arbitrage entre rémunération et dividendes. Chaque euro de bénéfice est lourdement ponctionné, qu’il soit consommé ou laissé en trésorerie.",
                o: "Le passage à une structure à l’IS (SELARL, SELAS) ouvrirait l’arbitrage rémunération / dividendes et une capitalisation à taux réduit (IS à 25 %).",
                opt: "Étudier l’apport de l’activité à une société d’exercice à l’IS et l’encapsulation de la trésorerie excédentaire.",
              },
              impact: (
                <>
                  En l’état, aucune stratégie de capitalisation à taux réduit n’est possible au sein de
                  l’outil professionnel ; le prélèvement représente {v("eim_prelevement_pct", "percent")} du bénéfice.
                </>
              ),
              justif: { text: "Régime fiscal et social de l’Entreprise Individuelle (BNC)." },
              foot: (
                <>
                  <b>Préconisation :</b> étudier une structuration à l’impôt sur les sociétés (partie
                  « Préconisations »).
                </>
              ),
            },
          ],
        },
        {
          anchorId: "synr-10",
          label: "Entreprise individuelle de Madame",
          cards: [
            {
              key: "Protection sociale et retraite — Madame",
              pi: 29,
              prio: "moy",
              cert: { cls: "c-moy", label: "Confiance modérée · 82 %" },
              icon: IcoShieldPlus,
              title: "Protection sociale et retraite : une dépendance au régime obligatoire",
              constat: [
                <>
                  La couverture santé et prévoyance relève de la loi Madelin et du régime des praticiens
                  et auxiliaires médicaux.
                </>,
                <>
                  La retraite repose sur le régime obligatoire CARCDSF (base, complémentaire, prestation
                  complémentaire de vieillesse), par points.
                </>,
              ],
              rio: {
                r: "La forte dépendance au régime obligatoire et l’absence de capitalisation complémentaire exposent à une chute du taux de remplacement à la retraite ; les prestations Madelin versées en rente seront imposables.",
                o: "La mise en place d’une épargne retraite et d’une prévoyance complémentaire sécurise le niveau de vie futur.",
                opt: "Constituer une épargne retraite dédiée et compléter les garanties de prévoyance.",
              },
              impact: "Sans capitalisation, baisse significative du niveau de vie au départ à la retraite.",
              justif: { text: "Régime de retraite des chirurgiens-dentistes et fonctionnement par points." },
              foot: (
                <>
                  <b>Préconisation :</b> mettre en place une épargne retraite complémentaire (partie
                  « Préconisations »).
                </>
              ),
            },
            {
              key: "Pilotage de la rémunération — Madame",
              pi: 30,
              prio: "faible",
              cert: { cls: "c-moy", label: "Confiance modérée · 82 %" },
              icon: IcoShieldEuroG,
              title: "Un déséquilibre entre consommation immédiate et capitalisation",
              constat: [
                <>Le statut de l’Entreprise Individuelle interdit tout arbitrage entre rémunération et dividendes.</>,
                <>La stratégie actuelle privilégie la consommation immédiate de la richesse.</>,
              ],
              rio: {
                r: "L’impôt porte sur 100 % du profit, même si une partie était laissée dans l’entreprise pour investir ; la capitalisation patrimoniale pérenne est entravée et la dépendance à la retraite demeure élevée.",
                o: "Une structure à l’impôt sur les sociétés ouvrirait l’arbitrage rémunération / dividendes et une capitalisation pilotée.",
                opt: "Piloter la rémunération via une structure à l’IS et orienter l’excédent vers la capitalisation.",
              },
              impact: (
                <>En l’état, le prélèvement représente {v("eif_prelevement_pct", "percent")} du bénéfice, sur des revenus déjà lourdement taxés.</>
              ),
              justif: { text: "Transparence fiscale du régime de l’Entreprise Individuelle." },
              foot: (
                <>
                  <b>Préconisation :</b> étudier une structuration à l’IS pour piloter la rémunération
                  (partie « Préconisations »).
                </>
              ),
            },
            {
              key: "Trésorerie excédentaire — Madame",
              pi: 31,
              prio: "faible",
              cert: { cls: "c-forte", label: "Confiance forte · 85 %" },
              icon: IcoShieldEuroCircle,
              title: "Une trésorerie excédentaire statique et non rémunérée",
              constat: [
                <>Les liquidités sont laissées intégralement sur le compte courant, sans rémunération.</>,
                <>Le besoin en fonds de roulement négatif génère une ressource de trésorerie constante.</>,
              ],
              rio: {
                r: "La non-rémunération des liquidités face à l’inflation constitue une perte de valeur réelle pour le patrimoine du foyer.",
                o: "Le placement du matelas de sécurité sur un support monétaire liquide couvrirait au moins les frais bancaires annuels.",
                opt: "Placer la trésorerie de précaution et, le cas échéant, extraire le surplus vers des supports de placement personnels.",
              },
              impact: (
                <>
                  Le surplus de {v("eif_surplus_tresorerie")}, déjà fiscalisé, peut être extrait sans frottement vers des supports
                  de placement personnels.
                </>
              ),
              justif: { text: "Soldes bancaires professionnels et niveau du fonds de sécurité." },
              foot: (
                <>
                  <b>Préconisation :</b> placer la trésorerie de précaution et mobiliser le surplus
                  (partie « Préconisations »).
                </>
              ),
            },
            {
              key: "Structuration fiscale (EI au régime BNC) — Madame",
              pi: 32,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 80 %" },
              icon: IcoShieldDoc,
              title: "Structuration EI au régime BNC : pression fiscale et sociale maximale",
              constat: [
                <>Madame exerce en Entreprise Individuelle à l’impôt sur le revenu.</>,
                <>
                  L’intégralité du bénéfice net ({v("eif_benefice_net")}, dernier exercice) est soumise au barème
                  progressif de l’impôt sur le revenu (TMI à 41 % ou 45 %) et aux cotisations sociales
                  (URSSAF / CARCDSF).
                </>,
              ],
              rio: {
                r: "L’absence de personnalité morale (contrairement à une SELARL ou une SELAS à l’IS) interdit tout arbitrage entre rémunération et dividendes. Chaque euro de bénéfice est lourdement ponctionné, qu’il soit consommé ou laissé en trésorerie.",
                o: "Le passage à une structure à l’IS (SELARL, SELAS) ouvrirait l’arbitrage rémunération / dividendes et une capitalisation à taux réduit (IS à 25 %).",
                opt: "Étudier l’apport de l’activité à une société d’exercice à l’IS et l’encapsulation de la trésorerie excédentaire.",
              },
              impact: (
                <>
                  En l’état, aucune stratégie de capitalisation à taux réduit n’est possible au sein de
                  l’outil professionnel ; le prélèvement représente {v("eif_prelevement_pct", "percent")} du bénéfice.
                </>
              ),
              justif: { text: "Régime fiscal et social de l’Entreprise Individuelle (BNC)." },
              foot: (
                <>
                  <b>Préconisation :</b> étudier une structuration à l’impôt sur les sociétés (partie
                  « Préconisations »).
                </>
              ),
            },
          ],
        },
        {
          anchorId: "synr-11",
          label: "Synthèse de l’ensemble des sociétés",
          cards: [
            {
              key: "Saturation fiscale des activités libérales",
              pi: 33,
              prio: "haute",
              cert: { cls: "c-forte", label: "Confiance forte · 86 %" },
              icon: IcoShieldEuroG,
              title: "Saturation fiscale et sociale des deux activités libérales",
              constat: [
                <>Les deux activités sont exercées en Entreprise Individuelle au régime BNC.</>,
                <>
                  Les bénéfices cumulés ({v("glob_benefices_cumules")}, dernier exercice) supportent l’impôt sur le revenu (TMI
                  41 %) et les cotisations sociales.
                </>,
              ],
              rio: {
                r: "Aucun arbitrage ni capitalisation à taux réduit n’est possible ; la création de richesse est lourdement ponctionnée, qu’elle soit consommée ou épargnée.",
                o: "L’encapsulation des activités dans une ou plusieurs structures à l’IS ouvre le pilotage et la capitalisation.",
                opt: "Créer une ou plusieurs sociétés d’exercice à l’impôt sur les sociétés (SELARL, SELAS).",
              },
              impact: (
                <>
                  Prélèvements de {v("eim_prelevement_pct", "percent")} (Monsieur) et {v("eif_prelevement_pct", "percent")} (Madame) du bénéfice, sans levier de
                  capitalisation à taux réduit.
                </>
              ),
              justif: { text: "Transparence fiscale du régime BNC." },
              foot: (
                <>
                  <b>Préconisation :</b> étudier la structuration des activités à l’IS (partie
                  « Préconisations »).
                </>
              ),
            },
            {
              key: "Fragilité juridique et successorale de la SCI",
              pi: 34,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 80 %" },
              icon: IcoShieldBalanceBroken,
              title: "Fragilité juridique et successorale de la SCI",
              constat: [
                <>La SCI est détenue à parts égales (50/50) par les conjoints.</>,
                <>
                  Les statuts et les testaments confèrent aux enfants une minorité de blocage au premier
                  décès.
                </>,
              ],
              rio: {
                r: "Paralysie potentielle de la gouvernance et perte de contrôle du conjoint survivant ; cession des parts sous seing privé exposée à la fraude.",
                o: "Un pacte d’associés, une clause d’agrément et la révision des testaments sécurisent la structure.",
                opt: "Réviser les statuts et les dispositions testamentaires, et prévoir l’acte authentique pour les cessions.",
              },
              impact: (
                <>
                  Conjoint survivant à {v("soc_voix_survivant", "percent")} des voix, en deçà des deux tiers requis pour
                  décider seul.
                </>
              ),
              justif: { text: "Statuts de la SCI et dispositions testamentaires." },
              foot: (
                <>
                  <b>Préconisation :</b> sécuriser la gouvernance et la transmission de la SCI (partie
                  « Préconisations »).
                </>
              ),
            },
            {
              key: "Trésoreries professionnelles dormantes",
              pi: 35,
              prio: "moy",
              cert: { cls: "c-forte", label: "Confiance forte · 85 %" },
              icon: IcoShieldEuroCircle,
              title: "Des trésoreries professionnelles dormantes",
              constat: [
                <>Les trésoreries des deux entreprises individuelles sont excédentaires et non rémunérées.</>,
                <>Une partie a déjà supporté l’impôt sur le revenu.</>,
              ],
              rio: {
                r: "L’érosion monétaire réduit la valeur réelle de ces liquidités laissées sur les comptes courants.",
                o: "Le placement et, le cas échéant, l’extraction du surplus améliorent la performance du patrimoine.",
                opt: "Mobiliser les trésoreries vers des supports de placement adaptés.",
              },
              impact: (
                <>Surplus extractible ({v("eif_surplus_tresorerie")} chez Madame) et rémunération possible du matelas de sécurité.</>
              ),
              justif: { text: "Soldes bancaires professionnels et niveaux de trésorerie." },
              foot: (
                <>
                  <b>Préconisation :</b> mobiliser et placer les trésoreries excédentaires (partie
                  « Préconisations »).
                </>
              ),
            },
          ],
        },
      ],
    },
    // ===================== Thème 6 — Assurances =====================
    {
      id: 6,
      title: "Assurances",
      pic: PicAssurances,
      groups: [
        {
          anchorId: "synr-12",
          label: "Assurance des personnes",
          cards: [
            {
              key: "Prévoyance décès et contrat Madelin",
              pi: 36,
              prio: "moy",
              cert: { cls: "c-moy", label: "Confiance modérée · 82 %" },
              icon: IcoShieldExclC,
              title: "Capital décès obligatoirement servi sous forme de rente viagère",
              constat: [
                <>
                  Monsieur et Madame sont titulaires de contrats de prévoyance individuelle Madelin
                  auprès de la compagnie.
                </>,
                <>Les capitaux garantis s’élèvent à {v("assprev_capital_monsieur")} pour Monsieur et {v("assprev_capital_madame")} pour Madame.</>,
                <>La sortie des prestations décès est prévue sous forme de rente viagère.</>,
              ],
              rio: {
                r: (
                  <>
                    Le conjoint survivant se verrait privé d’un capital immédiat au profit d’une rente
                    dérisoire d’environ {v("assprev_rente_annuelle")}, et le foyer perdrait l’exonération fiscale du capital décès
                    (loi TEPA) au profit d’une rente imposable à l’impôt sur le revenu.
                  </>
                ),
                o: "Une prévoyance classique (hors Madelin) permettrait au conjoint marié de percevoir un capital totalement exonéré au titre de la loi TEPA.",
                opt: "Compléter ou substituer une prévoyance décès hors cadre Madelin afin de rétablir une sortie en capital.",
              },
              impact: (
                <>Pour un capital de {v("assprev_capital_illustration")}, la rente servie au survivant ne serait que d’environ {v("assprev_rente_annuelle")}.</>
              ),
              justif: {
                text: "Conditions générales des contrats de prévoyance Madelin et cadre fiscal applicable.",
              },
              foot: (
                <>
                  <b>Préconisation :</b> rétablir une sortie en capital pour la protection du conjoint
                  (partie « Préconisations »).
                </>
              ),
            },
            {
              key: "Tarification évolutive de la prévoyance",
              pi: 37,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 82 %" },
              icon: IcoShieldEuroCircle,
              title: "Tarification à « âge atteint » : un impact budgétaire exponentiel",
              constat: [
                <>
                  Les contrats de prévoyance de Monsieur et Madame sont indexés sur une tarification dite
                  à « âge atteint ».
                </>,
                <>
                  Les cotisations augmentent mécaniquement chaque année au 1er janvier selon l’âge réel
                  de chaque assuré.
                </>,
                <>
                  Le foyer entre dans la phase de carrière où les coefficients tarifaires connaissent
                  leur plus forte accélération.
                </>,
              ],
              rio: {
                r: "L’alourdissement automatique des primes dégraderait la rentabilité des deux cabinets à l’approche de la retraite, avec un coût de protection global disproportionné par rapport aux bénéfices professionnels générés.",
                o: "Un arbitrage vers des contrats à « cotisation nivelée » permettrait de figer le coût de l’assurance pour Monsieur et Madame.",
                opt: "Mettre les garanties en concurrence et privilégier une cotisation nivelée pour stabiliser les flux jusqu’à la cessation d’activité.",
              },
              impact:
                "Le coût de protection croît chaque année et atteint son accélération maximale dans la dernière décennie d’activité.",
              justif: { text: "Conditions tarifaires des contrats de prévoyance (clause « âge atteint »)." },
              foot: (
                <>
                  <b>Préconisation :</b> arbitrer vers une cotisation nivelée (partie « Préconisations »).
                </>
              ),
            },
            {
              key: "Clause bénéficiaire des assurances-vie",
              pi: 38,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 80 %" },
              icon: IcoShieldLines,
              title:
                "Clauses bénéficiaires standard : risque en cas de divorce et absence d’optimisation",
              constat: [
                <>
                  La rédaction actuelle des clauses bénéficiaires est standard et ne prévoit aucun
                  démembrement de propriété.
                </>,
                <>
                  Aucune mention d’exclusion relative à une éventuelle instance de divorce n’est
                  intégrée aux contrats.
                </>,
              ],
              rio: {
                r: "En cas de divorce, le capital risquerait d’être versé à un conjoint dont le lien affectif serait déjà rompu au jour du décès.",
                o: "Une clause démembrée (usufruit au conjoint, nue-propriété aux enfants) ouvrirait des opportunités de transmission optimisée en faveur des enfants.",
                opt: "Réécrire les clauses bénéficiaires avec démembrement et clause d’exclusion en cas d’instance de divorce.",
              },
              impact:
                "L’absence de démembrement limite les opportunités de transmission optimisée en faveur des enfants.",
              justif: { text: "Clauses bénéficiaires des contrats d’assurance-vie du couple." },
              foot: (
                <>
                  <b>Préconisation :</b> réécrire les clauses bénéficiaires (partie « Préconisations »).
                </>
              ),
            },
          ],
        },
        {
          anchorId: "synr-13",
          label: "Assurance des biens",
          cards: [
            {
              key: "Absence d’assurance des parkings",
              pi: 39,
              prio: "moy",
              cert: { cls: "c-forte", label: "Confiance forte · 86 %" },
              icon: IcoShieldRoof,
              title: "Parkings en nom propre : des risques de responsabilité non couverts",
              constat: [
                <>Le couple détient des parkings en nom propre.</>,
                <>Ces emplacements ne bénéficient d’aucune assurance en responsabilité civile.</>,
              ],
              rio: {
                r: "La responsabilité civile du couple pourrait être engagée pour des dommages causés à des tiers (chute d’un piéton, dégradation d’un véhicule voisin). Les frais de procédure et d’indemnisation seraient prélevés sur le patrimoine personnel, sans protection juridique pour contester une mise en cause.",
                o: "La souscription d’une assurance en responsabilité civile permettrait de déléguer ces risques à un assureur.",
                opt: "Souscrire une assurance en responsabilité civile dédiée pour chaque emplacement.",
              },
              impact:
                "Le coût annuel d’une telle garantie est modique, de l’ordre de 20 à 30 € par an et par lot.",
              justif: { text: "Inventaire des biens immobiliers et contrats d’assurance en place." },
              foot: (
                <>
                  <b>Préconisation :</b> souscrire une responsabilité civile sur les parkings (partie
                  « Préconisations »).
                </>
              ),
            },
            {
              key: "Mauvaise désignation de l’assuré",
              pi: 40,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 82 %" },
              icon: IcoShieldExclC,
              title: "Désignation erronée de l’assuré : un risque de nullité du contrat",
              constat: [
                <>
                  Le contrat d’assurance est libellé au nom de « {assure} », une entité physique
                  juridiquement inexistante.
                </>,
                <>
                  L’assureur identifie l’assuré comme une personne physique, alors que le bien appartient
                  à une personne morale (la SCI).
                </>,
                <>
                  La domiciliation du siège de la société est identique à celle de la résidence
                  principale du couple.
                </>,
              ],
              rio: {
                r: "Cette interprétation erronée de la personnalité juridique pourrait être invoquée pour frapper le contrat de nullité lors d’un sinistre, avec un refus d’indemnisation au motif que la personne désignée n’est pas le propriétaire légal du bien ; la SCI risquerait d’être considérée comme non assurée malgré le paiement régulier des primes.",
                o: "Une rectification de la dénomination permettrait de sécuriser l’actif immobilier en faisant coïncider l’identité de l’assuré avec celle du propriétaire réel.",
                opt: "Faire corriger le libellé du contrat au nom de la société propriétaire.",
              },
              impact:
                "Un sinistre non indemnisé exposerait le foyer à la charge intégrale du dommage, malgré des primes régulièrement acquittées.",
              justif: { text: "Conditions particulières du contrat d’assurance et statuts de la SCI propriétaire." },
              foot: (
                <>
                  <b>Préconisation :</b> régulariser la désignation de l’assuré (partie « Préconisations »).
                </>
              ),
            },
          ],
        },
        {
          anchorId: "synr-14",
          label: "Assurance des actifs professionnels",
          cards: [
            {
              key: "Sous-évaluation du matériel professionnel",
              pi: 41,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 80 %" },
              icon: IcoShieldEuroCircle,
              title: "Capitaux déclarés inférieurs à la valeur réelle : la règle proportionnelle",
              constat: [
                <>
                  Le capital mobilier déclaré au contrat multirisque s’élève à {v("asspro_capital_declare")} pour un parc
                  d’équipements dont la valeur de remplacement est estimée à {v("asspro_valeur_remplacement")}.
                </>,
                <>
                  Le contrat ne comporte pas de clause de renonciation à la règle proportionnelle de
                  capitaux.
                </>,
              ],
              rio: {
                r: "En cas de sinistre partiel, l’assureur appliquerait la règle proportionnelle et réduirait l’indemnité dans la proportion de la sous-évaluation, laissant un reste à charge significatif sur le foyer.",
                o: "Une réévaluation des capitaux et l’ajout d’une clause de renonciation à la règle proportionnelle sécuriseraient l’indemnisation.",
                opt: "Faire expertiser le matériel, actualiser les capitaux déclarés et négocier la renonciation à la proportionnelle.",
              },
              impact: (
                <>Pour un sinistre, l’indemnité pourrait être réduite d’environ {v("asspro_reduction_indemnite")} au titre de la sous-assurance.</>
              ),
              justif: {
                text: "Conditions particulières du contrat multirisque et inventaire du matériel d’exploitation.",
              },
              foot: (
                <>
                  <b>Préconisation :</b> réévaluer les capitaux du matériel professionnel (partie
                  « Préconisations »).
                </>
              ),
            },
            {
              key: "Absence de garantie des pertes d’exploitation",
              pi: 42,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 78 %" },
              icon: IcoShieldExclC,
              title: "Interruption d’activité : des charges fixes sans recettes",
              constat: [
                <>
                  Les contrats en place ne comportent pas de garantie de pertes d’exploitation ni de
                  frais généraux permanents.
                </>,
                <>Le revenu du foyer repose à titre principal sur l’activité des deux cabinets.</>,
              ],
              rio: {
                r: "À la suite d’un sinistre rendant le cabinet inexploitable, le foyer continuerait de supporter les charges fixes (loyers internes, salaires, échéances) sans recettes, jusqu’à la reprise de l’activité.",
                o: "Une garantie de pertes d’exploitation, calibrée sur la marge et les frais généraux, maintiendrait l’équilibre financier pendant la période de reconstitution.",
                opt: "Souscrire une garantie de pertes d’exploitation adossée à la multirisque du cabinet.",
              },
              impact:
                "Plusieurs mois de charges fixes resteraient à la charge du foyer en l’absence de cette garantie.",
              justif: { text: "Conditions des contrats professionnels et structure des revenus du foyer." },
              foot: (
                <>
                  <b>Préconisation :</b> souscrire une garantie de pertes d’exploitation (partie
                  « Préconisations »).
                </>
              ),
            },
            {
              key: "Absence de couverture des risques numériques",
              pi: 43,
              prio: "moy",
              cert: { cls: "c-moy", label: "Confiance modérée · 75 %" },
              icon: IcoShieldExclC,
              title: "Données de santé : une exposition non assurée",
              constat: [
                <>Aucune garantie des risques numériques n’est souscrite pour les deux cabinets.</>,
                <>Les données de santé des patients sont traitées et conservées par voie numérique.</>,
              ],
              rio: {
                r: "Une atteinte aux systèmes d’information (rançongiciel, fuite de données) entraînerait des coûts de remédiation, une interruption d’activité et une exposition aux obligations de notification.",
                o: "Une garantie des risques numériques couvrirait les frais de restauration, la perte d’exploitation consécutive et l’accompagnement réglementaire.",
                opt: "Étudier la souscription d’une garantie des risques numériques adaptée à une activité de santé.",
              },
              impact:
                "Le coût d’un incident (remédiation et interruption) peut représenter plusieurs dizaines de milliers d’euros.",
              justif: { text: "Inventaire des contrats et nature des données traitées par le cabinet." },
              foot: (
                <>
                  <b>Préconisation :</b> étudier une garantie des risques numériques (partie
                  « Préconisations »).
                </>
              ),
            },
          ],
        },
        {
          anchorId: "synr-15",
          label: "Synthèse de l’analyse des assurances",
          cards: [
            {
              key: "Protection des personnes",
              pi: 44,
              prio: "faible",
              cert: { cls: "c-forte", label: "Confiance forte · 84 %" },
              icon: IcoShieldPlus,
              title: "Une protection des personnes solide mais à optimiser",
              constat: [
                <>Prévoyance Madelin adaptée à la profession, mais capital décès servi en rente viagère.</>,
                <>Tarification à l’âge atteint et clauses bénéficiaires standard.</>,
              ],
              rio: {
                r: "Le conjoint survivant percevrait une rente dérisoire et fiscalisée ; le coût de la prévoyance s’alourdit à l’approche de la retraite ; les clauses sont exposées en cas de divorce.",
                o: "Une prévoyance hors Madelin, une cotisation nivelée et des clauses démembrées sécuriseraient la transmission et le budget.",
                opt: "Compléter la couverture décès, mettre les garanties en concurrence et réécrire les clauses bénéficiaires.",
              },
              impact: (
                <>
                  Capital décès de {v("globass_capital_deces")} converti en une rente d’environ {v("globass_rente_mensuelle")} par mois ; couverture
                  invalidité de Madame plafonnée à environ {v("globass_invalidite_madame")}.
                </>
              ),
              justif: { text: "Contrats de prévoyance, certificats d’adhésion et clauses bénéficiaires du couple." },
              foot: (
                <>
                  <b>Préconisation :</b> renforcer la protection des personnes (partie « Préconisations »).
                </>
              ),
            },
            {
              key: "Assurance des biens",
              pi: 45,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 82 %" },
              icon: IcoShieldExclC,
              title: "Une assurance des biens à régulariser sans délai",
              constat: [
                <>Des parkings détenus en nom propre sans responsabilité civile.</>,
                <>
                  Un contrat libellé au nom d’une personne physique inexistante, alors que le bien
                  appartient à la SCI.
                </>,
              ],
              rio: {
                r: "Les frais d’un sinistre sur les parkings pèseraient sur le patrimoine personnel ; le contrat mal libellé pourrait être frappé de nullité et l’indemnisation refusée.",
                o: "Une responsabilité civile dédiée et la mise en cohérence du contrat avec le propriétaire réel sécuriseraient les actifs.",
                opt: "Souscrire une responsabilité civile sur les parkings et régulariser la dénomination de l’assuré.",
              },
              impact:
                "Coût d’une responsabilité civile de l’ordre de 20 à 30 € par an et par lot ; à défaut, exposition à la charge intégrale d’un sinistre non indemnisé.",
              justif: { text: "Inventaire des biens, conditions particulières des contrats et statuts de la SCI." },
              foot: (
                <>
                  <b>Préconisation :</b> régulariser l’assurance des biens (partie « Préconisations »).
                </>
              ),
            },
            {
              key: "Actifs professionnels",
              pi: 46,
              prio: "moy",
              cert: { cls: "c-moy", label: "Confiance modérée · 78 %" },
              icon: IcoShieldEuroCircle,
              title: "Un outil professionnel à mieux protéger",
              constat: [
                <>Responsabilités professionnelle et d’exploitation couvertes.</>,
                <>Matériel sous-évalué, pertes d’exploitation et risques numériques non couverts.</>,
              ],
              rio: {
                r: "Un sinistre matériel ou numérique réduirait l’indemnisation et interromprait l’activité, alors que le revenu du foyer dépend des deux cabinets.",
                o: "La réévaluation du matériel, une garantie de pertes d’exploitation et une garantie des risques numériques sécuriseraient l’outil de travail.",
                opt: "Actualiser les capitaux, souscrire les pertes d’exploitation et étudier une garantie des risques numériques.",
              },
              impact: (
                <>
                  Indemnité du matériel réduite d’environ {v("asspro_reduction_indemnite")} en cas de sous-assurance ; plusieurs mois
                  de charges fixes en cas d’arrêt non couvert.
                </>
              ),
              justif: {
                text: "Conditions du contrat multirisque, inventaire du matériel et structure des revenus du foyer.",
              },
              foot: (
                <>
                  <b>Préconisation :</b> renforcer la protection de l’outil professionnel (partie
                  « Préconisations »).
                </>
              ),
            },
          ],
        },
      ],
    },
    // ================= Thème 7 — Régime matrimonial =================
    {
      id: 7,
      title: "Régime matrimonial",
      pic: PicMatrimonial,
      groups: [
        {
          anchorId: "synr-16",
          label: "Régime matrimonial et gestion des biens",
          cards: [
            {
              key: "Autonomie patrimoniale",
              pi: 47,
              prio: "faible",
              cert: { cls: "c-forte", label: "Confiance forte · 88 %" },
              icon: IcoShieldRoof,
              title: "Autonomie patrimoniale de la séparation de biens",
              constat: [
                <>
                  Le régime de séparation de biens (articles 1536 à 1541 du Code civil) s’applique{" "}
                  {depuisMariage}.
                </>,
                <>Chaque époux administre, jouit et dispose librement de ses biens propres.</>,
              ],
              rio: {
                r: "Une gestion non documentée des biens peut compliquer la preuve de leur caractère propre.",
                o: "Le patrimoine de chaque époux reste protégé des difficultés de l’autre ; les revenus sont libres d’affectation, sous réserve de la contribution aux charges du mariage.",
                opt: "Maintenir une séparation effective des comptes et des actifs de chaque époux.",
              },
              impact: "Autonomie patrimoniale forte et gestion indépendante des biens propres.",
              justif: { text: "Articles 1536 à 1541 du Code civil." },
              foot: (
                <>
                  <b>Préconisation :</b> conserver une séparation effective des patrimoines.
                </>
              ),
            },
            {
              key: "Présomption d’indivision",
              pi: 48,
              prio: "moy",
              cert: { cls: "c-moy", label: "Confiance modérée · 78 %" },
              icon: IcoShieldExclC,
              title: "Présomption d’indivision des biens non justifiés",
              constat: [
                <>
                  À défaut de preuve du caractère propre, un bien est réputé indivis entre les époux
                  (article 1538, alinéa 3 du Code civil).
                </>,
                <>Les achats en cours de mariage sans preuve de propriété sont réputés indivis.</>,
              ],
              rio: {
                r: "Requalification possible en indivision des biens dont l’origine n’est pas établie ; les actes importants requièrent alors l’unanimité.",
                o: "La documentation de l’origine et du financement des biens écarte la présomption d’indivision.",
                opt: "Documenter l’origine et le financement de chaque acquisition.",
              },
              impact: "Indivision par moitié possible pour les biens non justifiés.",
              justif: { text: "Article 1538, alinéa 3 ; articles 815 et suivants du Code civil." },
              foot: (
                <>
                  <b>Préconisation :</b> conserver les justificatifs d’origine et de financement des
                  biens.
                </>
              ),
            },
          ],
        },
        {
          anchorId: "synr-17",
          label: "Responsabilité face aux dettes et séparation",
          cards: [
            {
              key: "Protection du patrimoine personnel",
              pi: 49,
              prio: "moy",
              cert: { cls: "c-forte", label: "Confiance forte · 88 %" },
              icon: IcoShieldEuroCircle,
              title: "Protection du patrimoine personnel face aux dettes",
              constat: [
                <>Chaque époux est seul responsable de ses dettes personnelles.</>,
                <>Les biens de l’autre ne peuvent être saisis à ce titre.</>,
              ],
              rio: {
                r: "Un engagement solidaire ou une caution réduit cette protection.",
                o: "Les créanciers de l’un ne peuvent atteindre le patrimoine de l’autre ; isolation des risques de chaque époux.",
                opt: "Éviter les engagements solidaires non nécessaires.",
              },
              impact: "Patrimoine personnel protégé des dettes du conjoint.",
              justif: { text: "Régime de séparation de biens." },
              foot: (
                <>
                  <b>Préconisation :</b> privilégier les engagements individuels.
                </>
              ),
            },
            {
              key: "Engagements solidaires",
              pi: 50,
              prio: "moy",
              cert: { cls: "c-moy", label: "Confiance modérée · 80 %" },
              icon: IcoShieldExclC,
              title: "Engagements solidaires et dépenses ménagères",
              constat: [
                <>
                  La responsabilité peut être partagée en cas d’engagement conjoint ou de caution, de
                  dépenses ménagères du régime primaire, ou de dette sur un bien indivis.
                </>,
              ],
              rio: {
                r: "Un engagement solidaire expose au paiement du tout ; les dépenses ménagères engagent les deux époux.",
                o: "Un engagement conjoint, non solidaire, limite l’exposition à la part de chacun.",
                opt: "Préférer les engagements conjoints aux engagements solidaires.",
              },
              impact: "Exposition potentielle des deux patrimoines en cas d’engagement solidaire.",
              justif: { text: "Régime primaire ; règles du gage des créanciers." },
              foot: (
                <>
                  <b>Préconisation :</b> encadrer les cautions et les engagements solidaires.
                </>
              ),
            },
          ],
        },
        {
          anchorId: "synr-18",
          label: "Aménagements du contrat de mariage",
          cards: [
            {
              key: "Clause de contribution au jour le jour",
              pi: 51,
              prio: "moy",
              cert: { cls: "c-forte", label: "Confiance forte · 88 %" },
              icon: IcoShieldLines,
              title: "Clause de contribution « au jour le jour » : une protection en cas de séparation",
              constat: [
                <>
                  Une clause d’exécution « au jour le jour » de la contribution aux charges du mariage
                  figure au contrat.
                </>,
                <>
                  Elle rend les époux irrecevables à contester leur part de contribution ultérieurement
                  (aménagement de l’article 214 du Code civil).
                </>,
              ],
              rio: {
                r: "Elle nécessite une vigilance particulière sur le paiement des dépenses courantes, afin d’éviter tout déséquilibre économique majeur non compensable.",
                o: "Elle est particulièrement protectrice en cas de séparation : un époux ne peut réclamer un remboursement au motif qu’il aurait payé plus que sa part durant la vie commune.",
                opt: "Maintenir un suivi des dépenses courantes pour préserver l’équilibre de la répartition.",
              },
              impact:
                "Équilibre dans la répartition des dépenses du foyer, sécurisé par une présomption de paiement libératoire.",
              justif: {
                text: "Contrat de mariage et clause d’exécution « au jour le jour » (article 214 du Code civil).",
              },
              foot: (
                <>
                  <b>Préconisation :</b> veiller à l’équilibre du paiement des dépenses courantes (partie
                  « Préconisations »).
                </>
              ),
            },
            {
              key: "Absence d’inventaire initial",
              pi: 52,
              prio: "haute",
              cert: { cls: "c-moy", label: "Confiance modérée · 80 %" },
              icon: IcoShieldExclC,
              title: "Absence d’inventaire initial : un risque de présomption 50/50",
              constat: [
                <>
                  Le contrat ayant été {signeEn} sans état descriptif, il pourrait être complexe de
                  prouver l’origine de certains biens ou liquidités détenus avant le mariage.
                </>,
              ],
              rio: {
                r: "En cas de dissolution du régime, la présomption de propriété par moitié s’appliquerait par défaut pour tout bien dont le titre de propriété n’aurait pas été clairement établi.",
                o: "L’établissement d’un état des biens propres détenus avant le mariage réduirait l’incertitude sur leur origine.",
                opt: "Constituer un inventaire des biens et liquidités propres antérieurs au mariage, avec les justificatifs disponibles.",
              },
              impact:
                "Présomption de propriété par moitié pour tout bien non justifié, lors de la liquidation du régime.",
              justif: {
                text: `Contrat de mariage ${contratMariageAnnee} sans état descriptif ; présomption d’indivision (article 1538, alinéa 3 du Code civil).`,
              },
              foot: (
                <>
                  <b>Préconisation :</b> constituer un inventaire des biens propres (partie
                  « Préconisations »).
                </>
              ),
            },
          ],
        },
      ],
    },
    // ============= Thème 8 — Transmission et succession =============
    {
      id: 8,
      title: "Transmission et succession",
      pic: PicTransmission,
      groups: [
        {
          anchorId: "synr-19",
          label: "Droits successoraux au sein du foyer",
          cards: [
            {
              key: "Attribution préférentielle",
              pi: 53,
              prio: "faible",
              cert: { cls: "c-forte", label: "Confiance forte · 85 %" },
              icon: IcoShieldRoof,
              title: "Attribution préférentielle",
              constat: [
                <>
                  Les testaments olographes du couple prévoient l’attribution préférentielle de la
                  résidence principale au profit du conjoint survivant.
                </>,
                <>
                  Cette clause impose contractuellement au survivant de « désintéresser les enfants » par
                  le versement d’une soulte si la valeur du bien excède sa quote-part successorale.
                </>,
              ],
              rio: {
                r: "Sans liquidités suffisantes, le versement de la soulte aux enfants rendrait l’attribution préférentielle de la résidence principale difficile à mettre en œuvre.",
                o: "L’attribution préférentielle permet au conjoint survivant de conserver la résidence principale du foyer.",
                opt: "Constituer ou flécher des liquidités (assurance-vie, épargne) destinées à couvrir la soulte éventuelle.",
              },
              impact:
                "Anticiper les liquidités nécessaires. Monsieur et Madame doivent s’assurer de disposer des liquidités suffisantes (assurance-vie ou épargne) pour payer cette soulte aux enfants, faute de quoi l’attribution préférentielle pourrait être difficile à mettre en œuvre.",
              justif: {
                text: `La clause d’attribution préférentielle impose au survivant de désintéresser ${enfants} par une soulte dès lors que la valeur de la résidence principale excède sa quote-part successorale.`,
              },
              foot: (
                <>
                  <b>Préconisation :</b> Identifier et sécuriser les liquidités nécessaires (assurance-vie,
                  épargne disponible) pour garantir l’attribution préférentielle de la résidence
                  principale.
                </>
              ),
            },
          ],
        },
        {
          anchorId: "synr-20",
          label: "Analyse des successions selon l’ordre des départs",
          cards: [
            {
              key: "Droits de succession",
              pi: 54,
              prio: "moy",
              cert: { cls: "c-moy", label: "Confiance modérée · 80 %" },
              icon: IcoShieldEuroCircle,
              title: "Droits de succession",
              constat: [
                <>Le foyer est marié sous le régime de la séparation de biens, avec deux enfants à charge.</>,
                <>
                  Le montant total des droits de succession au second décès est estimé à{" "}
                  <strong>{v("succ_droits_second_deces")}</strong> selon l’ordre des décès.
                </>,
                <>
                  Les testaments olographes prévoient l’attribution de la quotité disponible maximale au
                  conjoint (1/4 en pleine propriété et 3/4 en usufruit).
                </>,
                <>
                  Les contrats d’assurance-vie reposent actuellement sur une clause bénéficiaire standard
                  dite « usuelle ».
                </>,
              ],
              rio: {
                r: "L’impôt successoral au second décès amputerait lourdement l’actif net transmis aux enfants ; la clause bénéficiaire usuelle empêche de consommer les abattements de 152 500 € des enfants dès le premier décès.",
                o: "Des marges d’optimisation de la transmission demeurent mobilisables avant les décès.",
                opt: "Réviser les clauses bénéficiaires d’assurance-vie et étudier des dispositifs d’anticipation (donation, démembrement).",
              },
              impact: (
                <>
                  Anticipation nécessaire de la transmission. L’impôt successoral amputerait lourdement
                  l’actif net transmis à {enfants}. La clause bénéficiaire standard empêcherait de
                  consommer les abattements de 152 500 € des enfants dès le premier décès. Des stratégies
                  d’anticipation pourraient être mises en place.
                </>
              ),
              justif: {
                text: (
                  <>
                    Les droits de succession au second décès, estimés à {v("succ_droits_second_deces")} selon l’ordre des
                    départs, pèsent sur un patrimoine peu liquide et largement professionnel.
                  </>
                ),
              },
              foot: (
                <>
                  <b>Préconisation :</b> Engager une stratégie d’anticipation de la transmission, à
                  commencer par la révision des clauses bénéficiaires d’assurance-vie afin de mobiliser
                  les abattements des enfants.
                </>
              ),
            },
          ],
        },
      ],
    },
  ];

  // Compteurs DÉRIVÉS du nombre réel de fiches rendues (jamais figés).
  const allCards = THEMES.flatMap((t) => t.groups.flatMap((g) => g.cards));
  const total = allCards.length;
  const nHaute = allCards.filter((c) => c.prio === "haute").length;
  const nMoy = allCards.filter((c) => c.prio === "moy").length;
  const nFaible = allCards.filter((c) => c.prio === "faible").length;
  const themeCount = (t: Theme) => t.groups.reduce((n, g) => n + g.cards.length, 0);

  return (
    <>
      <div className="synr-board">
        <div className="synr-board-top">
          <div className="synr-total">
            <span className="synr-count">{total}</span>
            <span className="synr-tlab">
              risques et opportunités recensés,
              <br />
              regroupés par thématique
            </span>
          </div>
          <div className="synr-tools">
            <button className="synr-btn synr-btn-reset" id="synrReset" hidden>
              ✕ Tout afficher
            </button>
            <button className="synr-btn">Tout déplier</button>
          </div>
        </div>
        <div className="synr-board-cols">
          <div className="synr-col">
            <div className="synr-col-h">Par priorité (à arbitrer)</div>
            <div className="synr-pills">
              <span className="synr-pill ph filt" data-fp="haute">
                <i />Élevée <b id="synrp-haute">{nHaute}</b>
              </span>
              <span className="synr-pill pm filt" data-fp="moy">
                <i />Moyenne <b id="synrp-moy">{nMoy}</b>
              </span>
              <span className="synr-pill pf filt" data-fp="faible">
                <i />Faible <b id="synrp-faible">{nFaible}</b>
              </span>
              <b id="synrp-todo" hidden>
                0
              </b>
            </div>
          </div>
        </div>
        <div className="synr-themes">
          <div className="synr-col-h">Par thématique (filtrer l’affichage)</div>
          <div className="synr-tgrid">
            {THEMES.map((t) => (
              <a
                className="synr-tcard filt"
                data-ft={t.id}
                href={`#synr-t-${t.id}`}
                key={t.id}
              >
                <span className="synr-tc-n">{themeCount(t)}</span>
                <span className="synr-tc-l">{t.title}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="immo-mod" id="synr-intro">
        <div className="page modfold">
          <div className="shead">
            <div className="pic">{PicIntro}</div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Audit patrimonial</div>
              <h1>Présentation</h1>
            </div>
            <span className="modchev eng-only">
              <Chevron />
            </span>
          </div>
          <div className="mod-body">
            <Bloc blocKey="Présentation de la synthèse des risques" className="lead">
              Cette synthèse rassemble l’ensemble des risques et des opportunités identifiés au fil de
              l’étude, regroupés par thématique. Elle offre une vue d’ensemble permettant de repérer
              rapidement les points appelant une action, sans se substituer aux analyses détaillées
              présentées dans chaque partie.
            </Bloc>
            <p>
              Chaque fiche reprend le constat et son origine, le risque, l’opportunité ou
              l’optimisation associés, l’impact estimé et sa justification, puis la préconisation
              correspondante. Les niveaux de confiance propres à chaque analyse sont conservés.
            </p>
          </div>
        </div>
      </div>

      {THEMES.map((t) => (
        <div className="immo-mod" id={`synr-t-${t.id}`} key={t.id}>
          <div className="page modfold">
            <div className="shead">
              <div className="pic">{t.pic}</div>
              <div style={{ flex: 1 }}>
                <div className="crumb2">Synthèse des risques</div>
                <h1>{t.title}</h1>
              </div>
              <span className="modchev eng-only">
                <Chevron />
              </span>
            </div>
            <div className="mod-body">
              {t.groups.map((g) => (
                <Fragment key={g.anchorId}>
                  <div className="subttl anchor" id={g.anchorId}>
                    <SubttlArrow /> {g.label}
                  </div>
                  {g.cards.map((c) => (
                    <RiskCard key={c.key} c={c} />
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
