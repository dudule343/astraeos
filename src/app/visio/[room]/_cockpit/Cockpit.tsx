"use client";

// Shell du cockpit visio React. Phase 1 : colonne DCI réelle (nav + section +
// édition). Colonnes vidéo et assistance = placeholders (Phases 2-3).
import { useCallback, useEffect, useRef, useState } from "react";

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

function AutoSavePill({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  const map: Record<SaveState, { txt: string; color: string }> = {
    idle: { txt: "Brouillon", color: "var(--navy-300)" },
    saving: { txt: "Enregistrement…", color: "var(--navy-300)" },
    saved: { txt: "Enregistré ✓", color: "var(--green-text,#1F5A36)" },
    offline: { txt: "Non enregistré ⚠", color: "#C0392B" },
  };
  const m = map[state];
  if (state === "offline") {
    return (
      <button
        className="auto-save"
        onClick={onRetry}
        style={{ color: m.color, cursor: "pointer", border: "none", background: "transparent", font: "inherit" }}
        title="Réessayer l'enregistrement"
      >
        {m.txt} · réessayer
      </button>
    );
  }
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
  // Données courantes accessibles dans les handlers d'unload sans re-binder.
  const dataRef = useRef(data);
  dataRef.current = data;
  const entretienIdRef = useRef<string | null>(null);
  entretienIdRef.current = entretienId;

  // Création/reprise de l'entretien AVEC retry (blip réseau / session) : sans
  // retry, un échec au montage laissait entretienId null à vie → toutes les
  // éditions perdues. On réessaie (backoff), puis la pastille 'offline' propose
  // un nouvel essai manuel.
  const ensureEntretien = useCallback(async (): Promise<string | null> => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const ent = await openEntretien(params.room, params.prospect, params.nom);
      if (ent) {
        setEntretienId(ent.id);
        if (ent.snapshot && ent.snapshot.sections.length) {
          dispatch({ type: "applySnapshot", snapshot: ent.snapshot });
        } else {
          const snap = await loadDciComplet(params.prospect);
          if (snap) dispatch({ type: "applySnapshot", snapshot: snap });
        }
        return ent.id;
      }
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
    setSaveState("offline");
    return null;
  }, [params.room, params.prospect, params.nom, dispatch]);

  useEffect(() => {
    let alive = true;
    void ensureEntretien().then(() => {
      if (!alive) return;
    });
    return () => {
      alive = false;
    };
  }, [ensureEntretien]);

  // Réessai manuel depuis la pastille 'offline' : recrée l'entretien puis sauve
  // immédiatement le DCI courant.
  const retrySave = useCallback(async () => {
    setSaveState("saving");
    const id = entretienIdRef.current ?? (await ensureEntretien());
    if (id && dataRef.current.sections.length) {
      const ok = await saveDciSnapshot(id, dataRef.current);
      setSaveState(ok ? "saved" : "offline");
    } else {
      setSaveState("offline");
    }
  }, [ensureEntretien]);

  // Sauvegarde débouncée (1,5 s) du DCI édité → PATCH dci_snapshot. Pastille réelle.
  useEffect(() => {
    if (!entretienId || !data.sections.length) return;
    setSaveState("saving");
    const t = setTimeout(() => {
      saveDciSnapshot(entretienId, data).then((ok) => setSaveState(ok ? "saved" : "offline"));
    }, 1500);
    return () => clearTimeout(t);
  }, [data, entretienId]);

  // Flush de DERNIÈRE CHANCE à la fermeture/masquage de l'onglet ET au démontage :
  // le PATCH débouncé serait annulé sinon (édition dans les 1,5 s avant fermeture).
  // keepalive:true survit à l'unload (la route n'accepte que PATCH, pas sendBeacon).
  useEffect(() => {
    function flush() {
      const id = entretienIdRef.current;
      if (!id || !dataRef.current.sections.length) return;
      try {
        fetch(`/api/entretiens/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dci_snapshot: dataRef.current }),
          keepalive: true,
        });
      } catch {
        /* silencieux */
      }
    }
    function onVisibility() {
      if (document.visibilityState === "hidden") flush();
    }
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

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
          <AutoSavePill state={saveState} onRetry={retrySave} />
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
