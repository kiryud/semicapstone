import { describe, expect, it, vi } from "vitest";
import { createChartOptions } from "./chartOptions.js";

const metric = {
  key: "pm2_5",
  unit: "µg/m³",
  thresholds: [{ value: 35, color: "#F59E0B", label: "주의" }],
};

describe("Chart.js options", () => {
  it("maps the persistent viewport and threshold annotation", () => {
    const options = createChartOptions({
      metric,
      range: "10m",
      bounds: { min: 0, max: 80 },
      viewport: { startTime: 1000, endTime: 2000 },
      extent: { min: 0, max: 3000 },
      interactive: true,
      onViewportChange: vi.fn(),
    });

    expect(options.scales.x.min).toBe(1000);
    expect(options.scales.x.max).toBe(2000);
    expect(options.plugins.annotation.annotations["pm2_5-35"].yMin).toBe(35);
    expect(options.plugins.zoom.pan.enabled).toBe(true);
  });

  it("shows min-max details only for long-range average points", () => {
    const options = createChartOptions({
      metric,
      range: "10m",
      bounds: { min: 0, max: 80 },
      interactive: false,
    });
    const tooltipItem = { raw: { min: 10, max: 20 } };
    expect(options.plugins.tooltip.callbacks.afterLabel(tooltipItem)).toBe(
      "최소–최대: 10–20 µg/m³",
    );
  });
});
