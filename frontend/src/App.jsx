import { useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppStore } from "./store/useAppStore";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";
import PageLoader from "./components/PageLoader";
import InitialLoader from "./components/InitialLoader";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Roadmaps = lazy(() => import("./pages/Roadmaps"));
const Focus = lazy(() => import("./pages/Focus"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const RoadmapDetail = lazy(() => import("./pages/RoadmapDetail"));

function App() {
  const { initTheme, user } = useAppStore();
  const [showInitialLoader, setShowInitialLoader] = useState(() => {
    return !sessionStorage.getItem('hasSeenInitialLoader');
  });

  const handleLoaderComplete = () => {
    sessionStorage.setItem('hasSeenInitialLoader', 'true');
    setShowInitialLoader(false);
  };

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  if (showInitialLoader) {
    return <InitialLoader onComplete={handleLoaderComplete} />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        {/* Public Routes — only accessible when NOT logged in */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" replace /> : <LandingPage />
          }
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        {/* Protected Routes — require authentication */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
