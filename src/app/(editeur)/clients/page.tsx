import Link from "next/link";
import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, GhostButton, GoldButton } from "../_components/PageHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { DbClientsTable, type DbClient } from "./DbClientsTable";

export const dynamic = "force-dynamic";

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

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {dbClients.length > 0 ? (
          <DbClientsTable clients={dbClients} />
        ) : (
          <section className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
            <div className="mb-3 text-[40px] leading-none">📋</div>
            <div className="mb-2 text-[16px] font-semibold text-[var(--navy)]">
              Aucun client pour l'instant
            </div>
            <p className="mx-auto mb-5 max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              Crée ton premier client via le wizard. Il apparaîtra ici dès qu'il sera activé.
            </p>
            <Link
              href="/client-new"
              className="inline-block rounded-md bg-[var(--gold)] px-4 py-2 text-[12.5px] font-bold text-white hover:brightness-110"
            >
              ＋ Créer un client
            </Link>
          </section>
        )}
      </div>
    </>
  );
}
