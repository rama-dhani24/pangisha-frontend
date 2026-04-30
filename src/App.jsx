// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { LangProvider } from "./context/LangContext.jsx";

import PangishaHome      from "./pages/PangishaHome.jsx";
import AuthPage          from "./pages/AuthPage.jsx";
import ListingDetail     from "./pages/ListingDetail.jsx";
import PostListing       from "./pages/PostListing.jsx";
import LandlordDashboard from "./pages/LandlordDashboard.jsx";
import SavedListings     from "./pages/SavedListings.jsx";
import AdminPanel        from "./pages/AdminPanel.jsx";

// ── Route guards ──────────────────────────────────────────────
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 60, textAlign: "center", fontFamily: "sans-serif", color: "#5C3D2E" }}>Loading…</div>;
  if (!user)   return <Navigate to="/auth" replace />;
  return children;
}

function RequireLandlord({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || (user.role !== "LANDLORD" && user.role !== "ADMIN")) return <Navigate to="/auth" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== "ADMIN") return <Navigate to="/" replace />;
  return children;
}

// ── App ───────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"             element={<PangishaHome />} />
      <Route path="/auth"         element={<AuthPage />} />
      <Route path="/listing/:id"  element={<ListingDetail />} />

      {/* Any logged-in user */}
      <Route path="/saved"        element={<RequireAuth><SavedListings /></RequireAuth>} />

      {/* Landlords + Admin */}
      <Route path="/post"         element={<RequireLandlord><PostListing /></RequireLandlord>} />
      <Route path="/dashboard"    element={<RequireLandlord><LandlordDashboard /></RequireLandlord>} />

      {/* Admin only */}
      <Route path="/admin"        element={<RequireAdmin><AdminPanel /></RequireAdmin>} />

      {/* Fallback */}
      <Route path="*"             element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}
