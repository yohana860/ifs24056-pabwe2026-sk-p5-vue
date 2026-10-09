import { describe, it, expect, vi } from "vitest";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

import Swal from "sweetalert2";
import {
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
  formatRupiah,
  formatDate,
} from "./toolsHelper";

describe("toolsHelper", () => {
  it("shows success dialog with defaults and custom values", () => {
    showSuccessDialog();
    expect(Swal.fire).toHaveBeenLastCalledWith({ icon: "success", title: "Berhasil", text: "" });
    showSuccessDialog("T", "X");
    expect(Swal.fire).toHaveBeenLastCalledWith({ icon: "success", title: "T", text: "X" });
  });

  it("shows error dialog with defaults and custom values", () => {
    showErrorDialog();
    expect(Swal.fire).toHaveBeenLastCalledWith({ icon: "error", title: "Gagal", text: "" });
    showErrorDialog("T", "X");
    expect(Swal.fire).toHaveBeenLastCalledWith({ icon: "error", title: "T", text: "X" });
  });

  it("returns confirmation result", async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });
    expect(await showConfirmDialog()).toBe(true);
    expect(Swal.fire).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: "Konfirmasi", text: "", showCancelButton: true })
    );
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    expect(await showConfirmDialog("A", "B")).toBe(false);
  });

  it("formats rupiah", () => {
    expect(formatRupiah(1500)).toContain("1.500");
    expect(formatRupiah("abc")).toContain("0");
  });

  it("formats date", () => {
    expect(formatDate("")).toBe("-");
    expect(formatDate("2026-10-09T10:00:00Z")).toMatch(/2026/);
  });
});