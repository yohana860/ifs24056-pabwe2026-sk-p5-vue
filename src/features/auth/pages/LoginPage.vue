<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../states/authStore";
import AuthLayout from "../layouts/AuthLayout.vue";
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
    router.push("/");
  } catch (error) {
    showErrorDialog("Login gagal", error.message);
  }
}
</script>

<template>
  <AuthLayout>
    <h1 class="text-3xl font-bold">Masuk</h1>
    <p class="mt-2 text-slate-500">Masuk ke akun Delcom Auction.</p>

    <form class="mt-8 space-y-4" @submit.prevent="submit">
      <input
        v-model="form.email"
        type="email"
        autocomplete="email"
        class="w-full rounded-xl border p-3"
        placeholder="Email"
      />
      <input
        v-model="form.password"
        type="password"
        autocomplete="current-password"
        class="w-full rounded-xl border p-3"
        placeholder="Password"
      />
      <button
        class="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white disabled:opacity-50"
        :disabled="auth.isAuthLogin"
      >
        {{ auth.isAuthLogin ? "Memproses..." : "Masuk" }}
      </button>
    </form>

    <p class="mt-6 text-sm">
      Belum punya akun?
      <RouterLink class="font-semibold underline" to="/auth/register">Daftar</RouterLink>
    </p>
  </AuthLayout>
</template>
