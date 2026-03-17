import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
    },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Module", moduleSchema);
