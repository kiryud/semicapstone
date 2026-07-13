import { isAirQualityState } from "./airQuality.js";

export function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function toNumber(value, fallback = 0) {
  if (value === null || value === "" || typeof value === "boolean") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function toText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function toIsoTimestamp(value, fallback = new Date()) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  const fallbackDate = new Date(fallback);
  return Number.isNaN(fallbackDate.getTime())
    ? new Date(0).toISOString()
    : fallbackDate.toISOString();
}

export function toAirQualityState(value, fallback = "NORMAL") {
  return isAirQualityState(value) ? value : fallback;
}

export function toArray(value) {
  return Array.isArray(value) ? value : [];
}
