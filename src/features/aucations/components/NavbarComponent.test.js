import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../auth/api/authApi", () => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn().mockResolvedValue({}) }));
vi.mock("../../../helpers/toolsHelper", () => ({ showConfirmDialog: vi.fn() }));

import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { useAuthStore } from "../../auth/states/authStore";
import { renderWithProviders } from "../../../test-utils";
import NavbarComponent from "./NavbarComponent.vue";

const routes = [
  { path: "/", component: { template: "<div />" } },
  { path: "/auth/login", component: { template: "<div />" } },
];

beforeEach(() => vi.clearAllMocks());

describe("NavbarComponent", () => {
  it("shows name, falls back to email, then to default label", async () => {
    const { wrapper, pinia } = await renderWithProviders(NavbarComponent, { routes });
    expect(wrapper.find('[data-testid="navbar-user"]').text()).toBe("Pengguna");

    const auth = useAuthStore(pinia);
    auth.user = { email: "e@x.id" };
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="navbar-user"]').text()).toBe("e@x.id");

    auth.user = { name: "Budi", email: "e@x.id" };
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="navbar-user"]').text()).toBe("Budi");
  });

  it("emits toggle-sidebar from the menu button", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent, { routes });
    await wrapper.find('button[aria-label="Buka menu"]').trigger("click");
    expect(wrapper.emitted("toggle-sidebar")).toHaveLength(1);
  });

  it("does nothing when logout is cancelled", async () => {
    showConfirmDialog.mockResolvedValue(false);
    const { wrapper, pinia } = await renderWithProviders(NavbarComponent, { routes });
    const auth = useAuthStore(pinia);
    auth.token = "tok";
    await wrapper.find('[data-testid="logout-button"]').trigger("click");
    await vi.waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(auth.token).toBe("tok");
  });

  it("logs out and redirects to login when confirmed", async () => {
    showConfirmDialog.mockResolvedValue(true);
    const { wrapper, router, pinia } = await renderWithProviders(NavbarComponent, { routes });
    const auth = useAuthStore(pinia);
    auth.token = "tok";
    await wrapper.find('[data-testid="logout-button"]').trigger("click");
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe("/auth/login"));
    expect(auth.token).toBe("");
  });
});