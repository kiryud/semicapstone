import { formatChartTime } from "./chartMetrics.js";

function createAnnotations(metric) {
  return Object.fromEntries(
    metric.thresholds.map((threshold) => [
      `${metric.key}-${threshold.value}`,
      {
        type: "line",
        yMin: threshold.value,
        yMax: threshold.value,
        borderColor: threshold.color,
        borderDash: [4, 4],
        borderWidth: 1.5,
        label: {
          display: true,
          content: threshold.label,
          color: threshold.color,
          backgroundColor: "rgba(255, 255, 255, 0.82)",
          font: { size: 10, weight: "bold" },
          position: "start",
        },
      },
      ``,
    ]),
  );
}

export function createChartOptions({
  metric,
  range,
  bounds,
  viewport,
  liveDomain,
  extent,
  interactive,
  onViewportChange,
}) {
  const commitViewport = ({ chart }) => {
    const { min, max } = chart.scales.x;
    if (Number.isFinite(min) && Number.isFinite(max)) {
      onViewportChange?.({ startTime: min, endTime: max });
    }
  };

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    normalized: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      annotation: { annotations: createAnnotations(metric) },
      tooltip: {
        filter: (item) => item.dataset.id.endsWith("-average"),
        callbacks: {
          title: (items) => formatChartTime(items[0]?.parsed.x, range),
          label: (item) =>
            `${item.dataset.label}: ${item.formattedValue} ${metric.unit}`,
          afterLabel: (item) => {
            const raw = item.raw;
            return range !== "1m" && raw.min !== raw.max
              ? `최소–최대: ${raw.min}–${raw.max} ${metric.unit}`
              : "";
          },
        },
      },
      zoom: {
        limits: {
          x: {
            min: extent?.min,
            max: extent?.max,
            minRange: range === "10m" ? 30_000 : 180_000,
          },
        },
        pan: {
          enabled: interactive,
          mode: "x",
          threshold: 8,
          onPanComplete: commitViewport,
        },
        zoom: {
          mode: "x",
          wheel: { enabled: interactive, speed: 0.08 },
          pinch: { enabled: interactive },
          onZoomComplete: commitViewport,
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        min: viewport?.startTime ?? liveDomain?.startTime,
        max: viewport?.endTime ?? liveDomain?.endTime,
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#64748B",
          font: { size: 10 },
          maxTicksLimit: range === "1m" ? 5 : 7,
          callback: (value) => formatChartTime(value, range),
        },
      },
      y: {
        min: bounds.min,
        max: bounds.max,
        grid: { color: "#E2E8F0", borderDash: [3, 3] },
        border: { display: false },
        ticks: { color: "#64748B", font: { size: 10 } },
      },
    },
  };
}
