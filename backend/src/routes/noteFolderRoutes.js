import express from "express";
import {
  getNoteFolders,
  createNoteFolder,
  updateNoteFolder,
  deleteNoteFolder,
} from "../controllers/noteFolderController.js";

const router = express.Router();

router.route("/").get(getNoteFolders).post(createNoteFolder);

router.route("/:id").put(updateNoteFolder).delete(deleteNoteFolder);

export default router;
