<script setup>
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAucationsStore } from "../states/aucationsStore";
import {
  formatRupiah,
  formatDate,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const store = useAucationsStore();

const aucationId = route.params.aucationId;

const highestBid = computed(() => {
  const aucation = store.aucation;

  if (!aucation) return 0;

  if (aucation.highest_bid) {
    return Number(aucation.highest_bid);
  }

  if (aucation.current_bid) {
    return Number(aucation.current_bid);
  }

  if (Array.isArray(aucation.bids) && aucation.bids.length > 0) {
    return Math.max(
      ...aucation.bids.map((item) => Number(item.bid || 0))
    );
  }

  return 0;
});

onMounted(async () => {
  try {
    await store.fetchAucation(aucationId);
  } catch (error) {
    await showErrorDialog(
      "Gagal",
      error.message || "Data lelang gagal dimuat"
    );
  }
});

async function bid() {
  const value = window.prompt(
    "Masukkan nominal bid:"
  );

  if (!value) return;

  const nominal = Number(value);

  if (!Number.isFinite(nominal) || nominal <= 0) {
    await showErrorDialog(
      "Validasi",
      "Nominal bid harus berupa angka yang valid"
    );
    return;
  }

  if (nominal <= highestBid.value) {
    await showErrorDialog(
      "Bid tidak valid",
      "Bid harus lebih tinggi dari penawaran saat ini"
    );
    return;
  }

  try {
    await store.addBid(aucationId, {
      bid: nominal,
    });

    await showSuccessDialog(
      "Berhasil",
      "Bid berhasil diajukan"
    );

    await store.fetchAucation(aucationId);
  } catch (error) {
    await showErrorDialog(
      "Bid gagal",
      error.message || "Bid gagal diajukan"
    );
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b bg-white">
      <div class="mx-auto max-w-6xl p-5">
        <button
          type="button"
          class="font-semibold text-slate-700 hover:text-sky-600"
          @click="router.back()"
        >
          ← Kembali
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-4xl p-6">
      <div
        v-if="store.isLoading"
        class="rounded-3xl bg-white p-10 text-center shadow-sm"
      >
        Memuat data lelang...
      </div>

      <div
        v-else-if="store.aucation"
        class="rounded-3xl bg-white p-6 shadow-sm"
      >
        <!-- Cover -->
        <div
          class="flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-slate-100"
        >
          <img
            v-if="
              store.aucation.cover ||
              store.aucation.cover_url ||
              store.aucation.image
            "
            :src="
              store.aucation.cover ||
              store.aucation.cover_url ||
              store.aucation.image
            "
            alt="Cover lelang"
            class="h-full w-full object-cover"
          />

          <span
            v-else
            class="text-slate-400"
          >
            Tidak ada cover
          </span>
        </div>

        <!-- Info -->
        <h1
          class="mt-6 text-3xl font-extrabold text-slate-900"
        >
          {{ store.aucation.title }}
        </h1>

        <p
          class="mt-4 whitespace-pre-wrap leading-7 text-slate-600"
        >
          {{ store.aucation.description }}
        </p>

        <!-- Statistics -->
        <div class="mt-6 grid gap-4 sm:grid-cols-3">
          <div class="rounded-xl bg-slate-50 p-4">
            <small class="text-slate-500">
              Harga Awal
            </small>

            <b class="mt-1 block text-lg">
              {{ formatRupiah(store.aucation.start_bid) }}
            </b>
          </div>

          <div class="rounded-xl bg-slate-50 p-4">
            <small class="text-slate-500">
              Penawaran Tertinggi
            </small>

            <b class="mt-1 block text-lg text-sky-600">
              {{ formatRupiah(highestBid) }}
            </b>
          </div>

          <div class="rounded-xl bg-slate-50 p-4">
            <small class="text-slate-500">
              Ditutup
            </small>

            <b class="mt-1 block text-lg">
              {{ formatDate(store.aucation.closed_at) }}
            </b>
          </div>
        </div>

        <!-- Bid -->
        <button
          type="button"
          class="mt-6 w-full rounded-xl bg-sky-600 py-3 font-bold text-white transition hover:bg-sky-700"
          @click="bid"
        >
          Ajukan Bid
        </button>
      </div>

      <div
        v-else
        class="rounded-3xl bg-white p-10 text-center shadow-sm"
      >
        Data lelang tidak ditemukan.
      </div>
    </main>
  </div>
</template>