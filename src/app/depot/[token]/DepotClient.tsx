"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/* ----------------------------------------------------------------------------
   Page client de dépôt de documents (charte PRIVEOS).
   Le client arrive depuis l'e-mail de collecte, souvent sur mobile.
   On consomme l'API publique GET /api/collecte/[token] côté client (pas de
   service_role ici), puis on dépose fichiers/réponses via POST .../depot.
---------------------------------------------------------------------------- */

// Le contrat API envoie "Document" | "Question" (capitalisés).
type ItemType = "Document" | "Question" | string;

type StructureItem = {
  theme: string;
  sub?: string | null;
  label: string;
  type: ItemType;
};

type Depot = {
  item_index: number;
  file_name: string | null;
  reponse: string | null;
  created_at: string;
};

type Collecte = {
  client_nom: string;
  structure: StructureItem[];
  depots: Depot[];
  progress: { done: number; total: number };
};

type LoadState =
  | { phase: "loading" }
  | { phase: "invalid" }
  | { phase: "ready"; data: Collecte };

// L'item_index global suit l'ordre de la structure renvoyée par l'API.
type IndexedItem = StructureItem & { index: number };

const MAX_SIZE = 15 * 1024 * 1024; // 15 Mo
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.heic,application/pdf,image/jpeg,image/png,image/heic";

export function DepotClient({ token }: { token: string }) {
  const [state, setState] = useState<LoadState>({ phase: "loading" });

  const refreshProgress = useCallback((progress: { done: number; total: number }) => {
    setState((prev) =>
      prev.phase === "ready" ? { ...prev, data: { ...prev.data, progress } } : prev,
    );
  }, []);

  // Met à jour le dépôt local d'un item sans recharger toute la page.
  const applyDepot = useCallback((depot: Depot) => {
    setState((prev) => {
      if (prev.phase !== "ready") return prev;
      const others = prev.data.depots.filter((d) => d.item_index !== depot.item_index);
      return { ...prev, data: { ...prev.data, depots: [...others, depot] } };
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/collecte/${encodeURIComponent(token)}`, {
          cache: "no-store",
        });
        if (res.status === 404) {
          if (!cancelled) setState({ phase: "invalid" });
          return;
        }
        if (!res.ok) {
          if (!cancelled) setState({ phase: "invalid" });
          return;
        }
        const data = (await res.json()) as Collecte;
        if (!cancelled) setState({ phase: "ready", data });
      } catch {
        if (!cancelled) setState({ phase: "invalid" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.phase === "loading") return <LoadingView />;
  if (state.phase === "invalid") return <InvalidView />;

  return (
    <ReadyView
      token={token}
      data={state.data}
      onProgress={refreshProgress}
      onDepot={applyDepot}
    />
  );
}

/* -------------------------------------------------------------------------- */

function Header({
  clientNom,
  done,
  total,
}: {
  clientNom: string;
  done: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <header style={{ background: "var(--navy)", color: "#fff", padding: "28px 20px 32px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "var(--gold-300)",
            marginBottom: 14,
          }}
        >
          PRIVEOS
        </div>
        <h1
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 30,
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          Vos documents pour votre étude patrimoniale
        </h1>
        <p style={{ margin: "10px 0 0", color: "var(--navy-100)", fontSize: 14 }}>
          {clientNom}
        </p>

        <div style={{ marginTop: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 13, color: "var(--navy-100)" }}>Progression</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              {done}/{total} <span style={{ color: "var(--navy-100)", fontWeight: 400 }}>déposés</span>
            </span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: "rgba(255,255,255,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: "var(--gold)",
                borderRadius: 999,
                transition: "width 240ms ease",
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function ReadyView({
  token,
  data,
  onProgress,
  onDepot,
}: {
  token: string;
  data: Collecte;
  onProgress: (p: { done: number; total: number }) => void;
  onDepot: (d: Depot) => void;
}) {
  // Index des dépôts par item_index pour un accès direct.
  const depotByIndex = useMemo(() => {
    const map = new Map<number, Depot>();
    for (const d of data.depots) map.set(d.item_index, d);
    return map;
  }, [data.depots]);

  // Regroupement par thème puis sous-rubrique, en conservant l'item_index global.
  const groups = useMemo(() => {
    const indexed: IndexedItem[] = data.structure.map((it, index) => ({ ...it, index }));
    const byTheme = new Map<string, IndexedItem[]>();
    for (const it of indexed) {
      const arr = byTheme.get(it.theme) ?? [];
      arr.push(it);
      byTheme.set(it.theme, arr);
    }
    return Array.from(byTheme.entries()).map(([theme, items]) => ({ theme, items }));
  }, [data.structure]);

  return (
    <>
      <Header clientNom={data.client_nom} done={data.progress.done} total={data.progress.total} />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 64px" }}>
        <AiNotice />

        {groups.map((group) => (
          <ThemeSection
            key={group.theme}
            token={token}
            theme={group.theme}
            items={group.items}
            depotByIndex={depotByIndex}
            onProgress={onProgress}
            onDepot={onDepot}
          />
        ))}
      </div>
    </>
  );
}

function AiNotice() {
  return (
    <div
      style={{
        background: "var(--light-blue)",
        border: "1px solid var(--navy-100)",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 20,
        color: "var(--navy)",
        fontSize: 13,
        lineHeight: 1.55,
      }}
    >
      Chaque document déposé est analysé par l&apos;IA (cohérence avec votre entretien initial).
      Votre ingénieur revient vers vous en cas de question.
    </div>
  );
}

function ThemeSection({
  token,
  theme,
  items,
  depotByIndex,
  onProgress,
  onDepot,
}: {
  token: string;
  theme: string;
  items: IndexedItem[];
  depotByIndex: Map<number, Depot>;
  onProgress: (p: { done: number; total: number }) => void;
  onDepot: (d: Depot) => void;
}) {
  const [open, setOpen] = useState(true);

  const done = items.filter((it) => {
    const d = depotByIndex.get(it.index);
    return d && (d.file_name || (d.reponse && d.reponse.trim() !== ""));
  }).length;

  // Sous-rubriques préservant l'ordre d'apparition.
  const subGroups = useMemo(() => {
    const order: string[] = [];
    const bySub = new Map<string, IndexedItem[]>();
    for (const it of items) {
      const key = it.sub?.trim() ? it.sub : "";
      if (!bySub.has(key)) {
        bySub.set(key, []);
        order.push(key);
      }
      bySub.get(key)!.push(it);
    }
    return order.map((key) => ({ sub: key, items: bySub.get(key)! }));
  }, [items]);

  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid var(--navy-100)",
        borderRadius: 14,
        marginBottom: 14,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "16px 18px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
        aria-expanded={open}
      >
        <span
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontStyle: "italic",
            fontSize: 21,
            color: "var(--navy)",
          }}
        >
          {theme}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: done === items.length ? "var(--green-text)" : "var(--navy-300)",
              background: done === items.length ? "var(--green-bg)" : "var(--navy-100)",
              borderRadius: 999,
              padding: "3px 10px",
              whiteSpace: "nowrap",
            }}
          >
            {done}/{items.length} déposés
          </span>
          <span
            aria-hidden
            style={{
              color: "var(--navy-300)",
              transform: open ? "rotate(90deg)" : "none",
              transition: "transform 160ms ease",
              fontSize: 14,
            }}
          >
            ›
          </span>
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 14px 14px" }}>
          {subGroups.map((sg, i) => (
            <div key={`${sg.sub}-${i}`}>
              {sg.sub && (
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: "var(--navy-300)",
                    margin: "14px 4px 6px",
                    fontWeight: 600,
                  }}
                >
                  {sg.sub}
                </div>
              )}
              {sg.items.map((it) => (
                <ItemRow
                  key={it.index}
                  token={token}
                  item={it}
                  depot={depotByIndex.get(it.index) ?? null}
                  onProgress={onProgress}
                  onDepot={onDepot}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ItemRow({
  token,
  item,
  depot,
  onProgress,
  onDepot,
}: {
  token: string;
  item: IndexedItem;
  depot: Depot | null;
  onProgress: (p: { done: number; total: number }) => void;
  onDepot: (d: Depot) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState(depot?.reponse ?? "");

  // La structure stocke 'Document' | 'Question' — comparaison insensible à la casse par sécurité.
  const isDocument = (item.type || "").toLowerCase() !== "question";
  const fileDone = isDocument && !!depot?.file_name;
  const answerDone = !isDocument && !!depot?.reponse && depot.reponse.trim() !== "";
  const done = fileDone || answerDone;

  const inputId = `file-${item.index}`;

  const submit = useCallback(
    async (body: FormData) => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch(`/api/collecte/${encodeURIComponent(token)}/depot`, {
          method: "POST",
          body,
        });
        const json = (await res.json().catch(() => null)) as
          | { ok: true; progress: { done: number; total: number } }
          | { error: string }
          | null;
        if (!res.ok || !json || "error" in json) {
          setError((json && "error" in json && json.error) || "Échec du dépôt, réessayez.");
          return false;
        }
        onProgress(json.progress);
        return true;
      } catch {
        setError("Connexion interrompue, réessayez.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [token, onProgress],
  );

  const onFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (file.size > MAX_SIZE) {
        setError("Fichier trop volumineux (15 Mo maximum).");
        return;
      }
      const body = new FormData();
      body.set("item_index", String(item.index));
      body.set("label", item.label);
      body.set("file", file);
      const ok = await submit(body);
      if (ok) {
        onDepot({
          item_index: item.index,
          file_name: file.name,
          reponse: null,
          created_at: new Date().toISOString(),
        });
      }
    },
    [item.index, item.label, submit, onDepot],
  );

  const onAnswer = useCallback(async () => {
    const value = draft.trim();
    if (!value) return;
    const body = new FormData();
    body.set("item_index", String(item.index));
    body.set("label", item.label);
    body.set("reponse", value);
    const ok = await submit(body);
    if (ok) {
      onDepot({
        item_index: item.index,
        file_name: null,
        reponse: value,
        created_at: new Date().toISOString(),
      });
    }
  }, [draft, item.index, item.label, submit, onDepot]);

  return (
    <div
      style={{
        padding: "13px 4px",
        borderTop: "1px solid var(--navy-100)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#222", lineHeight: 1.35 }}>
            {item.label}
          </div>
          {fileDone && (
            <div
              style={{
                fontSize: 12,
                color: "var(--green-text)",
                marginTop: 4,
                wordBreak: "break-word",
              }}
            >
              Déposé ✓ — {depot?.file_name}
            </div>
          )}
          {answerDone && (
            <div style={{ fontSize: 12, color: "var(--green-text)", marginTop: 4 }}>
              Répondu ✓
            </div>
          )}
          {error && (
            <div style={{ fontSize: 12, color: "var(--red-text)", marginTop: 4 }}>{error}</div>
          )}
        </div>

        {isDocument && (
          <div style={{ flexShrink: 0 }}>
            <input
              id={inputId}
              type="file"
              accept={ACCEPT}
              style={{ display: "none" }}
              disabled={busy}
              onChange={(e) => {
                void onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <label htmlFor={inputId} style={{ display: "inline-block" }}>
              <span
                role="button"
                aria-disabled={busy}
                style={{
                  ...buttonStyle(done ? "ghost" : "primary"),
                  opacity: busy ? 0.6 : 1,
                  cursor: busy ? "default" : "pointer",
                }}
              >
                {busy ? "Envoi…" : done ? "Remplacer" : "Déposer"}
              </span>
            </label>
          </div>
        )}
      </div>

      {!isDocument && (
        <div style={{ marginTop: 10 }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Votre réponse…"
            rows={3}
            disabled={busy}
            style={{
              width: "100%",
              border: "1px solid var(--navy-100)",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 14,
              fontFamily: "inherit",
              resize: "vertical",
              color: "#222",
              background: "#fff",
            }}
          />
          <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => void onAnswer()}
              disabled={busy || draft.trim() === "" || draft.trim() === (depot?.reponse ?? "").trim()}
              style={{
                ...buttonStyle(answerDone ? "ghost" : "primary"),
                opacity:
                  busy || draft.trim() === "" || draft.trim() === (depot?.reponse ?? "").trim()
                    ? 0.5
                    : 1,
              }}
            >
              {busy ? "Envoi…" : answerDone ? "Modifier" : "Répondre"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function LoadingView() {
  return (
    <CenteredView>
      <Spinner />
      <p style={{ color: "var(--navy-300)", marginTop: 16, fontSize: 14 }}>
        Chargement de vos documents…
      </p>
    </CenteredView>
  );
}

function InvalidView() {
  return (
    <CenteredView>
      <div
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontStyle: "italic",
          fontSize: 26,
          color: "var(--navy)",
          marginBottom: 10,
        }}
      >
        Lien indisponible
      </div>
      <p style={{ color: "var(--navy-300)", fontSize: 14, maxWidth: 360 }}>
        Ce lien de dépôt n&apos;est plus valide ou a expiré. Rapprochez-vous de votre ingénieur
        patrimonial pour obtenir un nouveau lien.
      </p>
    </CenteredView>
  );
}

function CenteredView({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 24,
      }}
    >
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        border: "3px solid var(--navy-100)",
        borderTopColor: "var(--gold)",
        display: "inline-block",
        animation: "depot-spin 0.8s linear infinite",
      }}
    >
      <style>{`@keyframes depot-spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

function buttonStyle(variant: "primary" | "ghost"): React.CSSProperties {
  if (variant === "ghost") {
    return {
      display: "inline-block",
      border: "1px solid var(--navy-200)",
      background: "#fff",
      color: "var(--navy)",
      borderRadius: 10,
      padding: "9px 16px",
      fontSize: 13,
      fontWeight: 600,
      whiteSpace: "nowrap",
    };
  }
  return {
    display: "inline-block",
    border: "none",
    background: "var(--gold)",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 18px",
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
    cursor: "pointer",
  };
}
