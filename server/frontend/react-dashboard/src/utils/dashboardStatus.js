export const CONNECTION_STATES = {
  LIVE: "LIVE",
  STALE: "STALE",
  DEGRADED: "DEGRADED",
};

export function getConnectionStatus({ receivedAt, referenceTime, hasError }) {
  if (hasError) return CONNECTION_STATES.DEGRADED;

  const receivedTime = new Date(receivedAt).getTime();
  const comparedTime = Number(referenceTime);
  if (!Number.isFinite(receivedTime) || !Number.isFinite(comparedTime)) {
    return CONNECTION_STATES.STALE;
  }

  return comparedTime - receivedTime >= 5000
    ? CONNECTION_STATES.STALE
    : CONNECTION_STATES.LIVE;
}

export function calculateFanPower(voltage, currentMilliAmps) {
  const safeVoltage = Number(voltage);
  const safeCurrent = Number(currentMilliAmps);
  if (!Number.isFinite(safeVoltage) || !Number.isFinite(safeCurrent)) return null;
  return safeVoltage * (safeCurrent / 1000);
}

export function getThresholdHeadroom(metric, value) {
  const numericValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const isPm = metric === "pm2_5";
  const caution = isPm ? 35 : 1000;
  const danger = isPm ? 75 : 1500;
  const isDanger = isPm ? numericValue > danger : numericValue >= danger;
  const isCaution = isPm ? numericValue > caution : numericValue >= caution;

  if (isDanger) {
    return {
      type: "exceeded",
      amount: numericValue - danger,
      label: "위험 기준 초과",
    };
  }

  const nextThreshold = isCaution ? danger : caution;
  return {
    type: "remaining",
    amount: Math.max(0, nextThreshold - numericValue),
    label: `${isCaution ? "위험" : "주의"} 기준까지`,
  };
}

export function getMetricTrend(history, dataKey) {
  const values = history
    .map((point) => Number(point[dataKey]))
    .filter(Number.isFinite);
  if (values.length === 0) return null;

  const delta = values.at(-1) - values[0];
  return {
    average: values.reduce((sum, value) => sum + value, 0) / values.length,
    delta,
    trend: delta > 0 ? "UP" : delta < 0 ? "DOWN" : "STABLE",
  };
}

export function getCurrentStateDuration(history) {
  if (history.length === 0) return 0;

  const lastPoint = history.at(-1);
  const endTime = new Date(lastPoint.received_at).getTime();
  if (!lastPoint.state || Number.isNaN(endTime)) return 0;

  let startTime = endTime;
  for (let index = history.length - 2; index >= 0; index -= 1) {
    const point = history[index];
    if (point.state !== lastPoint.state) break;
    const pointTime = new Date(point.received_at).getTime();
    if (!Number.isNaN(pointTime)) startTime = pointTime;
  }

  return Math.max(0, Math.floor((endTime - startTime) / 1000));
}

export function getRecentStateChanges(history, limit = 3) {
  const changes = [];
  for (let index = 1; index < history.length; index += 1) {
    const previous = history[index - 1];
    const current = history[index];
    if (previous.state && current.state && previous.state !== current.state) {
      changes.push({
        from: previous.state,
        to: current.state,
        received_at: current.received_at,
        co2: current.co2,
        pm2_5: current.pm2_5,
      });
    }
  }

  return changes.slice(-Math.max(0, limit)).reverse();
}
