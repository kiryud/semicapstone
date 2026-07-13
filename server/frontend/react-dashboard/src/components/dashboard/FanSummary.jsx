import { formatSensorValue } from "../../utils/dashboardFormat.js";
import { calculateFanPower } from "../../utils/dashboardStatus.js";

const FAN_STATE = {
  NORMAL: {
    label: "정상 환기",
    bar: "bg-emerald-500",
    text: "text-emerald-700",
  },
  CAUTION: {
    label: "주의 환기",
    bar: "bg-amber-500",
    text: "text-amber-700",
  },
  DANGER: {
    label: "최대 환기",
    bar: "bg-red-500",
    text: "text-red-700",
  },
};

function FanIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 12c-1.8-3.6-.8-7.2 2-8.2 2.4-.8 3.8 1.8 2.4 4.1C15.5 9.4 13.8 10.7 12 12Zm0 0c3.6-1.8 7.2-.8 8.2 2 0.8 2.4-1.8 3.8-4.1 2.4-1.5-.9-2.8-2.6-4.1-4.4Zm0 0c1.8 3.6.8 7.2-2 8.2-2.4.8-3.8-1.8-2.4-4.1.9-1.5 2.6-2.8 4.4-4.1Zm0 0c-3.6 1.8-7.2.8-8.2-2C3 7.6 5.6 6.2 7.9 7.6c1.5.9 2.8 2.6 4.1 4.4Z" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function FanSummary({ data, energyWh }) {
  const fanPower = calculateFanPower(data.fan_voltage, data.fan_current_mA);
  const state = FAN_STATE[data.state] ?? FAN_STATE.NORMAL;

  return (
    <article className="rounded-3xl border border-outline bg-surface p-6 shadow-sm">
      <div className="flex min-h-12 items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand">환기 시스템</p>
          <h2 className="mt-1 text-xl font-bold text-brand-navy">팬 자동 운전</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold ${state.text}`}>{state.label}</span>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
            <FanIcon />
          </div>
        </div>
      </div>

      <div className="mt-7 flex items-end gap-2">
        <p className="font-mono text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {formatSensorValue(data.fan_speed)}
        </p>
        <p className="pb-1 text-sm font-semibold text-muted">%</p>
      </div>
      <div className="mt-6">
        <div
          className="h-2.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="팬 자동 운전 속도"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={data.fan_speed}
        >
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${state.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, data.fan_speed))}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] font-medium text-muted">
          <span>40% 정상</span>
          <span>70% 주의</span>
          <span>100% 위험</span>
        </div>
      </div>

      <div className="mt-5 min-h-10">
        <p className="text-xs font-bold text-muted">
          {data.state} 상태에 따라 {formatSensorValue(data.fan_speed)}%로 자동 제어 중
        </p>
        <p className="mt-1 text-xs font-semibold text-brand">
          최근 1시간 누적 에너지 {formatSensorValue(energyWh, 3)} Wh
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-outline pt-4 text-xs">
        <div>
          <dt className="text-xs text-muted">팬 전압</dt>
          <dd className="mt-1 font-mono text-lg font-bold text-ink">
            {formatSensorValue(data.fan_voltage, 3)} <span className="text-xs font-medium text-muted">V</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">팬 전류</dt>
          <dd className="mt-1 font-mono text-lg font-bold text-ink">
            {formatSensorValue(data.fan_current_mA, 1)} <span className="text-xs font-medium text-muted">mA</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">소비 전력</dt>
          <dd className="mt-1 font-mono text-lg font-bold text-ink">
            {formatSensorValue(fanPower, 2)} <span className="text-xs font-medium text-muted">W</span>
          </dd>
        </div>
      </dl>
    </article>
  );
}
