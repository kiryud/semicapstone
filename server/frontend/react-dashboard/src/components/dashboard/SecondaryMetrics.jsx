import { formatSensorValue } from "../../utils/dashboardFormat.js";

const METRICS = [
  { key: "temperature", label: "온도", unit: "°C", digits: 1 },
  { key: "humidity", label: "습도", unit: "%", digits: 1 },
  { key: "pm1_0", label: "PM1.0", unit: "µg/m³", digits: 0 },
  { key: "pm10", label: "PM10", unit: "µg/m³", digits: 0 },
  { key: "voc", label: "VOC", unit: "level", digits: 0 },
];

export default function SecondaryMetrics({ data }) {
  return (
    <section aria-labelledby="secondary-metrics-heading">
      <div className="mb-4">
        <p className="text-sm font-semibold text-brand">환경 세부 정보</p>
        <h2 id="secondary-metrics-heading" className="mt-1 text-xl font-bold text-brand-navy">
          보조 센서
        </h2>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {METRICS.map((metric) => (
          <div key={metric.key} className="rounded-2xl border border-outline bg-surface p-4 shadow-sm sm:p-5">
            <dt className="text-sm font-medium text-muted">{metric.label}</dt>
            <dd className="mt-3 font-mono text-2xl font-bold text-ink">
              {formatSensorValue(data[metric.key], metric.digits)}
              <span className="ml-1 text-xs font-semibold text-muted">{metric.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
