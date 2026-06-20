import { DirigeantTopbar } from "../../../_components/DirigeantTopbar";
import { TresorerieClient } from "./TresorerieClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Trésorerie" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Trésorerie" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Tableau de bord · synthèse financière du cabinet</div>
            <h1 className="hero-title">
              Trésorerie <strong>du cabinet</strong>
            </h1>
            <p className="hero-sub">
              Vision macro de la trésorerie du Cabinet Paris Étoile : solde de fin de période et
              dépenses, comparées sur 4 années. Variation vs période précédente ET vs même période de
              l&apos;année dernière.
            </p>
          </div>
          <div className="hero-actions">
            <span style={{ fontSize: 11, color: "var(--navy-300)", alignSelf: "center" }}>
              Dernière MAJ · 09/05/2026 · 11:51
            </span>
          </div>
        </div>

        {/* 4 KPIs hero · solde / dépenses / encaissements / variation */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid var(--navy-100)",
              borderRadius: 10,
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--navy)",
                letterSpacing: "0.06em",
                paddingBottom: 8,
                borderBottom: "2px solid var(--gold)",
                marginBottom: 14,
              }}
            >
              Solde fin de période
            </div>
            <div
              style={{
                fontFamily: "'Epilogue',sans-serif",
                fontWeight: 700,
                fontSize: 24,
                color: "var(--navy)",
              }}
            >
              360 000 €
            </div>
            <div style={{ fontSize: 11, color: "var(--navy-300)", marginTop: 4 }}>
              au 31/05/2026 (cumul)
            </div>
            <div
              style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                padding: "3px 8px",
                background: "rgba(229,124,75,0.12)",
                borderRadius: 3,
                fontSize: 10.5,
                fontWeight: 700,
                color: "var(--orange-text)",
              }}
            >
              ▼ -86 % vs N-1
            </div>
          </div>

          <div
            style={{
              background: "white",
              border: "1px solid var(--navy-100)",
              borderRadius: 10,
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--navy)",
                letterSpacing: "0.06em",
                paddingBottom: 8,
                borderBottom: "2px solid var(--gold)",
                marginBottom: 14,
              }}
            >
              Dépenses cumulées
            </div>
            <div
              style={{
                fontFamily: "'Epilogue',sans-serif",
                fontWeight: 700,
                fontSize: 24,
                color: "var(--navy)",
              }}
            >
              920 000 €
            </div>
            <div style={{ fontSize: 11, color: "var(--navy-300)", marginTop: 4 }}>
              cumul depuis janvier 2026
            </div>
            <div
              style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                padding: "3px 8px",
                background: "rgba(229,124,75,0.12)",
                borderRadius: 3,
                fontSize: 10.5,
                fontWeight: 700,
                color: "var(--orange-text)",
              }}
            >
              ▲ +15 % vs N-1
            </div>
          </div>

          <div
            style={{
              background: "white",
              border: "1px solid var(--navy-100)",
              borderRadius: 10,
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--navy)",
                letterSpacing: "0.06em",
                paddingBottom: 8,
                borderBottom: "2px solid var(--gold)",
                marginBottom: 14,
              }}
            >
              Encaissements cumulés
            </div>
            <div
              style={{
                fontFamily: "'Epilogue',sans-serif",
                fontWeight: 700,
                fontSize: 24,
                color: "var(--navy)",
              }}
            >
              2 098 200 €
            </div>
            <div style={{ fontSize: 11, color: "var(--navy-300)", marginTop: 4 }}>
              cumul depuis janvier 2026
            </div>
            <div
              style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                padding: "3px 8px",
                background: "rgba(46,168,90,0.12)",
                borderRadius: 3,
                fontSize: 10.5,
                fontWeight: 700,
                color: "var(--green-text)",
              }}
            >
              ▲ +23 % vs N-1
            </div>
          </div>

          <div
            style={{
              background: "white",
              border: "1px solid var(--navy-100)",
              borderRadius: 10,
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--navy)",
                letterSpacing: "0.06em",
                paddingBottom: 8,
                borderBottom: "2px solid var(--gold)",
                marginBottom: 14,
              }}
            >
              Délai moyen encaissement
            </div>
            <div
              style={{
                fontFamily: "'Epilogue',sans-serif",
                fontWeight: 700,
                fontSize: 24,
                color: "var(--gold)",
              }}
            >
              28 j
            </div>
            <div style={{ fontSize: 11, color: "var(--navy-300)", marginTop: 4 }}>
              moyenne sur cumul jan-mai
            </div>
            <div
              style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                padding: "3px 8px",
                background: "rgba(46,168,90,0.12)",
                borderRadius: 3,
                fontSize: 10.5,
                fontWeight: 700,
                color: "var(--green-text)",
              }}
            >
              ▼ -3 j vs N-1
            </div>
          </div>
        </div>

        <TresorerieClient />
      </div>
    </>
  );
}
