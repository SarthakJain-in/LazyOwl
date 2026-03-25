import { useState, useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import { Plus, X } from "lucide-react";

export default function AddTaskForm() {
  const { addTask, roadmaps, fetchRoadmaps } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    moduleName: "",
    durationMinutes: "",
    roadmapId: "",
  });

  // Make sure we have the roadmaps loaded
  useEffect(() => {
    if (roadmaps.length === 0) fetchRoadmaps();
  }, [roadmaps.length, fetchRoadmaps]);

  // When the form opens, default to the first roadmap in the list
  useEffect(() => {
    if (isExpanded && roadmaps.length > 0 && !formData.roadmapId) {
      setFormData((prev) => ({ ...prev, roadmapId: roadmaps[0]._id }));
    }
  }, [isExpanded, roadmaps]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.moduleName ||
      !formData.durationMinutes ||
      !formData.roadmapId
    )
      return;

    await addTask({
      roadmapId: formData.roadmapId, // Now using the REAL ID!
      title: formData.title,
      moduleName: formData.moduleName,
      durationMinutes: Number(formData.durationMinutes),
    });

    // Reset and close form
    setFormData({
      title: "",
      moduleName: "",
      durationMinutes: "",
      roadmapId: roadmaps[0]?._id || "",
    });
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-xl border border-dashed border-forge-border text-forge-textSecondary hover:text-forge-accent hover:border-forge-accent hover:bg-forge-accent/5 transition-all font-medium shadow-sm"
      >
        <Plus size={20} /> Add New Task
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 p-4 bg-forge-bg rounded-xl border border-forge-border shadow-inner space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-sm font-bold text-forge-textPrimary uppercase tracking-wider">
          New Task
        </h4>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="text-forge-textSecondary hover:text-red-500 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* New Roadmap Dropdown */}
      <select
        className="w-full p-2.5 bg-forge-surface border border-forge-border rounded-lg text-forge-textPrimary focus:outline-none focus:border-forge-accent text-sm transition-colors cursor-pointer"
        value={formData.roadmapId}
        onChange={(e) =>
          setFormData({ ...formData, roadmapId: e.target.value })
        }
      >
        {roadmaps.length === 0 ? (
          <option value="" disabled>
            No Roadmaps found. Create one first!
          </option>
        ) : (
          roadmaps.map((rm) => (
            <option key={rm._id} value={rm._id}>
              {rm.title}
            </option>
          ))
        )}
      </select>

      <input
        type="text"
        placeholder="Task Title (e.g., Build Auth Middleware)"
        className="w-full p-2.5 bg-forge-surface border border-forge-border rounded-lg text-forge-textPrimary focus:outline-none focus:border-forge-accent text-sm transition-colors"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        autoFocus
      />

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Module (e.g., Express.js)"
          className="w-2/3 p-2.5 bg-forge-surface border border-forge-border rounded-lg text-forge-textPrimary focus:outline-none focus:border-forge-accent text-sm transition-colors"
          value={formData.moduleName}
          onChange={(e) =>
            setFormData({ ...formData, moduleName: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Mins"
          className="w-1/3 p-2.5 bg-forge-surface border border-forge-border rounded-lg text-forge-textPrimary focus:outline-none focus:border-forge-accent text-sm transition-colors"
          value={formData.durationMinutes}
          onChange={(e) =>
            setFormData({ ...formData, durationMinutes: e.target.value })
          }
        />
      </div>

      <button
        type="submit"
        className="w-full py-2.5 bg-forge-accent text-white rounded-lg font-semibold hover:bg-forge-accentHover transition-colors mt-2"
        disabled={!formData.roadmapId}
      >
        Save Task
      </button>
    </form>
  );
}
