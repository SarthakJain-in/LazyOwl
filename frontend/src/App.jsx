import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppStore } from "./store/useAppStore";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Roadmaps from "./pages/Roadmaps";
import Focus from "./pages/Focus";
import KnowledgeBase from "./pages/KnowledgeBase";
import RoadmapDetail from "./pages/RoadmapDetail";

// Placeholder components for the other routes so the app doesn't crash
const Placeholder = ({ title }) => (
  <div className="text-2xl font-bold">{title} Page Coming Soon</div>
);

function App() {
  const { initTheme } = useAppStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="roadmaps" element={<Roadmaps />} />
          <Route path="roadmaps/:id" element={<RoadmapDetail />} />
          <Route path="focus" element={<Focus />} />
          <Route path="knowledge" element={<KnowledgeBase />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
