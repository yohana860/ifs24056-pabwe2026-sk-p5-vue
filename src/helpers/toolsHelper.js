let swalPromise;

const getSwal = () => {
  if (!swalPromise) {
    swalPromise = import("sweetalert2").then((module) => module.default);
  }
  return swalPromise;
};

export const showSuccessDialog = (title = "Berhasil", text = "") =>
  getSwal().then((Swal) =>
    Swal.fire({ icon: "success", title, text }),
  );

export const showErrorDialog = (title = "Gagal", text = "") =>
  getSwal().then((Swal) =>
    Swal.fire({ icon: "error", title, text }),
  );

export const showConfirmDialog = async (
  title = "Konfirmasi",
  text = "",
) => {
  const Swal = await getSwal();
  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  });
  return result.isConfirmed;
};

export const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "-";
