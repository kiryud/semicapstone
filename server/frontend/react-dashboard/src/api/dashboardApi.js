import { request } from "./http.js";
import { normalizeDashboardResponse } from "../utils/normalizeDashboardResponse.js";
import { createApiPath } from "./apiPath.js";

export async function fetchDashboard({ deviceId } = {}) {
  const receivedAt = new Date();
  const response = await request(
    createApiPath("/api/dashboard", { device_id: deviceId }),
  );
  return normalizeDashboardResponse(response, receivedAt);
}
