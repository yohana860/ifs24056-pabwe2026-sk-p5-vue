<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const store = useAucationsStore();

const search = ref("");
const filter = ref("all");
const showAddModal = ref(false);
const submitting = ref(false);

const form = reactive({
  title: "",
  description: "",
  start_bid: "",
  closed_at: "",
  cover: null,
});

function mediaUrl(url) {
  return url
    .replace("http://127.0.0.1:8000", "https://open-api.delcom.org")
    .replace("http://localhost:8000", "https://open-api.delcom.org");
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function highestBid(aucation) {
  const bids = (aucation.bids || []).map((item) => Number(item.bid || 0));

  return Math.max(Number(aucation.start_bid || 0), ...bids);
}

function isClosed(aucation) {
  if (!aucation.closed_at) return false;

  return new Date(aucation.closed_at).getTime() <= Date.now();
}

const filteredAucations = computed(() => {
  let result = [...store.aucations];

  if (filter.value === "open") {
    result = result.filter((item) => !isClosed(item));
  }

  if (filter.value === "closed") {
    result = result.filter((item) => isClosed(item));
  }

  const keyword = search.value.trim().toLowerCase();

  if (keyword) {
    result = result.filter(
      (item) =>
        String(item.title || "").toLowerCase().includes(keyword) ||
        String(item.description || "").toLowerCase().includes(keyword)
    );
  }

  return result;
});

async function loadAucations() {
  try {
    await store.fetchAucations(filter.value === "mine" ? { is_me: 1 } : {});
  } catch (error) {
    console.error(error);
  }
}

async function setFilter(value) {
  filter.value = value;
  await loadAucations();
}

function openDetail(id) {
  router.push(`/aucations/${id}`);
}

function toApiDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function openAddModal() {
  form.title = "";
  form.description = "";
  form.start_bid = "";
  form.closed_at = "";
  form.cover = null;

  showAddModal.value = true;
}

function closeAddModal() {
  if (!submitting.value) {
    showAddModal.value = false;
  }
}

function handleCover(event) {
  form.cover = event.target.files?.[0] || null;
}

async function submitAucation() {
  if (!form.title.trim()) {
    return showErrorDialog("Validasi", "Judul lelang wajib diisi.");
  }

  if (!form.description.trim()) {
    return showErrorDialog("Validasi", "Deskripsi lelang wajib diisi.");
  }

  if (!(Number(form.start_bid) > 0)) {
    return showErrorDialog("Validasi", "Harga awal harus lebih dari 0.");
  }

  if (!form.closed_at) {
    return showErrorDialog("Validasi", "Batas waktu lelang wajib diisi.");
  }

  if (!form.cover) {
    return showErrorDialog("Validasi", "Cover barang wajib dipilih.");
  }

  const closedDate = new Date(form.closed_at);

  if (closedDate.getTime() <= Date.now()) {
    return showErrorDialog("Validasi", "Batas waktu harus lebih dari waktu sekarang.");
  }

  submitting.value = true;

  try {
    await store.addAucation({
      title: form.title,
      description: form.description,
      start_bid: Number(form.start_bid),
      closed_at: toApiDate(closedDate),
      cover: form.cover,
    });

    showAddModal.value = false;

    await loadAucations();

    await showSuccessDialog("Berhasil", "Lelang berhasil ditambahkan.");
  } catch (error) {
    showErrorDialog("Gagal menambahkan lelang", error.message || "Terjadi kesalahan.");
  } finally {
    submitting.value = false;
  }
}

onMounted(loadAucations);
</script>

<template>
  <div class="bg-slate-50">
    <!-- Header -->
    <section class="border-b bg-white" aria-labelledby="auction-page-title">
      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"
      >
        <div>
          <h1 id="auction-page-title" class="text-2xl font-bold text-slate-900">
            Delcom Auction
          </h1>

          <p class="text-sm text-slate-500">
            Daftar barang yang sedang dilelang
          </p>
        </div>

        <div class="flex gap-3">

          <button
            type="button"
            class="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white"
            @click="openAddModal"
          >
            + Tambah Lelang
          </button>
        </div>
      </div>
    </section>

    <!-- Content -->
    <main class="mx-auto max-w-7xl px-6 py-8">
      <!-- Search -->
      <div class="mb-6">
        <label for="auction-search" class="sr-only">Cari lelang berdasarkan judul atau deskripsi</label>
        <input
          id="auction-search"
          v-model="search"
          type="search"
          name="search"
          autocomplete="off"
          aria-label="Cari lelang berdasarkan judul atau deskripsi"
          placeholder="Cari judul atau deskripsi lelang..."
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
        />
      </div>

      <!-- Filter -->
      <div class="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-xl px-4 py-2 font-semibold"
          :class="
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border'
          "
          @click="filter = 'all'"
        >
          Semua Lelang
        </button>


<button
  type="button"
  class="rounded-xl px-4 py-2 font-semibold"
  :class="filter === 'mine' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border'"
  @click="setFilter('mine')"
>
  Lelang Saya
</button>


        <button
          type="button"
          class="rounded-xl px-4 py-2 font-semibold"
          :class="
            filter === 'open'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border'
          "
          @click="filter = 'open'"
        >
          Berlangsung
        </button>

        <button
          type="button"
          class="rounded-xl px-4 py-2 font-semibold"
          :class="
            filter === 'closed'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border'
          "
          @click="filter = 'closed'"
        >
          Ditutup
        </button>
      </div>

      <!-- Loading -->
      <div
        v-if="store.loading"
        class="py-20 text-center text-slate-500"
      >
        Memuat data lelang...
      </div>

      <!-- Empty -->
      <div
        v-else-if="!filteredAucations.length"
        class="rounded-2xl border border-dashed bg-white p-12 text-center"
      >
        <h2 class="text-xl font-bold text-slate-800">
          Belum ada lelang
        </h2>

        <p class="mt-2 text-slate-500">
          Silakan tambahkan barang yang ingin kamu lelang.
        </p>

        <button
          type="button"
          class="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
          @click="openAddModal"
        >
          + Tambah Lelang
        </button>
      </div>

      <!-- Auction Cards -->
      <div
        v-else
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="aucation in filteredAucations"
          :key="aucation.id"
          class="overflow-hidden rounded-2xl border bg-white shadow-sm"
        >
          <div class="aspect-video bg-slate-100">
            <img
              v-if="aucation.cover"
              :src="mediaUrl(aucation.cover)"
              :alt="`Foto ${aucation.title}`"
              width="640"
              height="360"
              :loading="filteredAucations.indexOf(aucation) === 0 ? 'eager' : 'lazy'"
              :fetchpriority="filteredAucations.indexOf(aucation) === 0 ? 'high' : 'auto'"
              decoding="async"
              class="h-full w-full object-cover"
            />

            <div
              v-else
              class="flex h-full items-center justify-center text-slate-600"
            >
              Tidak ada gambar
            </div>
          </div>

          <div class="p-5">
            <div class="mb-2 flex items-start justify-between gap-3">
              <h2 class="text-lg font-bold text-slate-900">
                {{ aucation.title }}
              </h2>

              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="
                  isClosed(aucation)
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                "
              >
                {{ isClosed(aucation) ? "Ditutup" : "Berlangsung" }}
              </span>
            </div>

            <p class="line-clamp-2 text-sm text-slate-500">
              {{ aucation.description }}
            </p>

            <div class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500">
                  Pemilik
                </span>

                <span class="font-semibold">
                  {{ aucation.author?.name || "Tidak diketahui" }}
                </span>
              </div>

              <div class="flex justify-between">
                <span class="text-slate-500">
                  Harga awal
                </span>

                <span class="font-semibold">
                  {{ formatRupiah(aucation.start_bid) }}
                </span>
              </div>

              <div class="flex justify-between">
                <span class="text-slate-500">
                  Tawaran tertinggi
                </span>

                <span class="font-bold text-slate-900">
                  {{ formatRupiah(highestBid(aucation)) }}
                </span>
              </div>

              <div class="flex justify-between">
                <span class="text-slate-500">
                  Ditutup
                </span>

                <span>
                  {{ formatDate(aucation.closed_at) }}
                </span>
              </div>
            </div>

            <button
              type="button"
              class="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white"
              @click="openDetail(aucation.id)"
            >
              Lihat Detail
            </button>
          </div>
        </article>
      </div>
    </main>

    <!-- Modal Tambah Lelang -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      @click.self="closeAddModal"
    >
      <div
        class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-auction-title"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 id="add-auction-title" class="text-2xl font-bold">
              Tambah Lelang
            </h2>

            <p class="mt-1 text-sm text-slate-500">
              Masukkan barang yang ingin kamu lelang.
            </p>
          </div>

          <button
            type="button"
            class="text-2xl text-slate-600"
            aria-label="Tutup dialog tambah lelang"
            :disabled="submitting"
            @click="closeAddModal"
          >
            ×
          </button>
        </div>

        <form
          class="mt-6 space-y-4"
          @submit.prevent="submitAucation"
        >
          <div>
            <label for="auction-title" class="mb-1 block text-sm font-semibold">
              Judul
            </label>

            <input
              id="auction-title"
              v-model="form.title"
              type="text"
              name="title"
              autocomplete="off"
              placeholder="Contoh: Laptop Gaming ASUS"
              class="w-full rounded-xl border border-slate-300 p-3"
            />
          </div>

          <div>
            <label for="auction-description" class="mb-1 block text-sm font-semibold">
              Deskripsi
            </label>

            <textarea
              id="auction-description"
              v-model="form.description"
              name="description"
              rows="4"
              placeholder="Jelaskan kondisi dan detail barang..."
              class="w-full rounded-xl border border-slate-300 p-3"
            ></textarea>
          </div>

          <div>
            <label for="auction-start-bid" class="mb-1 block text-sm font-semibold">
              Harga Awal
            </label>

            <input
              id="auction-start-bid"
              v-model="form.start_bid"
              type="number"
              name="start_bid"
              min="1"
              placeholder="1000000"
              class="w-full rounded-xl border border-slate-300 p-3"
            />
          </div>

          <div>
            <label for="auction-closed-at" class="mb-1 block text-sm font-semibold">
              Batas Waktu
            </label>

            <input
              id="auction-closed-at"
              v-model="form.closed_at"
              type="datetime-local"
              name="closed_at"
              class="w-full rounded-xl border border-slate-300 p-3"
            />
          </div>

          <div>
            <label for="auction-cover" class="mb-1 block text-sm font-semibold">
              Cover Barang
            </label>

            <input
              id="auction-cover"
              type="file"
              name="cover"
              accept="image/*"
              class="w-full rounded-xl border border-slate-300 p-3"
              @change="handleCover"
            />

            <p class="mt-1 text-xs text-slate-500">
              Pilih gambar barang yang akan dilelang.
            </p>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              class="rounded-xl border px-5 py-3 font-semibold"
              :disabled="submitting"
              @click="closeAddModal"
            >
              Batal
            </button>

            <button
              type="submit"
              class="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-50"
              :disabled="submitting"
            >
              {{
                submitting
                  ? "Menyimpan..."
                  : "Tambah Lelang"
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>