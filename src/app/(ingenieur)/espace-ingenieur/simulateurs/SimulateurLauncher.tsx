"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  EUR,
  EUR2,
  calcDonation,
  calcFinancier,
  calcIfi,
  calcPer,
  calcPret,
  calcSuccession,
} from "./calculs";

/**
 * Bouton « Lancer le simulateur » des cartes calculateurs.
 *
 * Portage fidèle de la maquette ingénieur v28 (`page-ing-out-simulateurs`) :
 * la maquette affiche un `.btn .btn-gold` pleinement actif. On reproduit cet
 * état visuel et, au clic, on ouvre une modale contenant un VRAI calculateur
 * fonctionnel (champs éditables + résultats recalculés en direct), propre à
 * chaque simulateur. La modale est fermable par la croix, le bouton « Fermer »,
 * un clic sur l'arrière-plan ou la touche Échap.
 */
export function SimulateurLauncher({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="btn btn-gold sim-btn"
        onClick={() => setOpen(true)}
      >
        Lancer le simulateur
      </button>

      {open ? (
        <div
          className="sim-modal-overlay"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="sim-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Simulateur ${title}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sim-modal-header">
              <div className="sim-modal-eyebrow">Simulateur · calculateur</div>
              <div className="sim-modal-title">{title}</div>
              <button
                type="button"
                className="sim-modal-close"
                aria-label="Fermer"
                onClick={() => setOpen(false)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>
            <div className="sim-modal-body">
              <div className="sim-modal-desc">{description}</div>
              <Calculateur id={id} />
              <div className="sim-modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setOpen(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ── Aiguillage vers le bon calculateur ─────────────────────────────────── */

function Calculateur({ id }: { id: string }) {
  switch (id) {
    case "financier":
      return <CalcFinancier />;
    case "pret-immo":
      return <CalcPret />;
    case "ifi":
      return <CalcIfi />;
    case "donation":
      return <CalcDonation />;
    case "succession":
      return <CalcSuccession />;
    case "per":
      return <CalcPer />;
    default:
      return null;
  }
}

/* ── Briques de formulaire ───────────────────────────────────────────────── */

function Field({
  label,
  value,
  onChange,
  suffix,
  step = 100,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
  min?: number;
}) {
  return (
    <label className="sim-field">
      <span className="sim-field-label">{label}</span>
      <span className="sim-field-input">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          step={step}
          onChange={(e) => onChange(e.target.valueAsNumber || 0)}
        />
        {suffix ? <span className="sim-field-suffix">{suffix}</span> : null}
      </span>
    </label>
  );
}

function Result({
  rows,
  highlight,
}: {
  rows: { label: string; value: ReactNode }[];
  highlight?: { label: string; value: ReactNode };
}) {
  return (
    <div className="sim-result">
      {highlight ? (
        <div className="sim-result-hl">
          <span>{highlight.label}</span>
          <strong>{highlight.value}</strong>
        </div>
      ) : null}
      {rows.map((r) => (
        <div key={r.label} className="sim-result-row">
          <span>{r.label}</span>
          <strong>{r.value}</strong>
        </div>
      ))}
    </div>
  );
}

/* ── Investissement financier ────────────────────────────────────────────── */

function CalcFinancier() {
  const [capital, setCapital] = useState(10_000);
  const [versement, setVersement] = useState(200);
  const [taux, setTaux] = useState(5);
  const [annees, setAnnees] = useState(15);

  const r = calcFinancier({ capital, versement, taux, annees });

  return (
    <div className="sim-calc">
      <Field label="Capital de départ" value={capital} onChange={setCapital} suffix="€" step={1000} />
      <Field label="Versement mensuel" value={versement} onChange={setVersement} suffix="€" step={50} />
      <Field label="Taux annuel" value={taux} onChange={setTaux} suffix="%" step={0.1} />
      <Field label="Horizon" value={annees} onChange={setAnnees} suffix="ans" step={1} min={1} />
      <Result
        highlight={{ label: "Valeur finale estimée", value: EUR.format(r.valeurFinale) }}
        rows={[
          { label: "Total versé", value: EUR.format(r.totalVerse) },
          { label: "Intérêts générés", value: EUR.format(r.interets) },
        ]}
      />
    </div>
  );
}

/* ── Prêt immobilier ─────────────────────────────────────────────────────── */

function CalcPret() {
  const [montant, setMontant] = useState(250_000);
  const [taux, setTaux] = useState(3.5);
  const [duree, setDuree] = useState(20);
  const [assurance, setAssurance] = useState(0.34);

  const r = calcPret({ montant, taux, duree, assurance });

  return (
    <div className="sim-calc">
      <Field label="Montant emprunté" value={montant} onChange={setMontant} suffix="€" step={5000} />
      <Field label="Taux nominal" value={taux} onChange={setTaux} suffix="%" step={0.05} />
      <Field label="Durée" value={duree} onChange={setDuree} suffix="ans" step={1} min={1} />
      <Field label="Assurance (taux annuel)" value={assurance} onChange={setAssurance} suffix="%" step={0.01} />
      <Result
        highlight={{ label: "Mensualité totale", value: EUR2.format(r.mensualiteTotale) }}
        rows={[
          { label: "Dont assurance", value: EUR2.format(r.mensualiteAssurance) },
          { label: "Coût du crédit (intérêts)", value: EUR.format(r.coutCredit) },
          { label: "Coût total (avec assurance)", value: EUR.format(r.coutTotal) },
          { label: "TAEG estimé", value: `${r.taeg.toFixed(2)} %` },
        ]}
      />
    </div>
  );
}

/* ── IFI ─────────────────────────────────────────────────────────────────── */

function CalcIfi() {
  const [patrimoineNet, setPatrimoine] = useState(2_000_000);
  const r = calcIfi({ patrimoineNet });

  return (
    <div className="sim-calc">
      <Field
        label="Patrimoine immobilier net taxable"
        value={patrimoineNet}
        onChange={setPatrimoine}
        suffix="€"
        step={50_000}
      />
      <Result
        highlight={{
          label: r.du ? "IFI dû (barème 2024)" : "IFI non dû",
          value: r.du ? EUR.format(r.impot) : "—",
        }}
        rows={[
          {
            label: "Seuil d'imposition",
            value: patrimoineNet >= 1_300_000 ? "atteint (≥ 1,3 M€)" : "non atteint",
          },
        ]}
      />
    </div>
  );
}

/* ── Donation ────────────────────────────────────────────────────────────── */

function CalcDonation() {
  const [montant, setMontant] = useState(150_000);
  const [dejaUtilise, setDeja] = useState(0);
  const r = calcDonation({ montant, abattementDejaUtilise: dejaUtilise });

  return (
    <div className="sim-calc">
      <Field label="Montant de la donation" value={montant} onChange={setMontant} suffix="€" step={5000} />
      <Field
        label="Abattement déjà utilisé (15 ans)"
        value={dejaUtilise}
        onChange={setDeja}
        suffix="€"
        step={5000}
      />
      <Result
        highlight={{ label: "Droits de donation (ligne directe)", value: EUR.format(r.droits) }}
        rows={[
          { label: "Abattement restant", value: EUR.format(r.abattementRestant) },
          { label: "Base taxable", value: EUR.format(r.baseTaxable) },
        ]}
      />
    </div>
  );
}

/* ── Succession ──────────────────────────────────────────────────────────── */

function CalcSuccession() {
  const [partNette, setPart] = useState(400_000);
  const r = calcSuccession({ partNette });

  return (
    <div className="sim-calc">
      <Field
        label="Part nette de l'héritier (ligne directe)"
        value={partNette}
        onChange={setPart}
        suffix="€"
        step={10_000}
      />
      <Result
        highlight={{ label: "Droits de succession", value: EUR.format(r.droits) }}
        rows={[
          { label: "Abattement", value: EUR.format(100_000) },
          { label: "Base taxable", value: EUR.format(r.baseTaxable) },
        ]}
      />
    </div>
  );
}

/* ── PER ─────────────────────────────────────────────────────────────────── */

function CalcPer() {
  const [versementAnnuel, setVersement] = useState(4_000);
  const [tmi, setTmi] = useState(30);
  const [annees, setAnnees] = useState(20);
  const [rendement, setRendement] = useState(4);
  const r = calcPer({ versementAnnuel, tmi, annees, rendement });

  return (
    <div className="sim-calc">
      <Field label="Versement annuel" value={versementAnnuel} onChange={setVersement} suffix="€" step={500} />
      <Field label="Tranche marginale (TMI)" value={tmi} onChange={setTmi} suffix="%" step={1} />
      <Field label="Durée jusqu'à la retraite" value={annees} onChange={setAnnees} suffix="ans" step={1} min={1} />
      <Field label="Rendement annuel" value={rendement} onChange={setRendement} suffix="%" step={0.1} />
      <Result
        highlight={{ label: "Capital estimé à la sortie", value: EUR.format(r.capitalTerme) }}
        rows={[
          { label: "Économie d'impôt annuelle", value: EUR.format(r.economieAnnuelle) },
          { label: "Économie d'impôt cumulée", value: EUR.format(r.economieTotale) },
          { label: "Total versé", value: EUR.format(r.totalVerse) },
        ]}
      />
    </div>
  );
}
