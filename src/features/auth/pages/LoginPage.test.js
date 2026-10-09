import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../api/authApi", () => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn() }));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue(true),
  showConfirmDialog: vi.fn(),
}));

import * as api from "../api/authApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import LoginPage from "./LoginPage.vue";

const routes = [
  { path: "/", component: { template: "<div>home</div>" } },
  { path: "/auth/login", component: LoginPage },
  { path: "/auth/register", component: { template: "<div>register</div>" } },
];

beforeEach(() => vi.clearAllMocks());

async function fill(wrapper, email, password) {
  await wrapper.find('[data-testid="login-email-input"]').setValue(email);
  await wrapper.find('[data-testid="login-password-input"]').setValue(password);
}

describe("LoginPage", () => {
  it("validates empty fields", async () => {
    const { wrapper } = await renderWithProviders(LoginPage, { route: "/auth/login", routes });
    await wrapper.find("form").trigger("submit");
    expect(showErrorDialog).toHaveBeenCalledWith("Validasi", "Email dan password wajib diisi");
    expect(api.login).not.toHaveBeenCalled();
  });

  it("logs in and redirects home", async () => {
    api.login.mockResolvedValue({ data: { token: "tok", user: { name: "u" } } });
    const { wrapper, router } = await renderWithProviders(LoginPage, { route: "/auth/login", routes });
    await fill(wrapper, "a@b.c", "secret");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe("/"));
    expect(api.login).toHaveBeenCalledWith({ email: "a@b.c", password: "secret" });
    expect(localStorage.getItem("access_token")).toBe("tok");
  });

  it("shows API error message", async () => {
    api.login.mockRejectedValue(new Error("Password salah"));
    const { wrapper } = await renderWithProviders(LoginPage, { route: "/auth/login", routes });
    await fill(wrapper, "a@b.c", "x");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Login gagal", "Password salah"));
  });

  it("falls back to a generic message when error has no message", async () => {
    api.login.mockRejectedValue(new Error(""));
    const { wrapper } = await renderWithProviders(LoginPage, { route: "/auth/login", routes });
    await fill(wrapper, "a@b.c", "x");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() =>
      expect(showErrorDialog).toHaveBeenCalledWith("Login gagal", "Terjadi kesalahan saat login")
    );
  });

  it("disables submit while logging in and links to register", async () => {
    let resolve;
    api.login.mockReturnValue(new Promise((r) => (resolve = r)));
    const { wrapper } = await renderWithProviders(LoginPage, { route: "/auth/login", routes });
    await fill(wrapper, "a@b.c", "x");
    await wrapper.find("form").trigger("submit");
    const button = wrapper.find('[data-testid="login-submit-button"]');
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toBe("Memproses...");
    resolve({ data: {} });
    await vi.waitFor(() => expect(button.text()).toBe("Masuk"));
    expect(wrapper.find('[data-testid="go-register-link"]').attributes("href")).toBe("/auth/register");
  });
});