import { useMemo, useState } from "react";
import {
  ACTIVITY_FILTERS,
  filterDashboardActivities,
} from "../../utils/dashboardActivity.js";
import { formatSensorValue } from "../../utils/dashboardFormat.js";

const FILTER_OPTIONS = [
  { value: ACTIVITY_FILTERS.ALL, label: "전체" },
  { value: ACTIVITY_FILTERS.STATE_CHANGE, label: "상태 변경" },
  { value: ACTIVITY_FILTERS.ALERT, label: "경고" },
];

const SEVERITY_STYLES = {
  NORMAL: "bg-emerald-50 text-emerald-700",
  CAUTION: "bg-amber-50 text-amber-700",
  DANGER: "bg-red-50 text-red-700",
};

const ALERT_TITLES = {
  AIR_QUALITY_CAUTION: "공기질 주의",
  AIR_QUALITY_DANGER: "공기질 위험",
  SENSOR_ERROR: "센서 오류",
  FAN_ERROR: "팬 오류",
  NETWORK_ERROR: "네트워크 오류",
  UNKNOWN: "장치 경고",
};

function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "시간 정보 없음"
    : date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
}

function ActivityTypeBadge({ activity }) {
  const isState = activity.categories.includes(ACTIVITY_FILTERS.STATE_CHANGE);
  const isAlert = activity.categories.includes(ACTIVITY_FILTERS.ALERT);
  const label = isState && isAlert ? "상태 변경 · 경고" : isState ? "상태 변경" : "장치 경고";
  return (
    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">
      {label}
    </span>
  );
}

function MeasurementSummary({ activity }) {
  const values = [];
  if (activity.co2 != null && Number.isFinite(Number(activity.co2))) {
    values.push(`CO2 ${formatSensorValue(activity.co2)} ppm`);
  }
  if (activity.pm2_5 != null && Number.isFinite(Number(activity.pm2_5))) {
    values.push(`PM2.5 ${formatSensorValue(activity.pm2_5)} µg/m³`);
  }
  return values.length > 0 ? (
    <p className="mt-2 font-mono text-[11px] text-muted">{values.join(" · ")}</p>
  ) : null;
}

export default function RecentActivityPanel({ activities = [] }) {
  const [filter, setFilter] = useState(ACTIVITY_FILTERS.ALL);
  const filteredActivities = useMemo(
    () => filterDashboardActivities(activities, filter).slice(0, 6),
    [activities, filter],
  );

  return (
    <section aria-labelledby="recent-activity-heading">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand">모니터링 기록</p>
          <h2 id="recent-activity-heading" className="mt-1 text-xl font-bold text-brand-navy">
            최근 활동
          </h2>
        </div>
        <div className="flex w-fit gap-1 rounded-xl bg-slate-100 p-1" aria-label="최근 활동 필터">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${filter === option.value ? "bg-white text-brand shadow-sm" : "text-muted hover:text-brand"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <article className="rounded-2xl border border-outline bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-ink">상태 변경과 장치 경고</h3>
            <p className="mt-1 text-xs text-muted">같은 원인의 상태 변경과 경고는 하나로 표시합니다.</p>
          </div>
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">
            {filteredActivities.length}건
          </span>
        </div>

        {filteredActivities.length === 0 ? (
          <p className="mt-6 rounded-xl bg-canvas px-4 py-5 text-center text-sm text-muted">
            선택한 유형의 최근 활동이 없습니다.
          </p>
        ) : (
          <ol className="mt-5 divide-y divide-outline">
            {filteredActivities.map((activity) => (
              <li key={activity.activity_id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <ActivityTypeBadge activity={activity} />
                      <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${SEVERITY_STYLES[activity.severity] ?? "bg-slate-100 text-slate-700"}`}>
                        {activity.severity}
                      </span>
                      <strong className="text-sm text-ink">
                        {activity.from_state
                          ? activity.title
                          : ALERT_TITLES[activity.alert_type] ?? activity.title}
                      </strong>
                    </div>
                    <p className="mt-2 text-sm text-ink">{activity.message}</p>
                    <MeasurementSummary activity={activity} />
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <time className="font-mono text-xs text-muted" dateTime={activity.occurred_at}>
                      {formatTime(activity.occurred_at)}
                    </time>
                    {activity.acknowledged === true && (
                      <p className="mt-1 text-[11px] font-semibold text-emerald-700">확인됨</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </article>
    </section>
  );
}
