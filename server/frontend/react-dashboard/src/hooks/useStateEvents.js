import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardProvider } from "../providers/dashboardProvider.js";
import { getAirQualityInsight } from "../utils/airQuality.js";
import { getRecentStateChanges } from "../utils/dashboardStatus.js";

export function useStateEvents(history, deviceId) {
  const fallback = useMemo(
    () =>
      getRecentStateChanges(history, 20).map((change, index) => ({
        event_id: `client-event-${index}-${change.received_at}`,
        from_state: change.from,
        to_state: change.to,
        reason_message: getAirQualityInsight(change.co2, change.pm2_5).reason,
        co2: change.co2,
        pm2_5: change.pm2_5,
        started_at: change.received_at,
      })),
    [history],
  );
  const eventsQuery = useQuery({
    queryKey: ["dashboard", deviceId, "events"],
    queryFn: () => dashboardProvider.getEvents({ deviceId, limit: 20 }),
    enabled: dashboardProvider.capabilities.events,
    refetchInterval: 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    ...eventsQuery,
    data: dashboardProvider.capabilities.events
      ? eventsQuery.data ?? fallback
      : fallback,
  };
}
