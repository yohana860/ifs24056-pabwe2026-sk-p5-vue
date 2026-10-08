import { defineStore } from "pinia";
import {
  login as loginApi,
  register as registerApi,
} from "../api/authApi";
import { putAccessToken } from "../../../helpers/apiHelper";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("auth_user") || "null"),
    isAuthLogin: false,
    isAuthRegister: false,
  }),

  getters: {
    isLoggedIn: () => !!localStorage.getItem("access_token"),
  },

  actions: {
    async login(data) {
      this.isAuthLogin = true;

      try {
        const response = await loginApi({
          email: data.email,
          password: data.password,
        });

        const token =
          response.data?.token ||
          response.token ||
          response.data?.access_token;

        const user =
          response.data?.user ||
          response.user ||
          null;

        if (token) {
          putAccessToken(token);
        }

        this.user = user;

        if (user) {
          localStorage.setItem(
            "auth_user",
            JSON.stringify(user)
          );
        }

        return response;
      } finally {
        this.isAuthLogin = false;
      }
    },

    async register(data) {
      this.isAuthRegister = true;

      try {
        return await registerApi({
          name: data.name,
          email: data.email,
          password: data.password,
        });
      } finally {
        this.isAuthRegister = false;
      }
    },

    logout() {
      putAccessToken("");
      localStorage.removeItem("auth_user");
      this.user = null;

      location.href = "/auth/login";
    },
  },
});