import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton, GoldButton } from "../_components/PageHeader";

const kpis: KpiBlock[] = [
  { label: "Newsletters envoyées", value: "14", meta: "depuis janvier" },
  { label: "Webinars organisés", value: "8", meta: "~120 participants moyens" },
  { label: "Taux d'ouverture moyen", value: "72", unit: "%", meta: "▲ +6 pts vs N-1" },
  { label: "Taux de clic moyen", value: "28", unit: "%", meta: "excellent · benchmark 18 %" },
];

type Comm = {
  date: string;
  type: { v: string; cls: string };
  subject: string;
  recipients: string;
  status: { v: string; cls: string };
};

const comms: Comm[] = [
  {
    date: "12 mai",
    type: { v: "Newsletter", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
    subject: "Nouveautés produit · mai 2026",
    recipients: "~280 ingénieurs",
    status: { v: "Brouillon", cls: "bg-[var(--orange-bg)] text-[var(--orange-text)]" },
  },
  {
    date: "15 mai",
    type: { v: "Webinar", cls: "bg-[var(--gold-200)] text-[var(--medium-400)]" },
    subject: "Optimisation patrimoniale post-réforme retraite",
    recipients: "~150 inscrits",
    status: { v: "Programmé", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
  },
  {
    date: "22 mai",
    type: { v: "Annonce", cls: "bg-[#E5DCEB] text-[#5B3A6E]" },
    subject: "Lancement Programme de parrainage",
    recipients: "~280 ingénieurs · 23 clients",
    status: { v: "Brouillon", cls: "bg-[var(--orange-bg)] text-[var(--orange-text)]" },
  },
  {
    date: "28 mai",
    type: { v: "Newsletter", cls: "bg-[var(--light-blue)] text-[var(--navy)]" },
    subject: "Bibliothèque · 14 documents mis à jour",
    recipients: "~280 ingénieurs",
    status: { v: "À planifier", cls: "bg-[var(--navy-100)] text-[var(--navy-300)]" },
  },
  {
    date: "3 juin",
    type: { v: "Webinar", cls: "bg-[var(--gold-200)] text-[var(--medium-400)]" },
    subject: "Conduite d'entretien : 6 erreurs à éviter",
    recipients: "à confirmer",
    status: { v: "À planifier", cls: "bg-[var(--navy-100)] text-[var(--navy-300)]" },
  },
];

const performances = [
  {
    label: { v: "Excellent", cls: "bg-[var(--green-bg)] text-[var(--green-text)]" },
    date: "5 mai",
    title: "Newsletter avril · 78 % d'ouverture",
    sub: "280 envois · 218 ouvertures · 64 clics",
  },
  {
    label: { v: "Très bon", cls: "bg-[var(--green-bg)] text-[var(--green-text)]" },
    date: "22 avril",
    title: "Webinar réforme · 134 participants",
    sub: "150 inscrits · 89 % de présence",
  },
  {
    label: { v: "Moyen", cls: "bg-[var(--orange-bg)] text-[var(--orange-text)]" },
    date: "14 avril",
    title: "Annonce roadmap Q2 · 56 % d'ouverture",
    sub: "280 envois · 156 ouvertures · 28 clics",
  },
  {
    label: { v: "Excellent", cls: "bg-[var(--green-bg)] text-[var(--green-text)]" },
    date: "3 avril",
    title: "Webinar intro · 188 participants",
    sub: "200 inscrits · 94 % de présence",
  },
];

const templates = [
  {
    icon: "📧",
    title: "Newsletter mensuelle",
    desc: "Modèle structuré · 5 sections · highlights produit + tips",
  },
  {
    icon: "🎯",
    title: "Annonce produit",
    desc: "Modèle court · pour mises à jour majeures & lancements",
  },
  {
    icon: "🎤",
    title: "Invitation webinar",
    desc: "Modèle invitation + 2 emails de rappel automatiques",
  },
];

export default function CommsPage() {
  return (
    <>
      <Topbar current="Communications & annonces" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Pilotage interne"
          title="Communications & annonces"
          description="Gestion des communications sortantes vers les ingénieurs patrimoniaux des clients ASTRAEOS — newsletter, webinars, mises à jour produit, annonces stratégiques."
          actions={
            <>
              <GhostButton>Templates</GhostButton>
              <GoldButton>＋ Nouvelle communication</GoldButton>
            </>
          }
        />

        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-[var(--navy-100)] bg-white lg:col-span-2">
            <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3">
              <div className="text-[13px] font-semibold text-[var(--navy)]">
                📅 Calendrier de communication
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="rounded-md bg-[var(--navy)] px-3 py-1 text-[11px] font-semibold text-white"
                >
                  Mois
                </button>
                <button
                  type="button"
                  className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-1 text-[11px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
                >
                  Trimestre
                </button>
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Sujet</th>
                  <th className="px-4 py-3">Destinataires</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--navy-100)]">
                {comms.map((c) => (
                  <tr key={c.subject} className="text-[12px] text-[var(--navy)] hover:bg-[var(--light-blue)]">
                    <td className="px-4 py-3 font-semibold">{c.date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${c.type.cls}`}>
                        {c.type.v}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{c.subject}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.recipients}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${c.status.cls}`}>
                        {c.status.v}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-md border border-[var(--navy-100)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
              📊 Performance dernières comms
            </div>
            <div className="divide-y divide-[var(--navy-100)]">
              {performances.map((p) => (
                <div key={p.title} className="cursor-pointer px-4 py-3 hover:bg-[var(--light-blue)]">
                  <div className="mb-1 flex items-center gap-2 text-[10.5px]">
                    <span className={`rounded-full px-2 py-0.5 font-bold uppercase tracking-wider ${p.label.cls}`}>
                      {p.label.v}
                    </span>
                    <span className="text-[var(--navy-300)]">{p.date}</span>
                  </div>
                  <div className="text-[12px] font-semibold text-[var(--navy)]">{p.title}</div>
                  <div className="mt-0.5 text-[11px] text-[var(--navy-300)]">{p.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionHeader
            eyebrow="Bibliothèque"
            title="Templates de communication"
            right={<GhostButton>＋ Nouveau template</GhostButton>}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {templates.map((t) => (
              <div key={t.title} className="rounded-md border border-[var(--navy-100)] bg-white p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--gold-200)] text-xl">
                  {t.icon}
                </div>
                <div className="text-[13.5px] font-bold text-[var(--navy)]">{t.title}</div>
                <div className="mt-1 text-[11.5px] text-[var(--navy-300)]">{t.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
