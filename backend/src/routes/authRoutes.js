import express from "express";
import { registerUser, loginUser, addFocusTime } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.patch("/focus", protect, addFocusTime);

export default router;
