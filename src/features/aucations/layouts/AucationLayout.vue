<script setup>
import { ref } from "vue";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";

const sidebarOpen = ref(false);
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <NavbarComponent @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <div class="flex">
      <SidebarComponent :open="sidebarOpen" @close="sidebarOpen = false" />
      <div class="min-w-0 flex-1"><RouterView /></div>
    </div>
  </div>
</template>
