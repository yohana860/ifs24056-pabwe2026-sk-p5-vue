<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import AuthLayout from "../layouts/AuthLayout.vue";
import { register } from "../api/authApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const router = useRouter();

const form = reactive({
  name: "",
  email: "",
  password: "",
});

async function submit() {
  if (!form.name || !form.email || !form.password) {
    await showErrorDialog(
      "Validasi",
      "Nama, email, dan password wajib diisi"
    );
    return;
  }

  try {
    await register({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    await showSuccessDialog(
      "Berhasil",
      "Akun berhasil dibuat. Silakan login."
    );

    router.push("/auth/login");
  } catch (error) {
    await showErrorDialog(
      "Registrasi gagal",
      error.message || "Terjadi kesalahan saat registrasi"
    );
  }
}
</script>

<template>
  <AuthLayout>
    <div>
      <h1 class="text-3xl font-bold text-slate-900">
        Daftar
      </h1>

      <p class="mt-2 text-slate-500">
        Buat akun untuk menggunakan Delcom Auction.
      </p>

      <form
        class="mt-8 space-y-4"
        @submit.prevent="submit"
      >
        <!-- Nama -->
        <div>
          <label class="mb-2 block text-sm font-medium">
            Nama
          </label>

          <input
            v-model="form.name"
            type="text"
            class="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-sky-500"
            placeholder="Nama lengkap"
            autocomplete="name"
          />
        </div>

        <!-- Email -->
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

        <!-- Password -->
        <div>
          <label class="mb-2 block text-sm font-medium">
            Password
          </label>

          <input
            v-model="form.password"
            type="password"
            class="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-sky-500"
            placeholder="Password"
            autocomplete="new-password"
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white transition hover:bg-slate-800"
        >
          Daftar
        </button>
      </form>

      <p class="mt-6 text-sm text-slate-600">
        Sudah punya akun?

        <RouterLink
          class="font-semibold text-sky-600 underline"
          to="/auth/login"
        >
          Masuk
        </RouterLink>
      </p>
    </div>
  </AuthLayout>
</template>