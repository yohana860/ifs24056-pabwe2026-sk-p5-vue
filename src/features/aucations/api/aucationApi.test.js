import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn() }));

import { apiFetch } from "../../../helpers/apiHelper";
import {
  getAucations,
  getAucation,
  uploadCover,
  addAucation,
  updateAucation,
  deleteAucation,
  addBid,
  deleteBid,
  deleteAll,
} from "./aucationApi";

beforeEach(() => {
  apiFetch.mockReset();
  apiFetch.mockResolvedValue({ data: {} });
});

describe("aucationApi", () => {
  it("gets list and detail", async () => {
    await getAucations({ is_me: 1 });
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations", { query: { is_me: 1 } });
    await getAucations();
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations", { query: {} });
    await getAucation(5);
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations/5");
  });

  it("uploads cover as FormData", async () => {
    const file = new File(["x"], "a.png");
    await uploadCover(3, file);
    const [path, opts] = apiFetch.mock.calls[0];
    expect(path).toBe("/aucations/3/cover");
    expect(opts.method).toBe("POST");
    expect(opts.body.get("cover")).toBe(file);
  });

  it("adds aucation then uploads cover using aucation_id", async () => {
    apiFetch.mockResolvedValueOnce({ data: { aucation_id: 9 } }).mockResolvedValueOnce({});
    await addAucation({ title: "t", description: "d", start_bid: "100", closed_at: "x", cover: new File(["x"], "a.png") });
    expect(apiFetch.mock.calls[0]).toEqual([
      "/aucations",
      { method: "POST", body: { title: "t", description: "d", start_bid: 100, closed_at: "x" } },
    ]);
    expect(apiFetch.mock.calls[1][0]).toBe("/aucations/9/cover");
  });

  it.each([
    [{ data: { id: 4 } }, "/aucations/4/cover"],
    [{ data: { aucation: { id: 6 } } }, "/aucations/6/cover"],
  ])("finds id from alternative response shapes", async (response, expected) => {
    apiFetch.mockResolvedValueOnce(response).mockResolvedValueOnce({});
    await addAucation({ cover: new File(["x"], "a.png") });
    expect(apiFetch.mock.calls[1][0]).toBe(expected);
  });

  it("uses empty defaults and skips cover upload when no id or no cover", async () => {
    apiFetch.mockResolvedValueOnce({ data: {} });
    await addAucation({ cover: new File(["x"], "a.png") });
    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch.mock.calls[0][1].body).toEqual({ title: "", description: "", start_bid: 0, closed_at: "" });

    apiFetch.mockResolvedValueOnce({ data: { id: 1 } });
    await addAucation({});
    expect(apiFetch).toHaveBeenCalledTimes(2);
  });

  it("updates, deletes and bids", async () => {
    await updateAucation(1, { title: "t" });
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations/1", {
      method: "PUT",
      body: { title: "t", description: "", start_bid: 0, closed_at: "" },
    });
    await deleteAucation(1);
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations/1", { method: "DELETE" });
    await addBid(1, { bid: "500" });
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations/1/bids", { method: "POST", body: { bid: 500 } });
    await addBid(1, {});
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations/1/bids", { method: "POST", body: { bid: 0 } });
    await deleteBid(1);
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations/1/bids", { method: "DELETE" });
    await deleteAll();
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations", { method: "DELETE" });
  });
});