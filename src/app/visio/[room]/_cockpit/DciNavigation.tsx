"use client";

// Sidebar de navigation des sections DCI (port de renderNav).
import { Fragment } from "react";

import { countSectionStatuses } from "./render-helpers";
import { useCockpit, useCockpitDispatch } from "./store";

export function DciNavigation() {
  const { data, currentSection } = useCockpit();
  const dispatch = useCockpitDispatch();

  return (
    <div className="dci-sidebar" id="dci-sections-nav">
      {data.sections.map((s) => {
        const c = countSectionStatuses(s);
        const isComplete = !s.stub && c.total > 0 && c.validated === c.total;
        const isActive = s.id === currentSection;
        return (
          <Fragment key={s.id}>
            {s.isFinal && <div className="dci-sidebar-separator">Clôture</div>}
            <div
              className={`dci-sidebar-item${isComplete ? " done" : ""}${isActive ? " active" : ""}`}
              onClick={() => dispatch({ type: "setSection", id: s.id })}
            >
              <div className="dci-sidebar-num">{s.num}</div>
              <div className="dci-sidebar-content">
                <div className="dci-sidebar-title">{s.title}</div>
                {!s.stub && c.total > 0 && (
                  <div className="dci-sidebar-progress">
                    {c.validated} / {c.total} champs
                  </div>
                )}
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
