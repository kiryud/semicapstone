import { describe, expect, it } from "vitest";
import {
  calculateFanPower,
  CONNECTION_STATES,
  getConnectionStatus,
  getCurrentStateDuration,
  getMetricTrend,
  getRecentStateChanges,
  getThresholdHeadroom,
} from "./dashboardStatus.js";

describe("dashboard status utilities", () => {
  it("classifies live, stale, and degraded connections", () => {
    const receivedAt = "2026-07-11T00:00:00.000Z";
    expect(
      getConnectionStatus({ receivedAt, referenceTime: Date.parse(receivedAt) + 4999 }),
    ).toBe(CONNECTION_STATES.LIVE);
    expect(
      getConnectionStatus({ receivedAt, referenceTime: Date.parse(receivedAt) + 5000 }),
    ).toBe(CONNECTION_STATES.STALE);
    expect(
      getConnectionStatus({ receivedAt, referenceTime: Date.parse(receivedAt), hasError: true }),
    ).toBe(CONNECTION_STATES.DEGRADED);
  });

  it("calculates fan power and threshold headroom", () => {
    expect(calculateFanPower(5.02, 90)).toBeCloseTo(0.4518);
    expect(calculateFanPower("invalid", 90)).toBeNull();
    expect(getThresholdHeadroom("co2", 1200)).toEqual({
      type: "remaining",
      amount: 300,
      label: "위험 기준까지",
    });
    expect(getThresholdHeadroom("pm2_5", 80)).toMatchObject({
      type: "exceeded",
      amount: 5,
    });
  });

  it("calculates average and direction for a metric", () => {
    expect(getMetricTrend([{ co2: 900 }, { co2: 1000 }, { co2: 1200 }], "co2")).toEqual({
      average: 3100 / 3,
      delta: 300,
      trend: "UP",
    });
  });

  it("calculates state duration and recent state changes", () => {
    const history = [
      { received_at: "2026-01-01T00:00:00Z", state: "NORMAL", co2: 900, pm2_5: 20 },
      { received_at: "2026-01-01T00:00:01Z", state: "CAUTION", co2: 1100, pm2_5: 20 },
      { received_at: "2026-01-01T00:00:03Z", state: "CAUTION", co2: 1200, pm2_5: 20 },
    ];
    expect(getCurrentStateDuration(history)).toBe(2);
    expect(getRecentStateChanges(history)).toEqual([
      {
        from: "NORMAL",
        to: "CAUTION",
        received_at: "2026-01-01T00:00:01Z",
        co2: 1100,
        pm2_5: 20,
      },
    ]);
  });

});
