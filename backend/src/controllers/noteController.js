import Note from "../models/Note.js";

const dummyUserId = "60d0fe4f5311236168a109ca"; // Keeping it single-player

// @desc    Get all notes
// @route   GET /api/notes
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: dummyUserId }).sort({
      updatedAt: -1,
    });
    res.status(200).json(notes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching notes", error: error.message });
  }
};

// @desc    Create a new note
// @route   POST /api/notes
export const createNote = async (req, res) => {
  try {
    const { title, folderId, content } = req.body;
    const newNote = await Note.create({
      userId: dummyUserId,
      title: title || "Untitled Note",
      folderId: folderId || null, // null means it's a loose file
      content: content || "",
    });
    res.status(201).json(newNote);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating note", error: error.message });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
export const updateNote = async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedNote)
      return res.status(404).json({ message: "Note not found" });
    res.status(200).json(updatedNote);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating note", error: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(200).json({ message: "Note deleted" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting note", error: error.message });
  }
};
