<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAucationsStore } from "../states/aucationsStore";
import { useAuthStore } from "../../auth/states/authStore";
import { formatRupiah, formatDate, showErrorDialog } from "../../../helpers/toolsHelper";

const store = useAucationsStore();
const auth = useAuthStore();
const router = useRouter();
const search = ref("");
const activeFilter = ref("all");

function mediaUrl(url) {
  if (!url) return "";
  return url.replace("http://127.0.0.1:8000", "https://open-api.delcom.org");
}

function isClosed(item) {
  return item.closed_at ? new Date(item.closed_at).getTime() <= Date.now() : false;
}

const filteredItems = computed(() => {
  const keyword = search.value.trim().toLowerCase();

  return store.aucations.filter((item) => {
    const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
    const matchesSearch = !keyword || text.includes(keyword);
    const closed = isClosed(item);
    const matchesFilter =
      activeFilter.value === "all" ||
      (activeFilter.value === "mine" && item.user_id === auth.user?.id) ||
      (activeFilter.value === "open" && !closed) ||
      (activeFilter.value === "closed" && closed);

    return matchesSearch && matchesFilter;
  });
});

onMounted(async () => {
  try {
    await store.fetchAucations();
  } catch (error) {
    showErrorDialog("Gagal mengambil lelang", error.message);
  }
});

function logout() {
  auth.logout();
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="sticky top-0 z-10 border-b bg-white/95 px-5 py-4 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div>
          <div class="text-xl font-extrabold">Delcom Auction</div>
          <div class="text-xs text-slate-500">Lelang terhubung API Delcom</div>
        </div>
        <nav class="flex items-center gap-2">
          <RouterLink to="/users" class="rounded-lg px-3 py-2 text-sm hover:bg-slate-100">Pengguna</RouterLink>
          <RouterLink to="/profile" class="rounded-lg px-3 py-2 text-sm hover:bg-slate-100">Profil</RouterLink>
          <button @click="logout" class="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">Logout</button>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-6xl p-6">
      <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 class="text-3xl font-extrabold">Daftar Lelang</h1>
            <p class="mt-2 text-slate-500">Data lelang diambil langsung dari pengguna Delcom Auction.</p>
          </div>
          <input v-model="search" class="w-full rounded-xl border px-4 py-3 md:w-80" placeholder="Cari judul atau deskripsi..." />
        </div>

        <div class="mt-6 flex flex-wrap gap-2">
          <button v-for="tab in [
            { key: 'all', label: 'Semua Lelang' },
            { key: 'mine', label: 'Lelang Saya' },
            { key: 'open', label: 'Berlangsung' },
            { key: 'closed', label: 'Ditutup' }
          ]" :key="tab.key" @click="activeFilter = tab.key"
            class="rounded-full px-4 py-2 text-sm font-medium"
            :class="activeFilter === tab.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'">
            {{ tab.label }}
          </button>
        </div>
      </section>

      <div v-if="store.loading" class="py-20 text-center text-slate-500">Memuat data lelang...</div>

      <section v-else-if="filteredItems.length" class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="item in filteredItems" :key="item.id" class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div class="aspect-video bg-slate-100">
            <img v-if="item.cover" :src="mediaUrl(item.cover)" :alt="item.title" class="h-full w-full object-cover" />
            <div v-else class="flex h-full items-center justify-center text-slate-400">No Cover</div>
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2 text-xs text-slate-500">
              <span>{{ item.author?.name || 'Pengguna Delcom' }}</span>
              <span>•</span>
              <span>{{ isClosed(item) ? 'Ditutup' : 'Berlangsung' }}</span>
            </div>
            <h2 class="mt-2 text-lg font-bold">{{ item.title }}</h2>
            <p class="mt-2 line-clamp-2 text-sm text-slate-500">{{ item.description }}</p>
            <div class="mt-4 flex justify-between gap-3 text-sm">
              <div>
                <span class="block text-xs text-slate-500">Harga awal</span>
                <strong>{{ formatRupiah(item.start_bid) }}</strong>
              </div>
              <div class="text-right">
                <span class="block text-xs text-slate-500">Tawaran</span>
                <strong>{{ formatRupiah(Math.max(item.start_bid || 0, ...(item.bids || []).map(b => Number(b.bid || b)))) }}</strong>
              </div>
            </div>
            <div class="mt-2 text-xs text-slate-500">Tutup: {{ formatDate(item.closed_at) }}</div>
            <button @click="router.push('/aucations/' + item.id)" class="mt-5 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white">
              Lihat Detail
            </button>
          </div>
        </article>
      </section>

      <div v-else class="mt-6 rounded-2xl bg-white p-12 text-center text-slate-500">
        Tidak ada lelang yang cocok dengan filter atau pencarian.
      </div>
    </main>
  </div>
</template>
