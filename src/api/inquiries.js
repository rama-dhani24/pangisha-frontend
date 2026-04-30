// src/api/inquiries.js
import api from "./client.js";

export const inquiriesApi = {
  send:        (data) => api.post("/inquiries", data),
  getReceived: ()     => api.get("/inquiries/received"),
  getSent:     ()     => api.get("/inquiries/sent"),
  markRead:    (id)   => api.patch(`/inquiries/${id}/read`, {}),
};
