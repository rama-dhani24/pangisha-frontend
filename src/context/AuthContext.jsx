// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token

  // On mount — restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem("pangisha_token");
    if (!token) { setLoading(false); return; }

    authApi.getMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("pangisha_token");
        localStorage.removeItem("pangisha_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem("pangisha_token", res.token);
    localStorage.setItem("pangisha_user", JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    localStorage.setItem("pangisha_token", res.token);
    localStorage.setItem("pangisha_user", JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("pangisha_token");
    localStorage.removeItem("pangisha_user");
    setUser(null);
  }, []);

  const isLandlord = user?.role === "LANDLORD" || user?.role === "ADMIN";
  const isAdmin    = user?.role === "ADMIN";

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isLandlord, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
