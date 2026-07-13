import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { calculateFanPower } from "../utils/dashboardStatus.js";
import {
  getCurrentStateDuration,
  getMetricTrend,
} from "../utils/dashboardStatus.js";
import { dashboardProvider } from "../providers/dashboardProvider.js";

function createFallbackSummary(history) {
  const co2 = getMetricTrend(history, "co2");
  const pm2_5 = getMetricTrend(history, "pm2_5");
  return {
    co2,
    pm2_5,
    current_state_duration_seconds: getCurrentStateDuration(history),
    fan_energy_Wh: history.reduce(
      (sum, point) =>
        sum +
        Number(
          point.fan_power_W ??
            calculateFanPower(point.fan_voltage, point.fan_current_mA) ??
            0,
        ) /
          3600,
      0,
    ),
  };
}

export function useDashboardSummary(history, deviceId) {
  const fallback = useMemo(() => createFallbackSummary(history), [history]);
  const summaryQuery = useQuery({
    queryKey: ["dashboard", deviceId, "summary", "1h"],
    queryFn: () =>
      dashboardProvider.getSummary({ deviceId, range: "1h" }),
    enabled: dashboardProvider.capabilities.summary,
    refetchInterval: 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    ...summaryQuery,
    data: dashboardProvider.capabilities.summary
      ? summaryQuery.data ?? fallback
      : fallback,
  };
}
