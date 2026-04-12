import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import { useAuth } from "../providers/AuthProvider";

const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

function buildHeaders() {
  return { "Content-Type": "application/json" };
}

function extractMessage(response: Response) {
  return response.json().then((data) => data?.error ?? "Something went wrong.");
}

function getAuthUrl(provider: string) {
  return `${apiBase}/api/auth/oauth/${provider}`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submitLabel = useMemo(() => (mode === "signin" ? "Sign In" : "Create Account"), [mode]);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
    const response = await fetch(`${apiBase}${endpoint}`, {
      method: "POST",
      headers: buildHeaders(),
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorMessage = await extractMessage(response);
      setMessage(errorMessage);
      setIsLoading(false);
      return;
    }

    await response.json();
    await refreshUser();
    setEmail("");
    setPassword("");
    setMessage(null);
    setIsLoading(false);
    navigate("/dashboard");
  }

  return (
    <div className="app-shell">
      <div className="card">
        <div className="brand">
          <p className="eyebrow">Ultimate Bun Starter</p>
          <h1>Full-stack starter with Hono, React, and Drizzle</h1>
        </div>
        <div className="panel">
          <div className="tabs">
            <button className={mode === "signin" ? "tab active" : "tab"} onClick={() => setMode("signin")}>Sign in</button>
            <button className={mode === "signup" ? "tab active" : "tab"} onClick={() => setMode("signup")}>Sign up</button>
          </div>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required />
            </label>
            {message ? <p className="message error">{message}</p> : null}
            <button className="button" type="submit" disabled={isLoading}>
              {isLoading ? "Working…" : submitLabel}
            </button>
          </form>
          <div className="divider">Or continue with</div>
          <div className="oauth-buttons">
            <a className="button button-alt" href={getAuthUrl("github")}>Continue with GitHub</a>
          </div>
        </div>
      </div>
    </div>
  );
}
