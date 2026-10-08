import { defineStore } from "pinia";
import * as api from "../api/aucationApi";

export const useAucationsStore = defineStore("aucations", {
  state: () => ({
    aucations: [],
    aucation: null,
    loading: false,
    error: "",
  }),

  actions: {
    async fetchAucations(query = {}) {
      this.loading = true;
      this.error = "";
      try {
        const response = await api.getAucations(query);
        this.aucations = response?.data?.aucations || response?.aucations || [];
        return this.aucations;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAucation(id) {
      this.loading = true;
      this.error = "";
      try {
        const response = await api.getAucation(id);
        this.aucation = response?.data?.aucation || response?.aucation || response?.data || null;
        return this.aucation;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    addAucation: api.addAucation,
    updateAucation: api.updateAucation,
    uploadCover: api.uploadCover,
    deleteAucation: api.deleteAucation,
    addBid: api.addBid,
    deleteBid: api.deleteBid,
    deleteAll: api.deleteAll,
  },
});
