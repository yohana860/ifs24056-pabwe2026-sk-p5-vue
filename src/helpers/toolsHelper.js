import Swal from "sweetalert2";
export const showSuccessDialog=(title="Berhasil",text="")=>Swal.fire({icon:"success",title,text});
export const showErrorDialog=(title="Gagal",text="")=>Swal.fire({icon:"error",title,text});
export const showConfirmDialog=async(title="Konfirmasi",text="")=>{const r=await Swal.fire({icon:"warning",title,text,showCancelButton:true,confirmButtonText:"Ya",cancelButtonText:"Batal"});return r.isConfirmed};
export const formatRupiah=(value)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(value)||0);
export const formatDate=(value)=>value?new Intl.DateTimeFormat("id-ID",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value)):"-";