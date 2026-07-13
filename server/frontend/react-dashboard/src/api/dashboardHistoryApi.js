import { normalizeDashboardHistory } from "../utils/normalizeDashboardHistory.js";
import { createApiPath } from "./apiPath.js";
import { request } from "./http.js";

export async function fetchDashboardHistory({ deviceId, range }) {
  const receivedAt = new Date();
  const response = await request(
    createApiPath("/api/dashboard/history", {
      device_id: deviceId,
      range,
    }),
  );
  return normalizeDashboardHistory(response, receivedAt);
}
