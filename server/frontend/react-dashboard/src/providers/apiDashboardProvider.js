import { fetchDashboard } from "../api/dashboardApi.js";
import { fetchDashboardHistory } from "../api/dashboardHistoryApi.js";
import { fetchDashboardSummary } from "../api/dashboardSummaryApi.js";
import { fetchDashboardEvents } from "../api/dashboardEventsApi.js";
import { fetchAlerts } from "../api/alertsApi.js";

export const apiDashboardProvider = {
  mode: "api",
  scenario: null,
  capabilities: {
    history: false,
    summary: false,
    events: false,
    alerts: false,
  },

  getLatest: fetchDashboard,
  getHistory: fetchDashboardHistory,
  getSummary: fetchDashboardSummary,
  getEvents: fetchDashboardEvents,
  getAlerts: fetchAlerts,
};
