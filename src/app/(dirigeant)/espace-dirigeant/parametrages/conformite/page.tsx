import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Conformité juridique" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Conformité juridique" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Administration · paramétrages cabinet · 6/8</div>
            <h1 className="hero-title">
              Conformité &amp; <strong>juridique</strong>
            </h1>
            <p className="hero-sub">
              Politique LCB-FT, gestion du DPO, conformité RGPD, documents légaux du cabinet (RC
              Pro, CGV, conditions d&apos;agrément ORIAS) et rendez-vous d&apos;audit avec PRIVEOS.
              Ces paramètres garantissent la conformité réglementaire du Cabinet Paris Étoile.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-ghost btn-sm">Annuler</button>
            <button className="btn btn-gold btn-sm">Enregistrer les modifications</button>
          </div>
        </div>

        {/* KPIs conformité */}
        <div className="kpis kpis-4 mb-20">
          <div className="kpi">
            <div className="kpi-label">Statut conformité du cabinet</div>
            <div className="kpi-value gold">
              100 <span className="unit">%</span>
            </div>
            <div className="kpi-meta">5 ingénieurs conformes</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Documents légaux</div>
            <div className="kpi-value">12</div>
            <div className="kpi-meta">à jour · v2026</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Prochain audit</div>
            <div className="kpi-value" style={{ fontSize: "18px" }}>
              15/06/2026
            </div>
            <div className="kpi-meta">audit interne ORIAS</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Alertes en cours</div>
            <div className="kpi-value">0</div>
            <div className="kpi-meta">aucune anomalie détectée</div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "18px",
            marginBottom: "18px",
          }}
        >
          {/* Bloc 1 : LCB-FT */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-shield" />
                </svg>
                Politique LCB-FT
              </div>
              <span className="badge badge-success" style={{ fontSize: "10px" }}>
                Active
              </span>
            </div>
            <div className="card-body" style={{ padding: "20px 22px" }}>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "var(--navy-300)",
                  lineHeight: "1.55",
                  marginBottom: "14px",
                }}
              >
                Politique de lutte contre le blanchiment d&apos;argent et le financement du
                terrorisme. S&apos;applique aux clients du Cabinet Paris Étoile lors de
                l&apos;entrée en relation.
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--ivory-deep)",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--navy)" }}>
                    KYC obligatoire avant 1ère étude
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>
                    Vérification identité &amp; justificatifs domicile
                  </div>
                </div>
                <span style={{ fontSize: "11.5px", color: "#2EA85A", fontWeight: 700 }}>
                  ● Activé
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--ivory-deep)",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--navy)" }}>
                    Vérification PEP (politiquement exposé)
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>
                    Via Netheos · contrôle automatique
                  </div>
                </div>
                <span style={{ fontSize: "11.5px", color: "#2EA85A", fontWeight: 700 }}>
                  ● Activé
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--ivory-deep)",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--navy)" }}>
                    Listes de sanctions internationales
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>
                    UE, ONU, OFAC · MAJ quotidienne
                  </div>
                </div>
                <span style={{ fontSize: "11.5px", color: "#2EA85A", fontWeight: 700 }}>
                  ● Activé
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--navy)" }}>
                    Re-KYC périodique clients
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>
                    Tous les 24 mois
                  </div>
                </div>
                <span style={{ fontSize: "11.5px", color: "#2EA85A", fontWeight: 700 }}>
                  ● Activé
                </span>
              </div>
            </div>
          </div>

          {/* Bloc 2 : DPO + RGPD */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-team" />
                </svg>
                DPO &amp; conformité RGPD
              </div>
              <span className="badge badge-success" style={{ fontSize: "10px" }}>
                Conforme
              </span>
            </div>
            <div className="card-body" style={{ padding: "20px 22px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  background: "var(--ivory)",
                  borderRadius: "8px",
                  marginBottom: "14px",
                }}
              >
                <div
                  className="ingenieur-avatar"
                  style={{ width: "42px", height: "42px", fontSize: "14px" }}
                >
                  SH
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--navy)" }}>
                    Sandrine HERVÉ
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>
                    DPO PRIVEOS Capital · sandrine.herve@email-test.fr
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontSize: "10px" }}>
                  Désigné CNIL
                </span>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "var(--navy-300)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Durée de conservation des données client
                </label>
                <select
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid var(--navy-100)",
                    borderRadius: "6px",
                    fontFamily: "inherit",
                    fontSize: "13px",
                    color: "var(--navy)",
                    background: "white",
                  }}
                >
                  <option>5 ans après fin de relation (obligation légale CIF)</option>
                </select>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    color: "var(--navy-300)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Délai de réponse aux demandes RGPD
                </label>
                <select
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid var(--navy-100)",
                    borderRadius: "6px",
                    fontFamily: "inherit",
                    fontSize: "13px",
                    color: "var(--navy)",
                    background: "white",
                  }}
                >
                  <option>30 jours (délai légal)</option>
                </select>
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "var(--navy-300)",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--ivory-deep)",
                }}
              >
                <strong style={{ color: "var(--navy)" }}>Registre des traitements :</strong> 8
                traitements actifs · dernière MAJ <strong>02/05/2026</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Bloc 3 : Documents légaux */}
        <div className="card mb-18">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-doc" />
              </svg>
              Documents légaux du réseau
            </div>
            <button className="btn btn-ghost btn-sm">+ Ajouter un document</button>
          </div>
          <table className="dt" style={{ fontSize: "12.5px" }}>
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Version</th>
                <th>Dernière MAJ</th>
                <th>Validité</th>
                <th className="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>RC Pro · Generali</strong>
                </td>
                <td style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
                  Police d&apos;assurance · 2 000 000 € par sinistre
                </td>
                <td>v2026</td>
                <td className="nowrap" style={{ fontSize: "11.5px" }}>
                  15/01/2026
                </td>
                <td className="nowrap">
                  <span className="badge badge-success" style={{ fontSize: "10px" }}>
                    Valide jusqu&apos;au 31/12/2026
                  </span>
                </td>
                <td className="center">
                  <button className="btn btn-ghost btn-sm">Voir</button>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>CGV PRIVEOS Capital</strong>
                </td>
                <td style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
                  Conditions générales de vente
                </td>
                <td>v3.2</td>
                <td className="nowrap" style={{ fontSize: "11.5px" }}>
                  05/03/2026
                </td>
                <td className="nowrap">
                  <span className="badge badge-success" style={{ fontSize: "10px" }}>
                    En vigueur
                  </span>
                </td>
                <td className="center">
                  <button className="btn btn-ghost btn-sm">Voir</button>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Conditions d&apos;agrément ORIAS</strong>
                </td>
                <td style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
                  Statuts CIF, IAS, CIP, IOBSP
                </td>
                <td>v2026</td>
                <td className="nowrap" style={{ fontSize: "11.5px" }}>
                  10/01/2026
                </td>
                <td className="nowrap">
                  <span className="badge badge-success" style={{ fontSize: "10px" }}>
                    Valide jusqu&apos;au 31/12/2026
                  </span>
                </td>
                <td className="center">
                  <button className="btn btn-ghost btn-sm">Voir</button>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Convention de licence cabinet</strong>
                </td>
                <td style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
                  Contrat type signé par chaque cabinet
                </td>
                <td>v4.1</td>
                <td className="nowrap" style={{ fontSize: "11.5px" }}>
                  22/02/2026
                </td>
                <td className="nowrap">
                  <span className="badge badge-success" style={{ fontSize: "10px" }}>
                    En vigueur
                  </span>
                </td>
                <td className="center">
                  <button className="btn btn-ghost btn-sm">Voir</button>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Politique de confidentialité</strong>
                </td>
                <td style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
                  RGPD · usage public
                </td>
                <td>v2.0</td>
                <td className="nowrap" style={{ fontSize: "11.5px" }}>
                  12/04/2026
                </td>
                <td className="nowrap">
                  <span className="badge badge-success" style={{ fontSize: "10px" }}>
                    En vigueur
                  </span>
                </td>
                <td className="center">
                  <button className="btn btn-ghost btn-sm">Voir</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bloc 4 : Calendrier audits */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-calendar" />
              </svg>
              Rendez-vous d&apos;audit avec PRIVEOS
            </div>
            <span style={{ fontSize: "11px", color: "var(--navy-300)", fontStyle: "italic" }}>
              internes &amp; externes
            </span>
          </div>
          <table className="dt" style={{ fontSize: "12.5px" }}>
            <thead>
              <tr>
                <th>Date prévue</th>
                <th>Type d&apos;audit</th>
                <th>Périmètre</th>
                <th>Auditeur</th>
                <th className="center">Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="nowrap" style={{ fontWeight: 700, color: "var(--gold)" }}>
                  15/06/2026
                </td>
                <td>
                  <strong>Audit interne ORIAS</strong>
                </td>
                <td>5 ingénieurs · KYC + LCB-FT</td>
                <td>Sandrine HERVÉ (DPO)</td>
                <td className="center">
                  <span
                    className="badge"
                    style={{
                      background: "rgba(198,142,14,0.15)",
                      color: "var(--gold-deep)",
                      fontSize: "10px",
                    }}
                  >
                    Planifié
                  </span>
                </td>
              </tr>
              <tr>
                <td className="nowrap">22/09/2026</td>
                <td>
                  <strong>Audit externe AMF</strong>
                </td>
                <td>Cabinet · CIF</td>
                <td>Cabinet Mazars</td>
                <td className="center">
                  <span
                    className="badge"
                    style={{
                      background: "rgba(198,142,14,0.15)",
                      color: "var(--gold-deep)",
                      fontSize: "10px",
                    }}
                  >
                    Planifié
                  </span>
                </td>
              </tr>
              <tr>
                <td className="nowrap">15/12/2026</td>
                <td>
                  <strong>Audit RGPD CNIL</strong>
                </td>
                <td>Cabinet + 5 cabinets pilotes</td>
                <td>Sandrine HERVÉ (DPO)</td>
                <td className="center">
                  <span
                    className="badge"
                    style={{
                      background: "rgba(198,142,14,0.15)",
                      color: "var(--gold-deep)",
                      fontSize: "10px",
                    }}
                  >
                    Planifié
                  </span>
                </td>
              </tr>
              <tr style={{ opacity: 0.55 }}>
                <td className="nowrap">10/02/2026</td>
                <td>
                  <strong>Audit interne ORIAS</strong>
                </td>
                <td>5 ingénieurs · KYC + LCB-FT</td>
                <td>Sandrine HERVÉ (DPO)</td>
                <td className="center">
                  <span className="badge badge-success" style={{ fontSize: "10px" }}>
                    Réalisé · OK
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
