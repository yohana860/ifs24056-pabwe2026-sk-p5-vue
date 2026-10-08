import { defineStore } from "pinia";
import * as api from "../api/aucationApi";

export const useAucationsStore = defineStore("aucations", {
  state: () => ({
    aucations: [],
    aucation: null,
    loading: false,
  }),

  actions: {
    async fetchAucations(query = {}) {
      this.loading = true;

      try {
        const response = await api.getAucations(query);

        this.aucations =
          response.data?.aucations ||
          response.aucations ||
          [];
        
        return response;
      } finally {
        this.loading = false;
      }
    },

    async fetchAucation(id) {
      this.loading = true;

      try {
        const response = await api.getAucation(id);

        this.aucation =
          response.data?.aucation ||
          response.aucation ||
          null;

        return response;
      } finally {
        this.loading = false;
      }
    },

    async addAucation(data) {
      return api.addAucation(data);
    },

    async updateAucation(id, data) {
      return api.updateAucation(id, data);
    },

    async uploadCover(id, data) {
      return api.uploadCover(id, data);
    },

    async deleteAucation(id) {
      return api.deleteAucation(id);
    },

    async addBid(id, data) {
      return api.addBid(id, data);
    },

    async deleteBid(id) {
      return api.deleteBid(id);
    },

    async deleteAll() {
      return api.deleteAll();
    },
  },
});