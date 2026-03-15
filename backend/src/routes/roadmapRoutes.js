import express from "express";
import {
  getRoadmaps,
  createRoadmap,
  generateRoadmapWithAI,
  toggleRoadmapActive,
} from "../controllers/roadmapController.js";

const router = express.Router();

// AI Generation Route
router.route("/generate").post(generateRoadmapWithAI);

router.route("/").get(getRoadmaps).post(createRoadmap);

router.route("/:id/active").patch(toggleRoadmapActive);

export default router;
