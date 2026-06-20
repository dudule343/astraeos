"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { ConformiteType } from "@/lib/conformite";

import { sendConformitePack } from "./actions";

/** Une pièce jointe au pack (3 conformité + facture + 2 témoins). */
export type PackPiece = {
  /** Clé stable. Pour les pièces conformité, c'est le ConformiteType. */
  id: string;
  title: string;
  meta: string;
  tagLabel: string;
  tagTone: "navy" | "gold" | "green" | "neutral";
  /** Type de conformité avancé à l'envoi (null = pièce non conformité : facture/témoin). */
  type: ConformiteType | null;
};

const TAG_CLASS: Record<PackPiece["tagTone"], string> = {
  navy: "bg-[var(--navy-100)] text-[var(--navy)]",
  gold: "bg-[var(--gold-100)] text-[var(--gold-deep)]",
  green: "bg-[var(--green-bg)] text-[var(--green-text)]",
  neutral: "bg-[var(--ivory-deep)] text-[var(--navy-300)]",
};

const ICON_CLASS: Record<PackPiece["tagTone"], string> = {
  navy: "bg-[var(--navy-100)] text-[var(--navy)]",
  gold: "bg-[var(--gold-100)] text-[var(--gold-deep)]",
  green: "bg-[var(--green-bg)] text-[var(--green-text)]",
  neutral: "bg-[var(--ivory-deep)] text-[var(--navy-300)]",
};

export function PackSend({
  dossierId,
  emails,
  pieces,
  subject,
  bodyHtml,
}: {
  dossierId: string;
  emails: string[];
  pieces: PackPiece[];
  subject: string;
  bodyHtml: string;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(pieces.map((p) => [p.id, true])),
  );
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    sentCount: number;
    emailSent: boolean;
    error: string | null;
  } | null>(null);

  const selectedCount = pieces.filter((p) => checked[p.id]).length;

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSend() {
    const selectedTypes = pieces
      .filter((p) => checked[p.id] && p.type)
      .map((p) => p.type as ConformiteType);
    startTransition(async () => {
      const res = await sendConformitePack(dossierId, selectedTypes);
      setResult({ sentCount: res.sentCount, emailSent: res.emailSent, error: res.error });
      router.refresh();
    });
  }

  return (
    <section className="mb-[18px] overflow-hidden rounded-md border border-[var(--navy-100)]">
      {/* Header navy */}
      <div className="flex items-center gap-3 bg-[var(--navy)] px-[22px] py-4 text-white">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-white/10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-[18px] w-[18px]"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-bold">
            Envoyer le pack de contractualisation au client
          </div>
          <div className="mt-0.5 text-[11px] text-white/65">
            Sélectionnez les pièces · personnalisez l&apos;e-mail · un seul envoi groupé
          </div>
        </div>
        <span className="rounded-full bg-[var(--gold)]/25 px-3 py-[5px] text-[10px] font-bold tracking-[0.05em] text-[var(--gold-300)]">
          {pieces.length} PIÈCES DISPONIBLES
        </span>
      </div>

      {/* Corps */}
      <div className="bg-white px-[22px] py-[18px]">
        <div className="mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
          Pièces jointes à inclure
        </div>

        <div className="flex flex-col gap-2">
          {pieces.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-[var(--navy-100)] px-3 py-2.5 transition hover:border-[var(--gold)]"
            >
              <input
                type="checkbox"
                checked={checked[p.id] ?? false}
                onChange={() => toggle(p.id)}
                className="h-4 w-4 accent-[var(--gold)]"
              />
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${ICON_CLASS[p.tagTone]}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-semibold text-[var(--navy)]">{p.title}</div>
                <div className="text-[11px] text-[var(--navy-300)]">{p.meta}</div>
              </div>
              <span
                className={`flex-shrink-0 rounded-sm px-2 py-0.5 text-[10px] font-bold ${TAG_CLASS[p.tagTone]}`}
              >
                {p.tagLabel}
              </span>
            </label>
          ))}
        </div>

        {/* E-mail d'accompagnement */}
        <div className="mb-2.5 mt-[18px] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--navy-300)]">
          E-mail d&apos;accompagnement · modifiable
        </div>
        <div className="overflow-hidden rounded-md border border-[var(--navy-100)]">
          <div className="border-b border-[var(--navy-100)] bg-[var(--ivory)] px-4 py-2.5 text-[11.5px] text-[var(--navy-300)]">
            <div>
              <strong className="text-[var(--navy)]">À :</strong> {emails.join(" · ")}
            </div>
            <div className="mt-0.5">
              <strong className="text-[var(--navy)]">Objet :</strong> {subject}
            </div>
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            className="px-4 py-3 text-[12px] leading-relaxed text-[var(--navy)] focus:outline-none [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-2.5 [&_ul]:mb-2.5"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </div>

        {/* Action d'envoi groupé */}
        <div className="mt-4 flex items-center justify-between gap-3.5">
          <div className="text-[10.5px] leading-relaxed text-[var(--navy-300)]">
            {result ? (
              result.error ? (
                <strong className="text-[var(--gold-deep)]">
                  Pièces passées en « envoyé » ({result.sentCount}) · e-mail NON remis : {result.error}
                </strong>
              ) : (
                <strong className="text-[var(--green-text)]">
                  Pack envoyé au client par e-mail · {result.sentCount} pièce(s) jointe(s) en PDF +
                  demande de règlement.
                </strong>
              )
            ) : (
              <>
                <strong className="text-[var(--navy)]">{selectedCount} pièces sélectionnées</strong>{" "}
                · l&apos;envoi déclenche la signature électronique (Yousign) et la demande de
                règlement · le dossier reste en « Conformité en cours » jusqu&apos;à signature +
                paiement.
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={pending || selectedCount === 0}
            className="whitespace-nowrap rounded-md bg-[var(--navy)] px-4 py-2.5 text-[11.5px] font-bold text-white transition hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Envoi…" : "Envoyer le pack au client"}
          </button>
        </div>
      </div>
    </section>
  );
}
