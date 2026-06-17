"use client";

import { createBrowserClient } from "@supabase/ssr";

import { cookieOptionsForHost } from "./cookie-domain";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase n'est pas encore configuré. Ajoute NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local",
    );
  }
  const cookieOptions =
    typeof window !== "undefined" ? cookieOptionsForHost(window.location.hostname) : undefined;
  return createBrowserClient(url, key, cookieOptions ? { cookieOptions } : undefined);
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
