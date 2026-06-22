"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  Apporteur,
  FiltrePerf,
  PartenaireReco,
  PartenairesScreen,
  ProfilVariant,
} from "../../_data/partenaires";
import { createPartenaire, type PartenaireType } from "./actions";

/* Écran « Partenaires & apporteurs d'affaires » — partie interactive.
 * Porté de page-ing-partenaires (maquette ingénieur v28). Le rendu statique
 * reste identique à la maquette ; toutes les commandes sont branchées avec un
 * vrai état React (pas de bouton mort) :
 *   - filtres rapides .qf-perf : filtrent réellement les lignes par profil ;
 *   - champ de recherche : filtre live sur nom / structure / profil / contenu ;
 *   - « Exporter » : génère et télécharge un CSV des lignes visibles ;
 *   - « Nouveau partenaire » + « Voir » : ouvrent une vraie modale. */

// L'icône « Nouveau partenaire » = symbole #i-new de la maquette
// (plus dans un cercle), à l'identique.
function NewIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

// Icône loupe = symbole #i-search de la maquette, à l'identique.
function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.5-4.5" />
    </svg>
  );
}

function ProfilBadge({ label, variant }: { label: string; variant: ProfilVariant }) {
  return <span className={`badge pp-${variant}`}>{label}</span>;
}

function Toolbar({
  count,
  filtres,
  activeFiltre,
  onFiltre,
  query,
  onQuery,
}: {
  count: string;
  filtres: FiltrePerf[];
  activeFiltre: number;
  onFiltre: (index: number) => void;
  query: string;
  onQuery: (value: string) => void;
}) {
  return (
    <div className="table-toolbar">
      <div className="table-toolbar-left">
        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>{count}</span>
        {filtres.map((f, i) => (
          <button
            key={f.label}
            type="button"
            className={`qf-perf${i === activeFiltre ? " active" : ""}`}
            onClick={() => onFiltre(i)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="table-toolbar-right">
        <div className="search-wrap">
          <SearchIcon />
          <input
            className="search-input"
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            aria-label="Rechercher"
          />
        </div>
      </div>
    </div>
  );
}

function downloadCsv(filename: string, rows: string[][]) {
  const escape = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(escape).join(";")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type DetailRow = { label: string; value: string };

function Modal({
  open,
  onClose,
  eyebrow,
  title,
  titleStrong,
  sub,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  titleStrong: string;
  sub: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="pp-modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="pp-modal" role="dialog" aria-modal="true">
        <div className="pp-modal-header">
          <button className="pp-modal-close" onClick={onClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M18 6 L 6 18 M 6 6 L 18 18" />
            </svg>
          </button>
          <div className="pp-modal-eyebrow">{eyebrow}</div>
          <h2 className="pp-modal-title">
            {title} <strong>{titleStrong}</strong>
          </h2>
          <p className="pp-modal-sub">{sub}</p>
        </div>
        <div className="pp-modal-body">{children}</div>
        {footer ? <div className="pp-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

function DetailGrid({ rows }: { rows: DetailRow[] }) {
  return (
    <div className="pp-detail-grid">
      {rows.map((r) => (
        <div className="pp-detail-row" key={r.label}>
          <div className="pp-detail-label">{r.label}</div>
          <div className="pp-detail-value">{r.value}</div>
        </div>
      ))}
    </div>
  );
}

function RecoTable({
  section,
  onVoir,
  onExport,
}: {
  section: PartenairesScreen["reco"];
  onVoir: (p: PartenaireReco) => void;
  onExport: (rows: PartenaireReco[]) => void;
}) {
  const [activeFiltre, setActiveFiltre] = useState(0);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const variants = section.filtres[activeFiltre]?.variants ?? null;
    const q = query.trim().toLowerCase();
    return section.partenaires.filter((p) => {
      if (variants && !variants.includes(p.professionVariant)) return false;
      if (!q) return true;
      return [p.nom, p.structure, p.profession, p.localisation, p.specialite]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [section, activeFiltre, query]);

  return (
    <div className="table-wrap">
      <Toolbar
        count={section.toolbarCount}
        filtres={section.filtres}
        activeFiltre={activeFiltre}
        onFiltre={setActiveFiltre}
        query={query}
        onQuery={setQuery}
      />
      <table className="dt">
        <thead>
          <tr>
            <th>Partenaire</th>
            <th>Profession</th>
            <th>Localisation</th>
            <th>Spécialité</th>
            <th className="num">Dossiers traités 2026</th>
            <th className="center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.nom}>
              <td>
                <div className="cell-primary">{p.nom}</div>
                <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>{p.structure}</div>
              </td>
              <td>
                <ProfilBadge label={p.profession} variant={p.professionVariant} />
              </td>
              <td>{p.localisation}</td>
              <td>{p.specialite}</td>
              <td className={`num cell-money${p.dossiersGold ? " gold" : ""}`}>
                {p.dossiersTraites2026}
              </td>
              <td className="center">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => onVoir(p)}>
                  Voir
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                style={{
                  textAlign: "center",
                  fontSize: "11.5px",
                  color: "var(--navy-300)",
                  padding: "14px",
                }}
              >
                Aucun partenaire ne correspond à votre recherche.
              </td>
            </tr>
          ) : (
            <tr style={{ background: "var(--ivory)" }}>
              <td
                colSpan={6}
                style={{
                  textAlign: "center",
                  fontSize: "11.5px",
                  color: "var(--navy-300)",
                  padding: "14px",
                }}
              >
                {section.resteLabel}
                <a
                  style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}
                  onClick={() => onExport(filtered)}
                >
                  {section.resteLien}
                </a>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ApporteursTable({
  section,
  onVoir,
  onExport,
}: {
  section: PartenairesScreen["apporteurs"];
  onVoir: (a: Apporteur) => void;
  onExport: (rows: Apporteur[]) => void;
}) {
  const [activeFiltre, setActiveFiltre] = useState(0);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const variants = section.filtres[activeFiltre]?.variants ?? null;
    const q = query.trim().toLowerCase();
    return section.liste.filter((a) => {
      if (variants && !variants.includes(a.profilVariant)) return false;
      if (!q) return true;
      const dossiers = a.dossiers.map((d) => `${d.label} ${d.annotation ?? ""}`).join(" ");
      return [a.nom, a.sousTitre, a.profil, a.statutLabel, dossiers]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [section, activeFiltre, query]);

  return (
    <div className="table-wrap">
      <Toolbar
        count={section.toolbarCount}
        filtres={section.filtres}
        activeFiltre={activeFiltre}
        onFiltre={setActiveFiltre}
        query={query}
        onQuery={setQuery}
      />
      <table className="dt">
        <thead>
          <tr>
            <th>Apporteur</th>
            <th>Profil</th>
            <th>Dossier concerné</th>
            <th className="num">Affaires totales apportées</th>
            <th className="num">CA généré cumul</th>
            <th>Statut</th>
            <th className="center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a) => {
            const span = a.dossiers.length;
            const goldClass = a.affairesGold ? " gold" : "";
            return a.dossiers.map((d, i) => (
              <tr key={`${a.nom}-${a.caGenereCumul}-${i}`}>
                {i === 0 && (
                  <td rowSpan={span}>
                    <div className="cell-primary">{a.nom}</div>
                    <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>{a.sousTitre}</div>
                  </td>
                )}
                {i === 0 && (
                  <td rowSpan={span}>
                    <ProfilBadge label={a.profil} variant={a.profilVariant} />
                  </td>
                )}
                <td>
                  {d.label}
                  {d.annotation ? (
                    <span style={{ color: "var(--navy-300)", fontSize: "10px" }}> {d.annotation}</span>
                  ) : null}
                </td>
                {i === 0 && (
                  <td
                    className={`num cell-money${goldClass}`}
                    rowSpan={span}
                    style={{ verticalAlign: "middle", fontSize: "18px" }}
                  >
                    <strong>{a.affairesTotales}</strong>
                    <div
                      style={{
                        fontSize: "9.5px",
                        color: "var(--navy-300)",
                        fontWeight: 400,
                        marginTop: "2px",
                      }}
                    >
                      {a.affairesDepuis}
                    </div>
                  </td>
                )}
                {i === 0 && (
                  <td
                    className={`num cell-money${goldClass}`}
                    rowSpan={span}
                    style={{ verticalAlign: "middle" }}
                  >
                    {a.caGenereCumul}
                  </td>
                )}
                {i === 0 && (
                  <td rowSpan={span} style={{ verticalAlign: "middle" }}>
                    <span className={`badge badge-${a.statutVariant}`}>{a.statutLabel}</span>
                  </td>
                )}
                {i === 0 && (
                  <td className="center" rowSpan={span} style={{ verticalAlign: "middle" }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onVoir(a)}>
                      Voir
                    </button>
                  </td>
                )}
              </tr>
            ));
          })}
          {filtered.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{
                  textAlign: "center",
                  fontSize: "11.5px",
                  color: "var(--navy-300)",
                  padding: "14px",
                }}
              >
                Aucun apporteur ne correspond à votre recherche.
              </td>
            </tr>
          ) : (
            <tr style={{ background: "var(--ivory)" }}>
              <td
                colSpan={7}
                style={{
                  textAlign: "center",
                  fontSize: "11.5px",
                  color: "var(--navy-300)",
                  padding: "14px",
                }}
              >
                {section.resteLabel}
                <a
                  style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}
                  onClick={() => onExport(filtered)}
                >
                  {section.resteLien}
                </a>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div
        style={{
          marginTop: "14px",
          padding: "12px 14px",
          background: "var(--ivory)",
          borderLeft: "3px solid var(--gold)",
          borderRadius: "5px",
          fontSize: "11px",
          color: "var(--navy-300)",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "var(--navy)" }}>Lecture :</strong> chaque apporteur peut amener
        plusieurs dossiers (exemple Linda TRABELSI · Cabinet d&apos;avocat avec 8 dossiers cumulés
        depuis 2024). La colonne{" "}
        <strong style={{ color: "var(--gold-deep)" }}>Affaires totales apportées</strong> donne la
        vue cumulée pour identifier les apporteurs récurrents et fidéliser la relation.
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  type: "reco" as PartenaireType,
  nomStructure: "",
  profil: "notaire",
  localisation: "",
  specialite: "",
};

export default function PartenairesInteractive({ screen }: { screen: PartenairesScreen }) {
  const [creating, setCreating] = useState(false);
  const [recoDetail, setRecoDetail] = useState<PartenaireReco | null>(null);
  const [apporteurDetail, setApporteurDetail] = useState<Apporteur | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const canSave = form.nomStructure.trim().length > 0;

  const closeCreate = () => {
    setCreating(false);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!canSave || submitting) return;
    setSubmitting(true);
    try {
      const res = await createPartenaire({
        type: form.type,
        nomStructure: form.nomStructure,
        profil: form.profil,
        localisation: form.localisation,
        specialite: form.specialite,
      });
      setToast(res.message);
      setCreating(false);
      setForm(EMPTY_FORM);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const exportReco = (rows: PartenaireReco[]) =>
    downloadCsv("partenaires-recommandables.csv", [
      ["Partenaire", "Structure", "Profession", "Localisation", "Spécialité", "Dossiers 2026"],
      ...rows.map((p) => [
        p.nom,
        p.structure,
        p.profession,
        p.localisation,
        p.specialite,
        p.dossiersTraites2026,
      ]),
    ]);

  const exportApporteurs = (rows: Apporteur[]) =>
    downloadCsv("apporteurs-affaires.csv", [
      ["Apporteur", "Sous-titre", "Profil", "Affaires totales", "CA généré cumul", "Statut"],
      ...rows.map((a) => [
        a.nom,
        a.sousTitre,
        a.profil,
        a.affairesTotales,
        a.caGenereCumul,
        a.statutLabel,
      ]),
    ]);

  const exportAll = () => {
    exportReco(screen.reco.partenaires);
    exportApporteurs(screen.apporteurs.liste);
  };

  return (
    <>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{screen.heroEyebrow}</div>
          <h1 className="hero-title">
            Partenaires &amp; <strong>apporteurs d&apos;affaires</strong>
          </h1>
          <p className="hero-sub">
            {screen.heroSub.map((seg, i) =>
              seg.strong ? <strong key={i}>{seg.text}</strong> : <span key={i}>{seg.text}</span>,
            )}
          </p>
        </div>
        <div className="hero-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={exportAll}>
            Exporter
          </button>
          <button type="button" className="btn btn-gold btn-sm" onClick={() => setCreating(true)}>
            <NewIcon />
            Nouveau partenaire
          </button>
        </div>
      </div>

      <div className="kpis kpis-4 mb-20">
        {screen.kpis.map((kpi) => (
          <div className="kpi" key={kpi.label}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-meta">{kpi.meta}</div>
          </div>
        ))}
      </div>

      <div className="section-block">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">{screen.reco.sectionEyebrow}</div>
            <div className="section-title">
              <strong>{screen.reco.sectionTitle}</strong>
            </div>
          </div>
          <span style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
            {screen.reco.sectionRight}
          </span>
        </div>
        <RecoTable section={screen.reco} onVoir={setRecoDetail} onExport={exportReco} />
      </div>

      <div className="section-block">
        <div className="section-header">
          <div>
            <div className="section-eyebrow">{screen.apporteurs.sectionEyebrow}</div>
            <div className="section-title">
              <strong>{screen.apporteurs.sectionTitle}</strong>
            </div>
          </div>
          <span style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
            {screen.apporteurs.sectionRight}
          </span>
        </div>
        <ApporteursTable
          section={screen.apporteurs}
          onVoir={setApporteurDetail}
          onExport={exportApporteurs}
        />
      </div>

      <Modal
        open={creating}
        onClose={closeCreate}
        eyebrow="Carnet de partenaires · Création"
        title="Nouveau"
        titleStrong="partenaire"
        sub="Référencer un partenaire recommandable ou un apporteur d'affaires dans le carnet du cabinet."
        footer={
          <>
            <button type="button" className="pp-btn pp-btn-ghost" onClick={closeCreate}>
              Annuler
            </button>
            <button
              type="button"
              className="pp-btn pp-btn-primary"
              onClick={handleSave}
              disabled={!canSave || submitting}
            >
              {submitting ? "Enregistrement…" : "Enregistrer le partenaire"}
            </button>
          </>
        }
      >
        <div className="pp-form-grid">
          <label className="pp-field">
            <span className="pp-field-label">Nom / structure</span>
            <input
              className="pp-input"
              placeholder="ex. Maître Sophie BERNHEIM"
              value={form.nomStructure}
              onChange={(e) => setForm((f) => ({ ...f, nomStructure: e.target.value }))}
            />
          </label>
          <label className="pp-field">
            <span className="pp-field-label">Type</span>
            <select
              className="pp-input"
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as PartenaireType }))
              }
            >
              <option value="reco">Partenaire recommandable</option>
              <option value="apporteur">Apporteur d&apos;affaires</option>
            </select>
          </label>
          <label className="pp-field">
            <span className="pp-field-label">Profession / profil</span>
            <select
              className="pp-input"
              value={form.profil}
              onChange={(e) => setForm((f) => ({ ...f, profil: e.target.value }))}
            >
              <option value="notaire">Notaire</option>
              <option value="avocat">Avocat</option>
              <option value="expert-comptable">Expert-comptable</option>
              <option value="agent-immo">Agent immo</option>
              <option value="ambassadeur">Client ambassadeur</option>
              <option value="media">Média / influence</option>
            </select>
          </label>
          <label className="pp-field">
            <span className="pp-field-label">Localisation</span>
            <input
              className="pp-input"
              placeholder="ex. Paris 8e"
              value={form.localisation}
              onChange={(e) => setForm((f) => ({ ...f, localisation: e.target.value }))}
            />
          </label>
          <label className="pp-field pp-field-full">
            <span className="pp-field-label">Spécialité / note</span>
            <input
              className="pp-input"
              placeholder="ex. Transmission · démembrement"
              value={form.specialite}
              onChange={(e) => setForm((f) => ({ ...f, specialite: e.target.value }))}
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={recoDetail !== null}
        onClose={() => setRecoDetail(null)}
        eyebrow="Partenaire recommandable"
        title="Fiche"
        titleStrong="partenaire"
        sub="Partenaire identifié et qualifié par ASTRAEOS, activable pour un dossier client."
      >
        {recoDetail ? (
          <DetailGrid
            rows={[
              { label: "Nom", value: recoDetail.nom },
              { label: "Structure", value: recoDetail.structure },
              { label: "Profession", value: recoDetail.profession },
              { label: "Localisation", value: recoDetail.localisation },
              { label: "Spécialité", value: recoDetail.specialite },
              { label: "Dossiers traités 2026", value: recoDetail.dossiersTraites2026 },
            ]}
          />
        ) : null}
      </Modal>

      <Modal
        open={apporteurDetail !== null}
        onClose={() => setApporteurDetail(null)}
        eyebrow="Apporteur d'affaires"
        title="Fiche"
        titleStrong="apporteur"
        sub="Personne qui amène des clients à ASTRAEOS et au cabinet."
      >
        {apporteurDetail ? (
          <>
            <DetailGrid
              rows={[
                { label: "Apporteur", value: apporteurDetail.nom },
                { label: "Détail", value: apporteurDetail.sousTitre },
                { label: "Profil", value: apporteurDetail.profil },
                {
                  label: "Affaires totales",
                  value: `${apporteurDetail.affairesTotales} ${apporteurDetail.affairesDepuis}`,
                },
                { label: "CA généré cumul", value: apporteurDetail.caGenereCumul },
                { label: "Statut", value: apporteurDetail.statutLabel },
              ]}
            />
            <div className="pp-detail-section-label">Dossiers concernés</div>
            <ul className="pp-detail-list">
              {apporteurDetail.dossiers.map((d, i) => (
                <li key={i}>
                  {d.label}
                  {d.annotation ? (
                    <span style={{ color: "var(--navy-300)", fontSize: "10px" }}> {d.annotation}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </Modal>

      {toast ? (
        <div className="pp-toast" role="status">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast}
        </div>
      ) : null}
    </>
  );
}
