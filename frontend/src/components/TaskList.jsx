import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { CheckCircle2, Circle } from "lucide-react";
import TaskDetailModal from "./TaskDetailModal";

export default function TaskList() {
  const { tasks, roadmaps, toggleTask } = useAppStore();
  const [selectedTask, setSelectedTask] = useState(null);

  // State to hold IDs of tasks that are currently fading out
  const [completingIds, setCompletingIds] = useState([]);

  // Find active roadmaps
  const activeRoadmaps = roadmaps.filter((r) => r.isActive);

  if (activeRoadmaps.length === 0) {
    return (
      <div className="text-center p-6 border-2 border-dashed border-forge-border rounded-xl bg-forge-bg/50">
        <p className="text-forge-textSecondary text-sm font-medium">
          No active roadmaps.
        </p>
      </div>
    );
  }

  let displayTasks = [];
  activeRoadmaps.forEach((roadmap) => {
    const nextTasksForThisRoadmap = tasks
      .filter((t) => t.roadmapId === roadmap._id && !t.isCompleted)
      .slice(0, 2);
    displayTasks = [...displayTasks, ...nextTasksForThisRoadmap];
  });

  if (displayTasks.length === 0) {
    return (
      <div className="text-center p-6 border border-forge-border rounded-xl bg-green-50/50">
        <CheckCircle2 className="mx-auto text-green-500 mb-2" size={24} />
        <p className="text-forge-textPrimary font-bold text-sm">
          All caught up!
        </p>
      </div>
    );
  }

  // --- THE GRACEFUL DELAY LOGIC ---
  const handleGracefulComplete = (taskId) => {
    // 1. Instantly trigger the visual CSS changes
    setCompletingIds((prev) => [...prev, taskId]);

    // 2. Wait 700ms for the fade animation to finish, THEN update the database
    setTimeout(() => {
      toggleTask(taskId);
      setCompletingIds((prev) => prev.filter((id) => id !== taskId));
    }, 700);
  };

  return (
    <>
      <div className="space-y-3 relative overflow-hidden">
        {displayTasks.map((task) => {
          const parentRoadmap = roadmaps.find((r) => r._id === task.roadmapId);
          const isCompleting = completingIds.includes(task._id);

          return (
            <div
              key={task._id}
              onClick={() => !isCompleting && setSelectedTask(task)} // Prevent clicking if fading out
              className={`flex items-start gap-3 p-4 bg-forge-bg border rounded-xl cursor-pointer transition-all duration-700 group ${
                isCompleting
                  ? "border-green-400 bg-green-50/50 opacity-0 translate-x-8 pointer-events-none" // Fading out animation
                  : "border-forge-border hover:border-forge-accent opacity-100 translate-x-0"
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isCompleting) handleGracefulComplete(task._id);
                }}
                className={`mt-0.5 transition-colors shrink-0 ${isCompleting ? "text-green-500" : "text-forge-textSecondary group-hover:text-forge-accent"}`}
              >
                {isCompleting || task.isCompleted ? (
                  <CheckCircle2
                    size={22}
                    className={
                      isCompleting ? "text-green-500" : "text-forge-accent"
                    }
                  />
                ) : (
                  <Circle size={22} />
                )}
              </button>
              <div className="flex-1">
                <h4
                  className={`font-semibold text-sm leading-tight transition-colors duration-300 ${isCompleting ? "text-green-700" : "text-forge-textPrimary"}`}
                >
                  {task.title}
                </h4>
                <p
                  className={`text-xs font-medium mt-1.5 uppercase tracking-wider transition-colors duration-300 ${isCompleting ? "text-green-600/70" : "text-forge-textSecondary"}`}
                >
                  {parentRoadmap?.title} • {task.durationMinutes} MINS
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <TaskDetailModal
        task={selectedTask}
        roadmapName={
          roadmaps.find((r) => r._id === selectedTask?.roadmapId)?.title
        }
        onClose={() => setSelectedTask(null)}
        onComplete={handleGracefulComplete}
        onUndo={(taskId) => toggleTask(taskId)}
      />
    </>
  );
}
