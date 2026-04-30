// src/api/admin.js
import api from "./client.js";

export const adminApi = {
  getStats:         ()              => api.get("/admin/stats"),
  getListings:      (params = {})   => api.get("/admin/listings?" + new URLSearchParams(params).toString()),
  updateListing:    (id, data)      => api.patch(`/admin/listings/${id}`, data),
  getUsers:         (params = {})   => api.get("/admin/users?" + new URLSearchParams(params).toString()),
  updateUser:       (id, data)      => api.patch(`/admin/users/${id}`, data),
  getReports:       (params = {})   => api.get("/admin/reports?" + new URLSearchParams(params).toString()),
  resolveReport:    (id)            => api.patch(`/admin/reports/${id}/resolve`, {}),
  createReport:     (data)          => api.post("/admin/reports", data),
};
