// src/api/listings.js
import api from "./client.js";

export const listingsApi = {
  getAll:       (params = {}) => api.get("/listings?" + new URLSearchParams(params).toString()),
  getOne:       (id)          => api.get(`/listings/${id}`),
  getMine:      ()            => api.get("/listings/mine"),
  create:       (data)        => api.post("/listings", data),
  update:       (id, data)    => api.put(`/listings/${id}`, data),
  remove:       (id)          => api.delete(`/listings/${id}`),
  setStatus:    (id, status)  => api.patch(`/listings/${id}/status`, { status }),
  uploadImages: (id, files)   => {
    const form = new FormData();
    files.forEach((f) => form.append("images", f));
    return api.upload(`/listings/${id}/images`, form);
  },
  deleteImage:  (imageId)     => api.delete(`/images/${imageId}`),
  setPrimary:   (imageId)     => api.patch(`/images/${imageId}/primary`, {}),
};
