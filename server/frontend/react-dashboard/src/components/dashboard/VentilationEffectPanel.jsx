import {
  formatDuration,
  formatSensorValue,
} from "../../utils/dashboardFormat.js";

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

function formatChange(value, unit, digits = 0) {
  if (!Number.isFinite(value)) return "분석 중";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatSensorValue(value, digits)} ${unit}`;
}

function ChangeValue({ value, unit, digits = 0 }) {
  const style = !Number.isFinite(value)
    ? "text-muted"
    : value <= 0
      ? "text-emerald-700"
      : "text-red-700";
  return (
    <span className={`font-mono font-bold ${style}`}>
      {formatChange(value, unit, digits)}
    </span>
  );
}

function SummaryMetric({ label, children, description }) {
  return (
    <div className="rounded-xl bg-canvas p-4">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-2 text-xl font-bold text-ink">{children}</dd>
      <p className="mt-1 text-[11px] text-muted">{description}</p>
    </div>
  );
}

function SessionStatus({ session }) {
  if (!session.completed) {
    return (
      <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
        진행 중
      </span>
    );
  }
  if (session.recovered) {
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
        정상 복귀
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
      운전 종료
    </span>
  );
}

export default function VentilationEffectPanel({ analysis, metadata }) {
  const sessions = analysis?.sessions ?? [];

  return (
    <section aria-labelledby="ventilation-effect-heading">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand">운전 분석</p>
          <h2 id="ventilation-effect-heading" className="mt-1 text-xl font-bold text-brand-navy">
            환기 효과
          </h2>
        </div>
        <p className="text-xs text-muted">
          최근 1시간 · 원본 {metadata?.total_points ?? 0}개
          {metadata?.resolution_seconds > 1
            ? ` · ${metadata.resolution_seconds}초 집계`
            : ""}
        </p>
      </div>

      <article className="rounded-2xl border border-outline bg-surface p-5 shadow-sm">
        {sessions.length === 0 ? (
          <div className="rounded-xl bg-canvas px-4 py-8 text-center">
            <p className="text-sm font-bold text-ink">분석할 환기 구간이 없습니다.</p>
            <p className="mt-2 text-xs text-muted">
              팬이 40%를 초과해 운전하면 시작·종료 공기질 변화를 분석합니다.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-ink">
                    {!sessions[0].completed ? "현재 환기 효과" : "최근 환기 결과"}
                  </h3>
                  <SessionStatus session={sessions[0]} />
                </div>
                <p className="mt-2 text-sm text-muted">
                  CO2 <ChangeValue value={sessions[0].co2_change} unit="ppm" />
                  <span className="mx-2 text-outline">·</span>
                  PM2.5 <ChangeValue value={sessions[0].pm2_5_change} unit="µg/m³" digits={1} />
                </p>
              </div>
              <p className="text-xs text-muted">
                {formatTime(sessions[0].started_at)} 시작 · 최대 팬 {formatSensorValue(sessions[0].peak_fan_speed)}%
              </p>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric label="정상 복귀율" description="완전한 세션 기준">
                {Number.isFinite(analysis.recovery_rate)
                  ? `${formatSensorValue(analysis.recovery_rate)}%`
                  : "분석 중"}
              </SummaryMetric>
              <SummaryMetric label="평균 복귀 시간" description="CAUTION/DANGER → NORMAL">
                {Number.isFinite(analysis.average_recovery_seconds)
                  ? formatDuration(analysis.average_recovery_seconds)
                  : "분석 중"}
              </SummaryMetric>
              <SummaryMetric label="평균 CO2 변화" description="음수일수록 개선">
                <ChangeValue value={analysis.average_co2_change} unit="ppm" />
              </SummaryMetric>
              <SummaryMetric label="평균 PM2.5 변화" description="음수일수록 개선">
                <ChangeValue value={analysis.average_pm2_5_change} unit="µg/m³" digits={1} />
              </SummaryMetric>
            </dl>

            <div className="mt-5 border-t border-outline pt-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-ink">최근 환기 세션</h4>
                <span className="text-xs text-muted">
                  신뢰 가능한 완료 {analysis.completed_count}건
                </span>
              </div>
              <ol className="mt-3 space-y-2">
                {sessions.slice(0, 3).map((session) => (
                  <li key={session.session_id} className="grid gap-2 rounded-xl bg-canvas p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                    <div className="flex flex-wrap items-center gap-2">
                      <time className="font-mono text-xs text-muted" dateTime={session.started_at}>
                        {formatTime(session.started_at)}
                      </time>
                      <SessionStatus session={session} />
                      {session.partial_start && (
                        <span className="text-[11px] font-medium text-muted">조회 범위 이전 시작</span>
                      )}
                    </div>
                    <span className="text-xs text-muted">
                      {session.partial_start ? "최소 " : ""}{formatDuration(session.duration_seconds)}
                    </span>
                    <span className="text-xs text-ink">
                      CO2 <ChangeValue value={session.co2_change} unit="ppm" />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </article>
    </section>
  );
}
