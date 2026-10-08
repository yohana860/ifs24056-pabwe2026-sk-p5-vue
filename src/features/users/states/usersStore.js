import { defineStore } from "pinia";
import * as api from "../api/userApi";

export const useUsersStore = defineStore("users", {
  state: () => ({
    users: [],
    profile: null,
    loading: false,
  }),

  actions: {
    async fetchUsers() {
      this.loading = true;

      try {
        const response = await api.getUsers();

        this.users =
          response.data?.users ||
          response.users ||
          [];

        return response;
      } finally {
        this.loading = false;
      }
    },

    async fetchProfile() {
      this.loading = true;

      try {
        const response = await api.getMe();

        this.profile =
          response.data?.user ||
          response.data ||
          response.user ||
          response;

        return response;
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(data) {
      return api.updateMe(data);
    },

    async uploadPhoto(file) {
      return api.uploadPhoto(file);
    },

    async changePassword(data) {
      return api.changePassword(data);
    },
  },
});