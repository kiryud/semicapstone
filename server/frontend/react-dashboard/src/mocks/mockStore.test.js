import { describe, expect, it } from "vitest";
import { aggregateHistoryByTime, MockDashboardStore } from "./mockStore.js";

describe("MockDashboardStore", () => {
  it("stores latest data and returns bounded, downsampled history", () => {
    const store = new MockDashboardStore({
      scenario: "cycle",
      now: "2026-01-01T01:00:00Z",
      seedPoints: 600,
      maxHistory: 600,
      random: () => 0.5,
    });
    const history = store.getHistory({ range: "10m", maxPoints: 120 });

    expect(store.getLatest().sequence).toBe(600);
    expect(history.total_points).toBe(600);
    expect(history.data.length).toBeLessThanOrEqual(121);
    expect(history.resolution_seconds).toBe(5);
    expect(history.data[0]).toHaveProperty("co2_min");
    expect(history.data[0]).toHaveProperty("co2_max");
    expect(history.data[0].co2_range).toHaveLength(2);
  });

  it("creates state events, summary, and alerts", () => {
    const store = new MockDashboardStore({
      scenario: "cycle",
      now: "2026-01-01T01:00:00Z",
      seedPoints: 600,
      random: () => 0.5,
    });
    const summary = store.getSummary({ range: "1h" });

    expect(store.getEvents().length).toBeGreaterThan(0);
    expect(store.getAlerts().length).toBeGreaterThan(0);
    expect(summary.co2.average).toBeGreaterThan(0);
    expect(summary.fan_energy_Wh).toBeGreaterThan(0);
  });

  it("aggregates averages and preserves min-max ranges per time bucket", () => {
    const data = [
      {
        measured_at: "2026-01-01T00:00:00Z",
        received_at: "2026-01-01T00:00:00Z",
        state: "NORMAL",
        co2: 800,
        pm2_5: 20,
        fan_current_mA: 50,
      },
      {
        measured_at: "2026-01-01T00:00:04Z",
        received_at: "2026-01-01T00:00:04Z",
        state: "CAUTION",
        co2: 1200,
        pm2_5: 40,
        fan_current_mA: 80,
      },
    ];
    const [bucket] = aggregateHistoryByTime(data, 5000);

    expect(bucket).toMatchObject({
      state: "CAUTION",
      co2: 1000,
      co2_min: 800,
      co2_max: 1200,
      co2_range: [800, 1200],
    });
  });

  it("stops advancing in the stale scenario and exposes fan alerts", () => {
    const staleStore = new MockDashboardStore({
      scenario: "stale",
      now: "2026-01-01T00:00:00Z",
      seedPoints: 2,
      random: () => 0.5,
    });
    const sequence = staleStore.getLatest().sequence;
    staleStore.advanceTo("2026-01-01T00:01:00Z");
    expect(staleStore.getLatest().sequence).toBe(sequence);

    const errorStore = new MockDashboardStore({
      scenario: "fan-error",
      seedPoints: 2,
      random: () => 0.5,
    });
    expect(errorStore.getAlerts()[0].type).toBe("FAN_ERROR");
  });
});
