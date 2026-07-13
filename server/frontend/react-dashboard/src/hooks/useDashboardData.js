import { useQuery } from "@tanstack/react-query";
import {
  dashboardProvider,
  DASHBOARD_SCENARIO,
  USE_MOCK,
} from "../providers/dashboardProvider.js";

export { DASHBOARD_SCENARIO, USE_MOCK };

export function useDashboardData(deviceId) {
  return useQuery({
    queryKey: [
      "dashboard",
      USE_MOCK ? "mock" : "api",
      DASHBOARD_SCENARIO,
      deviceId,
    ],
    queryFn: () => dashboardProvider.getLatest({ deviceId }),
    refetchInterval: 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
