import { AIR_QUALITY_THRESHOLDS } from "../utils/airQuality.js";

export const CHART_RANGES = [
  { value: "1m", label: "1분" },
  { value: "10m", label: "10분" },
  { value: "1h", label: "1시간" },
];

export const CHART_METRICS = [
  {
    key: "co2",
    title: "CO2",
    description: "이산화탄소 농도",
    unit: "ppm",
    color: "#2563EB",
    thresholds: [
      { value: AIR_QUALITY_THRESHOLDS.co2.caution, color: "#F59E0B", label: "주의" },
      { value: AIR_QUALITY_THRESHOLDS.co2.danger, color: "#EF4444", label: "위험" },
    ],
  },
  {
    key: "pm2_5",
    title: "PM2.5",
    description: "초미세먼지 농도",
    unit: "µg/m³",
    color: "#0B1F4D",
    thresholds: [
      { value: AIR_QUALITY_THRESHOLDS.pm2_5.caution, color: "#F59E0B", label: "주의" },
      { value: AIR_QUALITY_THRESHOLDS.pm2_5.danger, color: "#EF4444", label: "위험" },
    ],
  },
  {
    key: "fan_current_mA",
    title: "팬 전류",
    description: "팬 소비 전류",
    unit: "mA",
    color: "#60A5FA",
    thresholds: [],
    includeZero: true,
  },
];

export function formatChartTime(value, range) {
  const date = new Date(Number(value));
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: range === "1m" ? "2-digit" : undefined,
    hour12: false,
  });
}
