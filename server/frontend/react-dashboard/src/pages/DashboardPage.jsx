import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import AirQualitySummary from "../components/dashboard/AirQualitySummary.jsx";
import DashboardHeader from "../components/dashboard/DashboardHeader.jsx";
import FanSummary from "../components/dashboard/FanSummary.jsx";
import RecentActivityPanel from "../components/dashboard/RecentActivityPanel.jsx";
import PrimaryMetricCard from "../components/dashboard/PrimaryMetricCard.jsx";
import SecondaryMetrics from "../components/dashboard/SecondaryMetrics.jsx";
import VentilationEffectPanel from "../components/dashboard/VentilationEffectPanel.jsx";
import ChartJsTrendSection from "../components/dashboard/ChartJsTrendSection.jsx";
import {
  DASHBOARD_SCENARIO,
  USE_MOCK,
} from "../hooks/useDashboardData.js";
import { useDashboardViewModel } from "../hooks/useDashboardViewModel.js";
import { DEFAULT_DEVICE_ID } from "../models/dashboardModels.js";
import { removeAccessToken } from "../utils/storage.js";

export default function DashboardPage() {
  const [historyRange, setHistoryRange] = useState("1m");
  const dashboard = useDashboardViewModel({
    deviceId: DEFAULT_DEVICE_ID,
    historyRange,
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (dashboard.isInitialLoading) return <LoadingState />;
  if (dashboard.initialError) {
    return (
      <ErrorState
        error={dashboard.initialError}
        onRetry={dashboard.retryLatest}
      />
    );
  }

  const { data, summary, history } = dashboard;
  const partialErrorCount = Object.values(dashboard.partialErrors).filter(
    Boolean,
  ).length;

  function handleLogout() {
    removeAccessToken();
    queryClient.removeQueries({ queryKey: ["dashboard"] });
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <DashboardHeader
        deviceId={data.device_id}
        receivedAt={data.received_at}
        useMock={USE_MOCK}
        mockScenario={DASHBOARD_SCENARIO}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {partialErrorCount > 0 && (
          <div
            className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            일부 보조 데이터를 불러오지 못했습니다. 최신 센서 데이터는 계속 표시합니다.
          </div>
        )}
        <AirQualitySummary
          data={data}
          insight={dashboard.insight}
          connectionStatus={dashboard.connectionStatus}
          stateDuration={summary.current_state_duration_seconds}
          onRetry={dashboard.retryLatest}
        />

        <section aria-labelledby="primary-metrics-heading">
          <div className="mb-4">
            <p className="text-sm font-semibold text-brand">핵심 모니터링</p>
            <h2 id="primary-metrics-heading" className="mt-1 text-xl font-bold text-brand-navy">
              주요 지표와 환기 상태
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <PrimaryMetricCard
              metric="co2"
              value={data.co2}
              history={history}
              summary={summary.co2}
            />
            <PrimaryMetricCard
              metric="pm2_5"
              value={data.pm2_5}
              history={history}
              summary={summary.pm2_5}
            />
            <FanSummary
              data={data}
              energyWh={summary.fan_energy_Wh}
            />
          </div>
        </section>

        <SecondaryMetrics data={data} />
        <ChartJsTrendSection
          history={history}
          range={historyRange}
          onRangeChange={setHistoryRange}
          metadata={dashboard.historyMetadata}
          latestData={data}
        />
        <VentilationEffectPanel
          analysis={dashboard.ventilationAnalysis}
          metadata={dashboard.ventilationAnalysisMetadata}
        />
        <RecentActivityPanel activities={dashboard.activities} />
      </main>

      <footer className="border-t border-outline bg-surface py-5 text-center text-xs text-muted">
        세미캡스톤 공기질 모니터링 시스템
      </footer>
    </div>
  );
}
