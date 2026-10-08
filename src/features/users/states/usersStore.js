import { defineStore } from "pinia";
import * as api from "../api/userApi";

function unwrapUsers(response) {
  return response?.data?.users || response?.users || [];
}

function unwrapProfile(response) {
  return response?.data?.user || response?.data?.profile || response?.user || response?.profile || response?.data || response || null;
}

export const useUsersStore = defineStore("users", {
  state: () => ({
    users: [],
    profile: null,
    loading: false,
    profileLoading: false,
    error: "",
  }),

  actions: {
    async fetchUsers() {
      this.loading = true;
      this.error = "";
      try {
        const response = await api.getUsers();
        this.users = unwrapUsers(response);
        return this.users;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProfile() {
      this.profileLoading = true;
      this.error = "";
      try {
        const response = await api.getMe();
        this.profile = unwrapProfile(response);
        return this.profile;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.profileLoading = false;
      }
    },

    async updateProfile(data) {
      const response = await api.updateMe(data);
      await this.fetchProfile();
      return response;
    },
  },
});
