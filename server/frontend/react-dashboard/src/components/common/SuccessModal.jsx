import { useEffect, useRef } from "react";

export default function SuccessModal({ message, onConfirm }) {
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    confirmButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") onConfirm();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onConfirm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <section
        className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-success-title"
        aria-describedby="login-success-message"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 12 4 4L19 6" />
          </svg>
        </div>
        <h2 id="login-success-title" className="mt-5 text-xl font-bold text-slate-900">
          로그인 완료
        </h2>
        <p id="login-success-message" className="mt-2 text-sm leading-6 text-slate-600">
          {message}
        </p>
        <button
          ref={confirmButtonRef}
          type="button"
          onClick={onConfirm}
          className="mt-6 w-full rounded-xl bg-[#2563EB] px-4 py-3 font-bold text-white transition hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          대시보드로 이동
        </button>
      </section>
    </div>
  );
}
