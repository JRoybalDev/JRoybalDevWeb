import { useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import type { FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../providers/AuthProvider";
import Button from "@frontend/components/Button";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";
  const from = location.state?.from?.pathname || "/dashboard";

  if (user) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
    try {
        const response = await fetch(`${apiBase}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.error ?? "Something went wrong.");
        }

        await refreshUser();
        navigate(from, { replace: true });
    } catch (err: any) {
        setMessage(err.message);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="page-shell flex items-center justify-center min-h-[75vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <p className="eyebrow">Secure Access</p>
          <h1 className="mb-4">{mode === "signin" ? "Sign In" : "Register"}</h1>
          <p className="hero-text !mt-0">
            {mode === "signin" ? "Welcome back. Your usual order?" : "Join us and get your digital brew started."}
          </p>
        </div>

        <div className="card order-slip shadow-xl">
          <form className="form" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[--muted]">Email Address</label>
              <input
                type="email"
                placeholder="barista@jroybal.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[--muted]">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="message danger text-xs"
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 flex flex-col gap-6">
              <Button 
                mode="primary" 
                label={isLoading ? "Processing..." : mode === "signin" ? "Pull the Shot" : "Create Tab"} 
              />
              
              <div className="w-full h-px bg-[--border]" />
              
              <button
                type="button"
                onClick={() => {
                    setMode(mode === "signin" ? "signup" : "signin");
                    setMessage(null);
                }}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-[--muted] hover:text-[--accent] transition-colors"
              >
                {mode === "signin" ? "New here? Create an account" : "Already registered? Sign in"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}