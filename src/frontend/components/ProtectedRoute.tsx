import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import LoadingPage from "./LoadingPage";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
