import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch, getAccessToken, putAccessToken } from "./apiHelper";

function mockFetch({ ok = true, status = 200, body = {} } = {}) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  const fn = vi.fn().mockResolvedValue({ ok, status, text: async () => text });
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("token helpers", () => {
  it("returns empty string when no token stored", () => {
    expect(getAccessToken()).toBe("");
  });

  it("stores token in all keys and reads it back", () => {
    putAccessToken("abc");
    expect(localStorage.getItem("access_token")).toBe("abc");
    expect(localStorage.getItem("accessToken")).toBe("abc");
    expect(localStorage.getItem("token")).toBe("abc");
    expect(getAccessToken()).toBe("abc");
  });

  it("reads token from a fallback key", () => {
    localStorage.setItem("token", "fallback");
    expect(getAccessToken()).toBe("fallback");
  });

  it("removes token from all keys when empty", () => {
    putAccessToken("abc");
    putAccessToken("");
    expect(getAccessToken()).toBe("");
  });
});

describe("apiFetch", () => {
  beforeEach(() => localStorage.clear());

  it("sends GET with defaults and no token", async () => {
    const fn = mockFetch({ body: { success: true } });
    const data = await apiFetch("/ping");
    expect(data).toEqual({ success: true });
    const [url, opts] = fn.mock.calls[0];
    expect(String(url)).toContain("/ping");
    expect(opts.method).toBe("GET");
    expect(opts.headers.Authorization).toBeUndefined();
  });

  it("adds bearer token and query params, skipping empty values", async () => {
    putAccessToken("tok");
    const fn = mockFetch();
    await apiFetch("/list", { query: { a: 1, b: "", c: null, d: undefined, e: "x" } });
    const [url, opts] = fn.mock.calls[0];
    expect(url.searchParams.get("a")).toBe("1");
    expect(url.searchParams.get("e")).toBe("x");
    expect(url.searchParams.has("b")).toBe(false);
    expect(url.searchParams.has("c")).toBe(false);
    expect(url.searchParams.has("d")).toBe(false);
    expect(opts.headers.Authorization).toBe("Bearer tok");
  });

  it("encodes JSON object bodies", async () => {
    const fn = mockFetch();
    await apiFetch("/x", { method: "POST", body: { a: 1 }, headers: { "X-Test": "1" } });
    const opts = fn.mock.calls[0][1];
    expect(opts.headers["Content-Type"]).toBe("application/json");
    expect(opts.headers["X-Test"]).toBe("1");
    expect(opts.body).toBe(JSON.stringify({ a: 1 }));
  });

  it("sends URLSearchParams as form-urlencoded", async () => {
    const fn = mockFetch();
    const body = new URLSearchParams({ a: "1" });
    await apiFetch("/x", { method: "POST", body });
    const opts = fn.mock.calls[0][1];
    expect(opts.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(opts.body).toBe(body);
  });

  it("passes FormData and string bodies through untouched", async () => {
    const fn = mockFetch();
    const form = new FormData();
    await apiFetch("/x", { method: "POST", body: form });
    expect(fn.mock.calls[0][1].body).toBe(form);
    expect(fn.mock.calls[0][1].headers["Content-Type"]).toBeUndefined();

    await apiFetch("/x", { method: "POST", body: "raw" });
    expect(fn.mock.calls[1][1].body).toBe("raw");
    expect(fn.mock.calls[1][1].headers["Content-Type"]).toBeUndefined();
  });

  it("returns empty object for empty response body", async () => {
    mockFetch({ body: "" });
    expect(await apiFetch("/x")).toEqual({});
  });

  it("wraps non-JSON text as message", async () => {
    mockFetch({ body: "plain text" });
    expect(await apiFetch("/x")).toEqual({ message: "plain text" });
  });

  it("throws using message, error, or status fallback", async () => {
    mockFetch({ ok: false, status: 400, body: { message: "msg" } });
    await expect(apiFetch("/x")).rejects.toThrow("msg");

    mockFetch({ ok: false, status: 400, body: { error: "err" } });
    await expect(apiFetch("/x")).rejects.toThrow("err");

    mockFetch({ ok: false, status: 500, body: {} });
    await expect(apiFetch("/x")).rejects.toThrow("Request gagal (500)");
  });
});