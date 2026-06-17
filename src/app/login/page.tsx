"use client";

import { useState, type FormEvent } from "react";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    if (!isSupabaseConfigured()) {
      setStatus("error");
      setError("L'authentification n'est pas encore configurée sur ce serveur.");
      return;
    }

    setStatus("sending");
    setError(null);

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
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
        <div style={{ marginBottom: "28px" }}>
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
            Saisissez votre e-mail professionnel. Nous vous enverrons un lien de
            connexion sécurisé.
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
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
              Vérifiez votre e-mail
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "13.5px",
                lineHeight: 1.5,
                color: "var(--medium-400)",
              }}
            >
              Un lien de connexion a été envoyé à <strong>{email.trim()}</strong>.
              Ouvrez-le depuis cet appareil pour accéder à votre espace.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "12.5px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
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
              style={{
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
              }}
            />

            {error && (
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: "13px",
                  color: "var(--red-text)",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
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
                cursor: status === "sending" ? "wait" : "pointer",
                opacity: status === "sending" ? 0.65 : 1,
                transition: "filter 0.15s ease",
              }}
            >
              {status === "sending" ? "Envoi en cours…" : "Recevoir le lien"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
