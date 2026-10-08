<script setup>
defineProps({ open: { type: Boolean, default: false } });
defineEmits(["close"]);

const items = [
  { to: "/", label: "Dashboard Lelang", testid: "nav-home" },
  { to: "/users", label: "Daftar Pengguna", testid: "nav-users" },
  { to: "/profile", label: "Profil Saya", testid: "nav-profile" },
];
</script>

<template>
  <aside
    data-testid="sidebar"
    class="fixed inset-y-0 left-0 z-40 w-64 border-r bg-white p-4 pt-20 transition-transform md:static md:z-auto md:translate-x-0 md:pt-4"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <nav class="space-y-1" aria-label="Navigasi utama">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :data-testid="item.testid"
        class="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        active-class="bg-slate-100"
        exact-active-class="bg-slate-900 !text-white hover:bg-slate-900"
        @click="$emit('close')"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
