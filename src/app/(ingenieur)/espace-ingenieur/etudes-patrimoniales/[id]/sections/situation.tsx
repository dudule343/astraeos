"use client";

/**
 * Section « Situation du foyer » du document d'audit (maquette lignes 1446-1544).
 *
 * Portage fidèle de la maquette (mêmes sous-rubriques, mêmes libellés, même
 * disposition), branché sur le RÉEL : chaque sous-rubrique est un <Bloc> dont la
 * clé reprend exactement la valeur data-block de la maquette, donc sélectionnable,
 * éditable et validable par le volet de révision.
 *
 * Données : EtudeDonnees.foyer (pré-rempli depuis getFicheClient). État vide
 * honnête (« — » ou « à compléter ») partout où la donnée n'existe pas dans le
 * jeu de données — jamais de valeur inventée. Les champs absents du modèle
 * (téléphone/courriel par personne, parts fiscales, état civil de chaque enfant)
 * restent explicitement vides.
 */

import { type ReactNode } from "react";

import { Bloc } from "../Bloc";
import {
  EMPLOYMENT_STATUS_LABELS,
  MARITAL_REGIME_LABELS,
  ageFromBirthDate,
  formatFicheDate,
} from "../../../../_data/fiche-client";
import type { EtudeDonnees, EtudePersonne } from "../../../../_data/etudes-patrimoniales";

const DASH = "—";

// ---------------------------------------------------------------------------
// Helpers purs
// ---------------------------------------------------------------------------

const MOTS = [
  "zéro",
  "un",
  "deux",
  "trois",
  "quatre",
  "cinq",
  "six",
  "sept",
  "huit",
  "neuf",
  "dix",
];

function enToutesLettres(n: number): string {
  return n >= 0 && n <= 10 ? MOTS[n] : String(n);
}

function cap(s: string): string {
  return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function roleRank(role: EtudePersonne["role"]): number {
  return role === "person_a" ? 0 : 1;
}

function sortedPersonnes(donnees: EtudeDonnees): EtudePersonne[] {
  return [...donnees.foyer.personnes].sort((a, b) => roleRank(a.role) - roleRank(b.role));
}

/** Nom d'affichage « prénom nom » (réel), sans civilité inventée. */
function personneNom(p: EtudePersonne): string {
  const s = `${(p.prenom ?? "").trim()} ${(p.nom ?? "").trim()}`.trim();
  return s || DASH;
}

/** Prénom court pour les phrases (repli sur le nom puis un libellé neutre). */
function prenomCourt(p: EtudePersonne): string {
  const pre = (p.prenom ?? "").trim();
  if (pre) return pre;
  const nom = (p.nom ?? "").trim();
  return nom || "Cette personne";
}

/** Phrase d'introduction de la composition, dérivée des comptes réels. */
function compositionIntro(donnees: EtudeDonnees): string {
  const adultes = donnees.foyer.personnes.length;
  const nb = donnees.foyer.nbChildren;
  if (adultes === 0 && nb == null) return "La composition du foyer reste à compléter.";

  const adulteSeg =
    adultes > 0 ? `${enToutesLettres(adultes)} adulte${adultes > 1 ? "s" : ""}` : null;

  if (nb === 0) {
    return adulteSeg ? `Le foyer réunit ${adulteSeg}, sans enfant.` : "Le foyer ne compte aucun enfant.";
  }

  const enfantSeg = nb != null ? `${enToutesLettres(nb)} enfant${nb > 1 ? "s" : ""}` : null;
  const segs = [adulteSeg, enfantSeg].filter(Boolean) as string[];
  if (segs.length === 0) return "La composition du foyer reste à compléter.";
  return `Le foyer réunit ${segs.join(" et ")}.`;
}

function kidsHeader(nb: number | null): string {
  if (nb == null) return "Enfants";
  if (nb === 0) return "Sans enfant";
  return `${cap(enToutesLettres(nb))} enfant${nb > 1 ? "s" : ""}`;
}

function kidsNote(nb: number | null, dependents: number | null): string {
  if (nb == null) return "Le nombre d'enfants et leur situation restent à compléter.";
  if (nb === 0) return "Aucun enfant n'est rattaché au foyer.";
  const base =
    "Le détail de chaque enfant (état civil, filiation, rattachement fiscal) reste à compléter.";
  if (dependents != null) {
    return `${base} Enfants à charge : ${dependents}.`;
  }
  return base;
}

/** Composition du foyer fiscal, dérivée des comptes réels (sans tiret cadratin). */
function foyerFiscalLine(donnees: EtudeDonnees): string {
  const adultes = donnees.foyer.personnes.length;
  const charge = donnees.foyer.nbDependents;
  const adulteSeg =
    adultes > 0 ? `${enToutesLettres(adultes)} adulte${adultes > 1 ? "s" : ""}` : null;
  const chargeSeg =
    charge != null
      ? charge === 0
        ? "aucun enfant à charge"
        : `${enToutesLettres(charge)} enfant${charge > 1 ? "s" : ""} à charge`
      : null;
  const segs = [adulteSeg, chargeSeg].filter(Boolean) as string[];
  if (segs.length === 0) return "Composition du foyer fiscal à compléter.";
  return `Foyer fiscal : ${segs.join(", ")}.`;
}

/** Ligne de résidence fiscale, dérivée de tax_residency. */
function residenceFiscaleLine(tax: string | null): string {
  if (!tax || !tax.trim()) return "Résidence fiscale à compléter.";
  const t = tax.trim();
  if (/france|^fr$/i.test(t)) return "Résidence fiscale française, sans rattachement à un autre pays.";
  return `Résidence fiscale : ${t}.`;
}

/** Aménagement du régime (légal vs conventionnel), dérivé du régime matrimonial. */
function contratLine(regimeKey: string | null): string | null {
  if (!regimeKey) return null;
  return regimeKey === "communaute_reduite_acquets"
    ? "Régime légal, en l'absence de contrat de mariage."
    : "Régime conventionnel, établi par contrat de mariage.";
}

/** Navigation vers une autre section de l'audit (action réelle, jamais morte). */
function goToSection(id: string) {
  if (typeof document === "undefined") return;
  const el = document.querySelector<HTMLElement>(`[data-sect="${id}"]`);
  if (!el) return;
  if (!el.classList.contains("foldopen")) {
    el.querySelector<HTMLElement>(".sect-head")?.click();
  }
  // Laisser un frame à la section pour se déplier (le clic ci-dessus déclenche
  // un état React) avant de calculer le défilement, sinon la cible est mesurée
  // sur la disposition encore repliée et l'animation atterrit de travers.
  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// ---------------------------------------------------------------------------
// Icônes (chemins SVG repris de la maquette)
// ---------------------------------------------------------------------------

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Fragments d'affichage
// ---------------------------------------------------------------------------

function AddressVal({ adresse }: { adresse: string | null }) {
  if (!adresse || !adresse.trim()) return <span className="val">{DASH}</span>;
  const lines = adresse.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return (
    <span className="val">
      {lines.map((l, i) => (
        <span key={i}>
          {l}
          {i < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </span>
  );
}

function IdentityCard({ p }: { p: EtudePersonne }) {
  const date = formatFicheDate(p.birthDate);
  const age = ageFromBirthDate(p.birthDate);
  const nat = (p.nationality ?? "").trim() || DASH;
  return (
    <div className="id-card">
      <div className="id-top">
        <div className="id-av">
          <UserIcon />
        </div>
        <div className="id-name">{personneNom(p)}</div>
      </div>
      <div className="id-kv">
        <div className="r r3">
          <span className="k">Date de naissance</span>
          <span className="v">{date}</span>
          {age != null ? <span className="age">{age} ans</span> : null}
        </div>
        <div className="r">
          <span className="k">Nationalité</span>
          <span className="v">{nat}</span>
        </div>
        <div className="r">
          <span className="k">Capacité</span>
          <span className="v">{DASH}</span>
        </div>
      </div>
    </div>
  );
}

function ProfessionParagraphs({ personnes }: { personnes: EtudePersonne[] }) {
  if (personnes.length === 0) {
    return <p className="bloc-empty">Situation professionnelle à compléter.</p>;
  }
  return (
    <>
      {personnes.map((p, i) => {
        const nom = personneNom(p);
        const prof = (p.profession ?? "").trim() || null;
        const statut = p.employmentStatus
          ? EMPLOYMENT_STATUS_LABELS[p.employmentStatus] ?? p.employmentStatus
          : null;
        const emp = (p.employer ?? "").trim() || null;
        const tmi = p.tmi;
        if (!prof && !statut && !emp && tmi == null) {
          return (
            <p key={i}>
              <b>{nom}</b> : situation professionnelle à compléter.
            </p>
          );
        }
        return (
          <p key={i}>
            <b>{nom}</b> exerce
            {prof ? (
              <>
                {" "}
                la profession de <b>{prof}</b>
              </>
            ) : (
              <> une activité professionnelle</>
            )}
            {statut ? <> ({statut})</> : null}
            {emp ? <> au sein de {emp}</> : null}.
            {tmi != null ? (
              <>
                {" "}
                Son taux marginal d&apos;imposition est estimé à <b>{tmi} %</b>.
              </>
            ) : null}
          </p>
        );
      })}
    </>
  );
}

function RegimeMain({ donnees }: { donnees: EtudeDonnees }) {
  const f = donnees.foyer;
  const personnes = sortedPersonnes(donnees);
  const names =
    personnes.length >= 2
      ? `${prenomCourt(personnes[0])} et ${prenomCourt(personnes[1])}`
      : personnes.length === 1
        ? prenomCourt(personnes[0])
        : null;
  const regimeLabel = f.maritalRegime
    ? MARITAL_REGIME_LABELS[f.maritalRegime] ?? f.maritalRegime
    : null;
  const dateLabel = f.marriageDate ? formatFicheDate(f.marriageDate) : null;
  const ht = f.householdType;

  if (ht === "couple_marie" || (ht == null && (dateLabel || regimeLabel))) {
    const subject = names ?? "Les deux conjoints";
    return (
      <>
        {subject} se sont mariés
        {dateLabel ? (
          <>
            {" "}
            le <b>{dateLabel}</b>
          </>
        ) : null}
        {regimeLabel ? (
          <>
            {" "}
            sous le régime de la <b>{regimeLabel}</b>
          </>
        ) : null}
        .
        {!dateLabel && !regimeLabel ? (
          <> La date du mariage et le régime restent à compléter.</>
        ) : null}
      </>
    );
  }

  if (ht === "couple_pacs") {
    const subject = names ?? "Les deux partenaires";
    return (
      <>
        {subject} sont liés par un pacte civil de solidarité
        {dateLabel ? (
          <>
            , conclu le <b>{dateLabel}</b>
          </>
        ) : null}
        {regimeLabel ? (
          <>
            , sous le régime de la <b>{regimeLabel}</b>
          </>
        ) : null}
        .
      </>
    );
  }

  if (ht === "celibataire" || ht === "divorce" || ht === "veuf") {
    return <>Le foyer ne relève pas d&apos;un régime matrimonial.</>;
  }

  return <>Régime matrimonial à compléter.</>;
}

// ---------------------------------------------------------------------------
// Section complète
// ---------------------------------------------------------------------------

export function SituationFoyer({ donnees }: { donnees: EtudeDonnees }): ReactNode {
  const personnes = sortedPersonnes(donnees);
  const f = donnees.foyer;
  const ht = f.householdType;
  const estCouple = ht === "couple_marie" || ht === "couple_pacs";
  const contrat = ht === "couple_marie" ? contratLine(f.maritalRegime) : null;

  return (
    <>
      <Bloc blocKey="Composition du foyer" className="subsect">
        <h3>Composition du foyer</h3>
        <p>{compositionIntro(donnees)}</p>
        <div className="id-grid">
          {personnes.length > 0 ? (
            personnes.map((p, i) => <IdentityCard key={i} p={p} />)
          ) : (
            <div className="bloc-empty">Aucune personne renseignée pour ce foyer. À compléter.</div>
          )}
        </div>
        <div className="kids">
          <div className="kids-h">{kidsHeader(f.nbChildren)}</div>
          <div className="kids-note">{kidsNote(f.nbChildren, f.nbDependents)}</div>
        </div>
      </Bloc>

      <Bloc blocKey="Coordonnées" className="subsect">
        <h3>Coordonnées</h3>
        <table className="dtable">
          <thead>
            <tr>
              <th>Adresse postale</th>
              <th>Numéros de téléphone</th>
              <th>Adresses électroniques</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="td-center">
                <div className="coordcell">
                  <PinIcon />
                  <AddressVal adresse={f.adresse} />
                </div>
              </td>
              <td>
                {personnes.length > 0 ? (
                  personnes.map((p, i) => (
                    <div className="coordcell" key={i}>
                      <PhoneIcon />
                      <span>
                        <span className="who">{prenomCourt(p)}</span>
                        <span className="val">{p.phone ?? DASH}</span>
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="coordcell">
                    <PhoneIcon />
                    <span>
                      <span className="who">Foyer</span>
                      <span className="val">{DASH}</span>
                    </span>
                  </div>
                )}
              </td>
              <td>
                {personnes.length > 0 ? (
                  personnes.map((p, i) => (
                    <div className="coordcell" key={i}>
                      <MailIcon />
                      <span>
                        <span className="who">{prenomCourt(p)}</span>
                        <span className="val">{p.email ?? DASH}</span>
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="coordcell">
                    <MailIcon />
                    <span>
                      <span className="who">Foyer</span>
                      <span className="val">{DASH}</span>
                    </span>
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </Bloc>

      <Bloc blocKey="Fiscalité" className="subsect">
        <h3>Fiscalité</h3>
        <div className="fc-card">
          <div className="fc-top">{foyerFiscalLine(donnees)}</div>
          <div className="fc-parts">
            <span className="fc-n">{DASH}</span> parts fiscales
          </div>
          <div className="fc-sub">{residenceFiscaleLine(f.taxResidency)}</div>
        </div>
      </Bloc>

      <Bloc blocKey="Régime matrimonial" className="subsect">
        <h3>Régime matrimonial</h3>
        <div className="union-card">
          <div className="union-main">
            <RegimeMain donnees={donnees} />
          </div>
          {contrat ? <div className="union-sub">{contrat}</div> : null}
        </div>
        {estCouple ? (
          <div className="note-renvoi">
            <LinkIcon />
            <span>
              Le régime matrimonial et ses conséquences sont analysés en détail dans la section{" "}
              <span
                className="xref"
                data-go="matrimonial"
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSection("matrimonial");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    goToSection("matrimonial");
                  }
                }}
              >
                Analyse matrimoniale
                <ChevronRight />
              </span>
              .
            </span>
          </div>
        ) : null}
      </Bloc>

      <Bloc blocKey="Évènements familiaux" className="subsect">
        <h3>Évènements familiaux</h3>
        <p className="bloc-empty">
          Aucun élément n&apos;a encore été renseigné. Précisez ici les évènements familiaux récents
          ou à venir (mariage, divorce, naissance, adoption, expatriation) ainsi que la situation de
          santé du foyer.
        </p>
      </Bloc>

      <Bloc blocKey="Situation professionnelle" className="subsect">
        <h3>Situation professionnelle</h3>
        <ProfessionParagraphs personnes={personnes} />
      </Bloc>
    </>
  );
}
