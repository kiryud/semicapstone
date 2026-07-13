import { describe, expect, it } from "vitest";
import { createZoomSelection } from "./chartViewport.js";

const data = Array.from({ length: 5 }, (_, index) => ({
  received_at: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
}));

describe("chart viewport", () => {
  it("creates and clamps a timestamp-based zoom selection", () => {
    const baseTime = Date.parse("2026-01-01T00:00:00.000Z");
    const zoomed = createZoomSelection(data, null, 0.5);
    expect(zoomed).toEqual({
      startTime: baseTime + 1000,
      endTime: baseTime + 3000,
    });
    expect(createZoomSelection(data, zoomed, 2)).toBeNull();
  });

  it("keeps a zoom selection in timestamps when new data arrives", () => {
    const selection = createZoomSelection(data, null, 0.5);
    const nextData = [
      ...data,
      { received_at: "2026-01-01T00:00:05.000Z" },
    ];
    expect(createZoomSelection(nextData, selection, 1)).toEqual(selection);
  });
});
