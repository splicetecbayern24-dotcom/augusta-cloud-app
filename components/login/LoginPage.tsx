"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/rechnungen");
    router.refresh();
  }

  return (
    <div style={styles.page}>
      <div style={styles.glowA} />
      <div style={styles.glowB} />

      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoMark}>A</div>
          <div>
            <div style={styles.logoTop}>AUGUSTA</div>
            <div style={styles.logoBottom}>GERÜSTBAU UG</div>
          </div>
        </div>

        <div style={styles.title}>Anmelden</div>
        <div style={styles.sub}>Melde dich mit deinen Zugangsdaten an</div>

        {error ? <div style={styles.errorBox}>{error}</div> : null}

        <form onSubmit={handleLogin} style={styles.form}>
          <div>
            <label style={styles.label}>E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="deine@email.de"
            />
          </div>

          <div>
            <label style={styles.label}>Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Anmeldung läuft…" : "Einloggen"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#050b14,#081222 45%,#0a1527)",
    display: "grid",
    placeItems: "center",
    position: "relative",
    overflow: "hidden",
    padding: 20,
  },
  glowA: {
    position: "absolute",
    width: 420,
    height: 420,
    right: -120,
    top: -120,
    background: "radial-gradient(circle, rgba(255,191,0,.14), transparent 60%)",
    pointerEvents: "none",
  },
  glowB: {
    position: "absolute",
    width: 600,
    height: 500,
    left: -120,
    bottom: -160,
    background: "radial-gradient(circle, rgba(19,73,170,.2), transparent 65%)",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 28,
    padding: 28,
    border: "1px solid rgba(255,255,255,.08)",
    background: "linear-gradient(180deg, rgba(9,19,37,.95), rgba(7,13,25,.98))",
    color: "#fff",
    position: "relative",
    zIndex: 2,
    boxSizing: "border-box",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 18,
    background: "linear-gradient(135deg,#ffcf3c,#f3b300)",
    color: "#111",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 28,
  },
  logoTop: {
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: ".18em",
  },
  logoBottom: {
    color: "#94a8c9",
    letterSpacing: ".22em",
    fontSize: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: 900,
    marginBottom: 8,
  },
  sub: {
    color: "#93a6c5",
    marginBottom: 18,
  },
  form: {
    display: "grid",
    gap: 14,
  },
  label: {
    display: "block",
    marginBottom: 8,
    color: "#9aaecd",
    fontSize: 14,
  },
  input: {
    width: "100%",
    height: 50,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.07)",
    background: "rgba(5,14,28,.7)",
    color: "#f4f8ff",
    padding: "0 14px",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    height: 50,
    border: "none",
    borderRadius: 16,
    padding: "0 18px",
    background: "linear-gradient(135deg,#ffcf3c,#f3b300)",
    color: "#151515",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 15,
    marginTop: 4,
  },
  errorBox: {
    marginBottom: 14,
    borderRadius: 16,
    padding: 14,
    background: "rgba(255,80,80,.12)",
    border: "1px solid rgba(255,80,80,.2)",
    color: "#ffb4b4",
  },
};
