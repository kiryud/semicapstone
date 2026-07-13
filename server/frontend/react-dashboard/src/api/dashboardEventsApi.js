import { normalizeStateEvents } from "../utils/normalizeStateEvents.js";
import { createApiPath } from "./apiPath.js";
import { request } from "./http.js";

export async function fetchDashboardEvents({ deviceId, limit }) {
  const receivedAt = new Date();
  const response = await request(
    createApiPath("/api/dashboard/events", {
      device_id: deviceId,
      limit,
    }),
  );
  return normalizeStateEvents(response, receivedAt);
}
