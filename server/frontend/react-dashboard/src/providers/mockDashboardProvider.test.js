import { describe, expect, it } from "vitest";
import { mockDashboardProvider } from "./mockDashboardProvider.js";

describe("mockDashboardProvider", () => {
  it("keeps the provider contract device-aware", async () => {
    await expect(
      mockDashboardProvider.getLatest({ deviceId: "unknown-device" }),
    ).rejects.toMatchObject({
      status: 404,
      errorCode: "DEVICE_NOT_FOUND",
    });
  });
});
