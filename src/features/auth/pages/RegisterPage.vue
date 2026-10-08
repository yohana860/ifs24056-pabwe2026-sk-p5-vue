<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { register } from "../api/authApi";
import AuthLayout from "../layouts/AuthLayout.vue";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const form = reactive({ name: "", email: "", password: "" });

async function submit() {
  if (!form.name || !form.email || !form.password) {
    return showErrorDialog("Validasi", "Nama, email, dan password wajib diisi");
  }

  try {
    await register(form);
    await showSuccessDialog("Berhasil", "Akun berhasil dibuat. Silakan masuk.");
    router.push("/auth/login");
  } catch (error) {
    showErrorDialog("Registrasi gagal", error.message);
  }
}
</script>

<template>
  <AuthLayout>
    <h1 class="text-3xl font-bold">Daftar</h1>
    <p class="mt-2 text-slate-500">Buat akun Delcom Auction.</p>

    <form class="mt-8 space-y-4" @submit.prevent="submit">
      <input v-model="form.name" class="w-full rounded-xl border p-3" placeholder="Nama" />
      <input v-model="form.email" type="email" autocomplete="email" class="w-full rounded-xl border p-3" placeholder="Email" />
      <input v-model="form.password" type="password" autocomplete="new-password" class="w-full rounded-xl border p-3" placeholder="Password" />
      <button class="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white">Daftar</button>
    </form>

    <p class="mt-6 text-sm">
      Sudah punya akun?
      <RouterLink class="font-semibold underline" to="/auth/login">Masuk</RouterLink>
    </p>
  </AuthLayout>
</template>
