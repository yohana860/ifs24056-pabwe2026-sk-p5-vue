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
        {
          path: "aucations/:aucationId",
          component: DetailPage,
          meta: { requiresAuth: true },
        },
        {
          path: "users",
          component: UsersPage,
          meta: { requiresAuth: true },
        },
        {
          path: "profile",
          component: ProfilePage,
          meta: { requiresAuth: true },
        },
      ],
    },

    {
      path: "/:pathMatch(.*)*",
      component: NotFoundPage,
    },
  ],
});

router.beforeEach((to) => {
  const token = getAccessToken();

  if (to.matched.some((r) => r.meta.guestOnly) && token) {
    return "/";
  }

  if (to.matched.some((r) => r.meta.requiresAuth) && !token) {
    return "/auth/login";
  }

  return true;
});