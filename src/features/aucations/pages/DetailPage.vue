<script setup>
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAucationsStore } from "../states/aucationsStore";
import { formatRupiah, formatDate, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const store = useAucationsStore();

function mediaUrl(url) {
  if (!url) return "";
  return url.replace("http://127.0.0.1:8000", "https://open-api.delcom.org");
}

const highestBid = computed(() => {
  const start = Number(store.aucation?.start_bid || 0);
  const bids = (store.aucation?.bids || []).map((bid) => Number(bid?.bid ?? bid ?? 0));
  return Math.max(start, ...bids);
});

onMounted(async () => {
  try {
    await store.fetchAucation(route.params.aucationId);
  } catch (error) {
    showErrorDialog("Gagal mengambil detail", error.message);
  }
});

async function bid() {
  const value = window.prompt(`Masukkan bid lebih tinggi dari ${formatRupiah(highestBid.value)}:`);
  if (!value) return;

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= highestBid.value) {
    return showErrorDialog("Bid tidak valid", `Bid harus lebih besar dari ${formatRupiah(highestBid.value)}.`);
  }

  try {
    await store.addBid(route.params.aucationId, { bid: amount });
    await store.fetchAucation(route.params.aucationId);
    await showSuccessDialog("Berhasil", "Bid berhasil diajukan.");
  } catch (error) {
    showErrorDialog("Bid gagal", error.message);
  }
}
</script>

<template>
  <div class="bg-slate-50">
    <header class="border-b bg-white p-5">
      <div class="mx-auto max-w-5xl">
        <button @click="router.back()" class="font-semibold">← Kembali</button>
      </div>
    </header>

    <main v-if="store.aucation" class="mx-auto max-w-5xl p-6">
      <article class="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div class="aspect-video bg-slate-100">
          <img v-if="store.aucation.cover" :src="mediaUrl(store.aucation.cover)" :alt="store.aucation.title" class="h-full w-full object-cover" />
          <div v-else class="flex h-full items-center justify-center text-slate-400">No Cover</div>
        </div>

        <div class="p-7">
          <div class="text-sm text-slate-500">Pemilik: {{ store.aucation.author?.name || 'Pengguna Delcom' }}</div>
          <h1 class="mt-2 text-3xl font-extrabold">{{ store.aucation.title }}</h1>
          <p class="mt-5 whitespace-pre-wrap text-slate-600">{{ store.aucation.description }}</p>

          <div class="mt-7 grid gap-4 sm:grid-cols-3">
            <div class="rounded-xl bg-slate-50 p-4">
              <small class="text-slate-500">Harga Awal</small>
              <b class="mt-1 block">{{ formatRupiah(store.aucation.start_bid) }}</b>
            </div>
            <div class="rounded-xl bg-slate-50 p-4">
              <small class="text-slate-500">Penawaran Tertinggi</small>
              <b class="mt-1 block">{{ formatRupiah(highestBid) }}</b>
            </div>
            <div class="rounded-xl bg-slate-50 p-4">
              <small class="text-slate-500">Ditutup</small>
              <b class="mt-1 block">{{ formatDate(store.aucation.closed_at) }}</b>
            </div>
          </div>

          <button @click="bid" class="mt-6 w-full rounded-xl bg-sky-600 py-3 font-bold text-white">
            Ajukan Bid
          </button>

          <section class="mt-8">
            <h2 class="text-xl font-bold">Riwayat Penawaran</h2>
            <div v-if="store.aucation.bids?.length" class="mt-4 space-y-3">
              <div v-for="(item, index) in store.aucation.bids" :key="item.id || index" class="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div>
                  <p class="font-semibold">Penawaran #{{ index + 1 }}</p>
                  <p class="text-xs text-slate-500">{{ formatDate(item.created_at) }}</p>
                </div>
                <strong>{{ formatRupiah(item.bid) }}</strong>
              </div>
            </div>
            <p v-else class="mt-4 text-slate-500">Belum ada penawaran.</p>
          </section>
        </div>
      </article>
    </main>

    <div v-else-if="store.loading" class="p-20 text-center text-slate-500">Memuat detail lelang...</div>
    <div v-else class="p-20 text-center text-slate-500">Data lelang tidak ditemukan.</div>
  </div>
</template>
