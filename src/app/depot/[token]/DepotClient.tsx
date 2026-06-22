"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/* ----------------------------------------------------------------------------
   Page client de dépôt de documents (charte ASTRAEOS).
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

/* ----------------------------------------------------------------------------
   Format de réponse attendu pour les items « Question », déduit du libellé.
   Objectif : réponses cohérentes (chiffre + devise + période, Oui/Non…)
   plutôt que du texte libre. Règle prudente : jamais de Oui/Non quand la
   question contient une alternative (« … ou … »).
---------------------------------------------------------------------------- */

type AnswerKind =
  | { kind: "texte" }
  | { kind: "montant"; suffix: " € / an" | " € / mois" | " €" }
  | { kind: "nombre"; suffix: " ans" }
  | { kind: "ouinon" };

function answerKindFor(label: string): AnswerKind {
  const l = label.toLowerCase();
  if (/^à quel âge/.test(l)) return { kind: "nombre", suffix: " ans" };
  if (/train de vie|montant annuel|montant actuel|quel est le montant|valeur estimée par le client/.test(l)) {
    if (/loyer|mensuel|par mois/.test(l)) return { kind: "montant", suffix: " € / mois" };
    if (/annuel|par an|train de vie/.test(l)) return { kind: "montant", suffix: " € / an" };
    return { kind: "montant", suffix: " €" };
  }
  const interrogatif =
    /(est-il|est-elle|sont-ils|sont-elles|a-t-il|a-t-elle|ont-ils|existe-t-il|détient-il|verse-t-il|réalise-t-il|anticipe-t-il|envisage-t-il|souhaite-t-il|souhaite-t-elle|pense-t-il|posent-ils|s'est-elle|avez-vous|êtes-vous)/.test(
      l,
    );
  if (interrogatif && !/ ou /.test(l)) return { kind: "ouinon" };
  return { kind: "texte" };
}

/** 1234567 → « 1 234 567 » (saisie de montants). */
function formatMilliers(digits: string): string {
  const clean = digits.replace(/\D/g, "");
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Aperçu d'un fichier : on déduit le mode (image / PDF / autre) du nom.
function previewKind(fileName: string): "image" | "pdf" | "other" {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  if (["jpg", "jpeg", "png", "heic", "webp", "gif"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  return "other";
}

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
          ASTRAEOS
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

  // Chat conseiller : ouverture globale ou depuis un document précis (préfixe).
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState("");
  const askAbout = useCallback((label: string) => {
    setChatPrefill(`À propos de « ${label} » : `);
    setChatOpen(true);
  }, []);

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

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 96px" }}>
        <DepotBanner done={data.progress.done} total={data.progress.total} />
        {groups.map((group) => (
          <ThemeSection
            key={group.theme}
            token={token}
            theme={group.theme}
            items={group.items}
            depotByIndex={depotByIndex}
            onProgress={onProgress}
            onDepot={onDepot}
            onAskAbout={askAbout}
          />
        ))}
      </div>

      <ChatWidget token={token} open={chatOpen} setOpen={setChatOpen} prefill={chatPrefill} />
    </>
  );
}

/**
 * Bandeau en tête du dépôt : rassure sur la REPRISE (le lien est réutilisable,
 * les pièces sont enregistrées au fil de l'eau → on peut faire une pause et
 * revenir un autre jour) et félicite quand tout est déposé.
 */
function DepotBanner({ done, total }: { done: number; total: number }) {
  const [copied, setCopied] = useState(false);
  const allDone = total > 0 && done >= total;

  const copyLink = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const after = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(after).catch(after);
    } else {
      after();
    }
  }, []);

  return (
    <div
      style={{
        background: allDone ? "#E8F5EE" : "var(--ivory, #FAF7F0)",
        border: `1px solid ${allDone ? "#BfE3CD" : "var(--navy-100, #E7E1D5)"}`,
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 16,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ fontSize: 13, lineHeight: 1.55, color: "var(--navy)", flex: "1 1 320px" }}>
        {allDone ? (
          <>
            <strong style={{ color: "#1F8049" }}>✓ Tous vos documents sont déposés, merci !</strong>{" "}
            Votre ingénieur patrimonial les retrouvera dans son espace et reviendra vers vous. Vous pouvez fermer cette page.
          </>
        ) : (
          <>
            <strong>💾 Pas besoin de tout faire d&apos;un coup.</strong> Vos documents sont enregistrés au fur et à mesure : vous pouvez quitter et <strong>reprendre plus tard</strong> avec ce même lien (pensez à le garder).
          </>
        )}
      </div>
      <button
        type="button"
        onClick={copyLink}
        style={{
          flexShrink: 0,
          border: "1px solid var(--gold, #C8A55C)",
          background: copied ? "var(--gold, #C8A55C)" : "transparent",
          color: copied ? "#fff" : "var(--gold-deep, #9C7A24)",
          borderRadius: 8,
          padding: "9px 14px",
          fontSize: 12.5,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {copied ? "Lien copié ✓" : "🔗 Copier mon lien de reprise"}
      </button>
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
  onAskAbout,
}: {
  token: string;
  theme: string;
  items: IndexedItem[];
  depotByIndex: Map<number, Depot>;
  onProgress: (p: { done: number; total: number }) => void;
  onDepot: (d: Depot) => void;
  onAskAbout: (label: string) => void;
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
                  onAskAbout={onAskAbout}
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
  onAskAbout,
}: {
  token: string;
  item: IndexedItem;
  depot: Depot | null;
  onProgress: (p: { done: number; total: number }) => void;
  onDepot: (d: Depot) => void;
  onAskAbout: (label: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState(depot?.reponse ?? "");
  const [dragOver, setDragOver] = useState(false);
  // Aperçu local du fichier choisi (objectURL) + ouverture de la modale.
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Libère l'objectURL au démontage ou quand un nouveau fichier le remplace.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

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
      // Aperçu immédiat depuis le fichier local (avant même l'upload).
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { url: URL.createObjectURL(file), name: file.name };
      });
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

  const onAnswer = useCallback(
    async (raw: string) => {
      const value = raw.trim();
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
    },
    [item.index, item.label, submit, onDepot],
  );

  return (
    <div
      onDragOver={
        isDocument && !busy
          ? (e) => {
              e.preventDefault();
              setDragOver(true);
            }
          : undefined
      }
      onDragLeave={isDocument ? () => setDragOver(false) : undefined}
      onDrop={
        isDocument && !busy
          ? (e) => {
              e.preventDefault();
              setDragOver(false);
              void onFile(e.dataTransfer.files?.[0]);
            }
          : undefined
      }
      style={{
        padding: "13px 8px",
        borderTop: "1px solid var(--navy-100)",
        borderRadius: dragOver ? 12 : 0,
        outline: dragOver ? "2px dashed var(--gold)" : "none",
        outlineOffset: -2,
        background: dragOver ? "rgba(200,165,92,0.08)" : "transparent",
        transition: "background 120ms ease",
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
          {preview && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              {previewKind(preview.name) === "image" ? (
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  title="Voir l'aperçu"
                  style={{
                    padding: 0,
                    border: "1px solid var(--navy-100)",
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "#fff",
                    cursor: "pointer",
                    lineHeight: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview.url}
                    alt={preview.name}
                    style={{ width: 48, height: 48, objectFit: "cover", display: "block" }}
                  />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  fontSize: 11.5,
                  color: "var(--gold-deep, #9a7a35)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                👁 Aperçu
              </button>
            </div>
          )}
          {answerDone && (
            <div style={{ fontSize: 12, color: "var(--green-text)", marginTop: 4 }}>
              Répondu ✓ — {depot?.reponse}
            </div>
          )}
          {error && (
            <div style={{ fontSize: 12, color: "var(--red-text)", marginTop: 4 }}>{error}</div>
          )}
          {isDocument && !done && (
            <label
              htmlFor={inputId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                marginTop: 9,
                padding: "12px 14px",
                border: `1.5px dashed ${dragOver ? "var(--gold, #C8A55C)" : "#cdbf9e"}`,
                borderRadius: 10,
                background: dragOver ? "rgba(200,165,92,0.10)" : "var(--ivory, #FAF7F0)",
                cursor: busy ? "default" : "pointer",
                transition: "border-color 120ms ease, background 120ms ease",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "var(--gold, #C8A55C)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16V4" />
                  <path d="M6 10l6-6 6 6" />
                  <path d="M4 20h16" />
                </svg>
              </span>
              <span style={{ fontSize: 12.5, color: "var(--navy-300)", lineHeight: 1.4 }}>
                <strong style={{ color: "var(--navy)" }}>Glissez votre fichier ici</strong> ou cliquez pour parcourir
                <span style={{ display: "block", fontSize: 11, marginTop: 1 }}>PDF, JPG, PNG · 15 Mo max</span>
              </span>
            </label>
          )}
          <button
            type="button"
            onClick={() => onAskAbout(item.label)}
            style={{
              border: "none",
              background: "none",
              padding: 0,
              marginTop: 6,
              fontSize: 11.5,
              color: "var(--gold-deep, #9a7a35)",
              cursor: "pointer",
              fontFamily: "inherit",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {isDocument ? "Une question sur ce document ?" : "Une question ?"}
          </button>
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
        <AnswerField
          label={item.label}
          current={depot?.reponse ?? ""}
          busy={busy}
          answerDone={answerDone}
          draft={draft}
          setDraft={setDraft}
          onSubmit={(value) => void onAnswer(value)}
        />
      )}

      {previewOpen && preview && (
        <PreviewModal
          url={preview.url}
          name={preview.name}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}

// Modale d'aperçu côté client : image en <img>, PDF en <iframe>, repli sinon.
function PreviewModal({
  url,
  name,
  onClose,
}: {
  url: string;
  name: string;
  onClose: () => void;
}) {
  const kind = previewKind(name);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(11,28,53,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 14,
          width: "min(720px, 100%)",
          height: "min(85vh, 100%)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(11,28,53,0.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 16px",
            borderBottom: "1px solid var(--navy-100)",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--navy)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer l'aperçu"
            style={{
              border: "none",
              background: "var(--navy-100)",
              color: "var(--navy)",
              borderRadius: 8,
              width: 30,
              height: 30,
              cursor: "pointer",
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, background: "var(--ivory)" }}>
          {kind === "image" && (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                overflow: "auto",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={name}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </div>
          )}
          {kind === "pdf" && (
            <iframe
              src={url}
              title={name}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          )}
          {kind === "other" && (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                textAlign: "center",
                fontSize: 13,
                color: "var(--navy-300)",
              }}
            >
              Aperçu indisponible pour ce format.
            </div>
          )}
        </div>
      </div>
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

/* -------------------------------------------------------------------------- */
/* Réponse typée selon la question : montant (devise + période), âge, Oui/Non */
/* avec précision, ou texte libre.                                            */

function AnswerField({
  label,
  current,
  busy,
  answerDone,
  draft,
  setDraft,
  onSubmit,
}: {
  label: string;
  current: string;
  busy: boolean;
  answerDone: boolean;
  draft: string;
  setDraft: (v: string) => void;
  onSubmit: (value: string) => void;
}) {
  const kind = useMemo(() => answerKindFor(label), [label]);

  // États dédiés aux formats chiffrés / Oui-Non, initialisés depuis la
  // réponse déjà enregistrée pour rester modifiables.
  const [montant, setMontant] = useState(() =>
    kind.kind === "montant" || kind.kind === "nombre" ? current.replace(/\D/g, "") : "",
  );
  const [yesNo, setYesNo] = useState<"Oui" | "Non" | null>(() =>
    kind.kind === "ouinon" && /^oui/i.test(current) ? "Oui" : /^non/i.test(current) ? "Non" : null,
  );
  const [precision, setPrecision] = useState(() =>
    kind.kind === "ouinon" ? current.replace(/^(oui|non)\s*(—\s*)?/i, "") : "",
  );

  const inputBase: React.CSSProperties = {
    border: "1px solid var(--navy-100)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "inherit",
    color: "#222",
    background: "#fff",
  };

  // Valeur composée envoyée au conseiller (toujours lisible : devise, période…).
  const composed = (() => {
    if (kind.kind === "montant" || kind.kind === "nombre") {
      return montant ? `${formatMilliers(montant)}${kind.suffix}` : "";
    }
    if (kind.kind === "ouinon") {
      if (!yesNo) return "";
      return precision.trim() ? `${yesNo} — ${precision.trim()}` : yesNo;
    }
    return draft;
  })();
  const unchanged = composed.trim() === current.trim();
  const disabled = busy || composed.trim() === "" || unchanged;

  return (
    <div style={{ marginTop: 10 }}>
      {(kind.kind === "montant" || kind.kind === "nombre") && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            inputMode="numeric"
            value={formatMilliers(montant)}
            onChange={(e) => setMontant(e.target.value.replace(/\D/g, "").slice(0, 12))}
            placeholder={kind.kind === "nombre" ? "62" : "30 000"}
            disabled={busy}
            style={{ ...inputBase, width: 160, textAlign: "right" }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--navy)" }}>
            {kind.suffix.trim()}
          </span>
        </div>
      )}

      {kind.kind === "ouinon" && (
        <div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["Oui", "Non"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={busy}
                onClick={() => setYesNo(opt)}
                style={{
                  border: yesNo === opt ? "1.5px solid var(--gold)" : "1px solid var(--navy-100)",
                  background: yesNo === opt ? "rgba(200,165,92,0.12)" : "#fff",
                  color: "var(--navy)",
                  fontWeight: yesNo === opt ? 700 : 500,
                  borderRadius: 999,
                  padding: "9px 26px",
                  fontSize: 14,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
          {yesNo === "Oui" && (
            <input
              value={precision}
              onChange={(e) => setPrecision(e.target.value)}
              placeholder="Précision (facultatif)…"
              disabled={busy}
              style={{ ...inputBase, width: "100%", marginTop: 8 }}
            />
          )}
        </div>
      )}

      {kind.kind === "texte" && (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Votre réponse…"
          rows={3}
          disabled={busy}
          style={{ ...inputBase, width: "100%", resize: "vertical" }}
        />
      )}

      <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={() => onSubmit(composed)}
          disabled={disabled}
          style={{
            ...buttonStyle(answerDone ? "ghost" : "primary"),
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {busy ? "Envoi…" : answerDone ? "Modifier" : "Répondre"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Chat avec le conseiller — bouton flottant + panneau, historique poll 8 s.   */

type ChatMessage = {
  id: string;
  item_index: number | null;
  author: "client" | "conseiller";
  body: string;
  created_at: string;
};

function ChatWidget({
  token,
  open,
  setOpen,
  prefill,
}: {
  token: string;
  open: boolean;
  setOpen: (o: boolean) => void;
  prefill: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  // Pré-remplissage quand on arrive depuis « Une question sur ce document ? »
  // (ajustement pendant le rendu — pas d'effect, cf. règles React).
  const [lastPrefill, setLastPrefill] = useState(prefill);
  if (prefill !== lastPrefill) {
    setLastPrefill(prefill);
    if (prefill) setDraft(prefill);
  }

  // Historique : chargé à l'ouverture puis rafraîchi toutes les 8 s.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/collecte/${encodeURIComponent(token)}/messages`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as { messages: ChatMessage[] };
        if (!cancelled) setMessages(json.messages ?? []);
      } catch {
        // silencieux : on retentera au prochain tick
      }
    };
    void load();
    const t = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [open, token]);

  const send = useCallback(async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/collecte/${encodeURIComponent(token)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok: true; message: ChatMessage }
        | null;
      if (res.ok && json && "message" in json) {
        setMessages((prev) => [...prev, json.message]);
        setDraft("");
      }
    } finally {
      setSending(false);
    }
  }, [draft, sending, token]);

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            right: 18,
            bottom: 18,
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--navy)",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "13px 18px",
            fontSize: 13.5,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(11,28,53,0.35)",
          }}
        >
          <ChatIcon /> Votre conseiller
        </button>
      )}

      {open && (
        <div
          style={{
            position: "fixed",
            right: 0,
            bottom: 0,
            zIndex: 70,
            width: "min(400px, 100vw)",
            maxHeight: "min(560px, 85vh)",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            borderRadius: "16px 16px 0 0",
            boxShadow: "0 -8px 40px rgba(11,28,53,0.25)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "var(--navy)",
              color: "#fff",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Votre conseiller</div>
              <div style={{ fontSize: 11.5, color: "var(--navy-100)" }}>
                Réponse sous 24 h ouvrées
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer la conversation"
              style={{
                border: "none",
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                borderRadius: 8,
                width: 30,
                height: 30,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 14, background: "var(--ivory)" }}>
            {messages.length === 0 && (
              <p style={{ fontSize: 12.5, color: "var(--navy-300)", textAlign: "center", margin: "24px 8px" }}>
                Posez votre question sur un document ou sur votre dossier — votre conseiller vous
                répond directement ici.
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: m.author === "client" ? "flex-end" : "flex-start",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "9px 12px",
                    borderRadius: 12,
                    fontSize: 13,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    background: m.author === "client" ? "var(--navy)" : "#fff",
                    color: m.author === "client" ? "#fff" : "var(--navy)",
                    border: m.author === "client" ? "none" : "1px solid var(--navy-100)",
                  }}
                >
                  {m.body}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid var(--navy-100)" }}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Écrire à votre conseiller…"
              rows={2}
              style={{
                flex: 1,
                border: "1px solid var(--navy-100)",
                borderRadius: 10,
                padding: "9px 11px",
                fontSize: 13,
                fontFamily: "inherit",
                resize: "none",
                color: "#222",
              }}
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={sending || draft.trim() === ""}
              style={{
                ...buttonStyle("primary"),
                alignSelf: "flex-end",
                opacity: sending || draft.trim() === "" ? 0.5 : 1,
              }}
            >
              {sending ? "…" : "Envoyer"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
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
