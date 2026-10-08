<template>
  <div class="min-h-screen grid md:grid-cols-2 bg-slate-950">
    <div class="hidden md:flex flex-col justify-center p-16 text-white">
      <div class="text-4xl font-extrabold">Delcom Auction</div>
      <p class="mt-4 text-slate-300">Platform lelang sederhana untuk mengelola barang dan penawaran.</p>
    </div>
    <main class="bg-white md:rounded-l-[2rem] p-6 md:p-12 flex items-center" aria-label="Autentikasi Delcom Auction">
      <div class="w-full max-w-md mx-auto"><RouterView /></div>
    </main>
  </div>
</template>
