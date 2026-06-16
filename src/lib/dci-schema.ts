export type DciFieldType = "text" | "date" | "number" | "select";
export type DciFieldStatus = "validated" | "ai-agree" | "ai-suggest" | "ai-disagree" | "empty";

export interface DciField {
  key: string;
  label: string;
  value: string;
  type: DciFieldType;
  status: DciFieldStatus;
  options?: string[];
}

export interface DciPerson {
  name: string;
  initials: string;
  role: string;
  color: string;
}

export interface DciGroupPerson {
  type: "person";
  personId: string;
  person: DciPerson;
  fields: DciField[];
}

export interface DciGroupBlock {
  type: "block";
  title: string;
  fields: DciField[];
}

export interface DciGroupRepeat {
  type: "repeatable";
  title: string;
  addLabel: string;
  kind: string;
  items: { fields: DciField[] }[];
}

export type DciGroup = DciGroupPerson | DciGroupBlock | DciGroupRepeat;

export interface DciSection {
  id: string;
  num: string;
  title: string;
  summary: string;
  groups: DciGroup[];
}

export interface DciCanonical {
  sections: DciSection[];
}

const FIELD_TYPES = ["text", "date", "number", "select"] as const;
const STATUSES = ["validated", "ai-agree", "ai-suggest", "ai-disagree", "empty"] as const;
const GROUP_TYPES = ["person", "block", "repeatable"] as const;

export function validateDciCanonical(
  input: unknown,
): { ok: true; value: DciCanonical } | { ok: false; error: string } {
  const isStr = (v: unknown): v is string => typeof v === "string";
  if (!input || typeof input !== "object") return { ok: false, error: "payload doit être un objet" };
  const root = input as Record<string, unknown>;
  if (!Array.isArray(root.sections)) return { ok: false, error: "payload.sections doit être un array" };
  const seenSectionIds = new Set<string>();
  for (const [si, sRaw] of root.sections.entries()) {
    if (!sRaw || typeof sRaw !== "object") return { ok: false, error: `section[${si}] invalide` };
    const s = sRaw as Record<string, unknown>;
    if (!isStr(s.id) || !s.id) return { ok: false, error: `section[${si}].id requis` };
    if (seenSectionIds.has(s.id)) return { ok: false, error: `section id dupliqué: ${s.id}` };
    seenSectionIds.add(s.id);
    if (!isStr(s.num) || !isStr(s.title)) return { ok: false, error: `section[${si}] num/title requis` };
    if (typeof s.summary !== "string") return { ok: false, error: `section[${si}].summary doit être string` };
    if (!Array.isArray(s.groups)) return { ok: false, error: `section[${si}].groups doit être un array` };
    for (const [gi, gRaw] of s.groups.entries()) {
      if (!gRaw || typeof gRaw !== "object") return { ok: false, error: `section[${si}].group[${gi}] invalide` };
      const g = gRaw as Record<string, unknown>;
      if (!isStr(g.type) || !(GROUP_TYPES as readonly string[]).includes(g.type))
        return { ok: false, error: `section[${si}].group[${gi}].type invalide` };
      const fieldArrays: unknown[] = [];
      if (g.type === "person") {
        if (!isStr(g.personId)) return { ok: false, error: `group[${gi}] person.personId requis` };
        if (!g.person || typeof g.person !== "object") return { ok: false, error: `group[${gi}].person requis` };
        const p = g.person as Record<string, unknown>;
        if (!isStr(p.name) || !isStr(p.initials) || !isStr(p.role) || !isStr(p.color))
          return { ok: false, error: `group[${gi}].person champs requis (name/initials/role/color)` };
        if (!Array.isArray(g.fields)) return { ok: false, error: `group[${gi}].fields requis` };
        fieldArrays.push(...g.fields);
      } else if (g.type === "block") {
        if (!isStr(g.title)) return { ok: false, error: `group[${gi}].title requis (block)` };
        if (!Array.isArray(g.fields)) return { ok: false, error: `group[${gi}].fields requis` };
        fieldArrays.push(...g.fields);
      } else {
        if (!isStr(g.title) || !isStr(g.addLabel) || !isStr(g.kind))
          return { ok: false, error: `group[${gi}] repeatable: title/addLabel/kind requis` };
        if (!Array.isArray(g.items)) return { ok: false, error: `group[${gi}].items requis` };
        for (const [ii, itRaw] of g.items.entries()) {
          if (!itRaw || typeof itRaw !== "object" || !Array.isArray((itRaw as Record<string, unknown>).fields))
            return { ok: false, error: `group[${gi}].items[${ii}].fields requis` };
          fieldArrays.push(...((itRaw as Record<string, unknown>).fields as unknown[]));
        }
      }
      for (const [fi, fRaw] of fieldArrays.entries()) {
        if (!fRaw || typeof fRaw !== "object") return { ok: false, error: `group[${gi}].field[${fi}] invalide` };
        const f = fRaw as Record<string, unknown>;
        if (!isStr(f.key) || !f.key) return { ok: false, error: `group[${gi}].field[${fi}].key requis` };
        if (!isStr(f.label)) return { ok: false, error: `field ${String(f.key)} label requis` };
        if (typeof f.value !== "string") return { ok: false, error: `field ${String(f.key)} value doit être string` };
        if (!isStr(f.type) || !(FIELD_TYPES as readonly string[]).includes(f.type))
          return { ok: false, error: `field ${String(f.key)} type invalide` };
        if (!isStr(f.status) || !(STATUSES as readonly string[]).includes(f.status))
          return { ok: false, error: `field ${String(f.key)} status invalide` };
        if (f.type === "select" && f.options !== undefined && !Array.isArray(f.options))
          return { ok: false, error: `field ${String(f.key)} options doit être un array` };
      }
    }
  }
  return { ok: true, value: input as DciCanonical };
}
