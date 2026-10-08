<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAucationsStore } from "../states/aucationsStore";
import { useAuthStore } from "../../auth/states/authStore";
import {
  formatRupiah,
  formatDate,
} from "../../../helpers/toolsHelper";

const router = useRouter();
const store = useAucationsStore();
const auth = useAuthStore();

const search = ref("");

onMounted(async () => {
  try {
    await store.fetchAucations();
  } catch (error) {
    console.error("Gagal mengambil data lelang:", error);
  }
});

const filteredAucations = computed(() => {
  const keyword = search.value.trim().toLowerCase();

  if (!keyword) {
    return store.aucations;
  }

  return store.aucations.filter((item) => {
    const title = item.title || "";
    const description = item.description || "";

    return (
      title.toLowerCase().includes(keyword) ||
      description.toLowerCase().includes(keyword)
    );
  });
});

function getHighestBid(aucation) {
  if (
    Array.isArray(aucation.bids) &&
    aucation.bids.length > 0
  ) {
    return Math.max(
      ...aucation.bids.map((bid) =>
        Number(bid.bid || 0)
      )
    );
  }

  return Number(aucation.start_bid || 0);
}

function logout() {
  auth.logout();
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Navbar -->
    <header
      class="sticky top-0 z-20 border-b bg-white/95 backdrop-blur"
    >
      <div
        class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <RouterLink to="/">
          <div class="text-xl font-extrabold text-slate-900">
            Delcom Auction
          </div>

          <div class="text-xs text-slate-500">
            Platform Lelang
          </div>
        </RouterLink>

        <nav class="flex items-center gap-2">
          <RouterLink
            to="/"
            class="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium"
          >
            Lelang
          </RouterLink>

          <RouterLink
            to="/users"
            class="rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
          >
            Pengguna
          </RouterLink>

          <RouterLink
            to="/profile"
            class="rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
          >
            Profil
          </RouterLink>

          <button
            type="button"
            class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            @click="logout"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>

    <!-- Content -->
    <main class="mx-auto max-w-6xl px-6 py-8">
      <div
        class="flex flex-col justify-between gap-5 md:flex-row md:items-end"
      >
        <div>
          <p
            class="text-sm font-semibold text-sky-600"
          >
            DASHBOARD
          </p>

          <h1
            class="mt-1 text-3xl font-extrabold text-slate-900"
          >
            Daftar Lelang
          </h1>

          <p class="mt-2 text-slate-500">
            Temukan barang menarik dan ikut memberikan
            penawaran.
          </p>
        </div>

        <input
          v-model="search"
          type="search"
          placeholder="Cari lelang..."
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-sky-500 md:w-80"
        />
      </div>

      <!-- Loading -->
      <div
        v-if="store.loading"
        class="py-20 text-center text-slate-500"
      >
        Memuat data lelang...
      </div>

      <!-- Cards -->
      <div
        v-else-if="filteredAucations.length"
        class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="aucation in filteredAucations"
          :key="aucation.id"
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <!-- Cover -->
          <div
            class="aspect-video overflow-hidden bg-slate-100"
          >
            <img
              v-if="aucation.cover"
              :src="aucation.cover"
              :alt="aucation.title"
              class="h-full w-full object-cover"
            />

            <div
              v-else
              class="flex h-full items-center justify-center text-slate-400"
            >
              Tidak ada gambar
            </div>
          </div>

          <div class="p-5">
            <h2
              class="line-clamp-1 text-lg font-bold text-slate-900"
            >
              {{ aucation.title }}
            </h2>

            <p
              class="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500"
            >
              {{ aucation.description }}
            </p>

            <div class="mt-5 grid grid-cols-2 gap-3">
              <div class="rounded-xl bg-slate-50 p-3">
                <p class="text-xs text-slate-500">
                  Harga Awal
                </p>

                <p class="mt-1 font-bold">
                  {{ formatRupiah(aucation.start_bid) }}
                </p>
              </div>

              <div class="rounded-xl bg-sky-50 p-3">
                <p class="text-xs text-slate-500">
                  Bid Tertinggi
                </p>

                <p class="mt-1 font-bold text-sky-700">
                  {{
                    formatRupiah(
                      getHighestBid(aucation)
                    )
                  }}
                </p>
              </div>
            </div>

            <div
              class="mt-4 text-xs text-slate-500"
            >
              Ditutup:
              {{ formatDate(aucation.closed_at) }}
            </div>

            <button
              type="button"
              class="mt-5 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              @click="
                router.push(
                  `/aucations/${aucation.id}`
                )
              "
            >
              Lihat Detail
            </button>
          </div>
        </article>
      </div>

      <!-- Empty -->
      <div
        v-else
        class="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center"
      >
        <h2 class="text-xl font-bold">
          Belum ada lelang
        </h2>

        <p class="mt-2 text-slate-500">
          Data lelang belum tersedia atau tidak
          ditemukan.
        </p>
      </div>
    </main>
  </div>
</template>