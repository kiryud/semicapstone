import {
  asObject,
  toNumber,
} from "./providerNormalization.js";

function normalizeMetric(value) {
  const metric = asObject(value);
  const delta = toNumber(metric.delta);
  return {
    average: toNumber(metric.average),
    delta,
    trend: ["UP", "DOWN", "STABLE"].includes(metric.trend)
      ? metric.trend
      : delta > 0
        ? "UP"
        : delta < 0
          ? "DOWN"
          : "STABLE",
  };
}

export function normalizeDashboardSummary(rawData) {
  const raw = asObject(rawData);

  return {
    co2: normalizeMetric(raw.co2),
    pm2_5: normalizeMetric(raw.pm2_5),
    current_state_duration_seconds: toNumber(
      raw.current_state_duration_seconds,
    ),
    fan_energy_Wh: toNumber(raw.fan_energy_Wh),
  };
}
