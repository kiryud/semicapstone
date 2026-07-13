export default function ChartViewportControls({
  active,
  paused,
  newDataCount = 0,
  onZoomIn,
  onZoomOut,
  onReset,
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2" aria-label="차트 확대 제어">
      {paused ? (
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
          자동 이동 일시정지{newDataCount > 0 ? ` · 새 데이터 ${newDataCount}개` : ""}
        </span>
      ) : (
        <span className="hidden text-xs text-muted md:inline">
          휠 확대 · 드래그 이동
        </span>
      )}
      <div className="flex rounded-lg border border-outline bg-white p-0.5">
        <button
          type="button"
          onClick={onZoomIn}
          className="rounded-md px-2.5 py-1 text-xs font-bold text-brand transition hover:bg-brand-soft"
          aria-label="차트 확대"
        >
          확대 +
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="rounded-md px-2.5 py-1 text-xs font-bold text-brand transition hover:bg-brand-soft"
          aria-label="차트 축소"
        >
          축소 −
        </button>
      </div>
      {active && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-outline bg-white px-3 py-1.5 text-xs font-bold text-brand transition hover:bg-brand-soft"
        >
          실시간 보기{newDataCount > 0 ? ` (${newDataCount})` : ""}
        </button>
      )}
    </div>
  );
}
