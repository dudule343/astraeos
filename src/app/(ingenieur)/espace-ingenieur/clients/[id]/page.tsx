import Link from "next/link";

import { type HistoItem } from "../../../_data/fiche-client";
import { getFicheClient } from "../../../_data/fiche-client-server";
import "../../../_styles/fiche-client.css";
import { DocumentRowActions } from "./DocumentRowActions";
import { FicheClientInteractive } from "./FicheClientInteractive";

export const metadata = {
  title: "ASTRAEOS · Fiche client",
};

export const dynamic = "force-dynamic";

/** Pictos de l'historique de l'accompagnement, portés de la maquette. */
function HistoIcon({ variant }: { variant: HistoItem["variant"] }) {
  switch (variant) {
    case "immo":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-4" />
        </svg>
      );
    case "financier":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "etude":
    case "audit":
    default:
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
  }
}

export default async function FicheClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fiche = await getFicheClient(id);

  return (
    <div className="fiche-client-wrap">
      {/* Bandeau « Fiche client modèle » : uniquement sur le repli (pas de
          foyer réel branché). Sur une vraie fiche éditable, on le retire. */}
      {fiche.editable ? null : (
        <div className="fc-info-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--navy-300)" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            <strong>Fiche client modèle</strong> · dans cette maquette, tous les
            clients de l&apos;agenda ouvrent cette fiche exemple. En production,
            chaque client dispose de sa propre fiche.
          </span>
        </div>
      )}

      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{fiche.eyebrow}</div>
          <h1 className="hero-title">
            {fiche.heroNameLead}
            <strong>{fiche.heroNameStrong}</strong>
          </h1>
          <p className="hero-sub">{fiche.heroSub}</p>
        </div>
        <div className="hero-actions">
          <Link
            href="/espace-ingenieur/clients"
            className="btn btn-ghost btn-sm"
            style={{ textDecoration: "none" }}
          >
            ← Retour aux clients
          </Link>
          {/*
            « Nouvelle étude » ouvre le pipeline des dossiers, là où une étude
            patrimoniale se crée et se suit (page-ing-pipeline). Action réelle
            plutôt qu'un bouton mort.
          */}
          <Link
            href="/espace-ingenieur/dossiers"
            className="btn btn-gold btn-sm"
            style={{ textDecoration: "none" }}
          >
            Nouvelle étude
          </Link>
        </div>
      </div>

      {/* Identités du couple + régime de l'union — éditables (composant client). */}
      <FicheClientInteractive
        personnes={fiche.personnes}
        regimeFields={fiche.regimeFields}
        editable={fiche.editable}
      />

      {/* Historique de l'accompagnement */}
      <div className="card mb-18">
        <div className="card-header">
          <div className="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <path d="M14 3v6h6" />
            </svg>
            Historique de l&apos;accompagnement
          </div>
        </div>
        <div className="card-body fc-histo-body">
          {fiche.historique.map((h, i) => {
            const last = i === fiche.historique.length - 1;
            return (
              <div className={`fc-histo-row${last ? " last" : ""}`} key={h.title}>
                <div className={`fc-histo-icon ${h.variant}`}>
                  <HistoIcon variant={h.variant} />
                </div>
                <div className="fc-histo-main">
                  <div className="fc-histo-title">{h.title}</div>
                  <div className="fc-histo-meta">{h.meta}</div>
                </div>
                {/* Chaque acte de l'accompagnement ouvre la fiche dossier réelle. */}
                <Link
                  href={h.href ?? "/espace-ingenieur/dossiers"}
                  className="btn btn-ghost btn-sm"
                  style={{ textDecoration: "none" }}
                >
                  Voir →
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documents & RDV */}
      <div className="fc-grid-2" style={{ marginBottom: 0 }}>
        {/* Documents signés & reçus */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <path d="M14 3v6h6" />
              </svg>
              Documents signés &amp; reçus
            </div>
          </div>
          <div className="card-body fc-doc-body">
            {fiche.documents.map((d, i) => {
              const last = i === fiche.documents.length - 1;
              return (
                <div className={`fc-doc-row${last ? " last" : ""}`} key={d.title}>
                  <div>
                    <div className="fc-doc-title">{d.title}</div>
                    <div className="fc-doc-meta">{d.meta}</div>
                  </div>
                  <DocumentRowActions doc={d} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Historique des rendez-vous */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              {/*
                La maquette référence ici <use href="#i-cockpit"/>, mais le
                symbole i-cockpit n'est PAS défini dans les <defs> : la
                référence est cassée et n'affiche aucun glyphe. On porte ce
                comportement à l'identique avec un SVG vide (aucun tracé), au
                lieu d'inventer une icône calendrier absente de la source.
              */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" />
              Historique des rendez-vous
            </div>
          </div>
          <div className="card-body fc-rdv-body">
            {/*
              Dans la maquette, AUCUN rendez-vous n'est cliquable : ce sont de
              simples <div> informatifs. On porte ce comportement à l'identique
              (le RDV à venir n'ouvre pas de salle visio dans la source).
            */}
            {fiche.rdvs.map((r, i) => {
              const last = i === fiche.rdvs.length - 1;
              const classes = [
                "fc-rdv-row",
                r.upcoming ? "upcoming" : "",
                last ? "last" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <div className={classes} key={r.title}>
                  <div className="fc-rdv-when">{r.when}</div>
                  <div className="fc-rdv-title">{r.title}</div>
                  <div className="fc-rdv-meta">{r.meta}</div>
                  {r.recordingHref ? (
                    <a className="fc-rdv-download" href={r.recordingHref}>
                      ⬇ Télécharger l&apos;enregistrement
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
