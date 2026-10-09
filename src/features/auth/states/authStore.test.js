import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

vi.mock("../api/authApi", () => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn() }));

import * as api from "../api/authApi";
import { useAuthStore } from "./authStore";

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("authStore", () => {
  it("starts logged out and restores stored session", () => {
    expect(useAuthStore().isLoggedIn).toBe(false);
    expect(useAuthStore().user).toBeNull();

    localStorage.setItem("access_token", "t");
    localStorage.setItem("auth_user", JSON.stringify({ name: "A" }));
    setActivePinia(createPinia());
    const store = useAuthStore();
    expect(store.isLoggedIn).toBe(true);
    expect(store.user).toEqual({ name: "A" });
  });

  it.each([
    [{ data: { token: "t1", user: { name: "u" } } }, "t1", { name: "u" }],
    [{ token: "t2", user: { name: "v" } }, "t2", { name: "v" }],
    [{ data: { access_token: "t3" } }, "t3", null],
  ])("logs in with different response shapes", async (response, token, user) => {
    api.login.mockResolvedValue(response);
    const store = useAuthStore();
    const result = await store.login({ email: "e", password: "p" });
    expect(result).toBe(response);
    expect(api.login).toHaveBeenCalledWith({ email: "e", password: "p" });
    expect(store.token).toBe(token);
    expect(store.user).toEqual(user);
    expect(store.isAuthLogin).toBe(false);
  });

  it("login without token or user keeps session empty", async () => {
    api.login.mockResolvedValue({ data: {} });
    const store = useAuthStore();
    await store.login({ email: "e", password: "p" });
    expect(store.isLoggedIn).toBe(false);
    expect(localStorage.getItem("auth_user")).toBeNull();
  });

  it("resets loading flag when login fails", async () => {
    api.login.mockRejectedValue(new Error("bad"));
    const store = useAuthStore();
    await expect(store.login({})).rejects.toThrow("bad");
    expect(store.isAuthLogin).toBe(false);
  });

  it("registers and resets flag on success and failure", async () => {
    api.register.mockResolvedValueOnce({ ok: 1 });
    const store = useAuthStore();
    expect(await store.register({ name: "n", email: "e", password: "p" })).toEqual({ ok: 1 });
    expect(api.register).toHaveBeenCalledWith({ name: "n", email: "e", password: "p" });
    expect(store.isAuthRegister).toBe(false);

    api.register.mockRejectedValueOnce(new Error("x"));
    await expect(store.register({})).rejects.toThrow("x");
    expect(store.isAuthRegister).toBe(false);
  });

  it("logs out and clears local session even if API fails", async () => {
    api.login.mockResolvedValue({ data: { token: "t", user: { name: "u" } } });
    const store = useAuthStore();
    await store.login({});

    api.logout.mockResolvedValueOnce({});
    await store.logout();
    expect(store.isLoggedIn).toBe(false);
    expect(store.user).toBeNull();
    expect(localStorage.getItem("auth_user")).toBeNull();

    api.logout.mockRejectedValueOnce(new Error("expired"));
    await store.logout();
    expect(store.isAuthLogout).toBe(false);
  });
});