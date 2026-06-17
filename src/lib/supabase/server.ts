import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

import { cookieDomainForHost } from "./cookie-domain";

export async function createClient() {
  const cookieStore = await cookies();
  const domain = cookieDomainForHost((await headers()).get("host"));

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...(domain ? { cookieOptions: { domain } } : {}),
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
