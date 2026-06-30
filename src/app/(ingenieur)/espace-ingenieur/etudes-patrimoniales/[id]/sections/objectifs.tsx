/**
 * Section « Rappel des objectifs du client » du document d'audit (maquette
 * lignes 1545-1574).
 *
 * Trois cartes d'objectifs patrimoniaux, précédées d'un préambule. Contenu
 * éditorial pur : chaque fragment révisable (préambule, chaque carte) est
 * enveloppé dans <Bloc> dont la clé reprend exactement la valeur data-block de
 * la maquette, donc sélectionnable, éditable et validable par le volet de
 * révision.
 *
 * Branchement réel : EtudeDonnees.objectifs porte les trois objectifs saisis
 * par l'ingénieur (titre + description). Quand un objectif est renseigné, son
 * intitulé et son corps remplacent le texte de la maquette ; sinon le libellé
 * méthodologique de la maquette sert d'amorce éditorale honnête, éditable. Les
 * valeurs cibles de la carte 2 (montant mensuel, horizon) n'existent pas en
 * base : elles restent à « — », éditables, jamais l'exemple de la maquette.
 */

import { type ReactNode } from "react";

import { Bloc } from "../Bloc";
import type { EtudeDonnees, EtudeObjectif } from "../../../../_data/etudes-patrimoniales";

import "../../../../_styles/sections/objectifs.css";

const DASH = "—";

/** Gabarit d'une carte : clé de bloc + intitulé et corps de la maquette. */
type CarteDefaut = {
  blocKey: string;
  titre: string;
  /** Corps par défaut (ReactNode pour porter l'incise « citation » de la carte 3). */
  description: ReactNode;
  /** La carte 2 affiche un encart de cibles chiffrées (vide et éditable ici). */
  target?: boolean;
};

const CARTES: CarteDefaut[] = [
  {
    blocKey: "Objectif 1 — Optimisation professionnelle et fiscale",
    titre: "Optimisation de la structure professionnelle et de l’efficience fiscale",
    description:
      "Rationaliser les flux de revenus issus de l’activité professionnelle afin d’en alléger le frottement fiscal et social. La démarche consiste à arbitrer de façon cohérente entre les différents modes de rémunération, pour maximiser le revenu net réellement disponible du foyer.",
  },
  {
    blocKey: "Objectif 2 — Autonomie financière et retraite",
    titre: "Planification de l’autonomie financière et préparation de la retraite",
    description:
      "Mettre en œuvre une stratégie de capitalisation destinée à compenser la baisse de revenus attendue au terme de la carrière professionnelle. L’objectif est de générer un flux de revenus complémentaires pérenne.",
    target: true,
  },
  {
    blocKey: "Objectif 3 — Protection et transmission",
    titre: "Protection du conjoint et organisation d’une dévolution successorale maîtrisée",
    description: (
      <>
        Assurer en priorité la sécurité financière du conjoint survivant, tout en anticipant une
        transmission optimisée vers les enfants. Cette volonté s’inscrit dans une logique de{" "}
        <span className="quote">« donner sans se démunir »</span> : préserver pour les clients la
        pleine jouissance de leur patrimoine et le maintien de leur train de vie tout au long de la
        retraite.
      </>
    ),
  },
];

/** Intitulé retenu : celui saisi par l'ingénieur s'il existe, sinon la maquette. */
function titreDe(objectif: EtudeObjectif | undefined, defaut: string): string {
  const t = (objectif?.titre ?? "").trim();
  return t || defaut;
}

/** Corps retenu : la description saisie s'il y en a une, sinon celle de la maquette. */
function descriptionDe(objectif: EtudeObjectif | undefined, defaut: ReactNode): ReactNode {
  const d = (objectif?.description ?? "").trim();
  return d || defaut;
}

export default function ObjectifsSection({ donnees }: { donnees: EtudeDonnees }): ReactNode {
  const objectifs = donnees.objectifs;

  return (
    <>
      <Bloc blocKey="Préambule" as="p">
        Vos priorités patrimoniales se structurent autour de trois objectifs, qui guident l’ensemble
        des analyses et des préconisations de la présente étude.
      </Bloc>

      {CARTES.map((carte, i) => (
        <Bloc key={carte.blocKey} blocKey={carte.blocKey} className="obj-card">
          <div className="obj-head">
            <span className="obj-n">{i + 1}</span>
            <h3>{titreDe(objectifs[i], carte.titre)}</h3>
          </div>
          <p>{descriptionDe(objectifs[i], carte.description)}</p>
          {carte.target ? (
            <div className="obj-target">
              <div className="ot-item">
                <span className="ot-v">{DASH}</span>
                <span className="ot-l">par mois (minimum)</span>
              </div>
              <div className="ot-item">
                <span className="ot-v">{DASH}</span>
                <span className="ot-l">horizon</span>
              </div>
            </div>
          ) : null}
        </Bloc>
      ))}
    </>
  );
}
