import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAppStore } from "../store/useAppStore";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Map,
  Target,
  Plus,
  Trash2,
  Clock,
  Layers,
  GripVertical,
  Edit3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import TaskDetailModal from "../components/TaskDetailModal";
import PageLoader from "../components/PageLoader";

const generateId = () => Math.random().toString(36).substr(2, 9);

// eslint-disable-next-line react/prop-types
const EditableText = ({ text, isEditMode, onSave, className, placeholder }) => {
  const [val, setVal] = useState(text || "");
  useEffect(() => { setVal(text || ""); }, [text]);

  if (!isEditMode) return <div className={className}>{text}</div>;
  return (
    <input
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => { if (val.trim() !== text) onSave(val); }}
      className={`${className} bg-transparent border-b border-dashed border-forge-border hover:border-forge-textSecondary focus:border-forge-accent focus:outline-none transition-colors w-full`}
      placeholder={placeholder}
      onClick={(e) => e.stopPropagation()}
    />
  );
};

// eslint-disable-next-line react/prop-types
const EditableTextArea = ({ text, isEditMode, onSave, className, placeholder }) => {
  const [val, setVal] = useState(text || "");
  useEffect(() => { setVal(text || ""); }, [text]);

  if (!isEditMode) return <div className={className}>{text}</div>;
  return (
    <textarea
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => { if (val.trim() !== text) onSave(val); }}
      className={`${className} bg-transparent border-b border-dashed border-forge-border hover:border-forge-textSecondary focus:border-forge-accent focus:outline-none transition-colors w-full resize-none min-h-[60px]`}
      placeholder={placeholder}
      onClick={(e) => e.stopPropagation()}
    />
  );
};

export default function RoadmapDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreateMode = id === "new";

  const {
    roadmaps,
    modules,
    tasks,
    fetchRoadmaps,
    fetchModules,
    fetchTasks,
    toggleTask,
    addTask,
    updateTask,
    deleteTask,
    updateTaskOrder,
    addRoadmap,
    updateRoadmap,
    deleteRoadmap,
    addModule,
    updateModule,
    deleteModule,
    updateModuleOrder,
  } = useAppStore();

  const [selectedTask, setSelectedTask] = useState(null);
  const [completingIds, setCompletingIds] = useState([]);
  const [isEditMode, setIsEditMode] = useState(isCreateMode);
  const [expandedTasks, setExpandedTasks] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const toggleTaskExpand = (taskId, e) => {
    e.stopPropagation();
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Draft State natively used exclusively in Create Mode
  const [draftRoadmap, setDraftRoadmap] = useState({ title: "", category: "" });
  const [draftModules, setDraftModules] = useState([]);
  const [draftTasks, setDraftTasks] = useState([]);

  useEffect(() => {
    setIsEditMode(isCreateMode);
    if (!isCreateMode) {
      fetchRoadmaps();
      fetchModules();
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateMode]);

  // Data Selectors
  const activeRoadmap = isCreateMode
    ? draftRoadmap
    : roadmaps.find((r) => r._id === id);

  const activeModules = (isCreateMode
    ? draftModules
    : modules.filter((m) => String(m.roadmapId) === String(id))
  ).sort((a, b) => (a.order || 0) - (b.order || 0));

  const activeTasks = (isCreateMode
    ? draftTasks
    : tasks.filter((t) => String(t.roadmapId) === String(id))
  ).sort((a, b) => (a.order || 0) - (b.order || 0));

  // Handlers for Editable Texts
  const handleUpdateRoadmap = (field, val) => {
    if (isCreateMode) setDraftRoadmap((prev) => ({ ...prev, [field]: val }));
    else updateRoadmap(id, { [field]: val });
  };

  const handleUpdateModule = (modId, val) => {
    if (isCreateMode) {
      setDraftModules((prev) =>
        prev.map((m) => (m._id === modId ? { ...m, title: val } : m))
      );
    } else {
      updateModule(modId, { title: val });
    }
  };

  const handleUpdateTask = (taskId, field, val) => {
    if (isCreateMode) {
      setDraftTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, [field]: val } : t))
      );
    } else {
      updateTask(taskId, { [field]: val });
    }
  };

  // Add Handlers
  const handleAddModule = () => {
    if (isCreateMode) {
      setDraftModules((prev) => [
        ...prev,
        { _id: generateId(), title: "", order: prev.length },
      ]);
    } else {
      addModule({
        roadmapId: id,
        title: "New Module",
        order: activeModules.length,
      });
    }
  };

  const handleAddTask = (moduleId) => {
    const modTasks = activeTasks.filter((t) => t.moduleId === moduleId);
    if (isCreateMode) {
      setDraftTasks((prev) => [
        ...prev,
        {
          _id: generateId(),
          moduleId,
          title: "",
          description: "",
          durationMinutes: 30,
          order: modTasks.length,
        },
      ]);
    } else {
      addTask({
        roadmapId: id,
        moduleId,
        title: "New Task",
        description: "",
        durationMinutes: 30,
        order: modTasks.length,
      });
    }
  };

  // Delete Handlers
  const handleDeleteRoadmap = async () => {
    if (window.confirm("Delete this roadmap entirely?")) {
      await deleteRoadmap(id);
      navigate("/dashboard/roadmaps");
    }
  };

  const handleDeleteModule = (moduleId) => {
    if (window.confirm("Delete this module and its tasks?")) {
      if (isCreateMode) {
        setDraftModules((prev) => prev.filter((m) => m._id !== moduleId));
        setDraftTasks((prev) => prev.filter((t) => t.moduleId !== moduleId));
      } else {
        deleteModule(moduleId);
      }
    }
  };

  const handleDeleteTask = (e, taskId) => {
    e.stopPropagation();
    if (isCreateMode) {
      setDraftTasks((prev) => prev.filter((t) => t._id !== taskId));
    } else {
      deleteTask(taskId);
    }
  };

  // Drag and Drop
  const onDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    if (type === "module") {
      const newModules = Array.from(activeModules);
      const [moved] = newModules.splice(source.index, 1);
      newModules.splice(destination.index, 0, moved);

      const finalModules = newModules.map((m, i) => ({ ...m, order: i }));
      if (isCreateMode) setDraftModules(finalModules);
      else updateModuleOrder(finalModules);
      return;
    }

    if (type === "task") {
      const sourceList = activeTasks.filter(
        (t) => String(t.moduleId) === String(source.droppableId)
      );
      const destList =
        source.droppableId === destination.droppableId
          ? sourceList
          : activeTasks.filter(
              (t) => String(t.moduleId) === String(destination.droppableId)
            );

      const [movedTask] = sourceList.splice(source.index, 1);
      movedTask.moduleId = destination.droppableId;
      destList.splice(destination.index, 0, movedTask);

      const finalTasksToUpdate = [];
      if (source.droppableId === destination.droppableId) {
        destList.forEach((t, i) => {
          finalTasksToUpdate.push({ ...t, order: i, moduleId: destination.droppableId });
        });
      } else {
        sourceList.forEach((t, i) => {
          finalTasksToUpdate.push({ ...t, order: i, moduleId: source.droppableId });
        });
        destList.forEach((t, i) => {
          finalTasksToUpdate.push({ ...t, order: i, moduleId: destination.droppableId });
        });
      }

      if (isCreateMode) {
        setDraftTasks((prev) => {
          const others = prev.filter(
            (t) =>
              String(t.moduleId) !== String(source.droppableId) &&
              String(t.moduleId) !== String(destination.droppableId)
          );
          return [...others, ...finalTasksToUpdate];
        });
      } else {
        updateTaskOrder(finalTasksToUpdate);
      }
    }
  };

  const handleCreateSubmit = async () => {
    if (!draftRoadmap.title.trim()) return alert("Roadmap needs a title!");
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      const rm = await addRoadmap({
        title: draftRoadmap.title,
        category: draftRoadmap.category || "Custom",
      });

      for (const mod of draftModules) {
        if (!mod.title.trim()) continue; // Skip empty modules
        const newMod = await addModule({
          roadmapId: rm._id,
          title: mod.title,
          order: mod.order,
        });

        const tasksForMod = draftTasks.filter((t) => t.moduleId === mod._id);
        for (const task of tasksForMod) {
          if (!task.title.trim()) continue; // Skip empty tasks
          await addTask({
            roadmapId: rm._id,
            moduleId: newMod._id,
            title: task.title,
            durationMinutes: Number(task.durationMinutes) || 30,
            order: task.order,
          });
        }
      }

      navigate(`/dashboard/roadmaps/${rm._id}`);
    } catch (error) {
      console.error("Error creating roadmap:", error);
      alert("Failed to create roadmap. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleGracefulComplete = (taskId) => {
    if (isCreateMode) return;
    setCompletingIds((prev) => [...prev, taskId]);
    setTimeout(() => {
      toggleTask(taskId);
      setCompletingIds((prev) => prev.filter((i) => i !== taskId));
    }, 700);
  };

  if (!activeRoadmap && !isCreateMode)
    return <PageLoader />;

  const completedCount = activeTasks.filter((t) => t.isCompleted).length;
  const dynamicProgress =
    activeTasks.length > 0
      ? Math.round((completedCount / activeTasks.length) * 100)
      : 0;

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-500 pb-12">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/dashboard/roadmaps"
          className="inline-flex items-center gap-2 text-sm font-semibold text-forge-textSecondary hover:text-forge-accent transition-colors"
        >
          <ArrowLeft size={16} /> Back to Learning Paths
        </Link>
        <div className="flex gap-3">
          {isCreateMode ? (
            <>
              <button
                onClick={() => navigate("/dashboard/roadmaps")}
                className="px-5 py-2 rounded-xl font-bold text-forge-textSecondary hover:text-forge-textPrimary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubmit}
                disabled={isCreating}
                className={`px-6 py-2 rounded-xl font-bold transition-colors shadow-brand text-white ${
                  isCreating
                    ? "bg-forge-accent/70 cursor-not-allowed"
                    : "bg-forge-accent hover:bg-forge-accentHover"
                }`}
              >
                {isCreating ? "Creating..." : "Create Roadmap"}
              </button>
            </>
          ) : (
            <>
              {isEditMode && (
                <>
                  <button
                    onClick={handleDeleteRoadmap}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-forge-danger hover:text-forge-danger/80 hover:bg-forge-danger/10 transition-colors"
                  >
                    <Trash2 size={16} /> Delete Roadmap
                  </button>
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      // Reload data if needed, but since it's autosave it's fine just exiting edit mode.
                    }}
                    className="px-5 py-2 rounded-xl font-bold text-forge-textSecondary hover:text-forge-textPrimary transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold transition-colors ${
                  isEditMode
                    ? "bg-forge-bg text-forge-textPrimary border border-forge-border"
                    : "bg-forge-surface border border-forge-border text-forge-textSecondary hover:text-forge-accent"
                }`}
              >
                <Edit3 size={16} />
                {isEditMode ? "Done Editing" : "Edit Roadmap"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-forge-accent/10 rounded-xl text-forge-accent shrink-0">
              <Map size={24} />
            </div>
            <div className="flex-1">
              <EditableText
                text={activeRoadmap?.title}
                isEditMode={isEditMode}
                onSave={(val) => handleUpdateRoadmap("title", val)}
                className="text-3xl font-bold text-forge-textPrimary w-full"
                placeholder="Enter Roadmap Title..."
              />
            </div>
          </div>
          <div className="mt-3 inline-block">
            <EditableText
              text={activeRoadmap?.category}
              isEditMode={isEditMode}
              onSave={(val) => handleUpdateRoadmap("category", val)}
              className="text-xs font-bold text-forge-accent bg-forge-accent/10 px-3 py-1 rounded-full uppercase tracking-wider min-w-[120px]"
              placeholder="CATEGORY"
            />
          </div>
        </div>

        {!isCreateMode && !isEditMode && (
          <div className="text-right bg-forge-surface border border-forge-border p-4 rounded-2xl shadow-brand min-w-[150px] shrink-0">
            <p className="text-xs font-bold text-forge-textSecondary uppercase tracking-wider mb-1 flex items-center justify-end gap-1.5">
              <Target size={14} /> Progress
            </p>
            <p className="text-2xl font-bold text-forge-accent">
              {dynamicProgress}%
            </p>
          </div>
        )}
      </div>

      {!isCreateMode && !isEditMode && (
        <div className="w-full bg-forge-surface border border-forge-border rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="bg-forge-accent h-full rounded-full transition-all duration-1000"
            style={{ width: `${dynamicProgress}%` }}
          ></div>
        </div>
      )}

      {/* Modules List */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-modules" type="module" isDropDisabled={!isEditMode}>
          {(provided) => (
            <div
              className={`space-y-6 ${isEditMode ? "mt-4" : "mt-8"}`}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {activeModules.map((mod, index) => {
                const moduleTasks = activeTasks.filter(
                  (t) => String(t.moduleId) === String(mod._id)
                );
                const isModuleComplete =
                  moduleTasks.length > 0 &&
                  moduleTasks.every((t) => t.isCompleted);

                return (
                  <Draggable
                    key={mod._id}
                    draggableId={mod._id}
                    index={index}
                    isDragDisabled={!isEditMode}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`space-y-5 bg-forge-surface border p-6 rounded-xl transition-shadow ${
                          snapshot.isDragging
                            ? "border-forge-accent shadow-brand scale-[1.01] z-50"
                            : "border-forge-border shadow-brand"
                        }`}
                      >
                        {/* Module Header */}
                        <div className="flex items-center gap-3 pb-4 border-b border-forge-border group">
                          {isEditMode && (
                            <div
                              {...provided.dragHandleProps}
                              className="text-forge-textSecondary/40 hover:text-forge-textPrimary cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical size={20} />
                            </div>
                          )}
                          <div
                            className={`p-1.5 rounded-lg ${
                              isModuleComplete && !isCreateMode
                                ? "bg-forge-success/10 text-forge-success"
                                : "bg-forge-accent/10 text-forge-accent border border-forge-accent/20"
                            }`}
                          >
                            {isModuleComplete && !isCreateMode ? (
                              <CheckCircle2 size={18} />
                            ) : (
                              <Layers size={18} />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <EditableText
                              text={mod.title}
                              isEditMode={isEditMode}
                              onSave={(val) => handleUpdateModule(mod._id, val)}
                              className={`text-xl font-bold w-full ${
                                isModuleComplete && !isCreateMode
                                  ? "text-forge-textSecondary"
                                  : "text-forge-textPrimary"
                              }`}
                              placeholder="Module Title..."
                            />
                          </div>

                          {isEditMode && (
                            <button
                              onClick={() => handleDeleteModule(mod._id)}
                              className="p-1.5 text-forge-textSecondary hover:text-forge-danger rounded-lg opacity-50 hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}

                          {!isCreateMode && (
                            <span className="text-xs font-bold text-forge-textSecondary bg-forge-bg border border-forge-border px-3 py-1 rounded-full ml-3">
                              {moduleTasks.filter((t) => t.isCompleted).length} /{" "}
                              {moduleTasks.length} Done
                            </span>
                          )}
                        </div>

                        {/* Task Droppable */}
                        <Droppable droppableId={mod._id} type="task" isDropDisabled={!isEditMode}>
                          {(provided) => (
                            <div
                              className="space-y-4 min-h-[50px] mt-4"
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                            >
                              {moduleTasks.map((task, tIndex) => {
                                const isCompleting = completingIds.includes(
                                  task._id
                                );
                                const isActuallyDone =
                                  task.isCompleted || isCompleting;

                                return (
                                  <Draggable
                                    key={task._id}
                                    draggableId={task._id}
                                    index={tIndex}
                                    isDragDisabled={!isEditMode}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`relative flex items-center gap-4 p-4 rounded-xl transition-all border group bg-forge-bg ${
                                          isActuallyDone && !isCreateMode
                                            ? "border-forge-border opacity-60 hover:opacity-100"
                                            : "border-forge-border shadow-sm hover:border-forge-accent hover:shadow-brand"
                                        } ${
                                          snapshot.isDragging
                                            ? "shadow-brand border-forge-accent z-50 scale-[1.02] bg-white"
                                            : ""
                                        }`}
                                        onClick={() => !isEditMode && setSelectedTask(task)}
                                      >
                                        {isEditMode && (
                                          <div
                                            {...provided.dragHandleProps}
                                            className="mt-1 text-forge-textSecondary/40 hover:text-forge-textPrimary cursor-grab active:cursor-grabbing shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <GripVertical size={20} />
                                          </div>
                                        )}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isCompleting)
                                              isActuallyDone
                                                ? toggleTask(task._id)
                                                : handleGracefulComplete(
                                                    task._id
                                                  );
                                          }}
                                          disabled={isCreateMode}
                                          className={`mt-0.5 transition-colors shrink-0 ${
                                            isCreateMode
                                              ? "opacity-50"
                                              : isCompleting
                                              ? "text-forge-success"
                                              : isActuallyDone
                                              ? "text-forge-accent"
                                              : "text-forge-textSecondary group-hover:text-forge-accent"
                                          }`}
                                        >
                                          {isActuallyDone && !isCreateMode ? (
                                            <CheckCircle2 size={24} />
                                          ) : (
                                            <Circle size={24} />
                                          )}
                                        </button>
                                        <div className="flex-1 pr-4">
                                          <EditableText
                                            text={task.title}
                                            isEditMode={isEditMode}
                                            onSave={(val) =>
                                              handleUpdateTask(
                                                task._id,
                                                "title",
                                                val
                                              )
                                            }
                                            className={`font-semibold text-base leading-tight transition-colors duration-300 w-full ${
                                              isCompleting
                                                ? "text-forge-success"
                                                : isActuallyDone && !isCreateMode
                                                ? "text-forge-textSecondary line-through"
                                                : "text-forge-textPrimary"
                                            }`}
                                            placeholder="Task Title..."
                                          />
                                          <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-forge-textSecondary/70 uppercase tracking-wider">
                                            <Clock size={12} className="opacity-70" />
                                            {isEditMode ? (
                                              <input
                                                type="number"
                                                value={task.durationMinutes}
                                                onChange={(e) =>
                                                  handleUpdateTask(
                                                    task._id,
                                                    "durationMinutes",
                                                    e.target.value
                                                  )
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-12 bg-transparent border-b border-forge-border focus:outline-none focus:border-forge-accent"
                                              />
                                            ) : (
                                              <span>{task.durationMinutes}</span>
                                            )}
                                            {" MINS"}
                                          </div>
                                          {/* Description Edit Area */}
                                          {isEditMode ? (
                                            <div className="mt-2 text-sm text-forge-textSecondary">
                                              <EditableTextArea
                                                text={task.description}
                                                isEditMode={isEditMode}
                                                onSave={(val) =>
                                                  handleUpdateTask(
                                                    task._id,
                                                    "description",
                                                    val
                                                  )
                                                }
                                                className="w-full whitespace-pre-wrap leading-relaxed"
                                                placeholder="Add task details, links, or instructions..."
                                              />
                                            </div>
                                          ) : task.description && (
                                            <div className="mt-2 text-sm text-forge-textSecondary">
                                              {expandedTasks.includes(task._id) ? (
                                                <div className="mt-2 border-t border-forge-border pt-2 pb-1">
                                                  <div className="whitespace-pre-wrap leading-relaxed text-forge-textSecondary/90 font-medium">
                                                    {task.description}
                                                  </div>
                                                  <button
                                                    onClick={(e) => toggleTaskExpand(task._id, e)}
                                                    className="flex items-center gap-1.5 text-xs text-forge-accent font-bold mt-3 hover:text-forge-accentHover transition-colors bg-forge-accent/5 px-2 py-1 rounded"
                                                  >
                                                    <ChevronUp size={14} /> Hide Details
                                                  </button>
                                                </div>
                                              ) : (
                                                <div className="mt-1">
                                                  <button
                                                    onClick={(e) => toggleTaskExpand(task._id, e)}
                                                    className="flex items-center gap-1.5 text-xs text-forge-textSecondary/70 hover:text-forge-accent font-bold transition-colors"
                                                  >
                                                    <ChevronDown size={14} /> Show Details
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>

                                        {isEditMode && (
                                          <button
                                            onClick={(e) => handleDeleteTask(e, task._id)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-forge-textSecondary hover:text-forge-danger hover:bg-forge-danger/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all bg-forge-surface"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}
                              {provided.placeholder}

                              {isEditMode && (
                                <button
                                  onClick={() => handleAddTask(mod._id)}
                                  className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-forge-border text-forge-textSecondary hover:text-forge-accent hover:border-forge-accent hover:bg-forge-surface rounded-xl transition-all font-bold text-sm"
                                >
                                  <Plus size={16} /> Add Task
                                </button>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}

              {isEditMode && (
                <button
                  onClick={handleAddModule}
                  className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-forge-border text-forge-textSecondary hover:text-forge-accent hover:border-forge-accent hover:bg-forge-surface rounded-xl transition-all font-bold text-base"
                >
                  <Plus size={20} /> Add Target Module
                </button>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <TaskDetailModal
        task={selectedTask}
        roadmapName={activeRoadmap?.title}
        onClose={() => setSelectedTask(null)}
        onComplete={handleGracefulComplete}
        onUndo={(taskId) => toggleTask(taskId)}
      />
    </div>
  );
}
