import "../_styles/agenda-calendly.css";
import BookingClient from "./BookingClient";

export default function Page() {
  return (
    <div className="maq-rdv">
      <div className="page">
        <div className="wf-annotation">
          <strong>WIREFRAME · 04 · CALENDLY ASTRAEOS</strong> · Page publique de
          prise de rendez-vous · accessible via le lien partagé par
          l&apos;ingénieur (ex. priveos.com/rdv/luc-thilliez) · première étape du
          parcours client (Avant-01)
        </div>

        {/* Header marque */}
        <div className="brand-header">
          <div>
            <div className="brand-logo">
              <div className="brand-logo-mark">P</div>
              <div>
                <div className="brand-logo-text">ASTRAEOS</div>
                <div className="brand-tagline">
                  CONSEIL EN GESTION DE PATRIMOINE
                </div>
              </div>
            </div>
          </div>
        </div>

        <BookingClient />
      </div>
    </div>
  );
}
