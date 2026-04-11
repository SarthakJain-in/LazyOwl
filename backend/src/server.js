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
app.use(/^\/api\/.*$/, (req, res) => {
  res.status(404).json({ message: `API route ${req.originalUrl} not found` });
});

// Catch-all route for everything else (helping diagnose SPA 404s)
app.use(/^((?!\/api).)*$/, (req, res) => {
  res.status(200).send(`
    <div style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: #f8fafc; text-align: center; padding: 2rem;">
      <h1 style="font-size: 3rem; margin-bottom: 0.5rem; color: #38bdf8; font-weight: 800;">LazyOwl API</h1>
      <p style="font-size: 1.2rem; opacity: 0.8; max-width: 600px;">You are currently accessing the Backend API Server directly. This endpoint is reserved for API calls.</p>
      <div style="margin-top: 2rem; padding: 2rem; border: 1px dashed #334155; border-radius: 2rem; background: #1e293b66;">
        <p style="margin-bottom: 1rem; font-weight: 500;">Looking for the platform?</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background: #38bdf8; color: #0f172a; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 1rem; font-weight: bold; transition: all 0.2s;">
          Open LazyOwl App
        </a>
      </div>
      <p style="margin-top: 2rem; font-size: 0.8rem; opacity: 0.5;">Endpoint: ${req.originalUrl}</p>
    </div>
  `);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
