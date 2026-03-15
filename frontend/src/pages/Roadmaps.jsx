import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Map, Plus, Sparkles, X, Loader2, Pin, PinOff } from "lucide-react";

export default function Roadmaps() {
  const {
    roadmaps,
    fetchRoadmaps,
    isLoading,
    generateRoadmap,
    isGenerating,
    toggleRoadmapActive,
    addRoadmap,
  } = useAppStore();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic) return;

    await generateRoadmap(topic, category || "General");

    // Close modal and reset form after generation
    setIsModalOpen(false);
    setTopic("");
    setCategory("");
  };

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    if (!customTitle) return;

    await addRoadmap({
      title: customTitle,
      category: customCategory || "General",
    });

    setIsCustomModalOpen(false);
    setCustomTitle("");
    setCustomCategory("");
  };

  if (isLoading && roadmaps.length === 0) {
    return (
      <div className="animate-pulse text-forge-textSecondary">
        Loading your learning paths...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-forge-textPrimary">
            Learning Paths
          </h2>
          <p className="text-forge-textSecondary mt-1">
            Map out your journey, module by module.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center gap-2 bg-forge-surface border border-forge-border text-forge-textPrimary px-4 py-2 rounded-lg font-semibold hover:border-forge-accent transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Create Path</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-forge-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-forge-accentHover transition-colors shadow-sm"
          >
            <Sparkles size={18} />
            <span className="hidden sm:inline">AI Generate Pathway</span>
          </button>
        </div>
      </div>

      {/* Roadmaps List */}
      {roadmaps.length === 0 ? (
        <div className="bg-forge-surface p-10 rounded-2xl border border-forge-border text-center">
          <p className="text-forge-textSecondary">
            No learning paths found. Let AI generate one for you!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {roadmaps.map((roadmap) => (
            <div key={roadmap._id} className="relative group">
              {/* The Pin Button */}
              <button
                onClick={(e) => {
                  e.preventDefault(); // Stops the Link from triggering
                  e.stopPropagation();
                  toggleRoadmapActive(roadmap._id);
                }}
                className={`absolute top-5 right-5 p-2 rounded-lg z-10 transition-all duration-200 ${
                  roadmap.isActive
                    ? "bg-forge-accent text-white shadow-md opacity-100"
                    : "bg-forge-surface border border-forge-border text-forge-textSecondary hover:text-forge-accent opacity-0 group-hover:opacity-100 shadow-sm"
                }`}
                title={
                  roadmap.isActive ? "Unpin from Dashboard" : "Pin to Dashboard"
                }
              >
                {roadmap.isActive ? <Pin size={16} /> : <PinOff size={16} />}
              </button>

              <Link
                to={`/roadmaps/${roadmap._id}`}
                className="block bg-forge-surface border border-forge-border rounded-2xl shadow-sm overflow-hidden transition-all hover:border-forge-accent hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="p-6 border-b border-forge-border bg-forge-bg/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg text-forge-accent">
                        <Map size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-forge-textPrimary">
                        {roadmap.title}
                      </h3>
                    </div>
                    {/* Added mr-10 so the text doesn't hide behind the absolute pin button */}
                    <span className="text-xs font-bold text-forge-accent bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider mr-10">
                      {roadmap.category || "General"}
                    </span>
                  </div>

                  <div className="w-full bg-forge-border rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-forge-accent h-2.5 rounded-full transition-all duration-1000"
                      style={{ width: `${roadmap.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* AI Generation Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-forge-textPrimary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-forge-surface w-full max-w-md rounded-2xl shadow-2xl border border-forge-border p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-forge-textSecondary hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-forge-accent">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-forge-textPrimary">
                  AI Roadmap Architect
                </h3>
                <p className="text-xs text-forge-textSecondary mt-0.5">
                  Powered by Gemini 2.5 Flash
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-forge-textPrimary mb-1.5">
                  What do you want to learn?
                </label>
                <input
                  type="text"
                  placeholder="e.g., GraphQL, Three.js, System Design..."
                  className="w-full p-3 bg-forge-bg border border-forge-border rounded-xl text-forge-textPrimary focus:outline-none focus:border-forge-accent transition-colors"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isGenerating}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-forge-textPrimary mb-1.5">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Frontend, DevOps, Math..."
                  className="w-full p-3 bg-forge-bg border border-forge-border rounded-xl text-forge-textPrimary focus:outline-none focus:border-forge-accent transition-colors"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !topic}
                className="w-full py-3 mt-2 bg-forge-accent text-white rounded-xl font-bold hover:bg-forge-accentHover transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating your path...
                  </>
                ) : (
                  "Build My Roadmap"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Manual Roadmap Creation Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 bg-forge-textPrimary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-forge-surface w-full max-w-md rounded-2xl shadow-2xl border border-forge-border p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCustomModalOpen(false)}
              className="absolute top-4 right-4 text-forge-textSecondary hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-forge-accent">
                <Map size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-forge-textPrimary">
                  Create Learning Path
                </h3>
                <p className="text-xs text-forge-textSecondary mt-0.5">
                  Start mapping from scratch
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-forge-textPrimary mb-1.5">
                  Path Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Learn Advanced React"
                  className="w-full p-3 bg-forge-bg border border-forge-border rounded-xl text-forge-textPrimary focus:outline-none focus:border-forge-accent transition-colors"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-forge-textPrimary mb-1.5">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Frontend"
                  className="w-full p-3 bg-forge-bg border border-forge-border rounded-xl text-forge-textPrimary focus:outline-none focus:border-forge-accent transition-colors"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={!customTitle}
                className="w-full py-3 mt-2 bg-forge-accent text-white rounded-xl font-bold hover:bg-forge-accentHover transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Create Path
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
