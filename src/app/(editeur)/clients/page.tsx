import Link from "next/link";
import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, GhostButton, GoldButton } from "../_components/PageHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { DeleteAllButton } from "./DeleteAllButton";

export const dynamic = "force-dynamic";

type DbClient = {
  id: string;
  created_at: string;
  household_address: string | null;
  cabinet_name: string | null;
  representant: string | null;
  representant_email: string | null;
  raison_sociale: string | null;
  siren: string | null;
};

async function fetchDbClients(): Promise<DbClient[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    const supabase = createAdminClient();
    const { data: clients } = await supabase
      .from("clients")
      .select(
        `
          id,
          created_at,
          household_address,
          cabinets ( name ),
          personnes ( first_name, last_name, email ),
          dossiers ( internal_notes )
        `,
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (!clients) return [];

    return clients.map((c: Record<string, unknown>) => {
      const cabinetRaw = c.cabinets as { name?: string } | { name?: string }[] | null | undefined;
      const cabinet = Array.isArray(cabinetRaw) ? cabinetRaw[0] : cabinetRaw;
      const personnesArr = (c.personnes as Array<{ first_name?: string; last_name?: string; email?: string }>) ?? [];
      const person = personnesArr[0];
      const dossiersArr = (c.dossiers as Array<{ internal_notes?: string }>) ?? [];
      const notesRaw = dossiersArr[0]?.internal_notes;
      let notes: { raison_sociale?: string; siren?: string } = {};
      if (notesRaw) {
        try {
          notes = JSON.parse(notesRaw);
        } catch {
          // ignore
        }
      }
      return {
        id: c.id as string,
        created_at: c.created_at as string,
        household_address: (c.household_address as string) ?? null,
        cabinet_name: cabinet?.name ?? null,
        representant: person ? `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim() : null,
        representant_email: person?.email ?? null,
        raison_sociale: notes.raison_sociale ?? null,
        siren: notes.siren ?? null,
      };
    });
  } catch {
    return [];
  }
}

const kpis: KpiBlock[] = [
  { label: "Total clients", value: "23", meta: "portefeuille global" },
  { label: "Marques", value: "3", meta: "franchise · licence · réseau" },
  { label: "Cabinets directs", value: "17", meta: "indépendants + mandataires" },
  { label: "Autres professionnels", value: "3", meta: "notaires · avocats · EC" },
  { label: "Total ingénieurs", value: "~280", meta: "utilisateurs créés" },
  { label: "Revenu mensuel récurrent", value: "128 400", unit: "€", meta: "cumul mensuel récurrent" },
];

type Client = {
  id?: string;
  name: string;
  initials: string;
  category: string;
  categoryTone: "marque" | "cabinet" | "pro";
  engineers: string;
  endClients: string;
  revenue: string;
  pack: { v: string; cls: string };
  status: { v: string; cls: string };
  health: { v: string; cls: string };
  affiliated?: string;
  child?: boolean;
};

const sectionTitles = [
  "▾ Marques (franchise · licence · réseau) — cliquez sur une marque pour déplier ses cabinets affiliés",
  "▾ Cabinets directs (indépendants — incluant les mandataires des marques)",
  "▾ Autres professionnels (notaires, avocats, experts-comptables, etc.)",
];

const goldBadge = "bg-[var(--gold-200)] text-[var(--medium-400)]";
const infoBadge = "bg-[var(--light-blue)] text-[var(--navy)]";
const successBadge = "bg-[var(--green-bg)] text-[var(--green-text)]";
const warningBadge = "bg-[var(--orange-bg)] text-[var(--orange-text)]";
const dangerBadge = "bg-[var(--red-bg)] text-[var(--red-text)]";
const neutralBadge = "bg-[var(--navy-100)] text-[var(--navy-300)]";

const categoryClass = {
  marque: goldBadge,
  cabinet: infoBadge,
  pro: neutralBadge,
} as const;

const marquesClients: Client[] = [
  {
    id: "01",
    name: "PRIVEOS Capital",
    initials: "P",
    affiliated: "▾ 30 cabinets affiliés · cliquer pour déplier",
    category: "Marque · Licence",
    categoryTone: "marque",
    engineers: "~80",
    endClients: "486",
    revenue: "12 800 €",
    pack: { v: "Premium", cls: goldBadge },
    status: { v: "Actif", cls: successBadge },
    health: { v: "78", cls: warningBadge },
  },
];

const affiliatedClients: Client[] = [
  {
    name: "Cabinet Paris Étoile",
    initials: "PE",
    category: "Cabinet affilié",
    categoryTone: "cabinet",
    engineers: "8",
    endClients: "62",
    revenue: "— inclus —",
    pack: { v: "Hérité", cls: neutralBadge },
    status: { v: "Actif", cls: successBadge },
    health: { v: "94", cls: successBadge },
    child: true,
  },
  {
    name: "Cabinet Lyon Bellecour",
    initials: "L",
    category: "Cabinet affilié",
    categoryTone: "cabinet",
    engineers: "5",
    endClients: "38",
    revenue: "— inclus —",
    pack: { v: "Hérité", cls: neutralBadge },
    status: { v: "Actif", cls: successBadge },
    health: { v: "87", cls: successBadge },
    child: true,
  },
];

const otherMarques: Client[] = [
  {
    id: "02",
    name: "Fontaine & Réseau",
    initials: "F",
    affiliated: "▸ 12 cabinets affiliés",
    category: "Marque · Réseau",
    categoryTone: "marque",
    engineers: "~32",
    endClients: "198",
    revenue: "5 600 €",
    pack: { v: "Premium", cls: goldBadge },
    status: { v: "Actif", cls: successBadge },
    health: { v: "85", cls: successBadge },
  },
  {
    id: "03",
    name: "Atlas Patrimoine",
    initials: "A",
    affiliated: "▸ 8 cabinets affiliés (franchise)",
    category: "Marque · Franchise",
    categoryTone: "marque",
    engineers: "~24",
    endClients: "142",
    revenue: "3 800 €",
    pack: { v: "Standard", cls: infoBadge },
    status: { v: "Actif", cls: successBadge },
    health: { v: "82", cls: successBadge },
  },
];

const cabinets: Client[] = [
  {
    id: "04",
    name: "Cabinet Dupont & Associés",
    initials: "D",
    category: "Cabinet direct",
    categoryTone: "cabinet",
    engineers: "6",
    endClients: "48",
    revenue: "2 400 €",
    pack: { v: "Premium", cls: goldBadge },
    status: { v: "Actif", cls: successBadge },
    health: { v: "92", cls: successBadge },
  },
  {
    id: "05",
    name: "Mont-Blanc Patrimoine",
    initials: "MB",
    category: "Cabinet direct",
    categoryTone: "cabinet",
    engineers: "4",
    endClients: "32",
    revenue: "2 100 €",
    pack: { v: "Premium", cls: goldBadge },
    status: { v: "Actif", cls: successBadge },
    health: { v: "89", cls: successBadge },
  },
  {
    id: "06",
    name: "Cabinet Lyonnais",
    initials: "L",
    category: "Cabinet direct",
    categoryTone: "cabinet",
    engineers: "3",
    endClients: "22",
    revenue: "1 800 €",
    pack: { v: "Standard", cls: infoBadge },
    status: { v: "À risque", cls: warningBadge },
    health: { v: "58", cls: warningBadge },
  },
  {
    id: "07",
    name: "Bordeaux Patrimoine",
    initials: "B",
    category: "Cabinet direct",
    categoryTone: "cabinet",
    engineers: "2",
    endClients: "14",
    revenue: "1 200 €",
    pack: { v: "Standard", cls: infoBadge },
    status: { v: "À risque", cls: warningBadge },
    health: { v: "42", cls: dangerBadge },
  },
];

const pros: Client[] = [
  {
    id: "21",
    name: "Notaire Mercier & Cie",
    initials: "M",
    category: "Notaire",
    categoryTone: "pro",
    engineers: "3",
    endClients: "28",
    revenue: "1 200 €",
    pack: { v: "Standard", cls: infoBadge },
    status: { v: "Actif", cls: successBadge },
    health: { v: "88", cls: successBadge },
  },
  {
    id: "22",
    name: "Cabinet Aubert · Avocats",
    initials: "A",
    category: "Avocat",
    categoryTone: "pro",
    engineers: "2",
    endClients: "12",
    revenue: "980 €",
    pack: { v: "Standard", cls: infoBadge },
    status: { v: "Actif", cls: successBadge },
    health: { v: "81", cls: successBadge },
  },
  {
    id: "23",
    name: "Notaire Pollet",
    initials: "P",
    category: "Notaire",
    categoryTone: "pro",
    engineers: "1",
    endClients: "8",
    revenue: "820 €",
    pack: { v: "Standard", cls: infoBadge },
    status: { v: "À risque", cls: warningBadge },
    health: { v: "54", cls: warningBadge },
  },
];

function ClientRow({ c }: { c: Client }) {
  return (
    <tr
      className={`text-[12px] hover:bg-[var(--light-blue)] ${c.child ? "bg-[var(--light-blue)]/40" : ""}`}
    >
      <td
        className={`px-4 py-3 font-bold tabular-nums ${c.child ? "pl-8 text-[var(--navy-300)]" : "text-[var(--gold)]"}`}
      >
        {c.id ?? "└"}
      </td>
      <td className="px-4 py-3">
        <div className={`flex items-center gap-2.5 ${c.child ? "pl-2" : ""}`}>
          <div
            className={`flex items-center justify-center rounded-md bg-[var(--navy)] font-bold text-white ${c.child ? "h-6 w-6 text-[10px]" : "h-7 w-7 text-[11px]"}`}
          >
            {c.initials}
          </div>
          <div>
            <div className={`font-semibold ${c.child ? "text-[12px]" : "text-[var(--navy)]"}`}>
              {c.name}
            </div>
            {c.affiliated && (
              <div className="mt-0.5 text-[10.5px] text-[var(--navy-300)]">{c.affiliated}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${categoryClass[c.categoryTone]}`}>
          {c.category}
        </span>
      </td>
      <td className="px-4 py-3 text-right tabular-nums">{c.engineers}</td>
      <td className="px-4 py-3 text-right tabular-nums">{c.endClients}</td>
      <td className="px-4 py-3 text-right tabular-nums">{c.revenue}</td>
      <td className="px-4 py-3">
        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${c.pack.cls}`}>
          {c.pack.v}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${c.status.cls}`}>
          {c.status.v}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${c.health.cls}`}>
          {c.health.v}
        </span>
      </td>
    </tr>
  );
}

function SectionRow({ title }: { title: string }) {
  return (
    <tr className="bg-[var(--ivory)]">
      <td colSpan={9} className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--navy-300)]">
        {title}
      </td>
    </tr>
  );
}

export default async function ClientsPage() {
  const dbClients = await fetchDbClients();

  return (
    <>
      <Topbar current="Clients totaux actifs" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Opérations clients"
          title="Clients totaux actifs"
          description="La liste des clients qui paient un abonnement à ASTRAEOS, répartie en 3 catégories : marques (franchise, licence, réseau), cabinets directs indépendants, autres professionnels (notaires, avocats, experts-comptables)."
          actions={
            <>
              <GhostButton>Export CSV</GhostButton>
              <Link href="/client-new">
                <GoldButton>＋ Nouveau client</GoldButton>
              </Link>
            </>
          }
        />

        {dbClients.length > 0 && (
          <section className="mb-8 rounded-md border border-[var(--gold-300)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--navy-100)] bg-[var(--gold-200)]/30 px-4 py-3">
              <div className="text-[13px] font-semibold text-[var(--navy)]">
                ✨ Clients créés via le wizard ({dbClients.length})
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10.5px] text-[var(--navy-300)]">
                  Données réelles · Supabase
                </span>
                <DeleteAllButton />
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                  <th className="px-4 py-3">Raison sociale</th>
                  <th className="px-4 py-3">SIREN</th>
                  <th className="px-4 py-3">Représentant légal</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Cabinet</th>
                  <th className="px-4 py-3">Adresse</th>
                  <th className="px-4 py-3 text-right">Créé le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--navy-100)]">
                {dbClients.map((c) => (
                  <tr key={c.id} className="text-[12px] text-[var(--navy)] hover:bg-[var(--light-blue)]">
                    <td className="px-4 py-3 font-semibold">{c.raison_sociale ?? "—"}</td>
                    <td className="px-4 py-3 tabular-nums text-[var(--navy-300)]">{c.siren ?? "—"}</td>
                    <td className="px-4 py-3">{c.representant ?? "—"}</td>
                    <td className="px-4 py-3 text-[var(--navy-300)]">{c.representant_email ?? "—"}</td>
                    <td className="px-4 py-3">{c.cabinet_name ?? "—"}</td>
                    <td className="px-4 py-3 text-[11px] text-[var(--navy-300)]">{c.household_address ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-[11px] text-[var(--navy-300)]">
                      {new Date(c.created_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <section className="rounded-md border border-[var(--navy-100)] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--navy-100)] px-4 py-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Tous", count: 23, active: true },
                { label: "Marques", count: 3 },
                { label: "Cabinets directs", count: 17 },
                { label: "Autres pros", count: 3 },
                { label: "À risque", count: 3 },
              ].map((f) => (
                <button
                  type="button"
                  key={f.label}
                  className={`rounded-md px-3 py-1.5 text-[11.5px] font-semibold ${
                    f.active
                      ? "bg-[var(--navy)] text-white"
                      : "border border-[var(--navy-100)] bg-white text-[var(--navy)] hover:border-[var(--gold)]"
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
            <input
              type="search"
              placeholder="Rechercher un client..."
              className="rounded-md border border-[var(--navy-100)] bg-white px-3 py-1.5 text-[12px] placeholder:text-[var(--navy-300)] focus:border-[var(--gold)] focus:outline-none"
            />
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3 text-right">Ingénieurs</th>
                <th className="px-4 py-3 text-right">Clients finaux</th>
                <th className="px-4 py-3 text-right">Revenu /mois</th>
                <th className="px-4 py-3">Pack</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-center">Santé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--navy-100)]">
              <SectionRow title={sectionTitles[0]} />
              {marquesClients.map((c) => (
                <ClientRow key={c.name} c={c} />
              ))}
              {affiliatedClients.map((c) => (
                <ClientRow key={c.name} c={c} />
              ))}
              <tr className="bg-[var(--light-blue)]/40">
                <td colSpan={9} className="px-4 py-2 text-center text-[11.5px] text-[var(--navy-300)]">
                  … et <strong className="text-[var(--gold)]">28 autres cabinets affiliés</strong> ·{" "}
                  <a className="cursor-pointer font-semibold text-[var(--gold)]">voir la liste complète</a>
                </td>
              </tr>
              {otherMarques.map((c) => (
                <ClientRow key={c.name} c={c} />
              ))}

              <SectionRow title={sectionTitles[1]} />
              {cabinets.map((c) => (
                <ClientRow key={c.name} c={c} />
              ))}

              <SectionRow title={sectionTitles[2]} />
              {pros.map((c) => (
                <ClientRow key={c.name} c={c} />
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
