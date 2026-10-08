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
  if (!url) return "";

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
  const bids = Array.isArray(aucation?.bids)
    ? aucation.bids
    : [];

  if (!bids.length) {
    return Number(aucation?.start_bid || 0);
  }

  return Math.max(
    Number(aucation?.start_bid || 0),
    ...bids.map((bid) => Number(bid?.bid || bid?.amount || 0))
  );
}

function isClosed(aucation) {
  if (!aucation?.closed_at) return false;

  return new Date(aucation.closed_at).getTime() <= Date.now();
}

const filteredAucations = computed(() => {
  let result = [...store.aucations];

  if (filter.value === "mine") {
    const currentUserId =
      store.aucations.find((item) => item.user_id)?.user_id;

    if (currentUserId) {
      result = result.filter(
        (item) => item.user_id === currentUserId
      );
    }
  }

  if (filter.value === "open") {
    result = result.filter((item) => !isClosed(item));
  }

  if (filter.value === "closed") {
    result = result.filter((item) => isClosed(item));
  }

  const keyword = search.value.trim().toLowerCase();

  if (keyword) {
    result = result.filter((item) => {
      return (
        String(item.title || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.description || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }

  return result;
});

function openDetail(id) {
  router.push(`/aucations/${id}`);
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
    return showErrorDialog(
      "Validasi",
      "Judul lelang wajib diisi."
    );
  }

  if (!form.description.trim()) {
    return showErrorDialog(
      "Validasi",
      "Deskripsi lelang wajib diisi."
    );
  }

  if (!form.start_bid || Number(form.start_bid) <= 0) {
    return showErrorDialog(
      "Validasi",
      "Harga awal harus lebih dari 0."
    );
  }

  if (!form.closed_at) {
    return showErrorDialog(
      "Validasi",
      "Batas waktu lelang wajib diisi."
    );
  }

  if (!form.cover) {
    return showErrorDialog(
      "Validasi",
      "Cover barang wajib dipilih."
    );
  }

  const closedDate = new Date(form.closed_at);

  if (closedDate.getTime() <= Date.now()) {
    return showErrorDialog(
      "Validasi",
      "Batas waktu harus lebih dari waktu sekarang."
    );
  }

  submitting.value = true;

  try {
    await store.addAucation({
      title: form.title,
      description: form.description,
      start_bid: Number(form.start_bid),
      closed_at: closedDate.toISOString(),
      cover: form.cover,
    });

    showAddModal.value = false;

    await store.fetchAucations();

    await showSuccessDialog(
      "Berhasil",
      "Lelang berhasil ditambahkan."
    );
  } catch (error) {
    showErrorDialog(
      "Gagal menambahkan lelang",
      error.message || "Terjadi kesalahan."
    );
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  try {
    await store.fetchAucations();
  } catch (error) {
    console.error(error);
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="border-b bg-white">
      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"
      >
        <div>
          <h1 class="text-2xl font-bold text-slate-900">
            Delcom Auction
          </h1>

          <p class="text-sm text-slate-500">
            Daftar barang yang sedang dilelang
          </p>
        </div>

        <div class="flex gap-3">
          <RouterLink
            to="/users"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700"
          >
            Pengguna
          </RouterLink>

          <RouterLink
            to="/profile"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700"
          >
            Profil
          </RouterLink>

          <button
            type="button"
            class="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white"
            @click="openAddModal"
          >
            + Tambah Lelang
          </button>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="mx-auto max-w-7xl px-6 py-8">
      <!-- Search -->
      <div class="mb-6">
        <input
          v-model="search"
          type="search"
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
          :class="
            filter === 'mine'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border'
          "
          @click="filter = 'mine'"
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
      @click.self="closeAddModal"
    >
      <div
        class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold">
              Tambah Lelang
            </h2>

            <p class="mt-1 text-sm text-slate-500">
              Masukkan barang yang ingin kamu lelang.
            </p>
          </div>

          <button
            type="button"
            class="text-2xl text-slate-400"
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
            <label class="mb-1 block text-sm font-semibold">
              Judul
            </label>

            <input
              v-model="form.title"
              type="text"
              placeholder="Contoh: Laptop Gaming ASUS"
              class="w-full rounded-xl border border-slate-300 p-3"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold">
              Deskripsi
            </label>

            <textarea
              v-model="form.description"
              rows="4"
              placeholder="Jelaskan kondisi dan detail barang..."
              class="w-full rounded-xl border border-slate-300 p-3"
            ></textarea>
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold">
              Harga Awal
            </label>

            <input
              v-model="form.start_bid"
              type="number"
              min="1"
              placeholder="1000000"
              class="w-full rounded-xl border border-slate-300 p-3"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold">
              Batas Waktu
            </label>

            <input
              v-model="form.closed_at"
              type="datetime-local"
              class="w-full rounded-xl border border-slate-300 p-3"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-semibold">
              Cover Barang
            </label>

            <input
              type="file"
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