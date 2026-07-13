import { apiDashboardProvider } from "./apiDashboardProvider.js";
import { mockDashboardProvider } from "./mockDashboardProvider.js";

export const USE_MOCK =
  String(import.meta.env.VITE_USE_MOCK ?? "true").toLowerCase() === "true";

export const dashboardProvider = USE_MOCK
  ? mockDashboardProvider
  : apiDashboardProvider;

export const DASHBOARD_SCENARIO = dashboardProvider.scenario;
