import { X, Clock, Map, Check, CheckCircle2, RotateCcw } from "lucide-react";

export default function TaskDetailModal({
  task,
  roadmapName,
  onClose,
  onComplete,
  onUndo,
}) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-forge-textPrimary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-forge-surface w-full max-w-md rounded-2xl shadow-2xl border border-forge-border p-6 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-forge-textSecondary hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-8 pr-8">
          <h3 className="text-2xl font-bold text-forge-textPrimary leading-tight mb-3">
            {task.title}
          </h3>
          
          {task.description && (
            <div className="mb-5 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-sm text-forge-textSecondary/90 whitespace-pre-wrap leading-relaxed bg-forge-bg/50 p-4 rounded-xl border border-forge-border/50">
                {task.description}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm text-forge-textSecondary font-medium p-3 bg-forge-bg rounded-lg border border-forge-border">
              <Clock size={18} className="text-blue-500 shrink-0" />
              <span>
                Estimated Time:{" "}
                <strong className="text-forge-textPrimary ml-1">
                  {task.durationMinutes} mins
                </strong>
              </span>
            </div>

            {roadmapName && (
              <div className="flex items-center gap-3 text-sm text-forge-textSecondary font-medium p-3 bg-forge-bg rounded-lg border border-forge-border">
                <Map size={18} className="text-forge-accent shrink-0" />
                <span className="truncate">
                  Journey:{" "}
                  <strong className="text-forge-textPrimary ml-1">
                    {roadmapName}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          {task.isCompleted ? (
            <button
              onClick={() => {
                onUndo(task._id);
                onClose();
              }}
              className="w-full py-3.5 bg-forge-surface border border-forge-border text-forge-textSecondary hover:text-forge-textPrimary hover:bg-forge-bg rounded-xl font-bold transition-colors flex items-center justify-center gap-2 group"
            >
              <CheckCircle2
                size={20}
                className="text-green-500 group-hover:hidden"
              />
              <RotateCcw size={20} className="hidden group-hover:block" />
              <span className="group-hover:hidden">Completed</span>
              <span className="hidden group-hover:block">Undo Completion</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onComplete(task._id);
                onClose();
              }}
              className="w-full py-3.5 bg-forge-accent text-white rounded-xl font-bold hover:bg-forge-accentHover transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Check size={20} />
              Mark as Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
