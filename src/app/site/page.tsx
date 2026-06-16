import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Astraeos · La plateforme des études patrimoniales",
  description:
    "Du premier rendez-vous à la restitution : conformité, collecte de pièces intelligente, entretien augmenté par l'IA et suivi. La plateforme qui réunit conseillers, ingénieurs et clients autour de l'étude patrimoniale.",
};

const APP_URL = "https://app.astraeos.fr";

const ETAPES = [
  { num: "01", titre: "Prospects", desc: "Prise de contact, premier RDV et qualification du foyer." },
  { num: "02", titre: "Conformité", desc: "KYC, DER, lettre de mission et mandat — suivis et signés." },
  { num: "03", titre: "Collecte", desc: "Seules les pièces utiles à la situation du client sont demandées." },
  { num: "04", titre: "Études", desc: "Analyse patrimoniale et construction des recommandations." },
  { num: "05", titre: "Restitution", desc: "Présentation de l'étude et des stratégies au client." },
  { num: "06", titre: "Suivi", desc: "Accompagnement dans la durée et mise à jour du dossier." },
];

const FEATURES = [
  {
    titre: "Collecte intelligente",
    desc: "Le référentiel des 286 pièces croise le dossier du client : la plateforme ne demande que les documents pertinents à sa situation. L'ingénieur garde la main pour ajuster.",
  },
  {
    titre: "Entretien augmenté par l'IA",
    desc: "En visioconférence, la transcription en direct alimente le cockpit DCI et propose des conseils contextualisés. Le dossier se remplit pendant que vous échangez.",
  },
  {
    titre: "Conformité intégrée",
    desc: "Document d'entrée en relation, KYC, lettre de mission, mandat : chaque pièce réglementaire est suivie, datée et signée, sans sortir de l'outil.",
  },
];

const ESPACES = ["Éditeur", "Marque", "Dirigeant", "Ingénieur", "Client"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--ivory)] text-[var(--navy)]">
      {/* NAV */}
      <header className="sticky top-0 z-20 border-b border-[var(--navy-100)] bg-[var(--ivory)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--navy)] text-[13px] font-extrabold text-[var(--ivory)]">
              A
            </span>
            <span className="text-[16px] font-extrabold tracking-tight">ASTRAEOS</span>
          </div>
          <nav className="hidden items-center gap-7 text-[13px] font-medium text-[var(--navy-300)] md:flex">
            <a href="#parcours" className="transition hover:text-[var(--navy)]">Le parcours</a>
            <a href="#plateforme" className="transition hover:text-[var(--navy)]">La plateforme</a>
            <a href="#espaces" className="transition hover:text-[var(--navy)]">Les espaces</a>
          </nav>
          <a
            href={APP_URL}
            className="rounded-full bg-[var(--navy)] px-5 py-2 text-[13px] font-semibold text-[var(--ivory)] transition hover:opacity-90"
          >
            Accéder à l&apos;application
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
        <span className="text-[12px] font-bold uppercase tracking-[0.25em] text-[var(--gold)]">
          Plateforme d&apos;études patrimoniales
        </span>
        <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
          L&apos;étude patrimoniale,
          <br />
          <span className="text-[var(--gold)]">de A à Z</span>, au même endroit.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--navy-300)]">
          Du premier rendez-vous à la restitution : conformité, collecte de pièces, entretien
          augmenté par l&apos;IA et suivi. Une plateforme qui réunit conseillers, ingénieurs
          patrimoniaux et clients dans un seul parcours.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href={APP_URL}
            className="rounded-full bg-[var(--navy)] px-7 py-3.5 text-[14px] font-semibold text-[var(--ivory)] transition hover:opacity-90"
          >
            Accéder à l&apos;application →
          </a>
          <a
            href="#parcours"
            className="rounded-full border border-[var(--navy-100)] bg-white px-7 py-3.5 text-[14px] font-semibold text-[var(--navy)] transition hover:border-[var(--gold)]"
          >
            Découvrir le parcours
          </a>
        </div>
      </section>

      {/* PARCOURS 6 ÉTAPES */}
      <section id="parcours" className="border-y border-[var(--navy-100)] bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              Le parcours en 6 étapes
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Un fil conducteur, du prospect au suivi.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--navy-300)]">
              Chaque dossier avance étape par étape. Rien ne se perd, tout est tracé, et chacun
              sait où en est le client.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[var(--navy-100)] bg-[var(--navy-100)] sm:grid-cols-2 lg:grid-cols-3">
            {ETAPES.map((e) => (
              <div key={e.num} className="bg-white p-6">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gold-200)] text-[13px] font-extrabold text-[var(--medium-400)]">
                    {e.num}
                  </span>
                  <span className="text-[16px] font-bold">{e.titre}</span>
                </div>
                <p className="text-[13.5px] leading-relaxed text-[var(--navy-300)]">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATEFORME / FEATURES */}
      <section id="plateforme" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
              La plateforme
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Le travail patrimonial, sans la charge administrative.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.titre}
                className="rounded-xl border border-[var(--navy-100)] bg-white p-7 transition hover:border-[var(--gold)]"
              >
                <div className="mb-4 h-1 w-9 rounded-full bg-[var(--gold)]" />
                <h3 className="mb-3 text-[18px] font-bold">{f.titre}</h3>
                <p className="text-[13.5px] leading-relaxed text-[var(--navy-300)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESPACES */}
      <section id="espaces" className="bg-[var(--navy)] py-20 text-[var(--ivory)]">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--gold-300)]">
            Multi-espaces
          </span>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Un espace pour chaque rôle du cabinet.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--navy-200)]">
            Éditeur, marque, dirigeant, ingénieur, client : chacun retrouve sa vue, ses outils et
            ses données — au sein du même écosystème.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {ESPACES.map((e) => (
              <span
                key={e}
                className="rounded-full border border-[var(--navy-300)] px-5 py-2 text-[13.5px] font-semibold"
              >
                Espace {e}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Prêt à structurer vos études patrimoniales ?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--navy-300)]">
            Accédez à votre espace et démarrez votre premier dossier dès aujourd&apos;hui.
          </p>
          <a
            href={APP_URL}
            className="mt-8 inline-block rounded-full bg-[var(--gold)] px-8 py-4 text-[15px] font-bold text-white transition hover:brightness-110"
          >
            Accéder à l&apos;application
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--navy-100)] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-[12.5px] text-[var(--navy-300)] sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--navy)] text-[10px] font-extrabold text-[var(--ivory)]">
              A
            </span>
            <span className="font-bold text-[var(--navy)]">ASTRAEOS</span>
          </div>
          <span>© 2026 Astraeos · Études patrimoniales</span>
          <a href={APP_URL} className="font-semibold text-[var(--navy)] transition hover:text-[var(--gold)]">
            Accéder à l&apos;application →
          </a>
        </div>
      </footer>
    </main>
  );
}
