import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, signSession, sessionCookieOptions, safeEqual } from "@/lib/auth";

/** Connexion : { code } → pose le cookie de session si le code est correct. */
export async function POST(req: NextRequest) {
  const accessCode = process.env.ASTRAEOS_ACCESS_CODE;
  if (!accessCode) {
    return NextResponse.json(
      { error: "Configuration serveur incomplète (code d'accès non défini)." },
      { status: 504 },
    );
  }

  let body: { code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Code invalide" }, { status: 401 });
  }

  const code = typeof body.code === "string" ? body.code : "";
  if (!code || !safeEqual(code, accessCode)) {
    return NextResponse.json({ error: "Code invalide" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    SESSION_COOKIE,
    signSession(),
    sessionCookieOptions(req.nextUrl.protocol === "https:"),
  );
  return res;
}

/** Déconnexion : purge le cookie de session. */
export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(req.nextUrl.protocol === "https:"),
    maxAge: 0,
  });
  return res;
}
