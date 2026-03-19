import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

export default function ProtectedRoute() {
  const user = useAppStore((s) => s.user);

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
}
