import { CONNECTION_STATES } from "../../utils/dashboardStatus.js";

const COPY = {
  [CONNECTION_STATES.LIVE]: {
    label: "실시간 수신 중",
    description: "센서 데이터가 정상적으로 갱신되고 있습니다.",
    classes: "border-white/15 bg-white/10 text-blue-100",
    dot: "bg-blue-300",
  },
  [CONNECTION_STATES.STALE]: {
    label: "데이터 수신 지연",
    description: "최근 센서 데이터가 5초 이상 갱신되지 않고 있습니다.",
    classes: "border-amber-300/40 bg-amber-400/15 text-amber-100",
    dot: "bg-amber-300",
  },
  [CONNECTION_STATES.DEGRADED]: {
    label: "연결이 불안정합니다",
    description: "마지막 정상 데이터를 유지하고 있습니다.",
    classes: "border-red-300/40 bg-red-400/15 text-red-100",
    dot: "bg-red-300",
  },
};

export default function ConnectionStatus({ status, onRetry }) {
  const copy = COPY[status];
  const needsAttention = status !== CONNECTION_STATES.LIVE;

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 rounded-full border px-3 py-2 text-xs ${copy.classes}`}
      role={needsAttention ? "alert" : "status"}
      aria-live="polite"
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${copy.dot}`} aria-hidden="true" />
      <span className="font-bold">{copy.label}</span>
      <span className="hidden opacity-80 xl:inline">· {copy.description}</span>
      <span className="sr-only">{copy.description}</span>
      {status === CONNECTION_STATES.DEGRADED && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-red-700 shadow-sm transition hover:bg-red-50"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
