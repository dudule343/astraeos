import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Callback du lien magique : Supabase redirige ici avec un `?code`.
 * On l'échange contre une session (pose des cookies httpOnly via le client SSR),
 * puis on renvoie l'utilisateur vers l'accueil de l'app. En cas d'échec,
 * retour sur /login avec un message d'erreur.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error_description") ?? searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, origin),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=lien_invalide", origin),
    );
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, origin),
    );
  }

  return NextResponse.redirect(new URL("/", origin));
}
