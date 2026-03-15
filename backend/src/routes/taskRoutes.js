import express from "express";
import {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getTaskStreak,
} from "../controllers/taskController.js";

const router = express.Router();

router.get("/streak", getTaskStreak);

router.route("/").get(getTasks).post(createTask);

router.route("/:id/status").patch(updateTaskStatus);

router.route("/:id").put(updateTask).delete(deleteTask);

export default router;
