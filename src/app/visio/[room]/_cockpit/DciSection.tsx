"use client";

// Corps de la section DCI active (port de renderSection). Détecte person/block/
// repeatable, gère le repli (store), les alertes croisées, les filtres et le
// footer de confirmation.
import { DciField } from "./DciField";
import {
  buildGroupSummary,
  buildItemSummary,
  buildSectionSynthesis,
  checkCrossSectionAlerts,
  countSectionStatuses,
} from "./render-helpers";
import { useCockpit, useCockpitDispatch } from "./store";
import type {
  DciGroupBlock,
  DciGroupPerson,
  DciGroupRepeat,
  SessionField,
  SessionSection,
} from "./types";

const GRID_KINDS = ["enfant", "societe", "immo-usage", "immo-locatif", "immo-indirect"];
const SYNTH_KINDS = [
  "immo-usage",
  "immo-locatif",
  "societe",
  "immo-indirect",
  "av",
  "liquidite",
  "emprunt",
];

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const ToggleIcon = ({ collapsed }: { collapsed: boolean }) => <>{collapsed ? "▸" : "▾"}</>;

function useCollapse(key: string): [boolean, () => void] {
  const { collapsed } = useCockpit();
  const dispatch = useCockpitDispatch();
  return [!!collapsed[key], () => dispatch({ type: "toggleCollapse", key })];
}

function PersonCard({ g, gi, sectionId }: { g: DciGroupPerson; gi: number; sectionId: string }) {
  const [isCollapsed, toggle] = useCollapse(`${sectionId}:${gi}`);
  const personNum =
    g.personId === "p1" ? "Client n°1" : g.personId === "p2" ? "Client n°2" : g.person.name;
  const summary = isCollapsed ? buildGroupSummary(g) : "";
  return (
    <div className={`dci-person${isCollapsed ? " collapsed" : ""}`}>
      <div className="dci-person-header v7-group-header" onClick={toggle}>
        <div className="dci-person-avatar" style={{ background: g.person.color }}>
          {g.person.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="dci-person-name">{personNum}</div>
          <div className="dci-person-role">{g.person.role}</div>
        </div>
        <button className="v7-group-toggle" title={isCollapsed ? "Déplier" : "Replier"}>
          <ToggleIcon collapsed={isCollapsed} />
        </button>
      </div>
      {isCollapsed && summary ? (
        <>
          <div className="v7-group-summary-sep" />
          <div className="v7-group-summary">{summary}</div>
        </>
      ) : (
        <div className="v7-group-body">
          {g.fields.map((f, fi) => (
            <DciField key={f.key} field={f as SessionField} groupIdx={gi} fieldIdx={fi} />
          ))}
        </div>
      )}
    </div>
  );
}

function BlockCard({ g, gi, sectionId }: { g: DciGroupBlock; gi: number; sectionId: string }) {
  const [isCollapsed, toggle] = useCollapse(`${sectionId}:${gi}`);
  const summary = isCollapsed ? buildGroupSummary(g) : "";
  return (
    <div className={`dci-person${isCollapsed ? " collapsed" : ""}`} style={{ paddingTop: 14 }}>
      <div
        className="v7-group-header"
        style={{
          marginBottom: isCollapsed ? 0 : 10,
          paddingBottom: 7,
          borderBottom: isCollapsed ? "none" : "1px solid var(--navy-100)",
        }}
        onClick={toggle}
      >
        <div style={{ flex: 1, fontSize: "11.5px", fontWeight: 700, color: "var(--navy)" }}>
          {g.title}
        </div>
        <button className="v7-group-toggle" title={isCollapsed ? "Déplier" : "Replier"}>
          <ToggleIcon collapsed={isCollapsed} />
        </button>
      </div>
      {isCollapsed && summary ? (
        <>
          <div className="v7-group-summary-sep" />
          <div className="v7-group-summary">{summary}</div>
        </>
      ) : (
        g.fields.map((f, fi) => (
          <DciField key={f.key} field={f as SessionField} groupIdx={gi} fieldIdx={fi} />
        ))
      )}
    </div>
  );
}

function ItemCard({
  g,
  gi,
  ii,
  sectionId,
}: {
  g: DciGroupRepeat;
  gi: number;
  ii: number;
  sectionId: string;
}) {
  const [isCollapsed, toggle] = useCollapse(`${sectionId}:${gi}:${ii}`);
  const dispatch = useCockpitDispatch();
  const it = g.items[ii];
  const headerSummary = buildItemSummary(g.kind, it.fields as SessionField[]);
  return (
    <div className={`v6-card${isCollapsed ? " collapsed" : ""}`}>
      <div className="v6-card-header" onClick={toggle}>
        <div className="v6-card-title-zone">
          <div className="v6-card-title">
            {g.title.replace(/s$/, "")} n°{ii + 1}
          </div>
          {headerSummary && <div className="v6-card-summary">{headerSummary}</div>}
        </div>
        <button className="v6-card-toggle" title={isCollapsed ? "Déplier" : "Replier"}>
          <ToggleIcon collapsed={isCollapsed} />
        </button>
        <button
          className="v6-card-remove"
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: "toast", message: "Suppression d'élément · disponible bientôt" });
          }}
          title="Retirer"
        >
          ×
        </button>
      </div>
      <div className="v6-card-body">
        {it.fields.map((f, fi) => (
          <DciField
            key={f.key}
            field={f as SessionField}
            groupIdx={gi}
            fieldIdx={fi}
            itemIdx={ii}
          />
        ))}
      </div>
    </div>
  );
}

function RepeatableGroup({
  g,
  gi,
  sectionId,
}: {
  g: DciGroupRepeat;
  gi: number;
  sectionId: string;
}) {
  const [isCollapsed, toggle] = useCollapse(`${sectionId}:${gi}`);
  const dispatch = useCockpitDispatch();
  const isGrid = GRID_KINDS.includes(g.kind);
  const summary = isCollapsed ? buildGroupSummary(g) : "";
  const synth = SYNTH_KINDS.includes(g.kind) ? buildSectionSynthesis(g) : null;
  const cards = g.items.map((_, ii) => (
    <ItemCard key={ii} g={g} gi={gi} ii={ii} sectionId={sectionId} />
  ));
  return (
    <div className={`v7-repeatable-wrap${isCollapsed ? " collapsed" : ""}`}>
      <div className="v7-repeatable-header v7-group-header" onClick={toggle}>
        <div className="v7-repeatable-title-txt">{g.title}</div>
        <span className="v7-repeatable-count">
          {g.items.length} élément{g.items.length > 1 ? "s" : ""}
        </span>
        <button className="v7-group-toggle" title={isCollapsed ? "Déplier" : "Replier"}>
          <ToggleIcon collapsed={isCollapsed} />
        </button>
      </div>
      {isCollapsed ? (
        summary && (
          <>
            <div className="v7-group-summary-sep" />
            <div className="v7-group-summary">{summary}</div>
          </>
        )
      ) : (
        <>
          {isGrid && g.items.length > 0 ? <div className="v6-cards-grid">{cards}</div> : cards}
          {synth && (
            <div className="v6-section-synth">
              <div className="v6-synth-title">{synth.title}</div>
              <div className="v6-synth-lines">
                {synth.lines.map((l, i) => (
                  <span key={i}>
                    {i > 0 && " · "}
                    {l.label} · <strong>{l.value}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
          <button
            className="btn-add-item"
            onClick={() =>
              dispatch({ type: "toast", message: "Ajout d'élément · disponible bientôt" })
            }
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {g.addLabel}
          </button>
        </>
      )}
    </div>
  );
}

/** Itère les groupes en plaçant deux `person` consécutifs côte à côte. */
function renderGroups(section: SessionSection) {
  const out: React.ReactNode[] = [];
  const groups = section.groups;
  let gi = 0;
  while (gi < groups.length) {
    const g = groups[gi];
    if (g.type === "person" && groups[gi + 1]?.type === "person") {
      const g2 = groups[gi + 1] as DciGroupPerson;
      out.push(
        <div className="dci-persons-grid" key={gi}>
          <PersonCard g={g} gi={gi} sectionId={section.id} />
          <PersonCard g={g2} gi={gi + 1} sectionId={section.id} />
        </div>,
      );
      gi += 2;
    } else if (g.type === "person") {
      out.push(<PersonCard key={gi} g={g} gi={gi} sectionId={section.id} />);
      gi++;
    } else if (g.type === "block") {
      out.push(<BlockCard key={gi} g={g} gi={gi} sectionId={section.id} />);
      gi++;
    } else if (g.type === "repeatable") {
      out.push(<RepeatableGroup key={gi} g={g} gi={gi} sectionId={section.id} />);
      gi++;
    } else {
      gi++;
    }
  }
  return out;
}

export function DciSection() {
  const { data, currentSection, currentFilter, confirmed } = useCockpit();
  const dispatch = useCockpitDispatch();
  const section = data.sections.find((s) => s.id === currentSection);

  if (!section) {
    return (
      <div className="dci-body" id="dci-body">
        {data.sections.length === 0 && (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              background: "var(--ivory)",
              borderRadius: 8,
              color: "var(--navy-300)",
            }}
          >
            Aucun DCI client reçu pour ce prospect.
          </div>
        )}
      </div>
    );
  }

  const c = countSectionStatuses(section);
  const alerts = checkCrossSectionAlerts(data.sections).filter((a) => a.section === section.id);
  const isCustom = !!(section as { customRenderer?: string }).customRenderer;

  // Footer de confirmation
  const totalNonEmpty = c.total - c.empty;
  const allValidated = c.aiSuggest === 0 && c.aiDisagree === 0 && c.empty === 0;
  const sectionConfirmed = confirmed[section.id] === true;
  const arbitrer = c.aiSuggest + c.aiDisagree;
  const showConfirm = !section.stub && (totalNonEmpty > 0 || allValidated);

  return (
    <div className="dci-body" id="dci-body">
      <div className="dci-section-title">
        Section {section.num} · {section.title}
      </div>

      {section.stub ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            background: "var(--ivory)",
            borderRadius: 8,
            color: "var(--navy-300)",
          }}
        >
          <div style={{ fontSize: 13, color: "var(--navy)", fontWeight: 700 }}>
            Section disponible
          </div>
          <div style={{ fontSize: 11, marginTop: 6, lineHeight: 1.5 }}>{section.summary}</div>
        </div>
      ) : isCustom ? (
        <div
          style={{
            padding: "32px 20px",
            textAlign: "center",
            background: "var(--ivory)",
            borderRadius: 8,
            color: "var(--navy-300)",
            fontSize: 12,
          }}
        >
          Synthèse · rendu détaillé en cours de migration React.
        </div>
      ) : (
        <>
          <div className="dci-filter-bar">
            {(
              [
                ["all", "Tous", "all", c.total],
                ["validated", "Validés", "green", c.validated],
                ["ai-suggest", "IA à valider", "gold", c.aiSuggest],
                ["ai-disagree", "Divergences", "orange", c.aiDisagree],
                ["empty", "À renseigner", "blue", c.empty],
              ] as const
            ).map(([key, label, color, n]) => (
              <button
                key={key}
                className={`dci-filter-btn ${currentFilter === key ? "active" : ""}`}
                onClick={() => dispatch({ type: "setFilter", filter: key })}
              >
                {label} <span className={`dci-filter-count ${color}`}>{n}</span>
              </button>
            ))}
          </div>

          {alerts.map((a, i) => (
            <div className={`v6-cross-alert ${a.level}`} key={i}>
              <div className="v6-cross-alert-icon">
                <AlertIcon />
              </div>
              <div className="v6-cross-alert-body">
                <div className="v6-cross-alert-title">{a.title}</div>
                <div className="v6-cross-alert-msg">
                  <strong>{a.nom}</strong> est déclarée à <strong>prépondérance immobilière</strong>.
                  Or les sociétés à prépondérance immobilière sont{" "}
                  <strong>exclues du dispositif Dutreil</strong> (art. 787 B CGI). Les deux choix ne
                  peuvent pas coexister · à arbitrer avec le client.
                </div>
              </div>
            </div>
          ))}

          {renderGroups(section)}

          {showConfirm && (
            <div className={`v6-section-confirm${sectionConfirmed ? " done" : ""}`}>
              <div className="v6-section-confirm-info">
                {sectionConfirmed ? (
                  <>
                    <strong>Section confirmée</strong> · vous pouvez revenir dessus à tout moment en
                    cliquant sur un champ.
                  </>
                ) : arbitrer > 0 ? (
                  <>
                    <strong>
                      {arbitrer} élément{arbitrer > 1 ? "s" : ""} à arbitrer
                    </strong>{" "}
                    dans cette section · vérifiez puis confirmez l&apos;ensemble.
                  </>
                ) : (
                  <>Vérifiez les informations de la section puis confirmez-les en un clic.</>
                )}
              </div>
              <button
                className="v6-section-confirm-btn"
                onClick={() => {
                  dispatch({ type: "confirmSection", sectionId: section.id });
                  dispatch({ type: "toast", message: `Section « ${section.title} » confirmée` });
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {sectionConfirmed ? "Section confirmée · re-confirmer" : "Confirmer toute la section"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
