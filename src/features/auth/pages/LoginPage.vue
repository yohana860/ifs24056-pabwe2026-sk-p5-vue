<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../states/authStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const auth = useAuthStore();
const form = reactive({ email: "", password: "" });

async function submit() {
  if (!form.email || !form.password) {
    return showErrorDialog("Validasi", "Email dan password wajib diisi");
  }
  try {
    await auth.login(form);
    await router.replace("/");
  } catch (error) {
    showErrorDialog("Login gagal", error.message || "Terjadi kesalahan saat login");
  }
}
</script>

<template>
  <div data-testid="login-page">
    <h1 class="text-3xl font-bold">Masuk</h1>
    <p class="mt-2 text-slate-500">Masuk ke akun Delcom Auction.</p>

    <form class="mt-8 space-y-4" data-testid="login-form" @submit.prevent="submit">
      <div>
        <label for="login-email-input" data-testid="login-email-label" class="mb-1 block text-sm font-semibold">Email</label>
        <input id="login-email-input" data-testid="login-email-input" v-model="form.email" name="email" type="email"
          autocomplete="email" class="w-full rounded-xl border p-3" placeholder="Email" />
      </div>
      <div>
        <label for="login-password-input" data-testid="login-password-label" class="mb-1 block text-sm font-semibold">Password</label>
        <input id="login-password-input" data-testid="login-password-input" v-model="form.password" name="password"
          type="password" autocomplete="current-password" class="w-full rounded-xl border p-3" placeholder="Password" />
      </div>
      <button id="login-submit-button" data-testid="login-submit-button" type="submit"
        class="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white disabled:opacity-50" :disabled="auth.isAuthLogin">
        {{ auth.isAuthLogin ? "Memproses..." : "Masuk" }}
      </button>
    </form>

    <p class="mt-6 text-sm">
      Belum punya akun?
      <RouterLink class="font-semibold underline" to="/auth/register" data-testid="go-register-link">Daftar</RouterLink>
    </p>
  </div>
</template>
