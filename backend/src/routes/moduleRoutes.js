import express from "express";
import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
} from "../controllers/moduleController.js";

const router = express.Router();

router.patch("/reorder", reorderModules);
router.route("/").get(getModules).post(createModule);
router.route("/:id").put(updateModule).delete(deleteModule);

export default router;
