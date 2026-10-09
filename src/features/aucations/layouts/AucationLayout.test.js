import { describe, it, expect, vi } from "vitest";

vi.mock("../../auth/api/authApi", () => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn() }));

import { renderWithProviders } from "../../../test-utils";
import AucationLayout from "./AucationLayout.vue";

describe("AucationLayout", () => {
  it("renders navbar, sidebar and child route, and toggles sidebar", async () => {
    const child = { template: "<p>isi-halaman</p>" };
    const { wrapper } = await renderWithProviders(AucationLayout, {
      route: "/",
      routes: [{ path: "/", component: AucationLayout, children: [{ path: "", component: child }] }],
    });
    expect(wrapper.find('[data-testid="navbar"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("isi-halaman");

    expect(wrapper.find("aside").classes()).toContain("-translate-x-full");
    await wrapper.find('button[aria-label="Buka menu"]').trigger("click");
    expect(wrapper.find("aside").classes()).toContain("translate-x-0");

    await wrapper.find('[data-testid="nav-home"]').trigger("click");
    expect(wrapper.find("aside").classes()).toContain("-translate-x-full");
  });
});