import { apiFetch } from "../../../helpers/apiHelper";

export const getAucations = (query = {}) => apiFetch("/aucations", { query });
export const getAucation = (id) => apiFetch(`/aucations/${id}`);

export const addAucation = (data) => {
  const form = new FormData();
  if (data.cover) form.append("cover", data.cover);
  form.append("title", data.title || "");
  form.append("description", data.description || "");
  form.append("start_bid", String(data.start_bid ?? ""));
  form.append("closed_at", data.closed_at || "");
  return apiFetch("/aucations", { method: "POST", body: form });
};

export const updateAucation = (id, data) => {
  const form = new URLSearchParams();
  form.set("title", data.title || "");
  form.set("description", data.description || "");
  form.set("start_bid", String(data.start_bid ?? ""));
  form.set("closed_at", data.closed_at || "");
  return apiFetch(`/aucations/${id}`, { method: "PUT", body: form });
};

export const uploadCover = (id, cover) => {
  const form = new FormData();
  form.append("cover", cover);
  return apiFetch(`/aucations/${id}/cover`, { method: "POST", body: form });
};

export const deleteAucation = (id) => apiFetch(`/aucations/${id}`, { method: "DELETE" });

export const addBid = (id, data) => {
  const form = new URLSearchParams();
  form.set("bid", String(data.bid ?? ""));
  return apiFetch(`/aucations/${id}/bids`, { method: "POST", body: form });
};

export const deleteBid = (id) => apiFetch(`/aucations/${id}/bids`, { method: "DELETE" });
export const deleteAll = () => apiFetch("/aucations", { method: "DELETE" });
