/** État vide honnête : la donnée existe en base mais le réseau n'a encore rien. */
export function EmptyState({ icon, title, hint }: { icon: string; title: string; hint: string }) {
  return (
    <div className="rounded-md border border-dashed border-[var(--navy-100)] bg-white p-12 text-center">
      <div className="mb-3 text-[34px] leading-none">{icon}</div>
      <div className="mb-2 text-[15px] font-semibold text-[var(--navy)]">{title}</div>
      <p className="mx-auto max-w-md text-[12.5px] leading-relaxed text-[var(--navy-300)]">{hint}</p>
    </div>
  );
}
