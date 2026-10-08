import { createRouter, createWebHistory } from "vue-router";

import AuthLayout from "./features/auth/layouts/AuthLayout.vue";
import LoginPage from "./features/auth/pages/LoginPage.vue";
import RegisterPage from "./features/auth/pages/RegisterPage.vue";

import AucationLayout from "./features/aucations/layouts/AucationLayout.vue";
import HomePage from "./features/aucations/pages/HomePage.vue";
import DetailPage from "./features/aucations/pages/DetailPage.vue";

import UsersPage from "./features/users/pages/UsersPage.vue";
import ProfilePage from "./features/users/pages/ProfilePage.vue";

import NotFoundPage from "./features/common/pages/NotFoundPage.vue";
import { getAccessToken } from "./helpers/apiHelper";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/auth",
      component: AuthLayout,
      meta: { guestOnly: true },
      children: [
        { path: "login", component: LoginPage },
        { path: "register", component: RegisterPage },
      ],
    },
    {
      path: "/",
      component: AucationLayout,
      children: [
        { path: "", component: HomePage },
        { path: "aucations/:aucationId", component: DetailPage },
        { path: "users", component: UsersPage },
        { path: "profile", component: ProfilePage },
      ],
    },
    { path: "/:pathMatch(.*)*", component: NotFoundPage },
  ],
});

router.beforeEach((to) => {
  const token = getAccessToken();
  if (to.matched.some((r) => r.meta.guestOnly) && token) return "/";
  if (to.matched.some((r) => r.meta.requiresAuth) && !token) return "/auth/login";
  return true;
});

router.afterEach((to) => {
  const titles = {
    "/": "Delcom Auction — Platform Lelang Online",
    "/auth/login": "Masuk — Delcom Auction",
    "/auth/register": "Daftar — Delcom Auction",
    "/users": "Pengguna — Delcom Auction",
    "/profile": "Profil Saya — Delcom Auction",
  };

  document.title = titles[to.path] || "Delcom Auction — Platform Lelang Online";
});

export default router;
