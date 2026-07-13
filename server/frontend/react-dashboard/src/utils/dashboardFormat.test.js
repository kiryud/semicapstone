import { describe, expect, it } from "vitest";
import { formatDuration, formatSensorValue } from "./dashboardFormat.js";

describe("dashboard formatting", () => {
  it("formats sensor values safely", () => {
    expect(formatSensorValue(1200)).toBe("1,200");
    expect(formatSensorValue(23.75, 1)).toBe("23.8");
    expect(formatSensorValue("invalid")).toBe("-");
  });

  it("formats state durations", () => {
    expect(formatDuration(18)).toBe("18초");
    expect(formatDuration(60)).toBe("1분");
    expect(formatDuration(125)).toBe("2분 5초");
    expect(formatDuration(7200)).toBe("2시간");
    expect(formatDuration(7500)).toBe("2시간 5분");
  });
});
