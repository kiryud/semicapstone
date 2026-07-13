import { describe, expect, it } from "vitest";
import { normalizeAlerts } from "./normalizeAlerts.js";
import { normalizeDashboardHistory } from "./normalizeDashboardHistory.js";
import { normalizeDashboardSummary } from "./normalizeDashboardSummary.js";
import { normalizeStateEvents } from "./normalizeStateEvents.js";

const fallbackTime = "2026-01-01T00:00:00.000Z";

describe("provider response normalizers", () => {
  it("normalizes history and preserves aggregate ranges", () => {
    const result = normalizeDashboardHistory({
      device_id: "chamber_1",
      range: "10m",
      total_points: "600",
      resolution_seconds: "5",
      data: [
        {
          state: "CAUTION",
          co2: "1100",
          pm2_5: "40",
          co2_range: ["1000", "1200"],
          received_at: fallbackTime,
        },
      ],
    });
    expect(result).toMatchObject({
      total_points: 600,
      resolution_seconds: 5,
    });
    expect(result.data[0].co2_range).toEqual([1000, 1200]);
  });

  it("normalizes summary values used by metric cards", () => {
    const result = normalizeDashboardSummary(
      {
        co2: { average: "1000", delta: "100", trend: "UP" },
        current_state_duration_seconds: "30",
        fan_energy_Wh: "0.25",
      },
      fallbackTime,
    );
    expect(result.co2).toMatchObject({ average: 1000, delta: 100, trend: "UP" });
    expect(result.current_state_duration_seconds).toBe(30);
    expect(result.fan_energy_Wh).toBe(0.25);
  });

  it("normalizes events and alerts from wrapped arrays", () => {
    const events = normalizeStateEvents(
      { data: [{ from_state: "NORMAL", to_state: "DANGER" }] },
      fallbackTime,
    );
    const alerts = normalizeAlerts(
      { data: [{ severity: "DANGER", acknowledged: true }] },
      fallbackTime,
    );
    expect(events[0]).toMatchObject({
      from_state: "NORMAL",
      to_state: "DANGER",
    });
    expect(alerts[0]).toMatchObject({
      severity: "DANGER",
      acknowledged: true,
    });
  });
});
