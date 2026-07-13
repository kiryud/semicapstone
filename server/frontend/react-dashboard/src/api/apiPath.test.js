import { describe, expect, it } from "vitest";
import { createApiPath } from "./apiPath.js";

describe("createApiPath", () => {
  it("adds device-aware query parameters safely", () => {
    expect(
      createApiPath("/api/dashboard/history", {
        device_id: "chamber 1",
        range: "10m",
        empty: null,
      }),
    ).toBe("/api/dashboard/history?device_id=chamber+1&range=10m");
  });
});
