import {
  asObject,
  toArray,
  toIsoTimestamp,
  toText,
} from "./providerNormalization.js";

export function normalizeAlerts(rawData, receivedAt = new Date()) {
  const list = Array.isArray(rawData) ? rawData : toArray(asObject(rawData).data);
  return list.map((value, index) => {
    const alert = asObject(value);
    return {
      alert_id: toText(alert.alert_id, `alert-${index}`),
      related_event_id: alert.related_event_id
        ? toText(alert.related_event_id)
        : null,
      device_id: toText(alert.device_id, "chamber_1"),
      severity: ["NORMAL", "CAUTION", "DANGER"].includes(alert.severity)
        ? alert.severity
        : "CAUTION",
      type: toText(alert.type, "UNKNOWN"),
      message: toText(alert.message, "장치 경고가 발생했습니다."),
      created_at: toIsoTimestamp(alert.created_at, receivedAt),
      acknowledged: alert.acknowledged === true,
    };
  });
}
