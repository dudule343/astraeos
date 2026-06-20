import Link from "next/link";
import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Investissement financier",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Investissement financier" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Assets du cabinet · investissement financier</div>
            <h1 className="hero-title">
              Investissement <strong>financier</strong>
            </h1>
            <p className="hero-sub">
              Détail réseau des placements financiers (PEA, AV, Capitalisation, Compte-titres).
              Pour chaque cabinet : nombre de contrats, encours, frais d&apos;entrée distribués,
              récurrence perçue, classement de contribution.
            </p>
          </div>
          <div className="hero-actions">
            <Link className="btn btn-ghost btn-sm" href="/espace-dirigeant">
              ← Retour accueil
            </Link>
            <button className="btn btn-gold btn-sm">Exporter</button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="kpis kpis-4 mb-20">
          <div className="kpi">
            <div className="kpi-label">Encours sous gestion</div>
            <div className="kpi-value">
              87 400 000 <span className="unit">€</span>
            </div>
            <div className="kpi-meta">tous contrats vivants · réseau</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Clients investissement financier</div>
            <div className="kpi-value">358</div>
            <div className="kpi-meta">↳ 478 contrats actifs · PEA, AV, Capi, Compte-titres</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Frais d&apos;entrée perçus</div>
            <div className="kpi-value gold">
              1 540 800 <span className="unit">€</span>
            </div>
            <div className="kpi-meta">part PRIVEOS · cumul janv-mai</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Récurrence perçue</div>
            <div className="kpi-value gold">
              333 780 <span className="unit">€</span>
            </div>
            <div className="kpi-meta">% sur encours · cumul janv-mai</div>
          </div>
        </div>

        {/* Classement par ingénieur : qui rapporte le plus */}
        <div className="card mb-24">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-business" />
              </svg>
              Classement par ingénieur · qui rapporte le plus en investissement financier
            </div>
            <span style={{ fontSize: 11, color: "var(--navy-300)" }}>
              cumul janv-mai 2026 · cliquez pour le détail
            </span>
          </div>
          <table className="dt">
            <thead>
              <tr>
                <th>Ingénieur</th>
                <th>Rôle</th>
                <th className="num">
                  Clients
                  <br />
                  <span style={{ fontWeight: 400, color: "var(--navy-300)", fontSize: 10.5 }}>
                    ↳ contrats actifs
                  </span>
                </th>
                <th className="num">Encours porté</th>
                <th className="num">Frais d&apos;entrée 2026</th>
                <th className="num">Récurrence perçue</th>
                <th className="num">Total revenu</th>
                <th>Évolution N-1</th>
              </tr>
            </thead>
            <tbody>
              <tr className="dt-clickable">
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div className="ingenieur-avatar" style={{ width: 30, height: 30, fontSize: 10 }}>
                      JV
                    </div>
                    <div className="cell-primary">Julien VASSEUR</div>
                  </div>
                </td>
                <td style={{ fontSize: 10.5, color: "var(--navy-300)" }}>Senior · 8 ans</td>
                <td className="num">
                  <div style={{ lineHeight: 1.2 }}>
                    <strong style={{ color: "var(--navy)", fontSize: 14 }}>9</strong>{" "}
                    <span style={{ fontSize: 10, color: "var(--navy-300)", fontWeight: 400 }}>
                      clients
                    </span>
                    <br />
                    <span style={{ fontSize: 10.5, color: "var(--navy-300)" }}>↳ 12 contrats</span>
                  </div>
                </td>
                <td className="num cell-money">2 100 000 €</td>
                <td className="num cell-money gold">58 200 €</td>
                <td className="num cell-money">14 600 €</td>
                <td className="num cell-money gold">72 800 €</td>
                <td>
                  <span className="up">▲ +14 %</span>
                </td>
              </tr>
              <tr
                className="dt-clickable"
                style={{ background: "linear-gradient(90deg, var(--gold-100) 0%, transparent 50%)" }}
              >
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div
                      className="ingenieur-avatar"
                      style={{
                        width: 30,
                        height: 30,
                        fontSize: 10,
                        background: "var(--gold)",
                        color: "white",
                      }}
                    >
                      LT
                    </div>
                    <div className="cell-primary">
                      Luc THILLIEZ{" "}
                      <span
                        style={{
                          fontSize: 9.5,
                          color: "var(--gold-deep)",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                        }}
                      >
                        ·VOUS
                      </span>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 10.5, color: "var(--navy-300)" }}>Dirigeant-praticien</td>
                <td className="num">
                  <div style={{ lineHeight: 1.2 }}>
                    <strong style={{ color: "var(--navy)", fontSize: 14 }}>7</strong>{" "}
                    <span style={{ fontSize: 10, color: "var(--navy-300)", fontWeight: 400 }}>
                      clients
                    </span>
                    <br />
                    <span style={{ fontSize: 10.5, color: "var(--navy-300)" }}>↳ 9 contrats</span>
                  </div>
                </td>
                <td className="num cell-money">1 700 000 €</td>
                <td className="num cell-money gold">48 400 €</td>
                <td className="num cell-money">12 200 €</td>
                <td className="num cell-money gold">60 600 €</td>
                <td>
                  <span className="up">▲ +16 %</span>
                </td>
              </tr>
              <tr className="dt-clickable">
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div className="ingenieur-avatar" style={{ width: 30, height: 30, fontSize: 10 }}>
                      SM
                    </div>
                    <div className="cell-primary">Sophie MERCIER</div>
                  </div>
                </td>
                <td style={{ fontSize: 10.5, color: "var(--navy-300)" }}>5 ans</td>
                <td className="num">
                  <div style={{ lineHeight: 1.2 }}>
                    <strong style={{ color: "var(--navy)", fontSize: 14 }}>6</strong>{" "}
                    <span style={{ fontSize: 10, color: "var(--navy-300)", fontWeight: 400 }}>
                      clients
                    </span>
                    <br />
                    <span style={{ fontSize: 10.5, color: "var(--navy-300)" }}>↳ 8 contrats</span>
                  </div>
                </td>
                <td className="num cell-money">1 250 000 €</td>
                <td className="num cell-money gold">34 200 €</td>
                <td className="num cell-money">8 600 €</td>
                <td className="num cell-money gold">42 800 €</td>
                <td>
                  <span className="up">▲ +12 %</span>
                </td>
              </tr>
              <tr className="dt-clickable">
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div className="ingenieur-avatar" style={{ width: 30, height: 30, fontSize: 10 }}>
                      TL
                    </div>
                    <div className="cell-primary">Thomas LEROY</div>
                  </div>
                </td>
                <td style={{ fontSize: 10.5, color: "var(--navy-300)" }}>3 ans</td>
                <td className="num">
                  <div style={{ lineHeight: 1.2 }}>
                    <strong style={{ color: "var(--navy)", fontSize: 14 }}>4</strong>{" "}
                    <span style={{ fontSize: 10, color: "var(--navy-300)", fontWeight: 400 }}>
                      clients
                    </span>
                    <br />
                    <span style={{ fontSize: 10.5, color: "var(--navy-300)" }}>↳ 6 contrats</span>
                  </div>
                </td>
                <td className="num cell-money">580 000 €</td>
                <td className="num cell-money gold">26 800 €</td>
                <td className="num cell-money">7 800 €</td>
                <td className="num cell-money gold">34 600 €</td>
                <td>
                  <span className="up">▲ +8 %</span>
                </td>
              </tr>
              <tr className="dt-clickable">
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div className="ingenieur-avatar" style={{ width: 30, height: 30, fontSize: 10 }}>
                      CB
                    </div>
                    <div className="cell-primary">Camille BERTRAND</div>
                  </div>
                </td>
                <td style={{ fontSize: 10.5, color: "var(--navy-300)" }}>Junior · 2 ans</td>
                <td className="num">
                  <div style={{ lineHeight: 1.2 }}>
                    <strong style={{ color: "var(--navy)", fontSize: 14 }}>2</strong>{" "}
                    <span style={{ fontSize: 10, color: "var(--navy-300)", fontWeight: 400 }}>
                      clients
                    </span>
                    <br />
                    <span style={{ fontSize: 10.5, color: "var(--navy-300)" }}>↳ 3 contrats</span>
                  </div>
                </td>
                <td className="num cell-money">170 000 €</td>
                <td className="num cell-money gold">17 400 €</td>
                <td className="num cell-money">5 500 €</td>
                <td className="num cell-money gold">22 900 €</td>
                <td>
                  <span className="up">▲ +6 %</span>
                </td>
              </tr>
              <tr style={{ background: "var(--gold-200)", fontWeight: 700 }}>
                <td colSpan={2}>
                  <strong>Total cabinet</strong>
                </td>
                <td className="num">
                  <div style={{ lineHeight: 1.2 }}>
                    <strong style={{ color: "var(--navy)", fontSize: 14 }}>28</strong>{" "}
                    <span style={{ fontSize: 10, color: "var(--navy-300)", fontWeight: 400 }}>
                      clients
                    </span>
                    <br />
                    <span style={{ fontSize: 10.5, color: "var(--navy-300)" }}>↳ 38 contrats</span>
                  </div>
                </td>
                <td className="num cell-money">5 800 000 €</td>
                <td className="num cell-money">185 000 €</td>
                <td className="num cell-money">48 700 €</td>
                <td className="num cell-money gold">233 700 €</td>
                <td>
                  <span className="up">▲ +13 %</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Top produits placés (pleine largeur) */}
        <div className="card mb-24">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-finance" />
              </svg>
              Top produits placés par le cabinet
            </div>
          </div>
          <table className="dt" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Produit</th>
                <th className="num">Placements 2026</th>
                <th className="num">Encours</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Assurance vie luxembourgeoise</strong>
                </td>
                <td className="num cell-money gold">14</td>
                <td className="num cell-money">3 200 000 €</td>
              </tr>
              <tr>
                <td>
                  <strong>Assurance vie française</strong>
                </td>
                <td className="num">10</td>
                <td className="num cell-money">1 900 000 €</td>
              </tr>
              <tr>
                <td>
                  <strong>PEA Découverte</strong>
                </td>
                <td className="num">6</td>
                <td className="num cell-money">820 000 €</td>
              </tr>
              <tr>
                <td>
                  <strong>Contrat de capitalisation</strong>
                </td>
                <td className="num">5</td>
                <td className="num cell-money">740 000 €</td>
              </tr>
              <tr>
                <td>
                  <strong>Compte-titres</strong>
                </td>
                <td className="num">4</td>
                <td className="num cell-money">480 000 €</td>
              </tr>
              <tr>
                <td>
                  <strong>PER Liberté</strong>
                </td>
                <td className="num">4</td>
                <td className="num cell-money">280 000 €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
