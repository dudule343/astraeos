/**
 * Section « Analyse matrimoniale » du document d'audit (maquette lignes 3578-3591).
 *
 * Quatre modules à ascenseur (.immo-mod > .page.modfold) précédés d'un module
 * d'introduction : régime matrimonial et gestion des biens, responsabilité face
 * aux dettes et séparation, aménagements du contrat de mariage, puis synthèse de
 * l'analyse. Portage fidèle de la maquette (mêmes sous-titres, mêmes encarts
 * d'analyse .ablock, mêmes SVG, mêmes classes) pour que le JS global (accordéons
 * .modfold / .fold / .synthacc, panneaux de confiance) s'y raccroche ensuite.
 *
 * Branché sur le RÉEL :
 *  - le régime matrimonial (donnees.foyer.maritalRegime) et la date de mariage
 *    (donnees.foyer.marriageDate) alimentent les énoncés qui citent ces faits du
 *    foyer. Quand l'une de ces données manque, un emplacement honnête éditable
 *    (« régime matrimonial à compléter » / « date du mariage à compléter ») est
 *    affiché plutôt qu'une valeur inventée.
 *
 * État vide HONNÊTE ailleurs : les pourcentages de confiance des panneaux CERTIF
 * sont des estimations qui n'existent pas en base ; ils deviennent « Confiance ·
 * à évaluer ». Le corps méthodologique (références au Code civil, masses
 * patrimoniales, gage des créanciers, aménagements du contrat) est reproduit
 * fidèlement comme contenu éditable et validable via le volet de révision.
 *
 * Server Component : il ne compose que des éléments statiques et des <Bloc>
 * (composant client) rendus dans l'arbre du BlocProvider.
 */

import "../../../../_styles/sections/matrimonial.css";

import { type CSSProperties, type ReactNode } from "react";

import { Bloc } from "../Bloc";
import { MARITAL_REGIME_LABELS } from "../../../../_data/fiche-client";
import type { EtudeDonnees } from "../../../../_data/etudes-patrimoniales";

const CONF = "Confiance · à évaluer";

// Sous-titre doré des modules (style en-ligne repris de la maquette).
const GOLD_SUB: CSSProperties = {
  color: "#A57608",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: ".6px",
  textTransform: "uppercase",
  margin: "15px 0 5px",
};

function GoldLabel({ children }: { children: ReactNode }) {
  return <div style={GOLD_SUB}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Branchement réel : régime matrimonial + date de mariage
// ---------------------------------------------------------------------------

/** Libellé du régime en minuscule pour usage dans une phrase (« la séparation… »). */
function regimeInline(donnees: EtudeDonnees): string {
  const key = donnees.foyer.maritalRegime;
  const label = key ? MARITAL_REGIME_LABELS[key] ?? key : null;
  return label ? label.charAt(0).toLowerCase() + label.slice(1) : "régime matrimonial à compléter";
}

/** Date de mariage réelle en toutes lettres (« 28 août 1999 »), honnête sinon. */
function marriageDateLong(donnees: EtudeDonnees): string {
  const iso = donnees.foyer.marriageDate;
  if (!iso) return "date du mariage à compléter";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "date du mariage à compléter";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

/** Année du mariage réelle, honnête sinon. */
function marriageYear(donnees: EtudeDonnees): string {
  const iso = donnees.foyer.marriageDate;
  if (!iso) return "année à compléter";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "année à compléter";
  return String(d.getFullYear());
}

// ---------------------------------------------------------------------------
// Icônes partagées des encarts d'analyse (chemins SVG repris de la maquette)
// ---------------------------------------------------------------------------

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ConstatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
    </svg>
  );
}

function ImpactIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 19V5M4 15l5-4 4 3 7-7" />
    </svg>
  );
}

function JustifIcon() {
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

function ShieldChart() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
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

function ShieldWarn() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
      <path d="M12 7.6v4.4M12 14.8h.01" stroke="#FAF8F3" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

function ShieldShield() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
      <circle cx="12" cy="12" r="3.9" stroke="#FAF8F3" strokeWidth={1.3} fill="none" />
      <path d="M12 9.7v4.6M10.3 12h3.4" stroke="#FAF8F3" strokeWidth={1.1} strokeLinecap="round" />
    </svg>
  );
}

function ShieldDoc() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="#102D50" />
      <path d="M8 7h8M8 11h8M8 15h5" stroke="#FAF8F3" strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Encart d'analyse (risque / opportunité / optimisation) — structure commune
// ---------------------------------------------------------------------------

type ABlockProps = {
  blocKey: string;
  icon: ReactNode;
  title: ReactNode;
  certClass: "c-forte" | "c-moy";
  constat: ReactNode;
  risque: ReactNode;
  opportunite: ReactNode;
  optimisation: ReactNode;
  impact: ReactNode;
  justification: ReactNode;
  preconisation: ReactNode;
};

function ABlock({
  blocKey,
  icon,
  title,
  certClass,
  constat,
  risque,
  opportunite,
  optimisation,
  impact,
  justification,
  preconisation,
}: ABlockProps) {
  return (
    <Bloc blocKey={blocKey} className="ablock fold">
      <div className="ab-h">
        <span className="mx">{icon}</span>
        <span className="tt">{title}</span>
        <span className={`cert ${certClass} eng-only`}>
          <span>{CONF}</span>
          <span className="co">
            <EyeIcon />
          </span>
        </span>
      </div>
      <div className="ab-grid">
        <div className="dim">
          <div className="dh">
            <ConstatIcon /> Constat &amp; origine
          </div>
          {constat}
        </div>
        <div className="dim">
          <div className="rio">
            <div className="it r">
              <span className="lab">Risque</span>
              {risque}
            </div>
            <div className="it o">
              <span className="lab">Opportunité</span>
              {opportunite}
            </div>
            <div className="it opt">
              <span className="lab">Optimisation</span>
              {optimisation}
            </div>
          </div>
        </div>
      </div>
      <div className="ab-grid" style={{ borderTop: "1px solid var(--navy-100)" }}>
        <div className="dim">
          <div className="dh">
            <ImpactIcon /> Impact quantifié
          </div>
          <p>{impact}</p>
        </div>
        <div className="dim">
          <div className="dh">
            <JustifIcon /> Justification
          </div>
          <p>{justification}</p>
        </div>
      </div>
      <div className="ab-foot">
        <ArrowIcon />
        <span>
          <b>Préconisation :</b> {preconisation}
        </span>
      </div>
    </Bloc>
  );
}

// ---------------------------------------------------------------------------
// Définitions des six encarts (réutilisés dans les modules et la synthèse)
// ---------------------------------------------------------------------------

function buildABlocks(donnees: EtudeDonnees): Record<string, ReactNode> {
  const reg = regimeInline(donnees);
  const dateLong = marriageDateLong(donnees);

  return {
    autonomie: (
      <ABlock
        blocKey="Autonomie patrimoniale"
        icon={<ShieldChart />}
        title="Autonomie patrimoniale de la séparation de biens"
        certClass="c-forte"
        constat={
          <ul className="dlist">
            <li>
              Le régime de {reg} (articles 1536 à 1541 du Code civil) s&rsquo;applique depuis le {dateLong}.
            </li>
            <li>Chaque époux administre, jouit et dispose librement de ses biens propres.</li>
          </ul>
        }
        risque="Une gestion non documentée des biens peut compliquer la preuve de leur caractère propre."
        opportunite="Le patrimoine de chaque époux reste protégé des difficultés de l’autre ; les revenus sont libres d’affectation, sous réserve de la contribution aux charges du mariage."
        optimisation="Maintenir une séparation effective des comptes et des actifs de chaque époux."
        impact="Autonomie patrimoniale forte et gestion indépendante des biens propres."
        justification="Articles 1536 à 1541 du Code civil."
        preconisation="conserver une séparation effective des patrimoines."
      />
    ),
    indivision: (
      <ABlock
        blocKey="Présomption d’indivision"
        icon={<ShieldWarn />}
        title="Présomption d’indivision des biens non justifiés"
        certClass="c-moy"
        constat={
          <ul className="dlist">
            <li>
              À défaut de preuve du caractère propre, un bien est réputé indivis entre les époux
              (article 1538, alinéa 3 du Code civil).
            </li>
            <li>Les achats en cours de mariage sans preuve de propriété sont réputés indivis.</li>
          </ul>
        }
        risque="Requalification possible en indivision des biens dont l’origine n’est pas établie ; les actes importants requièrent alors l’unanimité."
        opportunite="La documentation de l’origine et du financement des biens écarte la présomption d’indivision."
        optimisation="Documenter l’origine et le financement de chaque acquisition."
        impact="Indivision par moitié possible pour les biens non justifiés."
        justification="Article 1538, alinéa 3 ; articles 815 et suivants du Code civil."
        preconisation="conserver les justificatifs d’origine et de financement des biens."
      />
    ),
    protection: (
      <ABlock
        blocKey="Protection du patrimoine personnel"
        icon={<ShieldShield />}
        title="Protection du patrimoine personnel face aux dettes"
        certClass="c-forte"
        constat={
          <ul className="dlist">
            <li>Chaque époux est seul responsable de ses dettes personnelles.</li>
            <li>Les biens de l’autre ne peuvent être saisis à ce titre.</li>
          </ul>
        }
        risque="Un engagement solidaire ou une caution réduit cette protection."
        opportunite="Les créanciers de l’un ne peuvent atteindre le patrimoine de l’autre ; isolation des risques de chaque époux."
        optimisation="Éviter les engagements solidaires non nécessaires."
        impact="Patrimoine personnel protégé des dettes du conjoint."
        justification="Régime de séparation de biens."
        preconisation="privilégier les engagements individuels."
      />
    ),
    solidaires: (
      <ABlock
        blocKey="Engagements solidaires"
        icon={<ShieldWarn />}
        title="Engagements solidaires et dépenses ménagères"
        certClass="c-moy"
        constat={
          <ul className="dlist">
            <li>
              La responsabilité peut être partagée en cas d’engagement conjoint ou de caution, de
              dépenses ménagères du régime primaire, ou de dette sur un bien indivis.
            </li>
          </ul>
        }
        risque="Un engagement solidaire expose au paiement du tout ; les dépenses ménagères engagent les deux époux."
        opportunite="Un engagement conjoint, non solidaire, limite l’exposition à la part de chacun."
        optimisation="Préférer les engagements conjoints aux engagements solidaires."
        impact="Exposition potentielle des deux patrimoines en cas d’engagement solidaire."
        justification="Régime primaire ; règles du gage des créanciers."
        preconisation="encadrer les cautions et les engagements solidaires."
      />
    ),
    contribution: (
      <ABlock
        blocKey="Clause de contribution au jour le jour"
        icon={<ShieldDoc />}
        title="Clause de contribution « au jour le jour » : une protection en cas de séparation"
        certClass="c-forte"
        constat={
          <ul className="dlist">
            <li>
              Une clause d’exécution « au jour le jour » de la contribution aux charges du mariage
              figure au contrat.
            </li>
            <li>
              Elle rend les époux irrecevables à contester leur part de contribution ultérieurement
              (aménagement de l’article 214 du Code civil).
            </li>
          </ul>
        }
        risque="Elle nécessite une vigilance particulière sur le paiement des dépenses courantes, afin d’éviter tout déséquilibre économique majeur non compensable."
        opportunite="Elle est particulièrement protectrice en cas de séparation : un époux ne peut réclamer un remboursement au motif qu’il aurait payé plus que sa part durant la vie commune."
        optimisation="Maintenir un suivi des dépenses courantes pour préserver l’équilibre de la répartition."
        impact="Équilibre dans la répartition des dépenses du foyer, sécurisé par une présomption de paiement libératoire."
        justification="Contrat de mariage et clause d’exécution « au jour le jour » (article 214 du Code civil)."
        preconisation={<>veiller à l’équilibre du paiement des dépenses courantes (partie « Préconisations »).</>}
      />
    ),
    inventaire: (
      <ABlock
        blocKey="Absence d’inventaire initial"
        icon={<ShieldWarn />}
        title="Absence d’inventaire initial : un risque de présomption 50/50"
        certClass="c-moy"
        constat={
          <ul className="dlist">
            <li>
              Le contrat ayant été signé en {marriageYear(donnees)} sans état descriptif, il pourrait
              être complexe de prouver l’origine de certains biens ou liquidités détenus avant le
              mariage.
            </li>
          </ul>
        }
        risque="En cas de dissolution du régime, la présomption de propriété par moitié s’appliquerait par défaut pour tout bien dont le titre de propriété n’aurait pas été clairement établi."
        opportunite="L’établissement d’un état des biens propres détenus avant le mariage réduirait l’incertitude sur leur origine."
        optimisation="Constituer un inventaire des biens et liquidités propres antérieurs au mariage, avec les justificatifs disponibles."
        impact="Présomption de propriété par moitié pour tout bien non justifié, lors de la liquidation du régime."
        justification={`Contrat de mariage de ${marriageYear(donnees)} sans état descriptif ; présomption d’indivision (article 1538, alinéa 3 du Code civil).`}
        preconisation={<>constituer un inventaire des biens propres (partie « Préconisations »).</>}
      />
    ),
  };
}

// ---------------------------------------------------------------------------
// Brique de synthèse rédactionnelle (en-tête + chevron + corps)
// ---------------------------------------------------------------------------

function SynthAcc({
  anchorId,
  heading,
  children,
}: {
  anchorId: string;
  heading: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="synthacc">
      <div className="subttl anchor synth-h" id={anchorId}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#102D50" strokeWidth={1.8}>
          <path d="M9 11l3 3 8-8" />
          <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
        </svg>{" "}
        Synthèse du thème
        <svg className="synthchev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      <div className="synthprose">
        <div className="sp-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
            <path d="M8 8h6M8 12h8M8 16h5" />
          </svg>{" "}
          {heading}
        </div>
        <div className="synth-cert sc-green eng-only">
          <span className="sc-ico">
            <EyeIcon />
          </span>
          <span>
            <b>{CONF}</b> · synthèse fondée sur les constats du thème
          </span>
          <span className="sc-link">Voir le détail</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function Recap({
  risques,
  opportunites,
  optimisations,
}: {
  risques: string[];
  opportunites: string[];
  optimisations: string[];
}) {
  return (
    <div className="sp-recap">
      <div className="spr spr-r">
        <div className="spr-h">Principaux risques</div>
        <ul>
          {risques.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
      <div className="spr spr-o">
        <div className="spr-h">Principales opportunités</div>
        <ul>
          {opportunites.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
      <div className="spr spr-opt">
        <div className="spr-h">Principales optimisations</div>
        <ul>
          {optimisations.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// En-tête de module à ascenseur
// ---------------------------------------------------------------------------

function ModHead({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="shead">
      <div className="pic">{icon}</div>
      <div style={{ flex: 1 }}>
        <div className="crumb2">Analyse matrimoniale</div>
        <h1>{title}</h1>
      </div>
      <span className="cert c-forte eng-only">
        <span>{CONF}</span>
        <span className="co">
          <EyeIcon />
        </span>
      </span>
      <span className="modchev eng-only">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section complète
// ---------------------------------------------------------------------------

export default function MatrimonialSection({ donnees }: { donnees: EtudeDonnees }) {
  const reg = regimeInline(donnees);
  const dateLong = marriageDateLong(donnees);
  const ab = buildABlocks(donnees);

  return (
    <>
      {/* Introduction du thème */}
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
                <circle cx="9" cy="14" r="6" />
                <circle cx="15" cy="10" r="6" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="crumb2">Audit patrimonial</div>
              <h1>Analyse matrimoniale</h1>
            </div>
          </div>
          <div className="mod-body">
            <Bloc blocKey="Texte d’introduction de l’analyse matrimoniale" className="lead">
              Le cadre juridique de l’union d’un couple détermine la répartition des biens, leur mode
              de gestion ainsi que les conséquences en cas de séparation ou de succession. Il
              constitue un élément structurant dans l’organisation patrimoniale et influence
              directement la protection de chaque membre du foyer.
            </Bloc>
            <Bloc blocKey="Portée de l’analyse matrimoniale">
              <p>
                Chaque régime comporte des spécificités propres, notamment en matière d’acquisition
                des biens, de gestion des actifs communs et d’engagement vis-à-vis des créanciers. Son
                analyse permet d’anticiper les risques éventuels et, si nécessaire, d’envisager des
                ajustements.
              </p>
            </Bloc>
          </div>
        </div>
      </div>

      {/* Régime matrimonial et gestion des biens */}
      <div className="immo-mod" id="mat-regime">
        <div className="page modfold">
          <ModHead
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C68E0E"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v18M7 21h10M5 7h14" />
                <path d="M5 7l-2.5 5h5z" />
                <path d="M19 7l-2.5 5h5z" />
              </svg>
            }
            title="Régime matrimonial et gestion des biens"
          />
          <div className="mod-body">
            <Bloc blocKey="Régime matrimonial applicable">
              <p>
                Le régime de la {reg} (articles 1536 à 1541 du Code civil) organise une autonomie
                patrimoniale stricte : chacun des époux conserve l’administration, la jouissance et la
                libre disposition de ses biens personnels. Ce régime s’applique aux clients depuis le{" "}
                {dateLong}.
              </p>
            </Bloc>
            <GoldLabel>Définition des masses patrimoniales</GoldLabel>
            <p>
              Ce régime distingue deux patrimoines totalement distincts, propres à chaque époux. Il
              n’existe pas de biens communs, sauf si les époux ont institué une société d’acquêts dans
              leur contrat ou s’ils acquièrent un bien en indivision. À défaut de preuve du caractère
              propre, le bien est réputé indivis entre les époux (présomption d’indivision, article
              1538, alinéa 3 du Code civil).
            </p>
            <ul className="dlist">
              <li>
                <b>Biens propres :</b> chaque époux administre, jouit et dispose librement de ses biens
                propres, pour tous actes (conservatoires, d’administration, de disposition). Les
                revenus issus du travail ou du patrimoine propre sont libres d’affectation, sous
                réserve de la contribution aux charges du mariage.
              </li>
              <li>
                <b>Biens indivis :</b> les biens acquis ensemble (ou réputés tels faute de preuve)
                relèvent de l’indivision : les actes importants requièrent en principe l’unanimité des
                indivisaires. Des aménagements existent lorsque l’un détient au moins deux tiers
                (articles 815 et suivants du Code civil).
              </li>
              <li>
                <b>Société d’acquêts (si convenue) :</b> si une société d’acquêts est prévue au
                contrat, les règles de la communauté légale s’appliquent à cette seule masse. Le reste
                demeure en séparation de biens.
              </li>
            </ul>
            <GoldLabel>Précisions utiles</GoldLabel>
            <p>
              Concernant les achats de bien en cours de mariage, sauf preuve de propriété, les biens
              sont réputés indivis (Code civil, article 1538, alinéa 3). Les règles du régime primaire
              (protection du logement familial, contribution aux charges du mariage) s’appliquent, même
              dans un régime de séparation de biens.
            </p>
            <GoldLabel>Risques et opportunités</GoldLabel>
            {ab.autonomie}
            {ab.indivision}
            <SynthAcc anchorId="synthese-theme-mat-regime" heading="Régime matrimonial et gestion des biens">
              <p>
                Le régime de {reg} assure une autonomie patrimoniale stricte de chaque époux. La
                principale réserve tient à la présomption d’indivision des biens dont le caractère
                propre n’est pas établi.
              </p>
              <Recap
                risques={[
                  "Présomption d’indivision des biens non justifiés.",
                  "Gestion des biens indivis soumise à l’unanimité.",
                ]}
                opportunites={[
                  "Autonomie patrimoniale et gestion indépendante des biens propres.",
                  "Liberté d’affectation des revenus propres.",
                ]}
                optimisations={[
                  "Documenter l’origine et le financement des acquisitions.",
                  "Maintenir une séparation effective des comptes.",
                ]}
              />
            </SynthAcc>
          </div>
        </div>
      </div>

      {/* Responsabilité face aux dettes et séparation */}
      <div className="immo-mod" id="mat-dettes">
        <div className="page modfold">
          <ModHead
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C68E0E"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <ellipse cx="12" cy="6" rx="7" ry="3" />
                <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
                <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
              </svg>
            }
            title="Responsabilité face aux dettes et séparation"
          />
          <div className="mod-body">
            <GoldLabel>Règle générale</GoldLabel>
            <p>
              Chaque époux est seul responsable de ses dettes personnelles. Les biens de l’autre ne
              peuvent être saisis à ce titre. Ce principe est l’un des avantages majeurs de la
              séparation de biens.
            </p>
            <GoldLabel>Situations engageant les deux époux</GoldLabel>
            <p>La responsabilité peut être partagée lorsque :</p>
            <ul className="dlist">
              <li>l’engagement est pris conjointement ou avec la caution de l’autre époux ;</li>
              <li>
                il s’agit de dépenses ménagères (entretien du ménage, éducation des enfants) relevant
                du régime primaire ;
              </li>
              <li>la dette concerne un bien indivis (chacun répond à proportion de ses droits).</li>
            </ul>
            <GoldLabel>Étendue du gage des créanciers</GoldLabel>
            <ul className="dlist">
              <li>
                <b>Dette personnelle :</b> poursuite sur les seuls biens propres du débiteur (et sa
                quote-part indivise, le cas échéant).
              </li>
              <li>
                <b>Dette relative à un bien indivis :</b> poursuite sur la part indivise du débiteur.
              </li>
              <li>
                <b>Caution ou co-emprunteur :</b> l’époux engage tous ses biens personnels ; un
                engagement conjoint limite l’exposition (part de chacun), alors que l’engagement
                solidaire expose au paiement du tout.
              </li>
            </ul>
            <GoldLabel>Conséquences en cas de séparation — liquidation du régime</GoldLabel>
            <p>
              En séparation de biens, il n’y a pas de masse commune à partager. Chacun reprend ses
              biens. S’il y a eu des flux croisés (avances, acquisitions indivises), des comptes entre
              époux sont dressés pour solder d’éventuelles créances réciproques.
            </p>
            <Bloc blocKey="Point de vigilance — charges du mariage" className="lead">
              <b>Point de vigilance :</b> les dépenses liées au logement familial sont en principe des
              charges du mariage et ne créent pas de créance entre époux si la contribution est
              proportionnée aux facultés.
            </Bloc>
            <GoldLabel>Biens indivis post-liquidation et licitation</GoldLabel>
            <p>
              Les biens acquis en indivision demeurent indivis jusqu’au partage, que chacun peut
              demander à tout moment (Code civil, article 815). À défaut d’accord, il peut être procédé
              à une licitation (vente aux enchères). Les règles d’attribution préférentielle sont
              applicables (Code civil, article 1542).
            </p>
            <GoldLabel>Risques et opportunités</GoldLabel>
            {ab.protection}
            {ab.solidaires}
            <SynthAcc
              anchorId="synthese-theme-mat-dettes"
              heading="Responsabilité face aux dettes et séparation"
            >
              <p>
                La séparation de biens protège le patrimoine personnel de chaque époux face aux dettes
                de l’autre. Le point de vigilance porte sur les engagements solidaires et les dépenses
                ménagères, qui peuvent engager les deux époux.
              </p>
              <Recap
                risques={[
                  "Engagements solidaires exposant au paiement du tout.",
                  "Dépenses ménagères engageant les deux époux.",
                ]}
                opportunites={[
                  "Patrimoine personnel protégé des dettes du conjoint.",
                  "Engagement conjoint limitant l’exposition à la part de chacun.",
                ]}
                optimisations={[
                  "Encadrer les cautions et les engagements solidaires.",
                  "Privilégier les engagements individuels.",
                ]}
              />
            </SynthAcc>
          </div>
        </div>
      </div>

      {/* Aménagements du contrat de mariage */}
      <div className="immo-mod" id="mat-amenagements">
        <div className="page modfold">
          <ModHead
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C68E0E"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 3h7l5 5v13H7z" />
                <path d="M14 3v5h5" />
                <path d="M9.5 13l1.5 1.5L14 11" />
              </svg>
            }
            title="Aménagements du contrat de mariage"
          />
          <div className="mod-body">
            <Bloc blocKey="Aménagements du contrat de mariage">
              <p>
                Le contrat de mariage comporte plusieurs aménagements qui précisent et renforcent la
                portée du régime de {reg} :
              </p>
            </Bloc>
            <ul className="dlist">
              <li>
                <b>Contribution aux charges du mariage :</b> la contribution est proportionnelle aux
                facultés respectives des époux. Une clause d’exécution « au jour le jour » a été mise
                en place, rendant les époux irrecevables à contester leur part de contribution
                ultérieurement. Cette clause constitue un aménagement de la portée de l’article 214 du
                Code civil en instaurant une présomption de paiement libératoire.
              </li>
              <li>
                <b>Clause de présomption de propriété :</b> preuve par tous moyens. En l’absence de
                preuve : présomption de propriété exclusive selon l’usage personnel ou l’intitulé du
                compte. Indivision par moitié pour les biens non justifiés.
              </li>
              <li>
                <b>Responsabilité des dettes (article 4 du contrat) :</b> le contrat précise une
                garantie d’indemnisation par la succession de l’autre époux pour les engagements
                contractés pour le conjoint. Cette disposition sécurise le patrimoine personnel de
                chaque époux en cas d’engagement pour le compte de l’autre durant l’union.
              </li>
              <li>
                <b>Évaluation des créances entre époux (article 5 du contrat) :</b> le contrat stipule
                que les créances entre les époux seront évaluées selon les règles de l’article 1469,
                alinéa 3 du Code civil. Il s’agit d’un aménagement important car, par défaut dans une
                séparation de biens, les créances sont évaluées selon leur montant nominal. Ici,
                l’utilisation du « profit subsistant » implique que si Monsieur ou Madame finance un
                bien propre de l’autre, la créance suivra la valeur du bien (plus-value) plutôt que la
                simple somme déboursée.
              </li>
            </ul>
            <GoldLabel>Risques et opportunités</GoldLabel>
            {ab.contribution}
            {ab.inventaire}
            <SynthAcc anchorId="synthese-theme-mat-amenagements" heading="Aménagements du contrat de mariage">
              <p>
                Les aménagements du contrat renforcent la protection du régime : clause de
                contribution « au jour le jour », présomption de propriété, garantie d’indemnisation et
                évaluation au profit subsistant. L’absence d’inventaire initial demeure le principal
                point d’attention.
              </p>
              <Recap
                risques={[
                  "Absence d’inventaire initial (présomption par moitié).",
                  "Vigilance sur l’équilibre des dépenses courantes.",
                ]}
                opportunites={[
                  "Clause de contribution protectrice en cas de séparation.",
                  "Évaluation des créances au profit subsistant (plus-values).",
                ]}
                optimisations={[
                  "Constituer un inventaire des biens propres antérieurs au mariage.",
                  "Maintenir un suivi de la contribution aux charges.",
                ]}
              />
            </SynthAcc>
          </div>
        </div>
      </div>

      {/* Synthèse de l'analyse matrimoniale */}
      <div className="immo-mod" id="mat-synth">
        <div className="page modfold">
          <ModHead
            icon={
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
            }
            title="Synthèse de l’analyse matrimoniale"
          />
          <div className="mod-body">
            <GoldLabel>Rappel des risques et opportunités des modules</GoldLabel>
            <Bloc blocKey="Rappel consolidé des risques et opportunités" className="lead">
              Cette synthèse rassemble, à un seul endroit, l’ensemble des risques et opportunités
              identifiés dans les modules de l’analyse matrimoniale.
            </Bloc>
            {ab.autonomie}
            {ab.indivision}
            {ab.protection}
            {ab.solidaires}
            {ab.contribution}
            {ab.inventaire}
            <SynthAcc anchorId="synthese-theme-matrimonial" heading="Analyse matrimoniale — lecture stratégique">
              <p>
                Le couple est marié sous le régime de la {reg} depuis le {dateLong}, assorti
                d’aménagements protecteurs : clause de contribution « au jour le jour », présomption de
                propriété, garantie d’indemnisation entre successions et évaluation des créances au
                profit subsistant.
              </p>
              <p>
                Ce cadre assure une autonomie patrimoniale forte et protège le patrimoine personnel de
                chaque époux face aux dettes de l’autre. Le principal point de vigilance tient à
                l’absence d’inventaire initial : faute de preuve d’origine, les biens non justifiés
                seraient présumés indivis par moitié à la dissolution.
              </p>
              <Recap
                risques={[
                  "Absence d’inventaire initial (présomption d’indivision par moitié).",
                  "Indivision des biens acquis ensemble sans preuve d’origine.",
                  "Vigilance sur l’équilibre des dépenses courantes.",
                ]}
                opportunites={[
                  "Régime protecteur de l’autonomie patrimoniale de chaque époux.",
                  "Aménagements sécurisant le patrimoine personnel et la transmission.",
                  "Évaluation des créances au profit subsistant (prise en compte des plus-values).",
                ]}
                optimisations={[
                  "Constituer un inventaire des biens propres antérieurs au mariage.",
                  "Documenter l’origine des biens acquis pendant l’union.",
                  "Maintenir un suivi de la contribution aux charges du mariage.",
                ]}
              />
            </SynthAcc>
          </div>
        </div>
      </div>
    </>
  );
}
