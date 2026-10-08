import { apiFetch } from "../../../helpers/apiHelper";

export const getAucations = (query = {}) => apiFetch("/aucations", { query });
export const getAucation = (id) => apiFetch(`/aucations/${id}`);

const payload = (data) => ({
  title: data.title || "",
  description: data.description || "",
  start_bid: Number(data.start_bid || 0),
  closed_at: data.closed_at || "",
});

export const uploadCover = (id, cover) => {
  const form = new FormData();
  form.append("cover", cover);
  return apiFetch(`/aucations/${id}/cover`, { method: "POST", body: form });
};

export const addAucation = async (data) => {
  const response = await apiFetch("/aucations", { method: "POST", body: payload(data) });
  const id = response?.data?.aucation_id || response?.data?.id || response?.data?.aucation?.id;
  if (data.cover && id) await uploadCover(id, data.cover);
  return response;
};

export const updateAucation = (id, data) =>
  apiFetch(`/aucations/${id}`, { method: "PUT", body: payload(data) });

export const deleteAucation = (id) => apiFetch(`/aucations/${id}`, { method: "DELETE" });

export const addBid = (id, data) =>
  apiFetch(`/aucations/${id}/bids`, { method: "POST", body: { bid: Number(data.bid || 0) } });

export const deleteBid = (id) => apiFetch(`/aucations/${id}/bids`, { method: "DELETE" });
export const deleteAll = () => apiFetch("/aucations", { method: "DELETE" });
