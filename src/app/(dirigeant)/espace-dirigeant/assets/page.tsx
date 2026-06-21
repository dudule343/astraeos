// Espace dirigeant — Assets · Vue d'ensemble.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 7609-7769). Route : /espace-dirigeant/assets
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import Link from "next/link";
import { DirigeantTopbar } from "../../_components/DirigeantTopbar";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Assets · Vue d'ensemble",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Assets · Vue d'ensemble" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Assets du cabinet · vue d&apos;ensemble · Cabinet Paris Étoile</div>
            <h1 className="hero-title">
              Assets <strong>du cabinet</strong>
            </h1>
            <p className="hero-sub">
              Vue consolidée des 4 axes patrimoniaux placés par le cabinet · investissement financier, assurance,
              investissement immobilier et honoraires de conseil. Synthèse des volumes, revenus perçus et performance par
              axe.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm">Export</button>
          </div>
        </div>

        {/* 4 KPIs globaux avec pictogrammes */}
        <div className="kpis kpis-4 mb-20">
          <Link
            href="/espace-dirigeant/assets/financier"
            className="kpi clickable"
            style={{ position: "relative" }}
          >
            <div
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
                borderRadius: "9px",
                display: "grid",
                placeItems: "center",
                color: "white",
                boxShadow: "0 2px 6px rgba(198,142,14,0.2)",
              }}
            >
              <svg
                style={{ width: "18px", height: "18px" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="16" rx="1.5" />
                <circle cx="11" cy="12" r="3.2" />
                <line x1="11" y1="12" x2="11" y2="9.5" />
                <line x1="11" y1="12" x2="13.2" y2="13.5" />
                <line x1="18.5" y1="7" x2="18.5" y2="10" />
                <line x1="18.5" y1="14" x2="18.5" y2="17" />
              </svg>
            </div>
            <div className="kpi-label" style={{ paddingRight: "48px" }}>
              Total revenu Asset · An cumulé
            </div>
            <div className="kpi-value">
              496 500 <span className="unit">€</span>
            </div>
            <div className="kpi-meta">commissions + honoraires + frais</div>
            <div className="kpi-compare">
              <div className="kpi-compare-cell">
                <div className="kpi-compare-period">M-1</div>
                <div className="kpi-compare-value up">▲ +12 %</div>
              </div>
              <div className="kpi-compare-cell">
                <div className="kpi-compare-period">N-1</div>
                <div className="kpi-compare-value up">▲ +18 %</div>
              </div>
            </div>
          </Link>

          <div className="kpi" style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
                borderRadius: "9px",
                display: "grid",
                placeItems: "center",
                color: "white",
                boxShadow: "0 2px 6px rgba(198,142,14,0.2)",
              }}
            >
              <svg
                style={{ width: "18px", height: "18px" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18.5 6.5 C 16.8 4.8 14.5 4 12 4 C 7.5 4 4.5 7.5 4.5 12 C 4.5 16.5 7.5 20 12 20 C 14.5 20 16.8 19.2 18.5 17.5" />
                <line x1="3" y1="10" x2="14" y2="10" />
                <line x1="3" y1="14" x2="14" y2="14" />
              </svg>
            </div>
            <div className="kpi-label" style={{ paddingRight: "48px" }}>
              Patrimoine sous gestion
            </div>
            <div className="kpi-value">
              8 200 000 <span className="unit">€</span>
            </div>
            <div className="kpi-meta">cumul placé via le cabinet</div>
            <div className="kpi-compare">
              <div className="kpi-compare-cell">
                <div className="kpi-compare-period">M-1</div>
                <div className="kpi-compare-value up">▲ +180 000 €</div>
              </div>
              <div className="kpi-compare-cell">
                <div className="kpi-compare-period">N-1</div>
                <div className="kpi-compare-value up">▲ +22 %</div>
              </div>
            </div>
          </div>

          <div className="kpi" style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
                borderRadius: "9px",
                display: "grid",
                placeItems: "center",
                color: "white",
                boxShadow: "0 2px 6px rgba(198,142,14,0.2)",
              }}
            >
              <svg
                style={{ width: "18px", height: "18px" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 3 L 7 21 L 17 21 L 17 7 L 13 3 Z" />
                <line x1="10" y1="11" x2="14" y2="11" />
                <line x1="10" y1="15" x2="14" y2="15" />
                <polyline points="13 3 13 7 17 7" />
              </svg>
            </div>
            <div className="kpi-label" style={{ paddingRight: "48px" }}>
              Contrats actifs
            </div>
            <div className="kpi-value">76</div>
            <div className="kpi-meta">tous axes confondus</div>
            <div className="kpi-compare">
              <div className="kpi-compare-cell">
                <div className="kpi-compare-period">M-1</div>
                <div className="kpi-compare-value up">▲ +6</div>
              </div>
              <div className="kpi-compare-cell">
                <div className="kpi-compare-period">N-1</div>
                <div className="kpi-compare-value up">▲ +18</div>
              </div>
            </div>
          </div>

          <div className="kpi" style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
                borderRadius: "9px",
                display: "grid",
                placeItems: "center",
                color: "white",
                boxShadow: "0 2px 6px rgba(198,142,14,0.2)",
              }}
            >
              <svg
                style={{ width: "18px", height: "18px" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="8" r="3.5" />
                <path d="M2.5 21 v -2 a 4 4 0 0 1 4 -4 h 5 a 4 4 0 0 1 4 4 v 2" />
                <circle cx="17" cy="9" r="2.5" />
                <path d="M15 21 v -1.5 a 3 3 0 0 1 3 -3 h 1.5 a 3 3 0 0 1 3 3 v 1.5" />
              </svg>
            </div>
            <div className="kpi-label" style={{ paddingRight: "48px" }}>
              Clients servis
            </div>
            <div className="kpi-value">28</div>
            <div className="kpi-meta">portefeuille actif du cabinet</div>
            <div className="kpi-compare">
              <div className="kpi-compare-cell">
                <div className="kpi-compare-period">M-1</div>
                <div className="kpi-compare-value up">▲ +2</div>
              </div>
              <div className="kpi-compare-cell">
                <div className="kpi-compare-period">N-1</div>
                <div className="kpi-compare-value up">▲ +8</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 cartes Assets (cliquables) */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Détail par axe · cumul depuis janvier 2026</div>
              <div className="section-title">
                <strong>Les 4 axes du cabinet</strong>
              </div>
            </div>
            <span style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>Cliquer pour voir le détail</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {/* Investissement financier */}
            <Link
              href="/espace-dirigeant/assets/financier"
              className="card clickable"
              style={{ borderLeft: "4px solid var(--gold)", cursor: "pointer" }}
            >
              <div className="card-header">
                <div className="card-title">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: "18px", height: "18px" }}
                  >
                    <path d="M3 18 V 8 L 9 8 V 18 Z M 10 18 V 4 L 16 4 V 18 Z M 17 18 V 12 L 23 12 V 18 Z" />
                  </svg>
                  Investissement financier
                </div>
                <span style={{ fontSize: "18px", color: "var(--gold)" }}>→</span>
              </div>
              <div className="card-body" style={{ padding: "18px 22px" }}>
                <div
                  style={{
                    fontFamily: "'Epilogue',sans-serif",
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    lineHeight: 1,
                  }}
                >
                  233 700 <span style={{ fontSize: "14px", color: "var(--gold-deep)" }}>€</span>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--navy-300)", marginTop: "6px" }}>
                  An cumulé · frais d&apos;entrée + récurrence
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "18px",
                    marginTop: "14px",
                    paddingTop: "14px",
                    borderTop: "1px solid var(--ivory-deep)",
                    fontSize: "11px",
                  }}
                >
                  <div>
                    <div style={{ color: "var(--navy-300)" }}>Frais d&apos;entrée</div>
                    <strong style={{ fontSize: "13px" }}>185 000 €</strong>
                  </div>
                  <div>
                    <div style={{ color: "var(--navy-300)" }}>Récurrence</div>
                    <strong style={{ fontSize: "13px" }}>48 700 €</strong>
                  </div>
                  <div>
                    <div style={{ color: "var(--navy-300)" }}>Patrimoine</div>
                    <strong style={{ fontSize: "13px" }}>5 800 000 €</strong>
                  </div>
                </div>
              </div>
            </Link>

            {/* Assurance */}
            <Link
              href="/espace-dirigeant/assets/assurance"
              className="card clickable"
              style={{ borderLeft: "4px solid var(--gold)", cursor: "pointer" }}
            >
              <div className="card-header">
                <div className="card-title">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: "18px", height: "18px" }}
                  >
                    <path d="M12 2 L 4 5 V 11 C 4 16 8 20 12 22 C 16 20 20 16 20 11 V 5 Z" />
                    <polyline points="8 12 11 15 16 9" />
                  </svg>
                  Assurance
                </div>
                <span style={{ fontSize: "18px", color: "var(--gold)" }}>→</span>
              </div>
              <div className="card-body" style={{ padding: "18px 22px" }}>
                <div
                  style={{
                    fontFamily: "'Epilogue',sans-serif",
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    lineHeight: 1,
                  }}
                >
                  68 400 <span style={{ fontSize: "14px", color: "var(--gold-deep)" }}>€</span>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--navy-300)", marginTop: "6px" }}>
                  An cumulé · frais d&apos;entrée + commissions
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "18px",
                    marginTop: "14px",
                    paddingTop: "14px",
                    borderTop: "1px solid var(--ivory-deep)",
                    fontSize: "11px",
                  }}
                >
                  <div>
                    <div style={{ color: "var(--navy-300)" }}>Contrats actifs</div>
                    <strong style={{ fontSize: "13px" }}>38</strong>
                  </div>
                  <div>
                    <div style={{ color: "var(--navy-300)" }}>Frais d&apos;entrée</div>
                    <strong style={{ fontSize: "13px" }}>68 400 €</strong>
                  </div>
                  <div>
                    <div style={{ color: "var(--navy-300)" }}>Récurrence</div>
                    <strong style={{ fontSize: "13px" }}>14 200 €</strong>
                  </div>
                </div>
              </div>
            </Link>

            {/* Investissement immobilier */}
            <Link
              href="/espace-dirigeant/assets/immobilier"
              className="card clickable"
              style={{ borderLeft: "4px solid var(--gold)", cursor: "pointer" }}
            >
              <div className="card-header">
                <div className="card-title">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: "18px", height: "18px" }}
                  >
                    <path d="M3 9 L 12 3 L 21 9 V 21 H 3 Z M 9 21 V 12 H 15 V 21" />
                  </svg>
                  Investissement immobilier
                </div>
                <span style={{ fontSize: "18px", color: "var(--gold)" }}>→</span>
              </div>
              <div className="card-body" style={{ padding: "18px 22px" }}>
                <div
                  style={{
                    fontFamily: "'Epilogue',sans-serif",
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    lineHeight: 1,
                  }}
                >
                  32 400 <span style={{ fontSize: "14px", color: "var(--gold-deep)" }}>€</span>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--navy-300)", marginTop: "6px" }}>
                  An cumulé · rémunération apport
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "18px",
                    marginTop: "14px",
                    paddingTop: "14px",
                    borderTop: "1px solid var(--ivory-deep)",
                    fontSize: "11px",
                  }}
                >
                  <div>
                    <div style={{ color: "var(--navy-300)" }}>Frais d&apos;entrée perçus</div>
                    <strong style={{ fontSize: "13px" }}>32 400 €</strong>
                  </div>
                  <div>
                    <div style={{ color: "var(--navy-300)" }}>Volume placé</div>
                    <strong style={{ fontSize: "13px" }}>600 000 €</strong>
                  </div>
                  <div>
                    <div style={{ color: "var(--navy-300)" }}>Projets réalisés</div>
                    <strong style={{ fontSize: "13px" }}>2</strong>
                  </div>
                </div>
              </div>
            </Link>

            {/* Honoraires de conseil */}
            <Link
              href="/espace-dirigeant/assets/honoraires"
              className="card clickable"
              style={{ borderLeft: "4px solid var(--gold)", cursor: "pointer" }}
            >
              <div className="card-header">
                <div className="card-title">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: "18px", height: "18px" }}
                  >
                    <path d="M7 3 H 17 V 21 H 7 Z" />
                    <line x1="10" y1="8" x2="14" y2="8" />
                    <line x1="10" y1="12" x2="14" y2="12" />
                    <line x1="10" y1="16" x2="14" y2="16" />
                  </svg>
                  Honoraires de conseil
                </div>
                <span style={{ fontSize: "18px", color: "var(--gold)" }}>→</span>
              </div>
              <div className="card-body" style={{ padding: "18px 22px" }}>
                <div
                  style={{
                    fontFamily: "'Epilogue',sans-serif",
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    lineHeight: 1,
                  }}
                >
                  162 400 <span style={{ fontSize: "14px", color: "var(--gold-deep)" }}>€</span>
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--navy-300)", marginTop: "6px" }}>
                  An cumulé · honoraires études patrimoniales
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "18px",
                    marginTop: "14px",
                    paddingTop: "14px",
                    borderTop: "1px solid var(--ivory-deep)",
                    fontSize: "11px",
                  }}
                >
                  <div>
                    <div style={{ color: "var(--navy-300)" }}>Études réalisées</div>
                    <strong style={{ fontSize: "13px" }}>14</strong>
                  </div>
                  <div>
                    <div style={{ color: "var(--navy-300)" }}>Frais d&apos;études</div>
                    <strong style={{ fontSize: "13px" }}>162 400 €</strong>
                  </div>
                  <div>
                    <div style={{ color: "var(--navy-300)" }}>Honoraire moyen</div>
                    <strong style={{ fontSize: "13px" }}>11 600 €</strong>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
