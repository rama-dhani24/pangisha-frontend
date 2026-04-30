// src/api/users.js
import api from "./client.js";

export const usersApi = {
  getProfile:        ()            => api.get("/users/me"),
  updateProfile:     (data)        => api.put("/users/me", data),
  changePassword:    (data)        => api.put("/users/me/password", data),
  getLandlordProfile:(id)          => api.get(`/users/${id}/listings`),
};
