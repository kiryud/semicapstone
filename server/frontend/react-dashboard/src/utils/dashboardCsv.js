const CSV_COLUMNS = [
  ["received_at", (point) => point.received_at],
  ["measured_at", (point) => point.measured_at],
  ["device_id", (point) => point.device_id],
  ["sequence", (point) => point.sequence],
  ["state", (point) => point.state],
  ["co2_ppm", (point) => point.co2],
  ["co2_min_ppm", (point) => rangeValue(point, "co2", 0)],
  ["co2_max_ppm", (point) => rangeValue(point, "co2", 1)],
  ["pm1_0_ug_m3", (point) => point.pm1_0],
  ["pm2_5_ug_m3", (point) => point.pm2_5],
  ["pm2_5_min_ug_m3", (point) => rangeValue(point, "pm2_5", 0)],
  ["pm2_5_max_ug_m3", (point) => rangeValue(point, "pm2_5", 1)],
  ["pm10_ug_m3", (point) => point.pm10],
  ["temperature_c", (point) => point.temperature],
  ["humidity_percent", (point) => point.humidity],
  ["voc_ppb", (point) => point.voc],
  ["fan_speed_percent", (point) => point.fan_speed],
  ["fan_voltage_v", (point) => point.fan_voltage],
  ["fan_current_ma", (point) => point.fan_current_mA],
  ["fan_current_min_ma", (point) => rangeValue(point, "fan_current_mA", 0)],
  ["fan_current_max_ma", (point) => rangeValue(point, "fan_current_mA", 1)],
  ["fan_power_w", (point) => point.fan_power_W],
];

function rangeValue(point, key, index) {
  const range = point[`${key}_range`];
  return Array.isArray(range) ? range[index] : point[key];
}

function timestampOf(point) {
  return new Date(point?.received_at).getTime();
}

function escapeCsvValue(value) {
  if (value == null) return "";
  let text = String(value);
  if (typeof value === "string" && /^[=+\-@]/.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) text = `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function selectExportHistory(history, domain) {
  if (!domain) return history;
  return history.filter((point) => {
    const timestamp = timestampOf(point);
    return Number.isFinite(timestamp) &&
      timestamp >= domain.startTime &&
      timestamp <= domain.endTime;
  });
}

export function createDashboardCsv(history, { range, resolutionSeconds }) {
  const metadataColumns = ["chart_range", "resolution_seconds"];
  const header = [
    ...metadataColumns,
    ...CSV_COLUMNS.map(([name]) => name),
  ];
  const rows = history.map((point) => [
    range,
    resolutionSeconds,
    ...CSV_COLUMNS.map(([, getValue]) => getValue(point)),
  ]);
  return `\uFEFF${[header, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\r\n")}`;
}

export function createDashboardCsvFilename({ deviceId, range, exportedAt }) {
  const safeDeviceId = String(deviceId || "device").replace(/[^a-zA-Z0-9_-]/g, "-");
  const date = new Date(exportedAt);
  const timestamp = Number.isNaN(date.getTime())
    ? "unknown-time"
    : date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `air-quality_${safeDeviceId}_${range}_${timestamp}.csv`;
}

export function downloadCsv(content, filename) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
