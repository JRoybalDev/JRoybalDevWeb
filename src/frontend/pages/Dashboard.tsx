import { useAuth } from "../providers/AuthProvider";

export default function Dashboard() {
  const { profile, user, refreshUser, signOut } = useAuth();

  return (
    <div className="app-shell">
      <div className="card">
        <div className="brand">
          <p className="eyebrow">Ultimate Bun Starter</p>
          <h1>Dashboard</h1>
        </div>
        <div className="panel">
          <p className="success">Logged in as <strong>{user?.email}</strong></p>
          <p>Account created: {user ? new Date(user.createdAt).toLocaleString() : "—"}</p>
          <p><strong>Display name:</strong> {profile?.displayName ?? "Not set"}</p>
          <p><strong>Bio:</strong> {profile?.bio ?? "No bio yet."}</p>
          <button className="button" onClick={refreshUser}>
            Refresh profile
          </button>
          <button className="button button-secondary" onClick={signOut}>
            Sign out
          </button>
          <div className="protected-box">
            <h2>Protected Starter Dashboard</h2>
            <p>This page is guarded by the auth provider and only visible after login.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
