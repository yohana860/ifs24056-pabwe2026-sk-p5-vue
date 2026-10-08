<script setup>
import { onMounted } from "vue";
import { useUsersStore } from "../states/usersStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const store = useUsersStore();

onMounted(async () => {
  try {
    await store.fetchUsers();
  } catch (error) {
    showErrorDialog("Gagal mengambil pengguna", error.message);
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="flex items-center justify-between border-b bg-white p-5">
      <RouterLink to="/" class="font-bold">Delcom Auction</RouterLink>
      <RouterLink to="/profile" class="text-sm font-medium">Profil Saya</RouterLink>
    </header>

    <main class="mx-auto max-w-6xl p-6">
      <h1 class="text-3xl font-bold">Pengguna</h1>
      <p class="mt-2 text-slate-500">Daftar pengguna yang terdaftar pada Delcom Auction.</p>

      <div v-if="store.loading" class="mt-8 rounded-2xl bg-white p-8 text-center text-slate-500">
        Memuat data pengguna...
      </div>

      <div v-else-if="store.users.length" class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="user in store.users"
          :key="user.id"
          class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <div class="flex items-center gap-4">
            <img
              v-if="user.photo"
              :src="user.photo"
              :alt="user.name || 'Pengguna'"
              class="h-14 w-14 rounded-full object-cover"
            />
            <div v-else class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl font-bold">
              {{ (user.name || "?").charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <h2 class="truncate font-bold">{{ user.name || "Tanpa nama" }}</h2>
              <p class="truncate text-sm text-slate-500">{{ user.email || "Email tidak tersedia" }}</p>
            </div>
          </div>
          <p class="mt-4 text-sm text-slate-500">ID pengguna: {{ user.id }}</p>
        </article>
      </div>

      <div v-else class="mt-8 rounded-2xl bg-white p-8 text-center text-slate-500">
        Belum ada data pengguna.
      </div>
    </main>
  </div>
</template>
