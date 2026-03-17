import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
    },
    title: { type: String, required: true },
    moduleId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true
    },
    order: { type: Number, default: 0 },
    durationMinutes: { type: Number, required: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    description: { type: String, default: "" },
    notes: { type: String, default: "" }, // Where you'll store your Markdown notes later
  },
  { timestamps: true },
);

export default mongoose.model("Task", taskSchema);
