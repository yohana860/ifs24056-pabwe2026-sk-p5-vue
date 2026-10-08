import { createRouter, createWebHistory } from "vue-router";

import LoginPage from "./features/auth/pages/LoginPage.vue";
import RegisterPage from "./features/auth/pages/RegisterPage.vue";

import HomePage from "./features/aucations/pages/HomePage.vue";
import DetailPage from "./features/aucations/pages/DetailPage.vue";

import UsersPage from "./features/users/pages/UsersPage.vue";
import ProfilePage from "./features/users/pages/ProfilePage.vue";

import NotFoundPage from "./features/common/pages/NotFoundPage.vue";

const router = createRouter({
  history: createWebHistory(),

  routes: [
    // =========================
    // AUTH ROUTES
    // =========================
    {
      path: "/auth/login",
      component: LoginPage,
    },
    {
      path: "/auth/register",
      component: RegisterPage,
    },

    // =========================
    // PROTECTED AUCTION ROUTES
    // =========================
    {
      path: "/",
      component: HomePage,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/aucations/:aucationId",
      component: DetailPage,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/users",
      component: UsersPage,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/profile",
      component: ProfilePage,
      meta: {
        requiresAuth: true,
      },
    },

    // =========================
    // 404
    // =========================
    {
      path: "/:pathMatch(.*)*",
      component: NotFoundPage,
    },
  ],
});

// =========================
// AUTH GUARD
// =========================
router.beforeEach((to) => {
  const token = localStorage.getItem("access_token");

  // Sudah login → tidak perlu kembali ke login/register
  if (to.path.startsWith("/auth") && token) {
    return "/";
  }

  // Belum login → tidak boleh masuk protected route
  if (to.meta.requiresAuth && !token) {
    return "/auth/login";
  }

  return true;
});

export default router;