export const MAX_CHART_POINTS = 60;

export function appendChartPoint(history, dashboardData) {
  if (!dashboardData?.received_at) return history;

  const timestamp = new Date(dashboardData.received_at).getTime();
  if (Number.isNaN(timestamp)) return history;

  const lastPoint = history.at(-1);
  if (lastPoint) {
    const lastTimestamp = new Date(lastPoint.received_at).getTime();
    if (timestamp <= lastTimestamp) return history;
  }

  const nextPoint = {
    received_at: dashboardData.received_at,
    state: dashboardData.state,
    co2: dashboardData.co2,
    pm2_5: dashboardData.pm2_5,
    fan_current_mA: dashboardData.fan_current_mA,
  };

  return [...history, nextPoint].slice(-MAX_CHART_POINTS);
}
