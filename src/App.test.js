import { describe, it, expect } from "vitest";
import { renderWithProviders } from "./test-utils";
import App from "./App.vue";

describe("App", () => {
  it("renders the current route", async () => {
    const { wrapper } = await renderWithProviders(App, {
      route: "/",
      routes: [{ path: "/", component: { template: "<p>halaman-awal</p>" } }],
    });
    expect(wrapper.text()).toContain("halaman-awal");
  });
});