import {
  getPartenairesScreen,
  type Apporteur,
  type PartenaireReco,
  type ProfilVariant,
} from "../../_data/partenaires";
import "../../_styles/partenaires.css";

export const metadata = {
  title: "ASTRAEOS · Partenaires & apporteurs d'affaires",
};

export const dynamic = "force-dynamic";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.5-4.5" />
    </svg>
  );
}

/** Badge profession / profil : couleur portée de la maquette via classe de variante. */
function ProfilBadge({ label, variant }: { label: string; variant: ProfilVariant }) {
  return <span className={`badge pp-${variant}`}>{label}</span>;
}

function SearchBox() {
  return (
    <div className="search-wrap">
      <SearchIcon />
      <input
        className="search-input"
        placeholder="Rechercher..."
        disabled
        title="En cours"
        style={{ width: "180px" }}
      />
    </div>
  );
}

function FiltresPerf({ filtres }: { filtres: string[] }) {
  return (
    <>
      {filtres.map((f, i) => (
        <button
          key={f}
          type="button"
          className={`qf-perf${i === 0 ? " active" : ""}`}
          disabled
          title="En cours"
        >
          {f}
        </button>
      ))}
    </>
  );
}

/** Bouton « Voir » : pas de route partenaires/[id] backend → désactivé honnête. */
function VoirButton() {
  return (
    <button type="button" className="btn btn-ghost btn-sm" disabled title="En cours">
      Voir
    </button>
  );
}

function RecoRow({ p }: { p: PartenaireReco }) {
  return (
    <tr>
      <td>
        <div className="cell-primary">{p.nom}</div>
        <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>{p.structure}</div>
      </td>
      <td>
        <ProfilBadge label={p.profession} variant={p.professionVariant} />
      </td>
      <td>{p.localisation}</td>
      <td>{p.specialite}</td>
      <td className={`num cell-money${p.dossiersGold ? " gold" : ""}`}>{p.dossiersTraites2026}</td>
      <td className="center">
        <VoirButton />
      </td>
    </tr>
  );
}

function ApporteurRows({ a }: { a: Apporteur }) {
  const span = a.dossiers.length;
  const goldClass = a.affairesGold ? " gold" : "";
  return (
    <>
      {a.dossiers.map((d, i) => (
        <tr key={`${a.nom}-${i}`}>
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
            <td className={`num cell-money${goldClass}`} rowSpan={span} style={{ verticalAlign: "middle" }}>
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
              <VoirButton />
            </td>
          )}
        </tr>
      ))}
    </>
  );
}

export default function PartenairesPage() {
  const screen = getPartenairesScreen();

  return (
    <div className="px-10 py-8">
      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">{screen.heroEyebrow}</div>
          <h1 className="hero-title">
            Partenaires & <strong>apporteurs d'affaires</strong>
          </h1>
          <p className="hero-sub">
            Deux populations distinctes : les <strong>partenaires recommandables</strong> que PRIVEOS
            active pour ses clients (notaires, avocats, experts comptables identifiés et qualifiés),
            et les <strong>apporteurs d'affaires</strong> qui amènent des clients à notre réseau
            (avocats, notaires, comptables, agents immo, clients satisfaits, podcasteurs...).
          </p>
        </div>
        <div className="hero-actions">
          <button type="button" className="btn btn-ghost btn-sm" disabled title="En cours">
            Exporter
          </button>
          <button type="button" className="btn btn-gold btn-sm" disabled title="En cours">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouveau partenaire
          </button>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="kpis kpis-4 mb-20">
        {screen.kpis.map((kpi) => (
          <div className="kpi" key={kpi.label}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-meta">{kpi.meta}</div>
          </div>
        ))}
      </div>

      {/* SECTION 1 : Partenaires recommandables */}
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

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-toolbar-left">
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>
                {screen.reco.toolbarCount}
              </span>
              <FiltresPerf filtres={screen.reco.filtres} />
            </div>
            <div className="table-toolbar-right">
              <SearchBox />
            </div>
          </div>
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
              {screen.reco.partenaires.map((p) => (
                <RecoRow key={p.nom} p={p} />
              ))}
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
                  {screen.reco.resteLabel}
                  <a style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}>
                    {screen.reco.resteLien}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2 : Apporteurs d'affaires */}
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

        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-toolbar-left">
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>
                {screen.apporteurs.toolbarCount}
              </span>
              <FiltresPerf filtres={screen.apporteurs.filtres} />
            </div>
            <div className="table-toolbar-right">
              <SearchBox />
            </div>
          </div>
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
              {screen.apporteurs.liste.map((a) => (
                <ApporteurRows key={a.nom + a.caGenereCumul} a={a} />
              ))}
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
                  {screen.apporteurs.resteLabel}
                  <a style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}>
                    {screen.apporteurs.resteLien}
                  </a>
                </td>
              </tr>
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
            plusieurs dossiers (exemple Linda TRABELSI · Cabinet d'avocat avec 8 dossiers cumulés
            depuis 2024). La colonne{" "}
            <strong style={{ color: "var(--gold-deep)" }}>Affaires totales apportées</strong> donne
            la vue cumulée pour identifier les apporteurs récurrents et fidéliser la relation.
          </div>
        </div>
      </div>
    </div>
  );
}
