import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import AuthLayout from "./AuthLayout.vue";

describe("AuthLayout", () => {
  it("renders banner, main landmark and the child route", async () => {
    const child = { template: "<p>child-content</p>" };
    const { wrapper } = await renderWithProviders(AuthLayout, {
      route: "/auth/login",
      routes: [{ path: "/auth", component: AuthLayout, children: [{ path: "login", component: child }] }],
    });
    expect(wrapper.find("aside").text()).toContain("Delcom Auction");
    expect(wrapper.find("main").exists()).toBe(true);
  });
});