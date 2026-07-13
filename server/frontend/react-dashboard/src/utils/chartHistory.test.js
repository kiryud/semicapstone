import { describe, expect, it } from "vitest";
import { appendChartPoint, MAX_CHART_POINTS } from "./chartHistory.js";

function makePoint(index) {
  return {
    received_at: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
    state: index < 30 ? "NORMAL" : "CAUTION",
    co2: 800 + index,
    pm2_5: 20 + index,
    fan_current_mA: 40 + index,
  };
}

describe("appendChartPoint", () => {
  it("rejects duplicate and older timestamps", () => {
    const history = [makePoint(2)];
    expect(appendChartPoint(history, makePoint(2))).toBe(history);
    expect(appendChartPoint(history, makePoint(1))).toBe(history);
  });

  it("keeps only the latest 60 points", () => {
    const history = Array.from({ length: 61 }, (_, index) => makePoint(index));
    const result = history.reduce(appendChartPoint, []);
    expect(result).toHaveLength(MAX_CHART_POINTS);
    expect(result[0].co2).toBe(801);
    expect(result.at(-1).co2).toBe(860);
    expect(result.at(-1).state).toBe("CAUTION");
  });
});
