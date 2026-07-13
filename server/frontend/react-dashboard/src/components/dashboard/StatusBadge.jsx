const STATUS_STYLES = {
  NORMAL: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CAUTION: "border-amber-200 bg-amber-50 text-amber-800",
  DANGER: "border-red-200 bg-red-50 text-red-700",
};

const STATUS_LABELS = {
  NORMAL: "정상",
  CAUTION: "주의",
  DANGER: "위험",
};

export default function StatusBadge({ state, large = false }) {
  const style = STATUS_STYLES[state] ?? STATUS_STYLES.NORMAL;
  const label = STATUS_LABELS[state] ?? STATUS_LABELS.NORMAL;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-bold ${style} ${large ? "px-5 py-2.5 text-base" : "px-3 py-1 text-xs"}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
      {state} · {label}
    </span>
  );
}
