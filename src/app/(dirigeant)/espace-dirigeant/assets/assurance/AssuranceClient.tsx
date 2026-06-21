"use client";
// Espace dirigeant — composant client (interactions de l'écran : onglets,
// filtres, drawers, popovers…). Port fidèle de la maquette 020.
// Voir PORT-FRONT-DIRIGEANT.md et la doc Obsidian espace-dirigeant.

import { useRouter } from "next/navigation";

export function AssuranceClient() {
  const router = useRouter();

  const detailParisEtoile = () =>
    alert(
      "Détail Cabinet Paris Étoile · Assurance :\n\n" +
        "· 58 contrats actifs\n" +
        "  - 28 emprunteur immo\n" +
        "  - 10 emprunteur prêt conso\n" +
        "  - 8 prévoyance pro\n" +
        "  - 7 mutuelle dirigeant\n" +
        "  - 5 homme clé\n" +
        "· Primes perçues : 462 000 €\n" +
        "· Frais de dossiers PRIVEOS : 78 200 €\n" +
        "  - Émilie LAMBERT a placé : 38 contrats / 52 000 €\n" +
        "  - Julien VASSEUR a placé : 20 contrats / 26 200 €\n" +
        "· Récurrence PRIVEOS : 18 400 €",
    );

  return (
    <>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Assets du cabinet · assurance</div>
          <h1 className="hero-title">
            <strong>Assurance</strong>
          </h1>
          <p className="hero-sub">
            Détail réseau des contrats d&apos;assurance distribués via le module multi-compagnies
            (emprunteur immo, prêt conso, prévoyance pro, mutuelle dirigeant, homme clé). Apports
            d&apos;affaires PRIVEOS sur les commissions distribuées.
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => router.push("/espace-dirigeant")}
          >
            ← Retour accueil
          </button>
          <button className="btn btn-gold btn-sm">Exporter</button>
        </div>
      </div>

      <div className="kpis kpis-4 mb-20">
        <div className="kpi">
          <div className="kpi-label">Contrats actifs</div>
          <div className="kpi-value">412</div>
          <div className="kpi-meta">tous types confondus · réseau</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Primes perçues réseau</div>
          <div className="kpi-value">
            3 200 000 <span className="unit">€</span>
          </div>
          <div className="kpi-meta">total issu du réseau · annualisé</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Frais de dossiers perçus par le cabinet</div>
          <div className="kpi-value gold">
            504 000 <span className="unit">€</span>
          </div>
          <div className="kpi-meta">cumul depuis janvier 2026</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Récurrence perçue par PRIVEOS</div>
          <div className="kpi-value gold">
            128 600 <span className="unit">€</span>
          </div>
          <div className="kpi-meta">cumul depuis janvier 2026</div>
        </div>
      </div>

      <div className="card mb-24">
        <div className="card-header">
          <div className="card-title">
            <svg>
              <use href="#i-business" />
            </svg>
            Classement par ingénieur · qui rapporte le plus en assurance
          </div>
          <span style={{ fontSize: "11px", color: "var(--navy-300)" }}>
            cumul depuis janvier 2026
          </span>
        </div>
        <table className="dt">
          <thead>
            <tr>
              <th>Cabinet</th>
              <th className="num">Contrats actifs</th>
              <th className="num">
                Frais de dossiers perçus par le cabinet
                <br />
                <span style={{ fontWeight: 400, color: "var(--navy-300)" }}>
                  cumul depuis janvier 2026 · cabinet
                </span>
              </th>
              <th className="num">
                Récurrence perçue par le cabinet
                <br />
                <span style={{ fontWeight: 400, color: "var(--navy-300)" }}>
                  cumul depuis janvier
                </span>
              </th>
              <th className="num">
                Récurrence perçue par PRIVEOS
                <br />
                <span style={{ fontWeight: 400, color: "var(--navy-300)" }}>
                  cumul depuis janvier
                </span>
              </th>
              <th className="num">
                Total flux PRIVEOS
                <br />
                <span style={{ fontWeight: 400, color: "var(--navy-300)" }}>
                  cumul depuis janvier
                </span>
              </th>
              <th>Évolution N-1</th>
            </tr>
          </thead>
          <tbody>
            <tr className="dt-clickable" onClick={detailParisEtoile}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <div className="tlogo tlogo-sm tlogo-priveos">PE</div>
                  <div className="cell-primary">Cabinet Paris Étoile</div>
                </div>
              </td>
              <td className="num">58</td>
              <td className="num cell-money">462 000 €</td>
              <td className="num cell-money gold">78 200 €</td>
              <td className="num cell-money">18 400 €</td>
              <td className="num cell-money gold">96 600 €</td>
              <td>
                <span className="up">▲ +16 %</span>
              </td>
            </tr>
            <tr className="dt-clickable">
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <div className="tlogo tlogo-sm tlogo-1">LD</div>
                  <div className="cell-primary">Cabinet Lyon Défense</div>
                </div>
              </td>
              <td className="num">48</td>
              <td className="num cell-money">388 000 €</td>
              <td className="num cell-money gold">62 400 €</td>
              <td className="num cell-money">15 200 €</td>
              <td className="num cell-money gold">77 600 €</td>
              <td>
                <span className="up">▲ +12 %</span>
              </td>
            </tr>
            <tr className="dt-clickable">
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <div className="tlogo tlogo-sm tlogo-2">PV</div>
                  <div className="cell-primary">Cabinet Paris Vendôme</div>
                </div>
              </td>
              <td className="num">42</td>
              <td className="num cell-money">328 000 €</td>
              <td className="num cell-money gold">52 800 €</td>
              <td className="num cell-money">13 400 €</td>
              <td className="num cell-money gold">66 200 €</td>
              <td>
                <span className="up">▲ +10 %</span>
              </td>
            </tr>
            <tr className="dt-clickable">
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <div className="tlogo tlogo-sm tlogo-3">BC</div>
                  <div className="cell-primary">Cabinet Bordeaux Centre</div>
                </div>
              </td>
              <td className="num">36</td>
              <td className="num cell-money">274 000 €</td>
              <td className="num cell-money gold">42 600 €</td>
              <td className="num cell-money">11 200 €</td>
              <td className="num cell-money gold">53 800 €</td>
              <td>
                <span className="up">▲ +8 %</span>
              </td>
            </tr>
            <tr className="dt-clickable">
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <div className="tlogo tlogo-sm tlogo-pro">SO</div>
                  <div className="cell-primary">Cabinet Strasbourg Orangerie</div>
                </div>
              </td>
              <td className="num">32</td>
              <td className="num cell-money">238 000 €</td>
              <td className="num cell-money gold">36 800 €</td>
              <td className="num cell-money">9 600 €</td>
              <td className="num cell-money gold">46 400 €</td>
              <td>
                <span className="up">▲ +7 %</span>
              </td>
            </tr>
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
                … 25 autres cabinets ·{" "}
                <a style={{ color: "var(--gold)", fontWeight: 700, cursor: "pointer" }}>
                  Voir tous (30)
                </a>
              </td>
            </tr>
            <tr style={{ background: "var(--gold-200)", fontWeight: 700 }}>
              <td>
                <strong>Total réseau</strong>
              </td>
              <td className="num">412</td>
              <td className="num cell-money">3 200 000 €</td>
              <td className="num cell-money">504 000 €</td>
              <td className="num cell-money">128 600 €</td>
              <td className="num cell-money gold">632 600 €</td>
              <td>
                <span className="up">▲ +14 %</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Top produits assurance */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg>
              <use href="#i-quality" />
            </svg>
            Top produits assurance · placés par le cabinet
          </div>
        </div>
        <table className="dt" style={{ fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Compagnies</th>
              <th className="num">Contrats 2026</th>
              <th className="num">Primes perçues réseau</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Assurance emprunteur immo</strong>
              </td>
              <td>5 partenaires</td>
              <td className="num cell-money gold">182</td>
              <td className="num cell-money">1 420 000 €</td>
            </tr>
            <tr>
              <td>
                <strong>Prévoyance professionnelle</strong>
              </td>
              <td>4 partenaires</td>
              <td className="num">128</td>
              <td className="num cell-money">980 000 €</td>
            </tr>
            <tr>
              <td>
                <strong>Mutuelle dirigeant</strong>
              </td>
              <td>4 partenaires</td>
              <td className="num">102</td>
              <td className="num cell-money">580 000 €</td>
            </tr>
            <tr>
              <td>
                <strong>Assurance emprunteur prêt conso</strong>
              </td>
              <td>3 partenaires</td>
              <td className="num">68</td>
              <td className="num cell-money">142 000 €</td>
            </tr>
            <tr>
              <td>
                <strong>Assurance homme clé</strong>
              </td>
              <td>3 partenaires</td>
              <td className="num">42</td>
              <td className="num cell-money">86 000 €</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
