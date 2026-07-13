import { describe, expect, it } from "vitest";
import {
  createDashboardCsv,
  createDashboardCsvFilename,
  selectExportHistory,
} from "./dashboardCsv.js";

const history = [
  {
    received_at: "2026-07-12T00:00:00.000Z",
    measured_at: "2026-07-12T00:00:00.000Z",
    device_id: "chamber_1",
    sequence: 1,
    state: "NORMAL",
    co2: 700,
    co2_range: [680, 720],
    pm2_5: 20,
    pm2_5_range: [18, 22],
    fan_speed: 40,
    fan_current_mA: 50,
  },
  {
    received_at: "2026-07-12T00:00:05.000Z",
    device_id: "chamber_1",
    sequence: 2,
    state: "CAUTION",
    co2: 1100,
    pm2_5: 30,
    fan_speed: 70,
    fan_current_mA: 80,
  },
];

describe("dashboard CSV export", () => {
  it("selects only points inside the visible timestamp range", () => {
    expect(selectExportHistory(history, {
      startTime: Date.parse("2026-07-12T00:00:01.000Z"),
      endTime: Date.parse("2026-07-12T00:00:06.000Z"),
    })).toEqual([history[1]]);
  });

  it("creates an Excel-compatible CSV with aggregate ranges", () => {
    const csv = createDashboardCsv(history.slice(0, 1), {
      range: "10m",
      resolutionSeconds: 5,
    });
    expect(csv.startsWith("\uFEFFchart_range,resolution_seconds")).toBe(true);
    expect(csv).toContain("co2_min_ppm,co2_max_ppm");
    expect(csv).toContain("10m,5,2026-07-12T00:00:00.000Z");
    expect(csv).toContain(",700,680,720,");
  });

  it("creates a filesystem-safe range-specific filename", () => {
    expect(createDashboardCsvFilename({
      deviceId: "chamber/1",
      range: "1h",
      exportedAt: "2026-07-12T09:10:11.000Z",
    })).toBe("air-quality_chamber-1_1h_20260712T091011Z.csv");
  });
});
