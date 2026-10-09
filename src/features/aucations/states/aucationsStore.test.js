import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

vi.mock("../api/aucationApi", () => ({
  getAucations: vi.fn(),
  getAucation: vi.fn(),
  addAucation: vi.fn(),
  updateAucation: vi.fn(),
  uploadCover: vi.fn(),
  deleteAucation: vi.fn(),
  addBid: vi.fn(),
  deleteBid: vi.fn(),
  deleteAll: vi.fn(),
}));

import * as api from "../api/aucationApi";
import { useAucationsStore } from "./aucationsStore";

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("aucationsStore.fetchAucations", () => {
  it.each([
    [{ data: { aucations: [{ id: 1 }] } }, [{ id: 1 }]],
    [{ aucations: [{ id: 2 }] }, [{ id: 2 }]],
    [{}, []],
    [undefined, []],
  ])("unwraps list from %j", async (response, expected) => {
    api.getAucations.mockResolvedValue(response);
    const store = useAucationsStore();
    expect(await store.fetchAucations({ is_me: 1 })).toEqual(expected);
    expect(api.getAucations).toHaveBeenCalledWith({ is_me: 1 });
    expect(store.loading).toBe(false);
  });

  it("uses empty query by default", async () => {
    api.getAucations.mockResolvedValue({});
    await useAucationsStore().fetchAucations();
    expect(api.getAucations).toHaveBeenCalledWith({});
  });

  it("stores error and rethrows", async () => {
    api.getAucations.mockRejectedValue(new Error("gagal"));
    const store = useAucationsStore();
    await expect(store.fetchAucations()).rejects.toThrow("gagal");
    expect(store.error).toBe("gagal");
    expect(store.loading).toBe(false);
  });
});

describe("aucationsStore.fetchAucation", () => {
  it.each([
    [{ data: { aucation: { id: 1 } } }, { id: 1 }],
    [{ aucation: { id: 2 } }, { id: 2 }],
    [{ data: { id: 3 } }, { id: 3 }],
    [{}, null],
    [undefined, null],
  ])("unwraps detail from %j", async (response, expected) => {
    api.getAucation.mockResolvedValue(response);
    const store = useAucationsStore();
    expect(await store.fetchAucation(1)).toEqual(expected);
    expect(store.aucation).toEqual(expected);
  });

  it("stores error and rethrows", async () => {
    api.getAucation.mockRejectedValue(new Error("gagal"));
    const store = useAucationsStore();
    await expect(store.fetchAucation(1)).rejects.toThrow("gagal");
    expect(store.error).toBe("gagal");
    expect(store.loading).toBe(false);
  });
});

describe("aucationsStore mutations", () => {
  it.each([
    ["addAucation", "addAucation"],
    ["updateAucation", "updateAucation"],
    ["uploadCover", "uploadCover"],
    ["deleteAucation", "deleteAucation"],
    ["addBid", "addBid"],
    ["deleteBid", "deleteBid"],
    ["deleteAll", "deleteAll"],
  ])("delegates %s to the api", async (action, apiName) => {
    api[apiName].mockResolvedValue({ ok: action });
    const store = useAucationsStore();
    expect(await store[action](1, { a: 1 })).toEqual({ ok: action });
    expect(api[apiName]).toHaveBeenCalledWith(1, { a: 1 });
  });
});