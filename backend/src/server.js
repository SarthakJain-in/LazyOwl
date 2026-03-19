import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import roadmapRoutes from "./routes/roadmapRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import noteFolderRoutes from "./routes/noteFolderRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";

// Load environment variables
// In production: .env.production (or .env)
// In development: .env.development (or .env)
const envFile = process.env.NODE_ENV === "production"
  ? ".env.production"
  : ".env.development";
dotenv.config({ path: envFile });
// Fallback: also load .env if the specific env file doesn't set everything
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// CORS Configuration — locked to specific origin in production
const corsOptions = {
  origin: process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL
    : "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.use(express.json());

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/note-folders", noteFolderRoutes);
app.use("/api/modules", moduleRoutes);

app.get("/", (req, res) => {
  res.send("LazyOwl API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
