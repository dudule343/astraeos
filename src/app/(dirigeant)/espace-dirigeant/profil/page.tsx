import { DirigeantTopbar } from "../../_components/DirigeantTopbar";
import { ProfilNotificationPrefs } from "./ProfilClient";

export const metadata = { title: "ASTRAEOS · Espace Dirigeant · Profil & agréments" };

export default function Page() {
  return (
    <>
      <DirigeantTopbar current="Profil & agréments" />
      <div className="content">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">Mon profil · Cabinet Paris Étoile · consultation</div>
            <h1 className="hero-title">
              Profil &amp; <strong>agréments</strong>
            </h1>
            <p className="hero-sub">
              Identité personnelle, agréments réglementaires (CIF, IAS, ORIAS, CJA), préférences
              notifications. Les informations réglementaires sont synchronisées avec votre profil
              PRIVEOS · modifications via la tête de réseau.
            </p>
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
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-team" />
                </svg>
                Identité dirigeant
              </div>
            </div>
            <div
              className="card-body"
              style={{ padding: "22px", fontSize: "12.5px", lineHeight: 1.9 }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "6px 14px" }}>
                <span style={{ color: "var(--navy-300)" }}>Nom complet</span>
                <strong>Luc THILLIEZ</strong>
                <span style={{ color: "var(--navy-300)" }}>Rôle</span>
                <strong>Dirigeant-praticien</strong>
                <span style={{ color: "var(--navy-300)" }}>Cabinet</span>
                <strong>Cabinet Paris Étoile · Paris 8e</strong>
                <span style={{ color: "var(--navy-300)" }}>E-mail</span>
                <strong>luc.thilliez@email-test.fr</strong>
                <span style={{ color: "var(--navy-300)" }}>Téléphone</span>
                <strong>+33 1 42 65 80 10</strong>
                <span style={{ color: "var(--navy-300)" }}>Membre PRIVEOS depuis</span>
                <strong>2018</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <svg>
                  <use href="#i-shield" />
                </svg>
                Agréments réglementaires
              </div>
              <span className="badge badge-success" style={{ fontSize: "9.5px" }}>
                Tous à jour
              </span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div
                style={{
                  padding: "12px 22px",
                  borderBottom: "1px solid var(--ivory-deep)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600 }}>
                    CIF · Conseiller en investissements financiers
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--navy-300)" }}>
                    Numéro ANACOFI · renouvelé le 12/01/2026
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontSize: "9.5px" }}>
                  Actif
                </span>
              </div>
              <div
                style={{
                  padding: "12px 22px",
                  borderBottom: "1px solid var(--ivory-deep)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600 }}>
                    IAS · Intermédiaire en assurance
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--navy-300)" }}>
                    Niveau 1 · ORIAS · valable jusqu&apos;au 31/12/2026
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontSize: "9.5px" }}>
                  Actif
                </span>
              </div>
              <div
                style={{
                  padding: "12px 22px",
                  borderBottom: "1px solid var(--ivory-deep)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600 }}>ORIAS · Inscription</div>
                  <div style={{ fontSize: "10px", color: "var(--navy-300)" }}>
                    Numéro 12 345 678 · renouvelée 02/2026
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontSize: "9.5px" }}>
                  Actif
                </span>
              </div>
              <div
                style={{
                  padding: "12px 22px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600 }}>
                    Carte T · transactions immobilières
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--navy-300)" }}>
                    CCI Paris · renouvelée 01/2025 · valide 3 ans
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontSize: "9.5px" }}>
                  Actif
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg>
                <use href="#i-bell" />
              </svg>
              Préférences de notification
            </div>
          </div>
          <ProfilNotificationPrefs />
        </div>
      </div>
    </>
  );
}
