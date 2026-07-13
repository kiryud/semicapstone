import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasAccessToken } from "../utils/storage.js";

export default function ProtectedRoute() {
  const location = useLocation();

  if (!hasAccessToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
