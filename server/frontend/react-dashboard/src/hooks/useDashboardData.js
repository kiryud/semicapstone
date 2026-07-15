import { useQuery } from "@tanstack/react-query";
import { dashboardProvider } from "../providers/dashboardProvider.js";

export function useDashboardData(deviceId) {
  return useQuery({
    queryKey: ["dashboard", "api", deviceId],
    queryFn: () => dashboardProvider.getLatest({ deviceId }),
    refetchInterval: 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
