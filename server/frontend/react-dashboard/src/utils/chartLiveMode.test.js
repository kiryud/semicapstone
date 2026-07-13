import { describe, expect, it } from "vitest";
import {
  countNewChartPoints,
  getCompletedChartHistory,
  getLiveChartDomain,
} from "./chartLiveMode.js";

const points = Array.from({ length: 11 }, (_, index) => ({
  received_at: `2026-01-01T00:00:${String(index).padStart(2, "0")}.000Z`,
  co2: 700 + index,
}));

describe("chart live presentation", () => {
  it("keeps all one-minute points", () => {
    expect(getCompletedChartHistory(points, "1m", 1)).toBe(points);
  });

  it("removes only the currently forming long-range bucket", () => {
    const bucketed = [points[4], points[9], points[10]];
    expect(getCompletedChartHistory(bucketed, "10m", 5)).toEqual([
      points[4],
      points[9],
    ]);
  });

  it("anchors a long-range live domain to the completed bucket boundary", () => {
    const domain = getLiveChartDomain(points, "10m", 5);
    expect(domain.endTime).toBe(Date.parse("2026-01-01T00:00:10.000Z"));
    expect(domain.endTime - domain.startTime).toBe(10 * 60 * 1000);
  });

  it("counts completed points received while the view is frozen", () => {
    expect(countNewChartPoints(points, points.slice(0, 8))).toBe(3);
  });
});
