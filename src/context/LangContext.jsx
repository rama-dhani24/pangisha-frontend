// src/context/LangContext.jsx
// Global language state — defaults to Swahili (sw)
// Persists user's choice in localStorage so it's remembered on next visit
import { createContext, useContext, useState } from "react";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    // Restore from localStorage if user switched before, else default to Swahili
    return localStorage.getItem("pangisha_lang") || "sw";
  });

  function toggleLang() {
    const next = lang === "sw" ? "en" : "sw";
    setLang(next);
    localStorage.setItem("pangisha_lang", next);
  }

  function switchTo(l) {
    setLang(l);
    localStorage.setItem("pangisha_lang", l);
  }

  return (
    <LangContext.Provider value={{ lang, toggleLang, switchTo }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
