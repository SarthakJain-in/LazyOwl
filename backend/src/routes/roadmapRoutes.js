import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  getRoadmaps,
  createRoadmap,
  generateRoadmapWithAI,
  toggleRoadmapActive,
  deleteRoadmap,
  updateRoadmap,
  importRoadmapFromPDF,
  downloadSamplePDF,
} from "../controllers/roadmapController.js";

const router = express.Router();

// Configure multer for in-memory PDF uploads (max 10MB, PDF only)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."), false);
    }
  },
});

// All routes below require authentication
router.use(protect);

// AI Generation Route
router.route("/generate").post(generateRoadmapWithAI);

// PDF Import Route
router.route("/import-pdf").post(upload.single("pdfFile"), importRoadmapFromPDF);

// Sample PDF Download Route
router.route("/sample-pdf").get(downloadSamplePDF);

router.route("/").get(getRoadmaps).post(createRoadmap);

router.route("/:id/active").patch(toggleRoadmapActive);

router.route("/:id").put(updateRoadmap).delete(deleteRoadmap);

export default router;
