import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Astraeos · Études patrimoniales",
  description:
    "La plateforme qui réunit conseillers, ingénieurs et clients autour de l'étude patrimoniale.",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--ivory)] px-6 text-center">
      <span className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
        Astraeos
      </span>
      <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-tight text-[var(--navy)] sm:text-5xl">
        L&apos;étude patrimoniale, enfin réunie au même endroit.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-[var(--navy-300)]">
        Conseillers, ingénieurs et clients sur une seule plateforme. Le site
        arrive bientôt.
      </p>
      <a
        href="https://app.astraeos.fr"
        className="mt-9 rounded-full bg-[var(--navy)] px-7 py-3 text-sm font-semibold text-[var(--ivory)] transition hover:opacity-90"
      >
        Accéder à l&apos;application
      </a>
    </main>
  );
}
