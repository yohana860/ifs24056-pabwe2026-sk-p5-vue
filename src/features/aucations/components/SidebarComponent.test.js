import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import SidebarComponent from "./SidebarComponent.vue";

const routes = [
  { path: "/", component: { template: "<div />" } },
  { path: "/users", component: { template: "<div />" } },
  { path: "/profile", component: { template: "<div />" } },
];

describe("SidebarComponent", () => {
  it("renders navigation links", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { routes });
    expect(wrapper.find('[data-testid="nav-home"]').attributes("href")).toBe("/");
    expect(wrapper.find('[data-testid="nav-users"]').attributes("href")).toBe("/users");
    expect(wrapper.find('[data-testid="nav-profile"]').attributes("href")).toBe("/profile");
  });

  it("is hidden by default and visible when open", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { routes });
    expect(wrapper.find("aside").classes()).toContain("-translate-x-full");
    await wrapper.setProps({ open: true });
    expect(wrapper.find("aside").classes()).toContain("translate-x-0");
  });

  it("emits close when a link is clicked", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { routes, props: { open: true } });
    await wrapper.find('[data-testid="nav-users"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});