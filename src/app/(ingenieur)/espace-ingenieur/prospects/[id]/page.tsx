import Link from "next/link";

import { createAdminClient, DEFAULT_TENANT_ID } from "@/lib/supabase/admin";
import {
  loadProspectDocuments,
  type ProspectUploadedDoc,
} from "@/app/(ingenieur)/_data/prospect-documents";
import { decodeRiskProfile, type RiskProfile } from "../../../_data/risk-profile";
import {
  getFicheProspect,
  type Condition,
  type Inline,
  type ProspectDoc,
} from "../../../_data/fiche-prospect";
import "../../../_styles/fiche-prospect.css";
import "../../agenda/_styles/agenda.css";
import { NewRdvModal } from "../../agenda/NewRdvModal";
import {
  ConditionRelancerButton,
  DocActionButton,
  EnvoyerDocumentButton,
  FicheProspectProvider,
  NotesCard,
  PlanifierRdvButton,
  RelancerButton,
  SupprimerButton,
} from "./FicheProspectInteractive";
import RiskProfileCard from "./RiskProfileCard";

export const metadata = {
  title: "ASTRAEOS · Fiche prospect",
};

export const dynamic = "force-dynamic";

const STEPS = [
  { num: 1, label: ["Prospects", "actifs"] },
  { num: 2, label: ["Conformité", "en cours"] },
  { num: 3, label: ["Collecte de", "documents"] },
  { num: 4, label: ["Étude en", "cours"] },
  { num: 5, label: ["Études", "restituées"] },
  { num: 6, label: ["Clients", "en suivi"] },
];

/* Pictos portés tels quels depuis la maquette. La maquette utilise <use href="#i-…">
   pour certains en-têtes ; ces symboles ne sont pas définis dans le repo, on inline
   donc les tracés équivalents (team / doc / calendar / edit). */
function IconTeam() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M4 20c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <path d="M14 16.5c0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

/* Icônes des lignes documents (portées une à une depuis la maquette). */
function DocRowIcon({ icon }: { icon: ProspectDoc["icon"] }) {
  switch (icon) {
    case "book":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="4" y="2" width="13" height="20" rx="1.5" />
          <path d="M17 5h3v17a1 1 0 0 1-1 1H7" />
          <line x1="7.5" y1="7" x2="13.5" y2="7" />
          <line x1="7.5" y1="10.5" x2="13.5" y2="10.5" />
          <line x1="7.5" y1="14" x2="11" y2="14" />
        </svg>
      );
    case "checklist":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case "file":
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
        </svg>
      );
  }
}

/* Icônes des boutons d'action document. */
function DocActionIcon({ kind }: { kind: ProspectDoc["actions"][number]["kind"] }) {
  if (kind === "consulter") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  if (kind === "modifier") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
      </svg>
    );
  }
  // renvoyer / envoyer / relancer : avion en papier
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ConditionCheck({ state }: { state: Condition["state"] }) {
  const glyph = state === "ok" ? "✓" : state === "wait" ? "⏳" : "○";
  return <div className={`s1b-condition-check ${state}`}>{glyph}</div>;
}

/** Rend un texte inline avec exposants ordinaux (« Lyon 6<sup>e</sup> »). */
function renderInline(parts: Inline[]) {
  return parts.map((p, i) =>
    typeof p === "string" ? <span key={i}>{p}</span> : <sup key={i}>{p.sup}</sup>,
  );
}

/**
 * Données réelles d'un prospect issu du parcours en ligne, si l'`id` (slug)
 * correspond à de vraies lignes `dci_submissions` (tenant legacy). Best-effort :
 * sans base/contexte ou en cas d'erreur, renvoie null et la fiche reste en
 * mode démo. On lit le profil de risque depuis la soumission kind='qualification'
 * et les documents déposés depuis le bucket Storage.
 */
async function loadRealProspect(slug: string): Promise<{
  riskProfile: RiskProfile | null;
  documents: ProspectUploadedDoc[];
} | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dci_submissions")
      .select("kind, payload")
      .eq("tenant_id", DEFAULT_TENANT_ID)
      .eq("prospect_slug", slug);
    if (error || !data || data.length === 0) return null;

    const qualification = (data as Array<{ kind: string; payload: Record<string, unknown> | null }>).find(
      (r) => r.kind === "qualification",
    );
    const riskProfile = qualification ? decodeRiskProfile(qualification.payload) : null;
    const documents = await loadProspectDocuments(slug);
    return { riskProfile, documents };
  } catch {
    return null;
  }
}

function ProspectDocumentsCard({ documents }: { documents: ProspectUploadedDoc[] }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <IconDoc />
          Documents déposés
        </div>
        <span className="badge fp-doc-badge-pill">{documents.length} fichier(s)</span>
      </div>
      <div className="card-body fp-card-body">
        {documents.length === 0 ? (
          <div style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
            Aucun document déposé.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {documents.map((doc) => (
              <a
                key={doc.url}
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="s1b-doc-row"
                style={{ textDecoration: "none", cursor: "pointer" }}
              >
                <div className="s1b-doc-icon">
                  <DocRowIcon icon="file" />
                </div>
                <div>
                  <div className="s1b-doc-title">{doc.name}</div>
                  <div className="s1b-doc-meta">
                    {[doc.sizeLabel, doc.uploadedAt].filter(Boolean).join(" · ") || "Document déposé"}
                  </div>
                </div>
                <span className="s1b-doc-status ok">Consulter</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function FicheProspectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fiche = getFicheProspect(id);
  const real = await loadRealProspect(id);

  return (
    <FicheProspectProvider slug={fiche.slug}>
    <div className="fiche-prospect-wrap">
      {real ? (
        <div className="fp-grid-2" style={{ marginBottom: "18px" }}>
          {real.riskProfile ? (
            <RiskProfileCard profile={real.riskProfile} />
          ) : (
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <IconDoc />
                  Profil de risque
                </div>
              </div>
              <div className="card-body fp-card-body">
                <div style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
                  Questionnaire de qualification non encore complété.
                </div>
              </div>
            </div>
          )}
          <ProspectDocumentsCard documents={real.documents} />
        </div>
      ) : null}
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{fiche.eyebrow}</div>
          <h1 className="hero-title">
            {fiche.heroLead}
            <strong>{fiche.heroStrong}</strong>
          </h1>
          <p className="hero-sub">{renderInline(fiche.heroSub)}</p>
        </div>
        <div className="hero-actions">
          <Link
            href="/espace-ingenieur/prospects"
            className="btn btn-ghost btn-sm"
            style={{ textDecoration: "none" }}
          >
            ← Retour à mes prospects
          </Link>
          <RelancerButton className="btn btn-ghost btn-sm">
            Relancer le client
          </RelancerButton>
        </div>
      </div>

      {/* Stepper parcours patrimonial */}
      <div className="s1b-parcours-stepper">
        {STEPS.map((s) => (
          <div key={s.num} className={`s1b-step${s.num === 1 ? " active" : ""}`}>
            <div className="s1b-step-num">{s.num}</div>
            <div className="s1b-step-label">
              {s.label[0]}
              <br />
              {s.label[1]}
            </div>
          </div>
        ))}
        <div className="s1b-stepper-pill">Étape 01/06</div>
      </div>

      {/* Conditions de passage à l'étape 02 */}
      <div className="s1b-conditions-card">
        <div className="s1b-conditions-title">{fiche.conditions.title}</div>
        <div className="s1b-conditions-sub">{fiche.conditions.sub}</div>

        {fiche.conditions.rows.map((c) => (
          <div className="s1b-condition-row" key={c.text}>
            <ConditionCheck state={c.state} />
            <div>
              <div className="s1b-condition-text">{c.text}</div>
              <div className="s1b-condition-meta">{renderInline(c.meta)}</div>
            </div>
            {c.badge ? (
              <span className={`s1b-condition-badge ${c.badge.tone}`}>{c.badge.label}</span>
            ) : c.action ? (
              <ConditionRelancerButton label={c.action.label} />
            ) : null}
          </div>
        ))}
      </div>

      <div className="fp-grid-2">
        {/* Identités déclarées */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <IconTeam />
              Identités déclarées
            </div>
            <span className="badge fp-doc-badge-pill">{fiche.identites.badge}</span>
          </div>
          <div className="card-body fp-card-body">
            {fiche.identites.blocks.map((b) => (
              <div className="fp-identite-block" key={b.eyebrow}>
                <div className="fp-identite-eyebrow">{b.eyebrow}</div>
                <div className="fp-identite-grid">
                  {b.rows.map((r) => (
                    <FragmentRow key={r.label}>
                      <span>{r.label}</span>
                      <strong>{r.value}</strong>
                    </FragmentRow>
                  ))}
                </div>
              </div>
            ))}
            <div className="fp-info-box">
              <strong>Information :</strong> {fiche.identites.info}
            </div>
          </div>
        </div>

        {/* Documents · état d'avancement */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <IconDoc />
              Documents · état d&apos;avancement
            </div>
            <EnvoyerDocumentButton />
          </div>
          <div className="card-body fp-card-body">
            {fiche.documents.map((d) => (
              <div className="s1b-doc-row" key={d.title}>
                <div className={`s1b-doc-icon${d.iconStyle && d.iconStyle !== "default" ? ` ${d.iconStyle}` : ""}`}>
                  <DocRowIcon icon={d.icon} />
                </div>
                <div>
                  <div className="s1b-doc-title">{d.title}</div>
                  <div className="s1b-doc-meta">{d.meta}</div>
                </div>
                <span className={`s1b-doc-status ${d.status.kind}`}>{d.status.label}</span>
                <div className="s1b-doc-actions">
                  {d.actions.map((a) => (
                    <DocActionButton
                      key={a.kind}
                      kind={a.kind}
                      label={a.label}
                      variant={a.variant}
                      docTitle={d.title}
                      icon={<DocActionIcon kind={a.kind} />}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rendez-vous + Notes ingénieur */}
      <div className="fp-grid-2 mt-18">
        {/* Rendez-vous */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <IconCalendar />
              Rendez-vous
            </div>
            <PlanifierRdvButton />
          </div>
          <div className="card-body fp-card-body">
            {fiche.rdvs.map((r) => (
              <div className="s1b-rdv-row" key={r.title}>
                <div className="s1b-rdv-date">
                  <div className="day">{r.day}</div>
                  <div className="month">{r.month}</div>
                </div>
                <div>
                  <div className="s1b-rdv-title">{r.title}</div>
                  <div className="s1b-rdv-meta">{renderInline(r.meta)}</div>
                </div>
                <span className={`s1b-doc-status ${r.status.tone}`}>{r.status.label}</span>
              </div>
            ))}
            <div className="s1b-rdv-rappel">
              <strong>Rappel automatique programmé</strong> · {fiche.rappel}
            </div>
          </div>
        </div>

        {/* Notes & contexte ingénieur */}
        <NotesCard meta={fiche.note.meta} segments={fiche.note.segments} icon={<IconEdit />} />
      </div>

      {/* Bandeau d'action · faire avancer en étape 02 */}
      <div className="s1b-action-bar">
        <div className="s1b-action-info">
          <strong>{fiche.actionBar.info}</strong> pour passer en étape 02 · Conformité en cours.
          <br />
          <span style={{ color: "var(--navy-300)" }}>{fiche.actionBar.infoSub}</span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <SupprimerButton />
          <RelancerButton className="s1b-btn-secondary">
            Relancer le client
          </RelancerButton>
          <button type="button" className="s1b-btn-promote" disabled title="Conditions non remplies">
            Faire avancer en étape 02
          </button>
        </div>
      </div>

      {/* Modale « Nouveau RDV » (créneau pré-rempli) — ouverte par + Planifier un RDV */}
      <NewRdvModal />
    </div>
    </FicheProspectProvider>
  );
}

/** Wrapper neutre : ses enfants restent des cellules directes de la grille. */
function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
