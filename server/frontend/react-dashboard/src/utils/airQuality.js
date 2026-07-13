const AIR_QUALITY_STATES = {
  NORMAL: "NORMAL",
  CAUTION: "CAUTION",
  DANGER: "DANGER",
};

export const FAN_SPEED_BY_STATE = {
  [AIR_QUALITY_STATES.NORMAL]: 40,
  [AIR_QUALITY_STATES.CAUTION]: 70,
  [AIR_QUALITY_STATES.DANGER]: 100,
};

export const AIR_QUALITY_THRESHOLDS = {
  co2: { caution: 1000, danger: 1500, displayMax: 2000 },
  pm2_5: { caution: 35, danger: 75, displayMax: 100 },
};

export function calculateAirQuality(co2, pm2_5) {
  const safeCo2 = Number.isFinite(Number(co2)) ? Number(co2) : 0;
  const safePm2_5 = Number.isFinite(Number(pm2_5)) ? Number(pm2_5) : 0;

  if (safeCo2 >= 1500 || safePm2_5 > 75) {
    return {
      state: AIR_QUALITY_STATES.DANGER,
      fan_speed: FAN_SPEED_BY_STATE.DANGER,
    };
  }

  if (safeCo2 >= 1000 || safePm2_5 > 35) {
    return {
      state: AIR_QUALITY_STATES.CAUTION,
      fan_speed: FAN_SPEED_BY_STATE.CAUTION,
    };
  }

  return {
    state: AIR_QUALITY_STATES.NORMAL,
    fan_speed: FAN_SPEED_BY_STATE.NORMAL,
  };
}

export function isAirQualityState(value) {
  return Object.values(AIR_QUALITY_STATES).includes(value);
}

function getTriggers(state, co2, pm2_5) {
  if (state === AIR_QUALITY_STATES.DANGER) {
    return [
      co2 >= AIR_QUALITY_THRESHOLDS.co2.danger ? "co2" : null,
      pm2_5 > AIR_QUALITY_THRESHOLDS.pm2_5.danger ? "pm2_5" : null,
    ].filter(Boolean);
  }

  if (state === AIR_QUALITY_STATES.CAUTION) {
    return [
      co2 >= AIR_QUALITY_THRESHOLDS.co2.caution ? "co2" : null,
      pm2_5 > AIR_QUALITY_THRESHOLDS.pm2_5.caution ? "pm2_5" : null,
    ].filter(Boolean);
  }

  return [];
}

export function getAirQualityInsight(co2, pm2_5) {
  const safeCo2 = Number.isFinite(Number(co2)) ? Number(co2) : 0;
  const safePm2_5 = Number.isFinite(Number(pm2_5)) ? Number(pm2_5) : 0;
  const result = calculateAirQuality(safeCo2, safePm2_5);
  const triggers = getTriggers(result.state, safeCo2, safePm2_5);
  const triggerLabel = triggers
    .map((trigger) => (trigger === "co2" ? "CO2" : "PM2.5"))
    .join("와 ");

  if (result.state === AIR_QUALITY_STATES.NORMAL) {
    return {
      ...result,
      triggers,
      reason: "CO2와 PM2.5가 모두 정상 범위입니다.",
    };
  }

  const level = result.state === AIR_QUALITY_STATES.DANGER ? "위험" : "주의";
  return {
    ...result,
    triggers,
    reason: `${triggerLabel}가 ${level} 기준을 초과했습니다.`,
  };
}

export function getMetricState(metric, value) {
  const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const thresholds = AIR_QUALITY_THRESHOLDS[metric];

  if (metric === "pm2_5") {
    if (numericValue > thresholds.danger) return AIR_QUALITY_STATES.DANGER;
    if (numericValue > thresholds.caution) return AIR_QUALITY_STATES.CAUTION;
    return AIR_QUALITY_STATES.NORMAL;
  }

  if (numericValue >= thresholds.danger) return AIR_QUALITY_STATES.DANGER;
  if (numericValue >= thresholds.caution) return AIR_QUALITY_STATES.CAUTION;
  return AIR_QUALITY_STATES.NORMAL;
}
