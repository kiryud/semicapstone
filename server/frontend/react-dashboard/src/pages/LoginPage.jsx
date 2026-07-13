import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/authApi.js";
import SuccessModal from "../components/common/SuccessModal.jsx";
import { setAccessToken } from "../utils/storage.js";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setAccessToken(response.token);
      setSuccessMessage(response.message ?? "로그인 성공! 환영합니다.");
    },
  });

  function handleSuccessConfirm() {
    navigate(location.state?.from ?? "/dashboard", { replace: true });
  }

  function updateField(event) {
    setCredentials((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
    setValidationError("");
    loginMutation.reset();
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!credentials.id.trim() || !credentials.password) {
      setValidationError("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }
    loginMutation.mutate(credentials);
  }

  const errorMessage = validationError || loginMutation.error?.message;

  return (
    <main className="grid min-h-screen bg-[#F8FAFC] lg:grid-cols-[1.05fr_0.95fr]">
      {successMessage && (
        <SuccessModal message={successMessage} onConfirm={handleSuccessConfirm} />
      )}
      <section className="relative hidden overflow-hidden bg-[#0B1F4D] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-blue-400/20" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563EB] font-bold">AQ</div>
          <span className="font-semibold tracking-wide">AIR QUALITY MONITOR</span>
        </div>
        <div className="relative max-w-xl pb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">Smart chamber</p>
          <h1 className="mt-5 text-5xl font-bold leading-tight">
            더 안전한 공기를 위한
            <br />실시간 모니터링
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            공기질과 환기 시스템의 상태를 한눈에 확인하고 변화에 빠르게 대응하세요.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-9 lg:hidden">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1F4D] font-bold text-white">AQ</div>
          </div>
          <p className="text-sm font-semibold text-[#2563EB]">관리자 접속</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A]">대시보드 로그인</h2>
          <p className="mt-3 text-sm text-[#64748B]">발급받은 계정 정보를 입력해 주세요.</p>

          <form className="mt-9 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="id" className="mb-2 block text-sm font-semibold text-[#0F172A]">아이디</label>
              <input
                id="id"
                name="id"
                type="text"
                autoComplete="username"
                value={credentials.id}
                onChange={updateField}
                className="w-full rounded-xl border border-[#D8E3F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-3 focus:ring-blue-100"
                placeholder="아이디 입력"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#0F172A]">비밀번호</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={updateField}
                className="w-full rounded-xl border border-[#D8E3F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-3 focus:ring-blue-100"
                placeholder="비밀번호 입력"
              />
            </div>

            {errorMessage && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full rounded-xl bg-[#2563EB] px-4 py-3.5 font-bold text-white transition hover:bg-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginMutation.isPending ? "로그인 중..." : "로그인"}
            </button>
          </form>
          <p className="mt-8 text-center text-xs text-[#64748B]">세미캡스톤 공기질 모니터링 시스템</p>
        </div>
      </section>
    </main>
  );
}
