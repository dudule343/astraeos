"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { ConformiteType } from "@/lib/conformite";

import {
  advanceConformiteItem,
  getConformitePdfBase64,
  sendForSignature,
} from "./actions";

/**
 * Actions réelles d'une card de pièce (DER / KYC / Lettre de mission) :
 *  - « Envoyer » fait avancer le statut (server action existante).
 *  - « Consulter » télécharge le vrai PDF généré (base64 → Blob).
 *  - « Signer » (LM/DER) déclenche la signature Yousign si la clé est configurée,
 *    sinon affiche un message clair sans planter.
 *
 * Remplace les boutons data-stub inertes par des appels réels.
 */
export function DocCardActions({
  dossierId,
  type,
  title,
  canSend,
  hasPdf,
}: {
  dossierId: string;
  type: ConformiteType;
  title: string;
  canSend: boolean;
  /** La pièce a-t-elle un PDF généré (DER / LM) ? */
  hasPdf: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<null | "view" | "sign">(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleView() {
    setBusy("view");
    setMsg(null);
    try {
      const res = await getConformitePdfBase64(dossierId, type);
      if (!res.ok) {
        setMsg(res.reason);
        return;
      }
      const bytes = Uint8Array.from(atob(res.base64), (ch) => ch.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      // Libère l'URL après laisser le temps à l'onglet de l'ouvrir.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } finally {
      setBusy(null);
    }
  }

  async function handleSign() {
    setBusy("sign");
    setMsg(null);
    try {
      const res = await sendForSignature(dossierId, type);
      if (res.ok) {
        setMsg("Signature électronique envoyée au client (Yousign).");
        router.refresh();
      } else if (res.reason === "yousign_non_configure") {
        setMsg(
          "Signature électronique non configurée (YOUSIGN_API_KEY absente). Utilisez « Envoyer » pour transmettre la pièce par e-mail.",
        );
      } else {
        setMsg(res.reason);
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="mt-3.5 grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={handleView}
          disabled={!hasPdf || busy !== null}
          title={hasPdf ? `Consulter le PDF · ${title}` : "Aperçu PDF indisponible pour cette pièce"}
          className="flex items-center justify-center gap-1 rounded-md border border-[var(--navy-100)] bg-white px-2 py-1.5 text-[10.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === "view" ? "…" : "Consulter"}
        </button>

        {canSend ? (
          <form
            action={() =>
              startTransition(async () => {
                await advanceConformiteItem(dossierId, type);
                router.refresh();
              })
            }
          >
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-1 rounded-md bg-[var(--gold)] px-2 py-1.5 text-[10.5px] font-bold text-white hover:brightness-110 disabled:opacity-60"
            >
              {pending ? "…" : "Envoyer"}
            </button>
          </form>
        ) : (
          <span className="flex items-center justify-center rounded-md bg-[var(--ivory-deep)] px-2 py-1.5 text-[10.5px] font-semibold text-[var(--navy-300)]">
            Envoyé
          </span>
        )}

        <button
          type="button"
          onClick={handleSign}
          disabled={!hasPdf || busy !== null}
          title={hasPdf ? `Signer électroniquement · ${title}` : "Signature indisponible pour cette pièce"}
          className="flex items-center justify-center gap-1 rounded-md border border-[var(--navy-100)] bg-white px-2 py-1.5 text-[10.5px] font-semibold text-[var(--navy)] hover:border-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === "sign" ? "…" : "Signer"}
        </button>
      </div>

      {msg ? (
        <div className="mt-2 rounded-md bg-[var(--ivory)] px-2.5 py-1.5 text-[10px] leading-snug text-[var(--navy-300)]">
          {msg}
        </div>
      ) : null}
    </>
  );
}
