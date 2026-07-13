export const MOCK_SCENARIOS = {
  NORMAL: "normal",
  CAUTION: "caution",
  DANGER: "danger",
  CYCLE: "cycle",
  DEMO_CYCLE: "demo-cycle",
  STALE: "stale",
  NETWORK_ERROR: "network-error",
  DATA_GAP: "data-gap",
  SENSOR_ERROR: "sensor-error",
  FAN_ERROR: "fan-error",
};

const TARGETS = {
  [MOCK_SCENARIOS.NORMAL]: { co2: 820, pm2_5: 22 },
  [MOCK_SCENARIOS.CAUTION]: { co2: 1180, pm2_5: 48 },
  [MOCK_SCENARIOS.DANGER]: { co2: 1620, pm2_5: 82 },
};

export function normalizeMockScenario(value) {
  return Object.values(MOCK_SCENARIOS).includes(value)
    ? value
    : MOCK_SCENARIOS.CYCLE;
}

export function getScenarioTarget(scenario, tick) {
  const normalized = normalizeMockScenario(scenario);
  if (
    normalized === MOCK_SCENARIOS.CYCLE ||
    normalized === MOCK_SCENARIOS.DEMO_CYCLE ||
    normalized === MOCK_SCENARIOS.DATA_GAP ||
    normalized === MOCK_SCENARIOS.STALE ||
    normalized === MOCK_SCENARIOS.NETWORK_ERROR
  ) {
    const phases = [
      TARGETS[MOCK_SCENARIOS.NORMAL],
      TARGETS[MOCK_SCENARIOS.CAUTION],
      TARGETS[MOCK_SCENARIOS.DANGER],
    ];
    const phaseDuration =
      normalized === MOCK_SCENARIOS.CYCLE ? 180 : 12;
    return phases[Math.floor((tick % (phaseDuration * 3)) / phaseDuration)];
  }

  if (normalized === MOCK_SCENARIOS.SENSOR_ERROR) {
    return TARGETS[MOCK_SCENARIOS.CAUTION];
  }
  if (normalized === MOCK_SCENARIOS.FAN_ERROR) {
    return TARGETS[MOCK_SCENARIOS.DANGER];
  }
  return TARGETS[normalized];
}
