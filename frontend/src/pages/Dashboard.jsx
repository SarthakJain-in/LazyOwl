import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import { Link } from "react-router-dom";
import TaskList from "../components/TaskList";
import AddTaskForm from "../components/AddTaskForm";
import { Flame, Clock, Target, Map, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { tasks, roadmaps, streak, fetchTasks, fetchRoadmaps, fetchStreak } =
    useAppStore();

  useEffect(() => {
    fetchTasks();
    fetchRoadmaps();
    fetchStreak();
  }, [fetchTasks, fetchRoadmaps, fetchStreak]);

  // 1. Find the active roadmaps
  const activeRoadmaps = roadmaps.filter((r) => r.isActive);
  const activeRoadmapIds = activeRoadmaps.map((r) => r._id);

  // 2. Filter tasks so we ONLY count ones inside your active journeys
  const activeTasks = tasks.filter((task) =>
    activeRoadmapIds.includes(task.roadmapId),
  );

  const totalTasks = activeTasks.length;
  const completedTasks = activeTasks.filter((task) => task.isCompleted).length;

  // 3. Calculate Lifetime Total Hours
  const lifetimeCompletedTasks = tasks.filter((task) => task.isCompleted);
  const totalMinutes = lifetimeCompletedTasks.reduce(
    (sum, task) => sum + (task.durationMinutes || 0),
    0,
  );
  const totalHours =
    totalMinutes > 0 ? Number((totalMinutes / 60).toFixed(1)) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-forge-textPrimary">
          System Dashboard
        </h2>
        <p className="text-forge-textSecondary mt-1">
          Welcome back. Let's build some momentum.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-forge-surface p-5 rounded-2xl border border-forge-border shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50">
            <Flame
              className={
                streak > 0
                  ? "text-orange-500 animate-pulse"
                  : "text-forge-textSecondary"
              }
              size={24}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-forge-textSecondary uppercase tracking-wider">
              Current Streak
            </p>
            <h3 className="text-2xl font-bold text-forge-textPrimary mt-0.5">
              {streak}
            </h3>
          </div>
        </div>

        <div className="bg-forge-surface p-5 rounded-2xl border border-forge-border shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50">
            <Clock className="text-blue-500" size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-forge-textSecondary uppercase tracking-wider">
              Total Hours
            </p>
            <h3 className="text-2xl font-bold text-forge-textPrimary mt-0.5">
              {totalHours}h
            </h3>
          </div>
        </div>

        <div className="bg-forge-surface p-5 rounded-2xl border border-forge-border shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50">
            <Target className="text-forge-accent" size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-forge-textSecondary uppercase tracking-wider">
              Tasks Progress
            </p>
            <h3 className="text-2xl font-bold text-forge-textPrimary mt-0.5">
              {completedTasks} / {totalTasks}
            </h3>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Tasks */}
        <div className="bg-forge-surface p-6 rounded-2xl border border-forge-border shadow-sm">
          <h3 className="text-lg font-bold text-forge-textPrimary mb-4">
            Up Next
          </h3>
          <AddTaskForm />
          <TaskList />
        </div>

        {/* Right Column: Active Journeys */}
        <div className="bg-forge-surface p-6 rounded-2xl border border-forge-border shadow-sm flex flex-col h-full max-h-[800px]">
          <h3 className="text-lg font-bold text-forge-textPrimary mb-4">
            Active Journeys
          </h3>

          {activeRoadmaps.length > 0 ? (
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
              {activeRoadmaps.map((activeRoadmap) => {
                // ---- THE MAGIC: DYNAMIC PROGRESS CALCULATION ----
                const roadmapTasks = tasks.filter(
                  (t) => t.roadmapId === activeRoadmap._id,
                );
                const roadmapCompleted = roadmapTasks.filter(
                  (t) => t.isCompleted,
                ).length;
                // Avoid dividing by zero if a roadmap has no tasks yet
                const dynamicProgress =
                  roadmapTasks.length > 0
                    ? Math.round((roadmapCompleted / roadmapTasks.length) * 100)
                    : 0;
                // ------------------------------------------------

                return (
                  <div
                    key={activeRoadmap._id}
                    className="flex flex-col justify-between p-5 bg-forge-bg border border-forge-border rounded-xl shadow-sm"
                  >
                    <div>
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2.5 bg-indigo-50 rounded-lg text-forge-accent shrink-0">
                          <Map size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-forge-textPrimary leading-tight">
                            {activeRoadmap.title}
                          </h4>
                          <span className="text-[10px] font-bold text-forge-accent bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider mt-1.5 inline-block">
                            {activeRoadmap.category || "General"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-semibold mb-2">
                          <span className="text-forge-textSecondary">
                            Overall Progress
                          </span>
                          <span className="text-forge-accent">
                            {dynamicProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-forge-surface border border-forge-border rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-forge-accent h-2.5 rounded-full transition-all duration-1000"
                            style={{ width: `${dynamicProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/roadmaps/${activeRoadmap._id}`}
                      className="mt-5 flex items-center justify-center gap-2 w-full py-2 bg-forge-surface border border-forge-border rounded-lg text-sm text-forge-textPrimary font-semibold hover:border-forge-accent hover:text-forge-accent transition-colors"
                    >
                      View Full Roadmap <ArrowRight size={16} />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center border-2 border-dashed border-forge-border rounded-xl p-6 bg-forge-bg/50">
              <div className="p-4 bg-forge-surface rounded-full mb-3 shadow-sm border border-forge-border">
                <Map className="text-forge-textSecondary" size={32} />
              </div>
              <h3 className="font-semibold text-forge-textPrimary">
                No Active Roadmaps
              </h3>
              <p className="text-sm text-forge-textSecondary mt-1 mb-4 max-w-xs">
                Go to the Roadmaps tab and click the Pin icon to set your focus.
              </p>
              <Link
                to="/roadmaps"
                className="text-sm font-semibold text-forge-accent bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Go to Roadmaps
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
