import { useCallback, useMemo, useState } from "react";
import { CHART_METRICS, CHART_RANGES } from "../../charts/chartMetrics.js";
import { createZoomSelection } from "../../utils/chartViewport.js";
import {
  countNewChartPoints,
  getCompletedChartHistory,
  getLiveChartDomain,
} from "../../utils/chartLiveMode.js";
import {
  createDashboardCsv,
  createDashboardCsvFilename,
  downloadCsv,
  selectExportHistory,
} from "../../utils/dashboardCsv.js";
import ChartJsPanel from "../charts/ChartJsPanel.jsx";
import ChartViewportControls from "../charts/ChartViewportControls.jsx";

export default function ChartJsTrendSection({
  history,
  range,
  onRangeChange,
  metadata,
  latestData,
}) {
  const [activeMetric, setActiveMetric] = useState(CHART_METRICS[0].key);
  const [viewport, setViewport] = useState(null);
  const [frozenHistory, setFrozenHistory] = useState(null);
  const [frozenDomain, setFrozenDomain] = useState(null);
  const [isManualPaused, setIsManualPaused] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const isLongRange = range !== "1m";
  const resolutionSeconds = metadata?.resolution_seconds ?? 1;
  const completedHistory = useMemo(
    () => getCompletedChartHistory(history, range, resolutionSeconds),
    [history, range, resolutionSeconds],
  );
  const liveDomain = useMemo(
    () => getLiveChartDomain(history, range, resolutionSeconds),
    [history, range, resolutionSeconds],
  );
  const displayedHistory = frozenHistory ?? completedHistory;
  const displayedDomain = frozenDomain ?? liveDomain;
  const exportHistory = useMemo(
    () => selectExportHistory(displayedHistory, viewport ?? displayedDomain),
    [displayedHistory, viewport, displayedDomain],
  );
  const newDataCount = frozenHistory
    ? countNewChartPoints(completedHistory, frozenHistory)
    : 0;
  const selectedMetric =
    CHART_METRICS.find((metric) => metric.key === activeMetric) ?? CHART_METRICS[0];
  const handleViewportChange = useCallback((nextViewport) => {
    setFrozenHistory((current) => current ?? completedHistory);
    setFrozenDomain((current) => current ?? liveDomain);
    setIsManualPaused(false);
    setViewport(nextViewport);
  }, [completedHistory, liveDomain]);

  function resetLiveView() {
    setViewport(null);
    setFrozenHistory(null);
    setFrozenDomain(null);
    setIsManualPaused(false);
  }

  function toggleManualPause() {
    if (isManualPaused) {
      resetLiveView();
    } else {
      setFrozenHistory(completedHistory);
      setFrozenDomain(liveDomain);
      setIsManualPaused(true);
    }
  }

  function changeZoom(factor) {
    const sourceHistory = frozenHistory ?? completedHistory;
    const nextViewport = createZoomSelection(sourceHistory, viewport, factor);
    if (nextViewport) {
      setFrozenHistory(sourceHistory);
      setFrozenDomain((current) => current ?? liveDomain);
      setIsManualPaused(false);
      setViewport(nextViewport);
    } else {
      resetLiveView();
    }
  }

  function handleRangeChange(nextRange) {
    resetLiveView();
    setExportStatus("");
    onRangeChange(nextRange);
  }

  function handleMetricChange(metricKey) {
    resetLiveView();
    setActiveMetric(metricKey);
  }

  function handleCsvExport() {
    if (exportHistory.length === 0) {
      setExportStatus("내보낼 데이터가 없습니다.");
      return;
    }

    try {
      const exportedAt = new Date();
      const content = createDashboardCsv(exportHistory, {
        range,
        resolutionSeconds,
      });
      const filename = createDashboardCsvFilename({
        deviceId: latestData?.device_id ?? exportHistory[0]?.device_id,
        range,
        exportedAt,
      });
      downloadCsv(content, filename);
      setExportStatus(`${exportHistory.length}개 데이터를 CSV로 저장했습니다.`);
    } catch {
      setExportStatus("CSV 파일을 저장하지 못했습니다.");
    }
  }

  return (
    <section aria-labelledby="trend-heading">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand">실시간 추이</p>
          <h2 id="trend-heading" className="mt-1 text-xl font-bold text-brand-navy">
            최근 측정 변화
          </h2>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCsvExport}
            disabled={exportHistory.length === 0}
            title={`현재 표시 범위 ${exportHistory.length}개 데이터 내보내기`}
            className="rounded-xl border border-outline bg-surface px-3 py-2 text-xs font-bold text-brand transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            CSV 내보내기
          </button>
          <button
            type="button"
            onClick={toggleManualPause}
            disabled={Boolean(viewport)}
            title={viewport ? "확대 중에는 실시간 보기로 복귀해 주세요." : undefined}
            aria-pressed={isManualPaused}
            className="rounded-xl border border-outline bg-surface px-3 py-2 text-xs font-bold text-brand transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isManualPaused ? "실시간 재개" : "일시정지"}
          </button>
          <div className="flex items-center gap-1 rounded-xl border border-outline bg-surface p-1" aria-label="차트 표시 범위">
            {CHART_RANGES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleRangeChange(item.value)}
                aria-pressed={range === item.value}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${range === item.value ? "bg-brand text-white" : "text-muted hover:bg-brand-soft hover:text-brand"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {exportStatus && (
        <p className="mb-3 text-right text-xs font-medium text-muted" role="status">
          {exportStatus}
        </p>
      )}

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isLongRange ? (
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1" aria-label="차트 지표 선택">
            {CHART_METRICS.map((metric) => (
              <button
                key={metric.key}
                type="button"
                onClick={() => handleMetricChange(metric.key)}
                aria-pressed={activeMetric === metric.key}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${activeMetric === metric.key ? "bg-white text-brand shadow-sm" : "text-muted hover:text-brand"}`}
              >
                {metric.title}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <p className="text-xs text-muted">
          원본 {metadata?.total_points ?? history.length}개 · 표시 {displayedHistory.length}개
          {metadata?.resolution_seconds > 1
            ? ` · ${metadata.resolution_seconds}초 버킷 집계`
            : ""}
          {isLongRange ? " · 완성 버킷만 표시" : ""}
        </p>
        {isLongRange && (
          <ChartViewportControls
            active={Boolean(viewport)}
            paused={Boolean(frozenHistory)}
            newDataCount={newDataCount}
            onZoomIn={() => changeZoom(0.7)}
            onZoomOut={() => changeZoom(1 / 0.7)}
            onReset={resetLiveView}
          />
        )}
        {!isLongRange && isManualPaused && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
            자동 이동 일시정지
          </span>
        )}
      </div>

      {isLongRange ? (
        <ChartJsPanel
          metric={selectedMetric}
          history={displayedHistory}
          range={range}
          expanded
          viewport={viewport}
          liveDomain={displayedDomain}
          latestValue={latestData?.[selectedMetric.key] ?? history.at(-1)?.[selectedMetric.key]}
          onViewportChange={handleViewportChange}
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          {CHART_METRICS.map((metric) => (
            <ChartJsPanel
              key={metric.key}
              metric={metric}
              history={displayedHistory}
              range={range}
              liveDomain={displayedDomain}
              latestValue={latestData?.[metric.key] ?? history.at(-1)?.[metric.key]}
            />
          ))}
        </div>
      )}
    </section>
  );
}
