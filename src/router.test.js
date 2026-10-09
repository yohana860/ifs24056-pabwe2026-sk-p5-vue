import { describe, it, expect, beforeEach } from "vitest";
import router from "./router";

describe("router", () => {
  beforeEach(async () => {
    localStorage.clear();
    document.head.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove());
    await router.push("/auth/login").catch(() => {});
    localStorage.clear();
    await router.push("/auth/login").catch(() => {});
  });

  it("redirects protected routes to login when there is no token", async () => {
    await router.push("/users");
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("allows protected routes when a token exists", async () => {
    localStorage.setItem("access_token", "tok");
    for (const path of ["/", "/users", "/profile", "/aucations/1"]) {
      await router.push(path);
      expect(router.currentRoute.value.path).toBe(path);
    }
  });

  it("redirects guest-only routes to home when logged in", async () => {
    localStorage.setItem("access_token", "tok");
    await router.push("/auth/register");
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("allows guest routes without token and resolves not found", async () => {
    await router.push("/auth/register");
    expect(router.currentRoute.value.path).toBe("/auth/register");
    await router.push("/halaman-tidak-ada");
    expect(router.currentRoute.value.matched[0].path).toBe("/:pathMatch(.*)*");
  });

  it("creates and updates the canonical link", async () => {
    await router.push("/auth/register");
    const link = document.head.querySelector('link[rel="canonical"]');
    expect(link.getAttribute("href")).toBe(`${window.location.origin}/auth/register`);

    await router.push("/auth/login");
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelector('link[rel="canonical"]').getAttribute("href")).toBe(
      `${window.location.origin}/auth/login`
    );
  });
});