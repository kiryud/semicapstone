import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import "../../charts/chartJsSetup.js";
import {
  createChartDatasets,
  createMetricPoints,
  getChartStats,
  getYAxisBounds,
  hasRangeBand,
} from "../../charts/chartData.js";
import { createChartOptions } from "../../charts/chartOptions.js";
import { formatSensorValue } from "../../utils/dashboardFormat.js";

export default function ChartJsPanel({
  metric,
  history,
  range,
  expanded = false,
  viewport,
  liveDomain,
  latestValue,
  onViewportChange,
}) {
  const points = useMemo(
    () => createMetricPoints(history, metric.key),
    [history, metric.key],
  );
  const stats = useMemo(() => getChartStats(points), [points]);
  const bounds = useMemo(
    () => getYAxisBounds(points, metric),
    [points, metric],
  );
  const chartData = useMemo(
    () => ({ datasets: createChartDatasets(points, metric, range) }),
    [points, metric, range],
  );
  const options = useMemo(
    () => createChartOptions({
      metric,
      range,
      bounds,
      viewport,
      liveDomain,
      extent: points.length > 1
        ? {
            min: Math.min(points[0].x, liveDomain?.startTime ?? points[0].x),
            max: Math.max(points.at(-1).x, liveDomain?.endTime ?? points.at(-1).x),
          }
        : undefined,
      interactive: expanded && points.length > 20,
      onViewportChange,
    }),
    [metric, range, bounds, viewport, liveDomain, expanded, points, onViewportChange],
  );
  const showRangeBand = hasRangeBand(points, range);

  return (
    <article className="min-w-0 rounded-2xl border border-outline bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-ink">{metric.title}</h3>
          <p className="mt-1 text-xs text-muted">{metric.description}</p>
        </div>
        {(stats || latestValue != null) && (
          <p className="font-mono text-lg font-bold text-brand-navy">
            {formatSensorValue(latestValue ?? stats.latest)}{" "}
            <span className="text-xs text-muted">{metric.unit}</span>
          </p>
        )}
      </div>

      <div className={`relative mt-5 w-full ${expanded ? "h-80" : "h-56"}`}>
        <Line
          data={chartData}
          options={options}
          datasetIdKey="id"
          role="img"
          aria-label={`${metric.title} 최근 측정 변화 차트`}
        />
        {points.length < 2 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-center text-xs font-medium text-muted">
            데이터를 수집하고 있습니다.<br />잠시 후 변화 추이가 표시됩니다.
          </div>
        )}
      </div>

      {stats && (
        <div className="mt-4 flex flex-wrap gap-4 border-t border-outline pt-3 text-xs text-muted">
          <span>
            최소 <strong className="text-ink">{formatSensorValue(stats.min)} {metric.unit}</strong>
          </span>
          <span>
            최대 <strong className="text-ink">{formatSensorValue(stats.max)} {metric.unit}</strong>
          </span>
          {range !== "1m" && (
            <span>
              선: 구간 평균{showRangeBand ? " · 영역: 구간 최소–최대" : ""}
            </span>
          )}
        </div>
      )}
      <p className="sr-only">
        {metric.title} 최신값 {latestValue ?? stats?.latest ?? "없음"} {metric.unit}, 최솟값 {stats?.min ?? "없음"}, 최댓값 {stats?.max ?? "없음"}
      </p>
    </article>
  );
}
