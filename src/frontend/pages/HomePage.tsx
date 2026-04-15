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
      {/* Top Section (Hero & Hero Card) */}

      {/* Services Section */}

      {/* Featured Projects Section */}

      {/* CTA Contact Callout */}
    </div>
  );
}
