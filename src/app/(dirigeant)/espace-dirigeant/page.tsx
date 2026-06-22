// Espace dirigeant — Accueil cabinet.
// Port fidèle hardcodé de la maquette 020 (reference/wireframes-dirigeant.html,
// lignes 2291-2660). Route : /espace-dirigeant/
// Méthode + carte des écrans : PORT-FRONT-DIRIGEANT.md
// Doc : vault Obsidian ASTRAEOS/doc-technique/espace-dirigeant.md
import Link from "next/link";
import { DirigeantTopbar } from "../_components/DirigeantTopbar";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Accueil cabinet" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Accueil cabinet" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">
              Tableau de bord · Cabinet Paris Étoile · 8e arrondissement · Mardi 12 mai 2026
            </div>
            <h1 className="hero-title">
              Bienvenue <strong>Luc</strong>,
            </h1>
            <p className="hero-sub">
              Luc THILLIEZ dirige le Cabinet Paris Étoile accompagné de 4 ingénieurs
              patrimoniaux · cette vue donne accès aux indicateurs de performance, au compte
              de résultat, à la trésorerie et au pilotage de l&apos;équipe.
            </p>
          </div>
          <div className="hero-actions">
            <span style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
              Comité hebdo équipe ·{" "}
              <strong style={{ color: "var(--gold)" }}>15 mai 2026</strong>
            </span>
          </div>
        </div>

        {/* SECTION 1 · SYNTHÈSE DU CABINET (bandeau navy) */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Synthèse · revenus perçus sur la période</div>
              <div className="section-title" style={{ fontSize: "26px" }}>
                <strong>Synthèse du Cabinet Paris Étoile</strong>
              </div>
            </div>
            <span style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
              Mis à jour aujourd&apos;hui · 09h12
            </span>
          </div>

          <div
            style={{
              background:
                "linear-gradient(135deg, var(--navy) 0%, var(--navy-deep, var(--navy)) 100%)",
              color: "white",
              padding: "30px 36px",
              borderRadius: "10px",
              marginBottom: "14px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "200px",
                height: "200px",
                background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)",
                opacity: 0.15,
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: "48px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--gold-300)",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Total perçu par le cabinet · cumul depuis janvier
                </div>
                <div
                  style={{
                    fontFamily: "'Epilogue', sans-serif",
                    fontSize: "36px",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                    color: "white",
                  }}
                >
                  1 091 100
                  <span
                    style={{
                      fontSize: "20px",
                      color: "var(--gold-300)",
                      fontWeight: 600,
                      marginLeft: "4px",
                    }}
                  >
                    €
                  </span>
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Honoraires études <strong style={{ color: "white" }}>162 400 €</strong> ·
                  Apports d&apos;affaires <strong style={{ color: "white" }}>928 700 €</strong>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 0,
                marginTop: "24px",
                padding: "18px 0",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ padding: "0 22px" }}>
                <div
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.55)",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  Revenu perçu · mois en cours
                </div>
                <div
                  style={{
                    fontFamily: "'Epilogue',sans-serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    marginTop: "6px",
                  }}
                >
                  87 200 €
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.5)",
                    marginTop: "3px",
                  }}
                >
                  Mai 2026 · 12 jours écoulés
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "14px",
                    marginTop: "8px",
                    paddingTop: "8px",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "8.5px",
                        color: "rgba(255,255,255,0.45)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      M-1
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#7BE5A3",
                        fontWeight: 700,
                        marginTop: "1px",
                      }}
                    >
                      ▲ +9,2 %
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "8.5px",
                        color: "rgba(255,255,255,0.45)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      N-1
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#7BE5A3",
                        fontWeight: 700,
                        marginTop: "1px",
                      }}
                    >
                      ▲ +21,4 %
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: "0 22px",
                  borderLeft: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.55)",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  Revenu perçu · trimestre en cours
                </div>
                <div
                  style={{
                    fontFamily: "'Epilogue',sans-serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    marginTop: "6px",
                  }}
                >
                  272 400 €
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.5)",
                    marginTop: "3px",
                  }}
                >
                  T2 2026 · avr-mai en cours
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "14px",
                    marginTop: "8px",
                    paddingTop: "8px",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "8.5px",
                        color: "rgba(255,255,255,0.45)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      T-1
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#7BE5A3",
                        fontWeight: 700,
                        marginTop: "1px",
                      }}
                    >
                      ▲ +11,8 %
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "8.5px",
                        color: "rgba(255,255,255,0.45)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      N-1
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#7BE5A3",
                        fontWeight: 700,
                        marginTop: "1px",
                      }}
                    >
                      ▲ +18,6 %
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: "0 22px",
                  borderLeft: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.55)",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  Revenu perçu · an cumulé
                </div>
                <div
                  style={{
                    fontFamily: "'Epilogue',sans-serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "var(--gold-300)",
                    marginTop: "6px",
                  }}
                >
                  1 091 100 €
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.5)",
                    marginTop: "3px",
                  }}
                >
                  janv-mai cumulé
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "14px",
                    marginTop: "8px",
                    paddingTop: "8px",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "8.5px",
                        color: "rgba(255,255,255,0.45)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      N-1
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#7BE5A3",
                        fontWeight: 700,
                        marginTop: "1px",
                      }}
                    >
                      ▲ +16,4 %
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "8.5px",
                        color: "rgba(255,255,255,0.45)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      N-2
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#7BE5A3",
                        fontWeight: 700,
                        marginTop: "1px",
                      }}
                    >
                      ▲ +34,2 %
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "18px",
                paddingTop: "14px",
                borderTop: "1px solid rgba(255,255,255,0.15)",
                fontSize: "11.5px",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Le Cabinet Paris Étoile représente{" "}
              <strong style={{ color: "var(--gold-300)" }}>21,4 %</strong> du chiffre
              d&apos;affaires généré par le top 5 du réseau ASTRAEOS.
            </div>
          </div>
        </div>

        {/* SECTION · SANTÉ DU CABINET (pleine largeur · gauge + 4 mini-KPIs en ligne) */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Vue 360° · cabinet en bonne santé</div>
              <div className="section-title">
                <strong>Santé du cabinet</strong>
              </div>
            </div>
            <span style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
              4 ingénieurs en santé · 1 à surveiller
            </span>
          </div>

          <div className="card" style={{ padding: "24px 28px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: "32px",
                alignItems: "center",
              }}
            >
              {/* Gauge gauche */}
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "inline-block", position: "relative" }}>
                  <svg width="160" height="160" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="84"
                      fill="none"
                      stroke="var(--ivory-deep)"
                      strokeWidth="14"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="84"
                      fill="none"
                      stroke="var(--gold)"
                      strokeWidth="14"
                      strokeDasharray="528"
                      strokeDashoffset="58"
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Epilogue', sans-serif",
                        fontWeight: 700,
                        fontSize: "42px",
                        color: "var(--navy)",
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      89
                      <span
                        style={{
                          fontSize: "18px",
                          color: "var(--gold-deep)",
                          fontWeight: 600,
                        }}
                      >
                        /100
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "var(--gold)",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        marginTop: "6px",
                      }}
                    >
                      Cabinet
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 mini-KPIs en ligne */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    padding: "16px 18px",
                    background: "var(--ivory)",
                    borderRadius: "8px",
                    border: "1px solid var(--ivory-deep)",
                  }}
                >
                  <div className="kpi-label" style={{ fontSize: "10px" }}>
                    Satisfaction client
                  </div>
                  <div
                    style={{
                      fontFamily: "'Epilogue', sans-serif",
                      fontWeight: 700,
                      fontSize: "26px",
                      color: "var(--navy)",
                      marginTop: "6px",
                    }}
                  >
                    4,8{" "}
                    <span
                      style={{ fontSize: "13px", color: "var(--navy-300)", fontWeight: 600 }}
                    >
                      / 5
                    </span>
                  </div>
                  <div
                    style={{ fontSize: "10.5px", color: "var(--navy-300)", marginTop: "4px" }}
                  >
                    14 retours clients · 2026
                  </div>
                </div>
                <div
                  style={{
                    padding: "16px 18px",
                    background: "var(--ivory)",
                    borderRadius: "8px",
                    border: "1px solid var(--ivory-deep)",
                  }}
                >
                  <div className="kpi-label" style={{ fontSize: "10px" }}>
                    Conformité réglementaire
                  </div>
                  <div
                    style={{
                      fontFamily: "'Epilogue', sans-serif",
                      fontWeight: 700,
                      fontSize: "26px",
                      color: "var(--navy)",
                      marginTop: "6px",
                    }}
                  >
                    96{" "}
                    <span
                      style={{ fontSize: "13px", color: "var(--navy-300)", fontWeight: 600 }}
                    >
                      %
                    </span>
                  </div>
                  <div
                    style={{ fontSize: "10.5px", color: "var(--navy-300)", marginTop: "4px" }}
                  >
                    KYC + LCB-FT à jour
                  </div>
                </div>
                <div
                  style={{
                    padding: "16px 18px",
                    background: "var(--ivory)",
                    borderRadius: "8px",
                    border: "1px solid var(--ivory-deep)",
                  }}
                >
                  <div className="kpi-label" style={{ fontSize: "10px" }}>
                    Formation continue
                  </div>
                  <div
                    style={{
                      fontFamily: "'Epilogue', sans-serif",
                      fontWeight: 700,
                      fontSize: "26px",
                      color: "var(--navy)",
                      marginTop: "6px",
                    }}
                  >
                    85{" "}
                    <span
                      style={{ fontSize: "13px", color: "var(--navy-300)", fontWeight: 600 }}
                    >
                      %
                    </span>
                  </div>
                  <div
                    style={{ fontSize: "10.5px", color: "var(--navy-300)", marginTop: "4px" }}
                  >
                    heures réglementaires faites
                  </div>
                </div>
                <div
                  style={{
                    padding: "16px 18px",
                    background: "var(--ivory)",
                    borderRadius: "8px",
                    border: "1px solid var(--ivory-deep)",
                  }}
                >
                  <div className="kpi-label" style={{ fontSize: "10px" }}>
                    Activité commerciale
                  </div>
                  <div
                    style={{
                      fontFamily: "'Epilogue', sans-serif",
                      fontWeight: 700,
                      fontSize: "26px",
                      color: "var(--navy)",
                      marginTop: "6px",
                    }}
                  >
                    94{" "}
                    <span
                      style={{ fontSize: "13px", color: "var(--navy-300)", fontWeight: 600 }}
                    >
                      %
                    </span>
                  </div>
                  <div
                    style={{ fontSize: "10.5px", color: "var(--navy-300)", marginTop: "4px" }}
                  >
                    objectif 2026 réalisé
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 · ACTIVITÉ DU CABINET (parcours patrimonial 6 étapes) */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">
                Parcours patrimonial · 5 ingénieurs contributeurs
              </div>
              <div className="section-title">
                <strong>L&apos;activité du cabinet</strong>
              </div>
            </div>
            <span style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
              Mis à jour 12/05/2026 · 09h12
            </span>
          </div>

          <div className="pipeline-stepper-v1">
            <Link href="/espace-dirigeant/parcours/prospects" className="stepper-item-v1">
              <div className="stepper-badge-v1" data-step="01">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                >
                  <circle cx="13" cy="13" r="8.5" strokeWidth="1.8" />
                  <path
                    d="M13 8.5 L 14 11.5 L 17 12 L 14.5 14 L 15 17 L 13 15.5 L 11 17 L 11.5 14 L 9 12 L 12 11.5 Z"
                    fill="currentColor"
                  />
                  <line x1="19.2" y1="19.2" x2="25" y2="25" strokeWidth="2.2" />
                </svg>
              </div>
              <div className="stepper-label-v1">Prospects actifs</div>
              <div className="stepper-count-v1">24</div>
            </Link>
            <Link href="/espace-dirigeant/parcours/compliance" className="stepper-item-v1">
              <div className="stepper-badge-v1" data-step="02">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                >
                  <path d="M16 3 L 6 6 L 6 15 C 6 21 11 26 16 28 C 21 26 26 21 26 15 L 26 6 Z" />
                  <polyline points="11.5 15.5 14.5 18.5 20.5 12" strokeWidth="2.4" />
                </svg>
              </div>
              <div className="stepper-label-v1">Compliance validée</div>
              <div className="stepper-count-v1">3</div>
            </Link>
            <Link href="/espace-dirigeant/parcours/collecte" className="stepper-item-v1">
              <div className="stepper-badge-v1" data-step="03">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                >
                  <path d="M4 9 L 13 9 L 15.5 12 L 28 12 L 28 25 C 28 26 27 27 26 27 L 6 27 C 5 27 4 26 4 25 Z" />
                  <rect x="11" y="6" width="10" height="12" rx="0.8" fill="white" />
                  <line x1="13" y1="9" x2="19" y2="9" />
                </svg>
              </div>
              <div className="stepper-label-v1">Collecte docs</div>
              <div className="stepper-count-v1">5</div>
            </Link>
            <Link
              href="/espace-dirigeant/parcours/etudes"
              className="stepper-item-v1 active"
            >
              <div className="stepper-badge-v1" data-step="04">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="26" height="26" rx="2" />
                  <polyline points="6 22 11 17 14 19 18 13 22 14 26 8" strokeWidth="2" />
                  <circle cx="11" cy="17" r="1.6" fill="currentColor" />
                  <circle cx="14" cy="19" r="1.6" fill="currentColor" />
                  <circle cx="18" cy="13" r="1.6" fill="currentColor" />
                  <circle cx="22" cy="14" r="1.6" fill="currentColor" />
                  <circle cx="26" cy="8" r="2" fill="currentColor" />
                </svg>
              </div>
              <div className="stepper-label-v1">Études en cours</div>
              <div className="stepper-count-v1">7</div>
            </Link>
            <Link href="/espace-dirigeant/parcours/restituees" className="stepper-item-v1">
              <div className="stepper-badge-v1" data-step="05">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                >
                  <path d="M7 4 L 19 4 L 25 10 L 25 28 L 7 28 Z" />
                  <polyline points="19 4 19 10 25 10" />
                  <circle cx="22" cy="24" r="4.2" fill="white" />
                  <polyline points="20 24 21.5 25.5 24 22.5" strokeWidth="1.8" />
                </svg>
              </div>
              <div className="stepper-label-v1">Études restituées</div>
              <div className="stepper-count-v1">14</div>
            </Link>
            <Link href="/espace-dirigeant/parcours/suivi" className="stepper-item-v1">
              <div className="stepper-badge-v1" data-step="06">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                >
                  <circle cx="16" cy="16" r="10.5" />
                  <circle cx="16" cy="16" r="7" />
                  <circle cx="16" cy="16" r="3.5" />
                  <circle cx="16" cy="16" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div className="stepper-label-v1">Clients en suivi</div>
              <div className="stepper-count-v1">28</div>
            </Link>
          </div>
        </div>

        {/* SECTION 3 · SOURCES DE REVENU DU CABINET · 4 cartes en 2x2 compactes */}
        <div className="section-block">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">
                Synthèse par source · revenus perçus par le cabinet
              </div>
              <div className="section-title">
                <strong>Sources de revenu du cabinet</strong>
              </div>
            </div>
            <span style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
              Cumul depuis janvier 2026
            </span>
          </div>

          {/* Grille 2x2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {/* Bloc 1 · Investissement financier */}
            <div
              className="card"
              style={{
                background: "white",
                border: "1px solid var(--navy-100)",
                borderLeft: "4px solid var(--gold)",
                padding: "18px 22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--ivory-deep)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
                      borderRadius: "10px",
                      display: "grid",
                      placeItems: "center",
                      color: "white",
                      boxShadow: "0 3px 8px rgba(198,142,14,0.22)",
                    }}
                  >
                    <svg
                      style={{ width: "20px", height: "20px" }}
                      viewBox="0 0 32 32"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 26 L 4 12 L 10 12 L 10 26 Z" fill="white" fillOpacity="0.25" />
                      <path d="M13 26 L 13 8 L 19 8 L 19 26 Z" fill="white" fillOpacity="0.5" />
                      <path d="M22 26 L 22 4 L 28 4 L 28 26 Z" fill="white" fillOpacity="0.85" />
                      <line x1="2" y1="28" x2="30" y2="28" strokeWidth="2.4" />
                    </svg>
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--navy)" }}>
                    Investissement financier
                  </div>
                </div>
                <Link
                  href="/espace-dirigeant/finance"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: "10.5px", padding: "6px 10px" }}
                >
                  Détail →
                </Link>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    background: "var(--ivory)",
                    borderRadius: "5px",
                    padding: "10px 12px",
                  }}
                >
                  <div className="kpi-label" style={{ marginBottom: "4px", fontSize: "9.5px" }}>
                    Frais d&apos;entrée perçus
                  </div>
                  <div
                    style={{
                      fontFamily: "'Epilogue',sans-serif",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
                    185 000{" "}
                    <span style={{ fontSize: "11px", color: "var(--gold-deep)" }}>€</span>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--navy)",
                      lineHeight: 1.6,
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "var(--navy-300)" }}>Mois</span>
                      <span>
                        <strong>15 400 €</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>
                          ▲ +9 %
                        </span>
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "var(--navy-300)" }}>Trim.</span>
                      <span>
                        <strong>46 200 €</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>
                          ▲ +12 %
                        </span>
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "3px",
                        borderTop: "1px dashed var(--ivory-deep)",
                      }}
                    >
                      <span style={{ color: "var(--gold-deep)", fontWeight: 700 }}>An</span>
                      <span>
                        <strong style={{ color: "var(--gold-deep)" }}>185 000 €</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>
                          ▲ +16 %
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: "var(--ivory)",
                    borderRadius: "5px",
                    padding: "10px 12px",
                  }}
                >
                  <div className="kpi-label" style={{ marginBottom: "4px", fontSize: "9.5px" }}>
                    Récurrence perçue
                  </div>
                  <div
                    style={{
                      fontFamily: "'Epilogue',sans-serif",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
                    48 700{" "}
                    <span style={{ fontSize: "11px", color: "var(--gold-deep)" }}>€</span>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--navy)",
                      lineHeight: 1.6,
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "var(--navy-300)" }}>Mois</span>
                      <span>
                        <strong>4 050 €</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>
                          ▲ +5 %
                        </span>
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "var(--navy-300)" }}>Trim.</span>
                      <span>
                        <strong>12 175 €</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>
                          ▲ +8 %
                        </span>
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "3px",
                        borderTop: "1px dashed var(--ivory-deep)",
                      }}
                    >
                      <span style={{ color: "var(--gold-deep)", fontWeight: 700 }}>An</span>
                      <span>
                        <strong style={{ color: "var(--gold-deep)" }}>48 700 €</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>
                          ▲ +11 %
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloc 2 · Assurance */}
            <div
              className="card"
              style={{
                background: "white",
                border: "1px solid var(--navy-100)",
                borderLeft: "4px solid var(--gold)",
                padding: "18px 22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--ivory-deep)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
                      borderRadius: "10px",
                      display: "grid",
                      placeItems: "center",
                      color: "white",
                      boxShadow: "0 3px 8px rgba(198,142,14,0.22)",
                    }}
                  >
                    <svg
                      style={{ width: "20px", height: "20px" }}
                      viewBox="0 0 32 32"
                      fill="white"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        d="M16 3 L 6 6 L 6 15 C 6 21 11 26 16 28 C 21 26 26 21 26 15 L 26 6 Z"
                        fill="white"
                        fillOpacity="0.95"
                        stroke="none"
                      />
                      <polyline
                        points="11 15 14.5 18.5 21 12"
                        fill="none"
                        stroke="var(--gold-deep)"
                        strokeWidth="2.6"
                      />
                    </svg>
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--navy)" }}>
                    Assurance
                  </div>
                </div>
                <Link
                  href="/espace-dirigeant/finance"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: "10.5px", padding: "6px 10px" }}
                >
                  Détail →
                </Link>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    background: "var(--ivory)",
                    borderRadius: "5px",
                    padding: "10px 12px",
                  }}
                >
                  <div className="kpi-label" style={{ marginBottom: "4px", fontSize: "9.5px" }}>
                    Nombre de contrats
                  </div>
                  <div
                    style={{
                      fontFamily: "'Epilogue',sans-serif",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
                    38
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--navy)",
                      lineHeight: 1.6,
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "var(--navy-300)" }}>Mois</span>
                      <span>
                        <strong>3 contrats</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>▲ +1</span>
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "var(--navy-300)" }}>Trim.</span>
                      <span>
                        <strong>9 contrats</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>▲ +2</span>
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "3px",
                        borderTop: "1px dashed var(--ivory-deep)",
                      }}
                    >
                      <span style={{ color: "var(--gold-deep)", fontWeight: 700 }}>An</span>
                      <span>
                        <strong style={{ color: "var(--gold-deep)" }}>38 contrats</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>
                          ▲ +14 %
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: "var(--ivory)",
                    borderRadius: "5px",
                    padding: "10px 12px",
                  }}
                >
                  <div className="kpi-label" style={{ marginBottom: "4px", fontSize: "9.5px" }}>
                    Frais d&apos;entrée perçus
                  </div>
                  <div
                    style={{
                      fontFamily: "'Epilogue',sans-serif",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
                    68 400{" "}
                    <span style={{ fontSize: "11px", color: "var(--gold-deep)" }}>€</span>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--navy)",
                      lineHeight: 1.6,
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "var(--navy-300)" }}>Mois</span>
                      <span>
                        <strong>5 700 €</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>
                          ▲ +7 %
                        </span>
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "var(--navy-300)" }}>Trim.</span>
                      <span>
                        <strong>17 100 €</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>
                          ▲ +10 %
                        </span>
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "3px",
                        borderTop: "1px dashed var(--ivory-deep)",
                      }}
                    >
                      <span style={{ color: "var(--gold-deep)", fontWeight: 700 }}>An</span>
                      <span>
                        <strong style={{ color: "var(--gold-deep)" }}>68 400 €</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>
                          ▲ +15 %
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloc 3 · Investissement immobilier */}
            <div
              className="card"
              style={{
                background: "white",
                border: "1px solid var(--navy-100)",
                borderLeft: "4px solid var(--gold)",
                padding: "18px 22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--ivory-deep)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
                      borderRadius: "10px",
                      display: "grid",
                      placeItems: "center",
                      color: "white",
                      boxShadow: "0 3px 8px rgba(198,142,14,0.22)",
                    }}
                  >
                    <svg
                      style={{ width: "20px", height: "20px" }}
                      viewBox="0 0 32 32"
                      fill="white"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        d="M5 11 L 16 4 L 27 11 L 27 27 L 5 27 Z"
                        fill="white"
                        fillOpacity="0.95"
                        stroke="none"
                      />
                      <rect x="9" y="14" width="3.5" height="4.5" fill="var(--gold-deep)" />
                      <rect x="14.25" y="14" width="3.5" height="4.5" fill="var(--gold-deep)" />
                      <rect x="19.5" y="14" width="3.5" height="4.5" fill="var(--gold-deep)" />
                      <rect x="9" y="20.5" width="3.5" height="4.5" fill="var(--gold-deep)" />
                      <rect x="14.25" y="20.5" width="3.5" height="6.5" fill="var(--gold-deep)" />
                      <rect x="19.5" y="20.5" width="3.5" height="4.5" fill="var(--gold-deep)" />
                    </svg>
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--navy)" }}>
                    Investissement immobilier
                  </div>
                </div>
                <Link
                  href="/espace-dirigeant/finance"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: "10.5px", padding: "6px 10px" }}
                >
                  Détail →
                </Link>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    background: "var(--ivory)",
                    borderRadius: "5px",
                    padding: "10px 12px",
                  }}
                >
                  <div
                    className="kpi-label"
                    style={{ marginBottom: "4px", fontSize: "9px", lineHeight: 1.3 }}
                  >
                    Études en cours
                  </div>
                  <div
                    style={{
                      fontFamily: "'Epilogue',sans-serif",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
                    4
                  </div>
                  <div
                    style={{
                      fontSize: "9.5px",
                      color: "var(--navy-300)",
                      marginTop: "4px",
                      lineHeight: 1.5,
                    }}
                  >
                    Mois: <strong style={{ color: "var(--navy)" }}>1</strong> · Trim:{" "}
                    <strong style={{ color: "var(--navy)" }}>3</strong>
                    <br />
                    <span style={{ color: "var(--gold-deep)", fontWeight: 700 }}>
                      An: <strong>9</strong>
                    </span>{" "}
                    <span style={{ color: "var(--green-text)", fontSize: "9px" }}>▲ +5</span>
                  </div>
                </div>
                <div
                  style={{
                    background: "var(--ivory)",
                    borderRadius: "5px",
                    padding: "10px 12px",
                  }}
                >
                  <div
                    className="kpi-label"
                    style={{ marginBottom: "4px", fontSize: "9px", lineHeight: 1.3 }}
                  >
                    Projets réalisés
                  </div>
                  <div
                    style={{
                      fontFamily: "'Epilogue',sans-serif",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
                    2
                  </div>
                  <div
                    style={{
                      fontSize: "9.5px",
                      color: "var(--navy-300)",
                      marginTop: "4px",
                      lineHeight: 1.5,
                    }}
                  >
                    Mois: <strong style={{ color: "var(--navy)" }}>0</strong> · Trim:{" "}
                    <strong style={{ color: "var(--navy)" }}>1</strong>
                    <br />
                    <span style={{ color: "var(--gold-deep)", fontWeight: 700 }}>
                      An: <strong>2</strong>
                    </span>{" "}
                    <span style={{ color: "var(--green-text)", fontSize: "9px" }}>▲ +1</span>
                  </div>
                </div>
                <div
                  style={{
                    background: "var(--ivory)",
                    borderRadius: "5px",
                    padding: "10px 12px",
                  }}
                >
                  <div
                    className="kpi-label"
                    style={{ marginBottom: "4px", fontSize: "9px", lineHeight: 1.3 }}
                  >
                    Rémunération
                  </div>
                  <div
                    style={{
                      fontFamily: "'Epilogue',sans-serif",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
                    32 400{" "}
                    <span style={{ fontSize: "10px", color: "var(--gold-deep)" }}>€</span>
                  </div>
                  <div
                    style={{
                      fontSize: "9.5px",
                      color: "var(--navy-300)",
                      marginTop: "4px",
                      lineHeight: 1.5,
                    }}
                  >
                    Trim: <strong style={{ color: "var(--navy)" }}>16 200 €</strong>
                    <br />
                    <span style={{ color: "var(--gold-deep)", fontWeight: 700 }}>
                      An: <strong>32 400 €</strong>
                    </span>{" "}
                    <span style={{ color: "var(--green-text)", fontSize: "9px" }}>▲ +22 %</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloc 4 · Honoraires de conseil */}
            <div
              className="card"
              style={{
                background: "white",
                border: "1px solid var(--navy-100)",
                borderLeft: "4px solid var(--gold)",
                padding: "18px 22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--ivory-deep)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
                      borderRadius: "10px",
                      display: "grid",
                      placeItems: "center",
                      color: "white",
                      boxShadow: "0 3px 8px rgba(198,142,14,0.22)",
                    }}
                  >
                    <svg
                      style={{ width: "20px", height: "20px" }}
                      viewBox="0 0 32 32"
                      fill="white"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        d="M7 4 L 7 28 L 25 28 L 25 9 L 20 4 Z"
                        fill="white"
                        fillOpacity="0.95"
                        stroke="none"
                      />
                      <line x1="11" y1="12" x2="21" y2="12" stroke="var(--gold-deep)" strokeWidth="1.8" />
                      <line x1="11" y1="16" x2="21" y2="16" stroke="var(--gold-deep)" strokeWidth="1.8" />
                      <line x1="11" y1="20" x2="18" y2="20" stroke="var(--gold-deep)" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--navy)" }}>
                    Honoraires de conseil
                  </div>
                </div>
                <Link
                  href="/espace-dirigeant/finance"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: "10.5px", padding: "6px 10px" }}
                >
                  Détail →
                </Link>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    background: "var(--ivory)",
                    borderRadius: "5px",
                    padding: "10px 12px",
                  }}
                >
                  <div className="kpi-label" style={{ marginBottom: "4px", fontSize: "9.5px" }}>
                    Études réalisées
                  </div>
                  <div
                    style={{
                      fontFamily: "'Epilogue',sans-serif",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
                    14
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--navy)",
                      lineHeight: 1.6,
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "var(--navy-300)" }}>Mois</span>
                      <span>
                        <strong>2 études</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>=</span>
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "var(--navy-300)" }}>Trim.</span>
                      <span>
                        <strong>5 études</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>▲ +1</span>
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "3px",
                        borderTop: "1px dashed var(--ivory-deep)",
                      }}
                    >
                      <span style={{ color: "var(--gold-deep)", fontWeight: 700 }}>An</span>
                      <span>
                        <strong style={{ color: "var(--gold-deep)" }}>14 études</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>
                          ▲ +17 %
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: "var(--ivory)",
                    borderRadius: "5px",
                    padding: "10px 12px",
                  }}
                >
                  <div className="kpi-label" style={{ marginBottom: "4px", fontSize: "9.5px" }}>
                    Honoraires perçus
                  </div>
                  <div
                    style={{
                      fontFamily: "'Epilogue',sans-serif",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
                    162 400{" "}
                    <span style={{ fontSize: "11px", color: "var(--gold-deep)" }}>€</span>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--navy)",
                      lineHeight: 1.6,
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "var(--navy-300)" }}>Mois</span>
                      <span>
                        <strong>22 600 €</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>
                          ▲ +12 %
                        </span>
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "var(--navy-300)" }}>Trim.</span>
                      <span>
                        <strong>58 400 €</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>
                          ▲ +15 %
                        </span>
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "3px",
                        borderTop: "1px dashed var(--ivory-deep)",
                      }}
                    >
                      <span style={{ color: "var(--gold-deep)", fontWeight: 700 }}>An</span>
                      <span>
                        <strong style={{ color: "var(--gold-deep)" }}>162 400 €</strong>{" "}
                        <span style={{ color: "var(--green-text)", fontSize: "9px" }}>
                          ▲ +20 %
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION · CLASSEMENT INGÉNIEURS (50%) + ALERTES CABINET (50%) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          {/* Classement des ingénieurs du cabinet */}
          <div className="card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-team" />
                </svg>
                Classement des ingénieurs du cabinet
              </div>
              <Link href="/espace-dirigeant/ingenieurs" className="btn btn-ghost btn-sm">
                Tous →
              </Link>
            </div>
            <table className="dt" style={{ flex: 1, fontSize: "12px" }}>
              <thead>
                <tr>
                  <th>Ingénieur</th>
                  <th>Rôle</th>
                  <th className="num">CA 2026</th>
                  <th className="num">Études</th>
                </tr>
              </thead>
              <tbody>
                <tr className="dt-clickable">
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        className="ingenieur-avatar"
                        style={{ width: "26px", height: "26px", fontSize: "9px" }}
                      >
                        JV
                      </div>
                      <div className="cell-primary">Julien VASSEUR</div>
                    </div>
                  </td>
                  <td style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>Senior · 8 ans</td>
                  <td className="num cell-money gold">314 000 €</td>
                  <td className="num">6</td>
                </tr>
                <tr
                  className="dt-clickable"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--gold-100) 0%, transparent 50%)",
                  }}
                >
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        className="ingenieur-avatar"
                        style={{
                          width: "26px",
                          height: "26px",
                          fontSize: "9px",
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
                            fontSize: "9px",
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
                  <td style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>
                    Dirigeant-praticien
                  </td>
                  <td className="num cell-money gold">280 000 €</td>
                  <td className="num">4</td>
                </tr>
                <tr className="dt-clickable">
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        className="ingenieur-avatar"
                        style={{ width: "26px", height: "26px", fontSize: "9px" }}
                      >
                        SM
                      </div>
                      <div className="cell-primary">Sophie MERCIER</div>
                    </div>
                  </td>
                  <td style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>5 ans</td>
                  <td className="num cell-money gold">198 000 €</td>
                  <td className="num">4</td>
                </tr>
                <tr className="dt-clickable">
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        className="ingenieur-avatar"
                        style={{ width: "26px", height: "26px", fontSize: "9px" }}
                      >
                        TL
                      </div>
                      <div className="cell-primary">Thomas LEROY</div>
                    </div>
                  </td>
                  <td style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>3 ans</td>
                  <td className="num cell-money gold">156 000 €</td>
                  <td className="num">3</td>
                </tr>
                <tr className="dt-clickable">
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        className="ingenieur-avatar"
                        style={{ width: "26px", height: "26px", fontSize: "9px" }}
                      >
                        CB
                      </div>
                      <div className="cell-primary">Camille BERTRAND</div>
                    </div>
                  </td>
                  <td style={{ fontSize: "10.5px", color: "var(--navy-300)" }}>Junior · 2 ans</td>
                  <td className="num cell-money gold">142 000 €</td>
                  <td className="num">3</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Alertes & points d'attention */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-alert" />
                </svg>
                Alertes &amp; points d&apos;attention du cabinet
              </div>
              <span className="badge badge-orange">5 alertes</span>
            </div>
            <div style={{ padding: 0 }}>
              <div className="alert-item alert-orange">
                <div className="alert-meta">
                  <span className="badge badge-orange badge-dot">Conformité</span>
                  <span>il y a 32 jours</span>
                </div>
                <div className="alert-title">KYC en attente · Famille DELANNOY</div>
                <div className="alert-sub">Document identité non reçu · Julien VASSEUR</div>
              </div>
              <div className="alert-item alert-orange">
                <div className="alert-meta">
                  <span className="badge badge-orange badge-dot">Production</span>
                  <span>retard 3 jours</span>
                </div>
                <div className="alert-title">Étude HUYGHE en retard de production</div>
                <div className="alert-sub">Restitution prévue 15/05 · Julien VASSEUR</div>
              </div>
              <div className="alert-item alert-orange">
                <div className="alert-meta">
                  <span className="badge badge-orange badge-dot">Production</span>
                  <span>retard 8 jours</span>
                </div>
                <div className="alert-title">Étude M. DUBOIS en retard de production</div>
                <div className="alert-sub">Restitution prévue 10/05 · Camille BERTRAND</div>
              </div>
              <div className="alert-item">
                <div className="alert-meta">
                  <span className="badge badge-success badge-dot">Bonne nouvelle</span>
                  <span>il y a 2 jours</span>
                </div>
                <div className="alert-title">
                  Cabinet Paris Étoile dépasse l&apos;objectif T2 (+18 %)
                </div>
                <div className="alert-sub">Top performer du réseau ASTRAEOS</div>
              </div>
              <div className="alert-item alert-info">
                <div className="alert-meta">
                  <span className="badge badge-info badge-dot">Trésorerie</span>
                  <span>aujourd&apos;hui</span>
                </div>
                <div className="alert-title">Encaissements à venir 38 400 € sur 14 jours</div>
                <div className="alert-sub">
                  4 factures · 2 honoraires études · 2 commissions ASTRAEOS
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
