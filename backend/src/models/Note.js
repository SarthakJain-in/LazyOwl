import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NoteFolder",
      default: null,
    },
    content: { type: String, default: "" }, // The actual markdown content
  },
  { timestamps: true },
);

export default mongoose.model("Note", noteSchema);
