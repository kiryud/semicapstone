import { normalizeAlerts } from "../utils/normalizeAlerts.js";
import { createApiPath } from "./apiPath.js";
import { request } from "./http.js";

export async function fetchAlerts({ deviceId, limit }) {
  const receivedAt = new Date();
  const response = await request(
    createApiPath("/api/alerts", {
      device_id: deviceId,
      limit,
    }),
  );
  return normalizeAlerts(response, receivedAt);
}
