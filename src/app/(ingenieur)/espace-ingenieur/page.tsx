import Link from "next/link";

import { Topbar } from "../../(editeur)/_components/Topbar";
import { KpiCard, type KpiBlock } from "@/app/_components/shared/KpiCard";
import { PageHero, SectionHeader, GoldButton } from "@/app/_components/shared/PageHeader";
import {
  fetchCockpitDashboard,
  fmtEur,
  fmtHeure,
  fmtJour,
  type CockpitDashboard,
} from "../_data/cockpit";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ASTRAEOS · Espace Ingénieur",
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function buildKpis(d: CockpitDashboard): KpiBlock[] {
  const etudesTotal = d.etudesEnCours + d.etudesLivrees;
  return [
    {
      label: "Mon CA généré",
      value: fmtEur(d.caGenere),
      valueTone: "gold",
      meta: "cumul cabinet · souscriptions enregistrées",
    },
    {
      label: "Études réalisées et restituées",
      value: String(d.etudesLivrees),
      meta:
        etudesTotal > 0
          ? `${d.etudesEnCours} en cours · ${etudesTotal} au total`
          : "aucune étude restituée à ce jour",
    },
    {
      label: "Clients en suivi",
      value: String(d.clientsServis),
      meta: `${d.dossiersActifs} dossier${d.dossiersActifs > 1 ? "s" : ""} actif${d.dossiersActifs > 1 ? "s" : ""}`,
    },
    {
      label: "Prospects actifs",
      value: String(d.prospectsActifs),
      meta: "en entrée de pipeline",
    },
    {
      label: "Rendez-vous à venir",
      value: String(d.rdvAVenir),
      meta: d.rdvAVenir > 0 ? "agenda à jour" : "aucun rendez-vous planifié",
    },
  ];
}

const STAGE_BADGE: Record<string, string> = {
  "02_compliance": "bg-[var(--navy-100)] text-[var(--navy)]",
  "03_collecte": "bg-[var(--gold-100)] text-[var(--gold-deep)]",
  "04_etudes": "bg-[var(--gold-100)] text-[var(--gold-deep)]",
  "05_restituee": "bg-[var(--green-bg)] text-[var(--green-text)]",
};

export default async function IngenieurCockpit() {
  const d = await fetchCockpitDashboard();
  const kpis = buildKpis(d);

  // Santé du portefeuille : barres dérivées de l'état réel des dossiers.
  const dciValues = d.priorites.map((p) => p.pct).filter((v): v is number => v != null);
  const dciMoyen =
    dciValues.length > 0
      ? Math.round(dciValues.reduce((a, b) => a + b, 0) / dciValues.length)
      : 0;
  const etudesTotal = d.etudesEnCours + d.etudesLivrees;
  const tauxLivraison = etudesTotal > 0 ? Math.round((d.etudesLivrees / etudesTotal) * 100) : 0;
  const totalDossiers = d.pipeline.reduce((a, s) => a + s.count, 0);
  const suivi = d.pipeline.find((s) => s.stage === "06_suivi")?.count ?? 0;
  const tauxSuivi = totalDossiers > 0 ? Math.round((suivi / totalDossiers) * 100) : 0;

  const sante: { label: string; value: string; pct: number; tone: "green" | "gold"; meta: string }[] = [
    {
      label: "Clients en suivi",
      value: `${suivi} / ${totalDossiers}`,
      pct: tauxSuivi,
      tone: "green",
      meta: "part des dossiers passés en suivi annuel",
    },
    {
      label: "Avancement des collectes",
      value: `${dciMoyen} %`,
      pct: dciMoyen,
      tone: "gold",
      meta: `complétude DCI moyenne sur ${dciValues.length || 0} dossier${dciValues.length > 1 ? "s" : ""} en cours`,
    },
    {
      label: "Taux de livraison des études",
      value: `${tauxLivraison} %`,
      pct: tauxLivraison,
      tone: "green",
      meta: `${d.etudesLivrees} livrée${d.etudesLivrees > 1 ? "s" : ""} · ${d.etudesEnCours} en cours`,
    },
  ];

  return (
    <>
      <Topbar current="Espace Ingénieur" />
      <div className="px-10 py-8">
        <PageHero
          eyebrow="Tableau de bord personnel"
          title="Bonjour"
          description={`Vue d'ensemble de votre activité · ${d.etudesEnCours} étude${d.etudesEnCours > 1 ? "s" : ""} en cours, ${d.prospectsActifs} prospect${d.prospectsActifs > 1 ? "s" : ""} actif${d.prospectsActifs > 1 ? "s" : ""}, ${d.clientsServis} client${d.clientsServis > 1 ? "s" : ""} en suivi.`}
          actions={
            <GoldButton
              dataStub="Créer un espace client"
              dataStubBody="Le wizard de création d'espace client est accessible depuis « Nouveau client »."
            >
              + Créer un espace client
            </GoldButton>
          }
        />

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-[18px] lg:grid-cols-[1.4fr_1fr]">
          {/* Études prioritaires */}
          <div className="rounded-md border border-[var(--navy-100)] bg-white p-5">
            <SectionHeader
              eyebrow="Production"
              title="Mes études prioritaires"
              right={
                <span className="text-[11px] font-semibold text-[var(--navy-300)]">
                  {d.priorites.length} en cours
                </span>
              }
            />
            {d.priorites.length === 0 ? (
              <EmptyState message="Aucune étude en production pour le moment." />
            ) : (
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-[var(--navy-100)] text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--navy-300)]">
                    <th className="py-2 pr-2 font-bold">Client</th>
                    <th className="py-2 pr-2 font-bold">Étape</th>
                    <th className="py-2 pr-2 text-right font-bold">Collecte</th>
                  </tr>
                </thead>
                <tbody>
                  {d.priorites.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--navy-100)] last:border-0">
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-[10px] font-bold text-white">
                            {initialsOf(p.clientName)}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--navy)]">{p.clientName}</div>
                            <div className="text-[10.5px] text-[var(--navy-300)]">{p.ref}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 pr-2">
                        <span
                          className={`inline-block rounded-sm px-2 py-0.5 text-[10.5px] font-semibold ${STAGE_BADGE[p.stage] ?? "bg-[var(--navy-100)] text-[var(--navy)]"}`}
                        >
                          Étape {String(p.stageNum).padStart(2, "0")} · {p.stageLabel}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 text-right font-semibold text-[var(--navy)]">
                        {p.pct != null ? `${p.pct} %` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pipeline (remplace "Mes alertes" : alertes non modélisées en base) */}
          <div className="rounded-md border border-[var(--navy-100)] bg-white p-5">
            <SectionHeader
              eyebrow="Pipeline"
              title="Répartition de mes dossiers"
              right={
                <span className="text-[11px] font-semibold text-[var(--navy-300)]">
                  {totalDossiers} dossiers
                </span>
              }
            />
            {totalDossiers === 0 ? (
              <EmptyState message="Aucun dossier dans le pipeline." />
            ) : (
              <ul className="space-y-2.5">
                {d.pipeline
                  .filter((s) => s.count > 0)
                  .map((s) => (
                    <li key={s.stage} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-[var(--gold)]" />
                        <span className="text-[12.5px] font-medium text-[var(--navy)]">
                          {s.label}
                        </span>
                      </div>
                      <span className="text-[12.5px] font-bold text-[var(--navy)]">{s.count}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2">
          {/* RDV à venir */}
          <div className="rounded-md border border-[var(--navy-100)] bg-white p-5">
            <SectionHeader
              eyebrow="Agenda"
              title="Mes prochains rendez-vous"
              right={
                <span className="text-[11px] font-semibold text-[var(--navy-300)]">
                  {d.rdvAVenir} à venir
                </span>
              }
            />
            {d.agenda.length === 0 ? (
              <EmptyState message="Aucun rendez-vous planifié." />
            ) : (
              <ul className="space-y-1">
                {d.agenda.map((rdv) => (
                  <li key={rdv.id} className="flex items-stretch gap-3 py-2">
                    <div className="flex w-16 flex-shrink-0 flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--gold)]">
                        {fmtJour(rdv.scheduledAt)}
                      </span>
                      <span className="text-[13px] font-bold text-[var(--navy)]">
                        {fmtHeure(rdv.scheduledAt)}
                      </span>
                    </div>
                    <div className="w-[3px] flex-shrink-0 rounded-full bg-[var(--gold)]" />
                    <div>
                      <div className="text-[12.5px] font-semibold text-[var(--navy)]">
                        {rdv.clientName}
                      </div>
                      <div className="text-[11px] capitalize text-[var(--navy-300)]">
                        {rdv.label}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 border-t border-[var(--navy-100)] pt-3">
              <Link
                href="/espace-ingenieur/agenda"
                className="text-[11.5px] font-semibold text-[var(--gold-deep)] hover:underline"
              >
                Voir tout l&apos;agenda →
              </Link>
            </div>
          </div>

          {/* Santé du portefeuille */}
          <div className="rounded-md border border-[var(--navy-100)] bg-white p-5">
            <SectionHeader eyebrow="Pilotage" title="Santé de mon portefeuille" />
            <div className="space-y-4">
              {sante.map((b) => (
                <div key={b.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${b.tone === "green" ? "bg-[var(--green-text)]" : "bg-[var(--gold)]"}`}
                      />
                      <span className="text-[12.5px] font-semibold text-[var(--navy)]">
                        {b.label}
                      </span>
                    </div>
                    <span
                      className={`text-[12.5px] font-bold ${b.tone === "green" ? "text-[var(--green-text)]" : "text-[var(--gold-deep)]"}`}
                    >
                      {b.value}
                    </span>
                  </div>
                  <div className="h-[5px] w-full overflow-hidden rounded-full bg-[var(--ivory-deep)]">
                    <div
                      className={`h-full rounded-full ${b.tone === "green" ? "bg-[var(--green-text)]" : "bg-[var(--gold)]"}`}
                      style={{ width: `${Math.min(100, Math.max(0, b.pct))}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">{b.meta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-[var(--navy-100)] px-4 py-8 text-center text-[12px] text-[var(--navy-300)]">
      {message}
    </div>
  );
}
