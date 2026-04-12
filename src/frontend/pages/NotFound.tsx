import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="app-shell">
      <div className="card">
        <div className="brand">
          <p className="eyebrow">Ultimate Bun Starter</p>
          <h1>Page not found</h1>
        </div>
        <div className="panel">
          <p>The page you were looking for does not exist.</p>
          <Link className="button button-alt" to="/">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
