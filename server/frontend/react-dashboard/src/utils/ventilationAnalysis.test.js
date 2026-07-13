import { describe, expect, it } from "vitest";
import { analyzeVentilationEffect } from "./ventilationAnalysis.js";

function point(seconds, state, fanSpeed, co2, pm2_5) {
  return {
    received_at: new Date(Date.UTC(2026, 0, 1, 0, 0, seconds)).toISOString(),
    state,
    fan_speed: fanSpeed,
    co2,
    pm2_5,
  };
}

describe("ventilation effect analysis", () => {
  it("calculates a completed recovery session and per-minute changes", () => {
    const analysis = analyzeVentilationEffect([
      point(0, "NORMAL", 40, 900, 25),
      point(10, "CAUTION", 70, 1200, 40),
      point(40, "DANGER", 100, 1400, 80),
      point(70, "NORMAL", 40, 800, 20),
    ]);

    expect(analysis).toMatchObject({
      completed_count: 1,
      recovery_rate: 100,
      average_recovery_seconds: 60,
      average_co2_change: -400,
      average_pm2_5_change: -20,
    });
    expect(analysis.sessions[0]).toMatchObject({
      duration_seconds: 60,
      peak_fan_speed: 100,
      co2_change: -400,
    });
  });

  it("keeps an unfinished ventilation session active", () => {
    const analysis = analyzeVentilationEffect([
      point(0, "NORMAL", 40, 900, 20),
      point(10, "CAUTION", 70, 1100, 40),
      point(40, "CAUTION", 70, 1000, 30),
    ]);
    expect(analysis.sessions[0]).toMatchObject({
      completed: false,
      duration_seconds: 30,
      co2_change: -100,
    });
    expect(analysis.completed_count).toBe(0);
  });

  it("marks a session already running at the range boundary as partial", () => {
    const analysis = analyzeVentilationEffect([
      point(10, "DANGER", 100, 1500, 80),
      point(40, "NORMAL", 40, 900, 20),
    ]);
    expect(analysis.sessions[0].partial_start).toBe(true);
    expect(analysis.completed_count).toBe(0);
    expect(analysis.recovery_rate).toBeNull();
  });

  it("returns an empty summary when no elevated ventilation occurred", () => {
    const analysis = analyzeVentilationEffect([
      point(0, "NORMAL", 40, 700, 20),
      point(10, "NORMAL", 40, 710, 21),
    ]);
    expect(analysis.sessions).toHaveLength(0);
    expect(analysis.sessions).toHaveLength(0);
  });
});
