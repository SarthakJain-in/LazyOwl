import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import taskRoutes from "./routes/taskRoutes.js";
import roadmapRoutes from "./routes/roadmapRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import noteFolderRoutes from "./routes/noteFolderRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";

// Load environment variables (this will automatically look in the root folder for .env)
dotenv.config();

// Connect to Database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
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
  console.log(`Server running on port ${PORT}`);
});
