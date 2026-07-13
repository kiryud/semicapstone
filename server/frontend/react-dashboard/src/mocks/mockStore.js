import {
  createAlert,
  createStateEvent,
  DASHBOARD_RANGES,
} from "../models/dashboardModels.js";
import { getAirQualityInsight } from "../utils/airQuality.js";
import { createMockSensorGenerator } from "./mockSensorGenerator.js";
import { MOCK_SCENARIOS, normalizeMockScenario } from "./mockScenarios.js";

const DEFAULT_MAX_HISTORY = 3600;
const MAX_EVENTS = 200;
const MAX_ALERTS = 100;
const HISTORY_RESOLUTIONS = {
  "1m": 1000,
  "10m": 5000,
  "1h": 30000,
};
const AGGREGATED_FIELDS = [
  "co2",
  "temperature",
  "humidity",
  "pm1_0",
  "pm2_5",
  "pm10",
  "voc",
  "fan_speed",
  "fan_voltage",
  "fan_current_mA",
  "fan_power_W",
];
const STATE_PRIORITY = { NORMAL: 0, CAUTION: 1, DANGER: 2 };

function metricSummary(data, key) {
  const values = data.map((point) => Number(point[key])).filter(Number.isFinite);
  if (values.length === 0) {
    return { average: null, delta: null, trend: "STABLE" };
  }

  const delta = values.at(-1) - values[0];
  return {
    average: values.reduce((sum, value) => sum + value, 0) / values.length,
    delta,
    trend: delta > 0 ? "UP" : delta < 0 ? "DOWN" : "STABLE",
  };
}

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

export function aggregateHistoryByTime(data, bucketMilliseconds) {
  if (data.length === 0) return [];
  const buckets = new Map();

  data.forEach((point) => {
    const timestamp = new Date(point.measured_at ?? point.received_at).getTime();
    if (Number.isNaN(timestamp)) return;
    const bucketKey = Math.floor(timestamp / bucketMilliseconds) * bucketMilliseconds;
    let bucket = buckets.get(bucketKey);
    if (!bucket) {
      bucket = {
        count: 0,
        sums: {},
        mins: {},
        maxs: {},
        state: point.state,
        latest: point,
      };
      buckets.set(bucketKey, bucket);
    }

    bucket.count += 1;
    bucket.latest = point;
    if (STATE_PRIORITY[point.state] > STATE_PRIORITY[bucket.state]) {
      bucket.state = point.state;
    }
    AGGREGATED_FIELDS.forEach((field) => {
      const value = Number(point[field]);
      if (!Number.isFinite(value)) return;
      bucket.sums[field] = (bucket.sums[field] ?? 0) + value;
      bucket.mins[field] = Math.min(bucket.mins[field] ?? value, value);
      bucket.maxs[field] = Math.max(bucket.maxs[field] ?? value, value);
    });
  });

  return [...buckets.values()].map((bucket) => {
    const aggregated = { ...bucket.latest, state: bucket.state };
    AGGREGATED_FIELDS.forEach((field) => {
      if (bucket.sums[field] === undefined) return;
      const average = bucket.sums[field] / bucket.count;
      aggregated[field] = Number(average.toFixed(field.includes("voltage") ? 3 : 1));
      aggregated[`${field}_min`] = bucket.mins[field];
      aggregated[`${field}_max`] = bucket.maxs[field];
      aggregated[`${field}_range`] = [bucket.mins[field], bucket.maxs[field]];
    });
    return aggregated;
  });
}

export class MockDashboardStore {
  constructor(options = {}) {
    this.scenario = normalizeMockScenario(options.scenario);
    this.maxHistory = options.maxHistory ?? DEFAULT_MAX_HISTORY;
    this.history = [];
    this.events = [];
    this.alerts = [];
    this.eventSequence = 0;
    this.alertSequence = 0;
    this.generator = createMockSensorGenerator({
      scenario: this.scenario,
      random: options.random,
    });

    const now = new Date(options.now ?? Date.now());
    const seedPoints = Math.min(
      options.seedPoints ?? this.maxHistory,
      this.maxHistory,
    );
    const firstTime = now.getTime() - Math.max(0, seedPoints - 1) * 1000;
    for (let index = 0; index < seedPoints; index += 1) {
      this.addReading(this.generator.next(new Date(firstTime + index * 1000)));
    }
  }

  addReading(reading) {
    const previous = this.history.at(-1);
    this.history.push(reading);
    this.history = this.history.slice(-this.maxHistory);

    if (previous && previous.state !== reading.state) {
      const insight = getAirQualityInsight(reading.co2, reading.pm2_5);
      this.eventSequence += 1;
      this.events.push(
        createStateEvent({
          event_id: `mock-event-${this.eventSequence}`,
          from_state: previous.state,
          to_state: reading.state,
          reason_message: insight.reason,
          co2: reading.co2,
          pm2_5: reading.pm2_5,
          started_at: reading.measured_at,
        }),
      );
      this.events = this.events.slice(-MAX_EVENTS);

      if (reading.state === "DANGER") {
        this.addAlert({
          severity: "DANGER",
          type: "AIR_QUALITY_DANGER",
          message: insight.reason,
          created_at: reading.measured_at,
        });
      }
    }

    if (this.scenario === MOCK_SCENARIOS.SENSOR_ERROR && this.alerts.length === 0) {
      this.addAlert({
        severity: "DANGER",
        type: "SENSOR_ERROR",
        message: "CO2와 PM2.5 센서 데이터의 유효성을 확인해 주세요.",
        created_at: reading.measured_at,
      });
    }
    if (this.scenario === MOCK_SCENARIOS.FAN_ERROR && this.alerts.length === 0) {
      this.addAlert({
        severity: "DANGER",
        type: "FAN_ERROR",
        message: "팬 명령 속도에 비해 측정 전류가 비정상적으로 낮습니다.",
        created_at: reading.measured_at,
      });
    }
  }

  addAlert(values) {
    this.alertSequence += 1;
    this.alerts.push(
      createAlert({
        alert_id: `mock-alert-${this.alertSequence}`,
        ...values,
      }),
    );
    this.alerts = this.alerts.slice(-MAX_ALERTS);
  }

  advanceTo(now = new Date()) {
    if (this.scenario === MOCK_SCENARIOS.STALE) return;

    const targetTime = new Date(now).getTime();
    let lastTime = new Date(this.history.at(-1)?.measured_at ?? targetTime).getTime();
    let safetyCounter = 0;
    while (lastTime + 1000 <= targetTime && safetyCounter < 120) {
      lastTime += 1000;
      this.addReading(this.generator.next(new Date(lastTime)));
      safetyCounter += 1;
    }
  }

  getLatest() {
    return clone(this.history.at(-1));
  }

  selectRange(range = "1m") {
    const duration = DASHBOARD_RANGES[range] ?? DASHBOARD_RANGES["1m"];
    const latestTime = new Date(this.history.at(-1)?.measured_at ?? 0).getTime();
    return this.history.filter(
      (point) => new Date(point.measured_at).getTime() >= latestTime - duration,
    );
  }

  getHistory({ range = "1m" } = {}) {
    const selected = this.selectRange(range);
    const resolution = HISTORY_RESOLUTIONS[range] ?? HISTORY_RESOLUTIONS["1m"];
    const data = aggregateHistoryByTime(selected, resolution);

    return clone({
      total_points: selected.length,
      resolution_seconds: resolution / 1000,
      data,
    });
  }

  getSummary({ range = "1h" } = {}) {
    const data = this.selectRange(range);
    const latest = data.at(-1);
    let currentStateDurationSeconds = 0;
    if (latest) {
      const stateStart = [...data]
        .reverse()
        .find((point, index, reversed) => reversed[index + 1]?.state !== point.state);
      currentStateDurationSeconds = stateStart
        ? Math.max(
            0,
            (new Date(latest.measured_at).getTime() -
              new Date(stateStart.measured_at).getTime()) /
              1000,
          )
        : 0;
    }

    return clone({
      co2: metricSummary(data, "co2"),
      pm2_5: metricSummary(data, "pm2_5"),
      current_state_duration_seconds: Math.floor(currentStateDurationSeconds),
      fan_energy_Wh: data.reduce(
        (sum, point) => sum + Number(point.fan_power_W || 0) / 3600,
        0,
      ),
    });
  }

  getEvents({ limit = 20 } = {}) {
    return clone(this.events.slice(-limit).reverse());
  }

  getAlerts({ limit = 20 } = {}) {
    return clone(this.alerts.slice(-limit).reverse());
  }

}
