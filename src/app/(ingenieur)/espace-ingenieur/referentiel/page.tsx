import Link from "next/link";

import { PageScaffold } from "../../_components/PageScaffold";
import { ModeleActions } from "./ModeleActions";

/* ------------------------------------------------------------------------- *
 * Données statiques du référentiel (reproduites depuis la maquette).
 * Ce sont des libellés / descriptions de modèles, pas des données dynamiques.
 * ------------------------------------------------------------------------- */

const MANUEL_SECTIONS = [
  "Section 1 · Onboarding client (étapes 01 → 03)",
  "Section 2 · Étude patrimoniale (étape 04)",
  "Section 3 · Restitution & signature (étape 05)",
  "Section 4 · Suivi récurrent (étape 06)",
];

const SUGGESTIONS = ["Process onboarding client", "Modèle KYC", "Lettre de mission"];

type Modele = {
  title: string;
  desc: string;
  /** Modèle généré pour de vrai (DER, Lettre de mission) → boutons branchés. */
  pdf?: "der" | "lettre_mission";
};

const MODELES: Modele[] = [
  {
    title: "Document d'entrée en relation",
    desc: "Modèle conforme ORIAS · CIF · IAS, à signer par le client lors du 1er rendez-vous.",
    pdf: "der",
  },
  {
    title: "KYC · Know Your Customer",
    desc: "Formulaire LCB-FT, identification complète + justificatifs.",
  },
  {
    title: "Questionnaire de qualification",
    desc: "Profil patrimonial · objectifs · horizon · tolérance risque.",
  },
  {
    title: "Lettre de mission",
    desc: "Cadre contractuel de l'étude · objet · honoraires · délais.",
    pdf: "lettre_mission",
  },
  {
    title: "Étude patrimoniale anonymisée",
    desc: "Modèle d'étude type · structure · diagnostic · préconisations.",
  },
  {
    title: "Dossier client anonymisé",
    desc: "Dossier complet anonymisé pour formation et exemple type.",
  },
];

function DocIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}

/** Toggle « Accessible licenciés » purement décoratif (état figé de la maquette). */
function LicencieToggle() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--gold-200)] bg-white px-2.5 py-1.5">
      <span className="text-[10px] font-bold text-[var(--navy)]">Accessible licenciés</span>
      <span className="relative inline-block h-4 w-[30px] rounded-full bg-[var(--gold)]">
        <span className="absolute bottom-[3px] left-[17px] h-2.5 w-2.5 rounded-full bg-white" />
      </span>
      <span className="text-[10px] font-bold text-[var(--gold)]">OUI</span>
    </div>
  );
}

export default function ReferentielPage() {
  return (
    <PageScaffold
      eyebrow="Référentiel"
      title="Process & méthodologie"
      description="Le manuel opératoire, le contrat-cadre licenciés, la bibliothèque de modèles documentaires et les éléments de communication du réseau PRIVEOS."
    >
      {/* Zone IA · Interrogez le référentiel */}
      <section className="relative mb-6 overflow-hidden rounded-lg border border-[var(--navy-100)] border-l-4 border-l-[var(--gold)] bg-gradient-to-br from-[var(--ivory)] via-white to-white p-6">
        <div className="absolute right-[18px] top-[14px] flex items-center gap-2 rounded-full border border-[var(--gold-200)] bg-white px-2.5 py-1.5">
          <span className="text-[10px] font-bold text-[var(--navy)]">
            À mettre à disposition des licenciés
          </span>
          <span className="relative inline-block h-[18px] w-8 rounded-full bg-[var(--gold)]">
            <span className="absolute bottom-[3px] left-[17px] h-3 w-3 rounded-full bg-white" />
          </span>
          <span className="text-[10px] font-bold text-[var(--gold)]">OUI</span>
        </div>
        <div className="flex items-start gap-[18px]">
          <div className="grid h-[52px] w-[52px] flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] text-white">
            <svg
              className="h-[26px] w-[26px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 2 L 13.5 8.5 L 20 10 L 13.5 11.5 L 12 18 L 10.5 11.5 L 4 10 L 10.5 8.5 Z" />
              <circle cx="12" cy="10" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--navy-300)]">
              Assistant IA · méthodologie
            </div>
            <div className="mb-2 text-[18px] font-bold text-[var(--navy)]">
              Interrogez le référentiel PRIVEOS
            </div>
            <p className="mb-3.5 text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              L&apos;IA est entraînée sur l&apos;ensemble du référentiel : process, contrat
              licenciés, bibliothèque, FAQ. Posez vos questions en langage naturel, obtenez la
              réponse contextualisée et le lien vers le document source.
            </p>
            <div className="flex gap-2.5">
              <input
                type="text"
                disabled
                placeholder="Comment rédiger un pacte d'associés selon le process PRIVEOS ?"
                className="flex-1 rounded-lg border border-[var(--navy-100)] px-4 py-3 text-[13px] disabled:bg-white"
              />
              <button
                type="button"
                disabled
                title="En cours de construction"
                className="cursor-not-allowed rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white opacity-50"
              >
                Demander à l&apos;IA
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold tracking-[0.06em] text-[var(--navy-300)]">
                Suggestions :
              </span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled
                  title="En cours de construction"
                  className="cursor-not-allowed rounded-md border border-[var(--navy-100)] bg-white px-2.5 py-[3px] text-[10.5px] font-semibold text-[var(--navy)] opacity-60"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Manuel opératoire + Contrat-cadre */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Manuel opératoire */}
        <section className="rounded-lg border border-[var(--navy-100)] bg-white">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--navy-100)] px-5 py-4">
            <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--navy)]">
              <span className="text-[var(--gold)]">
                <DocIcon />
              </span>
              Manuel opératoire
            </div>
            <LicencieToggle />
          </header>
          <div className="p-5">
            <p className="mb-3.5 text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              Document maître décrivant l&apos;ensemble des process opérationnels du Cabinet Paris
              Étoile · 168 pages · mis à jour le 24 avril 2026.
            </p>
            <div className="grid gap-1.5 text-[12px]">
              {MANUEL_SECTIONS.map((s) => (
                <div
                  key={s}
                  className="flex items-center justify-between rounded bg-[var(--ivory)] px-3 py-2 text-[var(--navy)]"
                >
                  <span>{s}</span>
                  <span className="font-bold text-[var(--gold)]">Voir →</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled
                title="En cours de construction"
                className="flex-1 cursor-not-allowed rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] opacity-60"
              >
                Aperçu
              </button>
              <button
                type="button"
                disabled
                title="En cours de construction"
                className="flex-1 cursor-not-allowed rounded-md bg-[var(--gold)] px-3 py-2 text-[11.5px] font-bold text-white opacity-50"
              >
                Télécharger
              </button>
            </div>
          </div>
        </section>

        {/* Contrat-cadre licenciés */}
        <section className="rounded-lg border border-[var(--navy-100)] bg-white">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--navy-100)] px-5 py-4">
            <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--navy)]">
              <span className="text-[var(--gold)]">
                <DocIcon />
              </span>
              Contrat-cadre licenciés · licence de marque
            </div>
            <LicencieToggle />
          </header>
          <div className="p-5">
            <p className="mb-3.5 text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              Au moment de la souscription, un seul modèle est utilisé :{" "}
              <strong className="text-[var(--navy)]">licence de marque</strong>. Inclut les
              documents pré-contractuels obligatoires.
            </p>
            <div className="grid gap-1.5 text-[12px]">
              <div className="flex items-center justify-between rounded border-l-[3px] border-[var(--gold)] bg-[var(--gold-100)] px-3 py-2 text-[var(--navy)]">
                <span>
                  <strong className="text-[var(--gold-deep)]">Licence de marque</strong> · contrat
                  unique · 5 ingénieurs
                </span>
                <span className="font-bold text-[var(--gold)]">v3.1 →</span>
              </div>
              <div className="flex items-center justify-between rounded bg-[var(--ivory)] px-3 py-2 text-[var(--navy)]">
                <span>Document d&apos;Information Précontractuelle (DIP)</span>
                <span className="font-bold text-[var(--gold)]">Voir →</span>
              </div>
              <div className="flex items-center justify-between rounded bg-[var(--ivory)] px-3 py-2 text-[var(--navy)]">
                <span>État général du marché</span>
                <span className="font-bold text-[var(--gold)]">Voir →</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled
                title="En cours de construction"
                className="flex-1 cursor-not-allowed rounded-md border border-[var(--navy-100)] bg-white px-3 py-2 text-[11.5px] font-semibold text-[var(--navy)] opacity-60"
              >
                Aperçu
              </button>
              <Link
                href="/espace-ingenieur/conformite"
                className="flex-1 rounded-md bg-[var(--gold)] px-3 py-2 text-center text-[11.5px] font-bold text-white hover:brightness-110"
              >
                Voir tous les contrats signés
              </Link>
            </div>
            <div className="mt-2.5 rounded bg-[var(--ivory)] px-2.5 py-2 text-[10.5px] leading-relaxed text-[var(--navy-300)]">
              <em>
                Note : à l&apos;avenir, des modèles franchise / mandataire pourront s&apos;ajouter
                selon l&apos;évolution juridique du réseau.
              </em>
            </div>
          </div>
        </section>
      </div>

      {/* Bibliothèque de modèles documentaires */}
      <section className="mb-6 rounded-lg border border-[var(--navy-100)] bg-white">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--navy-100)] px-5 py-4">
          <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--navy)]">
            <span className="text-[var(--gold)]">
              <DocIcon />
            </span>
            Bibliothèque de modèles documentaires
          </div>
          <LicencieToggle />
        </header>
        <div className="p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MODELES.map((m) => (
              <div
                key={m.title}
                className="rounded-lg border border-[var(--gold-200)] bg-[var(--ivory)] p-3.5"
              >
                <div className="mb-2 flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-[var(--gold-100)] text-[var(--gold)]">
                    <DocIcon />
                  </div>
                  <strong className="text-[13px] text-[var(--navy)]">{m.title}</strong>
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--navy-300)]">{m.desc}</p>
                <div className="mt-2.5">
                  {m.pdf ? (
                    <ModeleActions type={m.pdf} />
                  ) : (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled
                        title="En cours de construction"
                        className="cursor-not-allowed rounded-md border border-[var(--navy-100)] bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-[var(--navy)] opacity-60"
                      >
                        Aperçu
                      </button>
                      <button
                        type="button"
                        disabled
                        title="En cours de construction"
                        className="cursor-not-allowed rounded-md bg-[var(--gold)] px-2.5 py-1.5 text-[10.5px] font-bold text-white opacity-50"
                      >
                        Télécharger
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Éléments de communication */}
      <section className="rounded-lg border border-[var(--navy-100)] bg-white">
        <header className="border-b border-[var(--navy-100)] px-5 py-4">
          <div className="flex items-center gap-2 text-[14px] font-bold text-[var(--navy)]">
            <span className="text-[var(--gold)]">
              <DocIcon />
            </span>
            Éléments de communication
          </div>
        </header>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {/* Logo principal */}
            <div className="rounded-lg bg-[var(--navy)] p-[18px] text-center text-white">
              <div className="text-[22px] font-semibold" style={{ fontFamily: "Georgia, serif" }}>
                PRIVEOS
              </div>
              <div className="mt-1 text-[9.5px] tracking-[0.18em] text-[var(--gold-300)]">
                Logo principal
              </div>
              <button
                type="button"
                disabled
                title="En cours de construction"
                className="mt-2.5 w-full cursor-not-allowed rounded-md bg-[var(--gold)] px-2.5 py-1.5 text-[10.5px] font-bold text-white opacity-50"
              >
                Télécharger
              </button>
            </div>
            {/* Logo doré sur blanc */}
            <div className="rounded-lg border border-[var(--gold-200)] bg-white p-[18px] text-center text-[var(--navy)]">
              <div
                className="text-[22px] font-semibold text-[var(--gold)]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                PRIVEOS
              </div>
              <div className="mt-1 text-[9.5px] tracking-[0.18em] text-[var(--navy-300)]">
                Logo doré sur blanc
              </div>
              <button
                type="button"
                disabled
                title="En cours de construction"
                className="mt-2.5 w-full cursor-not-allowed rounded-md bg-[var(--gold)] px-2.5 py-1.5 text-[10.5px] font-bold text-white opacity-50"
              >
                Télécharger
              </button>
            </div>
            {/* Fond d'écran */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[var(--navy)] to-[var(--navy)] p-[18px] text-center text-white">
              <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[radial-gradient(circle,var(--gold),transparent)] opacity-30" />
              <div className="text-[11px] font-bold text-[var(--gold-300)]">FOND D&apos;ÉCRAN</div>
              <div className="mt-1 text-[13px]">Présentation</div>
              <button
                type="button"
                disabled
                title="En cours de construction"
                className="mt-2.5 w-full cursor-not-allowed rounded-md bg-[var(--gold)] px-2.5 py-1.5 text-[10.5px] font-bold text-white opacity-50"
              >
                Télécharger
              </button>
            </div>
            {/* Charte graphique */}
            <div className="rounded-lg border border-[var(--gold-200)] bg-[var(--ivory)] p-[18px] text-center text-[var(--navy)]">
              <div className="text-[11px] font-bold text-[var(--gold)]">CHARTE GRAPHIQUE</div>
              <div className="mt-1 text-[13px] text-[var(--navy)]">PDF · 24 pages</div>
              <button
                type="button"
                disabled
                title="En cours de construction"
                className="mt-2.5 w-full cursor-not-allowed rounded-md bg-[var(--gold)] px-2.5 py-1.5 text-[10.5px] font-bold text-white opacity-50"
              >
                Télécharger
              </button>
            </div>
          </div>
        </div>
      </section>
    </PageScaffold>
  );
}
