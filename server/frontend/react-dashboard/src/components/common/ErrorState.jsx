function getErrorCopy(error) {
  if (error?.status === 404) {
    return {
      title: "수신된 센서 데이터가 없습니다.",
      description: "하드웨어 연결 상태를 확인해 주세요.",
    };
  }

  if (error?.errorCode === "NETWORK_ERROR") {
    return {
      title: "백엔드 서버에 연결할 수 없습니다.",
      description: "서버 실행 상태와 네트워크 연결을 확인해 주세요.",
    };
  }

  if (error?.status >= 500) {
    return {
      title: "서버에서 데이터를 처리하지 못했습니다.",
      description: "잠시 후 다시 시도해 주세요.",
    };
  }

  return {
    title: "대시보드 데이터를 불러오지 못했습니다.",
    description: error?.message ?? "잠시 후 다시 시도해 주세요.",
  };
}

export default function ErrorState({ error, onRetry, compact = false }) {
  const copy = getErrorCopy(error);

  return (
    <section
      className={
        compact
          ? "rounded-2xl border border-red-200 bg-red-50 p-4"
          : "mx-auto flex min-h-[70vh] max-w-xl items-center px-4"
      }
      role="alert"
    >
      <div
        className={
          compact
            ? "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            : "w-full rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm"
        }
      >
        <div className={compact ? "" : "space-y-2"}>
          <h2 className="font-bold text-red-800">{copy.title}</h2>
          <p className="mt-1 text-sm text-red-700">{copy.description}</p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
        >
          다시 시도
        </button>
      </div>
    </section>
  );
}
