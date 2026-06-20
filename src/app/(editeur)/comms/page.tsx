import { EditeurTopbar } from "../_components/EditeurTopbar";
import { CommsCalendarFilter } from "./CommsCalendarFilter";

// Port 1:1 de la maquette <div id="page-comms"> (wireframes-editeur.html,
// lignes 4061-4177). Valeurs hardcodées identiques à la maquette.

type Badge = { label: string; cls: string };

const calendrier: {
  date: string;
  type: Badge;
  sujet: string;
  destinataires: string;
  statut: Badge;
}[] = [
  {
    date: "12 mai",
    type: { label: "Newsletter", cls: "badge badge-info" },
    sujet: "Nouveautés produit · mai 2026",
    destinataires: "~280 ingénieurs",
    statut: { label: "Brouillon", cls: "badge badge-warning" },
  },
  {
    date: "15 mai",
    type: { label: "Webinar", cls: "badge badge-gold" },
    sujet: "Optimisation patrimoniale post-réforme retraite",
    destinataires: "~150 inscrits",
    statut: { label: "Programmé", cls: "badge badge-info" },
  },
  {
    date: "22 mai",
    type: { label: "Annonce", cls: "badge badge-purple" },
    sujet: "Lancement Programme de parrainage",
    destinataires: "~280 ingénieurs · 23 clients",
    statut: { label: "Brouillon", cls: "badge badge-warning" },
  },
  {
    date: "28 mai",
    type: { label: "Newsletter", cls: "badge badge-info" },
    sujet: "Bibliothèque · 14 documents mis à jour",
    destinataires: "~280 ingénieurs",
    statut: { label: "À planifier", cls: "badge badge-neutral" },
  },
  {
    date: "3 juin",
    type: { label: "Webinar", cls: "badge badge-gold" },
    sujet: "Conduite d'entretien : 6 erreurs à éviter",
    destinataires: "à confirmer",
    statut: { label: "À planifier", cls: "badge badge-neutral" },
  },
];

const performances: { badge: Badge; date: string; titre: string; sous: string }[] = [
  {
    badge: { label: "Excellent", cls: "badge badge-success badge-dot" },
    date: "5 mai",
    titre: "Newsletter avril · 78 % d'ouverture",
    sous: "280 envois · 218 ouvertures · 64 clics",
  },
  {
    badge: { label: "Très bon", cls: "badge badge-success badge-dot" },
    date: "22 avril",
    titre: "Webinar réforme · 134 participants",
    sous: "150 inscrits · 89 % de présence",
  },
  {
    badge: { label: "Moyen", cls: "badge badge-warning badge-dot" },
    date: "14 avril",
    titre: "Annonce roadmap Q2 · 56 % d'ouverture",
    sous: "280 envois · 156 ouvertures · 28 clics",
  },
  {
    badge: { label: "Excellent", cls: "badge badge-success badge-dot" },
    date: "3 avril",
    titre: "Webinar intro · 188 participants",
    sous: "200 inscrits · 94 % de présence",
  },
];

const templates: { icon: string; titre: string; desc: string }[] = [
  {
    icon: "#i-comms",
    titre: "Newsletter mensuelle",
    desc: "Modèle structuré · 5 sections · highlights produit + tips",
  },
  {
    icon: "#i-licence",
    titre: "Annonce produit",
    desc: "Modèle court · pour mises à jour majeures & lancements",
  },
  {
    icon: "#i-team",
    titre: "Invitation webinar",
    desc: "Modèle invitation + 2 emails de rappel automatiques",
  },
];

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Communications & annonces" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Pilotage interne</div>
            <h1 className="hero-title">Communications &amp; annonces</h1>
            <p className="hero-sub">
              Gestion des communications sortantes vers les ingénieurs patrimoniaux des
              clients ASTRAEOS — newsletter, webinars, mises à jour produit, annonces
              stratégiques.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Templates">
              Templates
            </button>
            <button className="btn btn-gold btn-sm" data-stub="Nouvelle communication">
              <svg>
                <use href="#i-comms" />
              </svg>
              Nouvelle communication
            </button>
          </div>
        </div>

        <div className="kpis mb-20">
          <div className="kpi">
            <div className="kpi-label">Newsletters envoyées</div>
            <div className="kpi-value">14</div>
            <div className="kpi-meta">depuis janvier</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Webinars organisés</div>
            <div className="kpi-value">8</div>
            <div className="kpi-meta">~120 participants moyens</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Taux d&apos;ouverture moyen</div>
            <div className="kpi-value">
              72 <span className="unit">%</span>
            </div>
            <div className="kpi-meta">▲ +6 pts vs N-1</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Taux de clic moyen</div>
            <div className="kpi-value">
              28 <span className="unit">%</span>
            </div>
            <div className="kpi-meta">excellent · benchmark 18 %</div>
          </div>
        </div>

        <div className="grid-2-1 mb-24">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-comms" />
                </svg>
                Calendrier de communication
              </div>
              <CommsCalendarFilter />
            </div>
            <table className="dt">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Sujet</th>
                  <th>Destinataires</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {calendrier.map((row) => (
                  <tr key={row.date} className="dt-clickable">
                    <td>{row.date}</td>
                    <td>
                      <span className={row.type.cls}>{row.type.label}</span>
                    </td>
                    <td className="cell-primary">{row.sujet}</td>
                    <td className="num">{row.destinataires}</td>
                    <td>
                      <span className={row.statut.cls}>{row.statut.label}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-chart" />
                </svg>
                Performance dernières comms
              </div>
            </div>
            <div style={{ padding: "0" }}>
              {performances.map((p) => (
                <div className="alert-item" key={p.titre}>
                  <div className="alert-meta">
                    <span className={p.badge.cls}>{p.badge.label}</span>
                    <span>{p.date}</span>
                  </div>
                  <div className="alert-title">{p.titre}</div>
                  <div className="alert-sub">{p.sous}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Bibliothèque</div>
              <div className="section-title">Templates de communication</div>
            </div>
            <button className="btn btn-ghost btn-sm" data-stub="Nouveau template">
              Nouveau template
            </button>
          </div>

          <div className="grid-3">
            {templates.map((t) => (
              <div className="card" key={t.titre}>
                <div className="card-body">
                  <div className="icon-badge lg" style={{ marginBottom: "10px" }}>
                    <svg>
                      <use href={t.icon} />
                    </svg>
                  </div>
                  <div
                    style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--navy)" }}
                  >
                    {t.titre}
                  </div>
                  <div
                    style={{
                      fontSize: "11.5px",
                      color: "var(--navy-300)",
                      marginTop: "4px",
                    }}
                  >
                    {t.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
