import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    category: { type: String },
    status: {
      type: String,
      enum: ["Draft", "Active", "Completed"],
      default: "Active",
    },
    isActive: { type: Boolean, default: false },
    progress: { type: Number, default: 0 }, // Percentage 0-100
  },
  { timestamps: true },
);

export default mongoose.model("Roadmap", roadmapSchema);
