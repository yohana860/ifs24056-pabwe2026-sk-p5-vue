export const showSuccessDialog = async (title, text = "") => {
  const Swal = (await import("sweetalert2")).default;

  return Swal.fire({
    icon: "success",
    title,
    text,
  });
};

export const showErrorDialog = async (title, text = "") => {
  const Swal = (await import("sweetalert2")).default;

  return Swal.fire({
    icon: "error",
    title,
    text,
  });
};

export const showConfirmDialog = async (title, text = "") => {
  const Swal = (await import("sweetalert2")).default;

  return Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  });
};