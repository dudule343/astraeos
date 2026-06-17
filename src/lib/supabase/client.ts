"use client";

import { createBrowserClient } from "@supabase/ssr";

import { cookieDomainForHost } from "./cookie-domain";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase n'est pas encore configuré. Ajoute NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local",
    );
  }
  const domain =
    typeof window !== "undefined" ? cookieDomainForHost(window.location.hostname) : undefined;
  return createBrowserClient(url, key, domain ? { cookieOptions: { domain } } : undefined);
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
