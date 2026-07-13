import { describe, expect, it } from "vitest";
import { normalizeDashboardResponse } from "./normalizeDashboardResponse.js";

const fallbackTime = "2026-07-11T03:00:00.000Z";

describe("normalizeDashboardResponse", () => {
  it("normalizes the target flat response and numeric strings", () => {
    const result = normalizeDashboardResponse({
      device_id: "chamber_2",
      state: "CAUTION",
      co2: "1200",
      temperature: "23.7",
      humidity: 65,
      pm1_0: 14,
      pm2_5: "40",
      pm10: 20,
      voc: 2,
      fan_speed: "70",
      fan_voltage: "5.02",
      fan_current_mA: "90.5",
      received_at: "2026-07-11T02:59:59Z",
    });

    expect(result).toEqual({
      device_id: "chamber_2",
      state: "CAUTION",
      co2: 1200,
      temperature: 23.7,
      humidity: 65,
      pm1_0: 14,
      pm2_5: 40,
      pm10: 20,
      voc: 2,
      fan_speed: 70,
      fan_voltage: 5.02,
      fan_current_mA: 90.5,
      received_at: "2026-07-11T02:59:59.000Z",
    });
  });

  it("normalizes the current legacy response", () => {
    const result = normalizeDashboardResponse({
      chartValues: {
        device_id: "null",
        datetime: "null",
        state: "NORMAL",
        data: {
          CO2: 709,
          temperature: 21.2,
          humidity: 60.5,
          pm1_0: 27,
          pm2_5: 27,
          pm10: 28,
          voc: 0,
          fan_speed: 40,
          fan_voltage: 5.028,
          fan_current_mA: 41.6,
        },
      },
    }, fallbackTime);

    expect(result.device_id).toBe("chamber_1");
    expect(result.received_at).toBe(fallbackTime);
    expect(result.co2).toBe(709);
    expect(result.fan_current_mA).toBe(41.6);
  });

  it("falls back for invalid identifiers and timestamps", () => {
    const result = normalizeDashboardResponse(
      {
        device_id: " ",
        state: "UNKNOWN",
        co2: 1500,
        pm2_5: 10,
        received_at: "not-a-date",
      },
      fallbackTime,
    );

    expect(result).toMatchObject({
      device_id: "chamber_1",
      state: "DANGER",
      fan_speed: 100,
      received_at: fallbackTime,
    });
  });

  it("returns a safe model for a missing response", () => {
    expect(normalizeDashboardResponse(null, fallbackTime)).toMatchObject({
      device_id: "chamber_1",
      state: "NORMAL",
      co2: 0,
      pm2_5: 0,
      fan_speed: 40,
      received_at: fallbackTime,
    });
  });

  it("preserves optional sequence, power, and measurement time", () => {
    const result = normalizeDashboardResponse({
      device_id: "chamber_1",
      sequence: "42",
      state: "NORMAL",
      co2: 800,
      pm2_5: 20,
      fan_power_W: "0.45",
      measured_at: "2026-07-11T02:59:58Z",
      backend_received_at: "2026-07-11T02:59:59Z",
      received_at: "2026-07-11T03:00:00Z",
    });

    expect(result).toMatchObject({
      sequence: 42,
      fan_power_W: 0.45,
      measured_at: "2026-07-11T02:59:58.000Z",
      received_at: "2026-07-11T03:00:00.000Z",
    });
  });
});
