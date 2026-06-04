/**
 * OAuth 2.0 Google · plomberie complète pour synchroniser Google Calendar
 * avec l'espace ingénieur Astraeos.
 *
 * Flow Calendly-like :
 *   1. L'ingénieur clique "Connecter Google Calendar"
 *   2. POPUP officielle Google s'ouvre (consent screen)
 *   3. Il accepte → redirection vers /api/auth/google/callback
 *   4. Astraeos exchange le `code` contre un access_token + refresh_token
 *   5. Tokens stockés (Supabase si configuré, sinon .data/google-tokens.json)
 *   6. Bouton dans l'UI passe à "Connecté · luc@gmail.com · sync HH:MM"
 *
 * Configuration côté Astraeos (UNE FOIS) :
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REDIRECT_URI (ex: https://astraeos.vercel.app/api/auth/google/callback)
 */

import { promises as fs } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

import { createAdminClient } from "@/lib/supabase/admin";

export type GoogleTokens = {
  engineer_slug: string;            // identifiant logique de l'ingénieur ("luc-thilliez")
  email: string;                    // email Google de l'ingénieur connecté
  access_token: string;
  refresh_token: string;
  expires_at: number;               // epoch ms
  scope: string;
  granted_at: string;               // ISO
};

const TOKENS_PATH = path.join(process.cwd(), ".data", "google-tokens.json");

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
];

export function getOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  return { clientId, clientSecret, redirectUri };
}

export function isOAuthConfigured(): boolean {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig();
  return Boolean(clientId && clientSecret && redirectUri);
}


/**
 * State OAuth auto-signé (HMAC-SHA256 + horodatage, TTL 10 min).
 * Indépendant des cookies : robuste en serverless et quand le flow démarre
 * depuis un autre domaine que le callback (URL de déploiement Vercel, etc.).
 */
export function signState(data: { engineer: string }): string {
  const { clientSecret } = getOAuthConfig();
  const payload = Buffer.from(
    JSON.stringify({ ...data, ts: Date.now() }),
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", clientSecret ?? "astraeos-dev")
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyState(state: string): { engineer: string } | null {
  const dot = state.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  const { clientSecret } = getOAuthConfig();
  const expected = crypto
    .createHmac("sha256", clientSecret ?? "astraeos-dev")
    .update(payload)
    .digest("base64url");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (typeof parsed?.engineer !== "string") return null;
    if (typeof parsed?.ts !== "number" || Date.now() - parsed.ts > 10 * 60 * 1000) return null;
    return { engineer: parsed.engineer };
  } catch {
    return null;
  }
}

export function buildAuthorizeUrl(state: string): string {
  const { clientId, redirectUri } = getOAuthConfig();
  if (!clientId || !redirectUri) {
    throw new Error("Google OAuth non configuré (GOOGLE_CLIENT_ID/REDIRECT_URI manquants)");
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
};

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig();
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth non configuré");
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed: ${res.status} ${text}`);
  }
  return (await res.json()) as GoogleTokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = getOAuthConfig();
  if (!clientId || !clientSecret) throw new Error("Google OAuth non configuré");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google refresh failed: ${res.status} ${text}`);
  }
  return (await res.json()) as GoogleTokenResponse;
}

export async function fetchUserEmail(accessToken: string): Promise<string> {
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Google userinfo failed: ${res.status}`);
  const json = (await res.json()) as { email: string };
  return json.email;
}

// ─── Store tokens (Supabase si configuré, sinon fichier) ───────────────────

function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function readFileTokens(): Promise<GoogleTokens[]> {
  try {
    const raw = await fs.readFile(TOKENS_PATH, "utf-8");
    return JSON.parse(raw) as GoogleTokens[];
  } catch {
    return [];
  }
}

async function writeFileTokens(tokens: GoogleTokens[]): Promise<void> {
  await fs.mkdir(path.dirname(TOKENS_PATH), { recursive: true });
  await fs.writeFile(TOKENS_PATH, JSON.stringify(tokens, null, 2), "utf-8");
}

export async function saveTokens(t: GoogleTokens): Promise<void> {
  if (supabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase.from("google_tokens").upsert(
        {
          engineer_slug: t.engineer_slug,
          email: t.email,
          access_token: t.access_token,
          refresh_token: t.refresh_token,
          expires_at: t.expires_at,
          scope: t.scope,
          granted_at: t.granted_at,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "engineer_slug" },
      );
      if (error) throw error;
      return;
    } catch (err) {
      console.warn("[google-oauth] Supabase save échoué, fallback fichier:", err);
    }
  }
  const all = await readFileTokens();
  const idx = all.findIndex((x) => x.engineer_slug === t.engineer_slug);
  if (idx >= 0) all[idx] = t;
  else all.push(t);
  await writeFileTokens(all);
}

export async function loadTokens(engineer_slug: string): Promise<GoogleTokens | null> {
  if (supabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("google_tokens")
        .select("engineer_slug, email, access_token, refresh_token, expires_at, scope, granted_at")
        .eq("engineer_slug", engineer_slug)
        .maybeSingle();
      if (error) throw error;
      if (data) return { ...data, expires_at: Number(data.expires_at) } as GoogleTokens;
      // Pas de ligne Supabase : on retombe sur le fichier (compat dev / données existantes).
    } catch (err) {
      console.warn("[google-oauth] Supabase load échoué, fallback fichier:", err);
    }
  }
  const all = await readFileTokens();
  return all.find((x) => x.engineer_slug === engineer_slug) ?? null;
}

export async function deleteTokens(engineer_slug: string): Promise<void> {
  if (supabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase.from("google_tokens").delete().eq("engineer_slug", engineer_slug);
      if (error) throw error;
    } catch (err) {
      console.warn("[google-oauth] Supabase delete échoué, fallback fichier:", err);
    }
  }
  const all = await readFileTokens();
  await writeFileTokens(all.filter((x) => x.engineer_slug !== engineer_slug));
}

export async function getFreshAccessToken(engineer_slug: string): Promise<string | null> {
  const t = await loadTokens(engineer_slug);
  if (!t) return null;
  // Refresh si moins de 60s restantes
  if (t.expires_at - Date.now() > 60_000) return t.access_token;
  try {
    const fresh = await refreshAccessToken(t.refresh_token);
    const updated: GoogleTokens = {
      ...t,
      access_token: fresh.access_token,
      expires_at: Date.now() + fresh.expires_in * 1000,
      scope: fresh.scope || t.scope,
    };
    await saveTokens(updated);
    return updated.access_token;
  } catch (err) {
    console.warn("[google-oauth] refresh failed:", err);
    return null;
  }
}
