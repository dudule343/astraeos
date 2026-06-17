import { Topbar } from "../_components/Topbar";
import { KpiCard, type KpiBlock } from "../_components/KpiCard";
import { PageHero, SectionHeader, GhostButton, GoldButton } from "../_components/PageHeader";
import { fetchCommsData, fmtDateTime } from "./data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Communications & annonces",
};

// Templates : contenu produit statique (modèles offerts par ASTRAEOS), pas des
// données utilisateur. Aucune table comm_templates n'existe — ce ne sont pas
// des "tells de démo" mais du contenu applicatif, donc conservés en dur.
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

const PRIORITY_CLS: Record<string, string> = {
  critical: "bg-[var(--red-bg)] text-[var(--red-text)]",
  high: "bg-[var(--orange-bg)] text-[var(--orange-text)]",
  normal: "bg-[var(--light-blue)] text-[var(--navy)]",
  low: "bg-[var(--navy-100)] text-[var(--navy-300)]",
};

export default async function CommsPage() {
  const data = await fetchCommsData();

  // Aucune table de domaine "communications sortantes" (newsletters, webinars,
  // taux d'ouverture/clic) n'existe : ces KPIs n'ont pas de source réelle →
  // état vide honnête ("—"), jamais de chiffre inventé. Les deux derniers KPIs
  // sont alimentés par la boîte de réception réelle de l'utilisateur.
  const kpis: KpiBlock[] = [
    { label: "Newsletters envoyées", value: "—", meta: "Aucune communication enregistrée" },
    { label: "Webinars organisés", value: "—", meta: "Aucun webinar enregistré" },
    {
      label: "Notifications reçues",
      value: data.notifTotal > 0 ? String(data.notifTotal) : "—",
      meta: data.notifTotal > 0 ? "dans votre boîte de réception" : "Aucune notification",
    },
    {
      label: "Non lues",
      value: data.notifUnread > 0 ? String(data.notifUnread) : "—",
      meta: data.notifUnread > 0 ? "à traiter" : "Tout est lu",
    },
  ];

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
                  data-stub="Vue mensuelle du calendrier"
                  className="rounded-md bg-[var(--navy)] px-3 py-1 text-[11px] font-semibold text-white"
                >
                  Mois
                </button>
                <button
                  type="button"
                  data-stub="Vue trimestrielle du calendrier"
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
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-[12px] text-[var(--navy-300)]"
                  >
                    Aucune communication planifiée. Le calendrier des envois
                    (newsletters, webinars, annonces) s&apos;affichera ici dès
                    qu&apos;une communication sera programmée.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-md border border-[var(--navy-100)] bg-white">
            <div className="flex items-center justify-between border-b border-[var(--navy-100)] px-4 py-3 text-[13px] font-semibold text-[var(--navy)]">
              📥 Notifications récentes
              {data.notifUnread > 0 && (
                <span className="rounded-full bg-[var(--gold-200)] px-2 py-0.5 text-[10px] font-bold text-[var(--medium-400)]">
                  {data.notifUnread} non lue{data.notifUnread > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {data.hasNotifications ? (
              <div className="divide-y divide-[var(--navy-100)]">
                {data.notifications.slice(0, 6).map((n) => (
                  <div
                    key={n.id}
                    className={`cursor-pointer px-4 py-3 hover:bg-[var(--light-blue)] ${n.read ? "" : "bg-[var(--ivory)]"}`}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[10.5px]">
                      <span
                        className={`rounded-full px-2 py-0.5 font-bold uppercase tracking-wider ${PRIORITY_CLS[n.priority] ?? PRIORITY_CLS.normal}`}
                      >
                        {n.typeLabel}
                      </span>
                      <span className="text-[var(--navy-300)]">
                        {fmtDateTime(n.createdAt)}
                      </span>
                    </div>
                    <div className="text-[12px] font-semibold text-[var(--navy)]">
                      {n.title}
                    </div>
                    {n.body && (
                      <div className="mt-0.5 line-clamp-2 text-[11px] text-[var(--navy-300)]">
                        {n.body}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-10 text-center text-[12px] text-[var(--navy-300)]">
                Aucune notification reçue pour l&apos;instant.
              </div>
            )}
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
