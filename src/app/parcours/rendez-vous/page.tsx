import "../_styles/agenda-calendly.css";
import BookingClient from "./BookingClient";

export default function Page() {
  return (
    <div className="maq-rdv">
      <div className="page">
        {/* Header marque */}
        <div className="brand-header">
          <div>
            <div className="brand-logo">
              <div className="brand-logo-mark">A</div>
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
