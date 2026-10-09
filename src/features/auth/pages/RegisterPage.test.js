import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../api/authApi", () => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn() }));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue(true),
  showConfirmDialog: vi.fn(),
}));

import * as api from "../api/authApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import RegisterPage from "./RegisterPage.vue";

const routes = [
  { path: "/auth/register", component: RegisterPage },
  { path: "/auth/login", component: { template: "<div>login</div>" } },
];

beforeEach(() => vi.clearAllMocks());

async function fill(wrapper, name, email, password) {
  await wrapper.find('[data-testid="register-name-input"]').setValue(name);
  await wrapper.find('[data-testid="register-email-input"]').setValue(email);
  await wrapper.find('[data-testid="register-password-input"]').setValue(password);
}

describe("RegisterPage", () => {
  it("validates empty fields", async () => {
    const { wrapper } = await renderWithProviders(RegisterPage, { route: "/auth/register", routes });
    await wrapper.find("form").trigger("submit");
    expect(showErrorDialog).toHaveBeenCalledWith("Validasi", "Nama, email, dan password wajib diisi");
    expect(api.register).not.toHaveBeenCalled();
  });

  it("registers then redirects to login", async () => {
    api.register.mockResolvedValue({});
    const { wrapper, router } = await renderWithProviders(RegisterPage, { route: "/auth/register", routes });
    await fill(wrapper, "Nama", "a@b.c", "secret");
    await wrapper.find("form").trigger("submit");
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe("/auth/login"));
    expect(api.register).toHaveBeenCalledWith({ name: "Nama", email: "a@b.c", password: "secret" });
    expect(showSuccessDialog).toHaveBeenCalled();
  });

  it("shows error when registration fails and shows loading label", async () => {
    let reject;
    api.register.mockReturnValue(new Promise((_, r) => (reject = r)));
    const { wrapper } = await renderWithProviders(RegisterPage, { route: "/auth/register", routes });
    await fill(wrapper, "Nama", "a@b.c", "secret");
    await wrapper.find("form").trigger("submit");
    expect(wrapper.find('[data-testid="register-submit-button"]').text()).toBe("Memproses...");
    reject(new Error("Email dipakai"));
    await vi.waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Registrasi gagal", "Email dipakai"));
    expect(wrapper.find('[data-testid="register-submit-button"]').text()).toBe("Daftar");
    expect(wrapper.find('[data-testid="go-login-link"]').attributes("href")).toBe("/auth/login");
  });
});