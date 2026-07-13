import { describe, expect, it } from "vitest";
import { createMockSensorGenerator } from "./mockSensorGenerator.js";

describe("mock sensor generator", () => {
  it("creates a normalized reading with consistent air quality and power", () => {
    const generator = createMockSensorGenerator({
      scenario: "danger",
      random: () => 0.5,
      initialReading: { co2: 1600, pm2_5: 80, fan_current_mA: 110 },
    });
    const reading = generator.next(new Date("2026-01-01T00:00:00Z"));

    expect(reading).toMatchObject({
      device_id: "chamber_1",
      sequence: 1,
      state: "DANGER",
      fan_speed: 100,
    });
    expect(reading.fan_power_W).toBeCloseTo(
      reading.fan_voltage * (reading.fan_current_mA / 1000),
      2,
    );
    expect(reading.measured_at).toBe("2026-01-01T00:00:00.000Z");
  });

  it("produces abnormally low fan current for the fan error scenario", () => {
    const fanReading = createMockSensorGenerator({
      scenario: "fan-error",
      random: () => 0.5,
      initialReading: { co2: 1600, pm2_5: 80, fan_current_mA: 3 },
    }).next();

    expect(fanReading.fan_current_mA).toBeLessThan(10);
  });

  it("supports a fast demo cycle separately from the long cycle", () => {
    const demo = createMockSensorGenerator({
      scenario: "demo-cycle",
      random: () => 0.5,
    });
    const readings = Array.from({ length: 30 }, (_, index) =>
      demo.next(new Date(Date.UTC(2026, 0, 1, 0, 0, index))),
    );
    expect(new Set(readings.map((reading) => reading.state)).size).toBeGreaterThan(1);
  });
});
