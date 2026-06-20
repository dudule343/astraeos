import { EditeurTopbar } from "../_components/EditeurTopbar";

const TOP_FEATURES = [
  { label: "Étude patrimoniale globale", value: "214 utilisateurs", pct: "100 %", width: "100%" },
  { label: "Simulation patrimoniale", value: "198 utilisateurs", pct: "92 %", width: "92%" },
  { label: "Génération rapport client", value: "182 utilisateurs", pct: "85 %", width: "85%" },
  { label: "CRM clients", value: "170 utilisateurs", pct: "79 %", width: "79%" },
  { label: "Bibliothèque DCI", value: "98 utilisateurs", pct: "46 %", width: "46%" },
];

const FRICTIONS = [
  {
    badge: "À surveiller",
    badgeClass: "badge badge-warning",
    label: "Création étude patrimoniale",
    value: "28 %",
    valueColor: "var(--orange-text)",
    sub: "d’abandons à l’étape \"Bilan patrimonial\"",
  },
  {
    badge: "Critique",
    badgeClass: "badge badge-danger",
    label: "Module IA conversationnel",
    value: "62 %",
    valueColor: "var(--red-text)",
    sub: "d’utilisateurs qui n’y sont jamais revenus",
  },
  {
    badge: "Bon",
    badgeClass: "badge badge-success",
    label: "CRM clients",
    value: "94 %",
    valueColor: "var(--green-text)",
    sub: "de complétion du parcours fiche client",
  },
];

export default function Page() {
  return (
    <>
      <EditeurTopbar current="Analyse produit" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Bloc 06 · Analyse produit</div>
            <h1 className="hero-title">Analyse produit</h1>
            <p className="hero-sub">
              Comprendre comment les utilisateurs utilisent réellement la plateforme — détecter les
              frictions et identifier les fonctionnalités à valeur. Bloc essentiel mais nécessite le
              tracking comportemental (Phase 2).
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm" data-stub="Export">
              <svg>
                <use href="#i-download" />
              </svg>
              Export
            </button>
          </div>
        </div>

        <div className="info-bar">
          <svg>
            <use href="#i-info" />
          </svg>
          <div>
            <strong>Distinction Adoption vs Analyse :</strong> le bloc 03 mesure <strong>qui</strong>{" "}
            utilise la plateforme (volumétrie). Le bloc 06 mesure <strong>comment</strong> ils
            l&apos;utilisent (parcours, frictions, fonctionnalités plébiscitées ou délaissées).
          </div>
        </div>

        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Cœur du produit</div>
              <div className="section-title">Fonctionnalités les plus utilisées</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              {TOP_FEATURES.map((f) => (
                <div key={f.label} style={{ marginBottom: "14px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                      fontSize: "12px",
                      color: "var(--navy)",
                    }}
                  >
                    <span>{f.label}</span>
                    <span>
                      <strong style={{ color: "var(--gold)" }}>{f.value}</strong> · {f.pct}
                    </span>
                  </div>
                  <div className="funnel-bar">
                    <div className="funnel-bar-fill" style={{ width: f.width }} />
                  </div>
                </div>
              ))}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                    fontSize: "12px",
                    color: "var(--navy)",
                  }}
                >
                  <span>Module IA conversationnel</span>
                  <span>
                    <strong style={{ color: "var(--orange-text)" }}>42 utilisateurs</strong> · 20 %
                  </span>
                </div>
                <div className="funnel-bar">
                  <div
                    className="funnel-bar-fill"
                    style={{
                      width: "20%",
                      background: "linear-gradient(90deg, var(--orange-text), #C5825A)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Frictions détectées</div>
              <div className="section-title">Points de friction et abandons</div>
            </div>
          </div>
          <div className="grid-3">
            {FRICTIONS.map((f) => (
              <div className="card" key={f.label}>
                <div className="card-body">
                  <span className={f.badgeClass} style={{ marginBottom: "8px" }}>
                    {f.badge}
                  </span>
                  <div className="kpi-label" style={{ marginBottom: "6px" }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: f.valueColor }}>
                    {f.value}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--navy-300)", marginTop: "4px" }}>
                    {f.sub}
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
