import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
    },
    title: { type: String, required: true },
    moduleName: { type: String, required: true }, // e.g., "Express.js" or "React Hooks"
    durationMinutes: { type: Number, required: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    notes: { type: String, default: "" }, // Where you'll store your Markdown notes later
  },
  { timestamps: true },
);

export default mongoose.model("Task", taskSchema);
