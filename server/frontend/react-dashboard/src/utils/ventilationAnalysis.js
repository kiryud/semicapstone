const BASELINE_FAN_SPEED = 40;

function timestampOf(point) {
  return new Date(point?.measured_at ?? point?.received_at).getTime();
}

function numericValue(point, key) {
  const value = Number(point?.[key]);
  return Number.isFinite(value) ? value : null;
}

function average(values) {
  const finiteValues = values.filter(Number.isFinite);
  if (finiteValues.length === 0) return null;
  return finiteValues.reduce((sum, value) => sum + value, 0) / finiteValues.length;
}

function isElevatedVentilation(point) {
  return Number(point?.fan_speed) > BASELINE_FAN_SPEED ||
    point?.state === "CAUTION" ||
    point?.state === "DANGER";
}

function metricChange(startPoint, endPoint, key) {
  const start = numericValue(startPoint, key);
  const end = numericValue(endPoint, key);
  return start === null || end === null ? null : end - start;
}

function finishSession(session, endPoint, completed) {
  const endTime = timestampOf(endPoint);
  const durationSeconds = Number.isFinite(endTime)
    ? Math.max(0, Math.floor((endTime - session.startedAtTime) / 1000))
    : 0;
  const co2Change = metricChange(session.startPoint, endPoint, "co2");
  const pm2_5Change = metricChange(session.startPoint, endPoint, "pm2_5");
  const recovered = completed && endPoint?.state === "NORMAL";

  return {
    session_id: `ventilation-${session.startedAtTime}`,
    started_at: session.startPoint.measured_at ?? session.startPoint.received_at,
    duration_seconds: durationSeconds,
    partial_start: session.partialStart,
    completed,
    recovered,
    peak_fan_speed: session.peakFanSpeed,
    co2_change: co2Change,
    pm2_5_change: pm2_5Change,
  };
}

export function analyzeVentilationEffect(history = []) {
  const orderedHistory = history
    .filter((point) => Number.isFinite(timestampOf(point)))
    .toSorted((left, right) => timestampOf(left) - timestampOf(right));
  const sessions = [];
  let activeSession = null;

  orderedHistory.forEach((point, index) => {
    if (isElevatedVentilation(point)) {
      if (!activeSession) {
        activeSession = {
          startPoint: point,
          startedAtTime: timestampOf(point),
          partialStart: index === 0,
          peakFanSpeed: numericValue(point, "fan_speed") ?? 0,
        };
      } else {
        activeSession.peakFanSpeed = Math.max(
          activeSession.peakFanSpeed,
          numericValue(point, "fan_speed") ?? 0,
        );
      }
      return;
    }

    if (activeSession) {
      sessions.push(finishSession(activeSession, point, true));
      activeSession = null;
    }
  });

  if (activeSession && orderedHistory.length > 0) {
    sessions.push(finishSession(activeSession, orderedHistory.at(-1), false));
  }

  const reliableCompleted = sessions.filter(
    (session) => session.completed && !session.partial_start,
  );
  const recovered = reliableCompleted.filter((session) => session.recovered);

  return {
    sessions: sessions.toReversed(),
    completed_count: reliableCompleted.length,
    recovery_rate:
      reliableCompleted.length > 0
        ? (recovered.length / reliableCompleted.length) * 100
        : null,
    average_recovery_seconds: average(recovered.map((session) => session.duration_seconds)),
    average_co2_change: average(reliableCompleted.map((session) => session.co2_change)),
    average_pm2_5_change: average(reliableCompleted.map((session) => session.pm2_5_change)),
  };
}
