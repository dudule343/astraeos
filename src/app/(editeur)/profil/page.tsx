import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton } from "../_components/PageHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionContext } from "@/lib/auth/context";

export const dynamic = "force-dynamic";

type Engineer = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  oriasNumber: string | null;
  specialties: string[];
  mfaEnabled: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
};

const PLACEHOLDER: Engineer = {
  firstName: "Sarah",
  lastName: "Kaufmann",
  email: null,
  phone: null,
  role: "engineer",
  oriasNumber: null,
  specialties: [],
  mfaEnabled: false,
  isActive: true,
  lastLoginAt: null,
  createdAt: null,
};

async function fetchEngineer(): Promise<{ engineer: Engineer; fromDb: boolean }> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { engineer: PLACEHOLDER, fromDb: false };
  }
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { engineer: PLACEHOLDER, fromDb: false };
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("users")
      .select(
        `
          first_name,
          last_name,
          email,
          phone,
          role,
          orias_number,
          specialties,
          mfa_enabled,
          is_active,
          last_login_at,
          created_at
        `,
      )
      .eq("id", ctx.userId)
      .maybeSingle();

    if (!data) return { engineer: PLACEHOLDER, fromDb: false };

    return {
      engineer: {
        firstName: (data.first_name as string) ?? PLACEHOLDER.firstName,
        lastName: (data.last_name as string) ?? PLACEHOLDER.lastName,
        email: (data.email as string) ?? null,
        phone: (data.phone as string) ?? null,
        role: (data.role as string) ?? null,
        oriasNumber: (data.orias_number as string) ?? null,
        specialties: (data.specialties as string[]) ?? [],
        mfaEnabled: Boolean(data.mfa_enabled),
        isActive: Boolean(data.is_active),
        lastLoginAt: (data.last_login_at as string) ?? null,
        createdAt: (data.created_at as string) ?? null,
      },
      fromDb: true,
    };
  } catch {
    return { engineer: PLACEHOLDER, fromDb: false };
  }
}

const ROLE_LABELS: Record<string, string> = {
  engineer: "Ingénieur patrimonial",
  cabinet_director: "Directeur de cabinet",
  brand_owner: "Responsable de marque",
  compliance: "Conformité",
  editor: "Éditeur",
  client: "Client",
};

const SPECIALTY_LABELS: Record<string, string> = {
  av_multisupport: "Assurance-vie multisupport",
  av_lux: "Assurance-vie luxembourgeoise",
  per: "Plan épargne retraite (PER)",
  scpi: "SCPI",
  fpci: "FPCI",
  opci: "OPCI",
  structure: "Produits structurés",
  prevoyance: "Prévoyance",
  credit: "Crédit",
  immobilier: "Immobilier",
  fiscalite: "Fiscalité",
  transmission: "Transmission & succession",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

type Agrement = {
  label: string;
  detail: string;
  active: boolean;
  value: string;
};

function buildAgrements(e: Engineer): Agrement[] {
  const hasOrias = Boolean(e.oriasNumber);
  return [
    {
      label: "Conseiller en investissements financiers (CIF)",
      detail: "Catégorie réglementée AMF · association agréée",
      active: hasOrias,
      value: hasOrias ? "Enregistré" : "Non renseigné",
    },
    {
      label: "Courtier en assurance",
      detail: "Distribution de produits d'assurance (DDA)",
      active: hasOrias,
      value: hasOrias ? "Enregistré" : "Non renseigné",
    },
    {
      label: "Immatriculation ORIAS",
      detail: e.oriasNumber ? `N° ${e.oriasNumber}` : "Registre unique des intermédiaires",
      active: hasOrias,
      value: e.oriasNumber ?? "Non renseigné",
    },
    {
      label: "Conformité LCB-FT",
      detail: "Lutte contre le blanchiment · KYC à jour",
      active: e.isActive,
      value: e.isActive ? "À jour" : "À vérifier",
    },
  ];
}

function computeKpis(e: Engineer, agrements: Agrement[]): KpiBlock[] {
  const actifs = agrements.filter((a) => a.active).length;
  const conforme = e.isActive && Boolean(e.oriasNumber);

  return [
    {
      label: "Statut conformité",
      value: conforme ? "Conforme" : "À compléter",
      valueTone: conforme ? "gold" : "alert",
      meta: conforme ? "tous les agréments requis présents" : "agrément ou ORIAS manquant",
    },
    {
      label: "Agréments actifs",
      value: `${actifs}/${agrements.length}`,
      meta: "CIF · courtier · ORIAS · LCB-FT",
    },
    {
      label: "Authentification forte",
      value: e.mfaEnabled ? "MFA activé" : "MFA inactif",
      valueTone: e.mfaEnabled ? "gold" : "alert",
      meta: e.mfaEnabled ? "second facteur en place" : "à activer pour sécuriser le compte",
    },
    {
      label: "Spécialités",
      value: String(e.specialties.length),
      meta: "domaines d'expertise déclarés",
    },
  ];
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--navy-100)] py-2.5 last:border-b-0">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--navy-300)]">
        {label}
      </span>
      <span className="text-right text-[13px] font-medium text-[var(--navy)]">{value}</span>
    </div>
  );
}

export default async function ProfilPage() {
  const { engineer, fromDb } = await fetchEngineer();
  const agrements = buildAgrements(engineer);
  const kpis = computeKpis(engineer, agrements);
  const fullName = `${engineer.firstName} ${engineer.lastName}`.trim();
  const roleLabel = engineer.role ? ROLE_LABELS[engineer.role] ?? engineer.role : "Ingénieur patrimonial";

  return (
    <>
      <Topbar current="Mon profil & agréments" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Compte & habilitations réglementaires"
          title="Mon profil & agréments"
          description={
            fromDb
              ? `Identité, agréments réglementaires et coordonnées de ${fullName} · ${roleLabel}.`
              : "Données non connectées · profil affiché à titre indicatif. Renseignez vos agréments une fois la base reliée."
          }
          actions={<GhostButton>Modifier le profil</GhostButton>}
        />

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-md border border-[var(--navy-100)] bg-white p-6">
            <SectionHeader eyebrow="Identité" title="Ingénieur patrimonial" />
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-[20px] font-bold text-white">
                {initials(engineer.firstName, engineer.lastName)}
              </div>
              <div>
                <div className="text-[16px] font-semibold text-[var(--navy)]">{fullName}</div>
                <div className="mt-0.5 text-[12px] text-[var(--navy-300)]">{roleLabel}</div>
                <span
                  className={`mt-2 inline-block rounded-sm px-2 py-0.5 text-[10px] font-bold ${
                    engineer.isActive
                      ? "bg-[var(--gold-100)] text-[var(--gold-deep)]"
                      : "bg-[var(--navy-100)] text-[var(--navy-300)]"
                  }`}
                >
                  {engineer.isActive ? "Compte actif" : "Compte inactif"}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <InfoRow label="Rôle" value={roleLabel} />
              <InfoRow label="Membre depuis" value={fmtDate(engineer.createdAt)} />
              <InfoRow label="Dernière connexion" value={fmtDate(engineer.lastLoginAt)} />
            </div>
          </div>

          <div className="rounded-md border border-[var(--navy-100)] bg-white p-6">
            <SectionHeader
              eyebrow="Agréments"
              title="Habilitations réglementaires"
              right={
                <span className="text-[11px] font-semibold text-[var(--navy-300)]">
                  {agrements.filter((a) => a.active).length}/{agrements.length} actifs
                </span>
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {agrements.map((a) => (
                <div
                  key={a.label}
                  className={`rounded-md border p-4 ${
                    a.active
                      ? "border-[var(--gold-200)] bg-[var(--ivory)]"
                      : "border-dashed border-[var(--navy-100)] bg-white"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="text-[12.5px] font-bold leading-tight text-[var(--navy)]">
                      {a.label}
                    </span>
                    <span
                      className={`flex-shrink-0 rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] ${
                        a.active
                          ? "bg-[var(--gold)] text-white"
                          : "bg-[var(--navy-100)] text-[var(--navy-300)]"
                      }`}
                    >
                      {a.active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  <div className="text-[11px] leading-snug text-[var(--navy-300)]">{a.detail}</div>
                  <div className="mt-2 text-[12px] font-semibold text-[var(--navy)]">{a.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-md border border-[var(--navy-100)] bg-white p-6">
            <SectionHeader eyebrow="Coordonnées" title="Contact professionnel" />
            <InfoRow label="E-mail" value={engineer.email ?? "—"} />
            <InfoRow label="Téléphone" value={engineer.phone ?? "—"} />
            <InfoRow label="N° ORIAS" value={engineer.oriasNumber ?? "Non renseigné"} />
            <InfoRow
              label="Authentification (MFA)"
              value={engineer.mfaEnabled ? "Activée" : "Désactivée"}
            />
          </div>

          <div className="rounded-md border border-[var(--navy-100)] bg-white p-6">
            <SectionHeader eyebrow="Expertise" title="Spécialités déclarées" />
            {engineer.specialties.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {engineer.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-[var(--navy-100)] bg-[var(--light-blue)] px-3 py-1.5 text-[12px] font-medium text-[var(--navy)]"
                  >
                    {SPECIALTY_LABELS[s] ?? s}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-[var(--navy-100)] p-6 text-center text-[12px] text-[var(--navy-300)]">
                Aucune spécialité déclarée pour l&apos;instant.
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
