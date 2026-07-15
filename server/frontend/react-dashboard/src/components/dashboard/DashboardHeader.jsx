import { formatUpdatedAt } from "../../utils/dashboardFormat.js";

export default function DashboardHeader({
  deviceId,
  receivedAt,
  onLogout,
}) {
  return (
    <header className="border-b border-outline bg-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-white">
            AQ
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-brand-navy">공기질 모니터링</p>
            <p className="truncate text-xs text-muted">
              {deviceId} · {formatUpdatedAt(receivedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand sm:inline-flex">
            LIVE API
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl border border-outline bg-surface px-3.5 py-2 text-sm font-semibold text-ink transition hover:border-blue-300 hover:bg-brand-soft focus:outline-none focus:ring-2 focus:ring-brand"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
