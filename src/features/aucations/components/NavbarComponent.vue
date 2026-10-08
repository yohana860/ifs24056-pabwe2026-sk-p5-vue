<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../auth/states/authStore";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

defineEmits(["toggle-sidebar"]);

const router = useRouter();
const auth = useAuthStore();
const displayName = computed(() => auth.user?.name || auth.user?.email || "Pengguna");

async function logout() {
  if (!(await showConfirmDialog("Keluar", "Yakin ingin keluar dari akun?"))) return;
  await auth.logout();
  await router.replace("/auth/login");
}
</script>

<template>
  <header class="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-5 py-3" data-testid="navbar">
    <div class="flex items-center gap-3">
      <button type="button" class="rounded-lg border px-3 py-1 md:hidden" aria-label="Buka menu" @click="$emit('toggle-sidebar')">☰</button>
      <RouterLink to="/" class="font-extrabold">Delcom Auction</RouterLink>
    </div>
    <div class="flex items-center gap-3">
      <span class="hidden text-sm text-slate-600 sm:inline" data-testid="navbar-user">{{ displayName }}</span>
      <button type="button" id="logout-button" data-testid="logout-button" class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" @click="logout">
        Keluar
      </button>
    </div>
  </header>
</template>
