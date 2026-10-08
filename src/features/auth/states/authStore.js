import { defineStore } from "pinia";
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
} from "../api/authApi";

import {
  getAccessToken,
  putAccessToken,
} from "../../../helpers/apiHelper";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("auth_user") || "null"),
    token: getAccessToken(),
    isAuthLogin: false,
    isAuthRegister: false,
    isAuthLogout: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
    async login(data) {
      this.isAuthLogin = true;

      try {
        const response = await loginApi({
          email: data.email,
          password: data.password,
        });

        console.log("[Auth] Login response:", response);

        const token =
          response?.data?.token ||
          response?.data?.accessToken ||
          response?.data?.access_token ||
          response?.token ||
          response?.accessToken ||
          response?.access_token ||
          "";

        const user =
          response?.data?.user ||
          response?.user ||
          null;

        console.log("[Auth] Token ditemukan:", !!token);

        if (!token) {
          throw new Error(
            "Login berhasil tetapi access token tidak ditemukan."
          );
        }

        putAccessToken(token);
        this.token = token;

        this.user = user;

        if (user) {
          localStorage.setItem(
            "auth_user",
            JSON.stringify(user)
          );
        }

        console.log(
          "[Auth] Token tersimpan:",
          !!getAccessToken()
        );

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

    async logout() {
      this.isAuthLogout = true;

      try {
        await logoutApi();
      } catch {
        // Token mungkin sudah tidak valid.
      } finally {
        putAccessToken("");
        localStorage.removeItem("auth_user");

        this.token = "";
        this.user = null;
        this.isAuthLogout = false;
      }
    },
  },
});