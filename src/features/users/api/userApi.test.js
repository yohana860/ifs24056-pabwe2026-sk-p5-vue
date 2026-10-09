import { describe, it, expect, vi } from "vitest";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn().mockResolvedValue({ ok: true }) }));

import { apiFetch } from "../../../helpers/apiHelper";
import { getUsers, getMe, updateMe, uploadPhoto, changePassword } from "./userApi";

describe("userApi", () => {
  it("calls every user endpoint", async () => {
    await getUsers();
    expect(apiFetch).toHaveBeenLastCalledWith("/users");
    await getMe();
    expect(apiFetch).toHaveBeenLastCalledWith("/users/me");
    await updateMe({ name: "n" });
    expect(apiFetch).toHaveBeenLastCalledWith("/users/me", { method: "PUT", body: { name: "n" } });
    await uploadPhoto("f");
    expect(apiFetch).toHaveBeenLastCalledWith("/users/me/photo", { method: "POST", body: "f" });
    await changePassword({ p: 1 });
    expect(apiFetch).toHaveBeenLastCalledWith("/users/me/password", { method: "PUT", body: { p: 1 } });
  });
});