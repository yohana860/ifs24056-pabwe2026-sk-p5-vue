import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue(true),
  showConfirmDialog: vi.fn(),
}));

import * as api from "../api/aucationApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import HomePage from "./HomePage.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/aucations/:aucationId", component: { template: "<div>detail</div>" } },
];

const future = "2099-01-01T10:00:00Z";
const past = "2020-01-01T10:00:00Z";

const items = [
  {
    id: 1,
    title: "Laptop Gaming",
    description: "Kondisi mulus",
    cover: "http://localhost:8000/a.png",
    start_bid: 1000,
    closed_at: future,
    author: { name: "Budi" },
    bids: [{ bid: 5000 }, {}],
  },
  { id: 2, title: "Kamera", description: "Lensa tajam", start_bid: 2000, closed_at: past },
  { id: 3, start_bid: 0 },
];

function render() {
  return renderWithProviders(HomePage, { route: "/", routes });
}

function buttonByText(wrapper, text) {
  return wrapper.findAll("button").find((b) => b.text() === text);
}

beforeEach(() => {
  vi.clearAllMocks();
  api.getAucations.mockResolvedValue({ data: { aucations: items } });
});

afterEach(() => vi.useRealTimers());

describe("HomePage list", () => {
  it("renders cards with computed prices, badges and fallbacks", async () => {
    const { wrapper } = await render();
    expect(api.getAucations).toHaveBeenCalledWith({});
    const cards = wrapper.findAll("article");
    expect(cards).toHaveLength(3);
    expect(cards[0].find("img").attributes("src")).toBe("https://open-api.delcom.org/a.png");
    expect(cards[0].text()).toContain("Budi");
    expect(cards[0].text()).toContain("Berlangsung");
    expect(cards[0].text().replace(/\s/g, "")).toContain("5.000");
    expect(cards[1].text()).toContain("Tidak ada gambar");
    expect(cards[1].text()).toContain("Ditutup");
    expect(cards[1].text()).toContain("Tidak diketahui");
    expect(cards[2].text()).toContain("-");
  });

  it("loads only the first cover eagerly and lazy-loads the rest", async () => {
    api.getAucations.mockResolvedValue({
      data: {
        aucations: [
          { id: 1, title: "A", cover: "http://localhost:8000/a.png", start_bid: 1 },
          { id: 2, title: "B", cover: "http://localhost:8000/b.png", start_bid: 2 },
        ],
      },
    });
    const { wrapper } = await render();
    const imgs = wrapper.findAll("article img");
    expect(imgs).toHaveLength(2);
    expect(imgs[0].attributes("loading")).toBe("eager");
    expect(imgs[0].attributes("fetchpriority")).toBe("high");
    expect(imgs[1].attributes("loading")).toBe("lazy");
    expect(imgs[1].attributes("fetchpriority")).toBe("auto");
  });

  it("shows loading state", async () => {
    api.getAucations.mockReturnValue(new Promise(() => {}));
    const { wrapper } = await render();
    expect(wrapper.text()).toContain("Memuat data lelang...");
  });

  it("shows empty state with add button that opens the modal", async () => {
    api.getAucations.mockResolvedValue({ data: { aucations: [] } });
    const { wrapper } = await render();
    expect(wrapper.text()).toContain("Belum ada lelang");
    await wrapper.find(".border-dashed button").trigger("click");
    expect(wrapper.find("form").exists()).toBe(true);
  });

  it("logs error when loading fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    api.getAucations.mockRejectedValue(new Error("gagal"));
    await render();
    expect(spy).toHaveBeenCalled();
  });

  it("navigates to detail", async () => {
    const { wrapper, router } = await render();
    await wrapper.find("article button").trigger("click");
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe("/aucations/1"));
  });
});

describe("HomePage filters and search", () => {
  it("filters open and closed on the client", async () => {
    const { wrapper } = await render();
    await buttonByText(wrapper, "Berlangsung").trigger("click");
    await vi.waitFor(() => expect(wrapper.findAll("article")).toHaveLength(2));
    expect(wrapper.text()).not.toContain("Kamera");

    await buttonByText(wrapper, "Ditutup").trigger("click");
    await vi.waitFor(() => expect(wrapper.findAll("article")).toHaveLength(1));
    expect(wrapper.text()).toContain("Kamera");

    await buttonByText(wrapper, "Semua Lelang").trigger("click");
    await vi.waitFor(() => expect(wrapper.findAll("article")).toHaveLength(3));
  });

  it("requests only my aucations from the API", async () => {
    const { wrapper } = await render();
    await buttonByText(wrapper, "Lelang Saya").trigger("click");
    await vi.waitFor(() => expect(api.getAucations).toHaveBeenLastCalledWith({ is_me: 1 }));
  });

  it("searches title and description, case-insensitive", async () => {
    const { wrapper } = await render();
    const input = wrapper.find('input[type="search"]');
    await input.setValue("LAPTOP");
    expect(wrapper.findAll("article")).toHaveLength(1);
    await input.setValue("tajam");
    expect(wrapper.findAll("article")).toHaveLength(1);
    await input.setValue("tidak-ada");
    expect(wrapper.text()).toContain("Belum ada lelang");
    await input.setValue("   ");
    expect(wrapper.findAll("article")).toHaveLength(3);
  });
});

describe("HomePage add modal", () => {
  async function openModal() {
    const ctx = await render();
    await buttonByText(ctx.wrapper, "+ Tambah Lelang").trigger("click");
    return ctx;
  }

  async function fillForm(wrapper, { title = "Barang", description = "Deskripsi", bid = "1000", closed = "2099-01-01T10:00", file = true } = {}) {
    const inputs = wrapper.find("form").findAll("input");
    await inputs[0].setValue(title);
    await wrapper.find("textarea").setValue(description);
    await inputs[1].setValue(bid);
    await inputs[2].setValue(closed);
    if (file) {
      const input = inputs[3];
      Object.defineProperty(input.element, "files", { value: [new File(["x"], "a.png")], configurable: true });
      await input.trigger("change");
    }
  }

  async function submit(wrapper) {
    await wrapper.find("form").trigger("submit");
  }

  it("opens, resets and closes the modal via cancel, close button and backdrop", async () => {
    const { wrapper } = await openModal();
    expect(wrapper.find("form").exists()).toBe(true);

    await buttonByText(wrapper, "Batal").trigger("click");
    expect(wrapper.find("form").exists()).toBe(false);

    await buttonByText(wrapper, "+ Tambah Lelang").trigger("click");
    await buttonByText(wrapper, "×").trigger("click");
    expect(wrapper.find("form").exists()).toBe(false);

    await buttonByText(wrapper, "+ Tambah Lelang").trigger("click");
    await wrapper.find(".fixed").trigger("click");
    expect(wrapper.find("form").exists()).toBe(false);
  });

  it("clears previous values when reopened", async () => {
    const { wrapper } = await openModal();
    await fillForm(wrapper);
    await buttonByText(wrapper, "Batal").trigger("click");
    await buttonByText(wrapper, "+ Tambah Lelang").trigger("click");
    expect(wrapper.find("form").findAll("input")[0].element.value).toBe("");
  });

  it("handles file input without files", async () => {
    const { wrapper } = await openModal();
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, "files", { value: undefined, configurable: true });
    await input.trigger("change");
    await fillForm(wrapper, { file: false });
    await submit(wrapper);
    expect(showErrorDialog).toHaveBeenLastCalledWith("Validasi", "Cover barang wajib dipilih.");
  });

  it.each([
    [{ title: " " }, "Judul lelang wajib diisi."],
    [{ description: " " }, "Deskripsi lelang wajib diisi."],
    [{ bid: "0" }, "Harga awal harus lebih dari 0."],
    [{ bid: "" }, "Harga awal harus lebih dari 0."],
    [{ closed: "" }, "Batas waktu lelang wajib diisi."],
    [{ file: false }, "Cover barang wajib dipilih."],
    [{ closed: "2020-01-01T10:00" }, "Batas waktu harus lebih dari waktu sekarang."],
  ])("validates %j", async (override, message) => {
    const { wrapper } = await openModal();
    await fillForm(wrapper, override);
    await submit(wrapper);
    expect(showErrorDialog).toHaveBeenLastCalledWith("Validasi", message);
    expect(api.addAucation).not.toHaveBeenCalled();
  });

  it("submits a new aucation and refreshes the list", async () => {
    let resolve;
    api.addAucation.mockReturnValue(new Promise((r) => (resolve = r)));
    const { wrapper } = await openModal();
    await fillForm(wrapper);
    await submit(wrapper);

    expect(buttonByText(wrapper, "Menyimpan...").attributes("disabled")).toBeDefined();
    await wrapper.find(".fixed").trigger("click"); // backdrop diabaikan saat submitting
    expect(wrapper.find("form").exists()).toBe(true);

    resolve({});
    await vi.waitFor(() => expect(showSuccessDialog).toHaveBeenCalled());
    const payload = api.addAucation.mock.calls[0][0];
    expect(payload).toMatchObject({ title: "Barang", description: "Deskripsi", start_bid: 1000 });
    expect(payload.closed_at).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    expect(payload.cover).toBeInstanceOf(File);
    expect(api.getAucations).toHaveBeenCalledTimes(2);
    expect(wrapper.find("form").exists()).toBe(false);
  });

  it("shows API error message, or a generic one", async () => {
    api.addAucation.mockRejectedValueOnce(new Error("Ditolak"));
    const { wrapper } = await openModal();
    await fillForm(wrapper);
    await submit(wrapper);
    await vi.waitFor(() => expect(showErrorDialog).toHaveBeenLastCalledWith("Gagal menambahkan lelang", "Ditolak"));

    api.addAucation.mockRejectedValueOnce(new Error(""));
    await submit(wrapper);
    await vi.waitFor(() =>
      expect(showErrorDialog).toHaveBeenLastCalledWith("Gagal menambahkan lelang", "Terjadi kesalahan.")
    );
  });
});