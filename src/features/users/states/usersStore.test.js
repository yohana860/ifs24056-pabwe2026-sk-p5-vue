import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

vi.mock("../api/userApi", () => ({ getUsers: vi.fn(), getMe: vi.fn(), updateMe: vi.fn() }));

import * as api from "../api/userApi";
import { useUsersStore } from "./usersStore";

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("usersStore.fetchUsers", () => {
  it.each([
    [{ data: { users: [{ id: 1 }] } }, [{ id: 1 }]],
    [{ users: [{ id: 2 }] }, [{ id: 2 }]],
    [{}, []],
    [undefined, []],
  ])("unwraps users from %j", async (response, expected) => {
    api.getUsers.mockResolvedValue(response);
    const store = useUsersStore();
    expect(await store.fetchUsers()).toEqual(expected);
    expect(store.users).toEqual(expected);
    expect(store.loading).toBe(false);
  });

  it("stores error message and rethrows", async () => {
    api.getUsers.mockRejectedValue(new Error("gagal"));
    const store = useUsersStore();
    await expect(store.fetchUsers()).rejects.toThrow("gagal");
    expect(store.error).toBe("gagal");
    expect(store.loading).toBe(false);
  });
});

describe("usersStore.fetchProfile", () => {
  it.each([
    [{ data: { user: { n: 1 } } }, { n: 1 }],
    [{ data: { profile: { n: 2 } } }, { n: 2 }],
    [{ user: { n: 3 } }, { n: 3 }],
    [{ profile: { n: 4 } }, { n: 4 }],
    [{ data: { n: 5 } }, { n: 5 }],
    [{ n: 6 }, { n: 6 }],
    [null, null],
  ])("unwraps profile from %j", async (response, expected) => {
    api.getMe.mockResolvedValue(response);
    const store = useUsersStore();
    expect(await store.fetchProfile()).toEqual(expected);
    expect(store.profileLoading).toBe(false);
  });

  it("stores error message and rethrows", async () => {
    api.getMe.mockRejectedValue(new Error("gagal"));
    const store = useUsersStore();
    await expect(store.fetchProfile()).rejects.toThrow("gagal");
    expect(store.error).toBe("gagal");
    expect(store.profileLoading).toBe(false);
  });
});

describe("usersStore.updateProfile", () => {
  it("updates and refreshes profile", async () => {
    api.updateMe.mockResolvedValue({ ok: 1 });
    api.getMe.mockResolvedValue({ data: { user: { name: "baru" } } });
    const store = useUsersStore();
    expect(await store.updateProfile({ name: "baru" })).toEqual({ ok: 1 });
    expect(api.updateMe).toHaveBeenCalledWith({ name: "baru" });
    expect(store.profile).toEqual({ name: "baru" });
  });
});