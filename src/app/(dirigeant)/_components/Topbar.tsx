import Link from "next/link";

export function Topbar({ current }: { current: string }) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3.5 border-b border-[var(--navy-100)] bg-[var(--ivory)] px-10 py-3.5">
      <div className="flex flex-1 items-center gap-2.5 text-[12.5px] text-[var(--navy-300)]">
        <Link href="/espace-dirigeant" className="cursor-pointer hover:text-[var(--gold)]">
          Cabinet Paris Étoile
        </Link>
        <span className="opacity-50">›</span>
        <span className="font-semibold text-[var(--navy)]">{current}</span>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-md border border-[var(--navy-100)] bg-white text-[var(--navy-300)]">
          🔔
        </div>

        <div className="flex h-[34px] items-center gap-2 rounded-full bg-white pr-3 pl-1 ring-1 ring-[var(--navy-100)]">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--navy)] text-[11px] font-bold text-white">
            LT
          </div>
          <span className="text-[12px] font-semibold text-[var(--navy)]">Luc THILLIEZ</span>
        </div>
      </div>
    </div>
  );
}
