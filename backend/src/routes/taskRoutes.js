import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getTaskStreak,
  reorderTasks,
} from "../controllers/taskController.js";

const router = express.Router();

// All routes below require authentication
router.use(protect);

router.get("/streak", getTaskStreak);

router.patch("/reorder", reorderTasks);

router.route("/").get(getTasks).post(createTask);

router.route("/:id/status").patch(updateTaskStatus);

router.route("/:id").put(updateTask).delete(deleteTask);

export default router;
