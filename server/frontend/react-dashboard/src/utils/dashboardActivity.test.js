import { describe, expect, it } from "vitest";
import {
  ACTIVITY_FILTERS,
  createDashboardActivities,
  filterDashboardActivities,
} from "./dashboardActivity.js";

const dangerEvent = {
  event_id: "event-1",
  device_id: "chamber_1",
  from_state: "CAUTION",
  to_state: "DANGER",
  reason_message: "CO2가 위험 기준을 초과했습니다.",
  co2: 1600,
  pm2_5: 30,
  started_at: "2026-07-11T09:00:00Z",
};

const matchingAlert = {
  alert_id: "alert-1",
  device_id: "chamber_1",
  severity: "DANGER",
  type: "AIR_QUALITY_DANGER",
  message: "CO2가 위험 기준을 초과했습니다.",
  created_at: "2026-07-11T09:00:01Z",
  acknowledged: false,
};

describe("dashboard activities", () => {
  it("merges a correlated air-quality event and alert", () => {
    const activities = createDashboardActivities([dangerEvent], [matchingAlert]);
    expect(activities).toHaveLength(1);
    expect(activities[0]).toMatchObject({
      title: "CAUTION → DANGER",
      categories: ["STATE_CHANGE", "ALERT"],
    });
  });

  it("keeps independent device alerts and sorts newest first", () => {
    const sensorAlert = {
      ...matchingAlert,
      alert_id: "alert-2",
      type: "SENSOR_ERROR",
      message: "센서 연결 오류",
      created_at: "2026-07-11T09:00:02Z",
    };
    const activities = createDashboardActivities([dangerEvent], [sensorAlert]);
    expect(activities).toHaveLength(2);
    expect(activities[0].title).toBe("SENSOR_ERROR");
    expect(activities[1].title).toBe("CAUTION → DANGER");
  });

  it("filters merged activities into both state and alert views", () => {
    const activities = createDashboardActivities([dangerEvent], [matchingAlert]);
    expect(filterDashboardActivities(activities, ACTIVITY_FILTERS.STATE_CHANGE)).toHaveLength(1);
    expect(filterDashboardActivities(activities, ACTIVITY_FILTERS.ALERT)).toHaveLength(1);
  });
});
