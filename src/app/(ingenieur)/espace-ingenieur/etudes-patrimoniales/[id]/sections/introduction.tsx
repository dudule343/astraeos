/**
 * Section « Introduction » du document d'audit (maquette, partie Audit).
 *
 * Texte éditorial pur : accroche, quatre piliers, sources et périmètre,
 * méthodologie en deux phases, formule de clôture. Aucune donnée chiffrée n'est
 * présente dans la maquette de cette section : tous les fragments sont des blocs
 * de texte révisables (data-block), enveloppés dans <Bloc> pour être
 * sélectionnables, éditables et validables via le volet de révision.
 *
 * Marque rebrandée : l'équipe ASTRAEOS (ex-PRIVEOS de la maquette). Les
 * libellés, sous-titres et la disposition reproduisent la maquette à
 * l'identique. Module compatible Server Component : il ne fait que composer des
 * éléments <Bloc> (composant client) rendus dans l'arbre du BlocProvider.
 */

import { Bloc } from "../Bloc";

export function IntroductionSection() {
  return (
    <>
      <Bloc blocKey="Accroche" as="p" className="lead-p">
        Au nom de l’ensemble de l’équipe ASTRAEOS, nous vous remercions de la confiance que vous nous
        accordez dans la conduite de votre accompagnement patrimonial.
      </Bloc>

      <Bloc blocKey="Les quatre piliers" as="p">
        La présente étude a été élaborée avec le soin qu’exige une analyse de cette nature, au service
        des <b>quatre piliers</b> qui fondent notre approche : <b>sécuriser, optimiser, développer et
        transmettre</b> votre patrimoine.
      </Bloc>

      <Bloc blocKey="Sources et périmètre" as="p">
        Elle s’appuie sur les informations recueillies via le <b>Document de Collecte d’Informations</b>{" "}
        ainsi que sur les pièces transmises au travers de notre plateforme sécurisée. Elle reflète votre
        situation au mois de sa restitution, en intégrant les éléments les plus récents en notre
        possession ; les dates mentionnées peuvent ainsi varier selon les sources disponibles.
      </Bloc>

      <Bloc blocKey="Méthodologie" as="p">
        Notre démarche s’articule en <b>deux phases successives et complémentaires</b>.
      </Bloc>

      <Bloc blocKey="Phase 1 — L’audit patrimonial" className="phase">
        <div className="ph-h">
          <span className="ph-n">1</span> L’audit patrimonial
        </div>
        <p>
          Il établit un état des lieux détaillé de votre situation dans l’ensemble de ses dimensions.
          L’analyse mobilise des indicateurs, des tableaux et des représentations graphiques afin d’en
          offrir une lecture à la fois synthétique et contextualisée. Elle dresse un constat en
          identifiant les zones de risque et les opportunités inexploitées, dans l’ordre suivant :
        </p>
        <ul className="dimlist">
          <li>
            <b>Patrimoine</b> — analyse des actifs et du passif.
          </li>
          <li>
            <b>Budget</b> — étude des flux financiers, des revenus et des charges.
          </li>
          <li>
            <b>Fiscalité</b> — analyse de l’imposition et identification des leviers d’optimisation.
          </li>
          <li>
            <b>Sociétés</b> — étude des structures juridiques existantes (SCI, sociétés d’exploitation,
            holdings…).
          </li>
          <li>
            <b>Couverture des risques</b> — examen des dispositifs assurantiels.
          </li>
          <li>
            <b>Matrimonial</b> — prise en compte de la situation familiale et matrimoniale et de ses
            implications.
          </li>
          <li>
            <b>Succession</b> — projection de la transmission patrimoniale à date.
          </li>
        </ul>
      </Bloc>

      <Bloc blocKey="Phase 2 — L’ingénierie patrimoniale" className="phase">
        <div className="ph-h">
          <span className="ph-n">2</span> L’ingénierie patrimoniale
        </div>
        <p>
          Cette seconde phase découle directement des constats de l’audit. Elle formule des{" "}
          <b>recommandations chiffrées et sourcées</b>, en réponse à vos objectifs patrimoniaux. Chaque
          préconisation vise à vous offrir une vision claire, structurée et pragmatique, en vous donnant
          les étapes clés pour agir concrètement — avec les professionnels de votre choix, ou avec
          l’accompagnement d’ASTRAEOS si vous le souhaitez.
        </p>
      </Bloc>

      <Bloc blocKey="Formule de clôture" as="p" className="sign-off">
        Nous vous souhaitons une excellente lecture.
      </Bloc>
    </>
  );
}
