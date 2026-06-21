import type { RiskProfile } from "../../../_data/risk-profile";

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

/**
 * Carte « Profil de risque » de la fiche prospect. Affiche le profil synthétique
 * calculé, le détail question → réponse du questionnaire de qualification,
 * l'horizon, le bloc ESG et la mention de certification. Server Component :
 * reçoit un RiskProfile déjà décodé depuis la soumission kind='qualification'.
 *
 * Styles repris du dossier fiche prospect (classes .card / .fp-* / .s1b-* déjà
 * chargées par la page) pour rester iso-visuel ; les quelques éléments propres
 * à cette carte sont stylés en inline avec les variables du thème ingénieur.
 */
export default function RiskProfileCard({ profile }: { profile: RiskProfile }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <IconShield />
          Profil de risque
        </div>
        <span className={`s1b-doc-status ${profile.certifie ? "ok" : "wait"}`}>
          {profile.certifie ? "Questionnaire certifié" : "Certification en attente"}
        </span>
      </div>
      <div className="card-body fp-card-body">
        <div
          style={{
            padding: "14px 16px",
            marginBottom: "16px",
            background: "var(--gold-100)",
            border: "1px solid var(--gold)",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--gold-deep)",
              marginBottom: "4px",
            }}
          >
            Profil détecté
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--navy-700, var(--medium-400))" }}>
            {profile.profileLabel}
          </div>
          {profile.horizonLabel ? (
            <div style={{ fontSize: "11.5px", color: "var(--navy-300)", marginTop: "4px" }}>
              Horizon : {profile.horizonLabel}
            </div>
          ) : null}
        </div>

        {profile.answers.length > 0 ? (
          <div className="fp-identite-block">
            <div className="fp-identite-eyebrow">Réponses au questionnaire</div>
            <div className="fp-identite-grid">
              {profile.answers.map((a) => (
                <Row key={a.question}>
                  <span>{a.question}</span>
                  <strong>{a.answer}</strong>
                </Row>
              ))}
            </div>
          </div>
        ) : null}

        <div className="fp-identite-block">
          <div className="fp-identite-eyebrow">Préférences extra-financières (ESG)</div>
          {profile.esg.actif ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11.5px" }}>
              {profile.esg.privilegier.length > 0 ? (
                <EsgLine tone="ok" label="À privilégier" items={profile.esg.privilegier} />
              ) : null}
              {profile.esg.eviter.length > 0 ? (
                <EsgLine tone="ko" label="À éviter" items={profile.esg.eviter} />
              ) : null}
              {profile.esg.privilegier.length === 0 && profile.esg.eviter.length === 0 ? (
                <div style={{ color: "var(--navy-300)" }}>
                  Critères ESG activés, sans secteur précisé.
                </div>
              ) : null}
            </div>
          ) : (
            <div style={{ fontSize: "11.5px", color: "var(--navy-300)" }}>
              Aucune préférence extra-financière exprimée.
            </div>
          )}
        </div>

        <div className="fp-info-box">
          <strong>Information :</strong> profil calculé à partir des réponses
          déclarées par le prospect. À recouper avec l&apos;entretien de
          qualification avant toute préconisation.
        </div>
      </div>
    </div>
  );
}

function EsgLine({ tone, label, items }: { tone: "ok" | "ko"; label: string; items: string[] }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
      <span className={`s1b-doc-status ${tone === "ok" ? "ok" : "not-sent"}`}>{label}</span>
      <span>{items.join(", ")}</span>
    </div>
  );
}

/** Wrapper neutre : les enfants restent des cellules directes de la grille. */
function Row({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
