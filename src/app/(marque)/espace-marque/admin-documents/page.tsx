import { Topbar } from "../../_components/Topbar";
import { CATALOG } from "@/lib/collecte-catalog";
import { getCustomTemplateItems, type CustomTemplateItem } from "@/lib/collecte-template";
import { getSessionContext } from "@/lib/auth/context";

import { addTemplateItem, removeTemplateItem } from "./actions";

export const metadata = {
  title: "ASTRAEOS · Espace Marque · Référentiel documentaire",
};

export const dynamic = "force-dynamic";

type BaseItem = { id: string; category: string; sub?: string; label: string; type: string };

export default async function AdminDocumentsPage() {
  const ctx = await getSessionContext();
  const custom = ctx ? await getCustomTemplateItems(ctx.tenantId) : [];

  // Référentiel de base (code) groupé par catégorie, dans l'ordre métier.
  const baseByCat = new Map<string, BaseItem[]>();
  for (const e of CATALOG as BaseItem[]) {
    const arr = baseByCat.get(e.category) ?? [];
    arr.push(e);
    baseByCat.set(e.category, arr);
  }
  const customByCat = new Map<string, CustomTemplateItem[]>();
  for (const c of custom) {
    const arr = customByCat.get(c.category) ?? [];
    arr.push(c);
    customByCat.set(c.category, arr);
  }
  const categories = Array.from(new Set([...baseByCat.keys(), ...customByCat.keys()]));
  const totalBase = CATALOG.length;

  return (
    <>
      <Topbar current="Référentiel documentaire" />
      <div className="px-10 py-8">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
          Administration · Paramétrages
        </div>
        <h1 className="mb-2 text-[28px] font-semibold leading-tight tracking-tight text-[var(--navy)]">
          Référentiel documentaire
        </h1>
        <p className="mb-6 max-w-2xl text-[13px] leading-relaxed text-[var(--navy-300)]">
          La liste des pièces demandées aux clients lors d&apos;une collecte. Le socle ({totalBase}{" "}
          pièces) est livré avec l&apos;outil ; vous pouvez l&apos;étendre en ajoutant vos propres
          pièces ci-dessous — elles s&apos;ajouteront au template de collecte.
          {custom.length > 0 && (
            <> Actuellement <strong>{custom.length}</strong> pièce(s) ajoutée(s).</>
          )}
        </p>

        {/* Formulaire d'ajout */}
        <form
          action={addTemplateItem}
          className="mb-8 grid grid-cols-1 gap-3 rounded-md border border-[var(--navy-100)] bg-white p-4 md:grid-cols-[1fr_1fr_auto_auto]"
        >
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[var(--navy)]">Catégorie</label>
            <input
              name="category"
              list="cat-list"
              required
              placeholder="ex. Immobilier"
              className="w-full rounded-md border border-[var(--navy-100)] px-3 py-2 text-[13px]"
            />
            <datalist id="cat-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[var(--navy)]">
              Libellé de la pièce
            </label>
            <input
              name="label"
              required
              placeholder="ex. Dernier avis de taxe foncière"
              className="w-full rounded-md border border-[var(--navy-100)] px-3 py-2 text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[var(--navy)]">Type</label>
            <select
              name="type"
              className="rounded-md border border-[var(--navy-100)] px-3 py-2 text-[13px]"
            >
              <option value="Document">Document</option>
              <option value="Information">Information</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-md bg-[var(--gold)] px-4 py-2 text-[12.5px] font-bold text-white hover:brightness-110"
            >
              + Ajouter
            </button>
          </div>
        </form>

        {/* Référentiel groupé par catégorie */}
        <div className="flex flex-col gap-3">
          {categories.map((cat) => {
            const base = baseByCat.get(cat) ?? [];
            const adds = customByCat.get(cat) ?? [];
            return (
              <details
                key={cat}
                className="overflow-hidden rounded-md border border-[var(--navy-100)] bg-white"
              >
                <summary className="cursor-pointer list-none px-4 py-3 text-[13.5px] font-semibold text-[var(--navy)]">
                  {cat}
                  <span className="ml-2 text-[11.5px] font-normal text-[var(--navy-300)]">
                    {base.length} de base{adds.length > 0 ? ` · ${adds.length} ajoutée(s)` : ""}
                  </span>
                </summary>
                <div className="border-t border-[var(--navy-100)] px-4 py-2">
                  {adds.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 border-b border-[var(--ivory-deep,#eee)] py-2 last:border-0"
                    >
                      <span className="text-[12.5px] text-[var(--navy)]">
                        <span className="mr-2 rounded bg-[var(--gold-100)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--gold-deep)]">
                          ajoutée
                        </span>
                        {c.label}
                        {c.sub ? <span className="text-[var(--navy-300)]"> · {c.sub}</span> : null}
                        <span className="ml-2 text-[10.5px] text-[var(--navy-300)]">{c.type}</span>
                      </span>
                      <form action={removeTemplateItem}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="rounded border border-[var(--navy-100)] px-2 py-1 text-[10.5px] font-semibold text-[var(--navy-300)] hover:border-[#C0392B] hover:text-[#C0392B]"
                        >
                          Retirer
                        </button>
                      </form>
                    </div>
                  ))}
                  {base.map((b) => (
                    <div
                      key={b.id}
                      className="border-b border-[var(--ivory-deep,#f0f0f0)] py-2 text-[12.5px] text-[var(--navy)] last:border-0"
                    >
                      {b.label}
                      {b.sub ? <span className="text-[var(--navy-300)]"> · {b.sub}</span> : null}
                      <span className="ml-2 text-[10.5px] text-[var(--navy-300)]">{b.type}</span>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </>
  );
}
