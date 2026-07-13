import { ApiError, request } from "./http.js";

export async function login(credentials) {
  const response = await request("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response?.token || typeof response.token !== "string") {
    throw new ApiError("로그인 응답에 인증 토큰이 없습니다.", {
      errorCode: "INVALID_LOGIN_RESPONSE",
    });
  }

  return response;
}
