import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export type UpdateSessionResult = {
  /** Réponse porteuse des cookies de session rafraîchis. */
  response: NextResponse;
  /** Utilisateur Supabase Auth, ou null (non connecté / config absente / erreur). */
  user: User | null;
};

export async function updateSession(
  request: NextRequest,
): Promise<UpdateSessionResult> {
  // Si Supabase n'est pas encore configuré, on laisse passer la requête
  // (utile tant que .env.local n'est pas rempli — ex: Vercel preview avant setup)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { response: NextResponse.next({ request }), user: null };
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refresh session si nécessaire — et on capture l'utilisateur pour le gate.
  let user: User | null = null;
  try {
    const {
      data: { user: refreshedUser },
    } = await supabase.auth.getUser();
    user = refreshedUser;
  } catch {
    // Erreur réseau ou config invalide — on laisse passer pour ne pas bloquer la nav
  }

  return { response: supabaseResponse, user };
}
