import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";

export const metadata = {
  title: "ASTRAEOS · Espace Dirigeant · Compte de résultat",
};

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Compte de résultat" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Tableau de bord · synthèse financière du cabinet</div>
            <h1 className="hero-title">
              Compte de résultat <strong>du cabinet</strong>
            </h1>
            <p className="hero-sub">
              Détail comptable du Cabinet Paris Étoile : valeur ajoutée, EBE, résultat d&apos;exploitation,
              RCAI, résultat de l&apos;exercice. Vue année en cours (2026 jusqu&apos;à mai) vs même période
              2025, en valeur absolue ET en ratio sur le CA réalisé.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-gold btn-sm">Exporter</button>
          </div>
        </div>

        <div className="card mb-24">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-finance" />
              </svg>
              Compte de résultat · Luc THILLIEZ
            </div>
            <span style={{ fontSize: "10.5px", color: "var(--navy-300)", fontStyle: "italic" }}>
              cumul depuis janvier 2026 · vs même période 2025
            </span>
          </div>
          <table className="cdr-table">
            <thead>
              <tr className="cdr-thead-supra">
                <th style={{ width: "30%", borderBottom: "none", padding: "0" }}></th>
                <th
                  colSpan={3}
                  style={{
                    textAlign: "center",
                    padding: "8px 10px 4px",
                    borderBottom: "none",
                    background: "var(--ivory)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      color: "var(--navy-300)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                    }}
                  >
                    Valeurs · cumul depuis janvier
                  </span>
                </th>
                <th
                  colSpan={3}
                  className="divider"
                  style={{
                    textAlign: "center",
                    padding: "8px 10px 4px",
                    borderBottom: "none",
                    background: "var(--gold-100)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      color: "var(--gold-deep)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                    }}
                  >
                    Détails ratios · % sur CA
                  </span>
                </th>
              </tr>
              <tr>
                <th style={{ width: "30%", textAlign: "left" }}></th>
                <th className="num" style={{ width: "13%" }}>
                  Année en cours
                  <span className="sub">2026 · cumul depuis janvier</span>
                </th>
                <th className="num" style={{ width: "13%" }}>
                  Année dernière
                  <span className="sub">2025 · même période</span>
                </th>
                <th className="num" style={{ width: "11%" }}>
                  Diff
                </th>
                <th
                  className="num divider"
                  style={{ width: "11%", background: "var(--gold-100)" }}
                >
                  % CA 2026
                  <span className="sub">cumul depuis janvier</span>
                </th>
                <th className="num" style={{ width: "11%", background: "var(--gold-100)" }}>
                  % CA 2025
                  <span className="sub">même période</span>
                </th>
                <th className="num" style={{ width: "11%", background: "var(--gold-100)" }}>
                  Diff %
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label-cell">Chiffre d&apos;affaires réalisé</td>
                <td className="num cell-money">2 384 600 €</td>
                <td className="num cell-prev">1 937 000 €</td>
                <td className="num">
                  <span className="up" style={{ fontWeight: 700 }}>
                    ▲ +23,11 %
                  </span>
                </td>
                <td className="num divider cell-money">100,0 %</td>
                <td className="num cell-prev">100,0 %</td>
                <td className="num">
                  <span style={{ color: "var(--navy-300)" }}>— 0,0 %</span>
                </td>
              </tr>
              <tr>
                <td className="label-cell">- Consommations externes</td>
                <td className="num">- 786 918 €</td>
                <td className="num cell-prev">- 612 174 €</td>
                <td className="num">
                  <span style={{ color: "var(--orange-text)", fontWeight: 700 }}>▲ +28,55 %</span>
                </td>
                <td className="num divider">33,0 %</td>
                <td className="num cell-prev">31,6 %</td>
                <td className="num">
                  <span style={{ color: "var(--orange-text)", fontWeight: 700 }}>▲ +1,4 %</span>
                </td>
              </tr>
              <tr className="kpi-line">
                <td className="label-cell">
                  <strong>= Valeur Ajoutée</strong>
                </td>
                <td className="num cell-money">
                  <strong>1 597 682 €</strong>
                </td>
                <td className="num cell-prev">
                  <strong>1 324 826 €</strong>
                </td>
                <td className="num cell-diff">
                  <strong>▲ +20,60 %</strong>
                </td>
                <td className="num divider cell-money">
                  <strong>67,0 %</strong>
                </td>
                <td className="num cell-prev">
                  <strong>68,4 %</strong>
                </td>
                <td className="num cell-diff">
                  <strong>▼ -1,4 %</strong>
                </td>
              </tr>
              <tr>
                <td className="label-cell">- Charges de personnel</td>
                <td className="num">- 286 152 €</td>
                <td className="num cell-prev">- 232 440 €</td>
                <td className="num">
                  <span style={{ color: "var(--orange-text)", fontWeight: 700 }}>▲ +23,11 %</span>
                </td>
                <td className="num divider">12,0 %</td>
                <td className="num cell-prev">12,0 %</td>
                <td className="num">
                  <span style={{ color: "var(--navy-300)" }}>— 0,0 %</span>
                </td>
              </tr>
              <tr>
                <td className="label-cell">- Impôts et taxes</td>
                <td className="num">- 47 692 €</td>
                <td className="num cell-prev">- 38 740 €</td>
                <td className="num">
                  <span style={{ color: "var(--orange-text)", fontWeight: 700 }}>▲ +23,11 %</span>
                </td>
                <td className="num divider">2,0 %</td>
                <td className="num cell-prev">2,0 %</td>
                <td className="num">
                  <span style={{ color: "var(--navy-300)" }}>— 0,0 %</span>
                </td>
              </tr>
              <tr className="kpi-line">
                <td className="label-cell">
                  <strong>= EBE</strong>
                </td>
                <td className="num cell-money">
                  <strong>1 263 838 €</strong>
                </td>
                <td className="num cell-prev">
                  <strong>1 053 646 €</strong>
                </td>
                <td className="num cell-diff">
                  <strong>▲ +19,95 %</strong>
                </td>
                <td className="num divider cell-money">
                  <strong>53,0 %</strong>
                </td>
                <td className="num cell-prev">
                  <strong>54,4 %</strong>
                </td>
                <td className="num cell-diff">
                  <strong>▼ -1,4 %</strong>
                </td>
              </tr>
              <tr>
                <td className="label-cell">- Dotations aux amortissements</td>
                <td className="num">- 24 000 €</td>
                <td className="num cell-prev">- 22 000 €</td>
                <td className="num">
                  <span style={{ color: "var(--orange-text)", fontWeight: 700 }}>▲ +9,09 %</span>
                </td>
                <td className="num divider">1,0 %</td>
                <td className="num cell-prev">1,1 %</td>
                <td className="num">
                  <span className="up">▼ -0,1 %</span>
                </td>
              </tr>
              <tr>
                <td className="label-cell">+ Reprises sur provisions</td>
                <td className="num">0 €</td>
                <td className="num cell-prev">0 €</td>
                <td className="num">
                  <span style={{ color: "var(--navy-300)" }}>— 0 %</span>
                </td>
                <td className="num divider">0,0 %</td>
                <td className="num cell-prev">0,0 %</td>
                <td className="num">
                  <span style={{ color: "var(--navy-300)" }}>— 0,0 %</span>
                </td>
              </tr>
              <tr className="kpi-line">
                <td className="label-cell">
                  <strong>= Résultat d&apos;exploitation</strong>
                </td>
                <td className="num cell-money">
                  <strong>1 239 838 €</strong>
                </td>
                <td className="num cell-prev">
                  <strong>1 031 646 €</strong>
                </td>
                <td className="num cell-diff">
                  <strong>▲ +20,18 %</strong>
                </td>
                <td className="num divider cell-money">
                  <strong>52,0 %</strong>
                </td>
                <td className="num cell-prev">
                  <strong>53,3 %</strong>
                </td>
                <td className="num cell-diff">
                  <strong>▼ -1,3 %</strong>
                </td>
              </tr>
              <tr>
                <td className="label-cell">+ Produits financiers</td>
                <td className="num">14 400 €</td>
                <td className="num cell-prev">10 800 €</td>
                <td className="num">
                  <span className="up" style={{ fontWeight: 700 }}>
                    ▲ +33,33 %
                  </span>
                </td>
                <td className="num divider">0,6 %</td>
                <td className="num cell-prev">0,6 %</td>
                <td className="num">
                  <span style={{ color: "var(--navy-300)" }}>— 0,0 %</span>
                </td>
              </tr>
              <tr>
                <td className="label-cell">- Charges financières</td>
                <td className="num">- 2 838 €</td>
                <td className="num cell-prev">- 3 446 €</td>
                <td className="num">
                  <span className="up" style={{ fontWeight: 700 }}>
                    ▼ -17,64 %
                  </span>
                </td>
                <td className="num divider">0,1 %</td>
                <td className="num cell-prev">0,2 %</td>
                <td className="num">
                  <span className="up">▼ -0,1 %</span>
                </td>
              </tr>
              <tr className="kpi-line">
                <td className="label-cell">
                  <strong>= RCAI</strong>
                </td>
                <td className="num cell-money">
                  <strong>1 251 400 €</strong>
                </td>
                <td className="num cell-prev">
                  <strong>1 039 000 €</strong>
                </td>
                <td className="num cell-diff">
                  <strong>▲ +20,44 %</strong>
                </td>
                <td className="num divider cell-money">
                  <strong>52,5 %</strong>
                </td>
                <td className="num cell-prev">
                  <strong>53,7 %</strong>
                </td>
                <td className="num cell-diff">
                  <strong>▼ -1,2 %</strong>
                </td>
              </tr>
              <tr>
                <td className="label-cell">+ Résultat exceptionnel</td>
                <td className="num">0 €</td>
                <td className="num cell-prev">0 €</td>
                <td className="num">
                  <span style={{ color: "var(--navy-300)" }}>— 0 %</span>
                </td>
                <td className="num divider">0,0 %</td>
                <td className="num cell-prev">0,0 %</td>
                <td className="num">
                  <span style={{ color: "var(--navy-300)" }}>— 0,0 %</span>
                </td>
              </tr>
              <tr>
                <td className="label-cell">- Impôt sur les sociétés</td>
                <td className="num">- 293 000 €</td>
                <td className="num cell-prev">- 289 200 €</td>
                <td className="num">
                  <span style={{ color: "var(--orange-text)", fontWeight: 700 }}>▲ +1,31 %</span>
                </td>
                <td className="num divider">12,3 %</td>
                <td className="num cell-prev">14,9 %</td>
                <td className="num">
                  <span className="up">▼ -2,6 %</span>
                </td>
              </tr>
              <tr className="kpi-line kpi-line-final">
                <td className="label-cell">
                  <strong>= Résultat de l&apos;exercice</strong>
                </td>
                <td className="num cell-money">
                  <strong>958 400 €</strong>
                </td>
                <td className="num cell-prev">
                  <strong>749 800 €</strong>
                </td>
                <td className="num cell-diff">
                  <strong>▲ +27,82 %</strong>
                </td>
                <td className="num divider cell-money">
                  <strong>40,2 %</strong>
                </td>
                <td className="num cell-prev">
                  <strong>38,7 %</strong>
                </td>
                <td className="num cell-diff">
                  <strong>▲ +1,5 %</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: "14px 18px",
            background: "var(--ivory)",
            borderLeft: "3px solid var(--gold)",
            borderRadius: "6px",
            fontSize: "12px",
            color: "var(--navy-300)",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "var(--navy)" }}>Lecture :</strong> la marge nette du cabinet
          s&apos;améliore de +1,5 % (40,2 % vs 38,7 %) malgré une légère hausse des consommations
          externes (+1,4 %). L&apos;effet volume et la diminution relative de l&apos;IS compensent
          largement.{" "}
          <strong style={{ color: "var(--navy)" }}>
            Le résultat de l&apos;exercice progresse de +27,82 %
          </strong>{" "}
          en valeur absolue (cumul depuis janvier).
        </div>
      </div>
    </>
  );
}
