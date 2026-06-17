import Link from "next/link";
import { notFound } from "next/navigation";

import { Topbar } from "../../_components/Topbar";
import { PageHero } from "../../_components/PageHeader";
import { getEntretien } from "@/lib/entretiens-store";

export const dynamic = "force-dynamic";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function str(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return "";
  }
}

export default async function EntretienDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = await getEntretien(id);
  if (!e) notFound();

  const titre = e.display_name || e.prospect_slug || "Entretien sans dossier";
  const transcript = Array.isArray(e.transcript) ? e.transcript : [];
  const conseils = Array.isArray(e.conseils) ? e.conseils : [];
  const articles = Array.isArray(e.articles) ? e.articles : [];

  return (
    <>
      <Topbar current="Entretiens visio" />

      <div className="px-10 py-8">
        <Link
          href="/entretiens"
          className="mb-4 inline-block text-[12px] font-semibold text-[var(--navy-300)] hover:text-[var(--navy)]"
        >
          ← Tous les entretiens
        </Link>

        <PageHero
          eyebrow="Entretien visio"
          title={titre}
          description={`Salle ${e.room} · démarré le ${fmt(e.started_at)} · ${
            e.ended_at ? `terminé le ${fmt(e.ended_at)}` : "non clôturé"
          }`}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Rapport */}
          <section className="rounded-md border border-[var(--navy-100)] bg-white p-5">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[var(--navy-300)]">
              Rapport de synthèse
            </h2>
            {e.rapport ? (
              <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded bg-[var(--ivory)] p-3 text-[11.5px] leading-relaxed text-[var(--navy)]">
                {JSON.stringify(e.rapport, null, 2)}
              </pre>
            ) : (
              <p className="text-[12px] italic text-[var(--navy-300)]">Aucun rapport généré.</p>
            )}
          </section>

          {/* Conseils IA */}
          <section className="rounded-md border border-[var(--navy-100)] bg-white p-5">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[var(--navy-300)]">
              Conseils IA · {conseils.length}
            </h2>
            {conseils.length > 0 ? (
              <ul className="space-y-3">
                {conseils.map((c, i) => (
                  <li key={i} className="rounded border border-[var(--gold-300,#e7d9b0)] bg-[var(--gold-100,#faf5e6)] p-3">
                    <div className="mb-1 text-[11px] font-bold text-[var(--navy)]">
                      {str(c.titre) || str(c.type) || "Conseil"}
                    </div>
                    {str(c.citation) && (
                      <div className="mb-1 text-[11px] italic text-[var(--navy-300)]">« {str(c.citation)} »</div>
                    )}
                    <div className="text-[12px] text-[var(--navy)]">{str(c.detail)}</div>
                    {str(c.repere_legal) && (
                      <div className="mt-1 text-[10.5px] text-[var(--navy-300)]">⚖ {str(c.repere_legal)}</div>
                    )}
                    {str(c.objectif) && (
                      <div className="mt-1 text-[10.5px] font-semibold text-[var(--gold-deep,#9a6c0a)]">
                        → {str(c.objectif)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] italic text-[var(--navy-300)]">Aucun conseil généré.</p>
            )}
          </section>

          {/* Transcription */}
          <section className="rounded-md border border-[var(--navy-100)] bg-white p-5 lg:col-span-2">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[var(--navy-300)]">
              Transcription · {transcript.length} lignes
            </h2>
            {transcript.length > 0 ? (
              <div className="max-h-[420px] space-y-1.5 overflow-auto text-[12px] leading-relaxed">
                {transcript.map((line, i) => {
                  const l = line as Record<string, unknown>;
                  const speaker = str(l.speaker) === "prospect" ? "Prospect" : "Vous";
                  return (
                    <div key={i}>
                      <span
                        className={`mr-2 font-bold ${
                          str(l.speaker) === "prospect"
                            ? "text-[var(--gold-deep,#9a6c0a)]"
                            : "text-[#1F5A36]"
                        }`}
                      >
                        {speaker}
                      </span>
                      <span className="text-[var(--navy)]">{str(l.text)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[12px] italic text-[var(--navy-300)]">Aucune transcription enregistrée.</p>
            )}
          </section>

          {/* Articles de loi */}
          {articles.length > 0 && (
            <section className="rounded-md border border-[var(--navy-100)] bg-white p-5 lg:col-span-2">
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[var(--navy-300)]">
                Repères juridiques · {articles.length}
              </h2>
              <ul className="space-y-2">
                {articles.map((a, i) => (
                  <li key={i} className="rounded border border-[var(--navy-100)] p-3 text-[12px]">
                    <span className="font-bold text-[var(--navy)]">{str(a.reference) || str(a.intitule)}</span>
                    {str(a.extrait) && <span className="text-[var(--navy-300)]"> — {str(a.extrait)}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* DCI snapshot */}
          <section className="rounded-md border border-[var(--navy-100)] bg-white p-5 lg:col-span-2">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[var(--navy-300)]">
              DCI capturé en fin d&apos;entretien
            </h2>
            {e.dci_snapshot ? (
              <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded bg-[var(--ivory)] p-3 text-[11px] leading-relaxed text-[var(--navy)]">
                {JSON.stringify(e.dci_snapshot, null, 2)}
              </pre>
            ) : (
              <p className="text-[12px] italic text-[var(--navy-300)]">Aucun DCI capturé.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
