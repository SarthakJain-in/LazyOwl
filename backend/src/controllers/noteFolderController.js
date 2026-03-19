import NoteFolder from "../models/NoteFolder.js";
import Note from "../models/Note.js";

// @desc    Get all note folders
// @route   GET /api/note-folders
export const getNoteFolders = async (req, res) => {
  try {
    const noteFolders = await NoteFolder.find({ userId: req.user._id }).sort({
      folderName: 1,
    });
    res.status(200).json(noteFolders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching note folders", error: error.message });
  }
};

// @desc    Create a new note folder
// @route   POST /api/note-folders
export const createNoteFolder = async (req, res) => {
  try {
    const { folderName } = req.body;

    const existingFolder = await NoteFolder.findOne({
      userId: req.user._id,
      folderName,
    });
    if (existingFolder) {
      return res
        .status(400)
        .json({ message: "A note folder with this name already exists" });
    }

    const newNoteFolder = await NoteFolder.create({
      userId: req.user._id,
      folderName,
    });
    res.status(201).json(newNoteFolder);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating note folder", error: error.message });
  }
};

// @desc    Rename a note folder
// @route   PUT /api/note-folders/:id
export const updateNoteFolder = async (req, res) => {
  try {
    const { folderName: newFolderName } = req.body;
    const targetFolder = await NoteFolder.findById(req.params.id);

    if (!targetFolder)
      return res.status(404).json({ message: "Note folder not found" });

    targetFolder.folderName = newFolderName;
    const updatedNoteFolder = await targetFolder.save();

    // NOTICE: No cascading updates needed! The Notes are linked by ID, not by name.

    res.status(200).json(updatedNoteFolder);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating note folder", error: error.message });
  }
};

// @desc    Delete a note folder AND all notes inside it
// @route   DELETE /api/note-folders/:id
export const deleteNoteFolder = async (req, res) => {
  try {
    const targetFolder = await NoteFolder.findById(req.params.id);
    if (!targetFolder)
      return res.status(404).json({ message: "Note folder not found" });

    await targetFolder.deleteOne();

    // The Magic: Cascade the delete using the folderId
    await Note.deleteMany({ userId: req.user._id, folderId: targetFolder._id });

    res
      .status(200)
      .json({
        message: "Note folder and all its contents successfully deleted",
      });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting note folder", error: error.message });
  }
};
