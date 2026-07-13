import { describe, expect, it } from "vitest";
import {
  AIR_QUALITY_THRESHOLDS,
  calculateAirQuality,
  FAN_SPEED_BY_STATE,
  getAirQualityInsight,
  getMetricState,
} from "./airQuality.js";

describe("calculateAirQuality", () => {
  it.each([
    [999, 35, "NORMAL", 40],
    [1000, 35, "CAUTION", 70],
    [1499, 75, "CAUTION", 70],
    [1500, 35, "DANGER", 100],
    [900, 76, "DANGER", 100],
  ])(
    "classifies CO2 %s and PM2.5 %s as %s",
    (co2, pm2_5, state, fanSpeed) => {
      expect(calculateAirQuality(co2, pm2_5)).toEqual({
        state,
        fan_speed: fanSpeed,
      });
    },
  );

  it("maps every state to the required fan speed", () => {
    expect(FAN_SPEED_BY_STATE).toEqual({
      NORMAL: 40,
      CAUTION: 70,
      DANGER: 100,
    });
  });

  it("explains which measurements triggered the state", () => {
    expect(getAirQualityInsight(1600, 80)).toMatchObject({
      state: "DANGER",
      triggers: ["co2", "pm2_5"],
      reason: "CO2와 PM2.5가 위험 기준을 초과했습니다.",
    });
    expect(getAirQualityInsight(1200, 20)).toMatchObject({
      state: "CAUTION",
      triggers: ["co2"],
      reason: "CO2가 주의 기준을 초과했습니다.",
    });
    expect(getAirQualityInsight(800, 20).reason).toBe(
      "CO2와 PM2.5가 모두 정상 범위입니다.",
    );
  });

  it("exposes thresholds and applies metric-specific boundaries", () => {
    expect(AIR_QUALITY_THRESHOLDS.co2).toMatchObject({ caution: 1000, danger: 1500 });
    expect(getMetricState("co2", 1500)).toBe("DANGER");
    expect(getMetricState("pm2_5", 75)).toBe("CAUTION");
    expect(getMetricState("pm2_5", 76)).toBe("DANGER");
  });
});
