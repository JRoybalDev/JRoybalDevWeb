import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export default function ErrorPage({ message = "Something went wrong" }: { message?: string }) {
  return (
    <div className="app-shell">
      <div className="card">
        <div className="brand">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <h1>Error</h1>
          </div>
        </div>
        <div className="panel">
          <p className="text-red-400 mb-4">{message}</p>
          <Link className="button button-alt" to="/">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
