import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppStore } from "./store/useAppStore";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Roadmaps from "./pages/Roadmaps";
import Focus from "./pages/Focus";
import KnowledgeBase from "./pages/KnowledgeBase";
import RoadmapDetail from "./pages/RoadmapDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const { initTheme, user } = useAppStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes — only accessible when NOT logged in */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register />}
        />

        {/* Protected Routes — require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="roadmaps" element={<Roadmaps />} />
            <Route path="roadmaps/:id" element={<RoadmapDetail />} />
            <Route path="focus" element={<Focus />} />
            <Route path="knowledge" element={<KnowledgeBase />} />
          </Route>
        </Route>

        {/* Catch-all: redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
