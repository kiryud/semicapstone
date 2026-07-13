import { Navigate, Outlet } from "react-router-dom";
import { hasAccessToken } from "../utils/storage.js";

export default function PublicOnlyRoute() {
  return hasAccessToken() ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
