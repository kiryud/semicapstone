import {
  calculateAirQuality,
  FAN_SPEED_BY_STATE,
  isAirQualityState,
} from "./airQuality.js";

const NUMERIC_FIELDS = [
  "temperature",
  "humidity",
  "pm1_0",
  "pm2_5",
  "pm10",
  "voc",
  "fan_voltage",
  "fan_current_mA",
];

function toFiniteNumber(value, fallback = 0) {
  if (value === null || value === "" || typeof value === "boolean") {
    return fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeDeviceId(value) {
  if (value === null || value === undefined) return "chamber_1";

  const deviceId = String(value).trim();
  return deviceId === "" || deviceId.toLowerCase() === "null"
    ? "chamber_1"
    : deviceId;
}

function normalizeTimestamp(value, receivedAt) {
  if (value !== null && value !== undefined && String(value).toLowerCase() !== "null") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  const fallback = new Date(receivedAt);
  return Number.isNaN(fallback.getTime())
    ? new Date().toISOString()
    : fallback.toISOString();
}

export function normalizeDashboardResponse(rawData, receivedAt = new Date()) {
  const raw = rawData && typeof rawData === "object" ? rawData : {};
  const isLegacy = raw.chartValues && typeof raw.chartValues === "object";
  const source = isLegacy ? raw.chartValues : raw;
  const measurements = isLegacy
    ? source.data && typeof source.data === "object"
      ? source.data
      : {}
    : source;

  const co2 = toFiniteNumber(measurements.co2 ?? measurements.CO2);
  const pm2_5 = toFiniteNumber(measurements.pm2_5);
  const calculated = calculateAirQuality(co2, pm2_5);
  const state = isAirQualityState(source.state) ? source.state : calculated.state;
  const rawFanSpeed = toFiniteNumber(measurements.fan_speed, Number.NaN);
  const fanSpeed = Number.isFinite(rawFanSpeed)
    ? rawFanSpeed
    : FAN_SPEED_BY_STATE[state];

  const normalized = {
    device_id: normalizeDeviceId(source.device_id),
    state,
    co2,
    fan_speed: fanSpeed,
    received_at: normalizeTimestamp(
      isLegacy
        ? source.datetime
        : source.received_at ?? source.backend_received_at ?? source.measured_at,
      receivedAt,
    ),
  };

  for (const field of NUMERIC_FIELDS) {
    normalized[field] = toFiniteNumber(measurements[field]);
  }

  if (source.sequence !== undefined) {
    normalized.sequence = toFiniteNumber(source.sequence);
  }
  if (source.measured_at !== undefined) {
    normalized.measured_at = normalizeTimestamp(source.measured_at, receivedAt);
  }
  if (measurements.fan_power_W !== undefined) {
    normalized.fan_power_W = toFiniteNumber(measurements.fan_power_W);
  }
  return normalized;
}
