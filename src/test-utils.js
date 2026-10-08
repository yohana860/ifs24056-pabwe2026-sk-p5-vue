import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

export function createMockPinia() {
  return createPinia();
}

export function renderWithProviders(component, options = {}) {
  const pinia = createMockPinia();
  const router = createRouter({
    history: createMemoryHistory(),
    routes: options.routes || [{ path: "/:pathMatch(.*)*", component: { template: "<div />" } }],
  });
  return mount(component, {
    ...options,
    global: { plugins: [pinia, router], ...(options.global || {}) },
  });
}
