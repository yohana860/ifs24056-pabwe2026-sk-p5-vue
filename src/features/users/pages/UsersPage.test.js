import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../api/userApi", () => ({ getUsers: vi.fn(), getMe: vi.fn(), updateMe: vi.fn() }));
vi.mock("../../../helpers/toolsHelper", () => ({ showErrorDialog: vi.fn() }));

import * as api from "../api/userApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import UsersPage from "./UsersPage.vue";

beforeEach(() => vi.clearAllMocks());

describe("UsersPage", () => {
  it("renders users with photo, initial fallback, and name/email fallbacks", async () => {
    api.getUsers.mockResolvedValue({
      data: {
        users: [
          { id: 1, name: "Budi", email: "b@x.id", photo: "http://img/b.png" },
          { id: 2, name: "citra", email: "c@x.id" },
          { id: 3 },
        ],
      },
    });
    const { wrapper } = await renderWithProviders(UsersPage);
    const cards = wrapper.findAll("article");
    expect(cards).toHaveLength(3);
    expect(cards[0].find("img").attributes("alt")).toBe("Foto Budi");
    expect(cards[1].text()).toContain("C");
    expect(cards[2].text()).toContain("Tanpa nama");
    expect(cards[2].text()).toContain("Email tidak tersedia");
    expect(cards[2].text()).toContain("?");
  });

  it("uses default alt text when a photo user has no name", async () => {
    api.getUsers.mockResolvedValue({ data: { users: [{ id: 9, photo: "p.png" }] } });
    const { wrapper } = await renderWithProviders(UsersPage);
    expect(wrapper.find("img").attributes("alt")).toBe("Foto Pengguna");
  });

  it("shows loading state", async () => {
    api.getUsers.mockReturnValue(new Promise(() => {}));
    const { wrapper } = await renderWithProviders(UsersPage);
    expect(wrapper.text()).toContain("Memuat data pengguna...");
  });

  it("shows empty state", async () => {
    api.getUsers.mockResolvedValue({ data: { users: [] } });
    const { wrapper } = await renderWithProviders(UsersPage);
    expect(wrapper.text()).toContain("Belum ada data pengguna.");
  });

  it("shows error dialog when request fails", async () => {
    api.getUsers.mockRejectedValue(new Error("gagal"));
    await renderWithProviders(UsersPage);
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal mengambil pengguna", "gagal");
  });
});