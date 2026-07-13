const RANGE_DURATIONS = {
  "1m": 60_000,
  "10m": 10 * 60_000,
  "1h": 60 * 60_000,
};

function pointTime(point) {
  return new Date(point?.received_at).getTime();
}

export function getCompletedChartHistory(history, range, resolutionSeconds = 1) {
  const resolution = Number(resolutionSeconds) * 1000;
  if (range === "1m" || resolution <= 1000 || history.length === 0) {
    return history;
  }

  const referenceTime = pointTime(history.at(-1));
  if (!Number.isFinite(referenceTime)) return history;
  const currentBucketStart = Math.floor(referenceTime / resolution) * resolution;
  return history.filter((point) => pointTime(point) < currentBucketStart);
}

export function getLiveChartDomain(history, range, resolutionSeconds = 1) {
  if (history.length === 0) return null;
  const latestTime = pointTime(history.at(-1));
  if (!Number.isFinite(latestTime)) return null;

  const duration = RANGE_DURATIONS[range] ?? RANGE_DURATIONS["1m"];
  const resolution = Math.max(1000, Number(resolutionSeconds) * 1000);
  const endTime = range === "1m"
    ? latestTime
    : Math.floor(latestTime / resolution) * resolution;
  return { startTime: endTime - duration, endTime };
}

export function countNewChartPoints(currentHistory, frozenHistory) {
  const frozenLatestTime = pointTime(frozenHistory.at(-1));
  if (!Number.isFinite(frozenLatestTime)) return currentHistory.length;
  return currentHistory.filter((point) => pointTime(point) > frozenLatestTime).length;
}
