import { describe, expect, it } from "vitest";
import {
  createChartDatasets,
  createMetricPoints,
  getChartStats,
  getYAxisBounds,
  hasRangeBand,
} from "./chartData.js";

const metric = {
  key: "co2",
  color: "#2563EB",
  thresholds: [{ value: 1000 }, { value: 1500 }],
};

const history = [
  {
    received_at: "2026-01-01T00:00:00.000Z",
    co2: 700,
    co2_range: [650, 760],
  },
  {
    received_at: "2026-01-01T00:00:05.000Z",
    co2: 800,
    co2_range: [720, 880],
  },
];

describe("Chart.js data adapter", () => {
  it("converts normalized history to numeric x/y points with bucket ranges", () => {
    expect(createMetricPoints(history, "co2")).toEqual([
      {
        x: Date.parse("2026-01-01T00:00:00.000Z"),
        y: 700,
        min: 650,
        max: 760,
      },
      {
        x: Date.parse("2026-01-01T00:00:05.000Z"),
        y: 800,
        min: 720,
        max: 880,
      },
    ]);
  });

  it("uses actual bucket extrema for chart statistics", () => {
    const points = createMetricPoints(history, "co2");
    expect(getChartStats(points)).toEqual({ latest: 800, min: 650, max: 880 });
  });

  it("shows the range band only for aggregated long ranges", () => {
    const points = createMetricPoints(history, "co2");
    expect(hasRangeBand(points, "1m")).toBe(false);
    expect(hasRangeBand(points, "10m")).toBe(true);
    expect(createChartDatasets(points, metric, "1m")).toHaveLength(1);
    expect(createChartDatasets(points, metric, "10m")).toHaveLength(3);
  });

  it("keeps threshold values inside the y-axis bounds", () => {
    const bounds = getYAxisBounds(createMetricPoints(history, "co2"), metric);
    expect(bounds.min).toBeLessThan(650);
    expect(bounds.max).toBeGreaterThan(1500);
  });
});
