// Espace éditeur — page « Clients totaux actifs » (route /clients).
// Vrai chemin : lecture Supabase réelle (clients + personnes + dossiers.internal_notes),
// table DbClientsTable, création via NewClientModal, export via ExportCsvButton.
// Repli état vide honnête quand la base ne renvoie aucun client.
import { EditeurTopbar } from "../_components/EditeurTopbar";
import { DbClientsTable, type DbClient } from "./DbClientsTable";
import { ExportCsvButton } from "./ExportCsvButton";
import { NewClientButton } from "./NewClientButton";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

export const dynamic = "force-dynamic";

type Notes = {
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
};

function parseNotes(raw: unknown): Notes {
  if (typeof raw !== "string") return {};
  try {
    return JSON.parse(raw) as Notes;
  } catch {
    return {};
  }
}

async function fetchClients(): Promise<DbClient[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];

  // Scope obligatoire : on ne lit que les clients du tenant + cabinet de la session.
  // createAdminClient() bypasse RLS, donc sans ces filtres on lirait tous les tenants.
  const ctx = await getSessionContext();
  if (!ctx) return [];

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
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
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((row) => {
      const c = row as Record<string, unknown>;
      const cabinetRaw = c.cabinets as { name?: string } | { name?: string }[] | null | undefined;
      const cabinet = Array.isArray(cabinetRaw) ? cabinetRaw[0] : cabinetRaw;
      const persons =
        (c.personnes as Array<{
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
        }>) ?? [];
      const p = persons[0];
      const dossiersArr =
        (c.dossiers as Array<{ internal_notes?: string }>) ?? [];
      const notes = parseNotes(dossiersArr[0]?.internal_notes);

      const representant = p
        ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || null
        : null;

      return {
        id: c.id as string,
        created_at: c.created_at as string,
        household_address: (c.household_address as string) ?? null,
        cabinet_name: cabinet?.name ?? null,
        representant,
        representant_email: p?.email ?? null,
        representant_phone: p?.phone ?? null,
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
        is_demo: false,
      } satisfies DbClient;
    });
  } catch {
    return [];
  }
}

type Kpi = { label: string; value: string; unit?: string; meta: string };

function buildKpis(clients: DbClient[]): Kpi[] {
  const sumInt = (key: "engineers" | "revenue") =>
    clients.reduce((acc, c) => acc + (parseInt(c[key] ?? "", 10) || 0), 0);
  const countCat = (cat: string) => clients.filter((c) => c.category === cat).length;

  return [
    { label: "Total clients", value: String(clients.length), meta: "portefeuille global" },
    { label: "Marques", value: String(countCat("marque")), meta: "franchise · licence · réseau" },
    {
      label: "Cabinets directs",
      value: String(countCat("cabinet_direct")),
      meta: "indépendants + mandataires",
    },
    {
      label: "Autres professionnels",
      value: String(countCat("autre_pro")),
      meta: "notaires · avocats · EC",
    },
    { label: "Total ingénieurs", value: String(sumInt("engineers")), meta: "utilisateurs créés" },
    {
      label: "Revenu mensuel récurrent",
      value: sumInt("revenue").toLocaleString("fr-FR"),
      unit: "€",
      meta: "cumul mensuel récurrent",
    },
  ];
}

export default async function Page() {
  const clients = await fetchClients();
  const kpis = buildKpis(clients);

  return (
    <>
      <EditeurTopbar current="Clients totaux actifs" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Opérations clients</div>
            <h1 className="hero-title">Clients totaux actifs</h1>
            <p className="hero-sub">
              La liste des clients qui paient un abonnement à ASTRAEOS, répartie en 3 catégories :
              marques (franchise, licence, réseau), cabinets directs indépendants, autres
              professionnels (notaires, avocats, experts-comptables).
            </p>
          </div>
          <div className="hero-actions">
            <ExportCsvButton clients={clients} />
            <NewClientButton />
          </div>
        </div>

        <div className="kpis kpis-6 mb-20">
          {kpis.map((k) => (
            <div className="kpi" key={k.label}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">
                {k.value}
                {k.unit ? (
                  <>
                    {" "}
                    <span className="unit">{k.unit}</span>
                  </>
                ) : null}
              </div>
              <div className="kpi-meta">{k.meta}</div>
            </div>
          ))}
        </div>

        {clients.length === 0 ? (
          <section className="rounded-md border border-dashed border-[var(--navy-100)] bg-white px-6 py-12 text-center">
            <div className="text-[14px] font-semibold text-[var(--navy)]">
              Aucun client actif pour le moment
            </div>
            <p className="mx-auto mt-2 max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">
              Aucun client n&apos;est encore enregistré pour ce cabinet. Crée le premier client
              pour qu&apos;il apparaisse dans cette liste.
            </p>
            <div className="mt-5 flex justify-center">
              <NewClientButton />
            </div>
          </section>
        ) : (
          <DbClientsTable clients={clients} />
        )}
      </div>
    </>
  );
}
