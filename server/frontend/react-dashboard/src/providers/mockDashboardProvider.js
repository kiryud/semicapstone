import { ApiError } from "../api/http.js";
import { MockDashboardStore } from "../mocks/mockStore.js";
import { MOCK_SCENARIOS, normalizeMockScenario } from "../mocks/mockScenarios.js";
import { DEFAULT_DEVICE_ID } from "../models/dashboardModels.js";

const scenario = normalizeMockScenario(
  import.meta.env.VITE_MOCK_SCENARIO ?? MOCK_SCENARIOS.CYCLE,
);
let store;

function getStore() {
  store ??= new MockDashboardStore({ scenario });
  return store;
}

function prepareStore(deviceId) {
  if (deviceId && deviceId !== DEFAULT_DEVICE_ID) {
    throw new ApiError("요청한 Mock 장치를 찾을 수 없습니다.", {
      status: 404,
      errorCode: "DEVICE_NOT_FOUND",
    });
  }
  if (scenario === MOCK_SCENARIOS.NETWORK_ERROR) {
    throw new ApiError("Mock 네트워크 연결 오류가 발생했습니다.", {
      errorCode: "NETWORK_ERROR",
    });
  }
  getStore().advanceTo(new Date());
}

export const mockDashboardProvider = {
  mode: "mock",
  scenario,
  capabilities: {
    history: true,
    summary: true,
    events: true,
    alerts: true,
  },

  async getLatest({ deviceId } = {}) {
    prepareStore(deviceId);
    return getStore().getLatest();
  },

  async getHistory(options) {
    prepareStore(options?.deviceId);
    return getStore().getHistory(options);
  },

  async getSummary(options) {
    prepareStore(options?.deviceId);
    return getStore().getSummary(options);
  },

  async getEvents(options) {
    prepareStore(options?.deviceId);
    return getStore().getEvents(options);
  },

  async getAlerts(options) {
    prepareStore(options?.deviceId);
    return getStore().getAlerts(options);
  },
};
