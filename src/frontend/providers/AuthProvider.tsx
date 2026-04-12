import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Profile, User } from "../../shared/types";

const apiBase = import.meta.env.DEV ? "http://localhost:3000" : "";

type AuthState = {
  user: User | null;
  profile: Profile | null;
};

type AuthContextType = AuthState & {
  loading: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUser() {
  const response = await fetch(`${apiBase}/api/profile`, { credentials: "include" });
  if (!response.ok) return { user: null, profile: null };
  const body = await response.json();
  return {
    user: body.user as User | null,
    profile: body.profile as Profile | null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    const session = await fetchUser();
    setUser(session.user);
    setProfile(session.profile);
    setLoading(false);
  };

  const signOut = async () => {
    await fetch(`${apiBase}/api/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, refreshUser, signOut }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
