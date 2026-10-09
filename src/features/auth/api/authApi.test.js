import { describe, it, expect, vi } from "vitest";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn().mockResolvedValue({ ok: true }) }));

import { apiFetch } from "../../../helpers/apiHelper";
import { login, register, logout } from "./authApi";

describe("authApi", () => {
  it("calls login, register and logout endpoints", async () => {
    await login({ email: "a" });
    expect(apiFetch).toHaveBeenLastCalledWith("/auth/login", { method: "POST", body: { email: "a" } });
    await register({ name: "n" });
    expect(apiFetch).toHaveBeenLastCalledWith("/auth/register", { method: "POST", body: { name: "n" } });
    await logout();
    expect(apiFetch).toHaveBeenLastCalledWith("/auth/logout", { method: "POST" });
  });
});