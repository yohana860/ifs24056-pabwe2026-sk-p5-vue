import { createRouter, createWebHistory } from "vue-router";

import LoginPage from "./features/auth/pages/LoginPage.vue";
import RegisterPage from "./features/auth/pages/RegisterPage.vue";
import HomePage from "./features/aucations/pages/HomePage.vue";
import DetailPage from "./features/aucations/pages/DetailPage.vue";
import ProfilePage from "./features/users/pages/ProfilePage.vue";
import UsersPage from "./features/users/pages/UsersPage.vue";
import NotFoundPage from "./features/common/pages/NotFoundPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public
    {
      path: "/",
      component: HomePage,
    },
    {
      path: "/auth/login",
      component: LoginPage,
    },
    {
      path: "/auth/register",
      component: RegisterPage,
    },

    // Protected
    {
      path: "/aucations/:aucationId",
      component: DetailPage,
      meta: { requiresAuth: true },
    },
    {
      path: "/users",
      component: UsersPage,
      meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      component: ProfilePage,
      meta: { requiresAuth: true },
    },

    // 404
    {
      path: "/:pathMatch(.*)*",
      component: NotFoundPage,
    },
  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem("access_token");

  // Jika sudah login dan membuka login/register,
  // arahkan ke halaman utama.
  if (to.path.startsWith("/auth") && token) {
    return "/";
  }

  // Hanya route dengan meta requiresAuth yang membutuhkan login.
  if (to.meta.requiresAuth && !token) {
    return "/auth/login";
  }

  return true;
});

export default router;