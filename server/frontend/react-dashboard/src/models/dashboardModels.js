export const DASHBOARD_RANGES = {
  "1m": 60 * 1000,
  "10m": 10 * 60 * 1000,
  "1h": 60 * 60 * 1000,
};

export const DEFAULT_DEVICE_ID = "chamber_1";

export function createDashboardReading(values = {}) {
  const timestamp = values.received_at ?? new Date().toISOString();
  return {
    device_id: values.device_id ?? DEFAULT_DEVICE_ID,
    sequence: values.sequence ?? 0,
    state: values.state ?? "NORMAL",
    co2: values.co2 ?? 0,
    temperature: values.temperature ?? 0,
    humidity: values.humidity ?? 0,
    pm1_0: values.pm1_0 ?? 0,
    pm2_5: values.pm2_5 ?? 0,
    pm10: values.pm10 ?? 0,
    voc: values.voc ?? 0,
    fan_speed: values.fan_speed ?? 40,
    fan_voltage: values.fan_voltage ?? 0,
    fan_current_mA: values.fan_current_mA ?? 0,
    fan_power_W: values.fan_power_W ?? 0,
    measured_at: values.measured_at ?? timestamp,
    received_at: timestamp,
  };
}

export function createStateEvent(values) {
  return {
    event_id: values.event_id,
    device_id: values.device_id ?? DEFAULT_DEVICE_ID,
    from_state: values.from_state,
    to_state: values.to_state,
    reason_message: values.reason_message,
    co2: values.co2,
    pm2_5: values.pm2_5,
    started_at: values.started_at,
  };
}

export function createAlert(values) {
  return {
    alert_id: values.alert_id,
    related_event_id: values.related_event_id ?? null,
    device_id: values.device_id ?? DEFAULT_DEVICE_ID,
    severity: values.severity ?? "CAUTION",
    type: values.type,
    message: values.message,
    created_at: values.created_at,
    acknowledged: values.acknowledged ?? false,
  };
}
