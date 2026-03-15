import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Map,
  Target,
  Plus,
  Edit2,
  Trash2,
  X,
  Clock,
  Layers,
} from "lucide-react";
import TaskDetailModal from "../components/TaskDetailModal";

export default function RoadmapDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    roadmaps,
    tasks,
    fetchRoadmaps,
    fetchTasks,
    toggleTask,
    addTask,
    updateTask,
    deleteTask,
    deleteRoadmap,
  } = useAppStore();

  const [selectedTask, setSelectedTask] = useState(null);
  const [completingIds, setCompletingIds] = useState([]);

  // Add Task State
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskModule, setNewTaskModule] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState(30);

  // Edit Task State
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editModule, setEditModule] = useState("");
  const [editDuration, setEditDuration] = useState(30);

  useEffect(() => {
    fetchRoadmaps();
    fetchTasks();
  }, [fetchRoadmaps, fetchTasks]);

  const roadmap = roadmaps.find((r) => r._id === id);
  // Using the bulletproof filter we discussed
  const roadmapTasks = tasks.filter((t) => String(t.roadmapId) === String(id));

  const completedCount = roadmapTasks.filter((t) => t.isCompleted).length;
  const dynamicProgress =
    roadmapTasks.length > 0
      ? Math.round((completedCount / roadmapTasks.length) * 100)
      : 0;

  // Delete Roadmap
  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure? This will delete the roadmap and all its tasks forever.",
      )
    ) {
      await deleteRoadmap(id);
      navigate("/roadmaps"); // Redirect back to the list
    }
  };

  // --- THE NEW LOGIC: GROUP TASKS BY MODULE ---
  const groupedTasks = roadmapTasks.reduce((acc, task) => {
    const moduleName = task.moduleName || "Additional Tasks";
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push(task);
    return acc;
  }, {});
  // ---------------------------------------------

  if (!roadmap)
    return (
      <div className="p-8 text-forge-textSecondary animate-pulse">
        Loading roadmap...
      </div>
    );

  // --- TASK ACTIONS ---
  const handleGracefulComplete = (taskId) => {
    setCompletingIds((prev) => [...prev, taskId]);
    setTimeout(() => {
      toggleTask(taskId);
      setCompletingIds((prev) => prev.filter((id) => id !== taskId));
    }, 700);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await addTask({
      title: newTaskTitle.trim(),
      roadmapId: id,
      moduleName: newTaskModule.trim() || "Additional Tasks",
      durationMinutes: Number(newTaskDuration) || 30,
    });

    setNewTaskTitle("");
    setNewTaskModule("");
    setNewTaskDuration(30);
    setIsAddingTask(false);
  };

  const handleDeleteTask = async (e, taskId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(taskId);
    }
  };

  const openEditModal = (e, task) => {
    e.stopPropagation();
    setEditingTask(task);
    setEditTitle(task.title);
    setEditModule(task.moduleName || "");
    setEditDuration(task.durationMinutes || 30);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    await updateTask(editingTask._id, {
      title: editTitle.trim(),
      moduleName: editModule.trim() || "Additional Tasks",
      durationMinutes: Number(editDuration) || 30,
    });

    setEditingTask(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Back Button & Header */}
      <div>
        <Link
          to="/roadmaps"
          className="inline-flex items-center gap-2 text-sm font-semibold text-forge-textSecondary hover:text-forge-accent transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Learning Paths
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 rounded-lg text-forge-accent">
                <Map size={24} />
              </div>
              <h2 className="text-3xl font-bold text-forge-textPrimary">
                {roadmap.title}
              </h2>
              <button
                onClick={handleDelete}
                className="p-2 text-forge-textSecondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0 ml-2"
                title="Delete Roadmap"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <span className="text-xs font-bold text-forge-accent bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              {roadmap.category || "General"}
            </span>
          </div>

          <div className="text-right bg-forge-surface border border-forge-border p-4 rounded-xl shadow-sm min-w-[150px]">
            <p className="text-xs font-bold text-forge-textSecondary uppercase tracking-wider mb-1 flex items-center justify-end gap-1.5">
              <Target size={14} /> Progress
            </p>
            <p className="text-2xl font-bold text-forge-accent">
              {dynamicProgress}%
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Progress Bar */}
      <div className="w-full bg-forge-surface border border-forge-border rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="bg-forge-accent h-full rounded-full transition-all duration-1000"
          style={{ width: `${dynamicProgress}%` }}
        ></div>
      </div>

      {/* Task List (Grouped by Module) */}
      <div className="space-y-10 mt-8">
        {Object.entries(groupedTasks).map(([moduleName, moduleTasks]) => {
          // Calculate if the entire module is done so we can show a cool visual indicator
          const isModuleComplete = moduleTasks.every((t) => t.isCompleted);

          return (
            <div key={moduleName} className="space-y-4">
              {/* Module Header */}
              <div className="flex items-center gap-3 pb-2 border-b border-forge-border">
                <div
                  className={`p-1.5 rounded-md ${isModuleComplete ? "bg-green-50 text-green-500" : "bg-forge-surface text-forge-accent border border-forge-border"}`}
                >
                  {isModuleComplete ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Layers size={18} />
                  )}
                </div>
                <h3
                  className={`text-xl font-bold ${isModuleComplete ? "text-forge-textSecondary" : "text-forge-textPrimary"}`}
                >
                  {moduleName}
                </h3>
                <span className="text-xs font-bold text-forge-textSecondary bg-forge-surface border border-forge-border px-2 py-0.5 rounded-full ml-auto">
                  {moduleTasks.filter((t) => t.isCompleted).length} /{" "}
                  {moduleTasks.length} Done
                </span>
              </div>

              {/* Tasks within this Module */}
              <div className="space-y-3">
                {moduleTasks.map((task, index) => {
                  const isCompleting = completingIds.includes(task._id);
                  const isActuallyDone = task.isCompleted || isCompleting;

                  return (
                    <div
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className={`relative flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-700 border group ${
                        task.isCompleted
                          ? "bg-forge-surface/50 border-transparent opacity-60 hover:opacity-100"
                          : "bg-forge-surface border-forge-border hover:border-forge-accent shadow-sm"
                      } ${isCompleting ? "scale-[0.98] bg-green-50/50 border-green-200 opacity-100" : ""}`}
                    >
                      <div className="font-mono text-sm font-bold text-forge-textSecondary/50 mt-1 w-6 text-right shrink-0">
                        {index + 1}.
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCompleting) return;
                          if (task.isCompleted) {
                            toggleTask(task._id);
                          } else {
                            handleGracefulComplete(task._id);
                          }
                        }}
                        className={`mt-0.5 transition-colors shrink-0 ${
                          isCompleting
                            ? "text-green-500"
                            : task.isCompleted
                              ? "text-forge-accent hover:text-forge-textSecondary"
                              : "text-forge-textSecondary group-hover:text-forge-accent"
                        }`}
                      >
                        {isActuallyDone ? (
                          <CheckCircle2 size={24} />
                        ) : (
                          <Circle size={24} />
                        )}
                      </button>

                      <div className="flex-1 pr-16">
                        <h4
                          className={`font-semibold text-base leading-tight transition-colors duration-300 ${isCompleting ? "text-green-700" : task.isCompleted ? "text-forge-textSecondary line-through" : "text-forge-textPrimary"}`}
                        >
                          {task.title}
                        </h4>
                        <p className="text-xs font-medium text-forge-textSecondary/70 mt-1.5 uppercase tracking-wider flex items-center gap-2">
                          <Clock size={12} className="opacity-70" />{" "}
                          {task.durationMinutes} MINS
                        </p>
                      </div>

                      {/* Hover Actions: Edit & Delete */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-forge-surface/90 backdrop-blur-sm p-1 rounded-lg">
                        <button
                          onClick={(e) => openEditModal(e, task)}
                          className="p-2 text-forge-textSecondary hover:text-forge-accent hover:bg-indigo-50 rounded-md transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTask(e, task._id)}
                          className="p-2 text-forge-textSecondary hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Add New Task Form (Now sits at the very bottom of all modules) */}
        <div className="pt-6 mt-6 border-t border-forge-border">
          {isAddingTask ? (
            <form
              onSubmit={handleAddTask}
              className="flex flex-col gap-3 p-5 bg-forge-bg border border-forge-accent rounded-2xl animate-in fade-in duration-200 shadow-sm"
            >
              <input
                type="text"
                autoFocus
                placeholder="Task Title (e.g., Build a REST API)"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-transparent border-b border-forge-border pb-2 focus:border-forge-accent focus:outline-none text-forge-textPrimary font-semibold placeholder:text-forge-textSecondary/50"
              />

              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mt-2">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center bg-forge-surface border border-forge-border rounded-lg px-3 py-2 flex-1 sm:flex-none">
                    <Layers
                      size={16}
                      className="text-forge-textSecondary mr-2 shrink-0"
                    />
                    <input
                      type="text"
                      placeholder="Module Name"
                      value={newTaskModule}
                      onChange={(e) => setNewTaskModule(e.target.value)}
                      className="bg-transparent border-none focus:outline-none text-forge-textPrimary text-sm font-medium w-32"
                    />
                  </div>

                  <div className="flex items-center bg-forge-surface border border-forge-border rounded-lg px-3 py-2">
                    <Clock
                      size={16}
                      className="text-forge-textSecondary mr-2 shrink-0"
                    />
                    <input
                      type="number"
                      min="5"
                      value={newTaskDuration}
                      onChange={(e) => setNewTaskDuration(e.target.value)}
                      className="w-12 bg-transparent border-none focus:outline-none text-forge-textPrimary text-sm font-semibold"
                    />
                    <span className="text-xs font-bold text-forge-textSecondary ml-1">
                      MINS
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="px-4 py-2 text-sm font-bold text-forge-textSecondary hover:text-forge-textPrimary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    className="bg-forge-accent text-white px-6 py-2 rounded-lg font-bold hover:bg-forge-accentHover transition-colors disabled:opacity-50"
                  >
                    Save Task
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center justify-center gap-2 w-full py-5 border-2 border-dashed border-forge-border rounded-2xl text-forge-textSecondary hover:text-forge-accent hover:border-forge-accent hover:bg-indigo-50/30 transition-all font-semibold group"
            >
              <Plus
                size={20}
                className="transition-transform group-hover:scale-110"
              />
              Add New Task
            </button>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        roadmapName={roadmap.title}
        onClose={() => setSelectedTask(null)}
        onComplete={handleGracefulComplete}
        onUndo={(taskId) => toggleTask(taskId)}
      />

      {/* Edit Modal Overlay */}
      {editingTask && (
        <div className="fixed inset-0 bg-forge-textPrimary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-forge-surface w-full max-w-sm rounded-2xl shadow-2xl border border-forge-border p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingTask(null)}
              className="absolute top-4 right-4 text-forge-textSecondary hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-forge-accent">
                <Edit2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-forge-textPrimary">
                Edit Task
              </h3>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-forge-textPrimary mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-forge-bg border border-forge-border rounded-xl text-forge-textPrimary focus:outline-none focus:border-forge-accent transition-colors"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-forge-textPrimary mb-1.5">
                    Module
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-forge-bg border border-forge-border rounded-xl text-forge-textPrimary focus:outline-none focus:border-forge-accent transition-colors"
                    value={editModule}
                    onChange={(e) => setEditModule(e.target.value)}
                    placeholder="e.g. Basics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-forge-textPrimary mb-1.5">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-3 bg-forge-bg border border-forge-border rounded-xl text-forge-textPrimary focus:outline-none focus:border-forge-accent transition-colors"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="w-1/2 py-2.5 bg-forge-bg border border-forge-border text-forge-textPrimary rounded-xl font-bold hover:border-forge-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editTitle.trim()}
                  className="w-1/2 py-2.5 bg-forge-accent text-white rounded-xl font-bold hover:bg-forge-accentHover transition-colors disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
