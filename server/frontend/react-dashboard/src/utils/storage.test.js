import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACCESS_TOKEN_KEY,
  getAccessToken,
  hasAccessToken,
  removeAccessToken,
  setAccessToken,
} from "./storage.js";

function createSessionStorage() {
  const values = new Map();
  return {
    getItem: vi.fn((key) => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, value)),
    removeItem: vi.fn((key) => values.delete(key)),
  };
}

describe("authentication storage", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", createSessionStorage());
  });

  it("stores and reads the backend token", () => {
    setAccessToken("backend-returned-token");
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      ACCESS_TOKEN_KEY,
      "backend-returned-token",
    );
    expect(getAccessToken()).toBe("backend-returned-token");
    expect(hasAccessToken()).toBe(true);
  });

  it("removes the token", () => {
    setAccessToken("temporary-token");
    removeAccessToken();
    expect(sessionStorage.removeItem).toHaveBeenCalledWith(ACCESS_TOKEN_KEY);
    expect(getAccessToken()).toBeNull();
  });
});
