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
  origin: process.env.NODE_ENV === "production" && process.env.CLIENT_URL
    ? process.env.CLIENT_URL
    : "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Log critical env status on startup
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set in production! Auth will fail.");
}
if (process.env.NODE_ENV === "production" && !process.env.CLIENT_URL) {
  console.warn("WARNING: CLIENT_URL is not set. CORS will fallback to allow all origins.");
}

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

// Catch-all route for non-existent API endpoints
app.use("/api/(.*)", (req, res) => {
  res.status(404).json({ message: `API route ${req.originalUrl} not found` });
});

// Catch-all route for everything else (helping diagnose SPA 404s)
app.use("(.*)", (req, res) => {
  res.status(404).send(`
    <h1>LazyOwl API - 404</h1>
    <p>The route <strong>${req.originalUrl}</strong> was not found on this server.</p>
    <p>If you are trying to access the frontend, make sure it is deployed separately (e.g., to Vercel or Netlify) and that it is pointing to this backend URL.</p>
  `);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
