import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero } from "../_components/PageHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";
import { DbClientsTable, type DbClient } from "./DbClientsTable";
import { ExportCsvButton } from "./ExportCsvButton";
import { NewClientButton } from "./NewClientButton";

export const dynamic = "force-dynamic";

async function fetchDbClients(): Promise<DbClient[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];

  // Scope obligatoire : on ne lit que les clients du tenant + cabinet de la session.
  // createAdminClient() bypasse RLS, donc le filtre tenant/cabinet est la seule barrière
  // anti-fuite cross-tenant tant que l'auth applicative n'est pas branchée sur RLS.
  const ctx = await getSessionContext();
  if (!ctx) return [];

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
          personnes ( first_name, last_name, email, phone ),
          dossiers ( internal_notes )
        `,
      )
      .eq("tenant_id", ctx.tenantId)
      .eq("cabinet_id", ctx.cabinetId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (!clients) return [];

    return clients.map((c: Record<string, unknown>) => {
      const cabinetRaw = c.cabinets as { name?: string } | { name?: string }[] | null | undefined;
      const cabinet = Array.isArray(cabinetRaw) ? cabinetRaw[0] : cabinetRaw;
      const personnesArr = (c.personnes as Array<{ first_name?: string; last_name?: string; email?: string; phone?: string }>) ?? [];
      const person = personnesArr[0];
      const dossiersArr = (c.dossiers as Array<{ internal_notes?: string }>) ?? [];
      const notesRaw = dossiersArr[0]?.internal_notes;
      let notes: {
        raison_sociale?: string;
        siren?: string;
        category?: string;
        sub_category?: string;
        pack?: string;
        revenue?: string;
        engineers?: string;
        end_clients?: string;
        status?: string;
        health?: string;
        is_demo?: boolean;
      } = {};
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
        representant_phone: person?.phone ?? null,
        raison_sociale: notes.raison_sociale ?? null,
        siren: notes.siren ?? null,
        category: notes.category ?? null,
        sub_category: notes.sub_category ?? null,
        pack: notes.pack ?? null,
        revenue: notes.revenue ?? null,
        engineers: notes.engineers ?? null,
        end_clients: notes.end_clients ?? null,
        status: notes.status ?? null,
        health: notes.health ?? null,
        is_demo: Boolean(notes.is_demo),
      };
    });
  } catch {
    return [];
  }
}

function computeKpis(clients: DbClient[]): KpiBlock[] {
  const total = clients.length;
  const marques = clients.filter((c) => c.category === "marque").length;
  const cabinets = clients.filter((c) => c.category === "cabinet_direct").length;
  const autres = clients.filter((c) => c.category === "autre_pro").length;

  const totalEngineers = clients.reduce((acc, c) => {
    const n = c.engineers?.replace(/[^0-9]/g, "");
    return acc + (n ? parseInt(n, 10) : 0);
  }, 0);

  const totalRevenue = clients.reduce((acc, c) => {
    const n = c.revenue?.replace(/[^0-9]/g, "");
    return acc + (n ? parseInt(n, 10) : 0);
  }, 0);

  return [
    { label: "Total clients", value: String(total), meta: "portefeuille global" },
    { label: "Marques", value: String(marques), meta: "franchise · licence · réseau" },
    {
      label: "Cabinets directs",
      value: String(cabinets),
      meta: "indépendants + mandataires",
    },
    { label: "Autres professionnels", value: String(autres), meta: "notaires · avocats · EC" },
    {
      label: "Total ingénieurs",
      value: totalEngineers > 0 ? String(totalEngineers) : "—",
      meta: "cumulés sur les comptes",
    },
    {
      label: "Revenu mensuel récurrent",
      value: totalRevenue > 0 ? totalRevenue.toLocaleString("fr-FR") : "—",
      unit: "€",
      meta: "cumul mensuel récurrent",
    },
  ];
}

export default async function ClientsPage() {
  const dbClients = await fetchDbClients();
  const kpis = computeKpis(dbClients);

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
              <ExportCsvButton clients={dbClients} />
              <NewClientButton />
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
              Aucun client pour l&apos;instant
            </div>
            <p className="mx-auto mb-5 max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              Crée ton premier client via le wizard. Il apparaîtra ici dès qu&apos;il sera activé.
            </p>
            <NewClientButton />
          </section>
        )}
      </div>
    </>
  );
}
