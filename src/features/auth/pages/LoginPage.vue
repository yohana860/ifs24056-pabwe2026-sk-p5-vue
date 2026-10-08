<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../states/authStore";
import AuthLayout from "../layouts/AuthLayout.vue";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const auth = useAuthStore();

const form = reactive({
  email: "",
  password: "",
});

async function submit() {
  if (!form.email || !form.password) {
    await showErrorDialog(
      "Validasi",
      "Email dan password wajib diisi"
    );
    return;
  }

  try {
    await auth.login({
      email: form.email,
      password: form.password,
    });

    router.push("/");
  } catch (error) {
    await showErrorDialog(
      "Login gagal",
      error.message || "Terjadi kesalahan saat login"
    );
  }
}
</script>

<template>
  <AuthLayout>
    <div>
      <h1 class="text-3xl font-bold text-slate-900">
        Masuk
      </h1>

      <p class="mt-2 text-slate-500">
        Masuk ke akun Delcom Auction.
      </p>

      <form
        class="mt-8 space-y-4"
        @submit.prevent="submit"
      >
        <div>
          <label class="mb-2 block text-sm font-medium">
            Email
          </label>

          <input
            v-model="form.email"
            type="email"
            class="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-sky-500"
            placeholder="nama@email.com"
            autocomplete="email"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium">
            Password
          </label>

          <input
            v-model="form.password"
            type="password"
            class="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-sky-500"
            placeholder="Password"
            autocomplete="current-password"
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white disabled:opacity-50"
          :disabled="auth.isAuthLogin"
        >
          {{ auth.isAuthLogin ? "Memproses..." : "Masuk" }}
        </button>
      </form>

      <p class="mt-6 text-sm text-slate-600">
        Belum punya akun?

        <RouterLink
          class="font-semibold text-sky-600 underline"
          to="/auth/register"
        >
          Daftar
        </RouterLink>
      </p>
    </div>
  </AuthLayout>
</template>