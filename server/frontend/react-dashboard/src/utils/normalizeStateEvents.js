import {
  asObject,
  toAirQualityState,
  toArray,
  toIsoTimestamp,
  toNumber,
  toText,
} from "./providerNormalization.js";

export function normalizeStateEvents(rawData, receivedAt = new Date()) {
  const list = Array.isArray(rawData) ? rawData : toArray(asObject(rawData).data);
  return list.map((value, index) => {
    const event = asObject(value);
    return {
      event_id: toText(event.event_id, `event-${index}`),
      device_id: toText(event.device_id, "chamber_1"),
      from_state: toAirQualityState(event.from_state),
      to_state: toAirQualityState(event.to_state),
      reason_message: toText(
        event.reason_message ?? event.message,
        "상태가 변경되었습니다.",
      ),
      co2: toNumber(event.co2),
      pm2_5: toNumber(event.pm2_5),
      started_at: toIsoTimestamp(event.started_at, receivedAt),
    };
  });
}
