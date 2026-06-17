"use client";

import { useState, type FormEvent } from "react";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Mode = "password" | "magic";
type Status = "idle" | "working" | "sent" | "error";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  fontSize: "14px",
  fontFamily: "inherit",
  color: "var(--navy)",
  background: "var(--ivory)",
  border: "1px solid var(--navy-100)",
  borderRadius: "8px",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12.5px",
  fontWeight: 600,
  margin: "16px 0 8px",
};

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const mail = email.trim();
    if (!mail) return;

    if (!isSupabaseConfigured()) {
      setStatus("error");
      setError("L'authentification n'est pas encore configurée sur ce serveur.");
      return;
    }

    setStatus("working");
    setError(null);
    const supabase = createClient();

    if (mode === "password") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: mail,
        password,
      });
      if (signInError) {
        setStatus("error");
        setError("E-mail ou mot de passe incorrect.");
        return;
      }
      // Rechargement complet : le proxy/middleware lit alors le cookie de session.
      window.location.assign("/");
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: mail,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (otpError) {
      setStatus("error");
      setError("Impossible d'envoyer le lien. Vérifiez l'adresse et réessayez.");
      return;
    }
    setStatus("sent");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--ivory)",
        fontFamily: "var(--font-epilogue), sans-serif",
        color: "var(--navy)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          border: "1px solid var(--ivory-deep)",
          borderRadius: "14px",
          padding: "40px 36px",
          boxShadow: "0 10px 40px rgba(16, 45, 80, 0.08)",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: "10px",
            }}
          >
            Astraeos
          </div>
          <h1 style={{ fontSize: "23px", fontWeight: 700, lineHeight: 1.25, margin: 0 }}>
            Connexion à votre espace
          </h1>
          <p
            style={{
              marginTop: "10px",
              fontSize: "14px",
              lineHeight: 1.5,
              color: "var(--navy-300)",
            }}
          >
            {mode === "password"
              ? "Saisissez votre e-mail et votre mot de passe."
              : "Saisissez votre e-mail : nous vous enverrons un lien de connexion."}
          </p>
        </div>

        {status === "sent" ? (
          <div
            style={{
              padding: "20px",
              borderRadius: "10px",
              background: "var(--gold-100)",
              border: "1px solid var(--gold-200)",
            }}
          >
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Vérifiez votre e-mail</p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "13.5px",
                lineHeight: 1.5,
                color: "var(--medium-400)",
              }}
            >
              Un lien de connexion a été envoyé à <strong>{email.trim()}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="email" style={{ ...labelStyle, marginTop: 0 }}>
              Adresse e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@cabinet.fr"
              style={inputStyle}
            />

            {mode === "password" && (
              <>
                <label htmlFor="password" style={labelStyle}>
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </>
            )}

            {error && (
              <p style={{ margin: "12px 0 0", fontSize: "13px", color: "var(--red-text)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "working"}
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: 700,
                fontFamily: "inherit",
                color: "#fff",
                background: "var(--gold)",
                border: "none",
                borderRadius: "8px",
                cursor: status === "working" ? "wait" : "pointer",
                opacity: status === "working" ? 0.65 : 1,
              }}
            >
              {status === "working"
                ? mode === "password"
                  ? "Connexion…"
                  : "Envoi en cours…"
                : mode === "password"
                  ? "Se connecter"
                  : "Recevoir le lien"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "password" ? "magic" : "password");
                setError(null);
                setStatus("idle");
              }}
              style={{
                width: "100%",
                marginTop: "12px",
                padding: "8px",
                fontSize: "12.5px",
                fontWeight: 600,
                fontFamily: "inherit",
                color: "var(--navy-300)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {mode === "password"
                ? "Recevoir plutôt un lien par e-mail"
                : "Me connecter avec un mot de passe"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
