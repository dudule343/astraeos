"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DateSelector } from "./DateSelector";

type TopbarProps = {
  current: string;
};

type Identity = {
  name: string;
  initials: string;
};

const FALLBACK: Identity = { name: "Mon compte", initials: "" };

function buildIdentity(firstName?: string | null, lastName?: string | null): Identity {
  const first = (firstName ?? "").trim();
  const last = (lastName ?? "").trim();
  const name = `${first} ${last}`.trim();
  if (!name) return FALLBACK;
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  return { name, initials };
}

export function Topbar({ current }: TopbarProps) {
  const [identity, setIdentity] = useState<Identity>(FALLBACK);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let cancelled = false;
    const supabase = createClient();

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (cancelled || !profile) return;
      setIdentity(buildIdentity(profile.first_name, profile.last_name));
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="sticky top-0 z-10 flex items-center gap-3.5 border-b border-[var(--navy-100)] bg-[var(--ivory)] px-10 py-3.5">
      <div className="flex flex-1 items-center gap-2.5 text-[12.5px] text-[var(--navy-300)]">
        <Link href="/" className="cursor-pointer hover:text-[var(--gold)]">
          ASTRAEOS Admin
        </Link>
        <span className="opacity-50">›</span>
        <span className="font-semibold text-[var(--navy)]">{current}</span>
      </div>

      <div className="flex items-center gap-2.5">
        <DateSelector />

        <button
          type="button"
          aria-label="Notifications"
          data-stub="Notifications"
          data-stub-body="Le centre de notifications (alertes comptes à risque, échéances, incidents) sera disponible dans une prochaine itération."
          className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-md border border-[var(--navy-100)] bg-white text-[var(--navy-300)] hover:border-[var(--gold)]"
        >
          🔔
        </button>

        <div className="flex h-[34px] items-center gap-2 rounded-full bg-white pr-3 pl-1 ring-1 ring-[var(--navy-100)]">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--navy)] text-[11px] font-bold text-white">
            {identity.initials}
          </div>
          <span className="text-[12px] font-semibold text-[var(--navy)]">{identity.name}</span>
        </div>
      </div>
    </div>
  );
}
