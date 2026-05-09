import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, GhostButton, GoldButton } from "../_components/PageHeader";

const kpis: KpiBlock[] = [
  { label: "Releases livrées 2026", value: "14", meta: "en moyenne 3 / mois" },
  { label: "Fonctionnalités en cours", value: "8", meta: "dont 3 bloquantes" },
  { label: "Tickets en recette", value: "5", meta: "prêts à valider" },
  { label: "Bugs critiques ouverts", value: "2", meta: "SLA < 24h" },
];

type Card = { title: string; meta: string; tone?: "blocker" | "done" };

const columns: { title: string; count: number; badge: { text: string; cls: string }; cards: Card[] }[] = [
  {
    title: "Backlog",
    count: 24,
    badge: { text: "P1: 8", cls: "bg-[var(--navy-100)] text-[var(--navy-300)]" },
    cards: [
      { title: "Module RDV intégré", meta: "Q3 2026 · 12j estimés" },
      { title: "Notifications mobiles iOS", meta: "Q3 2026 · 18j estimés" },
      { title: "Connecteur Salesforce", meta: "Q4 2026 · 24j estimés" },
      { title: "Dashboard analytics avancé", meta: "Q4 2026 · 16j estimés" },
    ],
  },
  {
    title: "En cours",
    count: 8,
    badge: { text: "3 bloq.", cls: "bg-[var(--gold-200)] text-[var(--medium-400)]" },
    cards: [
      { title: "⚠ Refonte module immobilier", meta: "~70 % · BLOQUANT", tone: "blocker" },
      { title: "Programme de parrainage", meta: "~50 % · 6j restants" },
      { title: "Recettes assurance Predica", meta: "~80 % · 2j restants" },
      { title: "Optimisation perf API", meta: "~30 % · 8j restants" },
    ],
  },
  {
    title: "En recette",
    count: 5,
    badge: { text: "À valider", cls: "bg-[var(--orange-bg)] text-[var(--orange-text)]" },
    cards: [
      { title: "Module SCPI v2", meta: "Recette client · 3 jours" },
      { title: "Export PDF étude", meta: "Recette client · 1 jour" },
      { title: "Filtres tableau clients", meta: "Recette interne · prête" },
    ],
  },
  {
    title: "Livré · ce mois",
    count: 14,
    badge: { text: "14", cls: "bg-[var(--green-bg)] text-[var(--green-text)]" },
    cards: [
      { title: "✓ Sélecteur de date global", meta: "04 mai · v2.4.1", tone: "done" },
      { title: "✓ Support 2FA", meta: "02 mai · v2.4.0", tone: "done" },
      { title: "✓ Connecteur Qonto v2", meta: "28 avr · v2.3.5", tone: "done" },
      { title: "✓ Bibliothèque docs · MAJ", meta: "22 avr · v2.3.4", tone: "done" },
    ],
  },
];

export default function RoadmapPage() {
  return (
    <>
      <Topbar current="Roadmap & releases" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Pilotage interne"
          title="Roadmap & releases"
          description="Vue produit consolidée — fonctionnalités en backlog, en cours de développement, en recette, livrées en production. Pilotée par le Responsable Technique."
          actions={
            <>
              <GhostButton>Voir Linear</GhostButton>
              <GoldButton>＋ Nouvelle release</GoldButton>
            </>
          }
        />

        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title} className="rounded-md border border-[var(--navy-100)] bg-white">
              <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3">
                <div className="text-[12.5px] font-bold uppercase tracking-wider text-[var(--navy)]">
                  {col.title} · {col.count}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold ${col.badge.cls}`}>
                  {col.badge.text}
                </span>
              </div>
              <div className="flex flex-col gap-2 p-3">
                {col.cards.map((c) => (
                  <div
                    key={c.title}
                    className={`rounded-md border bg-[var(--ivory)] p-3 hover:border-[var(--gold-300)] ${
                      c.tone === "blocker"
                        ? "border-l-[3px] border-l-[var(--red-text)] border-[var(--navy-100)]"
                        : "border-[var(--navy-100)]"
                    }`}
                  >
                    <div className="text-[12px] font-semibold text-[var(--navy)]">{c.title}</div>
                    <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">{c.meta}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
