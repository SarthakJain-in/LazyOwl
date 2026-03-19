import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNoteFolders,
  createNoteFolder,
  updateNoteFolder,
  deleteNoteFolder,
} from "../controllers/noteFolderController.js";

const router = express.Router();

// All routes below require authentication
router.use(protect);

router.route("/").get(getNoteFolders).post(createNoteFolder);

router.route("/:id").put(updateNoteFolder).delete(deleteNoteFolder);

export default router;
