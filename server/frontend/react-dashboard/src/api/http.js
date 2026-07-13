const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.errorCode = options.errorCode;
  }
}

export async function request(path, options) {
  if (!API_BASE_URL) {
    throw new ApiError(
      "API 서버 주소가 설정되지 않았습니다. .env의 VITE_API_BASE_URL을 확인해 주세요.",
      { errorCode: "API_CONFIG_ERROR" },
    );
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new ApiError("백엔드 서버에 연결할 수 없습니다.", {
      errorCode: "NETWORK_ERROR",
    });
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      body?.message ?? "요청을 처리하는 중 오류가 발생했습니다.",
      { status: response.status, errorCode: body?.errorCode },
    );
  }

  return body;
}
