import StatusBadge from "./StatusBadge.jsx";
import ConnectionStatus from "./ConnectionStatus.jsx";
import { formatDuration } from "../../utils/dashboardFormat.js";

export default function AirQualitySummary({
  data,
  insight,
  connectionStatus,
  stateDuration,
  onRetry,
}) {
  return (
    <section className="overflow-hidden rounded-3xl bg-brand-navy text-white shadow-lg shadow-blue-950/10" aria-labelledby="air-quality-heading">
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge state={data.state} large />
            <ConnectionStatus status={connectionStatus} onRetry={onRetry} />
          </div>
          <h1 id="air-quality-heading" className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            현재 공기질 상태
          </h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-blue-100">
            {insight.reason}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            측정값에 따라 환기 팬을 {data.fan_speed}%로 자동 운전하고 있습니다.
          </p>
        </div>
        <div className="grid min-w-64 grid-cols-2 gap-3 rounded-2xl bg-white/8 p-5">
          <div>
            <p className="text-xs text-blue-200">CO2</p>
            <p className="mt-1 font-mono text-2xl font-bold">{data.co2}</p>
            <p className="text-xs text-slate-300">ppm</p>
          </div>
          <div>
            <p className="text-xs text-blue-200">PM2.5</p>
            <p className="mt-1 font-mono text-2xl font-bold">{data.pm2_5}</p>
            <p className="text-xs text-slate-300">µg/m³</p>
          </div>
          <div className="col-span-2 border-t border-white/10 pt-3">
            <p className="text-xs text-blue-200">현재 상태 유지 시간</p>
            <p className="mt-1 font-mono text-lg font-bold">
              {formatDuration(stateDuration)}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-300">현재 브라우저 세션 기준</p>
          </div>
        </div>
      </div>
    </section>
  );
}
