<script setup>
import { onMounted } from "vue";
import { useUsersStore } from "../states/usersStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const store = useUsersStore();

onMounted(async () => {
  try {
    await store.fetchProfile();
  } catch (error) {
    showErrorDialog("Gagal mengambil profil", error.message);
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="flex items-center justify-between border-b bg-white p-5">
      <RouterLink to="/" class="font-bold">← Delcom Auction</RouterLink>
      <RouterLink to="/users" class="text-sm font-medium">Semua Pengguna</RouterLink>
    </header>

    <main class="mx-auto max-w-2xl p-6">
      <div class="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 class="text-3xl font-bold">Profil Saya</h1>
        <p class="mt-2 text-slate-500">Data akun yang diambil langsung dari API Delcom.</p>

        <div v-if="store.profileLoading" class="mt-8 text-slate-500">Memuat profil...</div>

        <div v-else-if="store.profile" class="mt-8 space-y-5">
          <div>
            <p class="text-sm text-slate-500">Nama</p>
            <p class="mt-1 text-lg font-semibold">{{ store.profile.name || "-" }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500">Email</p>
            <p class="mt-1 text-lg font-semibold">{{ store.profile.email || "-" }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500">Deskripsi</p>
            <p class="mt-1 text-slate-700">{{ store.profile.description || "Belum ada deskripsi." }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-500">ID Pengguna</p>
            <p class="mt-1 font-medium">{{ store.profile.id || "-" }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
