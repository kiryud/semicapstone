import { useQuery } from "@tanstack/react-query";
import { dashboardProvider } from "../providers/dashboardProvider.js";
import { useChartHistory } from "./useChartHistory.js";

export function useDashboardHistory(latestData, range, deviceId) {
  const fallbackHistory = useChartHistory(latestData);
  const historyQuery = useQuery({
    queryKey: ["dashboard", deviceId, "history", range],
    queryFn: () => dashboardProvider.getHistory({ deviceId, range }),
    enabled: dashboardProvider.capabilities.history,
    refetchInterval: 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (!dashboardProvider.capabilities.history) {
    return {
      ...historyQuery,
      data: fallbackHistory,
      metadata: {
        range: "client",
        total_points: fallbackHistory.length,
        resolution_seconds: 1,
      },
    };
  }

  return {
    ...historyQuery,
    data: historyQuery.data?.data ?? [],
    metadata: historyQuery.data ?? null,
  };
}
