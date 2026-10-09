import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../api/userApi", () => ({ getUsers: vi.fn(), getMe: vi.fn(), updateMe: vi.fn() }));
vi.mock("../../../helpers/toolsHelper", () => ({ showErrorDialog: vi.fn() }));

import * as api from "../api/userApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import ProfilePage from "./ProfilePage.vue";

beforeEach(() => vi.clearAllMocks());

describe("ProfilePage", () => {
  it("renders full profile", async () => {
    api.getMe.mockResolvedValue({
      data: { user: { id: "u1", name: "Budi", email: "b@x.id", description: "Halo" } },
    });
    const { wrapper } = await renderWithProviders(ProfilePage);
    const text = wrapper.text();
    expect(text).toContain("Budi");
    expect(text).toContain("b@x.id");
    expect(text).toContain("Halo");
    expect(text).toContain("u1");
  });

  it("renders fallbacks for missing fields", async () => {
    api.getMe.mockResolvedValue({ data: { user: {} } });
    const { wrapper } = await renderWithProviders(ProfilePage);
    expect(wrapper.text()).toContain("Belum ada deskripsi.");
    expect(wrapper.text().match(/-/g)).toHaveLength(3);
  });

  it("shows loading state", async () => {
    api.getMe.mockReturnValue(new Promise(() => {}));
    const { wrapper } = await renderWithProviders(ProfilePage);
    expect(wrapper.text()).toContain("Memuat profil...");
  });

  it("renders nothing for profile when none is returned", async () => {
    api.getMe.mockResolvedValue(null);
    const { wrapper } = await renderWithProviders(ProfilePage);
    expect(wrapper.text()).not.toContain("Nama");
  });

  it("shows error dialog when request fails", async () => {
    api.getMe.mockRejectedValue(new Error("gagal"));
    await renderWithProviders(ProfilePage);
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal mengambil profil", "gagal");
  });
});