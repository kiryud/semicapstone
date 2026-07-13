import { useAlerts } from "./useAlerts.js";
import { useDashboardData } from "./useDashboardData.js";
import { useDashboardHistory } from "./useDashboardHistory.js";
import { useDashboardSummary } from "./useDashboardSummary.js";
import { useStateEvents } from "./useStateEvents.js";
import { getAirQualityInsight } from "../utils/airQuality.js";
import { createDashboardActivities } from "../utils/dashboardActivity.js";
import { analyzeVentilationEffect } from "../utils/ventilationAnalysis.js";
import {
  CONNECTION_STATES,
  getConnectionStatus,
} from "../utils/dashboardStatus.js";

export function useDashboardViewModel({ deviceId, historyRange }) {
  const dashboardQuery = useDashboardData(deviceId);
  const historyQuery = useDashboardHistory(
    dashboardQuery.data,
    historyRange,
    deviceId,
  );
  const history = historyQuery.data;
  const analysisHistoryQuery = useDashboardHistory(
    dashboardQuery.data,
    "1h",
    deviceId,
  );
  const summaryQuery = useDashboardSummary(history, deviceId);
  const eventsQuery = useStateEvents(history, deviceId);
  const alertsQuery = useAlerts(deviceId);
  const data = dashboardQuery.data;

  return {
    data,
    history,
    historyMetadata: historyQuery.metadata,
    ventilationAnalysis: analyzeVentilationEffect(analysisHistoryQuery.data),
    ventilationAnalysisMetadata: analysisHistoryQuery.metadata,
    summary: summaryQuery.data,
    activities: createDashboardActivities(
      eventsQuery.data,
      alertsQuery.data,
      20,
    ),
    insight: data ? getAirQualityInsight(data.co2, data.pm2_5) : null,
    connectionStatus: data
      ? getConnectionStatus({
          receivedAt: data.received_at,
          referenceTime: dashboardQuery.dataUpdatedAt,
          hasError:
            dashboardQuery.isError || dashboardQuery.isRefetchError,
        })
      : CONNECTION_STATES.STALE,
    isInitialLoading: dashboardQuery.isPending && !data,
    initialError: dashboardQuery.isError && !data ? dashboardQuery.error : null,
    retryLatest: dashboardQuery.refetch,
    partialErrors: {
      history: historyQuery.error,
      ventilationAnalysis: analysisHistoryQuery.error,
      summary: summaryQuery.error,
      events: eventsQuery.error,
      alerts: alertsQuery.error,
    },
  };
}
