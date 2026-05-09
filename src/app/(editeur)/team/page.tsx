"use client";

import { useState } from "react";
import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, GhostButton, GoldButton } from "../_components/PageHeader";

const kpisCount: KpiBlock[] = [
  { label: "Effectif total", value: "11", meta: "salariés + prestataires" },
  { label: "Direction", value: "2", meta: "Présidente fondatrice + Dir. des opérations" },
  { label: "Technique", value: "4", meta: "resp. tech + 3 développeurs" },
  { label: "Support & relation", value: "3", meta: "2 resp. relation client + 1 N1" },
  { label: "Commerciaux", value: "2", meta: "1 commercial senior + 1 jr" },
];

const kpisCost: KpiBlock[] = [
  {
    label: "Coût total mensuel",
    value: "82 400",
    unit: "€",
    meta: "salaires + charges + prestataires",
  },
  { label: "Charge sur le CA", value: "33", unit: "%", meta: "cible < 35 % · OK" },
  {
    label: "Coût moyen par collaborateur",
    value: "7 490",
    unit: "€",
    meta: "coût mensuel chargé moyen",
  },
];

type Member = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  clients: string;
  cost: string;
  charge: string;
  metricsType: "tech" | "support" | "commercial" | null;
};

type Category = {
  icon: string;
  title: string;
  meta: string;
  members: Member[];
};

const categories: Category[] = [
  {
    icon: "👑",
    title: "DIRECTION",
    meta: "2 personnes · 16 800 €/mois · 7 % du CA",
    members: [
      {
        id: "sarah",
        name: "Sarah KAUFMANN",
        role: "Présidente fondatrice",
        email: "s.kaufmann@astraeos.fr",
        phone: "06 12 34 56 78",
        clients: "tous (transverse)",
        cost: "9 800 €",
        charge: "3,9 %",
        metricsType: null,
      },
      {
        id: "pierre",
        name: "Pierre DELACOUR",
        role: "Directeur des opérations",
        email: "p.delacour@astraeos.fr",
        phone: "06 23 45 67 89",
        clients: "tous (transverse)",
        cost: "7 000 €",
        charge: "2,8 %",
        metricsType: null,
      },
    ],
  },
  {
    icon: "💻",
    title: "TECHNIQUE",
    meta: "4 personnes · 28 200 €/mois · 11 % du CA",
    members: [
      {
        id: "lea",
        name: "Léa MERCIER",
        role: "Responsable Technique",
        email: "l.mercier@astraeos.fr",
        phone: "06 34 56 78 90",
        clients: "infrastructure (transverse)",
        cost: "8 600 €",
        charge: "3,4 %",
        metricsType: "tech",
      },
      {
        id: "antoine",
        name: "Antoine ROUSSEL",
        role: "Développeur senior fullstack",
        email: "a.roussel@astraeos.fr",
        phone: "06 45 67 89 01",
        clients: "tous (modules core)",
        cost: "7 200 €",
        charge: "2,9 %",
        metricsType: "tech",
      },
      {
        id: "camille",
        name: "Camille PIROTTE",
        role: "Développeuse frontend",
        email: "c.pirotte@astraeos.fr",
        phone: "06 56 78 90 12",
        clients: "tous (UI/UX)",
        cost: "6 400 €",
        charge: "2,5 %",
        metricsType: "tech",
      },
      {
        id: "maxime",
        name: "Maxime DUFOUR",
        role: "Développeur backend (prestataire)",
        email: "m.dufour@astraeos.fr",
        phone: "06 67 89 01 23",
        clients: "tous (API, intégrations)",
        cost: "6 000 €",
        charge: "2,4 %",
        metricsType: "tech",
      },
    ],
  },
  {
    icon: "🛟",
    title: "SUPPORT",
    meta: "3 personnes · 18 600 €/mois · 7,4 % du CA",
    members: [
      {
        id: "elodie",
        name: "Élodie VARIN",
        role: "Responsable Relation Client senior",
        email: "e.varin@astraeos.fr",
        phone: "06 78 90 12 34",
        clients: "PRIVEOS, Atlas, 5 cabinets",
        cost: "6 800 €",
        charge: "2,7 %",
        metricsType: "support",
      },
      {
        id: "thomas",
        name: "Thomas GAUTHIER",
        role: "Responsable Relation Client",
        email: "t.gauthier@astraeos.fr",
        phone: "06 89 01 23 45",
        clients: "Fontaine, 8 cabinets, 3 pros",
        cost: "5 800 €",
        charge: "2,3 %",
        metricsType: "support",
      },
      {
        id: "julie",
        name: "Julie MERCANTI",
        role: "Support technique N1",
        email: "j.mercanti@astraeos.fr",
        phone: "06 90 12 34 56",
        clients: "tous (tickets de support)",
        cost: "6 000 €",
        charge: "2,4 %",
        metricsType: "support",
      },
    ],
  },
  {
    icon: "🎯",
    title: "COMMERCIAUX",
    meta: "2 personnes · 18 800 €/mois · 7,5 % du CA",
    members: [
      {
        id: "marc",
        name: "Marc DUPRE",
        role: "Commercial senior",
        email: "m.dupre@astraeos.fr",
        phone: "07 12 34 56 78",
        clients: "acquisition + closing",
        cost: "10 800 €",
        charge: "4,3 %",
        metricsType: "commercial",
      },
      {
        id: "hugues",
        name: "Hugues CARTIER",
        role: "Commercial junior",
        email: "h.cartier@astraeos.fr",
        phone: "07 23 45 67 89",
        clients: "qualification de leads",
        cost: "8 000 €",
        charge: "3,2 %",
        metricsType: "commercial",
      },
    ],
  },
];

const techMetrics = [
  ["Tickets traités cette semaine", "14"],
  ["Déploiements en production", "3"],
  ["Bugs résolus", "8"],
  ["Code reviews effectuées", "11"],
  ["Pull requests fusionnées", "6"],
];

const supportMetrics: [string, string, boolean?][] = [
  ["Tickets reçus cette semaine", "38"],
  ["Tickets résolus", "34"],
  ["Appels téléphoniques traités", "22"],
  ["Temps moyen de résolution", "2 h 14"],
  ["Note de satisfaction client", "4,8 / 5", true],
];

const commercialMetrics: [string, string, boolean?][] = [
  ["Contacts pris cette semaine", "42"],
  ["RDV planifiés", "8"],
  ["RDV réalisés", "6"],
  ["Conversions (signatures)", "2", true],
  ["CA généré cette semaine", "14 200 €", true],
];

const weekDays = [
  { day: "L", level: 2 },
  { day: "M", level: 3 },
  { day: "M", level: 3 },
  { day: "J", level: 2 },
  { day: "V", level: 3 },
  { day: "S", level: 1 },
  { day: "D", level: 0 },
];

const levelClass: Record<number, string> = {
  0: "bg-[var(--navy-100)] text-[var(--navy-300)]",
  1: "bg-[var(--gold-200)] text-[var(--medium-400)]",
  2: "bg-[var(--gold-300)] text-white",
  3: "bg-[var(--gold)] text-white",
};

export default function TeamPage() {
  const [openMember, setOpenMember] = useState<Member | null>(null);

  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2);

  return (
    <>
      <Topbar current="Équipe interne" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Pilotage interne"
          title="Équipe interne"
          description="Effectif d'ASTRAEOS organisé en 4 catégories : Direction, Technique, Support, Commerciaux. Coût et charge sur le CA suivis en temps réel."
          actions={
            <>
              <GhostButton>Export RH</GhostButton>
              <GoldButton>＋ Nouveau collaborateur</GoldButton>
            </>
          }
        />

        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {kpisCount.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {kpisCost.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <div className="mb-3 flex items-start gap-2 rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] px-4 py-3 text-[11.5px] text-[var(--navy)]">
          <span>ℹ️</span>
          <div>
            Cliquez sur un collaborateur (hors direction) pour ouvrir sa fiche détaillée — activité
            de la semaine, indicateurs adaptés à son rôle (technique, support ou commercial).
          </div>
        </div>

        <section className="rounded-md border border-[var(--navy-100)] bg-white">
          {categories.map((cat) => (
            <div key={cat.title}>
              <div className="flex items-center gap-3 border-y border-[var(--navy-100)] bg-[var(--ivory)] px-4 py-2.5 first:border-t-0">
                <span className="text-base">{cat.icon}</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--navy)]">
                  {cat.title}
                </span>
                <span className="ml-auto text-[10.5px] text-[var(--navy-300)]">{cat.meta}</span>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--navy-100)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                    <th className="px-4 py-2.5">Prénom Nom</th>
                    <th className="px-4 py-2.5">Rôle</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Téléphone</th>
                    <th className="px-4 py-2.5 text-right">Clients affectés</th>
                    <th className="px-4 py-2.5 text-right">Coût ASTRAEOS /mois</th>
                    <th className="px-4 py-2.5 text-right">Charge / CA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--navy-100)]">
                  {cat.members.map((m) => {
                    const clickable = m.metricsType !== null;
                    return (
                      <tr
                        key={m.id}
                        onClick={clickable ? () => setOpenMember(m) : undefined}
                        className={`text-[12px] text-[var(--navy)] ${
                          clickable ? "cursor-pointer hover:bg-[var(--light-blue)]" : ""
                        }`}
                      >
                        <td className="px-4 py-2.5 font-semibold">{m.name}</td>
                        <td className="px-4 py-2.5">{m.role}</td>
                        <td className="px-4 py-2.5 text-[11px] text-[var(--navy-300)]">{m.email}</td>
                        <td className="px-4 py-2.5 text-[11px] text-[var(--navy-300)]">{m.phone}</td>
                        <td className="px-4 py-2.5 text-right">{m.clients}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{m.cost}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{m.charge}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}

          <div className="flex items-center justify-between border-t-2 border-[var(--gold)] bg-gradient-to-r from-[var(--gold-200)] to-[var(--ivory)] px-5 py-3.5">
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--navy-300)]">
                Total masse salariale
              </div>
              <div className="text-[13px] text-[var(--navy)]">
                11 collaborateurs (salariés + prestataires)
              </div>
            </div>
            <div className="text-right">
              <div className="text-[24px] font-bold text-[var(--gold)]">82 400 €/mois</div>
              <div className="mt-1 text-[13px] text-[var(--navy)]">
                soit <strong>33 % du CA</strong> · cible &lt; 35 % ✓
              </div>
            </div>
          </div>
        </section>
      </div>

      {openMember && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[rgba(16,45,80,0.45)]"
            onClick={() => setOpenMember(null)}
          />
          <aside className="fixed right-0 top-0 z-50 flex h-screen w-[440px] flex-col overflow-y-auto bg-white shadow-xl">
            <div className="relative bg-gradient-to-br from-[var(--navy)] to-[#1a3866] px-6 py-7 text-white">
              <button
                type="button"
                onClick={() => setOpenMember(null)}
                className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                ×
              </button>
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)] text-[20px] font-bold">
                {initials(openMember.name)}
              </div>
              <div className="text-[18px] font-bold">{openMember.name}</div>
              <div className="text-[12px] text-[var(--gold-300)]">{openMember.role}</div>
              <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-white/80">
                <span>📧 {openMember.email}</span>
                <span>📞 {openMember.phone}</span>
              </div>
            </div>

            <div className="flex-1 px-5 py-5">
              <div className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.12em] text-[var(--gold)]">
                Activité de la semaine en cours
              </div>
              <div className="mb-2 text-[11px] text-[var(--navy-300)]">
                Du lundi 4 au dimanche 10 mai 2026
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {weekDays.map((d, i) => (
                  <div
                    key={i}
                    className={`flex aspect-square items-center justify-center rounded-md text-[12px] font-bold ${levelClass[d.level]}`}
                  >
                    {d.day}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[10.5px] text-[var(--navy-300)]">
                Saturation : <span className="text-[var(--navy-300)]">●</span> repos ·{" "}
                <span className="text-[var(--gold-300)]">●</span> faible ·{" "}
                <span className="text-[var(--gold-300)]">●</span> normale ·{" "}
                <span className="text-[var(--gold)]">●</span> intense
              </div>

              {openMember.metricsType === "tech" && (
                <Metrics title="Indicateurs techniques" rows={techMetrics} />
              )}
              {openMember.metricsType === "support" && (
                <Metrics title="Indicateurs support & relation" rows={supportMetrics} />
              )}
              {openMember.metricsType === "commercial" && (
                <Metrics title="Indicateurs commerciaux" rows={commercialMetrics} />
              )}

              <div className="mt-5 rounded-md bg-[var(--ivory)] px-3.5 py-2.5 text-[11px] leading-relaxed text-[var(--navy-300)]">
                <strong className="text-[var(--navy)]">Note :</strong> les indicateurs sont
                renseignés par le collaborateur lui-même via son espace personnel ASTRAEOS, et
                automatiquement consolidés ici.
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

function Metrics({ title, rows }: { title: string; rows: (string | boolean | undefined)[][] }) {
  return (
    <div className="mt-5">
      <div className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.12em] text-[var(--gold)]">
        {title}
      </div>
      {rows.map(([label, value, gold]) => (
        <div
          key={label as string}
          className="flex justify-between border-b border-[var(--navy-100)] py-2 text-[12px] last:border-0"
        >
          <span className="text-[var(--navy-300)]">{label as string}</span>
          <span className={`font-semibold ${gold ? "text-[var(--gold)]" : "text-[var(--navy)]"}`}>
            {value as string}
          </span>
        </div>
      ))}
    </div>
  );
}
