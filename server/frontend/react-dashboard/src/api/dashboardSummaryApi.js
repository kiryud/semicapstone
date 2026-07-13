import { normalizeDashboardSummary } from "../utils/normalizeDashboardSummary.js";
import { createApiPath } from "./apiPath.js";
import { request } from "./http.js";

export async function fetchDashboardSummary({ deviceId, range }) {
  const response = await request(
    createApiPath("/api/dashboard/summary", {
      device_id: deviceId,
      range,
    }),
  );
  return normalizeDashboardSummary(response);
}
