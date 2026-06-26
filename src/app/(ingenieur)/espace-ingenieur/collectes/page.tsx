import Link from "next/link";

import {
  type CollecteFiltreKey,
  type CollecteLigne,
  type CollecteStatut,
  filterCollecteLignes,
  getCollectesScreen,
  isCollecteFiltre,
} from "../../_data/collectes-server";
import "../../_styles/collecte-liste.css";

export const metadata = {
  title: "ASTRAEOS · Collecte des documents et informations",
};

export const dynamic = "force-dynamic";

const BASE = "/espace-ingenieur";

/** Écran détail (agent B) d'une collecte / constructeur pour un dossier. */
function detailHref(row: CollecteLigne): string {
  return `${BASE}/collectes/${row.id}`;
}

/** href d'un filtre : « tous » = URL nue, sinon ?filtre=clé. */
function filterHref(key: CollecteFiltreKey): string {
  return key === "all" ? `${BASE}/collectes` : `${BASE}/collectes?filtre=${key}`;
}

/** Couleur de remplissage de la barre d'avancement, selon le statut. */
const FILL_COLOR: Record<CollecteStatut, string> = {
  initier: "var(--navy-200)",
  collecte: "var(--gold)",
  pret: "var(--navy)",
  inactif: "var(--navy-200)",
};

function clientTypeClass(row: CollecteLigne): string {
  if (row.clientType === "couple" || row.clientType === "couple-pacs") return "client-type couple";
  if (row.clientType === "personne-morale") return "client-type personne-morale";
  return "client-type";
}

/** Cellule client : 1 nom (seule), 2 noms (couple) ou nom + raison sociale (PM). */
function ClientCell({ row }: { row: CollecteLigne }) {
  return (
    <div className="client-cell">
      {row.nameLines.length >= 2 ? (
        row.nameLines.map((line, i) => (
          <span key={i} className="client-name-line">
            {line}
          </span>
        ))
      ) : (
        <span className="client-name">{row.nameLines[0]}</span>
      )}
      {row.subName ? (
        <span
          className="client-name-line"
          style={{ fontSize: "10.5px", color: "var(--navy-300)", fontWeight: 500 }}
        >
          {row.subName}
        </span>
      ) : null}
      <span className={clientTypeClass(row)}>{row.clientTypeLabel}</span>
    </div>
  );
}

/** Boutons d'action propres au statut de la ligne (cf. maquette pipe-03). */
function RowActions({ row }: { row: CollecteLigne }) {
  const href = detailHref(row);
  if (row.statut === "initier") {
    return (
      <Link className="collecte-act-btn intermediate" href={href}>
        Préparer la collecte
      </Link>
    );
  }
  if (row.statut === "pret") {
    return (
      <>
        <Link className="collecte-act-btn primary" href={href}>
          Passer à l&apos;étape suivante
        </Link>
        <Link className="collecte-act-btn neutral" href={href}>
          Consulter
        </Link>
      </>
    );
  }
  return (
    <Link className="collecte-act-btn neutral" href={href}>
      Consulter
    </Link>
  );
}

export default async function CollectesPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string }>;
}) {
  const { filtre } = await searchParams;
  const activeFilter: CollecteFiltreKey = isCollecteFiltre(filtre) ? filtre : "all";
  const screen = await getCollectesScreen();
  const rows = filterCollecteLignes(screen.rows, activeFilter);

  return (
    <div className="maq-collecte-liste">
      <div className="s1b-parcours-stepper">
        {screen.stepper.map((s) => (
          <Link key={s.num} href={s.route} className={`s1b-step ${s.state}`.trim()}>
            <div className="s1b-step-num">{s.num}</div>
            <div className="s1b-step-label">
              {s.l1}
              <br />
              {s.l2}
            </div>
          </Link>
        ))}
        <div className="s1b-stepper-pill">Étape 03/06</div>
      </div>

      <div className="hero">
        <div>
          <div className="hero-eyebrow">Étape 03 · Parcours patrimonial</div>
          <h1 className="hero-title">Collecte des documents et informations</h1>
          <p className="hero-sub">
            Vos clients ayant validé la conformité et réglé l&apos;acompte. L&apos;IA ouvre les
            rubriques de collecte selon leur situation patrimoniale et contrôle la cohérence des
            pièces déposées avant le passage à l&apos;étude (étape 04).
          </p>
        </div>
        <div className="hero-actions">
          <Link className="btn btn-gold" href="/espace-ingenieur/collectes/nouvelle">
            <span>+ Créer une collecte</span>
          </Link>
        </div>
      </div>

      <div className="collecte-toolbar">
        <div className="collecte-filters">
          {screen.filtres.map((f) => {
            const active = f.key === activeFilter;
            return (
              <Link
                key={f.key}
                href={filterHref(f.key)}
                scroll={false}
                aria-pressed={active}
                className={`collecte-filter${active ? " active" : ""}`}
              >
                {f.label} <span>{f.count}</span>
              </Link>
            );
          })}
        </div>
        <div className="collecte-delai">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>{" "}
          Délai moyen de collecte · <strong>{screen.delaiMoyenJours} jours</strong>
        </div>
      </div>

      <div className="collecte-table-wrap">
        <table className="dt collecte-dt">
          <thead>
            <tr>
              <th>Client</th>
              <th>Ingénieur en charge</th>
              <th>Supervisé par</th>
              <th>Date d&apos;initiation</th>
              <th>Avancement</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="pipe-row-clickable">
                <td>
                  <Link href={detailHref(row)} className="block no-underline">
                    <ClientCell row={row} />
                  </Link>
                </td>
                <td className="td-c">
                  <div className="collecte-ing">{row.ingenieurName}</div>
                </td>
                <td className="td-c">
                  <div className="collecte-sup">{row.superviseurName}</div>
                </td>
                <td className="td-c">
                  <div className="collecte-date">
                    {row.dateInitiation ?? <span className="collecte-dash">—</span>}
                  </div>
                </td>
                <td>
                  {row.pct === null ? (
                    <span className="collecte-dash">Non initiée</span>
                  ) : (
                    <div className="collecte-prog-wrap">
                      <div className="collecte-prog-bar">
                        <div
                          className="collecte-prog-fill"
                          style={{ width: `${row.pct}%`, background: FILL_COLOR[row.statut] }}
                        />
                      </div>
                      <span className="collecte-prog-pct">{row.pct}%</span>
                    </div>
                  )}
                </td>
                <td className="td-c">
                  <span className={`collecte-statut st-${row.statut}`}>{row.statutLabel}</span>
                </td>
                <td className="td-c">
                  <div className="collecte-actions">
                    <RowActions row={row} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
