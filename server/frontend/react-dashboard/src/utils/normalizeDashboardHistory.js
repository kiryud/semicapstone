import { normalizeDashboardResponse } from "./normalizeDashboardResponse.js";
import {
  asObject,
  toArray,
  toNumber,
} from "./providerNormalization.js";

const RANGE_FIELDS = ["co2", "pm2_5", "fan_current_mA"];

export function normalizeDashboardHistory(rawData, receivedAt = new Date()) {
  const raw = asObject(rawData);
  const sourceData = Array.isArray(rawData) ? rawData : toArray(raw.data);
  const data = sourceData.map((point) => {
    const source = asObject(point);
    const normalized = normalizeDashboardResponse(
      {
        ...source,
        received_at:
          source.received_at ??
          source.backend_received_at ??
          source.measured_at,
      },
      receivedAt,
    );
    RANGE_FIELDS.forEach((field) => {
      if (source[`${field}_min`] !== undefined) {
        normalized[`${field}_min`] = toNumber(source[`${field}_min`]);
      }
      if (source[`${field}_max`] !== undefined) {
        normalized[`${field}_max`] = toNumber(source[`${field}_max`]);
      }
      if (Array.isArray(source[`${field}_range`])) {
        normalized[`${field}_range`] = source[`${field}_range`]
          .slice(0, 2)
          .map((value) => toNumber(value));
      }
    });
    return normalized;
  });

  return {
    total_points: toNumber(raw.total_points, data.length),
    resolution_seconds: toNumber(raw.resolution_seconds, 1),
    data,
  };
}
