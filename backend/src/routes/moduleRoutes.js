import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
} from "../controllers/moduleController.js";

const router = express.Router();

// All routes below require authentication
router.use(protect);

router.patch("/reorder", reorderModules);
router.route("/").get(getModules).post(createModule);
router.route("/:id").put(updateModule).delete(deleteModule);

export default router;
