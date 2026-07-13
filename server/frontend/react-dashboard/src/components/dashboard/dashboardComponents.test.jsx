import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getAirQualityInsight } from "../../utils/airQuality.js";
import { CONNECTION_STATES } from "../../utils/dashboardStatus.js";
import AirQualitySummary from "./AirQualitySummary.jsx";
import ConnectionStatus from "./ConnectionStatus.jsx";
import FanSummary from "./FanSummary.jsx";
import RecentActivityPanel from "./RecentActivityPanel.jsx";
import VentilationEffectPanel from "./VentilationEffectPanel.jsx";

const dashboardData = {
  state: "CAUTION",
  co2: 1200,
  pm2_5: 20,
  fan_speed: 70,
};

describe("dashboard status components", () => {
  it("renders the air-quality reason and automatic fan mapping", () => {
    const markup = renderToStaticMarkup(
      <AirQualitySummary
        data={dashboardData}
        insight={getAirQualityInsight(dashboardData.co2, dashboardData.pm2_5)}
        connectionStatus={CONNECTION_STATES.LIVE}
        stateDuration={18}
        onRetry={() => {}}
      />,
    );

    expect(markup).toContain("CO2가 주의 기준을 초과했습니다.");
    expect(markup).toContain("환기 팬을 70%로 자동 운전");
    expect(markup).toContain("CAUTION");
    expect(markup).toContain("실시간 수신 중");
    expect(markup).toContain("18초");
  });

  it("announces a degraded connection and exposes retry", () => {
    const markup = renderToStaticMarkup(
      <ConnectionStatus status={CONNECTION_STATES.DEGRADED} onRetry={() => {}} />,
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain("마지막 정상 데이터를 유지하고 있습니다.");
    expect(markup).toContain("다시 시도");
  });

  it("announces a live connection without a retry button", () => {
    const markup = renderToStaticMarkup(
      <ConnectionStatus status={CONNECTION_STATES.LIVE} onRetry={() => {}} />,
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain("실시간 수신 중");
    expect(markup).not.toContain("다시 시도");
  });

  it("renders state changes and alerts in one recent activity panel", () => {
    const markup = renderToStaticMarkup(
      <RecentActivityPanel
        activities={[
          {
            activity_id: "state:event-1+alert:alert-1",
            categories: ["STATE_CHANGE", "ALERT"],
            occurred_at: "2026-01-01T00:00:03Z",
            severity: "CAUTION",
            title: "NORMAL → CAUTION",
            message: "CO2가 주의 기준을 초과했습니다.",
            from_state: "NORMAL",
            to_state: "CAUTION",
            co2: 1100,
            pm2_5: 20,
            alert_type: "AIR_QUALITY_CAUTION",
            acknowledged: false,
          },
        ]}
      />,
    );

    expect(markup).toContain("NORMAL →");
    expect(markup).toContain("CO2가 주의 기준을 초과했습니다.");
    expect(markup).toContain("상태 변경 · 경고");
    expect(markup).toContain("CO2 1,100 ppm");
  });

  it("renders a state-consistent fan progress bar", () => {
    const markup = renderToStaticMarkup(
      <FanSummary
        data={{
          state: "CAUTION",
          fan_speed: 70,
          fan_voltage: 5.02,
          fan_current_mA: 90,
        }}
        energyWh={0.08}
      />,
    );
    expect(markup).toContain('role="progressbar"');
    expect(markup).toContain('aria-valuenow="70"');
    expect(markup).toContain("70% 주의");
    expect(markup).toContain("주의 환기");
  });

  it("renders ventilation recovery and concentration changes", () => {
    const markup = renderToStaticMarkup(
      <VentilationEffectPanel
        analysis={{
          sessions: [{
            session_id: "ventilation-1",
            started_at: "2026-07-12T09:00:00Z",
            duration_seconds: 240,
            partial_start: false,
            completed: true,
            recovered: true,
            peak_fan_speed: 100,
            co2_change: -280,
            pm2_5_change: -12,
          }],
          active_session: null,
          recovery_rate: 100,
          average_recovery_seconds: 240,
          average_co2_change: -280,
          average_pm2_5_change: -12,
          completed_count: 1,
        }}
        metadata={{ total_points: 3600, resolution_seconds: 30 }}
      />,
    );
    expect(markup).toContain("환기 효과");
    expect(markup).toContain("정상 복귀율");
    expect(markup).toContain("4분");
    expect(markup).toContain("-280 ppm");
    expect(markup).toContain("정상 복귀");
  });

});
