import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

import { cookieOptionsForHost } from "./cookie-domain";

export async function createClient() {
  const cookieStore = await cookies();
  const cookieOptions = cookieOptionsForHost((await headers()).get("host"));

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component context — pas de mutation possible, ignoré
          }
        },
      },
    },
  );
}
