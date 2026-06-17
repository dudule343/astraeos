import { Topbar } from "../../_components/Topbar";
import { EmptyState } from "../../_components/EmptyState";
import { PageHero, SectionHeader, GhostButton } from "../../../(editeur)/_components/PageHeader";
import {
  fetchCabinetProfile,
  fetchCabinetUsers,
  USER_ROLE_LABELS,
} from "../../_data/cabinet";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Paramétrages",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[10.5px] uppercase tracking-wide text-[var(--navy-300)]">{label}</dt>
      <dd className="text-[12.5px] text-[var(--navy)]">{value || "—"}</dd>
    </div>
  );
}

export default async function ParametragesPage() {
  const [profile, users] = await Promise.all([fetchCabinetProfile(), fetchCabinetUsers()]);

  const address = profile
    ? [profile.address_street, [profile.address_zipcode, profile.address_city].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ")
    : null;

  const split = profile?.commission_split_to_owner;

  return (
    <>
      <Topbar current="Paramétrages du cabinet" />

      <div className="px-10 py-8">
        <PageHero
          eyebrow="Administration"
          title="Paramétrages du cabinet"
          description="Coordonnées, agréments réglementaires, règle de répartition des commissions et gestion des accès des utilisateurs."
          actions={<GhostButton>Modifier</GhostButton>}
        />

        {profile ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section>
              <SectionHeader eyebrow="Identité" title="Coordonnées du cabinet" />
              <div className="rounded-md border border-[var(--navy-100)] bg-white p-5">
                <dl className="grid grid-cols-2 gap-4">
                  <Field label="Raison sociale" value={profile.name} />
                  <Field label="Téléphone" value={profile.phone} />
                  <Field label="E-mail" value={profile.email} />
                  <Field label="Adresse" value={address} />
                  <Field label="Client depuis" value={fmtDate(profile.contract_start_date)} />
                </dl>
              </div>
            </section>

            <section>
              <SectionHeader eyebrow="Conformité" title="Agréments & assurance" />
              <div className="rounded-md border border-[var(--navy-100)] bg-white p-5">
                <dl className="grid grid-cols-2 gap-4">
                  <Field label="Numéro ORIAS" value={profile.orias_number} />
                  <Field label="Assureur RC Pro" value={profile.rc_pro_insurer} />
                  <Field label="Échéance RC Pro" value={fmtDate(profile.rc_pro_expiry_date)} />
                  <Field
                    label="Répartition vers la marque"
                    value={split != null ? `${split} %` : null}
                  />
                </dl>
              </div>
            </section>

            <section className="lg:col-span-2">
              <SectionHeader
                eyebrow="Accès"
                title={`Utilisateurs du cabinet (${users.length})`}
              />
              {users.length > 0 ? (
                <div className="overflow-x-auto rounded-md border border-[var(--navy-100)] bg-white">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[var(--navy-100)] bg-[var(--ivory)] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
                        <th className="px-4 py-3">Utilisateur</th>
                        <th className="px-4 py-3">Rôle</th>
                        <th className="px-4 py-3">E-mail</th>
                        <th className="px-4 py-3 text-center">MFA</th>
                        <th className="px-4 py-3">Dernière connexion</th>
                        <th className="px-4 py-3 text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--navy-100)]">
                      {users.map((u) => (
                        <tr key={u.id} className="text-[12px] text-[var(--navy)]">
                          <td className="px-4 py-3 font-semibold">
                            {`${u.first_name} ${u.last_name}`.trim() || "—"}
                          </td>
                          <td className="px-4 py-3">{USER_ROLE_LABELS[u.role] ?? u.role}</td>
                          <td className="px-4 py-3 text-[var(--navy-300)]">{u.email}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                u.mfa_enabled
                                  ? "bg-[var(--green-bg)] text-[var(--green-text)]"
                                  : "bg-[var(--navy-100)] text-[var(--navy-300)]"
                              }`}
                            >
                              {u.mfa_enabled ? "Activé" : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[var(--navy-300)]">
                            {fmtDate(u.last_login_at)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                u.is_active
                                  ? "bg-[var(--green-bg)] text-[var(--green-text)]"
                                  : "bg-[var(--red-bg)] text-[var(--red-text)]"
                              }`}
                            >
                              {u.is_active ? "Actif" : "Inactif"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon="👥"
                  title="Aucun utilisateur rattaché"
                  hint="Les accès des ingénieurs et collaborateurs du cabinet apparaîtront ici une fois créés."
                />
              )}
            </section>
          </div>
        ) : (
          <EmptyState
            icon="⚙️"
            title="Profil du cabinet introuvable"
            hint="Les coordonnées et agréments du cabinet ne sont pas encore renseignés en base. Ils s'afficheront ici dès que la fiche cabinet sera créée."
          />
        )}
      </div>
    </>
  );
}
