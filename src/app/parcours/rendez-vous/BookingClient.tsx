"use client";

import { useMemo, useState } from "react";

import { bookRdv } from "./actions";

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const SLOTS_MORNING = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
const SLOTS_AFTERNOON = [
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

const TODAY = new Date(2026, 4, 14); // 14 mai 2026

type Slot = { time: string; available: boolean };

function getSlotsForDay(date: Date): Slot[] {
  const day = date.getDay();
  if (day === 0 || day === 6) return []; // weekend
  const slots = [...SLOTS_MORNING, ...SLOTS_AFTERNOON];
  const seed = date.getDate();
  return slots.map((s) => ({
    time: s,
    available: (seed + s.charCodeAt(0)) % 5 !== 0,
  }));
}

function addOneHour(t: string): string {
  const [h, m] = t.split(":").map(Number);
  return (
    String((h + 1) % 24).padStart(2, "0") + ":" + String(m).padStart(2, "0")
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function BookingClient() {
  const [currentMonth, setCurrentMonth] = useState(4); // mai 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [referral, setReferral] = useState("");
  const [consentRecord, setConsentRecord] = useState(false);

  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    date: string;
    time: string;
    email: string;
    visioUrl: string;
    dciUrl: string;
    emailSent: boolean;
    emailError: string | null;
  } | null>(null);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    let startWeekday = firstDay.getDay(); // 0=dim
    startWeekday = startWeekday === 0 ? 6 : startWeekday - 1; // lun=0

    const cells: Array<
      | { type: "empty" }
      | {
          type: "day";
          day: number;
          dateObj: Date;
          isToday: boolean;
          isPast: boolean;
          isWeekend: boolean;
        }
    > = [];

    for (let i = 0; i < startWeekday; i++) {
      cells.push({ type: "empty" });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const isToday = dateObj.toDateString() === TODAY.toDateString();
      const isPast = dateObj < TODAY && !isToday;
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
      cells.push({ type: "day", day: d, dateObj, isToday, isPast, isWeekend });
    }

    return cells;
  }, [currentMonth, currentYear]);

  function selectDate(date: Date) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  const slots = selectedDate ? getSlotsForDay(selectedDate) : [];

  const formValid = Boolean(
    firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      consentRecord &&
      selectedDate &&
      selectedSlot,
  );

  async function confirmBooking() {
    if (!selectedDate || !selectedSlot || submitting) return;
    setErrorMsg(null);
    const dayStr = capitalize(
      selectedDate.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
    const timeStr = `${selectedSlot} – ${addOneHour(selectedSlot)} · 1 heure`;

    setSubmitting(true);
    const res = await bookRdv({
      firstName,
      lastName,
      email: email.trim(),
      referral,
      dateLabel: dayStr,
      timeLabel: `${selectedSlot} – ${addOneHour(selectedSlot)}`,
    });
    setSubmitting(false);

    if (!res.ok) {
      setErrorMsg(res.reason);
      return;
    }
    setConfirmation({
      date: dayStr,
      time: timeStr,
      email: email.trim(),
      visioUrl: res.visioUrl,
      dciUrl: res.dciUrl,
      emailSent: res.emailSent,
      emailError: res.emailError,
    });
    setConfirmed(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const slotsTitle = selectedDate
    ? capitalize(
        selectedDate.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
      )
    : "Sélectionnez une date";

  const summaryDayStr = selectedDate
    ? capitalize(
        selectedDate.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      )
    : "";

  return (
    <>
      {/* Vue principale */}
      {!confirmed && (
        <div id="bookingView">
          {/* Carte conseiller */}
          <div className="advisor-card">
            <div className="advisor-photo">LT</div>
            <div>
              <div className="advisor-info-name">Luc THILLIEZ</div>
              <div className="advisor-info-role">
                Ingénieur Patrimonial · Cabinet Paris Étoile
              </div>
              <div className="advisor-info-cabinet">
                62 avenue des Champs-Élysées · 75008 Paris
              </div>
              <div className="meeting-pill">
                <svg className="meeting-pill-icon" viewBox="0 0 24 24">
                  <path d="M12 1a11 11 0 100 22 11 11 0 000-22zm5 12h-5V6h2v5h3v2z" />
                </svg>
                Entretien initial
                <span className="meeting-pill-sep"></span>1 heure
                <span className="meeting-pill-sep"></span>Visioconférence
                <span className="meeting-pill-sep"></span>Sans engagement
              </div>
            </div>
          </div>

          {/* Layout calendrier + formulaire */}
          <div className="booking-grid">
            {/* Colonne gauche · calendrier */}
            <div className="booking-col booking-col-left">
              <div className="col-title">
                Choisissez une date et un horaire
              </div>
              <div className="col-subtitle">
                Disponibilités · fuseau Europe/Paris
              </div>

              <div className="cal-month-nav">
                <div className="cal-month-name" id="monthName">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </div>
                <div className="cal-nav-btns">
                  <button className="cal-nav-btn" onClick={prevMonth}>
                    ‹
                  </button>
                  <button className="cal-nav-btn" onClick={nextMonth}>
                    ›
                  </button>
                </div>
              </div>

              <div className="cal-grid" id="calGrid">
                <div className="cal-weekday">Lun</div>
                <div className="cal-weekday">Mar</div>
                <div className="cal-weekday">Mer</div>
                <div className="cal-weekday">Jeu</div>
                <div className="cal-weekday">Ven</div>
                <div className="cal-weekday">Sam</div>
                <div className="cal-weekday">Dim</div>
                {calendarCells.map((cell, i) => {
                  if (cell.type === "empty") {
                    return <div key={`e${i}`} className="cal-day empty"></div>;
                  }
                  const classes = ["cal-day"];
                  if (cell.isPast) classes.push("past");
                  else if (cell.isWeekend) classes.push("weekend");
                  else classes.push("available");
                  if (cell.isToday) classes.push("today");
                  if (
                    selectedDate &&
                    cell.dateObj.toDateString() === selectedDate.toDateString()
                  )
                    classes.push("selected");
                  const clickable = !cell.isPast && !cell.isWeekend;
                  return (
                    <div
                      key={`d${cell.day}`}
                      className={classes.join(" ")}
                      onClick={
                        clickable ? () => selectDate(cell.dateObj) : undefined
                      }
                    >
                      {cell.day}
                    </div>
                  );
                })}
              </div>

              <div className="slots-zone">
                <div className="slots-label">Créneaux disponibles</div>
                <div className="slots-selected-day" id="slotsTitle">
                  {slotsTitle}
                </div>
                <div id="slotsContainer">
                  {!selectedDate ? (
                    <div className="slots-empty">
                      Cliquez sur une date dans le calendrier pour voir les
                      créneaux disponibles.
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="slots-empty">
                      Aucun créneau disponible ce jour-là.
                    </div>
                  ) : (
                    <div className="slots-grid">
                      {slots.map((s) => {
                        const slotClasses = ["slot"];
                        if (!s.available) slotClasses.push("unavailable");
                        if (selectedSlot === s.time)
                          slotClasses.push("selected");
                        return (
                          <div
                            key={s.time}
                            className={slotClasses.join(" ")}
                            onClick={
                              s.available
                                ? () => setSelectedSlot(s.time)
                                : undefined
                            }
                          >
                            {s.time}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne droite · formulaire prospect */}
            <div className="booking-col">
              <div className="col-title">Vos coordonnées</div>
              <div className="col-subtitle">
                Pour confirmer le rendez-vous et vous l&apos;envoyer par e-mail
              </div>

              {/* Récap sélection */}
              {!selectedDate || !selectedSlot ? (
                <div className="summary-card empty" id="summaryCard">
                  <em>
                    Votre date et votre créneau s&apos;afficheront ici une fois
                    sélectionnés.
                  </em>
                </div>
              ) : (
                <div className="summary-card" id="summaryCard">
                  <div className="summary-line">
                    <span className="summary-icon">📅</span>
                    <strong>{summaryDayStr}</strong>
                  </div>
                  <div className="summary-line">
                    <span className="summary-icon">🕐</span>de{" "}
                    <strong>{selectedSlot}</strong> à{" "}
                    <strong>{addOneHour(selectedSlot)}</strong> · fuseau
                    Europe/Paris
                  </div>
                </div>
              )}

              <div className="fields-row">
                <div className="form-field">
                  <label className="field-label" htmlFor="firstName">
                    Prénom<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="field-input"
                    id="firstName"
                    placeholder="Bertrand"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="field-label" htmlFor="lastName">
                    Nom<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="field-input"
                    id="lastName"
                    placeholder="DUPONT-TOPIN"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label" htmlFor="email">
                  Adresse e-mail<span className="required">*</span>
                </label>
                <input
                  type="email"
                  className="field-input"
                  id="email"
                  placeholder="bertrand.dupont@email.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="field-help">
                  Nous y enverrons la confirmation et le lien de visioconférence
                </div>
              </div>

              <div className="form-field">
                <label className="field-label" htmlFor="referral">
                  Recommandé par qui ?
                </label>
                <input
                  type="text"
                  className="field-input"
                  id="referral"
                  placeholder="Nom de la personne, du cabinet, du site…"
                  value={referral}
                  onChange={(e) => setReferral(e.target.value)}
                />
                <div className="field-help">
                  Ce champ nous aide à mieux préparer notre échange · facultatif
                </div>
              </div>

              {/* Bloc consentement */}
              <div className="consent-block">
                <div className="consent-title">
                  <svg className="consent-title-icon" viewBox="0 0 24 24">
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-5h2v2h-2zm0-8h2v6h-2z" />
                  </svg>
                  Enregistrement de l&apos;entretien
                </div>
                <div className="consent-text">
                  ASTRAEOS exerce une activité réglementée de Conseil en
                  Investissement Financier (CIF) et de Courtage en Assurance.
                  Cet entretien sera enregistré dans le seul but de garantir la
                  qualité et la traçabilité de l&apos;accompagnement qui vous est
                  proposé. L&apos;enregistrement est strictement réservé à un
                  usage interne et n&apos;est communiqué à aucun tiers. Si la
                  collaboration ne se concrétise pas, l&apos;enregistrement et
                  l&apos;ensemble des données partagées seront supprimés
                  conformément à la loi n° 78-17 du 6 janvier 1978 modifiée et au
                  Règlement (UE) 2016/679 (RGPD).
                </div>
                <label className="consent-checkbox-row">
                  <input
                    type="checkbox"
                    id="consentRecord"
                    checked={consentRecord}
                    onChange={(e) => setConsentRecord(e.target.checked)}
                  />
                  <span className="consent-checkbox-label">
                    Je consens expressément à l&apos;enregistrement de
                    l&apos;entretien et au traitement de mes données dans les
                    conditions exposées ci-dessus.
                  </span>
                </label>
              </div>

              <button
                className="btn-confirm"
                id="confirmBtn"
                onClick={confirmBooking}
                disabled={!formValid || submitting}
              >
                {submitting ? "Confirmation en cours…" : "Confirmer le rendez-vous"}
              </button>
              {errorMsg && (
                <div style={{ marginTop: 10, color: "#8B3A2A", fontSize: 13 }}>
                  {errorMsg}
                </div>
              )}
            </div>
          </div>

          <div className="legal-footer">
            ASTRAEOS · SAS au capital de 10 000 € · SIREN 948 742 903 · ORIAS
            23004036
            <br />
            <a href="#">Mentions légales</a> ·{" "}
            <a href="#">Politique de confidentialité</a> ·{" "}
            <a href="#">Liste Bloctel</a>
          </div>
        </div>
      )}

      {/* Vue confirmation */}
      <div
        className={`confirmation-view${confirmed ? " active" : ""}`}
        id="confirmationView"
      >
        <div className="conf-check">✓</div>
        <div className="conf-title">Votre rendez-vous est confirmé</div>
        <div className="conf-text">
          {confirmation?.emailSent ? (
            <>
              Un e-mail de confirmation vient d&apos;être envoyé à{" "}
              <strong id="confEmail">{confirmation?.email}</strong>, contenant le
              lien de visioconférence pour l&apos;entretien ainsi qu&apos;un
              document de collecte d&apos;informations à compléter. Vous pouvez
              aussi y accéder directement ci-dessous.
            </>
          ) : (
            <>
              Votre rendez-vous est enregistré. L&apos;e-mail à{" "}
              <strong id="confEmail">{confirmation?.email}</strong> n&apos;a pas
              pu être envoyé{confirmation?.emailError ? ` (${confirmation.emailError})` : ""}.
              Utilisez les liens ci-dessous pour le jour de l&apos;entretien.
            </>
          )}
        </div>
        <div className="conf-details">
          <div className="conf-details-row">
            <strong>Date</strong>
            <span id="confDate">{confirmation?.date}</span>
          </div>
          <div className="conf-details-row">
            <strong>Heure</strong>
            <span id="confTime">{confirmation?.time}</span>
          </div>
          <div className="conf-details-row">
            <strong>Durée</strong>
            <span>1 heure</span>
          </div>
          <div className="conf-details-row">
            <strong>Modalité</strong>
            <span>Visioconférence · lien ci-dessous et par e-mail</span>
          </div>
          <div className="conf-details-row">
            <strong>Conseiller</strong>
            <span>Luc THILLIEZ · Cabinet Paris Étoile</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            margin: "24px 0 8px",
          }}
        >
          <a
            href={confirmation?.visioUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "13px 26px",
              background: "#C8A55C",
              color: "#0B1C35",
              fontWeight: 600,
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            Rejoindre la visioconférence
          </a>
          <a
            href={confirmation?.dciUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "13px 26px",
              background: "#fff",
              color: "#0B1C35",
              fontWeight: 600,
              border: "1px solid #C8A55C",
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            Compléter mon document de collecte
          </a>
        </div>
        <div className="conf-next">
          Pensez à compléter le document de collecte que vous allez recevoir par
          e-mail avant notre échange.
          <br />
          Sans ce document complété, l&apos;entretien ne pourra pas se maintenir.
        </div>
      </div>
    </>
  );
}
