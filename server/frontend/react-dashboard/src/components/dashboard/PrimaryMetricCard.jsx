import {
  AIR_QUALITY_THRESHOLDS,
  getMetricState,
} from "../../utils/airQuality.js";
import { formatSensorValue } from "../../utils/dashboardFormat.js";
import {
  getMetricTrend,
  getThresholdHeadroom,
} from "../../utils/dashboardStatus.js";

const METRICS = {
  co2: {
    label: "CO2",
    description: "이산화탄소 농도",
    unit: "ppm",
    cautionText: "주의 1,000",
    dangerText: "위험 1,500",
  },
  pm2_5: {
    label: "PM2.5",
    description: "초미세먼지 농도",
    unit: "µg/m³",
    cautionText: "주의 >35",
    dangerText: "위험 >75",
  },
};

const STATE_COPY = {
  NORMAL: { label: "정상 범위", bar: "bg-emerald-500", text: "text-emerald-700" },
  CAUTION: { label: "주의 범위", bar: "bg-amber-500", text: "text-amber-700" },
  DANGER: { label: "위험 범위", bar: "bg-red-500", text: "text-red-700" },
};

const DIRECTION_LABELS = {
  UP: "상승",
  DOWN: "하락",
  STABLE: "유지",
};

export default function PrimaryMetricCard({ metric, value, history, summary }) {
  const config = METRICS[metric];
  const state = getMetricState(metric, value);
  const stateCopy = STATE_COPY[state];
  const thresholds = AIR_QUALITY_THRESHOLDS[metric];
  const percentage = Math.min(100, Math.max(0, (value / thresholds.displayMax) * 100));
  const trend = summary ?? getMetricTrend(history, metric);
  const headroom = getThresholdHeadroom(metric, value);

  return (
    <article className="rounded-3xl border border-outline bg-surface p-6 shadow-sm">
      <div className="flex min-h-12 items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand">{config.description}</p>
          <h2 className="mt-1 text-xl font-bold text-brand-navy">{config.label}</h2>
        </div>
        <span className={`text-xs font-bold ${stateCopy.text}`}>{stateCopy.label}</span>
      </div>

      <div className="mt-7 flex items-end gap-2">
        <p className="font-mono text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {formatSensorValue(value)}
        </p>
        <p className="pb-1 text-sm font-semibold text-muted">{config.unit}</p>
      </div>

      <div className="mt-6">
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${stateCopy.bar}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] font-medium text-muted">
          <span>{config.cautionText}</span>
          <span>{config.dangerText}</span>
        </div>
      </div>

      <div className="mt-5 min-h-10">
        <p className={`text-xs font-bold ${headroom.type === "exceeded" ? "text-red-700" : "text-muted"}`}>
          {headroom.label} {formatSensorValue(headroom.amount)} {config.unit}
        </p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-outline pt-4 text-xs">
        <div>
          <dt className="text-muted">최근 평균</dt>
          <dd className="mt-1 font-mono font-bold text-ink">
            {trend ? formatSensorValue(trend.average, metric === "pm2_5" ? 1 : 0) : "-"} {config.unit}
          </dd>
        </div>
        <div>
          <dt className="text-muted">최근 변화</dt>
          <dd className="mt-1 font-bold text-ink">
            {trend
              ? `${DIRECTION_LABELS[trend.trend]} ${trend.delta > 0 ? "+" : ""}${formatSensorValue(trend.delta)} ${config.unit}`
              : "수집 중"}
          </dd>
        </div>
      </dl>
      <span className="sr-only">
        {config.label} 현재값 {formatSensorValue(value)} {config.unit}, {stateCopy.label}
      </span>
    </article>
  );
}
