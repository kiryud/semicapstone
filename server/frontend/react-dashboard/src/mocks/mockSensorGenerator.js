import { createDashboardReading } from "../models/dashboardModels.js";
import { calculateAirQuality } from "../utils/airQuality.js";
import { calculateFanPower } from "../utils/dashboardStatus.js";
import {
  getScenarioTarget,
  MOCK_SCENARIOS,
  normalizeMockScenario,
} from "./mockScenarios.js";

function rounded(value, digits = 0) {
  return Number(value.toFixed(digits));
}

export function createMockSensorGenerator(options = {}) {
  const random = options.random ?? Math.random;
  const scenario = normalizeMockScenario(options.scenario);
  let tick = options.tick ?? 0;
  let sequence = options.sequence ?? 0;
  let current = {
    co2: 820,
    temperature: 23.4,
    humidity: 57,
    pm1_0: 14,
    pm2_5: 22,
    pm10: 31,
    fan_voltage: 5.02,
    fan_current_mA: 55,
    ...options.initialReading,
  };

  function randomBetween(min, max) {
    return min + random() * (max - min);
  }

  function approach(value, target, ratio, noise) {
    return value + (target - value) * ratio + randomBetween(-noise, noise);
  }

  function next(now = new Date()) {
    const target = getScenarioTarget(scenario, tick);
    tick += 1;
    sequence += scenario === MOCK_SCENARIOS.DATA_GAP && tick % 15 === 0 ? 2 : 1;

    const nextPm2_5 = Math.max(
      0,
      approach(current.pm2_5, target.pm2_5, 0.35, 2),
    );
    current = {
      ...current,
      co2: Math.max(400, approach(current.co2, target.co2, 0.35, 25)),
      temperature: approach(current.temperature, 23.5, 0.15, 0.2),
      humidity: Math.min(
        85,
        Math.max(25, approach(current.humidity, 58, 0.12, 0.8)),
      ),
      pm1_0: Math.max(0, nextPm2_5 * randomBetween(0.55, 0.78)),
      pm2_5: nextPm2_5,
      pm10: Math.max(nextPm2_5, nextPm2_5 * randomBetween(1.18, 1.48)),
      fan_voltage: approach(current.fan_voltage, 5.02, 0.2, 0.025),
    };

    const co2 = rounded(current.co2);
    const pm2_5 = rounded(current.pm2_5);
    const airQuality = calculateAirQuality(co2, pm2_5);
    const targetCurrent =
      scenario === MOCK_SCENARIOS.FAN_ERROR
        ? 3
        : { NORMAL: 55, CAUTION: 82, DANGER: 112 }[airQuality.state];
    current.fan_current_mA = approach(
      current.fan_current_mA,
      targetCurrent,
      0.4,
      2,
    );

    const measuredAt = new Date(now);
    const backendReceivedAt = new Date(
      measuredAt.getTime() + Math.round(randomBetween(40, 220)),
    );
    const fanVoltage = rounded(current.fan_voltage, 3);
    const fanCurrent = rounded(Math.max(0, current.fan_current_mA), 1);

    return createDashboardReading({
      sequence,
      ...airQuality,
      co2,
      temperature: rounded(current.temperature, 1),
      humidity: rounded(current.humidity, 1),
      pm1_0: rounded(current.pm1_0),
      pm2_5,
      pm10: rounded(current.pm10),
      voc: 0,
      fan_voltage: fanVoltage,
      fan_current_mA: fanCurrent,
      fan_power_W: rounded(calculateFanPower(fanVoltage, fanCurrent), 3),
      measured_at: measuredAt.toISOString(),
      received_at: backendReceivedAt.toISOString(),
    });
  }

  return { next, scenario };
}
