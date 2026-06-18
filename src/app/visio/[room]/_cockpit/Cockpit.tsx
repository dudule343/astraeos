"use client";

// Shell du cockpit visio React. Phase 1 : colonne DCI réelle (nav + section +
// édition). Colonnes vidéo et assistance = placeholders (Phases 2-3).
import { useEffect, useState } from "react";

import "./cockpit.css";
import { loadDciComplet, openEntretien, saveDciSnapshot } from "./api";
import { DciNavigation } from "./DciNavigation";
import { DciSection } from "./DciSection";
import { EditFieldModal } from "./EditFieldModal";
import { countSectionStatuses } from "./render-helpers";
import { CockpitProvider, useCockpit, useCockpitDispatch } from "./store";
import type { CockpitParams } from "./types";

function ProgressPill() {
  const { data } = useCockpit();
  let total = 0,
    validated = 0;
  data.sections.forEach((s) => {
    const c = countSectionStatuses(s);
    total += c.total;
    validated += c.validated;
  });
  const pct = total > 0 ? Math.round((validated / total) * 100) : 0;
  return (
    <div className="dci-progress">
      <div className="dci-progress-text">{pct} %</div>
      <div className="dci-progress-bar">
        <div className="dci-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SectionInfo() {
  const { data, currentSection } = useCockpit();
  const idx = data.sections.findIndex((s) => s.id === currentSection);
  const s = data.sections[idx];
  if (!s) return <span id="dci-section-info" />;
  return (
    <div className="dci-live-title-sub" id="dci-section-info">
      Section {s.num} / {data.sections.length} · {s.title}
    </div>
  );
}

function Toast() {
  const { toast } = useCockpit();
  const dispatch = useCockpitDispatch();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => dispatch({ type: "toast", message: null }), 2600);
    return () => clearTimeout(t);
  }, [toast, dispatch]);
  if (!toast) return null;
  return <div className="toast show">{toast}</div>;
}

type SaveState = "idle" | "saving" | "saved" | "offline";

function AutoSavePill({ state }: { state: SaveState }) {
  const map: Record<SaveState, { txt: string; color: string }> = {
    idle: { txt: "Brouillon", color: "var(--navy-300)" },
    saving: { txt: "Enregistrement…", color: "var(--navy-300)" },
    saved: { txt: "Enregistré ✓", color: "var(--green-text,#1F5A36)" },
    offline: { txt: "Non enregistré ⚠", color: "#C0392B" },
  };
  const m = map[state];
  return (
    <span className="auto-save" style={{ color: m.color }}>
      {m.txt}
    </span>
  );
}

function CockpitInner({ params }: { params: CockpitParams }) {
  const dispatch = useCockpitDispatch();
  const { data } = useCockpit();
  const [entretienId, setEntretienId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Création/reprise de l'entretien (upsert par salle) + hydratation : le
  // snapshot de session (édité par l'ingénieur) prime ; sinon DCI client brut.
  useEffect(() => {
    let alive = true;
    (async () => {
      let hydrated = false;
      const ent = await openEntretien(params.room, params.prospect, params.nom);
      if (!alive) return;
      if (ent) {
        setEntretienId(ent.id);
        if (ent.snapshot && ent.snapshot.sections.length) {
          dispatch({ type: "applySnapshot", snapshot: ent.snapshot });
          hydrated = true;
        }
      } else {
        setSaveState("offline");
      }
      if (!hydrated) {
        const snap = await loadDciComplet(params.prospect);
        if (alive && snap) dispatch({ type: "applySnapshot", snapshot: snap });
      }
    })();
    return () => {
      alive = false;
    };
  }, [params.room, params.prospect, params.nom, dispatch]);

  // Sauvegarde débouncée (1,5 s) du DCI édité → PATCH dci_snapshot. La pastille
  // reflète l'état RÉEL (pas de faux « Enregistré »).
  useEffect(() => {
    if (!entretienId || !data.sections.length) return;
    setSaveState("saving");
    const t = setTimeout(() => {
      saveDciSnapshot(entretienId, data).then((ok) => setSaveState(ok ? "saved" : "offline"));
    }, 1500);
    return () => clearTimeout(t);
  }, [data, entretienId]);

  return (
    <div className="cockpit">
      {/* Colonne 1 · vidéo (placeholder Phase 3) */}
      <div className="video-zone" id="video-zone">
        <div className="video-grid">
          <div className="video-tile">
            <div className="video-avatar">
              <div className="video-avatar-circle">
                {params.nom ? params.nom.slice(0, 2).toUpperCase() : "··"}
              </div>
            </div>
            <div className="video-name">
              <span className="video-name-text">{params.nom || "Participant"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne 2 · DCI Complet (réel) */}
      <div className="dci-live">
        <div className="dci-live-header">
          <div className="dci-live-title">
            <div className="dci-live-title-main">DCI Complet · complété en direct par l&apos;IA</div>
            <SectionInfo />
          </div>
          <AutoSavePill state={saveState} />
          <ProgressPill />
        </div>
        <div className="dci-main">
          <DciNavigation />
          <DciSection />
        </div>
      </div>

      {/* Colonne 3 · assistance IA (placeholder Phase 2) */}
      <div className="assist">
        <div
          style={{
            padding: 20,
            fontSize: 12,
            color: "var(--navy-300)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          Panneau assistance IA · migration React en cours (Phase 2).
        </div>
      </div>

      <EditFieldModal />
      <Toast />
    </div>
  );
}

export function Cockpit({ params }: { params: CockpitParams }) {
  return (
    <CockpitProvider>
      <CockpitInner params={params} />
    </CockpitProvider>
  );
}
