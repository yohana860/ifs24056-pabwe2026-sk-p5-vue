<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../states/authStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const auth = useAuthStore();
const form = reactive({ name: "", email: "", password: "" });

async function submit() {
  if (!form.name || !form.email || !form.password) {
    return showErrorDialog("Validasi", "Nama, email, dan password wajib diisi");
  }
  try {
    await auth.register(form);
    await showSuccessDialog("Berhasil", "Akun berhasil dibuat. Silakan masuk.");
    await router.replace("/auth/login");
  } catch (error) {
    showErrorDialog("Registrasi gagal", error.message);
  }
}
</script>

<template>
  <div data-testid="register-page">
    <h1 class="text-3xl font-bold">Daftar</h1>
    <p class="mt-2 text-slate-500">Buat akun Delcom Auction.</p>

    <form class="mt-8 space-y-4" data-testid="register-form" @submit.prevent="submit">
      <div>
        <label for="register-name-input" class="mb-1 block text-sm font-semibold">Nama</label>
        <input id="register-name-input" data-testid="register-name-input" v-model="form.name" name="name"
          autocomplete="name" class="w-full rounded-xl border p-3" placeholder="Nama" required />
      </div>
      <div>
        <label for="register-email-input" class="mb-1 block text-sm font-semibold">Email</label>
        <input id="register-email-input" data-testid="register-email-input" v-model="form.email" name="email" type="email"
          autocomplete="email" class="w-full rounded-xl border p-3" placeholder="Email" required />
      </div>
      <div>
        <label for="register-password-input" class="mb-1 block text-sm font-semibold">Password</label>
        <input id="register-password-input" data-testid="register-password-input" v-model="form.password" name="password"
          type="password" autocomplete="new-password" class="w-full rounded-xl border p-3" placeholder="Password" required />
      </div>
      <button id="register-submit-button" data-testid="register-submit-button" type="submit"
        class="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white disabled:opacity-50" :disabled="auth.isAuthRegister">
        {{ auth.isAuthRegister ? "Memproses..." : "Daftar" }}
      </button>
    </form>

    <p class="mt-6 text-sm">
      Sudah punya akun?
      <RouterLink class="font-semibold underline" to="/auth/login" data-testid="go-login-link">Masuk</RouterLink>
    </p>
  </div>
</template>
