import { SpaceSwitcher } from "../_components/SpaceSwitcher";

export const metadata = {
  title: "ASTRAEOS · Espace Client",
};

export default function ClientPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--ivory)]">
      <SpaceSwitcher active="client" />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <section className="w-full max-w-xl rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
          <div className="mb-3 text-[40px] leading-none">🚧</div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
            Espace Client
          </div>
          <h1 className="mb-3 text-[22px] font-semibold leading-tight tracking-tight text-[var(--navy)]">
            Espace client à venir
          </h1>
          <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
            L&apos;espace client patrimonial (suivi de l&apos;étude, documents, restitution et messagerie
            avec son ingénieur) sera branché sur les données réelles dans une prochaine itération.
          </p>
        </section>
      </div>
    </div>
  );
}
