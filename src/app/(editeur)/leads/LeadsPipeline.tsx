"use client";

import { useState } from "react";

// Pipeline commercial 6 étapes, cliquable (filterLeadsByStep dans la maquette) :
// un seul stepper-item actif à la fois, l'actif reçoit "active filtering".
// État initial = "qualifies" (active filtering dans la maquette).

type Step = {
  key: string;
  icon: string;
  label: string;
  count: string;
  meta: string;
};

const STEPS: Step[] = [
  { key: "a-contacter", icon: "#i-leads", label: "À CONTACTER", count: "182", meta: "~5 460 €/mois potentiels" },
  { key: "contactes", icon: "#i-phone", label: "CONTACTÉS", count: "88", meta: "~2 640 €/mois potentiels" },
  { key: "qualifies", icon: "#i-success", label: "QUALIFIÉS", count: "42", meta: "en attente de passer à l'action" },
  { key: "rdv-planifie", icon: "#i-calendar", label: "RDV PLANIFIÉ", count: "22", meta: "~660 €/mois potentiels" },
  { key: "rdv-fait", icon: "#i-eye", label: "RDV FAIT", count: "14", meta: "démonstrations réalisées" },
  { key: "essai-propose", icon: "#i-trial", label: "ESSAI PROPOSÉ", count: "9", meta: "→ vers Période d'essai" },
];

export function LeadsPipeline() {
  const [active, setActive] = useState("qualifies");

  return (
    <div className="pipeline-6">
      {STEPS.map((step) => (
        <div
          key={step.key}
          className={`stepper-item${step.key === active ? " active filtering" : ""}`}
          onClick={() => setActive(step.key)}
          style={{ cursor: "pointer" }}
        >
          <div className="stepper-badge">
            <svg>
              <use href={step.icon} />
            </svg>
          </div>
          <div className="stepper-label">{step.label}</div>
          <div className="stepper-count">{step.count}</div>
          <div className="stepper-meta">{step.meta}</div>
        </div>
      ))}
    </div>
  );
}
