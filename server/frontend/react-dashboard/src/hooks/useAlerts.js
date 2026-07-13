import { useQuery } from "@tanstack/react-query";
import { dashboardProvider } from "../providers/dashboardProvider.js";

export function useAlerts(deviceId) {
  return useQuery({
    queryKey: ["dashboard", deviceId, "alerts"],
    queryFn: () => dashboardProvider.getAlerts({ deviceId, limit: 10 }),
    enabled: dashboardProvider.capabilities.alerts,
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
