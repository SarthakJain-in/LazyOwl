import Task from "../models/Task.js";
import Roadmap from "../models/Roadmap.js";

// Helper function to recalculate and sync Roadmap progress
const syncRoadmapProgress = async (roadmapId) => {
  const allRoadmapTasks = await Task.find({ roadmapId });
  let progressPercentage = 0;

  if (allRoadmapTasks.length > 0) {
    const completedTasks = allRoadmapTasks.filter((t) => t.isCompleted).length;
    progressPercentage = Math.round(
      (completedTasks / allRoadmapTasks.length) * 100,
    );
  }

  await Roadmap.findByIdAndUpdate(roadmapId, {
    progress: progressPercentage,
    status:
      progressPercentage === 100 && allRoadmapTasks.length > 0
        ? "Completed"
        : "Active",
  });
};

// @desc    Get all tasks
// @route   GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tasks", error: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const { roadmapId, title, moduleId, durationMinutes, description } = req.body;

    const newTask = await Task.create({
      roadmapId,
      title,
      moduleId,
      durationMinutes: durationMinutes || 30,
      description: description || "",
    });

    // Recalculate roadmap progress (adding a task lowers the completion percentage)
    await syncRoadmapProgress(roadmapId);

    res.status(201).json(newTask);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating task", error: error.message });
  }
};

// @desc    Toggle task completion status & Update Roadmap Progress
// @route   PATCH /api/tasks/:id/status
export const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 1. Toggle the task status
    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date() : null;
    const updatedTask = await task.save();

    // 2. Recalculate the new progress for the parent Roadmap
    await syncRoadmapProgress(task.roadmapId);

    res.status(200).json(updatedTask);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating task status", error: error.message });
  }
};

// @desc    Update a task's details (Title, Module, Duration)
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    const { title, moduleId, durationMinutes, description } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: { title, moduleId, durationMinutes, description } },
      { new: true, runValidators: true },
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating task details", error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const roadmapId = task.roadmapId;
    await task.deleteOne();

    // Recalculate roadmap progress (removing a task might bump up the completion percentage)
    await syncRoadmapProgress(roadmapId);

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting task", error: error.message });
  }
};

// @desc    Calculate current daily completion streak
// @route   GET /api/tasks/streak
export const getTaskStreak = async (req, res) => {
  try {
    const dummyUserId = "60d0fe4f5311236168a109ca";
    // 1. Get all unique dates where at least one task was completed
    const completedTasks = await Task.find({
      userId: dummyUserId,
      isCompleted: true,
    })
      .select("completedAt")
      .sort({ completedAt: -1 });

    if (completedTasks.length === 0) return res.status(200).json({ streak: 0 });

    // 2. Normalize dates to YYYY-MM-DD to handle multiple tasks in one day
    const uniqueDates = [
      ...new Set(
        completedTasks.map(
          (t) => new Date(t.completedAt).toISOString().split("T")[0],
        ),
      ),
    ];

    let streak = 0;
    let today = new Date();
    let currentDateToCheck = new Date();

    // 3. Check if user completed something today or yesterday to keep streak alive
    const todayStr = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return res.status(200).json({ streak: 0 });
    }

    // 4. Count backwards
    for (let i = 0; i < uniqueDates.length; i++) {
      const checkStr = currentDateToCheck.toISOString().split("T")[0];

      if (uniqueDates.includes(checkStr)) {
        streak++;
        currentDateToCheck.setDate(currentDateToCheck.getDate() - 1);
      } else {
        break; // Chain broken
      }
    }

    res.status(200).json({ streak });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error calculating streak", error: error.message });
  }
};

// @desc    Bulk update task orders and modules
// @route   PATCH /api/tasks/reorder
export const reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body; // Array of { _id, order, moduleId }

    // Create bulk operations for MongoDB
    const bulkOps = tasks.map((task) => ({
      updateOne: {
        filter: { _id: task._id },
        update: { order: task.order, moduleId: task.moduleId },
      },
    }));

    if (bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
    }

    res.status(200).json({ message: "Tasks reordered successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error reordering tasks", error: error.message });
  }
};
