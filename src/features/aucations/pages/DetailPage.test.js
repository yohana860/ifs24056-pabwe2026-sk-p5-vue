import { describe, it, expect, vi, beforeEach } from "vitest";

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
vi.mock("../../../helpers/toolsHelper", async () => {
  const actual = await vi.importActual("../../../helpers/toolsHelper");
  return { ...actual, showErrorDialog: vi.fn(), showSuccessDialog: vi.fn().mockResolvedValue(true) };
});

import * as api from "../api/aucationApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import DetailPage from "./DetailPage.vue";

const routes = [
  { path: "/", component: { template: "<div>home</div>" } },
  { path: "/aucations/:aucationId", component: DetailPage },
];

const full = {
  id: 1,
  title: "Laptop",
  description: "Bagus",
  cover: "http://127.0.0.1:8000/cover.png",
  start_bid: 1000,
  closed_at: "2030-01-01T10:00:00Z",
  author: { name: "Budi" },
  bids: [
    { id: 11, bid: 2000, created_at: "2026-10-01T10:00:00Z" },
    { bid: 3000, created_at: "2026-10-02T10:00:00Z" },
  ],
};

function render() {
  return renderWithProviders(DetailPage, { route: "/aucations/1", routes });
}

beforeEach(() => {
  vi.clearAllMocks();
  api.getAucation.mockResolvedValue({ data: { aucation: full } });
});

describe("DetailPage", () => {
  it("renders aucation detail, cover url rewrite, highest bid and history", async () => {
    const { wrapper } = await render();
    expect(api.getAucation).toHaveBeenCalledWith("1");
    expect(wrapper.find("img").attributes("src")).toBe("https://open-api.delcom.org/cover.png");
    expect(wrapper.text()).toContain("Pemilik: Budi");
    expect(wrapper.text()).toContain("Laptop");
    expect(wrapper.text()).toContain("Penawaran #1");
    expect(wrapper.text()).toContain("Penawaran #2");
    expect(wrapper.text().replace(/\s/g, "")).toContain("3.000");
  });

  it("renders fallbacks when cover, author and bids are missing", async () => {
    api.getAucation.mockResolvedValue({ data: { aucation: { id: 1, title: "X", start_bid: 500 } } });
    const { wrapper } = await render();
    expect(wrapper.text()).toContain("No Cover");
    expect(wrapper.text()).toContain("Pengguna Delcom");
    expect(wrapper.text()).toContain("Belum ada penawaran.");
  });

  it("treats missing start bid and bids without amount as zero", async () => {
    api.getAucation.mockResolvedValue({
      data: { aucation: { id: 1, title: "X", bids: [{}] } },
    });
    const { wrapper } = await render();
    expect(wrapper.text()).toContain("Penawaran #1");
  });

  it("shows loading and not-found states", async () => {
    api.getAucation.mockReturnValue(new Promise(() => {}));
    const loading = await render();
    expect(loading.wrapper.text()).toContain("Memuat detail lelang...");

    api.getAucation.mockResolvedValue({});
    const missing = await render();
    expect(missing.wrapper.text()).toContain("Data lelang tidak ditemukan.");
  });

  it("shows error dialog when fetching fails", async () => {
    api.getAucation.mockRejectedValue(new Error("gagal"));
    await render();
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal mengambil detail", "gagal");
  });

  it("goes back from the back button", async () => {
    const { wrapper, router } = await render();
    const back = vi.spyOn(router, "back").mockImplementation(() => {});
    const button = wrapper.findAll("button").find((b) => b.text().includes("Kembali"));
    await button.trigger("click");
    expect(back).toHaveBeenCalled();
  });

  it("ignores empty prompt", async () => {
    vi.spyOn(window, "prompt").mockReturnValue("");
    const { wrapper } = await render();
    await wrapper.find("article button").trigger("click");
    expect(api.addBid).not.toHaveBeenCalled();
    expect(showErrorDialog).not.toHaveBeenCalled();
  });

  it.each(["abc", "3000", "10"])("rejects invalid bid %s", async (value) => {
    vi.spyOn(window, "prompt").mockReturnValue(value);
    const { wrapper } = await render();
    await wrapper.find("article button").trigger("click");
    await vi.waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Bid tidak valid", expect.any(String)));
    expect(api.addBid).not.toHaveBeenCalled();
  });

  it("submits a valid bid and refreshes detail", async () => {
    vi.spyOn(window, "prompt").mockReturnValue("5000");
    api.addBid.mockResolvedValue({});
    const { wrapper } = await render();
    await wrapper.find("article button").trigger("click");
    await vi.waitFor(() => expect(showSuccessDialog).toHaveBeenCalled());
    expect(api.addBid).toHaveBeenCalledWith("1", { bid: 5000 });
    expect(api.getAucation).toHaveBeenCalledTimes(2);
  });

  it("shows error when bidding fails", async () => {
    vi.spyOn(window, "prompt").mockReturnValue("5000");
    api.addBid.mockRejectedValue(new Error("ditolak"));
    const { wrapper } = await render();
    await wrapper.find("article button").trigger("click");
    await vi.waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Bid gagal", "ditolak"));
  });
});