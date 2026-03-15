import mongoose from "mongoose";

const noteFolderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    folderName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("NoteFolder", noteFolderSchema);
