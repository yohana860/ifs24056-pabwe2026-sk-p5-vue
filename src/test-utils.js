import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

export function createMockPinia() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

export async function renderWithProviders(component, { route = "/", routes, props, global = {} } = {}) {
  const pinia = createMockPinia();
  const router = createRouter({
    history: createMemoryHistory(),
    routes: routes || [{ path: "/:pathMatch(.*)*", component: { template: "<div />" } }],
  });
  router.push(route);
  await router.isReady();

  const wrapper = mount(component, {
    props,
    global: { plugins: [pinia, router], ...global },
  });
  await flushPromises();
  return { wrapper, router, pinia };
}