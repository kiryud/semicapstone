function getRange(point, key, value) {
  const range = point[`${key}_range`];
  if (!Array.isArray(range)) return [value, value];
  const min = Number(range[0]);
  const max = Number(range[1]);
  return Number.isFinite(min) && Number.isFinite(max)
    ? [Math.min(min, max), Math.max(min, max)]
    : [value, value];
}

export function createMetricPoints(history, metricKey) {
  return history.flatMap((point) => {
    const x = new Date(point.received_at).getTime();
    const y = Number(point[metricKey]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return [];
    const [min, max] = getRange(point, metricKey, y);
    return [{ x, y, min, max }];
  });
}

export function hasRangeBand(points, range) {
  return range !== "1m" && points.some((point) => point.min !== point.max);
}

export function getChartStats(points) {
  if (points.length === 0) return null;
  return {
    latest: points.at(-1).y,
    min: Math.min(...points.map((point) => point.min)),
    max: Math.max(...points.map((point) => point.max)),
  };
}

export function getYAxisBounds(points, metric) {
  const values = points.flatMap((point) => [point.min, point.max]);
  metric.thresholds.forEach((threshold) => values.push(threshold.value));
  if (values.length === 0) return { min: 0 };

  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const minimumPadding = metric.key === "co2" ? 50 : 5;
  const padding = Math.max((maximum - minimum) * 0.08, minimumPadding);
  return {
    min: metric.includeZero ? 0 : Math.max(0, Math.floor(minimum - padding)),
    max: Math.ceil(maximum + padding),
  };
}

export function createChartDatasets(points, metric, range) {
  const showBand = hasRangeBand(points, range);
  const average = {
    id: `${metric.key}-average`,
    label: range === "1m" ? "측정값" : "평균",
    data: points,
    parsing: false,
    borderColor: metric.color,
    backgroundColor: metric.color,
    borderWidth: 2.5,
    pointRadius: 0,
    pointHoverRadius: 4,
    tension: 0.25,
  };

  if (!showBand) return [average];

  return [
    {
      id: `${metric.key}-maximum`,
      label: "구간 최대",
      data: points.map((point) => ({ x: point.x, y: point.max })),
      parsing: false,
      borderWidth: 0,
      pointRadius: 0,
    },
    {
      id: `${metric.key}-minimum`,
      label: "구간 최소–최대",
      data: points.map((point) => ({ x: point.x, y: point.min })),
      parsing: false,
      borderWidth: 0,
      pointRadius: 0,
      backgroundColor: `${metric.color}21`,
      fill: "-1",
    },
    average,
  ];
}
