import express from "express";
import {
  getRoadmaps,
  createRoadmap,
  generateRoadmapWithAI,
  toggleRoadmapActive,
  deleteRoadmap,
  updateRoadmap,
} from "../controllers/roadmapController.js";

const router = express.Router();

// AI Generation Route
router.route("/generate").post(generateRoadmapWithAI);

router.route("/").get(getRoadmaps).post(createRoadmap);

router.route("/:id/active").patch(toggleRoadmapActive);

router.route("/:id").put(updateRoadmap).delete(deleteRoadmap);

export default router;
