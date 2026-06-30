/**
 * Sous-section « Analyse des assurances » du document d'audit (maquette lignes
 * 3563-3577). Quatre modules à ascenseur (assurance des personnes, des biens,
 * des actifs professionnels) puis une synthèse consolidée.
 *
 * Portage fidèle de la maquette (mêmes modules, mêmes sous-accordéons, mêmes
 * libellés, mêmes classes, mêmes SVG). Chaque data-block de la maquette est
 * enveloppé d'un <Bloc> dont la clé reprend exactement la valeur data-block
 * (apostrophes courbes comprises) : sélectionnable, éditable et validable par le
 * volet de révision.
 *
 * Branchement réel : la désignation erronée de l'assuré reprend le patronyme du
 * foyer (donnees.foyer.personnes) quand il existe. Les TEXTES éditoriaux et
 * méthodologiques (analyses, risques & opportunités, synthèses) sont reproduits
 * fidèlement comme contenu ; en revanche TOUS les chiffres nominatifs propres au
 * foyer (capitaux garantis, cotisations, rentes, taux de remplacement, capitaux
 * mobiliers, quotités…) N'EXISTENT PAS en base : ils sont affichés en état vide
 * honnête (« — »), jamais recopiés depuis les chiffres-exemple de la maquette.
 * Les estimations advisory génériques (coût indicatif d'une garantie, ordres de
 * grandeur qualitatifs) et les bornes réglementaires (jours de carence, régimes)
 * sont conservées comme contenu méthodologique.
 *
 * Server Component : il ne compose que des éléments statiques et des <Bloc>
 * (composant client) rendus dans l'arbre du BlocProvider. Les comportements JS
 * (accordéons .fold/.subacc/.synthacc, panneaux de confiance) sont câblés
 * ensuite par le câblage global ; ce module ne produit que le markup fidèle.
 */

import { type CSSProperties, type ReactNode } from "react";

import { Bloc } from "../Bloc";
import type { EtudeDonnees } from "../../../../_data/etudes-patrimoniales";

import "../../../../_styles/sections/assurances.css";

const DASH = "—";

const KICKER_STYLE: CSSProperties = {
  color: "#A57608",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: ".6px",
  textTransform: "uppercase",
  margin: "15px 0 5px",
};

/** Patronyme du foyer (person_a) pour la désignation de l'assuré — null si absent. */
function foyerSurname(donnees: EtudeDonnees): string | null {
  const a =
    donnees.foyer.personnes.find((p) => p.role === "person_a") ?? donnees.foyer.personnes[0];
  const nom = (a?.nom ?? "").trim();
  return nom || null;
}

// ---------------------------------------------------------------------------
// Briques d'affichage
// ---------------------------------------------------------------------------

/** Œil du badge de confiance (réutilisé dans .co et .sc-ico). */
function EyeSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

type CertLevel = "c-forte" | "c-moy" | "c-faible";

/** Badge de confiance (vue ingénieur). data-certif porte la cible du panneau. */
function Cert({ level, label, id }: { level: CertLevel; label: string; id: string }) {
  return (
    <span className={`cert ${level} eng-only`} data-certif={id}>
      <span>{label}</span>
      <span className="co">
        <EyeSvg />
      </span>
    </span>
  );
}

function Kicker({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={style ? { ...KICKER_STYLE, ...style } : KICKER_STYLE}>{children}</div>;
}

function Chevron({ className, strokeWidth }: { className?: string; strokeWidth: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// ── Icônes « bouclier » des blocs risques (.mx) ────────────────────────────

function ShieldBase() {
  return <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />;
}

function ShieldExcl() {
  return (
    <svg viewBox="0 0 24 24">
      <ShieldBase />
      <path d="M12 7.6v4.4M12 14.8h.01" stroke="#FAF8F3" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

function ShieldGauge() {
  return (
    <svg viewBox="0 0 24 24">
      <ShieldBase />
      <circle cx="12" cy="12" r="3.9" stroke="#FAF8F3" strokeWidth={1.3} fill="none" />
      <path d="M12 9.7v4.6M10.3 12h3.4" stroke="#FAF8F3" strokeWidth={1.1} strokeLinecap="round" />
    </svg>
  );
}

function ShieldLines() {
  return (
    <svg viewBox="0 0 24 24">
      <ShieldBase />
      <path d="M8 7h8M8 11h8M8 15h5" stroke="#FAF8F3" strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </svg>
  );
}

function ShieldHouse() {
  return (
    <svg viewBox="0 0 24 24">
      <ShieldBase />
      <path
        d="M7.4 12.4 12 8.8l4.6 3.6M8.6 11.9V16h6.8v-4.1"
        stroke="#FAF8F3"
        strokeWidth={1.25}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldPlus() {
  return (
    <svg viewBox="0 0 24 24">
      <ShieldBase />
      <path d="M12 8.6v6.8M8.6 12h6.8" stroke="#FAF8F3" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

// ── Petites icônes des cellules de bloc risque ─────────────────────────────

function ConstatSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
    </svg>
  );
}

function ImpactSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 19V5M4 15l5-4 4 3 7-7" />
    </svg>
  );
}

function JustifSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function ArrowSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function WarnSvg() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#A57608"
      strokeWidth={2}
      style={{ width: "15px", height: "15px", verticalAlign: "-2px", marginRight: "5px" }}
    >
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Bloc risque & opportunité (.ablock)
// ---------------------------------------------------------------------------

type RiskData = {
  blocKey: string;
  icon: ReactNode;
  cert: { level: CertLevel; label: string; id: string };
  title: string;
  constats: ReactNode[];
  risque: ReactNode;
  opportunite: ReactNode;
  optimisation: ReactNode;
  impact: ReactNode;
  justification: ReactNode;
  preco: ReactNode;
};

function RiskBlock({ data }: { data: RiskData }) {
  return (
    <Bloc blocKey={data.blocKey} className="ablock fold">
      <div className="ab-h">
        <span className="mx">{data.icon}</span>
        <span className="tt">{data.title}</span>
        <Cert level={data.cert.level} label={data.cert.label} id={data.cert.id} />
      </div>
      <div className="ab-grid">
        <div className="dim">
          <div className="dh">
            <ConstatSvg /> Constat &amp; origine
          </div>
          <ul className="dlist">
            {data.constats.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
        <div className="dim">
          <div className="rio">
            <div className="it r">
              <span className="lab">Risque</span>
              {data.risque}
            </div>
            <div className="it o">
              <span className="lab">Opportunité</span>
              {data.opportunite}
            </div>
            <div className="it opt">
              <span className="lab">Optimisation</span>
              {data.optimisation}
            </div>
          </div>
        </div>
      </div>
      <div className="ab-grid" style={{ borderTop: "1px solid var(--navy-100)" }}>
        <div className="dim">
          <div className="dh">
            <ImpactSvg /> Impact quantifié
          </div>
          <p>{data.impact}</p>
        </div>
        <div className="dim">
          <div className="dh">
            <JustifSvg /> Justification
          </div>
          <p>{data.justification}</p>
        </div>
      </div>
      <div className="ab-foot">
        <ArrowSvg />
        <span>
          <b>Préconisation :</b> {data.preco}
        </span>
      </div>
    </Bloc>
  );
}

// ---------------------------------------------------------------------------
// Données des blocs risques (textes méthodologiques fidèles, chiffres honnêtes)
// ---------------------------------------------------------------------------

const riskPrevDeces: RiskData = {
  blocKey: "Prévoyance décès et contrat Madelin",
  icon: <ShieldExcl />,
  cert: { level: "c-moy", label: "Confiance modérée · 82 %", id: "assPrev" },
  title: "Capital décès obligatoirement servi sous forme de rente viagère",
  constats: [
    "Monsieur et Madame sont titulaires de contrats de prévoyance individuelle Madelin auprès de la compagnie.",
    <>Les capitaux garantis s’élèvent à {DASH} pour Monsieur et {DASH} pour Madame.</>,
    "La sortie des prestations décès est prévue sous forme de rente viagère.",
  ],
  risque: (
    <>
      Le conjoint survivant se verrait privé d’un capital immédiat au profit d’une rente dérisoire
      d’environ {DASH} par mois, et le foyer perdrait l’exonération fiscale du capital décès (loi
      TEPA) au profit d’une rente imposable à l’impôt sur le revenu.
    </>
  ),
  opportunite:
    "Une prévoyance classique (hors Madelin) permettrait au conjoint marié de percevoir un capital totalement exonéré au titre de la loi TEPA.",
  optimisation:
    "Compléter ou substituer une prévoyance décès hors cadre Madelin afin de rétablir une sortie en capital.",
  impact: (
    <>
      Pour un capital de {DASH}, la rente servie au survivant ne serait que d’environ {DASH} par
      mois.
    </>
  ),
  justification: "Conditions générales des contrats de prévoyance Madelin et cadre fiscal applicable.",
  preco: <>rétablir une sortie en capital pour la protection du conjoint (partie « Préconisations »).</>,
};

const riskTarif: RiskData = {
  blocKey: "Tarification évolutive de la prévoyance",
  icon: <ShieldGauge />,
  cert: { level: "c-moy", label: "Confiance modérée · 82 %", id: "assPrev" },
  title: "Tarification à « âge atteint » : un impact budgétaire exponentiel",
  constats: [
    "Les contrats de prévoyance de Monsieur et Madame sont indexés sur une tarification dite à « âge atteint ».",
    "Les cotisations augmentent mécaniquement chaque année au 1er janvier selon l’âge réel de chaque assuré.",
    "Le foyer entre dans la phase de carrière où les coefficients tarifaires connaissent leur plus forte accélération.",
  ],
  risque:
    "L’alourdissement automatique des primes dégraderait la rentabilité des deux cabinets à l’approche de la retraite, avec un coût de protection global disproportionné par rapport aux bénéfices professionnels générés.",
  opportunite:
    "Un arbitrage vers des contrats à « cotisation nivelée » permettrait de figer le coût de l’assurance pour Monsieur et Madame.",
  optimisation:
    "Mettre les garanties en concurrence et privilégier une cotisation nivelée pour stabiliser les flux jusqu’à la cessation d’activité.",
  impact:
    "Le coût de protection croît chaque année et atteint son accélération maximale dans la dernière décennie d’activité.",
  justification: "Conditions tarifaires des contrats de prévoyance (clause « âge atteint »).",
  preco: <>arbitrer vers une cotisation nivelée (partie « Préconisations »).</>,
};

const riskClause: RiskData = {
  blocKey: "Clause bénéficiaire des assurances-vie",
  icon: <ShieldLines />,
  cert: { level: "c-moy", label: "Confiance modérée · 80 %", id: "assClau" },
  title: "Clauses bénéficiaires standard : risque en cas de divorce et absence d’optimisation",
  constats: [
    "La rédaction actuelle des clauses bénéficiaires est standard et ne prévoit aucun démembrement de propriété.",
    "Aucune mention d’exclusion relative à une éventuelle instance de divorce n’est intégrée aux contrats.",
  ],
  risque:
    "En cas de divorce, le capital risquerait d’être versé à un conjoint dont le lien affectif serait déjà rompu au jour du décès.",
  opportunite:
    "Une clause démembrée (usufruit au conjoint, nue-propriété aux enfants) ouvrirait des opportunités de transmission optimisée en faveur des enfants.",
  optimisation:
    "Réécrire les clauses bénéficiaires avec démembrement et clause d’exclusion en cas d’instance de divorce.",
  impact:
    "L’absence de démembrement limite les opportunités de transmission optimisée en faveur des enfants.",
  justification: "Clauses bénéficiaires des contrats d’assurance-vie du couple.",
  preco: <>réécrire les clauses bénéficiaires (partie « Préconisations »).</>,
};

const riskParkings: RiskData = {
  blocKey: "Absence d’assurance des parkings",
  icon: <ShieldHouse />,
  cert: { level: "c-forte", label: "Confiance forte · 86 %", id: "assImmo" },
  title: "Parkings en nom propre : des risques de responsabilité non couverts",
  constats: [
    "Le couple détient des parkings en nom propre.",
    "Ces emplacements ne bénéficient d’aucune assurance en responsabilité civile.",
  ],
  risque:
    "La responsabilité civile du couple pourrait être engagée pour des dommages causés à des tiers (chute d’un piéton, dégradation d’un véhicule voisin). Les frais de procédure et d’indemnisation seraient prélevés sur le patrimoine personnel, sans protection juridique pour contester une mise en cause.",
  opportunite:
    "La souscription d’une assurance en responsabilité civile permettrait de déléguer ces risques à un assureur.",
  optimisation: "Souscrire une assurance en responsabilité civile dédiée pour chaque emplacement.",
  impact: "Le coût annuel d’une telle garantie est modique, de l’ordre de 20 à 30 € par an et par lot.",
  justification: "Inventaire des biens immobiliers et contrats d’assurance en place.",
  preco: <>souscrire une responsabilité civile sur les parkings (partie « Préconisations »).</>,
};

function riskDesignation(surname: string | null): RiskData {
  const assureNom = surname ? `« Monsieur ${surname} »` : `« Monsieur ${DASH} »`;
  return {
    blocKey: "Mauvaise désignation de l’assuré",
    icon: <ShieldExcl />,
    cert: { level: "c-moy", label: "Confiance modérée · 82 %", id: "assImmo" },
    title: "Désignation erronée de l’assuré : un risque de nullité du contrat",
    constats: [
      <>Le contrat d’assurance est libellé au nom de {assureNom}, une entité physique juridiquement inexistante.</>,
      "L’assureur identifie l’assuré comme une personne physique, alors que le bien appartient à une personne morale (la SCI).",
      "La domiciliation du siège de la société est identique à celle de la résidence principale du couple.",
    ],
    risque:
      "Cette interprétation erronée de la personnalité juridique pourrait être invoquée pour frapper le contrat de nullité lors d’un sinistre, avec un refus d’indemnisation au motif que la personne désignée n’est pas le propriétaire légal du bien ; la SCI risquerait d’être considérée comme non assurée malgré le paiement régulier des primes.",
    opportunite:
      "Une rectification de la dénomination permettrait de sécuriser l’actif immobilier en faisant coïncider l’identité de l’assuré avec celle du propriétaire réel.",
    optimisation: "Faire corriger le libellé du contrat au nom de la société propriétaire.",
    impact:
      "Un sinistre non indemnisé exposerait le foyer à la charge intégrale du dommage, malgré des primes régulièrement acquittées.",
    justification: "Conditions particulières du contrat d’assurance et statuts de la SCI propriétaire.",
    preco: <>régulariser la désignation de l’assuré (partie « Préconisations »).</>,
  };
}

const riskMateriel: RiskData = {
  blocKey: "Sous-évaluation du matériel professionnel",
  icon: <ShieldGauge />,
  cert: { level: "c-moy", label: "Confiance modérée · 80 %", id: "assProMat" },
  title: "Capitaux déclarés inférieurs à la valeur réelle : la règle proportionnelle",
  constats: [
    <>
      Le capital mobilier déclaré au contrat multirisque s’élève à {DASH} pour un parc
      d’équipements dont la valeur de remplacement est estimée à {DASH}.
    </>,
    "Le contrat ne comporte pas de clause de renonciation à la règle proportionnelle de capitaux.",
  ],
  risque:
    "En cas de sinistre partiel, l’assureur appliquerait la règle proportionnelle et réduirait l’indemnité dans la proportion de la sous-évaluation, laissant un reste à charge significatif sur le foyer.",
  opportunite:
    "Une réévaluation des capitaux et l’ajout d’une clause de renonciation à la règle proportionnelle sécuriseraient l’indemnisation.",
  optimisation:
    "Faire expertiser le matériel, actualiser les capitaux déclarés et négocier la renonciation à la proportionnelle.",
  impact: <>Pour un sinistre, l’indemnité pourrait être réduite d’environ {DASH} au titre de la sous-assurance.</>,
  justification: "Conditions particulières du contrat multirisque et inventaire du matériel d’exploitation.",
  preco: <>réévaluer les capitaux du matériel professionnel (partie « Préconisations »).</>,
};

const riskPertesExpl: RiskData = {
  blocKey: "Absence de garantie des pertes d’exploitation",
  icon: <ShieldExcl />,
  cert: { level: "c-moy", label: "Confiance modérée · 78 %", id: "assProPE" },
  title: "Interruption d’activité : des charges fixes sans recettes",
  constats: [
    "Les contrats en place ne comportent pas de garantie de pertes d’exploitation ni de frais généraux permanents.",
    "Le revenu du foyer repose à titre principal sur l’activité des deux cabinets.",
  ],
  risque:
    "À la suite d’un sinistre rendant le cabinet inexploitable, le foyer continuerait de supporter les charges fixes (loyers internes, salaires, échéances) sans recettes, jusqu’à la reprise de l’activité.",
  opportunite:
    "Une garantie de pertes d’exploitation, calibrée sur la marge et les frais généraux, maintiendrait l’équilibre financier pendant la période de reconstitution.",
  optimisation: "Souscrire une garantie de pertes d’exploitation adossée à la multirisque du cabinet.",
  impact: "Plusieurs mois de charges fixes resteraient à la charge du foyer en l’absence de cette garantie.",
  justification: "Conditions des contrats professionnels et structure des revenus du foyer.",
  preco: <>souscrire une garantie de pertes d’exploitation (partie « Préconisations »).</>,
};

const riskNumerique: RiskData = {
  blocKey: "Absence de couverture des risques numériques",
  icon: <ShieldExcl />,
  cert: { level: "c-moy", label: "Confiance modérée · 75 %", id: "assProCyber" },
  title: "Données de santé : une exposition non assurée",
  constats: [
    "Aucune garantie des risques numériques n’est souscrite pour les deux cabinets.",
    "Les données de santé des patients sont traitées et conservées par voie numérique.",
  ],
  risque:
    "Une atteinte aux systèmes d’information (rançongiciel, fuite de données) entraînerait des coûts de remédiation, une interruption d’activité et une exposition aux obligations de notification.",
  opportunite:
    "Une garantie des risques numériques couvrirait les frais de restauration, la perte d’exploitation consécutive et l’accompagnement réglementaire.",
  optimisation: "Étudier la souscription d’une garantie des risques numériques adaptée à une activité de santé.",
  impact:
    "Le coût d’un incident (remédiation et interruption) peut représenter plusieurs dizaines de milliers d’euros.",
  justification: "Inventaire des contrats et nature des données traitées par le cabinet.",
  preco: <>étudier une garantie des risques numériques (partie « Préconisations »).</>,
};

const consoPersonnes: RiskData = {
  blocKey: "Protection des personnes",
  icon: <ShieldPlus />,
  cert: { level: "c-forte", label: "Confiance forte · 84 %", id: "globAssP" },
  title: "Une protection des personnes solide mais à optimiser",
  constats: [
    "Prévoyance Madelin adaptée à la profession, mais capital décès servi en rente viagère.",
    "Tarification à l’âge atteint et clauses bénéficiaires standard.",
  ],
  risque:
    "Le conjoint survivant percevrait une rente dérisoire et fiscalisée ; le coût de la prévoyance s’alourdit à l’approche de la retraite ; les clauses sont exposées en cas de divorce.",
  opportunite:
    "Une prévoyance hors Madelin, une cotisation nivelée et des clauses démembrées sécuriseraient la transmission et le budget.",
  optimisation:
    "Compléter la couverture décès, mettre les garanties en concurrence et réécrire les clauses bénéficiaires.",
  impact: (
    <>
      Capital décès de {DASH} converti en une rente d’environ {DASH} par mois ; couverture
      invalidité de Madame plafonnée à environ {DASH}.
    </>
  ),
  justification: "Contrats de prévoyance, certificats d’adhésion et clauses bénéficiaires du couple.",
  preco: <>renforcer la protection des personnes (partie « Préconisations »).</>,
};

const consoBiens: RiskData = {
  blocKey: "Assurance des biens",
  icon: <ShieldExcl />,
  cert: { level: "c-moy", label: "Confiance modérée · 82 %", id: "globAssB" },
  title: "Une assurance des biens à régulariser sans délai",
  constats: [
    "Des parkings détenus en nom propre sans responsabilité civile.",
    "Un contrat libellé au nom d’une personne physique inexistante, alors que le bien appartient à la SCI.",
  ],
  risque:
    "Les frais d’un sinistre sur les parkings pèseraient sur le patrimoine personnel ; le contrat mal libellé pourrait être frappé de nullité et l’indemnisation refusée.",
  opportunite:
    "Une responsabilité civile dédiée et la mise en cohérence du contrat avec le propriétaire réel sécuriseraient les actifs.",
  optimisation:
    "Souscrire une responsabilité civile sur les parkings et régulariser la dénomination de l’assuré.",
  impact:
    "Coût d’une responsabilité civile de l’ordre de 20 à 30 € par an et par lot ; à défaut, exposition à la charge intégrale d’un sinistre non indemnisé.",
  justification: "Inventaire des biens, conditions particulières des contrats et statuts de la SCI.",
  preco: <>régulariser l’assurance des biens (partie « Préconisations »).</>,
};

const consoActifs: RiskData = {
  blocKey: "Actifs professionnels",
  icon: <ShieldGauge />,
  cert: { level: "c-moy", label: "Confiance modérée · 78 %", id: "globAssPro" },
  title: "Un outil professionnel à mieux protéger",
  constats: [
    "Responsabilités professionnelle et d’exploitation couvertes.",
    "Matériel sous-évalué, pertes d’exploitation et risques numériques non couverts.",
  ],
  risque:
    "Un sinistre matériel ou numérique réduirait l’indemnisation et interromprait l’activité, alors que le revenu du foyer dépend des deux cabinets.",
  opportunite:
    "La réévaluation du matériel, une garantie de pertes d’exploitation et une garantie des risques numériques sécuriseraient l’outil de travail.",
  optimisation:
    "Actualiser les capitaux, souscrire les pertes d’exploitation et étudier une garantie des risques numériques.",
  impact: (
    <>
      Indemnité du matériel réduite d’environ {DASH} en cas de sous-assurance ; plusieurs mois de
      charges fixes en cas d’arrêt non couvert.
    </>
  ),
  justification: "Conditions du contrat multirisque, inventaire du matériel et structure des revenus du foyer.",
  preco: <>renforcer la protection de l’outil professionnel (partie « Préconisations »).</>,
};

// ---------------------------------------------------------------------------
// Section complète
// ---------------------------------------------------------------------------

export default function AssurancesSection({ donnees }: { donnees: EtudeDonnees }): ReactNode {
  const surname = foyerSurname(donnees);
  const designation = riskDesignation(surname);

  return (
    <>
      {/* ── Module d'introduction ───────────────────────────────────────── */}
      <div className="immo-mod">
        <div className="page">
          <div className="shead">
            <div className="pic">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C68E0E"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l8 3.5v5.2c0 4.6-3.4 7.8-8 9.3-4.6-1.5-8-4.7-8-9.3V6.5z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Audit patrimonial</div>
              <h1>Analyse des assurances</h1>
            </div>
          </div>
          <div className="mod-body">
            <Bloc blocKey="Texte d’introduction de l’analyse des assurances" className="lead">
              L’analyse des couvertures assurantielles vise à recenser les garanties en place et à
              évaluer leur adéquation avec les objectifs patrimoniaux du foyer. Son objectif est de
              s’assurer que les membres du foyer et leur patrimoine bénéficient d’une protection
              suffisante face aux aléas de la vie.
            </Bloc>
            <Bloc blocKey="Catégories d’assurances étudiées">
              <p>Nous étudions ainsi les différentes catégories d’assurances couvrant :</p>
              <ul className="dlist">
                <li>Les personnes (prévoyance, santé, décès, dépendance).</li>
                <li>Les biens (immobilier, véhicules, objets de valeur).</li>
                <li>Les actifs professionnels, le cas échéant.</li>
              </ul>
            </Bloc>
          </div>
        </div>
      </div>

      {/* ── Module : assurance des personnes ────────────────────────────── */}
      <div className="immo-mod" id="assur-pers">
        <div className="page modfold">
          <div className="shead">
            <div className="pic">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C68E0E"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="8" r="3.2" />
                <path d="M3 20c0-3.2 2.7-5.2 6-5.2s6 2 6 5.2" />
                <path d="M16 5.2a3 3 0 0 1 0 5.6M21 20c0-2.6-1.4-4.3-3.6-4.9" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Analyse des assurances</div>
              <h1>Assurance des personnes</h1>
            </div>
            <Cert level="c-forte" label="Confiance forte · 85 %" id="assur-pers" />
            <span className="modchev eng-only">
              <Chevron strokeWidth={2.2} />
            </span>
          </div>
          <div className="mod-body">
            <Bloc blocKey="Rôle de l’assurance des personnes" className="lead">
              L’assurance des personnes joue un rôle primordial dans la protection financière du
              foyer face aux aléas de la vie. Elle permet d’anticiper les conséquences d’un accident,
              d’une maladie, d’une invalidité ou d’un décès, en garantissant des revenus de
              substitution et en évitant une déstabilisation patrimoniale.
            </Bloc>
            <Bloc blocKey="Axes de l’analyse des personnes">
              <p>L’analyse de cette couverture repose sur trois axes majeurs :</p>
              <ul className="dlist">
                <li>La prévoyance, l’assurance décès et les autres dispositifs de protection du foyer.</li>
                <li>La mutuelle et la complémentaire santé.</li>
                <li>Les clauses bénéficiaires des contrats d’assurance-vie.</li>
              </ul>
              <p>
                Son objectif est d’identifier les éventuelles lacunes de couverture et d’évaluer si
                les contrats en place sont en adéquation avec la situation du foyer et ses objectifs
                patrimoniaux.
              </p>
            </Bloc>

            {/* sous-accordéon : mutuelle */}
            <div className="subacc" id="ass-mut">
              <div className="sub-h">
                <span className="sub-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                    <path d="M12 20s-7-4.3-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.7 12 20 12 20z" />
                  </svg>
                </span>
                <span className="sub-tt">Mutuelle et complémentaire santé</span>
                <span style={{ marginLeft: "auto" }}>
                  <Cert level="c-forte" label="Confiance forte · 88 %" id="assMut" />
                </span>
                <span className="sub-chev">
                  <Chevron strokeWidth={2.4} />
                </span>
              </div>
              <div className="subbody">
                <Bloc blocKey="Mutuelle et complémentaire santé">
                  <p>Le couple dispose de deux contrats de mutuelle souscrits dans le cadre de la loi Madelin.</p>
                  <p>
                    Le certificat d’adhésion de Monsieur confirme une personnalisation poussée du
                    risque, notamment par le biais d’exclusions explicites.
                  </p>
                  <p>
                    Le contrat prévoit l’exclusion de la quasi-totalité des postes dentaires. Cette
                    structure est cohérente pour un chirurgien-dentiste libéral, en mesure d’assurer
                    lui-même (ou par l’intermédiaire de son conjoint) ses propres soins sans en
                    supporter le coût dans sa cotisation.
                  </p>
                  <p>Les deux enfants sont rattachés au contrat de Madame.</p>
                </Bloc>
              </div>
            </div>

            {/* sous-accordéon : prévoyance */}
            <div className="subacc" id="ass-prev">
              <div className="sub-h">
                <span className="sub-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
                    <path d="M9.5 12l1.8 1.8L15 10" />
                  </svg>
                </span>
                <span className="sub-tt">Prévoyance, assurance décès et protection du foyer</span>
                <span style={{ marginLeft: "auto" }}>
                  <Cert level="c-moy" label="Confiance modérée · 82 %" id="assPrev" />
                </span>
                <span className="sub-chev">
                  <Chevron strokeWidth={2.4} />
                </span>
              </div>
              <div className="subbody">
                <Bloc blocKey="Prévoyance, décès et protection du foyer">
                  <p>
                    Le couple dispose de deux contrats individuels de prévoyance auprès de la
                    compagnie. Si ces contrats présentent une technicité adaptée à la profession de
                    chirurgien-dentiste, ils révèlent des failles en matière de montants de couverture
                    et d’optimisation fiscale au regard des revenus nets du foyer.
                  </p>
                </Bloc>

                <Kicker>Les atouts du dispositif actuel</Kicker>
                <ul className="dlist">
                  <li>
                    <b>Barèmes professionnels spécifiques :</b> les contrats utilisent le barème
                    professionnel (Option 2), essentiel pour les dentistes. L’invalidité est évaluée
                    au regard de la seule aptitude à exercer l’art dentaire, sans prise en compte d’un
                    éventuel reclassement dans une autre profession.
                  </li>
                  <li>
                    <b>Seuil de déclenchement bas :</b> la rente d’invalidité complémentaire s’active
                    dès {DASH} d’incapacité, protégeant le couple contre des pathologies légères mais
                    invalidantes pour la précision gestuelle.
                  </li>
                  <li>
                    <b>Efficience fiscale immédiate :</b> les cotisations ({DASH} pour Monsieur et{" "}
                    {DASH} pour Madame) sont intégralement déductibles de leurs bénéfices non
                    commerciaux respectifs au titre de la loi Madelin.
                  </li>
                </ul>

                <Kicker>Analyse prospective des revenus de remplacement par étape</Kicker>
                <p>
                  Le maintien du niveau de vie du foyer reposerait sur l’articulation entre les
                  prestations obligatoires (caisse primaire d’assurance maladie, CPAM, et caisse
                  autonome de retraite des chirurgiens-dentistes et des sages-femmes, CARCDSF) et les
                  garanties complémentaires de la compagnie. Cette architecture mettrait toutefois en
                  lumière des carences, particulièrement pour Madame.
                </p>
                <p style={{ marginTop: "8px" }}>
                  <b>A · Phase d’incapacité temporaire (indemnité journalière, IJ) : de 0 à 1 095 jours</b>
                </p>
                <p>
                  <b>De 0 à 90 jours (relais CPAM et prévoyance)</b>
                </p>
                <ul className="dlist">
                  <li>Durant cette phase, le couple bénéficierait de l’indemnité journalière de la CPAM.</li>
                  <li>
                    Madame (revenu de {DASH} par mois) percevrait une indemnité journalière de la
                    CPAM d’environ {DASH} par jour, complétée par la prévoyance à hauteur de {DASH}{" "}
                    par jour. Sa couverture globale s’élèverait à {DASH} par jour, soit environ {DASH}{" "}
                    de son revenu net.
                  </li>
                  <li>
                    Monsieur (revenu de {DASH} par mois) percevrait l’indemnité journalière maximale
                    de la CPAM, soit {DASH} par jour, complétée par {DASH} par jour de la prévoyance.
                    Sa couverture globale s’établirait à {DASH} par jour, soit environ {DASH} de son
                    revenu net.
                  </li>
                </ul>
                <p>
                  <b>De 91 à 730 jours (relais CARCDSF et prévoyance)</b>
                </p>
                <ul className="dlist">
                  <li>
                    À compter du 91e jour, la CARCDSF prendrait le relais de la CPAM avec une
                    indemnité journalière forfaitaire d’environ {DASH} par jour (soit environ {DASH}{" "}
                    par mois).
                  </li>
                  <li>
                    Madame : son complément privé chuterait à {DASH} par jour. Avec le cumul de la
                    CARCDSF, elle ne percevrait plus qu’environ {DASH} par mois, soit un taux de
                    remplacement de {DASH}.
                  </li>
                  <li>
                    Monsieur : son complément privé passerait à {DASH} par jour. Avec le cumul de la
                    CARCDSF, il percevrait environ {DASH} par mois, soit un taux de remplacement de{" "}
                    {DASH}.
                  </li>
                </ul>
                <p>
                  <b>De 731 à 1 095 jours (dernière phase d’incapacité)</b>
                </p>
                <ul className="dlist">
                  <li>
                    Durant cette période, les prestations de la CARCDSF seraient maintenues, tandis
                    que les garanties de la compagnie atteindraient leur palier maximal.
                  </li>
                  <li>
                    Madame : son complément remonterait à {DASH} par jour. Son revenu total
                    s’établirait à environ {DASH} par mois, soit une couverture de {DASH}.
                  </li>
                  <li>
                    Monsieur : son complément bondirait à {DASH} par jour. Il bénéficierait alors
                    d’une protection optimale d’environ {DASH} par mois, couvrant près de {DASH} de
                    ses revenus.
                  </li>
                </ul>
                <p style={{ marginTop: "8px" }}>
                  <b>B · Phase d’invalidité permanente : au-delà de 1 095 jours</b>
                </p>
                <p>
                  À l’issue des trois ans (1 095 jours), les indemnités journalières cesseraient pour
                  être remplacées par des rentes viagères d’invalidité.
                </p>
                <ul className="dlist">
                  <li>
                    Monsieur : sa rente privée s’établirait à {DASH} par mois. En y ajoutant la rente
                    d’invalidité de la CARCDSF (estimée à environ {DASH} par mois), son revenu
                    chuterait à environ {DASH} par mois. Sa protection globale s’effondrerait de{" "}
                    {DASH} à {DASH} de son revenu net initial.
                  </li>
                  <li>
                    Madame : sa rente privée s’élèverait à {DASH} par mois. Avec la rente obligatoire,
                    elle maintiendrait un revenu de remplacement d’environ {DASH} par mois, soit une
                    protection constante d’environ {DASH} de son revenu.
                  </li>
                </ul>

                <Kicker>Inconvénients techniques et fiscaux</Kicker>
                <ul className="dlist">
                  <li>
                    <b>Sortie obligatoire en rente :</b> le cadre Madelin interdit le versement d’un
                    capital au conjoint et impose une rente viagère. Pour un capital de {DASH}, la
                    rente générée pour le survivant ne serait que d’environ {DASH} par mois, privant
                    le foyer de liquidités immédiates.
                  </li>
                  <li>
                    <b>Fiscalité pénalisante au sinistre :</b> contrairement à une prévoyance
                    classique (hors Madelin) où le conjoint marié recevrait un capital totalement
                    exonéré (loi TEPA), la rente issue du contrat actuel est imposable à l’impôt sur
                    le revenu (catégorie « pensions ») et soumise aux prélèvements sociaux. Le couple
                    économise de l’impôt aujourd’hui au prix d’une charge fiscale future pour le
                    survivant.
                  </li>
                  <li>
                    <b>Tarification évolutive « âge atteint » :</b> les primes augmentent
                    mécaniquement chaque année au 1er janvier selon l’âge. Monsieur et Madame entrent
                    prochainement dans la décennie de tarification la plus coûteuse, ce qui pèsera de
                    plus en plus lourdement sur la rentabilité de leur cabinet à l’approche de la
                    retraite.
                  </li>
                </ul>

                <Kicker>Risques et opportunités</Kicker>
                <RiskBlock data={riskPrevDeces} />
                <RiskBlock data={riskTarif} />
              </div>
            </div>

            {/* sous-accordéon : clauses bénéficiaires */}
            <div className="subacc" id="ass-clau">
              <div className="sub-h">
                <span className="sub-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                    <path d="M4 20h4L19 9l-4-4L4 16z" />
                    <path d="M14 6l4 4" />
                  </svg>
                </span>
                <span className="sub-tt">Clauses bénéficiaires des contrats</span>
                <span style={{ marginLeft: "auto" }}>
                  <Cert level="c-moy" label="Confiance modérée · 80 %" id="assClau" />
                </span>
                <span className="sub-chev">
                  <Chevron strokeWidth={2.4} />
                </span>
              </div>
              <div className="subbody">
                <Bloc blocKey="Clauses bénéficiaires des contrats">
                  <p>
                    L’analyse des clauses bénéficiaires permet de vérifier que la transmission des
                    capitaux respecte les volontés du foyer et optimise la fiscalité. L’état des
                    clauses transmises est récapitulé ci-dessous.
                  </p>
                </Bloc>
                <table className="et">
                  <colgroup>
                    <col style={{ width: "30%" }} />
                    <col style={{ width: "70%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Contrat</th>
                      <th>Clause bénéficiaire ou observation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="cell ed" data-fmt="txt">
                          Assurance-vie de Monsieur
                        </div>
                      </td>
                      <td>
                        <div className="cell ed" data-fmt="txt">
                          Clause usuelle : « Le conjoint de l’adhérent-assuré, non séparé de corps, ou
                          le partenaire lié à l’adhérent assuré par un pacte civil de solidarité ; à
                          défaut les enfants de l’adhérent-assuré, nés ou à naître, vivants ou
                          représentés ; à défaut les héritiers de l’adhérent-assuré »
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="cell ed" data-fmt="txt">
                          Assurance-vie de Madame
                        </div>
                      </td>
                      <td>
                        <div className="cell ed" data-fmt="txt">
                          Clause usuelle : « Le conjoint de l’adhérent-assuré, non séparé de corps, ou
                          le partenaire lié à l’adhérent assuré par un pacte civil de solidarité ; à
                          défaut les enfants de l’adhérent-assuré, nés ou à naître, vivants ou
                          représentés ; à défaut les héritiers de l’adhérent-assuré »
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="cell ed" data-fmt="txt">
                          Contrat d’assurance-vie n° 3
                        </div>
                      </td>
                      <td>
                        <div className="cell ed" data-fmt="txt">
                          <WarnSvg />
                          Nous ne disposons pas de la rédaction exacte des clauses bénéficiaires.
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="cell ed" data-fmt="txt">
                          Contrat d’assurance-vie n° 4
                        </div>
                      </td>
                      <td>
                        <div className="cell ed" data-fmt="txt">
                          <WarnSvg />
                          Nous ne disposons pas de la rédaction exacte des clauses bénéficiaires.
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <div className="cell ed" data-fmt="txt">
                          Contrats de prévoyance (Monsieur et Madame)
                        </div>
                      </td>
                      <td>
                        <div className="cell ed" data-fmt="txt">
                          <WarnSvg />
                          Nous ne disposons pas de la rédaction exacte des clauses bénéficiaires, mais
                          le couple indique ne pas avoir rédigé de clause personnalisée. La clause
                          standard est donc supposée applicable, souvent rédigée ainsi : « Le conjoint
                          de l’adhérent-assuré, non séparé de corps, ou le partenaire lié à
                          l’adhérent assuré par un pacte civil de solidarité ; à défaut les enfants de
                          l’adhérent-assuré, nés ou à naître, vivants ou représentés ; à défaut les
                          héritiers de l’adhérent-assuré »
                          <br />
                          <br />
                          <WarnSvg />
                          La notion de divorce n’est pas systématiquement intégrée.
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <Kicker>Risques et opportunités</Kicker>
                <RiskBlock data={riskClause} />
              </div>
            </div>

            {/* synthèse du thème : personnes */}
            <div className="synthacc">
              <div className="subttl anchor synth-h" id="synthese-theme-personnes">
                <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
                  <path d="M9 11l3 3 8-8" />
                  <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
                </svg>{" "}
                Synthèse du thème
                <Chevron className="synthchev" strokeWidth={2.2} />
              </div>
              <div className="synthprose">
                <div className="sp-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
                    <path d="M8 8h6M8 12h8M8 16h5" />
                  </svg>{" "}
                  Assurance des personnes — lecture stratégique
                </div>
                <div className="synth-cert sc-green eng-only" data-certif="assPersTh">
                  <span className="sc-ico">
                    <EyeSvg />
                  </span>
                  <span>
                    <b>Confiance modérée · 82 %</b> · synthèse fondée sur les constats du thème
                  </span>
                  <span className="sc-link">Voir le détail</span>
                </div>
                <p>
                  Le dispositif de protection des personnes est techniquement adapté à la profession
                  de chirurgien-dentiste (barème professionnel, seuil de déclenchement bas), mais il
                  révèle des carences de montants et d’optimisation, plus marquées pour Madame.
                </p>
                <p>
                  Trois points de vigilance ressortent : un capital décès Madelin obligatoirement
                  servi en rente viagère et fiscalisé, une tarification à « âge atteint » dont le coût
                  s’accélère à l’approche de la retraite, et des clauses bénéficiaires standard, sans
                  démembrement ni prise en compte d’une instance de divorce.
                </p>
                <div className="sp-recap">
                  <div className="spr spr-r">
                    <div className="spr-h">Principaux risques</div>
                    <ul>
                      <li>Capital décès servi en rente viagère dérisoire et imposable.</li>
                      <li>Coût de prévoyance croissant (tarification à l’âge atteint).</li>
                      <li>Clauses bénéficiaires standard, exposées en cas de divorce.</li>
                    </ul>
                  </div>
                  <div className="spr spr-o">
                    <div className="spr-h">Principales opportunités</div>
                    <ul>
                      <li>Prévoyance hors Madelin pour rétablir une sortie en capital.</li>
                      <li>Arbitrage vers une cotisation nivelée.</li>
                      <li>Clauses démembrées et clause d’exclusion en cas de divorce.</li>
                    </ul>
                  </div>
                  <div className="spr spr-opt">
                    <div className="spr-h">Principales optimisations</div>
                    <ul>
                      <li>Compléter la couverture décès du conjoint.</li>
                      <li>Mettre les garanties en concurrence.</li>
                      <li>Réécrire les clauses bénéficiaires.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Module : assurance des biens ────────────────────────────────── */}
      <div className="immo-mod" id="assur-biens">
        <div className="page modfold">
          <div className="shead">
            <div className="pic">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C68E0E"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 11 12 4l8 7" />
                <path d="M6 10v10h12V10" />
                <path d="M10 20v-6h4v6" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Analyse des assurances</div>
              <h1>Assurance des biens</h1>
            </div>
            <Cert level="c-moy" label="Confiance modérée · 82 %" id="assur-biens" />
            <span className="modchev eng-only">
              <Chevron strokeWidth={2.2} />
            </span>
          </div>
          <div className="mod-body">
            <Bloc blocKey="Rôle de l’assurance des biens" className="lead">
              L’assurance des biens garantit la couverture des actifs contre les risques susceptibles
              d’entraîner des pertes financières importantes. Elle permet d’anticiper les conséquences
              d’un sinistre (dommage matériel, vol, catastrophe naturelle ou incapacité à honorer un
              emprunt) et d’assurer la continuité et la sécurité financière du foyer.
            </Bloc>
            <Bloc blocKey="Axes de l’analyse des biens">
              <p>L’analyse de cette couverture repose sur quatre axes majeurs :</p>
              <ul className="dlist">
                <li>L’assurance emprunteur et les garanties associées aux crédits immobiliers.</li>
                <li>L’assurance habitation et l’assurance des biens immobiliers.</li>
                <li>L’assurance des véhicules et des autres biens de valeur.</li>
                <li>Les garanties spécifiques liées à l’activité professionnelle.</li>
              </ul>
              <p>
                Son objectif est d’évaluer l’adéquation des garanties existantes aux besoins réels du
                foyer, de détecter d’éventuelles insuffisances ou doublons, et d’identifier les
                ajustements nécessaires pour une protection optimale du patrimoine.
              </p>
            </Bloc>

            {/* sous-accordéon : prêts et assurance emprunteur */}
            <div className="subacc" id="ass-pret">
              <div className="sub-h">
                <span className="sub-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                    <path d="M4 11 12 4l8 7M6 10v10h12V10" />
                  </svg>
                </span>
                <span className="sub-tt">Prêts et assurance emprunteur</span>
                <span style={{ marginLeft: "auto" }}>
                  <Cert level="c-forte" label="Confiance forte · 86 %" id="assPret" />
                </span>
                <span className="sub-chev">
                  <Chevron strokeWidth={2.4} />
                </span>
              </div>
              <div className="subbody">
                <Bloc blocKey="Prêts et assurance emprunteur">
                  <p>
                    Le couple dispose d’un unique prêt immobilier, contracté par sa société civile
                    immobilière (la SCI), laquelle détient les locaux du cabinet dentaire dans le
                    cadre d’une opération de rachat à soi-même (Owner Buy Out, OBO) réalisée avec leur
                    précédente structure.
                  </p>
                  <p>
                    La couverture d’assurance emprunteur inclut les risques de décès, de perte totale
                    et irréversible d’autonomie (PTIA), ainsi que l’invalidité. Le taux de couverture
                    (quotité) appliqué est de {DASH} pour chacun de ces risques. Ainsi, en cas de
                    sinistre couvert, le partenaire non concerné demeurerait responsable de {DASH} du
                    montant restant dû sur le prêt.
                  </p>
                </Bloc>
              </div>
            </div>

            {/* sous-accordéon : assurance des biens immobiliers */}
            <div className="subacc" id="ass-immo">
              <div className="sub-h">
                <span className="sub-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                    <path d="M4 11 12 4l8 7M6 10v10h12V10" />
                  </svg>
                </span>
                <span className="sub-tt">Assurance des biens immobiliers</span>
                <span style={{ marginLeft: "auto" }}>
                  <Cert level="c-moy" label="Confiance modérée · 80 %" id="assImmo" />
                </span>
                <span className="sub-chev">
                  <Chevron strokeWidth={2.4} />
                </span>
              </div>
              <div className="subbody">
                <Bloc blocKey="Assurance des biens immobiliers">
                  <p>
                    Les biens immobiliers détenus sont couverts par des assurances habitation
                    propriétaire non occupant ou multirisque habitation, en adéquation avec leurs
                    modes d’exploitation, à l’exception des parkings.
                  </p>
                </Bloc>
                <Kicker>Risques et opportunités</Kicker>
                <RiskBlock data={riskParkings} />
                <RiskBlock data={designation} />
              </div>
            </div>

            {/* synthèse du thème : biens */}
            <div className="synthacc">
              <div className="subttl anchor synth-h" id="synthese-theme-biens">
                <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
                  <path d="M9 11l3 3 8-8" />
                  <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
                </svg>{" "}
                Synthèse du thème
                <Chevron className="synthchev" strokeWidth={2.2} />
              </div>
              <div className="synthprose">
                <div className="sp-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
                    <path d="M8 8h6M8 12h8M8 16h5" />
                  </svg>{" "}
                  Assurance des biens — lecture stratégique
                </div>
                <div className="synth-cert sc-green eng-only" data-certif="assBiensTh">
                  <span className="sc-ico">
                    <EyeSvg />
                  </span>
                  <span>
                    <b>Confiance modérée · 80 %</b> · synthèse fondée sur les constats du thème
                  </span>
                  <span className="sc-link">Voir le détail</span>
                </div>
                <p>
                  Le parc immobilier est globalement assuré (habitation propriétaire non occupant ou
                  multirisque), et le prêt unique est couvert en décès, perte totale et irréversible
                  d’autonomie et invalidité, à une quotité de {DASH} par tête.
                </p>
                <p>
                  Deux points appellent une régularisation rapide : des parkings détenus en nom propre
                  sans responsabilité civile, et un contrat d’assurance libellé au nom d’une personne
                  physique inexistante alors que le bien appartient à la SCI, ce qui expose le contrat
                  à un risque de nullité.
                </p>
                <div className="sp-recap">
                  <div className="spr spr-r">
                    <div className="spr-h">Principaux risques</div>
                    <ul>
                      <li>Parkings sans responsabilité civile (charge sur le patrimoine personnel).</li>
                      <li>Désignation erronée de l’assuré (risque de nullité).</li>
                      <li>Quotité d’assurance emprunteur de {DASH} par tête à apprécier.</li>
                    </ul>
                  </div>
                  <div className="spr spr-o">
                    <div className="spr-h">Principales opportunités</div>
                    <ul>
                      <li>Responsabilité civile dédiée aux parkings, à coût modique.</li>
                      <li>Mise en cohérence du contrat avec le propriétaire réel.</li>
                      <li>Revue de la quotité au regard des objectifs du foyer.</li>
                    </ul>
                  </div>
                  <div className="spr spr-opt">
                    <div className="spr-h">Principales optimisations</div>
                    <ul>
                      <li>Souscrire une responsabilité civile sur les emplacements.</li>
                      <li>Régulariser la dénomination de l’assuré.</li>
                      <li>Réexaminer la quotité de couverture du prêt.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Module : assurance des actifs professionnels ────────────────── */}
      <div className="immo-mod" id="assur-pro">
        <div className="page modfold">
          <div className="shead">
            <div className="pic">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C68E0E"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Analyse des assurances</div>
              <h1>Assurance des actifs professionnels</h1>
            </div>
            <Cert level="c-moy" label="Confiance modérée · 78 %" id="assur-pro" />
            <span className="modchev eng-only">
              <Chevron strokeWidth={2.2} />
            </span>
          </div>
          <div className="mod-body">
            <Bloc blocKey="Rôle de l’assurance des actifs professionnels" className="lead">
              L’assurance des actifs professionnels protège l’outil de travail du foyer et la
              continuité de ses revenus d’activité. Pour deux praticiens exerçant en cabinet et
              détenant leurs locaux par une société civile immobilière, elle couvre la responsabilité
              encourue dans l’exercice, les biens d’exploitation et la capacité à maintenir l’activité
              après un sinistre.
            </Bloc>
            <Bloc blocKey="Axes de l’assurance des actifs professionnels">
              <p>L’analyse de cette couverture repose sur quatre axes majeurs :</p>
              <ul className="dlist">
                <li>La responsabilité civile professionnelle et d’exploitation.</li>
                <li>La multirisque du cabinet et l’assurance du matériel professionnel.</li>
                <li>La garantie des pertes d’exploitation et des frais généraux permanents.</li>
                <li>La protection des données de santé et les risques liés à l’activité numérique.</li>
              </ul>
              <p>
                Son objectif est de vérifier que l’outil professionnel et les revenus qu’il génère
                sont protégés à hauteur de leur valeur réelle, et d’identifier les garanties
                insuffisantes ou absentes.
              </p>
            </Bloc>

            {/* sous-accordéon : RC professionnelle */}
            <div className="subacc" id="ass-prorc">
              <div className="sub-h">
                <span className="sub-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
                    <path d="M9.5 12l1.8 1.8L15 10" />
                  </svg>
                </span>
                <span className="sub-tt">Responsabilité civile professionnelle et d’exploitation</span>
                <span style={{ marginLeft: "auto" }}>
                  <Cert level="c-forte" label="Confiance forte · 85 %" id="assProRC" />
                </span>
                <span className="sub-chev">
                  <Chevron strokeWidth={2.4} />
                </span>
              </div>
              <div className="subbody">
                <Bloc blocKey="Responsabilité civile professionnelle et d’exploitation">
                  <p>
                    Chaque praticien est tenu de couvrir sa responsabilité civile professionnelle au
                    titre de l’exercice de l’art dentaire. Cette garantie répond des conséquences
                    pécuniaires des dommages causés à un patient dans le cadre des soins.
                  </p>
                  <p>
                    La responsabilité civile d’exploitation complète ce socle en couvrant les dommages
                    causés aux tiers du fait de l’exploitation du cabinet : accueil du public, locaux
                    et personnel.
                  </p>
                  <p>
                    Les attestations transmises confirment la souscription de ces deux garanties pour
                    les deux cabinets.
                  </p>
                </Bloc>
              </div>
            </div>

            {/* sous-accordéon : multirisque et matériel */}
            <div className="subacc" id="ass-promat">
              <div className="sub-h">
                <span className="sub-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                    <path d="M14.5 5.5a3.5 3.5 0 0 0-4.8 4.2L4 15.6 8.4 20l5.9-5.7a3.5 3.5 0 0 0 4.2-4.8l-2.4 2.4-2-2z" />
                  </svg>
                </span>
                <span className="sub-tt">Multirisque du cabinet et matériel professionnel</span>
                <span style={{ marginLeft: "auto" }}>
                  <Cert level="c-moy" label="Confiance modérée · 80 %" id="assProMat" />
                </span>
                <span className="sub-chev">
                  <Chevron strokeWidth={2.4} />
                </span>
              </div>
              <div className="subbody">
                <Bloc blocKey="Multirisque du cabinet et matériel professionnel">
                  <p>
                    Le cabinet est assuré par un contrat multirisque professionnelle couvrant les
                    locaux, le mobilier et le matériel d’exploitation contre l’incendie, le dégât des
                    eaux, le vol et le bris de matériel.
                  </p>
                  <p>
                    Le matériel dentaire (fauteuils de soin, imagerie, stérilisation) représente une
                    part importante de la valeur assurée et appelle une attention particulière sur les
                    capitaux déclarés.
                  </p>
                </Bloc>
                <Kicker>Risques et opportunités</Kicker>
                <RiskBlock data={riskMateriel} />
              </div>
            </div>

            {/* sous-accordéon : pertes d'exploitation */}
            <div className="subacc" id="ass-prope">
              <div className="sub-h">
                <span className="sub-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                    <path d="M4 7h10M4 12h7M4 17h13" />
                    <path d="M18 4l3 3-3 3" />
                  </svg>
                </span>
                <span className="sub-tt">Pertes d’exploitation et continuité d’activité</span>
                <span style={{ marginLeft: "auto" }}>
                  <Cert level="c-moy" label="Confiance modérée · 78 %" id="assProPE" />
                </span>
                <span className="sub-chev">
                  <Chevron strokeWidth={2.4} />
                </span>
              </div>
              <div className="subbody">
                <Bloc blocKey="Pertes d’exploitation et continuité d’activité">
                  <p>
                    La garantie des pertes d’exploitation prend en charge, après un sinistre matériel,
                    la baisse du chiffre d’affaires et les frais généraux qui continuent de courir
                    pendant la période de reconstitution de l’activité.
                  </p>
                  <p>
                    Pour une activité libérale fortement dépendante de l’outil de travail et de la
                    présence du praticien, l’interruption d’exploitation constitue un risque majeur
                    pour l’équilibre du foyer.
                  </p>
                </Bloc>
                <Kicker>Risques et opportunités</Kicker>
                <RiskBlock data={riskPertesExpl} />
              </div>
            </div>

            {/* sous-accordéon : risques numériques */}
            <div className="subacc" id="ass-procyber">
              <div className="sub-h">
                <span className="sub-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}>
                    <ellipse cx="12" cy="6" rx="7" ry="3" />
                    <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
                    <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
                  </svg>
                </span>
                <span className="sub-tt">Protection des données de santé et risques numériques</span>
                <span style={{ marginLeft: "auto" }}>
                  <Cert level="c-moy" label="Confiance modérée · 75 %" id="assProCyber" />
                </span>
                <span className="sub-chev">
                  <Chevron strokeWidth={2.4} />
                </span>
              </div>
              <div className="subbody">
                <Bloc blocKey="Protection des données de santé et risques numériques">
                  <p>
                    L’activité dentaire implique le traitement de données de santé, soumises à une
                    protection renforcée. Un incident (intrusion, rançongiciel, perte de données)
                    exposerait le cabinet à une interruption d’activité et à des obligations
                    réglementaires.
                  </p>
                  <p>
                    Aucune garantie dédiée aux risques numériques n’a été identifiée parmi les
                    contrats en place.
                  </p>
                </Bloc>
                <Kicker>Risques et opportunités</Kicker>
                <RiskBlock data={riskNumerique} />
              </div>
            </div>

            {/* synthèse du thème : actifs professionnels */}
            <div className="synthacc">
              <div className="subttl anchor synth-h" id="synthese-theme-pro">
                <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
                  <path d="M9 11l3 3 8-8" />
                  <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
                </svg>{" "}
                Synthèse du thème
                <Chevron className="synthchev" strokeWidth={2.2} />
              </div>
              <div className="synthprose">
                <div className="sp-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
                    <path d="M8 8h6M8 12h8M8 16h5" />
                  </svg>{" "}
                  Assurance des actifs professionnels — lecture stratégique
                </div>
                <div className="synth-cert sc-green eng-only" data-certif="assProTh">
                  <span className="sc-ico">
                    <EyeSvg />
                  </span>
                  <span>
                    <b>Confiance modérée · 78 %</b> · synthèse fondée sur les constats du thème
                  </span>
                  <span className="sc-link">Voir le détail</span>
                </div>
                <p>
                  Les responsabilités professionnelle et d’exploitation des deux praticiens sont
                  couvertes, ce qui constitue le socle indispensable de l’activité.
                </p>
                <p>
                  Trois fragilités ressortent en revanche : un matériel d’exploitation sous-évalué
                  exposé à la règle proportionnelle, l’absence de garantie des pertes d’exploitation
                  alors que le revenu du foyer dépend de l’outil de travail, et l’absence de
                  couverture des risques numériques propres au traitement des données de santé.
                </p>
                <div className="sp-recap">
                  <div className="spr spr-r">
                    <div className="spr-h">Principaux risques</div>
                    <ul>
                      <li>Matériel professionnel sous-évalué (règle proportionnelle).</li>
                      <li>Pertes d’exploitation non couvertes.</li>
                      <li>Risques numériques non assurés.</li>
                    </ul>
                  </div>
                  <div className="spr spr-o">
                    <div className="spr-h">Principales opportunités</div>
                    <ul>
                      <li>Réévaluation des capitaux et renonciation à la proportionnelle.</li>
                      <li>Garantie de pertes d’exploitation adossée à la multirisque.</li>
                      <li>Garantie des risques numériques adaptée à une activité de santé.</li>
                    </ul>
                  </div>
                  <div className="spr spr-opt">
                    <div className="spr-h">Principales optimisations</div>
                    <ul>
                      <li>Actualiser les capitaux du matériel.</li>
                      <li>Souscrire la garantie de pertes d’exploitation.</li>
                      <li>Étudier une garantie des risques numériques.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Module : synthèse de l'analyse des assurances ───────────────── */}
      <div className="immo-mod" id="assur-synth">
        <div className="page modfold">
          <div className="shead">
            <div className="pic">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C68E0E"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 11l3 3 8-8" />
                <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Analyse des assurances</div>
              <h1>Synthèse de l’analyse des assurances</h1>
            </div>
            <Cert level="c-forte" label="Confiance forte · 84 %" id="assurancesth" />
            <span className="modchev eng-only">
              <Chevron strokeWidth={2.2} />
            </span>
          </div>
          <div className="mod-body">
            <Kicker>Risques et opportunités consolidés</Kicker>
            <RiskBlock data={consoPersonnes} />
            <RiskBlock data={consoBiens} />
            <RiskBlock data={consoActifs} />

            <Kicker style={{ margin: "18px 0 5px" }}>
              Rappel des risques et opportunités des modules
            </Kicker>
            <Bloc blocKey="Rappel consolidé des risques et opportunités" className="lead">
              Pour mémoire, cette section rassemble en un seul endroit l’ensemble des risques et
              opportunités identifiés dans les modules de l’analyse des assurances.
            </Bloc>
            <RiskBlock data={riskPrevDeces} />
            <RiskBlock data={riskTarif} />
            <RiskBlock data={riskClause} />
            <RiskBlock data={riskParkings} />
            <RiskBlock data={designation} />
            <RiskBlock data={riskMateriel} />
            <RiskBlock data={riskPertesExpl} />
            <RiskBlock data={riskNumerique} />

            {/* synthèse globale */}
            <div className="synthacc">
              <div className="subttl anchor synth-h" id="synthese-globale-assurances">
                <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
                  <path d="M9 11l3 3 8-8" />
                  <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
                </svg>{" "}
                Synthèse du thème
                <Chevron className="synthchev" strokeWidth={2.2} />
              </div>
              <div className="synthprose">
                <div className="sp-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
                    <path d="M8 8h6M8 12h8M8 16h5" />
                  </svg>{" "}
                  Ensemble des couvertures assurantielles — lecture consolidée
                </div>
                <div className="synth-cert sc-green eng-only" data-certif="assurancesth">
                  <span className="sc-ico">
                    <EyeSvg />
                  </span>
                  <span>
                    <b>Confiance forte · 84 %</b> · synthèse fondée sur les constats du thème
                  </span>
                  <span className="sc-link">Voir le détail</span>
                </div>
                <p>
                  Les couvertures assurantielles du foyer sont globalement en place et techniquement
                  adaptées à l’exercice de la chirurgie dentaire. L’analyse fait toutefois ressortir
                  des optimisations côté personnes, des régularisations côté biens, et un renforcement
                  de la protection de l’outil professionnel.
                </p>
                <p>
                  Côté personnes, le capital décès Madelin servi en rente, la tarification à l’âge
                  atteint et des clauses bénéficiaires standard appellent une revue. Côté biens,
                  l’absence de responsabilité civile sur les parkings et la désignation erronée de
                  l’assuré exposent le foyer à un coût non couvert et à un risque de nullité. Côté
                  professionnel, le matériel est sous-évalué et l’activité n’est protégée ni contre
                  les pertes d’exploitation ni contre les risques numériques.
                </p>
                <p>
                  Ces leviers (sécurisation du conjoint, stabilisation du coût de la prévoyance,
                  réécriture des clauses bénéficiaires, régularisation des contrats de biens,
                  réévaluation du matériel et couverture de la continuité d’activité) sont développés
                  dans le volet préconisations.
                </p>
                <div className="sp-recap">
                  <div className="spr spr-r">
                    <div className="spr-h">Principaux risques</div>
                    <ul>
                      <li>Personnes : capital décès en rente et clauses standard.</li>
                      <li>Biens : parkings non assurés et désignation erronée.</li>
                      <li>Professionnel : matériel sous-évalué et continuité non couverte.</li>
                    </ul>
                  </div>
                  <div className="spr spr-o">
                    <div className="spr-h">Principales opportunités</div>
                    <ul>
                      <li>Sécurisation de la couverture et de la transmission du conjoint.</li>
                      <li>Mise en cohérence juridique des contrats de biens.</li>
                      <li>Protection renforcée de l’outil et de la continuité d’activité.</li>
                    </ul>
                  </div>
                  <div className="spr spr-opt">
                    <div className="spr-h">Principales optimisations</div>
                    <ul>
                      <li>Compléter et réécrire les contrats de personnes.</li>
                      <li>Régulariser l’assurance des biens.</li>
                      <li>Réévaluer le matériel et couvrir la continuité d’activité.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
